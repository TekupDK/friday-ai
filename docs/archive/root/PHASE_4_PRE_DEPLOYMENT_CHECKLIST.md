# ✅ Phase 4 - Pre-Deployment Checklist

**Purpose:** Ensure all systems are ready before touching production  
**Status:** 📋 Planning Phase  
**Date:** November 8, 2025

---

## 🔍 Step 1: Code Review & Verification

### 1.1 Feature Flags System

**Verify Implementation:**

- [ ] `server/_core/feature-flags.ts` - Review rollout logic
- [ ] Percentage-based user selection works correctly
- [ ] Same user always gets same experience (consistent hashing)
- [ ] Environment variables are respected
- [ ] Fallback to Gemma 3 27B when disabled

**Test Cases to Verify:**

```typescript
// Test 1: 0% rollout - no users should get OpenRouter
getFeatureFlags(1).enableOpenRouterModels; // Should be false
getFeatureFlags(100).enableOpenRouterModels; // Should be false

// Test 2: 10% rollout - ~10% should get OpenRouter
// Users 0-9 should get it (10%)
// Users 10-99 should NOT get it (90%)

// Test 3: 100% rollout - everyone gets OpenRouter
getFeatureFlags(1).enableOpenRouterModels; // Should be true
getFeatureFlags(100).enableOpenRouterModels; // Should be true

// Test 4: Force enable works
FORCE_OPENROUTER = true;
getFeatureFlags(1).enableOpenRouterModels; // Should be true
```

**Questions to Answer:**

- [ ] Hvad sker der hvis OPENROUTER_ROLLOUT_PERCENTAGE ikke er sat?
- [ ] Hvad sker der hvis environment variable er ugyldig (f.eks. "abc")?
- [ ] Kan feature flags ændres uden server restart?
- [ ] Logger vi hvilken model hver user får?

---

### 1.2 Metrics System

**Verify Implementation:**

- [ ] `server/ai-metrics.ts` - Review metric tracking
- [ ] Metrics stored in memory (10k limit)
- [ ] Old metrics cleaned up correctly
- [ ] Performance calculations are correct (P50, P95, P99)
- [ ] Health thresholds make sense

**Data Structure Check:**

```typescript
interface AIMetric {
  timestamp: Date;         // ✓ Timestamp for time-based queries
  userId?: number;         // ✓ Optional for anonymous requests
  modelId: string;         // ✓ Which model was used
  taskType: string;        // ✓ What was it doing
  responseTime: number;    // ✓ How long it took
  success: boolean;        // ✓ Did it work
  errorMessage?: string;   // ✓ What went wrong
  tokenUsage?: {...};      // ✓ Usage tracking
}
```

**Questions to Answer:**

- [ ] Hvad sker der når memory bliver fuld (10k metrics)?
- [ ] Bliver gamle metrics slettet korrekt?
- [ ] Kan vi query metrics fra før server restart?
- [ ] Skal vi gemme metrics i database senere?
- [ ] Hvad med privacy - logger vi bruger data korrekt?

---

### 1.3 Model Router Integration

**Verify Implementation:**

- [ ] `server/model-router.ts` - Check integration
- [ ] selectModel() respects feature flags
- [ ] Fallback to Gemma 3 works
- [ ] Metrics tracked on every request
- [ ] Error handling with retries

**Flow to Verify:**

```
User Request
  ↓
getFeatureFlags(userId)
  ↓
enableOpenRouterModels?
  ├─ Yes → Use GLM/GPT-OSS (based on task)
  └─ No  → Use Gemma 3 27B (fallback)
  ↓
Track metric (start timer)
  ↓
Invoke LLM
  ↓
Track metric (end timer, success/fail)
  ↓
Return response
```

**Questions to Answer:**

- [ ] Hvad hvis både OpenRouter OG Gemma 3 fejler?
- [ ] Tracker vi fallback events?
- [ ] Logger vi når vi skipper til Gemma 3?
- [ ] Kan vi se forskel på "disabled" vs "failed over"?

---

## 🔧 Step 2: Environment Configuration

### 2.1 Development Environment

**Current .env.dev:**

```bash
OPENROUTER_API_KEY=sk-or-v1-6f45d089...  # ✓ Verified working
OPENROUTER_MODEL=z-ai/glm-4.5-air:free    # ✓ Best model
OPENROUTER_ROLLOUT_PERCENTAGE=100         # For local testing
FORCE_OPENROUTER=false                    # Normal behavior
```

