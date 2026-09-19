import { execFile } from "node:child_process";

/**
 * 调系统原生的目录 / 文件选择框。
 *
 * 浏览器拿不到真实路径（`<input type="file">` 只给文件名、`webkitdirectory` 只给相对路径），
 * 但这套工具是本地跑的，所以由服务端开一个 Windows 原生对话框，把选中的绝对路径回给前端。
 *
 * 压在浏览器之上是必须的：浏览器刚被点过、握着前台焦点，而后台进程不允许抢前台（Windows 前台锁）。
 * 踩过的三个坑，都留着当注释：
 * ① 给 owner 设 TopMost 不管用——被拥有的窗口不继承置顶（EnumWindows 查过，标志是 false）；
 * ② SetWindowPos(HWND_TOPMOST) 单独用也不稳——对话框晚于第一个 tick 创建就白钉；
 * ③ 真正的关键是**把浏览器主窗口当作 owner**：被拥有的窗口永远在 owner 之上。
 *    注意 Add-Type 必须带 -ReferencedAssemblies System.Windows.Forms，
 *    否则 C# 编译不过、整段静默失效（owner 会退回 powershell 自己的窗口）。
 */

/** PowerShell 单引号字符串里，单引号要写成两个 */
const psQuote = (value: unknown): string => `'${String(value ?? "").replace(/'/g, "''")}'`;

const HEAD = "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8\nAdd-Type -AssemblyName System.Windows.Forms | Out-Null\n";

/**
 * 让对话框压在浏览器上面，两条腿走路：
 * ① 把**浏览器主窗口**当作对话框的 owner——被拥有的窗口永远在 owner 之上（跟 topmost 是两套机制）；
 * ② 再用 SetWindowPos 把它钉到最顶层兜底。
 * 只做 ② 时实测标志位是 True、视觉上却仍被浏览器盖住，所以 ① 才是关键。
 */
const PINNER = `
Add-Type -TypeDefinition @"
using System; using System.Text; using System.Runtime.InteropServices; using System.Windows.Forms;
public class PickWin : IWin32Window {
  private IntPtr _h;
  public PickWin(IntPtr h) { _h = h; }
  public IntPtr Handle { get { return _h; } }
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr l);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
  /** 找浏览器的主窗口：优先当前前台窗口（就是刚点「浏览」的那个窗口） */
  public static IntPtr BrowserWindow() {
    IntPtr fg = GetForegroundWindow();
    foreach (var name in new string[] { "chrome", "msedge", "firefox" }) {
      foreach (var p in System.Diagnostics.Process.GetProcessesByName(name)) {
        if (p.MainWindowHandle != IntPtr.Zero) {
          if (p.MainWindowHandle == fg) return fg;   // 前台就是浏览器，最理想
          if (found == IntPtr.Zero) found = p.MainWindowHandle;
        }
      }
    }
    return found;
  }
  static IntPtr found = IntPtr.Zero;
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  /** 钉住本进程的对话框；返回个数，0 表示还没创建出来（调用方据此重试） */
  public static int Pin(uint want) {
    int n = 0;
    EnumWindows((h, l) => {
      uint pid; GetWindowThreadProcessId(h, out pid);
      if (pid != want || !IsWindowVisible(h)) return true;
      var cls = new StringBuilder(64); GetClassName(h, cls, 64);
      if (cls.ToString() != "#32770") return true;
      SetWindowPos(h, new IntPtr(-1), 0, 0, 0, 0, 0x0003);
      n++;
      return true;
    }, IntPtr.Zero);
    return n;
  }
}
"@ -ReferencedAssemblies System.Windows.Forms
`;

/**
 * 对话框是模态的，ShowDialog 会一直阻塞，所以只能靠定时器在它的消息循环里置顶
 * （模态循环会泵消息，WinForms 的 Timer 能正常触发）。
 *
 * 关键：**不能只钉一次就停**。对话框窗口不保证在第一个 tick 前就创建好，
 * 早钉等于没钉（这正是"明明标志是 True 却还是被盖住"的来源）。
 * 所以快速重试到钉住为止，之后降到 1 秒保活，防止被别的窗口挤下去。
 */
const topmostHelper = (showCall: string): string => `
$me = [uint32]$PID
# 把浏览器主窗口当 owner：对话框就会被约束在它之上
$owner = New-Object PickWin([PickWin]::BrowserWindow())
$pin = New-Object System.Windows.Forms.Timer
$pin.Interval = 120
$pin.Add_Tick({
  if ([PickWin]::Pin($me) -gt 0) { $pin.Interval = 1000 }
})
$pin.Start()
${showCall}
$pin.Stop()
`;

function folderScript(start: string): string {
  return HEAD
    + `$dlg = New-Object System.Windows.Forms.FolderBrowserDialog\n`
    + `$dlg.Description = '选择目录'\n`
    + `$dlg.ShowNewFolderButton = $true\n`
    + (start ? `$dlg.SelectedPath = ${psQuote(start)}\n` : "")
    + PINNER
    + topmostHelper(`if ($dlg.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::Out.Write($dlg.SelectedPath) }\n`);
}

function fileScript(start: string, filter: string): string {
  return HEAD
    + `$dlg = New-Object System.Windows.Forms.OpenFileDialog\n`
    + `$dlg.Title = '选择文件'\n`
    + `$dlg.Filter = ${psQuote(filter || "所有文件|*.*")}\n`
    + (start ? `$dlg.InitialDirectory = ${psQuote(start)}\n` : "")
    + PINNER
    + topmostHelper(`if ($dlg.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::Out.Write($dlg.FileName) }\n`);
}

/**
 * 打开选择框，返回选中的绝对路径；用户取消则返回空串。
 * 对话框是模态的，卡住不点就一直等——给 5 分钟上限，免得永远挂着。
 */
export function pickPath({ kind = "folder", start = "", filter = "" }: {
  kind?: string; start?: string; filter?: string;
} = {}) {
  const script = kind === "file" ? fileScript(start, filter) : folderScript(start);
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-STA", "-Command", script],
      { timeout: 5 * 60_000, windowsHide: true, encoding: "utf8" },
      (error, stdout) => {
        const picked = String(stdout ?? "").trim();
        // 用户取消时 stdout 为空且退出码 0；真有错误才报
        if (!picked && error && error.killed !== true && !/^\s*$/.test(String(error.stdout ?? ""))) {
          reject(new Error(`打不开选择框：${String(error.message).trim().split("\n").at(-1)?.slice(0, 160) ?? ""}`));
          return;
        }
        resolve(picked);
      },
    );
  });
}
