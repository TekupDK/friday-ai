# Organize Commits Script
# This script helps organize uncommitted changes into logical commits

Write-Host "📋 Commit Organization Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check git status
Write-Host "Checking git status..." -ForegroundColor Yellow
$status = git status --porcelain
$totalChanges = ($status | Measure-Object -Line).Lines

Write-Host "Total uncommitted changes: $totalChanges" -ForegroundColor Green
Write-Host ""

# Show current status
Write-Host "Current git status:" -ForegroundColor Yellow
git status --short | Select-Object -First 20
Write-Host ""

# Commit groups
$commits = @(
    @{
        Name = "Subscription System"
        Type = "feat(subscription)"
        Files = @(
            "client/src/components/subscription/",
            "client/src/pages/SubscriptionManagement.tsx",
            "client/src/constants/pricing.ts",
            "client/src/constants/storage.ts",
            "server/subscription-*.ts",
            "server/routers/subscription-router.ts",
            "drizzle/migrations/create-subscription-tables.sql",
            "server/__tests__/subscription*.test.ts",
            "server/scripts/subscription-*.ts"
        )
        Message = "feat(subscription): add complete subscription management system`n`n- Add frontend components (SubscriptionPlanSelector, SubscriptionManagement, UsageChart)`n- Add backend subscription router with CRUD operations`n- Add subscription database schema and migrations`n- Add subscription actions (create, update, cancel, renew)`n- Add subscription usage tracking`n- Add subscription email notifications`n- Add subscription renewal job`n- Add comprehensive test coverage"
    },
    @{
        Name = "Cursor Hooks System"
        Type = "feat(cursor)"
        Files = @(
            ".cursor/hooks/",
            ".cursor/hooks.json"
        )
        Message = "feat(cursor): add hooks system for command execution`n`n- Add hooks executor with pre/post execution hooks`n- Add hooks loader with validation`n- Add context loaders (codebase, project)`n- Add error handling hooks`n- Add post-execution hooks (linter, typecheck, documentation)`n- Add pre-execution hooks (dependencies, code style, environment)`n- Add comprehensive test suite`n- Add hooks configuration system"
    },
    @{
        Name = "Documentation Updates"
        Type = "docs"
        Files = @(
            "docs/DEVELOPMENT_STATUS_OVERVIEW_2025-01-28.md",
            "docs/COMMIT_PLAN_2025-01-28.md",
            "docs/qa/SUBSCRIPTION_*.md",
            "docs/development-notes/subscription/",
            "docs/development-notes/hooks/",
            "docs/development-notes/commands/",
            "docs/devops-deploy/SENTRY_SETUP.md",
            "docs/devops-deploy/IMPLEMENTATION_SUMMARY.md"
        )
        Message = "docs: add comprehensive documentation for recent features`n`n- Add development status overview`n- Add subscription system documentation (setup, testing, implementation)`n- Add hooks system documentation`n- Add commands improvement documentation`n- Add Sentry setup guide`n- Add implementation summaries`n- Update existing documentation"
    },
    @{
        Name = "Commands Refactoring"
        Type = "refactor(commands)"
        Files = @(
            ".cursor/commands/"
        )
        Message = "refactor(commands): reorganize commands into categories`n`n- Move commands into category folders (ai/, chat/, core/, debugging/, etc.)`n- Update commands metadata and index`n- Remove deprecated commands`n- Add new command structure`n- Update command template`n- Improve command organization"
    },
    @{
        Name = "Code Cleanup"
        Type = "chore"
        Files = @(
            "client/src/App.tsx",
            "client/src/main.tsx",
            "client/src/pages/WorkspaceLayout.tsx",
            "server/_core/index.ts",
            "server/_core/vite.ts",
            "server/docs/ai/auto-create.ts",
            "vite.config.ts",
            "package.json"
        )
        Message = "chore: cleanup and fix various issues`n`n- Fix TypeScript errors`n- Update dependencies`n- Improve code quality`n- Fix linting issues`n- Update configuration files"
    }
)

Write-Host "Available commit groups:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
for ($i = 0; $i -lt $commits.Length; $i++) {
    $commit = $commits[$i]
    Write-Host "[$($i + 1)] $($commit.Name) ($($commit.Type))" -ForegroundColor Green
}
Write-Host ""

$choice = Read-Host "Select commit group to stage (1-$($commits.Length)) or 'all' for all"

if ($choice -eq "all") {
    Write-Host "`nStaging all commit groups..." -ForegroundColor Yellow
    
    foreach ($commit in $commits) {
        Write-Host "`n📦 Staging: $($commit.Name)" -ForegroundColor Cyan
        
        foreach ($file in $commit.Files) {
            if (Test-Path $file -ErrorAction SilentlyContinue) {
                Write-Host "  + $file" -ForegroundColor Gray
                git add $file 2>&1 | Out-Null
            } else {
                Write-Host "  - $file (not found, skipping)" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "`n✅ All files staged!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Review staged changes: git status" -ForegroundColor White
    Write-Host "2. Commit each group separately with appropriate messages" -ForegroundColor White
    Write-Host "3. Or use: git commit -m 'feat: multiple features' (not recommended)" -ForegroundColor White
    
} elseif ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $commits.Length) {
    $commit = $commits[[int]$choice - 1]
    
    Write-Host "`n📦 Staging: $($commit.Name)" -ForegroundColor Cyan
    
    foreach ($file in $commit.Files) {
        if (Test-Path $file -ErrorAction SilentlyContinue) {
            Write-Host "  + $file" -ForegroundColor Gray
            git add $file 2>&1 | Out-Null
        } else {
            Write-Host "  - $file (not found, skipping)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n✅ Files staged!" -ForegroundColor Green
    Write-Host "`nCommit message:" -ForegroundColor Cyan
    Write-Host $commit.Message -ForegroundColor White
    Write-Host "`nTo commit, run:" -ForegroundColor Cyan
    Write-Host "git commit -m `"$($commit.Message)`"" -ForegroundColor White
    
} else {
    Write-Host "Invalid choice. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 Current status:" -ForegroundColor Cyan
git status --short | Select-Object -First 10

