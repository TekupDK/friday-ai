# Fix for llama-server.exe systemfejl (system error)
# This script fixes Docker Desktop's llama-server.exe issues

Write-Host "=== Docker llama-server.exe System Error Fix ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator. Some fixes may require elevation." -ForegroundColor Yellow
    Write-Host ""
}

# 1. Check Docker Desktop installation
Write-Host "1. Checking Docker Desktop installation..." -ForegroundColor Green
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
$llamaServerPath = "C:\Program Files\Docker\Docker\resources\model-runner\bin\com.docker.llama-server.exe"

if (Test-Path $dockerPath) {
    Write-Host "   [OK] Docker Desktop found" -ForegroundColor Green
} else {
    Write-Host "   [X] Docker Desktop not found at $dockerPath" -ForegroundColor Red
    exit 1
}

if (Test-Path $llamaServerPath) {
    Write-Host "   [OK] llama-server.exe found" -ForegroundColor Green
} else {
    Write-Host "   [X] llama-server.exe not found" -ForegroundColor Red
}

# 2. Check Visual C++ Redistributables
Write-Host ""
Write-Host "2. Checking Visual C++ Redistributables..." -ForegroundColor Green
$vcRedist = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\VisualStudio\*\VC\Runtimes\*" -ErrorAction SilentlyContinue | Where-Object { $_.Installed -eq 1 }
if ($vcRedist) {
    Write-Host "   [OK] Visual C++ Redistributable installed" -ForegroundColor Green
    $vcRedist | ForEach-Object { Write-Host "     - $($_.PSChildName): $($_.Version)" -ForegroundColor Gray }
} else {
    Write-Host "   [X] Visual C++ Redistributable not found - this may cause DLL errors" -ForegroundColor Red
    Write-Host "     Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe" -ForegroundColor Yellow
}

# 3. Check Docker processes
Write-Host ""
Write-Host "3. Checking Docker processes..." -ForegroundColor Green
$dockerProcesses = Get-Process -Name "Docker Desktop", "com.docker.backend", "vpnkit", "com.docker.proxy" -ErrorAction SilentlyContinue
if ($dockerProcesses) {
    Write-Host "   [OK] Docker Desktop is running ($($dockerProcesses.Count) processes)" -ForegroundColor Green
} else {
    Write-Host "   [X] Docker Desktop is not running" -ForegroundColor Red
}

# 4. Check Docker service
Write-Host ""
Write-Host "4. Checking Docker service..." -ForegroundColor Green
$dockerService = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
if ($dockerService) {
    Write-Host "   Status: $($dockerService.Status)" -ForegroundColor $(if ($dockerService.Status -eq 'Running') { 'Green' } else { 'Yellow' })
    if ($dockerService.Status -ne 'Running') {
        Write-Host "   Note: Service stopped is normal for some Docker Desktop versions" -ForegroundColor Gray
    }
} else {
    Write-Host "   Service not found" -ForegroundColor Yellow
}

# 5. Disable Docker Desktop AI features (fix for llama-server issues)
Write-Host ""
Write-Host "5. Applying fix: Disable Docker Desktop AI features..." -ForegroundColor Green
$dockerSettingsPath = "$env:APPDATA\Docker\settings.json"
if (Test-Path $dockerSettingsPath) {
    try {
        $settings = Get-Content $dockerSettingsPath -Raw | ConvertFrom-Json
        $changed = $false
        
        # Disable AI-related features that use llama-server
        if ($settings.PSObject.Properties.Name -contains 'aiAssistantEnabled') {
            $settings.aiAssistantEnabled = $false
            $changed = $true
            Write-Host "   [OK] Disabled AI Assistant" -ForegroundColor Green
        }
        
        if ($settings.PSObject.Properties.Name -contains 'enableAIFeatures') {
            $settings.enableAIFeatures = $false
            $changed = $true
            Write-Host "   [OK] Disabled AI Features" -ForegroundColor Green
        }
        
        if ($changed) {
            # Backup original settings
            Copy-Item $dockerSettingsPath "$dockerSettingsPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')" -Force
            $settings | ConvertTo-Json -Depth 32 | Set-Content $dockerSettingsPath -Force
            Write-Host "   [OK] Settings updated (backup created)" -ForegroundColor Green
            Write-Host "   [!] Please restart Docker Desktop for changes to take effect" -ForegroundColor Yellow
        } else {
            Write-Host "   [i] No AI features found in settings (may already be disabled)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   [X] Failed to update settings: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   [i] Settings file not found (this is OK if Docker hasn't been configured yet)" -ForegroundColor Gray
}

# 6. Alternative: Rename llama-server.exe to prevent it from running
Write-Host ""
Write-Host "6. Alternative fix: Disable llama-server.exe..." -ForegroundColor Green
if (Test-Path $llamaServerPath) {
    $renamedPath = "$llamaServerPath.disabled"
    if (Test-Path $renamedPath) {
        Write-Host "   [i] llama-server.exe already disabled" -ForegroundColor Gray
    } else {
        if ($isAdmin) {
            try {
                Rename-Item $llamaServerPath "$llamaServerPath.disabled" -Force
                Write-Host "   [OK] llama-server.exe renamed to .disabled" -ForegroundColor Green
                Write-Host "   To re-enable: Rename it back to com.docker.llama-server.exe" -ForegroundColor Gray
            } catch {
                Write-Host "   [X] Failed to rename: $_" -ForegroundColor Red
                Write-Host "   Run this script as Administrator to apply this fix" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   [!] Skipping - requires Administrator privileges" -ForegroundColor Yellow
            Write-Host "   Run as Administrator to disable llama-server.exe" -ForegroundColor Gray
        }
    }
}

# 7. Summary and recommendations
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "The llama-server.exe error is caused by Docker Desktop's AI features." -ForegroundColor White
Write-Host ""
Write-Host "Solutions applied:" -ForegroundColor White
Write-Host "  1. Disabled AI features in Docker settings (if found)" -ForegroundColor Gray
Write-Host "  2. Optionally renamed llama-server.exe to prevent execution" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Restart Docker Desktop" -ForegroundColor Yellow
Write-Host "  2. If error persists, download Visual C++ Redistributable:" -ForegroundColor Yellow
Write-Host "     https://aka.ms/vs/17/release/vc_redist.x64.exe" -ForegroundColor Cyan
Write-Host "  3. Consider updating Docker Desktop to the latest version" -ForegroundColor Yellow
Write-Host ""

# Offer to restart Docker Desktop
$restart = Read-Host "Do you want to restart Docker Desktop now? (y/n)"
if ($restart -eq 'y' -or $restart -eq 'Y') {
    Write-Host ""
    Write-Host "Restarting Docker Desktop..." -ForegroundColor Green
    Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "[OK] Docker Desktop restarted" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
