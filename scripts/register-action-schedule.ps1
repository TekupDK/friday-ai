#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Registers a Windows Scheduled Task for autonomous action handling

.DESCRIPTION
    Creates a scheduled task that runs the action-handler.ts script every 4 hours.
    The task processes actionable insights (missing bookings, at-risk, upsell) and creates follow-up tasks.
    
.PARAMETER TaskName
    Name of the scheduled task (default: "Friday-AI-Action-Handler")
    
.PARAMETER IntervalHours
    Hours between runs (default: 4)
    
.PARAMETER WorkingDirectory
    Path to the tekup-ai-v2 project directory
    
.PARAMETER Unregister
    Remove the scheduled task instead of creating it

.EXAMPLE
    .\register-action-schedule.ps1
    Creates task with default settings (runs every 4 hours)
    
.EXAMPLE
    .\register-action-schedule.ps1 -IntervalHours 6
    Creates task to run every 6 hours
    
.EXAMPLE
    .\register-action-schedule.ps1 -Unregister
    Removes the scheduled task
#>

param(
    [string]$TaskName = "Friday-AI-Action-Handler",
    [int]$IntervalHours = 4,
    [string]$WorkingDirectory = (Get-Location).Path,
    [switch]$Unregister
)

$ErrorActionPreference = "Stop"

# Check if running as administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

if ($Unregister) {
    Write-Host "🗑️  Unregistering scheduled task: $TaskName" -ForegroundColor Yellow
    
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "✅ Task unregistered successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Task not found: $TaskName" -ForegroundColor Yellow
    }
    exit 0
}

# Validate working directory
if (-not (Test-Path (Join-Path $WorkingDirectory "package.json"))) {
    Write-Error "Invalid working directory: $WorkingDirectory (package.json not found)"
    exit 1
}

Write-Host "⏰ Registering scheduled task: $TaskName" -ForegroundColor Cyan
Write-Host "   Working Directory: $WorkingDirectory" -ForegroundColor Gray
Write-Host "   Schedule: Every $IntervalHours hours" -ForegroundColor Gray

# Build PowerShell command
$scriptPath = Join-Path $WorkingDirectory "server\scripts\action-handler.ts"
$logPath = Join-Path $WorkingDirectory "logs\action-handler-$(Get-Date -Format 'yyyyMMdd').log"
$logsDir = Join-Path $WorkingDirectory "logs"

# Ensure logs directory exists
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# PowerShell command to run
$command = @"
Set-Location '$WorkingDirectory'
`$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Add-Content -Path '$logPath' -Value "`n=== Action handler started at `$timestamp ==="
try {
    npx tsx '$scriptPath' 2>&1 | Tee-Object -Append -FilePath '$logPath'
    `$exitCode = `$LASTEXITCODE
    Add-Content -Path '$logPath' -Value "Exit code: `$exitCode"
    if (`$exitCode -eq 0) {
        Add-Content -Path '$logPath' -Value "✅ Action handler completed successfully"
    } else {
        Add-Content -Path '$logPath' -Value "❌ Action handler failed with exit code `$exitCode"
    }
} catch {
    Add-Content -Path '$logPath' -Value "❌ Error: `$_"
}
Add-Content -Path '$logPath' -Value "=== Action handler finished at `$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===`n"
"@

# Create action
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command `"$command`"" `
    -WorkingDirectory $WorkingDirectory

# Create trigger (repeating every N hours)
$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date).Date.AddHours(8) `
    -RepetitionInterval (New-TimeSpan -Hours $IntervalHours) `
    -RepetitionDuration ([TimeSpan]::MaxValue)

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

# Create principal (run with highest privileges)
$principalObj = New-ScheduledTaskPrincipal `
    -UserId $currentUser.Name `
    -LogonType Interactive `
    -RunLevel Highest

# Register task
Write-Host "`n⏳ Creating scheduled task..." -ForegroundColor Yellow

$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "   Existing task found - will be replaced" -ForegroundColor Gray
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$task = Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principalObj `
    -Description "Autonomous processing of Friday AI actionable insights (missing bookings, at-risk customers, upsell opportunities)"

Write-Host "`n✅ Scheduled task registered successfully!" -ForegroundColor Green
Write-Host "`n📋 Task Details:" -ForegroundColor Cyan
Write-Host "   Name:      $TaskName" -ForegroundColor Gray
Write-Host "   Schedule:  Every $IntervalHours hours" -ForegroundColor Gray
Write-Host "   Logs:      $logsDir" -ForegroundColor Gray
Write-Host "   Status:    $($task.State)" -ForegroundColor Gray

Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "   • View task: Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "   • Run now:  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "   • Test (dry run): npx tsx server/scripts/action-handler.ts --dry-run" -ForegroundColor Gray
Write-Host "   • Remove:   .\register-action-schedule.ps1 -Unregister" -ForegroundColor Gray
Write-Host "   • Logs:     Get-Content '$logPath'" -ForegroundColor Gray
Write-Host ""