**Verify:**

- [ ] API key er gyldig og virker
- [ ] Model ID er korrekt formateret
- [ ] Alle nødvendige environment variables er sat
- [ ] Database connection virker
- [ ] Google API credentials er korrekte

**Action Items:**

- [ ] Test at server starter uden fejl
- [ ] Test at AI requests virker
- [ ] Verificer at Gemma 3 fallback virker hvis OpenRouter fejler

---

### 2.2 Staging Environment

**Required Configuration:**

```bash
# Staging should use 100% rollout for full testing
OPENROUTER_ROLLOUT_PERCENTAGE=100
FORCE_OPENROUTER=false

# Same API key as dev (or separate if preferred)
OPENROUTER_API_KEY=sk-or-v1-...

# Database
DATABASE_URL=postgresql://...staging...

# Other services (staging versions)
GOOGLE_SERVICE_ACCOUNT_KEY=./google-staging.json
BILLY_API_KEY=staging-key
```

**Verify:**

- [ ] Staging database eksisterer og er accessible
- [ ] API keys er konfigureret (kan være dev keys)
- [ ] Deployment process er dokumenteret
- [ ] Kan rulles tilbage hvis nødvendigt

**Questions:**

- [ ] Har vi en staging server?
- [ ] Kan vi deploye til staging uden at påvirke production?
- [ ] Har staging adgang til samme services (Google, Billy)?
- [ ] Skal staging bruge test API keys eller production?

---

### 2.3 Production Environment

**Initial Configuration:**

```bash
# CRITICAL: Start with 0% rollout
OPENROUTER_ROLLOUT_PERCENTAGE=0
FORCE_OPENROUTER=false

# Production API key
OPENROUTER_API_KEY=sk-or-v1-production-key

# Production database
DATABASE_URL=postgresql://...production...
```

**Security Checklist:**

- [ ] Production API keys er forskellige fra dev
- [ ] Environment variables er ikke commited til git
- [ ] Secrets management system er på plads
- [ ] Backup af production database før deployment
- [ ] Rollback plan er klar

**Questions:**

- [ ] Hvem har adgang til production environment variables?
- [ ] Hvordan ændrer vi OPENROUTER_ROLLOUT_PERCENTAGE i production?
- [ ] Skal vi bruge en secrets manager (AWS Secrets, Azure Key Vault)?
- [ ] Er der rate limits vi skal være opmærksomme på?

---

## 📊 Step 3: Monitoring Setup

### 3.1 Metrics Dashboard

**Current State:**

- ✅ API endpoints for metrics
- ❓ Frontend dashboard UI
- ❓ Alerting system
- ❓ Log aggregation

**To Build/Verify:**

- [ ] Simple dashboard til at se metrics
- [ ] Kan vi se real-time metrics?
- [ ] Graphs for trends (error rate over tid)
- [ ] Alert system (email/Slack når error rate > 5%)

**Minimum Viable Monitoring:**

```typescript
// Option 1: Console logs (simplest)
setInterval(
  () => {
    logMetricsSummary();
  },
  5 * 60 * 1000
); // Every 5 minutes

// Option 2: API endpoint (better)
// Call /api/trpc/aiMetrics.getSummary periodically

// Option 3: Dashboard (best)
// Build simple React dashboard showing metrics
```

**Questions:**

- [ ] Skal vi bygge en admin dashboard først?
- [ ] Eller er API endpoints + manual checks nok?
- [ ] Skal vi integrere med eksisterende monitoring (Datadog, Sentry)?
- [ ] Hvem skal have adgang til metrics?

---

### 3.2 Alerting Strategy

**Critical Alerts (Immediate Action Required):**

```typescript
if (errorRate > 5% || avgResponseTime > 5000) {
  // Send alert via email/Slack
  // Consider automatic rollback
}
```

**Warning Alerts (Monitor Closely):**

```typescript
if (errorRate > 1% || avgResponseTime > 3000) {
  // Log warning
  // Don't proceed to next rollout phase
}
```

**Implementation Options:**

- [ ] **Option 1:** Email alerts (simplest)
- [ ] **Option 2:** Slack webhook (better)
- [ ] **Option 3:** PagerDuty/OpsGenie (production-grade)
- [ ] **Option 4:** SMS for critical (best for after-hours)

