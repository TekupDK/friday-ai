# API Optimering - Development Workflow

**Dato:** ${new Date().toISOString().split('T')[0]}
**Status:** Active Development Guide

## 🚀 Quick Start for Testing

### Opret Test Branch

For at teste API optimeringer isoleret:

````powershell
cd C:\Users\empir\Tekup\services\tekup-ai-v2
.\scripts\create-chat-branch.ps1

```text

Eller manuelt:

```bash
git checkout -b test/api-optimization-$(date +%Y%m%d-%H%M%S)
git push -u origin HEAD

```text

### Test Workflow

1. **Start Dev Server**

   ```bash
   pnpm dev

```bash

1. **Åbn Browser DevTools**
   - Network tab (filter: XHR/Fetch)
   - Console tab
   - Performance tab (optional)

1. **Kør Test Scenarios**
   - Se `API_OPTIMIZATION_QUICK_TEST.md` for 5-min tests
   - Se `API_OPTIMIZATION_TEST_REPORT.md` for detailed tests

1. **Dokumenter Resultater**
   - Tilføj metrics til test rapporten
   - Noter issues fundet
   - Update status dokumentation

## 🔄 Git Workflow

### Pre-Commit Checklist

- [ ] Alle tests kører
- [ ] Ingen linter errors
- [ ] Documentation opdateret
- [ ] Console logs verificeret

### Commit Message Format

```text
feat(api-optimization): [feature description]

- Add/Update/Fix: [specific change]
- Impact: [performance improvement]

```text

### Branch Strategy

- **Feature branches:** `feature/api-optimization-[name]`
- **Test branches:** `test/api-optimization-[date]`
- **Hotfix branches:** `hotfix/rate-limit-[issue]`

## 📝 Documentation Updates

### Når du tester

1. Update `API_OPTIMIZATION_STATUS.md` med:
   - Test status (✅/⏳/❌)
   - Metrics collected
   - Issues found

1. Update `API_OPTIMIZATION_TEST_REPORT.md` med:
   - Actual results vs expected
   - Screenshots/logs
   - Recommendations

1. Create new docs hvis nødvendigt:
   - Performance metrics analysis
   - Specific issue reports
   - Optimization recommendations

## 🧪 Continuous Testing

### Automated Checks (Future)

```bash
# Run linting
pnpm check

# Run tests (hvis tests eksisterer)
pnpm test

# Type check
pnpm tsc --noEmit

```text

### Manual Testing Routine

1. **Daily:** Quick smoke tests (5 min)
1. **Weekly:** Full test suite (30-60 min)
1. **Pre-Deploy:** Complete validation

## 🔍 Monitoring Setup

### Development Monitoring

```javascript
// Browser console
window.__requestQueue?.getQueueSize();
window.__requestQueue?.isRateLimited();

// React DevTools
// Inspect component state for adaptive polling

```text

### Metrics to Track

- API call frequency
- Cache hit rates
- Rate limit occurrences
- Polling interval changes
- Error rates

## 🚨 Troubleshooting

### Issue: Branch conflicts

**Symptom:** Merge conflicts med email-tab branch

**Solution:**

```bash
git fetch origin
git rebase origin/email-tab-development-branch
# Resolve conflicts
git rebase --continue

````

### Issue: Tests fail

**Symptom:** Features virker ikke som forventet

**Steps:**

1. Check console for errors
1. Verify all dependencies installed
1. Check branch is up-to-date
1. Review implementation notes

### Issue: Performance ikke forbedret

**Symptom:** Metrics viser ingen forbedring

**Investigation:**

1. Verify features er aktiveret
1. Check Network tab for API calls
1. Monitor cache hit rates
1. Review polling intervals

## 📚 Related Resources

- **Quick Start:** `QUICK_START_OTHER_CHATS.md`
- **Test Guide:** `API_OPTIMIZATION_QUICK_TEST.md`
- **Technical Docs:** `API_OPTIMIZATION_IMPLEMENTATION_NOTES.md`

---

**Last Updated:** ${new Date().toISOString().split('T')[0]}
**Maintained By:** Development Team
