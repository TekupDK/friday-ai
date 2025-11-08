# Phase 1: Safe Cleanup - Delete files that are definitely not needed
# Run this from the root of the project

Write-Host "🧹 Starting Phase 1 Cleanup..." -ForegroundColor Cyan
Write-Host ""

# Count files to delete
$filesToDelete = @(
    # Empty files (0 bytes)
    "DEBUG_AKTUEL_STATUS.md",
    "FIX_500_ERROR.md",
    "LOGIN_FIXES_COMPLETE.md",
    "LOGIN_FIX_SUMMARY.md",
    "LOGIN_ISSUES_ANALYSIS.md",
    "QUICK_START.md",
    "README_LOGIN_FIX.md",
    "TEST_LOGIN_GUIDE.md",
    "VISUAL_LOGIN_GUIDE.md",
    "check-env.js",
    "test-database.js",
    
    # Backup files
    "drizzle\schema.backup.ts",
    
    # Deprecated docs
    "docs\DEPRECATED_CODE_CLEANUP.md",
    "docs\DEPRECATED_FILES.md",
    
    # Temporary files
    "analysis-emil-laerke.json",
    "billy-api-response.json",
    "cookies.txt",
    "stats.html",
    "env.template.txt"
)

Write-Host "Files to delete: $($filesToDelete.Count)" -ForegroundColor Yellow
Write-Host ""

# Show files
Write-Host "📋 Files that will be deleted:" -ForegroundColor Yellow
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "  ❌ $file ($size bytes)" -ForegroundColor Red
    } else {
        Write-Host "  ⚠️  $file (not found)" -ForegroundColor Gray
    }
}
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Do you want to delete these files? (yes/no)"

if ($confirmation -eq "yes") {
    Write-Host ""
    Write-Host "🗑️  Deleting files..." -ForegroundColor Cyan
    
    $deletedCount = 0
    $notFoundCount = 0
    
    foreach ($file in $filesToDelete) {
        if (Test-Path $file) {
            Remove-Item $file -Force
            Write-Host "  ✅ Deleted: $file" -ForegroundColor Green
            $deletedCount++
        } else {
            Write-Host "  ⚠️  Not found: $file" -ForegroundColor Gray
            $notFoundCount++
        }
    }
    
    Write-Host ""
    Write-Host "✅ Cleanup complete!" -ForegroundColor Green
    Write-Host "   Deleted: $deletedCount files" -ForegroundColor Green
    Write-Host "   Not found: $notFoundCount files" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Run: git status" -ForegroundColor White
    Write-Host "   2. Review changes" -ForegroundColor White
    Write-Host "   3. Commit: git commit -m 'chore: cleanup empty and deprecated files'" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
}
