# PowerShell script to run tests with UTF-8 encoding
# This ensures Danish characters (åøæ) and checkmarks display correctly
# Usage: pwsh scripts/test-with-utf8.ps1 [test files...]

# Set UTF-8 encoding
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONIOENCODING = "utf-8"

# Change code page to UTF-8 (65001)
chcp 65001 | Out-Null

# Run vitest with all arguments passed to this script
if ($args.Count -gt 0) {
    pnpm exec vitest run $args
} else {
    pnpm exec vitest run
}

