# Run User Settings Review - Automated
# This script runs the automated review test for user settings

Write-Host "🚀 Starting User Settings Review..." -ForegroundColor Cyan

# Check if server is running
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "✅ Server is already running" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Server is not running" -ForegroundColor Yellow
    Write-Host "   Starting server in background..." -ForegroundColor Yellow
    
    # Start server in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..'; pnpm dev" -WindowStyle Minimized
    
    # Wait for server to start
    Write-Host "   Waiting for server to start..." -ForegroundColor Yellow
    $maxRetries = 30
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        Start-Sleep -Seconds 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $serverRunning = $true
                Write-Host "✅ Server started successfully" -ForegroundColor Green
                break
            }
        } catch {
            $retryCount++
            Write-Host "   Retrying... ($retryCount/$maxRetries)" -ForegroundColor Yellow
        }
    }
    
    if (-not $serverRunning) {
        Write-Host "❌ Failed to start server. Please start manually with 'pnpm dev'" -ForegroundColor Red
        exit 1
    }
}

# Run Playwright tests
Write-Host "`n🧪 Running automated review tests..." -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot\..

# Run tests
$env:PLAYWRIGHT_BASE_URL = "http://localhost:3000"
pnpm exec playwright test tests/e2e/user-settings-review.spec.ts --project=chromium

$testExitCode = $LASTEXITCODE

if ($testExitCode -eq 0) {
    Write-Host "`n✅ All review tests passed!" -ForegroundColor Green
    Write-Host "`n📊 View detailed report:" -ForegroundColor Cyan
    Write-Host "   pnpm exec playwright show-report tests/results/reports" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Some tests failed. Check report for details." -ForegroundColor Red
    Write-Host "`n📊 View detailed report:" -ForegroundColor Cyan
    Write-Host "   pnpm exec playwright show-report tests/results/reports" -ForegroundColor Gray
}

exit $testExitCode


