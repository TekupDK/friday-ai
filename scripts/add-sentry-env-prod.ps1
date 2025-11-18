# Add Sentry environment variables to .env.prod
$envFile = ".env.prod"

# Sentry configuration for production
$sentryConfig = @"

# ============================================
# Sentry Error Tracking (Production)
# ============================================

# Server Project (friday-ai-server)
# Note: Consider creating separate production projects for better organization
SENTRY_DSN=https://38abb6a712137ee472f8ee6215dc7b37@o4510243450388480.ingest.de.sentry.io/4510383150727248
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1

# Client Project (friday-ai-client)
# Note: Consider creating separate production projects for better organization
VITE_SENTRY_DSN=https://12339bf53c39de932596de72504d2c1f@o4510243450388480.ingest.de.sentry.io/4510383153610832
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
"@

# Check if file exists
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    
    # Check if Sentry variables already exist
    if ($content -match 'SENTRY_DSN') {
        Write-Host "Sentry variables already exist in .env.prod" -ForegroundColor Yellow
        Write-Host "Skipping addition to avoid duplicates." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To update, manually edit .env.prod and update the Sentry variables." -ForegroundColor Cyan
    } else {
        # Append Sentry config
        Add-Content -Path $envFile -Value $sentryConfig
        Write-Host "Sentry variables added successfully to .env.prod" -ForegroundColor Green
    }
} else {
    # Create file with Sentry config
    Set-Content -Path $envFile -Value $sentryConfig
    Write-Host "Created .env.prod with Sentry variables!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Review and update other required environment variables!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review .env.prod and ensure all required variables are set" -ForegroundColor White
Write-Host "2. Consider creating separate Sentry projects for production" -ForegroundColor White
Write-Host "3. Configure production alerts in Sentry dashboard" -ForegroundColor White
Write-Host "4. Test error tracking after deployment" -ForegroundColor White

