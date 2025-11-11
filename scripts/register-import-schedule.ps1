#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Registers a Windows Scheduled Task for autonomous v4.3.5 import pipeline

.DESCRIPTION
    Creates a scheduled task that runs the import-pipeline-v4_3_5.ts script daily at 02:30.
    The task runs with highest privileges and uses the current user's credentials.
    
.PARAMETER TaskName
    Name of the scheduled task (default: "Friday-AI-Pipeline-Import")
    
.PARAMETER StartTime
    Time to run the task daily in 24h format HH:mm (default: "02:30")
    
.PARAMETER WorkingDirectory
    Path to the tekup-ai-v2 project directory
    
.PARAMETER Unregister
    Remove the scheduled task instead of creating it

.EXAMPLE
    .\register-import-schedule.ps1
    Creates task with default settings (runs at 02:30)
    
.EXAMPLE
    .\register-import-schedule.ps1 -StartTime "03:00"
    Creates task to run at 03:00
    
.EXAMPLE
    .\register-import-schedule.ps1 -Unregister
    Removes the scheduled task
#>

param(
    [string]$TaskName = "Friday-AI-Pipeline-Import",
    [string]$StartTime = "02:30",
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

Write-Host "📅 Registering scheduled task: $TaskName" -ForegroundColor Cyan
Write-Host "   Working Directory: $WorkingDirectory" -ForegroundColor Gray
Write-Host "   Schedule: Daily at $StartTime" -ForegroundColor Gray

# Build PowerShell command
$scriptPath = Join-Path $WorkingDirectory "server\scripts\import-pipeline-v4_3_5.ts"
$logPath = Join-Path $WorkingDirectory "logs\import-pipeline-$(Get-Date -Format 'yyyyMMdd').log"
$logsDir = Join-Path $WorkingDirectory "logs"

# Ensure logs directory exists
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# PowerShell command to run
$command = @"
Set-Location '$WorkingDirectory'
`$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Add-Content -Path '$logPath' -Value "`n=== Import started at `$timestamp ==="
try {
    npx tsx '$scriptPath' 2>&1 | Tee-Object -Append -FilePath '$logPath'
    `$exitCode = `$LASTEXITCODE
    Add-Content -Path '$logPath' -Value "Exit code: `$exitCode"
    if (`$exitCode -eq 0) {
        Add-Content -Path '$logPath' -Value "✅ Import completed successfully"
    } else {
        Add-Content -Path '$logPath' -Value "❌ Import failed with exit code `$exitCode"
    }
} catch {
    Add-Content -Path '$logPath' -Value "❌ Error: `$_"
}
Add-Content -Path '$logPath' -Value "=== Import finished at `$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===`n"
"@

# Create action
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command `"$command`"" `
    -WorkingDirectory $WorkingDirectory

# Create trigger (daily at specified time)
$trigger = New-ScheduledTaskTrigger -Daily -At $StartTime

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

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
    -Description "Autonomous import of Friday AI v4.3.5 lead pipeline data"

Write-Host "`n✅ Scheduled task registered successfully!" -ForegroundColor Green
Write-Host "`n📋 Task Details:" -ForegroundColor Cyan
Write-Host "   Name:      $TaskName" -ForegroundColor Gray
Write-Host "   Schedule:  Daily at $StartTime" -ForegroundColor Gray
Write-Host "   Logs:      $logsDir" -ForegroundColor Gray
Write-Host "   Status:    $($task.State)" -ForegroundColor Gray

Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "   • View task: Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "   • Run now:  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "   • Remove:   .\register-import-schedule.ps1 -Unregister" -ForegroundColor Gray
Write-Host "   • Logs:     Get-Content '$logPath'" -ForegroundColor Gray
Write-Host ""
