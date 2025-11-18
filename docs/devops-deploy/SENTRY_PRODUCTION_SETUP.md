# Sentry Production Setup Guide

**Date:** January 28, 2025  
**Purpose:** Guide for setting up Sentry error tracking in production

---

## Overview

This guide covers setting up Sentry error tracking for production deployment of Friday AI Chat.

---

## Prerequisites

- ✅ Sentry organization created (tekup-r5)
- ✅ Development projects created (friday-ai-server, friday-ai-client)
- ✅ Development environment configured and tested

---

## Step 1: Production Environment Variables

### Option A: Use Same Projects (Quick Setup)

Add Sentry variables to `.env.prod`:

```bash
# ============================================
# Sentry Error Tracking (Production)
# ============================================

# Server Project (friday-ai-server)
SENTRY_DSN=https://38abb6a712137ee472f8ee6215dc7b37@o4510243450388480.ingest.de.sentry.io/4510383150727248
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1

# Client Project (friday-ai-client)
VITE_SENTRY_DSN=https://12339bf53c39de932596de72504d2c1f@o4510243450388480.ingest.de.sentry.io/4510383153610832
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

**Quick Setup Script:**

```powershell
.\scripts\add-sentry-env-prod.ps1
```

### Option B: Create Separate Production Projects (Recommended)

**Benefits:**

- ✅ Separate error tracking for dev vs prod
- ✅ Better organization
- ✅ Independent alert rules
- ✅ Production-specific settings

**Steps:**

1. **Create Production Projects in Sentry:**
   - Go to https://sentry.io/organizations/tekup-r5/projects/
   - Click "Create Project"
   - Create `friday-ai-server-prod` (Node.js)
   - Create `friday-ai-client-prod` (React)

2. **Get Production DSNs:**
   - Go to Project Settings → Client Keys (DSN)
   - Copy DSN for each project

3. **Update .env.prod:**
   ```bash
   # Use production DSNs instead of development DSNs
   SENTRY_DSN=https://[production-server-dsn]
   VITE_SENTRY_DSN=https://[production-client-dsn]
   ```

---

## Step 2: Configure Production Alerts

### Recommended Alert Rules

1. **Critical Errors Alert**
   - **Trigger:** An issue is created
   - **Condition:** When there are more than 10 occurrences in 1 minute
   - **Action:** Email + Slack notification
   - **Priority:** High

2. **Error Spike Alert**
   - **Trigger:** An issue is created
   - **Condition:** When there are more than 50 occurrences in 5 minutes
   - **Action:** Email notification
   - **Priority:** Medium

3. **New Issue Alert**
   - **Trigger:** An issue is created
   - **Condition:** Any new issue
   - **Action:** Email notification (daily digest)
   - **Priority:** Low

### Setup Instructions

1. **Go to Sentry Dashboard:**
   - Navigate to your production project
   - Go to **Settings → Alerts**

2. **Create Alert Rule:**
   - Click "Create Alert Rule"
   - Configure trigger, condition, and action
   - Save alert

3. **Configure Notifications:**
   - Go to **Settings → Notifications**
   - Add email addresses
   - Configure Slack integration (optional)

---

## Step 3: Production Configuration

### Sample Rate

**Recommended:**

- **Development:** 0.1 (10% of transactions)
- **Production:** 0.1 (10% of transactions) or 0.05 (5% for high traffic)

**Update in .env.prod:**

```bash
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% sampling
# or
SENTRY_TRACES_SAMPLE_RATE=0.05  # 5% sampling for high traffic
```

### Environment Tagging

Sentry automatically tags errors with environment. Ensure `NODE_ENV=production` is set in production.

---

## Step 4: Verify Production Setup

### After Deployment

1. **Check Server Logs:**

   ```
   [Sentry] Error tracking initialized
   ```

2. **Test Error Tracking:**
   - Trigger a test error in production
   - Verify error appears in Sentry dashboard
   - Check that environment is tagged as "production"

3. **Verify Alerts:**
   - Trigger test alert
   - Verify email/Slack notification received

---

## Step 5: Monitoring Best Practices

### Daily Checks

- ✅ Review new issues in Sentry dashboard
- ✅ Check error trends
- ✅ Review performance metrics

### Weekly Reviews

- ✅ Analyze error patterns
- ✅ Identify recurring issues
- ✅ Review alert effectiveness
- ✅ Update alert rules if needed

### Monthly Reviews

- ✅ Review error trends
- ✅ Optimize sample rates if needed
- ✅ Update documentation
- ✅ Review alert configuration

---

## Troubleshooting

### Sentry Not Initializing in Production

**Check:**

- ✅ `SENTRY_ENABLED=true` (string, not boolean)
- ✅ DSN is correct (no extra spaces)
- ✅ Environment variables are loaded correctly
- ✅ Server logs for initialization message

### Errors Not Appearing

**Check:**

- ✅ DSN is correct
- ✅ Network connectivity to Sentry
- ✅ Environment matches (production)
- ✅ Sample rate is not too low
- ✅ Sentry project settings

### Alerts Not Firing

**Check:**

- ✅ Alert rules are configured correctly
- ✅ Notification channels are set up
- ✅ Email addresses are verified
- ✅ Alert conditions are met

---

## Security Considerations

### DSN Security

- ✅ **Never commit** `.env.prod` to version control
- ✅ Use environment variables in deployment platform
- ✅ Rotate DSNs if compromised
- ✅ Use separate projects for different environments

### Data Privacy

- ✅ Review Sentry data retention settings
- ✅ Configure PII scrubbing if needed
- ✅ Review what data is sent to Sentry
- ✅ Comply with GDPR/data protection regulations

---

## Links

- **Sentry Dashboard:** https://sentry.io/organizations/tekup-r5/
- **Server Project (Dev):** https://sentry.io/organizations/tekup-r5/projects/friday-ai-server/
- **Client Project (Dev):** https://sentry.io/organizations/tekup-r5/projects/friday-ai-client/
- **Documentation:** https://docs.sentry.io/

---

## Related Documentation

- `docs/devops-deploy/SENTRY_SETUP.md` - Complete setup guide
- `docs/devops-deploy/SENTRY_ENV_SETUP.md` - Environment variables guide
- `docs/devops-deploy/SENTRY_COMPLETE.md` - Completion checklist
- `docs/testing/SENTRY_VALIDATION_REPORT.md` - Validation report

---

**Last Updated:** January 28, 2025
