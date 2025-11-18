# Documentation Reorganization Script
# Moves all .md files into proper docs structure with categorization and indexing

$ErrorActionPreference = "Stop"

Write-Host "Starting documentation reorganization..." -ForegroundColor Cyan

# Define category mappings
$categories = @{
    "ai-automation" = @(
        "*AUTONOMOUS*", "*AI_DOCS*", "*FRIDAY_AI*", "*LANGFUSE*", "*CHROMADB*", 
        "*AI_MODEL*", "*AI_TEST*", "*LITELLM*", "*OPENROUTER*"
    )
    "crm-business" = @(
        "*CRM*", "*CUSTOMER*", "*INVOICES*", "*BILLY*", "*PIPELINE*"
    )
    "email-system" = @(
        "*EMAIL*", "*GMAIL*", "*SMTP*", "*SHORTWAVE*", "*3-PANEL*"
    )
    "ui-frontend" = @(
        "*UI*", "*CHAT*", "*PANEL*", "*SHOWCASE*", "*COMPONENT*", "*ANIMATION*", 
        "*BUNDLE*", "*WORKSPACE*", "*VIRTUAL_SCROLLING*"
    )
    "development-notes" = @(
        "*DEV*", "*SESSION*", "*PROGRESS*", "*WEEK*", "*FINAL_SUMMARY*", "*NOTES*"
    )
    "testing-qa" = @(
        "*TEST*", "*PHASE*", "*E2E*", "*COMPREHENSIVE*", "*REAL_WORLD*"
    )
    "implementation-design" = @(
        "*ARCHITECTURE*", "*DESIGN*", "*SPEC*", "*ROADMAP*", "*PLAN*", 
        "*MIGRATION*", "*IMPLEMENTATION*", "*REDESIGN*"
    )
    "devops-deploy" = @(
        "*DEPLOY*", "*DOCKER*", "*CI*", "*DATABASE*", "*SUPABASE*"
    )
    "documentation" = @(
        "*DOCS*", "*GUIDE*", "*README*", "*REFERENCE*", "*CATALOG*", 
        "*INDEX*", "*TEMPLATE*"
    )
    "status-reports" = @(
        "*STATUS*", "*COMPLETE*", "*SUMMARY*", "*REPORT*", "*ANALYSIS*", 
        "*REVIEW*", "*CLEANUP*", "*VERIFICATION*"
    )
}

# Root MD files to move
$rootMdFiles = Get-ChildItem -Path "." -Filter "*.md" | Where-Object { 
    $_.Name -ne "README.md" -and $_.Name -ne "CHANGELOG.md" 
}

Write-Host "Found $($rootMdFiles.Count) root MD files to categorize" -ForegroundColor Yellow

# Function to determine category
function Get-Category($fileName) {
    foreach ($cat in $categories.Keys) {
        foreach ($pattern in $categories[$cat]) {
            if ($fileName -like $pattern) {
                return $cat
            }
        }
    }
    return "documentation" # Default category
}

# Move root files
foreach ($file in $rootMdFiles) {
    $category = Get-Category -fileName $file.Name
    $destDir = "docs\$category"
    
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    $destPath = Join-Path $destDir $file.Name
    
    if (Test-Path $destPath) {
        Write-Host "  Skipping $($file.Name) (already exists in $category)" -ForegroundColor Gray
    } else {
        Move-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "  Moved $($file.Name) -> $category" -ForegroundColor Green
    }
}

# Move .trae documents
if (Test-Path ".trae\documents") {
    $traeFiles = Get-ChildItem -Path ".trae\documents" -Filter "*.md"
    Write-Host "`nFound $($traeFiles.Count) .trae documents" -ForegroundColor Yellow
    
    foreach ($file in $traeFiles) {
        $category = Get-Category -fileName $file.Name
        $destDir = "docs\$category"
        
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        $destPath = Join-Path $destDir $file.Name
        
        if (Test-Path $destPath) {
            Write-Host "  Skipping $($file.Name) (already exists)" -ForegroundColor Gray
        } else {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
            Write-Host "  Copied $($file.Name) -> $category" -ForegroundColor Green
        }
    }
}

# Move .kiro documents
if (Test-Path ".kiro\specs") {
    $kiroFiles = Get-ChildItem -Path ".kiro\specs" -Filter "*.md" -Recurse
    Write-Host "`nFound $($kiroFiles.Count) .kiro documents" -ForegroundColor Yellow
    
    foreach ($file in $kiroFiles) {
        if ($file.Name -eq "README.md") {
            continue
        }
        
        $category = Get-Category -fileName $file.Name
        $destDir = "docs\$category"
        
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        $destPath = Join-Path $destDir $file.Name
        
        if (Test-Path $destPath) {
            Write-Host "  Skipping $($file.Name) (already exists)" -ForegroundColor Gray
        } else {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
            Write-Host "  Copied $($file.Name) -> $category" -ForegroundColor Green
        }
    }
}

