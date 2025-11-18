# Security Scanning Setup

**Status:** ✅ Implemented  
**Date:** January 28, 2025

## Overview

Automated security scanning has been set up to detect vulnerabilities in dependencies and code.

## Components

### 1. Dependabot

**Location:** `.github/dependabot.yml`

Automatically creates PRs for dependency updates:
- **Schedule:** Weekly on Mondays at 9 AM
- **Scope:** npm packages (pnpm)
- **Updates:** Minor and patch versions only
- **Major versions:** Require manual review

**Features:**
- Groups updates to reduce PR noise
- Labels PRs with `dependencies` and `automated`
- Limits to 10 open PRs at a time

### 2. Security Workflow

**Location:** `.github/workflows/security.yml`

Runs security scans on:
- Every push to `main`/`master`
- Every pull request
- Weekly schedule (Mondays at 9 AM UTC)

**Scans:**
1. **npm audit** - Checks for known vulnerabilities
2. **Snyk** - Advanced vulnerability scanning (optional, requires token)
3. **License check** - Validates license compliance

## Setup

### Dependabot

No setup required - automatically enabled when `.github/dependabot.yml` exists.

### Snyk (Optional)

1. **Get Snyk Token:**
   - Sign up at https://snyk.io
   - Go to Settings → API Token
   - Copy your token

2. **Add GitHub Secret:**
   - Go to GitHub repo → Settings → Secrets → Actions
   - Add secret: `SNYK_TOKEN` with your token value

3. **Enable Snyk:**
   - The workflow will automatically use the token if available
   - If no token, Snyk step will be skipped (no failure)

### Codecov (Optional)

For coverage reporting:

1. **Sign up:** https://codecov.io
2. **Add GitHub Secret:** `CODECOV_TOKEN`
3. **Enable in workflow:** Already configured in `ci-core.yml`

## Usage

### Manual Security Audit

```bash
# Run npm audit
pnpm audit

# Run with specific level
pnpm audit --audit-level=moderate

# Fix automatically (if possible)
pnpm audit fix
```

### Review Dependabot PRs

1. Check PR description for changes
2. Review changelog links
3. Test locally if needed
4. Merge if approved

### Security Alerts

GitHub will automatically:
- Create security alerts for vulnerabilities
- Send notifications to repository admins
- Create Dependabot PRs for fixes

## Configuration

### Dependabot Settings

Edit `.github/dependabot.yml` to:
- Change schedule (interval, day, time)
- Adjust PR limits
- Add/remove reviewers
- Modify grouping rules

### Security Workflow

Edit `.github/workflows/security.yml` to:
- Change audit level threshold
- Add custom security checks
- Modify schedule
- Add more scanning tools

## Best Practices

1. **Review Dependabot PRs Weekly**
   - Don't let them accumulate
   - Test critical updates before merging

2. **Monitor Security Alerts**
   - Check GitHub Security tab regularly
   - Address high/critical vulnerabilities immediately

3. **Keep Dependencies Updated**
   - Don't ignore Dependabot PRs
   - Update major versions during planned maintenance

4. **Use Snyk for Advanced Scanning**
   - More comprehensive than npm audit
   - Better for complex dependency trees

## Troubleshooting

### Dependabot Not Creating PRs

- Check `.github/dependabot.yml` syntax
- Verify repository has Dependabot enabled
- Check GitHub Actions logs

### Security Workflow Failing

- Most steps use `continue-on-error: true` (won't fail CI)
- Check workflow logs for specific errors
- Verify secrets are set correctly

### False Positives

- Some vulnerabilities may be false positives
- Review Snyk/npm audit reports carefully
- Mark as "won't fix" in GitHub Security tab if needed

## Resources

- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Snyk Documentation](https://docs.snyk.io/)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

