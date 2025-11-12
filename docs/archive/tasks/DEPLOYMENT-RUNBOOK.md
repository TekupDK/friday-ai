# 🚀 Deployment Runbook - Friday 3-Panel Workspace

## 📋 Pre-Deployment Checklist

- [ ] All tests passing (80%+ coverage)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Stakeholder approval received
- [ ] Rollback plan documented
- [ ] Communication sent to users

---

## 🔧 Environment Setup

### Production Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.friday.tekupdk.dk
ENABLE_3_PANEL=true
ENABLE_AI_MODES=false  # Gradual rollout
ENABLE_WORKFLOW=true
SENTRY_DSN=https://...
```

---

## 🚀 Deployment Steps

### Phase 1: Internal Testing (Uge 1)

```bash
# 1. Deploy to staging
npm run build
npm run deploy:staging

# 2. Enable for internal users only
ENABLE_3_PANEL=true (10 users via feature flag)

# 3. Monitor for 1 week
- Error rate < 0.1%
- Performance metrics green
- User feedback positive
```

### Phase 2: Beta Rollout (Uge 2)

```bash
# 1. Increase rollout to 25%
UPDATE feature_flags SET enabled_percentage = 25 WHERE flag = '3_panel_layout';

# 2. Monitor metrics
- Bundle size < 150KB initial
- Load time < 2s
- No critical errors

# 3. Collect feedback
- User surveys
- Support tickets
- Analytics data
```

### Phase 3: Full Release (Uge 3)

```bash
# 1. Deploy to 100%
UPDATE feature_flags SET enabled_percentage = 100 WHERE flag = '3_panel_layout';

# 2. Remove feature flags (after 1 week stable)
git checkout -b remove-old-2-panel
# Delete old 2-panel code
git push origin remove-old-2-panel

# 3. Monitor for regressions
- Error tracking (Sentry)
- Performance monitoring
- User analytics
```

---

## 🔄 Rollback Procedure

### Emergency Rollback (< 5 minutes)

```bash
# 1. Disable feature flag
UPDATE feature_flags SET enabled = false WHERE flag = '3_panel_layout';

# 2. Verify old 2-panel works
curl https://friday.tekupdk.dk/health
# Should return: { "layout": "2-panel", "status": "ok" }

# 3. Notify stakeholders
# Send alert: "Reverted to 2-panel layout due to [ISSUE]"
```

### Planned Rollback (Investigation needed)

```bash
# 1. Set feature flag to 0%
UPDATE feature_flags SET enabled_percentage = 0;

# 2. Deploy previous version
git checkout [PREVIOUS_TAG]
npm run build
npm run deploy:production

# 3. Post-mortem
- Identify root cause
- Document lessons learned
- Plan fix
```

---

## 📊 Monitoring & Alerts

### Key Metrics to Watch

```
Performance:
- Initial load time: < 2s (alert if > 3s)
- Panel switch time: < 100ms (alert if > 200ms)
- Bundle size: < 150KB (alert if > 200KB)

Errors:
- Error rate: < 0.1% (alert if > 0.5%)
- Panel crashes: 0 (alert on any)
- API failures: < 1% (alert if > 2%)

User Experience:
- Task completion rate: +25% target
- AI usage frequency: +50% target
- User satisfaction: +40% target
```

### Sentry Alerts

```javascript
// Configure in sentry.config.js
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
  release: "3-panel-v1.0",
  beforeSend(event) {
    // Filter noise
    if (event.exception?.values?.[0]?.type === "ChunkLoadError") {
      return null; // Ignore chunk load errors
    }
    return event;
  },
  tracesSampleRate: 0.1, // Sample 10% of transactions
});
```

---

## 📞 Support Runbook

### Common Issues & Fixes

**Issue: Panel won't load**

```
Symptom: Infinite loading skeleton
Cause: Bundle chunk failed to load
Fix: Hard refresh (Ctrl+Shift+R)
```

**Issue: Panel crashes**

```
Symptom: Error boundary shown
Cause: Component render error
Fix: Click "Retry" or reload page
```

**Issue: Slow panel switching**

```
Symptom: Mode switch takes > 1s
Cause: Not using persistent mounting
Fix: Deploy hotfix with persistent mounting
```

---

## ✅ Post-Deployment Verification

### Day 1 Checks

- [ ] All panels load correctly
- [ ] No console errors
- [ ] Performance metrics green
- [ ] Error rate < 0.1%
- [ ] User feedback monitored

### Week 1 Checks

- [ ] No critical bugs reported
- [ ] Performance stable
- [ ] User satisfaction positive
- [ ] Support tickets < baseline

### Week 4 Checks

- [ ] Remove feature flags
- [ ] Delete old code
- [ ] Update documentation
- [ ] Close project

---

## 🎯 Success Criteria

**Technical:**

- ✅ 0 critical bugs
- ✅ Performance targets met
- ✅ 80%+ test coverage maintained

**Business:**

- ✅ +30% email processing speed
- ✅ +50% AI usage
- ✅ +25% task completion
- ✅ +40% user satisfaction

---

## 📝 Deployment Log Template

```
Date: [YYYY-MM-DD]
Phase: [Internal/Beta/Full]
Deployed by: [Name]
Version: [git SHA]
Feature flag: [Percentage]

Pre-deployment checks:
- [ ] Tests passing
- [ ] Performance verified
- [ ] Security cleared

Post-deployment verification:
- [ ] All panels loading
- [ ] No errors in Sentry
- [ ] Metrics green

Issues encountered: [None/List]
Rollback needed: [Yes/No]
```

---

_Follow this runbook for safe, gradual deployment of 3-panel workspace system_
