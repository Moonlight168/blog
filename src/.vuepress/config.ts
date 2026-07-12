import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import theme from "./theme.js";
import { getDirname, path } from 'vuepress/utils'
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";
import { jobs, fetchLog } from '../../data/jobs-store.mjs';

const __dirname = import.meta.dirname || getDirname(import.meta.url)
const componentsDir = path.resolve(__dirname, 'components');

// 通用 JSON 响应辅助
function json(res, code, body) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

// 读 POST body 为 JSON
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk.toString('utf-8') })
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}) }
      catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

// ============================================================
//  Offer API Vite Plugin (enforce: 'pre')
//
//  关键发现:server.middlewares.use('/api', handler) 会先剥离
//  /api 前缀,然后把 pathname='/jobs/stats' 传给 handler
//  (不是 '/api/jobs/stats')
//
//  所以内部判断用剥离后的 pathname
// ============================================================
async function handleApi(req, res) {
  const u = new URL(req.url, 'http://localhost')
  const pathname = u.pathname
  const method = req.method

  // ---------- /jobs/stats ----------
  if (pathname === '/jobs/stats' && method === 'GET') {
    try {
      return json(res, 200, { success: true, stats: jobs.stats() })
    } catch (e) {
      return json(res, 500, { success: false, error: e.message })
    }
  }

  // ---------- /jobs/delete ----------
  if (pathname === '/jobs/delete' && method === 'POST') {
    try {
      const { id } = await readBody(req)
      if (!id) return json(res, 400, { success: false, error: 'id 必填' })
      return json(res, 200, { success: jobs.delete(id) })
    } catch (e) {
      return json(res, 500, { success: false, error: e.message })
    }
  }

  // ---------- /jobs/patch ----------
  if (pathname === '/jobs/patch' && method === 'POST') {
    try {
      const { id, ...patch } = await readBody(req)
      if (!id) return json(res, 400, { success: false, error: 'id 必填' })
      const existing = jobs.findById(id)
      if (!existing) return json(res, 404, { success: false, error: 'not found' })
      const result = jobs.upsert({ ...existing, ...patch })
      return json(res, 200, { success: true, ...result })
    } catch (e) {
      return json(res, 500, { success: false, error: e.message })
    }
  }

  // ---------- /jobs ----------
  if (pathname === '/jobs' && method === 'GET') {
    try {
      const opts = {
        category:      u.searchParams.get('category')?.split(',').filter(Boolean),
        city:          u.searchParams.get('city')?.split(',').filter(Boolean),
        applied:       u.searchParams.get('applied') !== null ? u.searchParams.get('applied') === '1' : undefined,
        isPlaceholder: u.searchParams.get('placeholder') !== null ? u.searchParams.get('placeholder') === '1' : undefined,
        keyword:       u.searchParams.get('q') || undefined,
        weekend:       u.searchParams.get('weekend') || undefined,
        limit:         u.searchParams.get('limit') ? Number(u.searchParams.get('limit')) : undefined,
        offset:        u.searchParams.get('offset') ? Number(u.searchParams.get('offset')) : undefined,
      }
      const data = jobs.findAll(opts)
      const stats = jobs.stats()
      return json(res, 200, { success: true, data, stats })
    } catch (e) {
      return json(res, 500, { success: false, error: e.message })
    }
  }

  if (pathname === '/jobs' && method === 'POST') {
    try {
      const body = await readBody(req)
      if (!Array.isArray(body.jobs)) return json(res, 400, { success: false, error: 'jobs 必须是数组' })
      const result = jobs.bulkInsert(body.jobs, { source: body.source || 'manual', skipExisting: false })
      return json(res, 200, { success: true, ...result })
    } catch (e) {
      return json(res, 500, { success: false, error: e.message })
    }
  }

  // ---------- /refresh-jobs ----------
  if (pathname === '/refresh-jobs' && method === 'POST') {
    const { execFile } = await import('node:child_process')
    const { promisify } = await import('node:util')
    const execFileP = promisify(execFile)
    try {
      // Windows 上 npm 是 .cmd 文件，需要 shell 启动；否则 spawn EINVAL
      const isWin = process.platform === 'win32'
      const { stdout, stderr } = await execFileP(
        isWin ? 'npm.cmd' : 'npm',
        ['run', 'fetch:jobs'],
        { cwd: process.cwd(), maxBuffer: 50 * 1024 * 1024, timeout: 10 * 60 * 1000, shell: isWin }
      )
      // 取最近一条 fetch_log 行作为结构化结果
      const lastLog = fetchLog.recent(1)[0] || null
      return json(res, 200, {
        success: true,
        output: stdout,
        stderr: (stderr || '').slice(0, 2000),
        log: lastLog,
      })
    } catch (e) {
      const lastLog = fetchLog.recent(1)[0] || null
      return json(res, 200, {
        success: false,
        output: e.stdout || '',
        stderr: (e.stderr || '').slice(0, 2000),
        error: e.message,
        log: lastLog,
      })
    }
  }

  // ---------- /fetch-log ----------
  if (pathname === '/fetch-log' && method === 'GET') {
    try {
      return json(res, 200, { success: true, data: fetchLog.recent(20) })
    } catch (e) {
      return json(res, 500, { success: false, error: e.message })
    }
  }

  // ---------- 兼容旧接口 ----------
  if (pathname === '/read-applications' && method === 'GET') {
    try {
      const data = jobs.findAll({ isPlaceholder: 0 })
      return json(res, 200, { success: true, data })
    } catch (e) {
      return json(res, 500, { success: false, error: e.message })
    }
  }

  if (pathname === '/save-applications' && method === 'POST') {
    try {
      const body = await readBody(req)
      if (!Array.isArray(body.jobs)) return json(res, 400, { success: false, error: 'jobs 必须是数组' })
      const result = jobs.bulkInsert(body.jobs, { source: 'manual', skipExisting: false })
      json(res, 200, { success: true, count: result.added, ...result })
    } catch (e) {
      json(res, 500, { success: false, error: e.message })
    }
  }

  // 未匹配 → 405
  return json(res, 405, { success: false, error: 'API not found: ' + pathname })
}

const offerApiPlugin = {
  name: 'offer-api',
  enforce: 'pre',
  configureServer(server) {
    console.log('[offer-api] ★ configureServer called, registering /api middleware')
    // 单个 /api 前缀的 middleware,内部按 pathname 分发
    server.middlewares.use('/api', async (req, res, next) => {
      console.log('[offer-api] →', req.method, req.url)
      await handleApi(req, res)
      // handleApi 总是自己处理完 response,不需要 next
    })
  },
}

export default defineUserConfig({
    base: "/",
    lang: "zh-CN",
    theme: theme,
    port: 8888,

    bundler: viteBundler({
      viteOptions: {
        plugins: [offerApiPlugin],
      },
    }),

    plugins: [
        registerComponentsPlugin({
            componentsDir: componentsDir
        }),
    ],
    head: [
        [
            'script', {}, `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js/4854a35f85e77afdd57bc6802b616bde";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
    `]
    ],
})