**Questions:**

- [ ] Hvem skal modtage alerts?
- [ ] Hvad er response time expectations? (24/7 vs business hours)
- [ ] Skal alerts være graduelle? (warning → critical)
- [ ] Test alert system inden deployment?

---

### 3.3 Logging Strategy

**What to Log:**

```typescript
// Feature flag decisions
"🔄 OpenRouter disabled (rollout: 10%), using Gemma 3 27B";

// Model selections
"🧠 Model Routing: Task=chat, Model=glm-4.5-air-free";

// Errors
"❌ [AI Metrics] Error: Model=gpt-oss-20b, Error=Rate limit";

// Performance
"⚠️ [AI Metrics] Slow response: 5200ms, Model=glm-4.5-air";
```

**Log Levels:**

- `INFO`: Normal operation (model selection, feature flags)
- `WARN`: Slow responses, degraded performance
- `ERROR`: Failed requests, errors

**Questions:**

- [ ] Hvor gemmes logs? (console, file, service)
- [ ] Hvad er log retention policy?
- [ ] Kan vi søge i logs?
- [ ] Er der PII i logs vi skal være opmærksomme på?

---

## 🧪 Step 4: Testing Strategy

### 4.1 Unit Tests

**Feature Flags:**

```typescript
describe("Feature Flags", () => {
  it("should enable OpenRouter for 10% of users at 10% rollout", () => {
    process.env.OPENROUTER_ROLLOUT_PERCENTAGE = "10";

    // Users 0-9 should get OpenRouter
    expect(getFeatureFlags(5).enableOpenRouterModels).toBe(true);

    // Users 10+ should NOT
    expect(getFeatureFlags(15).enableOpenRouterModels).toBe(false);
  });

  it("should be consistent per user", () => {
    const flags1 = getFeatureFlags(25);
    const flags2 = getFeatureFlags(25);
    expect(flags1.enableOpenRouterModels).toBe(flags2.enableOpenRouterModels);
  });
});
```

**Metrics:**

```typescript
describe("AI Metrics", () => {
  it("should track successful requests", () => {
    trackAIMetric({
      modelId: "glm-4.5-air-free",
      taskType: "chat",
      responseTime: 1000,
      success: true,
    });

    const summary = getMetricsSummary(60);
    expect(summary.successfulRequests).toBe(1);
  });

  it("should calculate percentiles correctly", () => {
    // Add multiple metrics
    // Verify P50, P95, P99 calculations
  });
});
```

**Action Items:**

- [ ] Skriv unit tests for feature flags
- [ ] Skriv unit tests for metrics
- [ ] Test edge cases (0%, 100%, invalid values)
- [ ] Test error handling

---

### 4.2 Integration Tests

**End-to-End Flow:**

```typescript
describe("OpenRouter Integration", () => {
  it("should route to correct model based on rollout", async () => {
    // Set 10% rollout
    process.env.OPENROUTER_ROLLOUT_PERCENTAGE = "10";

    // User in rollout (userId=5, 5% < 10%)
    const response1 = await invokeLLMWithRouting("chat", messages, {
      userId: 5,
    });
    // Should use GLM-4.5 Air

    // User NOT in rollout (userId=25, 25% > 10%)
    const response2 = await invokeLLMWithRouting("chat", messages, {
      userId: 25,
    });
    // Should use Gemma 3 27B
  });

  it("should track metrics on every request", async () => {
    const metricsBefore = getMetricsSummary(60);

    await invokeLLMWithRouting("chat", messages, { userId: 1 });

    const metricsAfter = getMetricsSummary(60);
    expect(metricsAfter.totalRequests).toBe(metricsBefore.totalRequests + 1);
  });
});
```

**Action Items:**

- [ ] Test feature flag + model router integration
- [ ] Test metrics tracking on real requests
- [ ] Test rollback scenario (0% rollout)
- [ ] Test error handling and fallbacks

---

### 4.3 Manual Testing Checklist

**Before Staging:**

- [ ] Start dev server with `FORCE_OPENROUTER=true`
- [ ] Test chat functionality (send Danish message)
- [ ] Test email drafting
- [ ] Test email analysis
- [ ] Check console logs for correct model selection
- [ ] Verify metrics are tracked (call API endpoint)
- [ ] Test with `OPENROUTER_ROLLOUT_PERCENTAGE=0` (should use Gemma 3)
- [ ] Test with `OPENROUTER_ROLLOUT_PERCENTAGE=50` (verify user distribution)

