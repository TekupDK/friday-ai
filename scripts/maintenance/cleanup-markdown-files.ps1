# Cleanup Markdown Files Script
# Flytter alle .md filer til docs/archive/ (undtagen docs/ mappen selv)

$ErrorActionPreference = "Stop"

Write-Host "🧹 Markdown Cleanup Script" -ForegroundColor Cyan
Write-Host ""

# Create archive directory
$archiveRoot = "docs\archive"
if (!(Test-Path $archiveRoot)) {
    New-Item -ItemType Directory -Path $archiveRoot | Out-Null
    Write-Host "✅ Created archive directory: $archiveRoot" -ForegroundColor Green
}

# Files to keep in root (don't move)
$keepInRoot = @(
    "README.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSE.md"
)

# Find all .md files
Write-Host "🔍 Finding markdown files..." -ForegroundColor Yellow
$allMdFiles = Get-ChildItem -Path . -Filter "*.md" -Recurse -File | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and
        $_.FullName -notlike "*\.git*" -and
        $_.FullName -notlike "*docs\archive*" -and
        $_.FullName -notlike "*build*" -and
        $_.FullName -notlike "*dist*"
    }

Write-Host "📊 Found $($allMdFiles.Count) markdown files" -ForegroundColor Cyan
Write-Host ""

# Categorize files
$toMove = @()
$toKeep = @()

foreach ($file in $allMdFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    
    # Skip if already in docs/ folder
    if ($relativePath -like "docs\*" -and $relativePath -notlike "docs\archive\*") {
        Write-Host "⏭️  Skip (in docs/): $relativePath" -ForegroundColor DarkGray
        continue
    }
    
    # Keep important root files
    if ($keepInRoot -contains $file.Name -and $file.DirectoryName -eq (Get-Location).Path) {
        Write-Host "📌 Keep: $relativePath" -ForegroundColor Green
        $toKeep += $file
        continue
    }
    
    $toMove += $file
}

Write-Host ""
Write-Host "📦 Summary:" -ForegroundColor Cyan
Write-Host "  Files to move: $($toMove.Count)" -ForegroundColor Yellow
Write-Host "  Files to keep: $($toKeep.Count)" -ForegroundColor Green
Write-Host ""

if ($toMove.Count -eq 0) {
    Write-Host "✅ Nothing to move! Workspace is already clean." -ForegroundColor Green
    exit 0
}

# Ask for confirmation
Write-Host "⚠️  This will move $($toMove.Count) files to $archiveRoot" -ForegroundColor Yellow
$confirmation = Read-Host "Continue? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Moving files..." -ForegroundColor Cyan

$moved = 0
$errors = 0

foreach ($file in $toMove) {
    try {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
        
        # Determine archive subdirectory
        if ($relativePath -like "tasks\*") {
            $archiveSubdir = "$archiveRoot\tasks"
        } elseif ($relativePath -like ".copilot\*") {
            $archiveSubdir = "$archiveRoot\copilot"
        } elseif ($relativePath -like ".claude\*") {
            $archiveSubdir = "$archiveRoot\claude"
        } elseif ($relativePath -like "test-results\*") {
            $archiveSubdir = "$archiveRoot\test-results"
        } else {
            $archiveSubdir = "$archiveRoot\root"
        }
        
        # Create subdirectory if needed
        if (!(Test-Path $archiveSubdir)) {
            New-Item -ItemType Directory -Path $archiveSubdir -Force | Out-Null
        }
        
        # Move file
        $destination = Join-Path $archiveSubdir $file.Name
        
        # Handle duplicates
        $counter = 1
        while (Test-Path $destination) {
            $nameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            $ext = $file.Extension
            $destination = Join-Path $archiveSubdir "${nameWithoutExt}_$counter$ext"
            $counter++
        }
        
        Move-Item -Path $file.FullName -Destination $destination -Force
        Write-Host "  ✅ $relativePath → $destination" -ForegroundColor Green
        $moved++
        
    } catch {
        Write-Host "  ❌ Failed: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "🎉 Cleanup complete!" -ForegroundColor Green
Write-Host "  Moved: $moved files" -ForegroundColor Cyan
Write-Host "  Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host "  Archived to: $archiveRoot" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 All files are now in database + archived safely" -ForegroundColor Yellow
