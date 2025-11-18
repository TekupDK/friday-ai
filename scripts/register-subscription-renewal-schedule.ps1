#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Registers a Windows Scheduled Task for subscription renewal processing

.DESCRIPTION
    Creates a scheduled task that calls the subscription renewal endpoint daily.
    The task processes all subscriptions due for billing and sends renewal emails.
    
.PARAMETER TaskName
    Name of the scheduled task (default: "Friday-AI-Subscription-Renewals")
    
.PARAMETER StartTime
    Time to run daily (default: "09:00")
    
.PARAMETER WorkingDirectory
    Path to the tekup-ai-v2 project directory
    
.PARAMETER Unregister
    Remove the scheduled task instead of creating it

.EXAMPLE
    .\register-subscription-renewal-schedule.ps1
    Creates task with default settings (runs daily at 9:00 AM)
    
.EXAMPLE
    .\register-subscription-renewal-schedule.ps1 -StartTime "08:00"
    Creates task to run daily at 8:00 AM
    
.EXAMPLE
    .\register-subscription-renewal-schedule.ps1 -Unregister
    Removes the scheduled task
#>

param(
    [string]$TaskName = "Friday-AI-Subscription-Renewals",
    [string]$StartTime = "09:00",
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
    Write-Error "Invalid working directory. package.json not found: $WorkingDirectory"
    exit 1
}

# Create logs directory
$logsDir = Join-Path $WorkingDirectory "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# Parse start time
$timeParts = $StartTime.Split(":")
if ($timeParts.Length -ne 2) {
    Write-Error "Invalid time format. Use HH:MM (e.g., 09:00)"
    exit 1
}
$hour = [int]$timeParts[0]
$minute = [int]$timeParts[1]

# Build script path
$scriptPath = Join-Path $WorkingDirectory "server\scripts\subscription-renewal-job.ts"
$logPath = Join-Path $WorkingDirectory "logs\subscription-renewal-$(Get-Date -Format 'yyyyMMdd').log"
$logsDir = Join-Path $WorkingDirectory "logs"

# Ensure logs directory exists
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

# PowerShell command to run
$command = @"
Set-Location '$WorkingDirectory'
`$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Add-Content -Path '$logPath' -Value "`n=== Subscription renewal started at `$timestamp ==="
try {
    npx tsx '$scriptPath' 2>&1 | Tee-Object -Append -FilePath '$logPath'
    `$exitCode = `$LASTEXITCODE
    Add-Content -Path '$logPath' -Value "Exit code: `$exitCode"
    if (`$exitCode -eq 0) {
        Add-Content -Path '$logPath' -Value "✅ Subscription renewal completed successfully"
    } else {
        Add-Content -Path '$logPath' -Value "❌ Subscription renewal failed with exit code `$exitCode"
    }
} catch {
    Add-Content -Path '$logPath' -Value "❌ Error: `$_"
}
Add-Content -Path '$logPath' -Value "=== Subscription renewal finished at `$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===`n"
"@

# Create action
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command `"$command`"" `
    -WorkingDirectory $WorkingDirectory

# Create trigger (daily at specified time)
$trigger = New-ScheduledTaskTrigger `
    -Daily `
    -At "$($hour.ToString("00")):$($minute.ToString("00"))"

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
    -Description "Daily processing of subscription renewals. Processes all subscriptions due for billing and sends renewal emails."

Write-Host "`n✅ Scheduled task registered successfully!" -ForegroundColor Green
Write-Host "`n📋 Task Details:" -ForegroundColor Cyan
Write-Host "   Name:      $TaskName" -ForegroundColor Gray
Write-Host "   Schedule:  Daily at $StartTime" -ForegroundColor Gray
Write-Host "   Endpoint:  $endpoint" -ForegroundColor Gray
Write-Host "   Status:    $($task.State)" -ForegroundColor Gray

Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "   • View task: Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "   • Run now:  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "   • Test endpoint: curl -X POST $endpoint" -ForegroundColor Gray
Write-Host "   • Remove:   .\register-subscription-renewal-schedule.ps1 -Unregister" -ForegroundColor Gray

Write-Host "`n⚠️  Note:" -ForegroundColor Yellow
Write-Host "   In production, you may need to add authentication to the endpoint call." -ForegroundColor Gray
Write-Host "   Update the `$actionScript variable in this file to include auth headers." -ForegroundColor Gray