**On Staging:**

- [ ] Deploy to staging
- [ ] Verify server starts without errors
- [ ] Test all main features (chat, email, calendar)
- [ ] Check staging logs for any errors
- [ ] Call metrics API endpoints
- [ ] Verify response times are acceptable
- [ ] Test for 1 hour with real usage patterns
- [ ] Check for any memory leaks or performance issues

---

## 🚨 Step 5: Risk Assessment

### 5.1 What Can Go Wrong?

**High Risk (P0 - Could Break Production):**

1. **OpenRouter API Outage**
   - **Impact:** All AI requests fail
   - **Mitigation:** Automatic fallback to Gemma 3 27B
   - **Detection:** Error rate > 5%
   - **Response:** Automatic rollback to 0%

2. **Rate Limiting**
   - **Impact:** Requests fail with 429 errors
   - **Mitigation:** Retry logic, fallback to Gemma 3
   - **Detection:** Specific error messages in metrics
   - **Response:** Reduce rollout percentage

3. **Feature Flag Logic Error**
   - **Impact:** Wrong users get wrong models
   - **Mitigation:** Thorough testing, consistent hashing
   - **Detection:** User reports, metrics distribution
   - **Response:** Fix code, redeploy

4. **Metrics System Memory Leak**
   - **Impact:** Server crashes from memory overflow
   - **Mitigation:** 10k metric limit, old metric cleanup
   - **Detection:** Memory monitoring
   - **Response:** Restart server, fix leak

**Medium Risk (P1 - Degraded Experience):**

1. **Slow Response Times**
   - **Impact:** Users experience delays
   - **Mitigation:** Set timeouts, use faster model
   - **Detection:** P95 > 5s
   - **Response:** Optimize prompts, adjust model selection

2. **Inconsistent Quality**
   - **Impact:** Some users get worse responses
   - **Mitigation:** Test quality extensively before rollout
   - **Detection:** User feedback, support tickets
   - **Response:** Adjust model routing, improve prompts

3. **Cost Overruns**
   - **Impact:** Unexpected charges (unlikely with free tier)
   - **Mitigation:** Monitor usage, set up billing alerts
   - **Detection:** OpenRouter dashboard
   - **Response:** Investigate usage patterns

**Low Risk (P2 - Minor Issues):**

1. **Metrics Not Showing**
   - **Impact:** Can't monitor rollout properly
   - **Mitigation:** Fallback to server logs
   - **Detection:** API returns empty data
   - **Response:** Debug metrics system, use logs

2. **Feature Flag Cache Issues**
   - **Impact:** Changes don't take effect immediately
   - **Mitigation:** Document need for server restart
   - **Detection:** Wrong percentage after change
   - **Response:** Restart server

---

### 5.2 Rollback Scenarios

**Scenario 1: High Error Rate (>5%)**

```bash
# Immediate action
ssh production-server
nano .env
# Set: OPENROUTER_ROLLOUT_PERCENTAGE=0
pm2 restart friday-ai

# Verify
curl .../aiMetrics.getRolloutStatus
# Should show: { "currentPercentage": 0 }

# Investigate
tail -f logs/friday-ai.log | grep ERROR
# Find root cause
```

**Scenario 2: Slow Performance (P95 > 10s)**

```bash
# Option 1: Reduce rollout
OPENROUTER_ROLLOUT_PERCENTAGE=10  # From 50% to 10%

# Option 2: Switch to faster model
OPENROUTER_MODEL=openai/gpt-oss-20b:free  # Faster

# Option 3: Complete rollback
OPENROUTER_ROLLOUT_PERCENTAGE=0
```

**Scenario 3: User Complaints**

```bash
# Check metrics
curl .../aiMetrics.getSummary | jq

# If issues confirmed, rollback
OPENROUTER_ROLLOUT_PERCENTAGE=0

# Gather feedback
# Review what went wrong
# Fix issues before next attempt
```

---

## 📋 Step 6: Team Communication

### 6.1 Stakeholder Communication

**Before Deployment:**

- [ ] Notify team of upcoming deployment
- [ ] Share deployment timeline
- [ ] Identify on-call personnel
- [ ] Set up communication channels (Slack, email)

**Email Template:**

