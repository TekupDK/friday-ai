#!/usr/bin/env pwsh
# Full Documentation Cleanup & Recategorization
# 1. Move all .md files to archive
# 2. Recategorize all docs in database

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   📚 FULL DOCS CLEANUP & UPDATE          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Cleanup markdown files
Write-Host "🔹 STEP 1: Move .md files to archive" -ForegroundColor Yellow
Write-Host ""

.\scripts\cleanup-markdown-files.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Cleanup failed! Aborting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Step 2: Recategorize docs in database
Write-Host "🔹 STEP 2: Recategorize & update docs in database" -ForegroundColor Yellow
Write-Host ""

$env:DATABASE_URL = (Get-Content .env.dev | Select-String "DATABASE_URL" | ForEach-Object { $_.ToString().Split('=', 2)[1] })

npx tsx scripts/recategorize-docs.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Recategorization failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Summary
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ CLEANUP COMPLETE!                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📊 What happened:" -ForegroundColor Cyan
Write-Host "   ✅ Moved all .md files to docs/archive/" -ForegroundColor Green
Write-Host "   ✅ Recategorized docs in database" -ForegroundColor Green
Write-Host "   ✅ Marked outdated docs" -ForegroundColor Green
Write-Host "   ✅ Enhanced tags" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Visit http://localhost:3000/docs" -ForegroundColor White
Write-Host "   2. Browse by new categories" -ForegroundColor White
Write-Host "   3. Filter by 'outdated' tag to review old docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Commit changes to git:" -ForegroundColor Cyan
Write-Host "   git add docs/archive/" -ForegroundColor DarkGray
Write-Host "   git commit -m 'docs: cleanup and recategorize documentation'" -ForegroundColor DarkGray
Write-Host ""
