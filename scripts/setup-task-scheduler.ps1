# setup-task-scheduler.ps1
# 在 Windows 上注册定时任务，每天凌晨 05:01 自动拉取最新校招岗位
#
# 使用：
#   1. 右键「以管理员身份运行」PowerShell
#   2. cd F:\MyBlogSite\vuepress-theme-hope\my-docs
#   3. .\scripts\setup-task-scheduler.ps1
#
# 查看任务：
#   Get-ScheduledTask -TaskName "OfferJobsFetch"
#
# 删除任务：
#   Unregister-ScheduledTask -TaskName "OfferJobsFetch" -Confirm:$false
#
# 立即执行（测试）：
#   Start-ScheduledTask -TaskName "OfferJobsFetch"

# ---- 管理员权限检查 ----
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ 此脚本需要 Administrator 权限，请右键 → 以管理员身份运行 PowerShell 后重试。" -ForegroundColor Red
    exit 1
}

$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot | Split-Path -Parent
$taskName = "OfferJobsFetch"
$taskDescription = "每天凌晨 05:01 自动拉取最新校招岗位"

$action = New-ScheduledTaskAction `
    -Execute "node.exe" `
    -Argument "src\private\hires\offer\fetch.mjs" `
    -WorkingDirectory $projectRoot

$trigger = New-ScheduledTaskTrigger -Daily -At "05:01"

$principal = New-ScheduledTaskPrincipal `
    -UserId "$env:USERNAME" `
    -LogonType Interactive `
    -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# 如果已存在，先删除
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Write-Host "任务 $taskName 已存在，先删除..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

try {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Settings $settings `
        -Description $taskDescription `
        -ErrorAction Stop
} catch {
    Write-Host "❌ 注册计划任务失败：$_" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ 任务已注册：$taskName" -ForegroundColor Green
Write-Host "   触发时间：每天 05:01" -ForegroundColor Cyan
Write-Host "   工作目录：$projectRoot" -ForegroundColor Cyan
Write-Host ""
Write-Host "查看任务: Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host "立即测试: Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor Gray
Write-Host "删除任务: Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor Gray