```
Subject: [Upcoming] OpenRouter AI Models Deployment - Phase 4

Team,

We're preparing to deploy new AI models (OpenRouter) to production.

Timeline:
- Staging: [DATE]
- 10% Production: [DATE]
- 50% Production: [DATE]
- 100% Production: [DATE]

Expected Impact:
- Faster AI responses (0.9s vs 5s)
- Better Danish language quality
- No cost increase ($0)

Monitoring:
- Metrics dashboard: [URL]
- On-call: [PERSON]
- Rollback plan: Ready

Please report any issues to [CHANNEL].

Thanks,
[YOUR NAME]
```

---

### 6.2 Support Team Briefing

**What Support Needs to Know:**

**User-Facing Changes:**

- ✅ Faster AI responses
- ✅ Better Danish quality
- ✅ Same features, improved performance

**Potential Issues:**

- ⚠️ Some users may notice different response style
- ⚠️ If issues occur, we can rollback quickly
- ⚠️ Not all users get new models immediately (gradual rollout)

**How to Report Issues:**

```
1. Gather info:
   - User ID
   - What they were doing (chat, email, etc.)
   - Error message or unexpected behavior
   - Timestamp

2. Check if user is in rollout:
   - Contact dev team with user ID
   - We can check if they got new models

3. Report in #engineering channel:
   - Include all gathered info
   - Tag @dev-team for visibility
```

---

## ✅ Final Pre-Deployment Checklist

### Code Ready

- [ ] All code reviewed and tested locally
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] No TypeScript errors
- [ ] No linting errors (or acknowledged as acceptable)
- [ ] Feature flags logic verified
- [ ] Metrics system verified
- [ ] Model router integration verified

### Environment Ready

- [ ] Dev environment configured and tested
- [ ] Staging environment configured
- [ ] Production environment variables prepared
- [ ] API keys verified and working
- [ ] Database access confirmed
- [ ] Secrets properly managed

### Monitoring Ready

- [ ] Metrics API endpoints working
- [ ] Logging configured
- [ ] Alert system configured (or manual monitoring plan)
- [ ] Dashboard access configured
- [ ] Team knows how to check metrics

### Documentation Ready

- [ ] Deployment guide complete
- [ ] Quick reference guide complete
- [ ] Rollback procedures documented
- [ ] Troubleshooting guide complete
- [ ] Team communication templates ready

### Team Ready

- [ ] Team briefed on deployment
- [ ] Support team briefed
- [ ] On-call person identified
- [ ] Communication channels set up
- [ ] Escalation path defined

### Contingency Plans Ready

- [ ] Rollback procedure tested
- [ ] Database backup plan
- [ ] Emergency contacts list
- [ ] Monitoring plan for each phase
- [ ] Decision criteria for proceed/hold/rollback

---

## 🎯 Go/No-Go Decision Criteria

**GO if:**

- ✅ All critical checklist items complete
- ✅ Code tested locally and on staging
- ✅ Team is ready and available
- ✅ Monitoring is functional
- ✅ Rollback plan is clear

**NO-GO if:**

- ❌ Critical bugs found in testing
- ❌ Monitoring not working
- ❌ Team not available for support
- ❌ Production issues currently ongoing
- ❌ Missing rollback procedure

---

## 📅 Recommended Timeline

**Week Before:**

- [ ] Complete all code and testing
- [ ] Brief team
- [ ] Set up monitoring
- [ ] Prepare all documentation

**Day Before:**

- [ ] Final code review
- [ ] Test on staging one more time
- [ ] Verify all environments
- [ ] Send team notification

**Day Of (Staging):**

- [ ] Deploy to staging morning
- [ ] Monitor for full day
- [ ] Fix any issues found
- [ ] Make go/no-go decision for production

**Next Week (Production):**

- [ ] Day 1: 10% rollout, monitor 48h
- [ ] Day 3: If healthy, 50% rollout, monitor 48h
- [ ] Day 5: If healthy, 100% rollout
- [ ] Week 2: Continue monitoring

---

**Status:** 📋 **READY FOR PLANNING REVIEW**

**Next Steps:**

1. Review this checklist with team
2. Answer all questions marked with [ ]
3. Complete all action items
4. Make go/no-go decision
5. Proceed to deployment when ready

---

**Last Updated:** November 8, 2025, 22:30  
**Version:** 1.0.0
