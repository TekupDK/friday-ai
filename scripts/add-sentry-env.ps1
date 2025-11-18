# Add Sentry environment variables to .env.dev
$envFile = ".env.dev"

# Sentry configuration
$sentryConfig = @"

# ============================================
# Sentry Error Tracking
# ============================================

# Server Project (friday-ai-server)
SENTRY_DSN=https://38abb6a712137ee472f8ee6215dc7b37@o4510243450388480.ingest.de.sentry.io/4510383150727248
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1

# Client Project (friday-ai-client)
VITE_SENTRY_DSN=https://12339bf53c39de932596de72504d2c1f@o4510243450388480.ingest.de.sentry.io/4510383153610832
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
"@

# Check if file exists
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    
    # Check if Sentry variables already exist
    if ($content -match 'SENTRY_DSN') {
        Write-Host "Sentry variables already exist in .env.dev" -ForegroundColor Yellow
        Write-Host "Skipping addition to avoid duplicates." -ForegroundColor Yellow
    } else {
        # Append Sentry config
        Add-Content -Path $envFile -Value $sentryConfig
        Write-Host "Sentry variables added successfully to .env.dev" -ForegroundColor Green
    }
} else {
    # Create file with Sentry config
    Set-Content -Path $envFile -Value $sentryConfig
    Write-Host "Created .env.dev with Sentry variables!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server: pnpm dev" -ForegroundColor White
Write-Host "2. Check logs for: [Sentry] Error tracking initialized" -ForegroundColor White
Write-Host "3. Test error in browser console to verify Sentry" -ForegroundColor White