Write-Host "`nCreating category README files..." -ForegroundColor Cyan

# Create README for each category
$categoryDescriptions = @{
    "ai-automation" = "AI automation, Friday AI components, Langfuse tracing, and ChromaDB vector storage"
    "crm-business" = "CRM functionality, customer management, invoices, and Billy integration"
    "email-system" = "Email processing, Gmail integration, SMTP configuration, and Shortwave-inspired UI"
    "ui-frontend" = "Frontend UI components, chat interfaces, panels, and visual design"
    "development-notes" = "Development session notes, progress tracking, and developer documentation"
    "testing-qa" = "Test guides, test reports, QA procedures, and phase testing documentation"
    "implementation-design" = "Architecture designs, technical specifications, and implementation roadmaps"
    "devops-deploy" = "Deployment guides, Docker configuration, CI/CD, and infrastructure"
    "documentation" = "General documentation, guides, references, and templates"
    "status-reports" = "Status reports, completion summaries, analysis documents, and reviews"
}

foreach ($cat in $categories.Keys) {
    $catDir = "docs\$cat"
    $readmePath = Join-Path $catDir "README.md"
    
    $shouldCreate = $false
    if (!(Test-Path $readmePath)) {
        $shouldCreate = $true
    } elseif ((Get-Content $readmePath -Raw).Length -lt 100) {
        $shouldCreate = $true
    }
    
    if ($shouldCreate) {
        $files = Get-ChildItem -Path $catDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }
        
        $content = @"
# $($cat -replace '-', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) })

$($categoryDescriptions[$cat])

## Documents

"@
        
        foreach ($file in $files | Sort-Object Name) {
            $title = $file.BaseName -replace '_', ' ' -replace '-', ' '
            $content += "- [$title]($($file.Name))`n"
        }
        
        $content += @"

## Category Overview

This section contains $($files.Count) documents related to $($cat -replace '-', ' ').

Last updated: $(Get-Date -Format 'yyyy-MM-dd')
"@
        
        Set-Content -Path $readmePath -Value $content -Encoding UTF8
        Write-Host "  Created README for $cat ($($files.Count) docs)" -ForegroundColor Green
    }
}

# Create master docs index
$masterIndexPath = "docs\README.md"
$masterContent = @"
# Tekup AI v2 - Documentation Index

Complete documentation for the Tekup AI v2 platform organized by category.

## Documentation Categories

"@

foreach ($cat in $categories.Keys | Sort-Object) {
    $catDir = "docs\$cat"
    $fileCount = (Get-ChildItem -Path $catDir -Filter "*.md" | Where-Object { $_.Name -ne "README.md" }).Count
    $title = $cat -replace '-', ' ' | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) }
    
    $masterContent += @"
### [$title]($cat/README.md)

$($categoryDescriptions[$cat])

**Documents:** $fileCount

"@
}

$masterContent += @"

## Quick Links

- [Main README](../README.md)
- [CHANGELOG](../CHANGELOG.md)
- [Development Guide](development-notes/DEVELOPMENT_GUIDE.md)
- [API Reference](documentation/API_REFERENCE.md)
- [Architecture](implementation-design/ARCHITECTURE.md)

## Documentation Standards

All documentation follows these standards:

- **Markdown Format**: All docs use GitHub-flavored Markdown
- **Naming Convention**: SCREAMING_SNAKE_CASE or kebab-case for file names
- **Headers**: Proper heading hierarchy (h1 -> h2 -> h3)
- **Code Blocks**: Always specify language for syntax highlighting
- **Links**: Use relative links for internal documentation

## Maintenance

This documentation structure is maintained by the development team. 
Last reorganization: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

To update indexes, run: ``````powershell
.\reorganize-docs.ps1
``````

---

*Generated by docs reorganization script*
"@

Set-Content -Path $masterIndexPath -Value $masterContent -Encoding UTF8
Write-Host "`nCreated master documentation index" -ForegroundColor Green

Write-Host "`n✅ Documentation reorganization complete!" -ForegroundColor Green
Write-Host "Total categories: $($categories.Keys.Count)" -ForegroundColor Cyan
Write-Host "Master index: docs\README.md" -ForegroundColor Cyan
