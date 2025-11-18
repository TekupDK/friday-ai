# Organize Test Files - Move test scripts to proper location
# Run this from the root of the project

Write-Host "📦 Organizing test files..." -ForegroundColor Cyan
Write-Host ""

# Create tests/manual directory if it doesn't exist
$manualTestsDir = "tests\manual"
if (-not (Test-Path $manualTestsDir)) {
    New-Item -ItemType Directory -Path $manualTestsDir -Force | Out-Null
    Write-Host "✅ Created directory: $manualTestsDir" -ForegroundColor Green
}

# Test files to move
$testFiles = @(
    "test-all-email-functions.mjs",
    "test-billy-api.ts",
    "test-billy-invoice-response.mjs",
    "test-email-actions.mjs",
    "test-email-api.ts",
    "test-email-loading.mjs",
    "test-email-sidebar.mjs",
    "test-friday-calendar-tools.ts",
    "test-friday-complete.ts",
    "test-friday-optimized.ts",
    "test-google-api.mjs",
    "test-inbound-email.js",
    "test-intent.mjs",
    "test-label-filtering.mjs",
    "test-openrouter.ts",
    "test-sidebar-logic.md",
    "test-ui-state.mjs",
    "verify-email-fix.mjs"
)

Write-Host "Files to move: $($testFiles.Count)" -ForegroundColor Yellow
Write-Host ""

# Show files
Write-Host "📋 Files that will be moved to tests/manual/:" -ForegroundColor Yellow
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "  📦 $file ($size bytes)" -ForegroundColor Cyan
    } else {
        Write-Host "  ⚠️  $file (not found)" -ForegroundColor Gray
    }
}
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Do you want to move these files? (yes/no)"

if ($confirmation -eq "yes") {
    Write-Host ""
    Write-Host "📦 Moving files..." -ForegroundColor Cyan
    
    $movedCount = 0
    $notFoundCount = 0
    
    foreach ($file in $testFiles) {
        if (Test-Path $file) {
            $destination = Join-Path $manualTestsDir (Split-Path $file -Leaf)
            Move-Item $file $destination -Force
            Write-Host "  ✅ Moved: $file → $destination" -ForegroundColor Green
            $movedCount++
        } else {
            Write-Host "  ⚠️  Not found: $file" -ForegroundColor Gray
            $notFoundCount++
        }
    }
    
    Write-Host ""
    Write-Host "✅ Organization complete!" -ForegroundColor Green
    Write-Host "   Moved: $movedCount files" -ForegroundColor Green
    Write-Host "   Not found: $notFoundCount files" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Review: tests/manual/" -ForegroundColor White
    Write-Host "   2. Commit: git commit -m 'chore: organize test files'" -ForegroundColor White
    
} else {
    Write-Host ""
    Write-Host "❌ Organization cancelled" -ForegroundColor Yellow
}
