# LiteLLM Migration Plan - Step by Step

**Version:** 1.0.0
**Date:** November 9, 2025
**Timeline:** 2-3 weeks
**Status:** Ready for Execution

---

## 📋 Overview

Detailed step-by-step migration plan for integrating LiteLLM into Friday AI with:

- ✅ Zero breaking changes (wrapper pattern)
- ✅ Gradual rollout (0% → 10% → 50% → 100%)
- ✅ Zero cost increase ($0.00/month)
- ✅ Easy rollback (multiple levels)

---

## 🎯 WEEK 1: Implementation & Testing

### Day 1: Setup & Configuration

**Morning (3h): Install & Configure**

1. Install LiteLLM

```bash
pip install 'litellm[proxy]'
litellm --version

```bash

1. Create docker-compose.litellm.yml
1. Create litellm.config.yaml with FREE models
1. Test: `docker-compose up`

**Afternoon (4h): Type System**

1. Create types.ts (80 lines)
1. Create errors.ts (60 lines)
1. Create constants.ts (40 lines)
1. Create client.ts (100 lines)

**Deliverables:**

- [ ] LiteLLM running locally
- [ ] Config with 5 FREE models
- [ ] Type definitions complete

---

### Day 2: Wrapper Implementation

**Morning (3h): Core Wrapper**

1. Create index.ts with invokeLLM() wrapper
1. Update server/\_core/env.ts (add ENABLE_LITELLM)
1. Update feature-flags.ts (add litellm flags)

**Afternoon (4h): Monitoring & Tests**

1. Create monitoring/metrics.ts (100 lines)
1. Create monitoring/logger.ts (80 lines)
1. Write unit tests (150 lines)

**Deliverables:**

- [ ] Wrapper maintains backward compatibility
- [ ] Feature flags ready
- [ ] Tests pass

---

### Day 3: Local Testing

**Full Day (6h): Integration Testing**

1. Start LiteLLM: `docker-compose up`
1. Test health: `curl localhost:4000/health`
1. Test direct API calls
1. Enable in Friday AI: `ENABLE_LITELLM=true`
1. Test all features:
   - Chat
   - Friday Docs generation
   - Email AI
1. Performance test (100 concurrent requests)
1. Document results

**Deliverables:**

- [ ] All features work with LiteLLM
- [ ] Performance acceptable
- [ ] No critical issues

---

### Day 4: Migration

**Full Day (7h): Update Imports**

Update 6-10 files:

```typescript
// OLD:
import { invokeLLM } from "@/server/_core/llm";

// NEW:
import { invokeLLM } from "@/server/integrations/litellm";

```bash

Files to update:

- server/docs/ai/analyzer.ts
- server/docs/ai/auto-create.ts
- server/ai-email-summary.ts
- server/ai-label-suggestions.ts
- server/routers/chat-streaming.ts
- (any others using invokeLLM)

**Deliverables:**

- [ ] All imports updated
- [ ] No TypeScript errors
- [ ] E2E tests pass

---

### Day 5: Documentation & Staging

**Morning (3h): Complete Docs**

1. SETUP.md (installation guide)
1. API.md (API reference)
1. TROUBLESHOOTING.md (common issues)

**Afternoon (4h): Deploy to Staging**

1. Build: `pnpm build`
1. Deploy LiteLLM to staging server
1. Deploy Friday AI to staging
1. 24h monitoring

**Deliverables:**

- [ ] All docs complete
- [ ] Staging deployment successful
- [ ] 24h monitoring clean

---

## 🚀 WEEK 2-3: Production Rollout

### Week 2, Mon-Tue: 10% Rollout

```bash
# Production .env
LITELLM_ROLLOUT_PERCENTAGE=10

```text

- Monitor for 48h
- Track metrics
- Fix any issues

**Success Criteria:**

- [ ] Error rate same or lower
- [ ] Latency acceptable
- [ ] No user complaints

---

### Week 2, Wed-Fri: 50% Rollout

```bash
LITELLM_ROLLOUT_PERCENTAGE=50

```text

- Monitor for 48h
- Compare with 10% metrics

**Success Criteria:**

- [ ] Metrics consistent
- [ ] Performance stable

---

### Week 3, Mon-Tue: 100% Rollout

```bash
LITELLM_ROLLOUT_PERCENTAGE=100

```text

- All users on LiteLLM
- Monitor closely for 48h

**Success Criteria:**

- [ ] All users migrated
- [ ] No issues detected
- [ ] Cost still $0.00

---

### Week 3, Wed-Fri: Verification

1. Final metrics review
1. Team retrospective
1. Update docs
1. Mark complete

---

## 📊 Monitoring Checklist

### Daily Checks

- [ ] Error rate
- [ ] Latency (p50, p95, p99)
- [ ] Fallback rate
- [ ] Provider health
- [ ] User feedback

### Weekly Checks

- [ ] Cost (should be $0.00)
- [ ] Usage patterns
- [ ] Performance trends
- [ ] Team feedback

---

## 🚨 Rollback Procedures

### Level 1: Feature Flag (30 seconds)

```bash
LITELLM_ROLLOUT_PERCENTAGE=0

```text

### Level 2: Code Rollback (5 min)

```typescript
// Revert imports to original
import { invokeLLM } from "@/server/_core/llm";

```text

### Level 3: Stop LiteLLM (10 min)

```bash
docker-compose stop litellm

```bash

### Level 4: Git Revert (15 min)

```bash
git revert <commit>
git push

```

---

## ✅ Final Success Criteria

### Must Have (P0)

- [ ] Uses ONLY FREE OpenRouter models
- [ ] Zero cost increase ($0.00)
- [ ] No breaking changes
- [ ] Automatic fallback works
- [ ] Can rollback in <5 min
- [ ] Test coverage >80%

### Should Have (P1)

- [ ] Latency increase <10ms
- [ ] Error rate same or lower
- [ ] Metrics dashboard functional
- [ ] Documentation complete

### Nice to Have (P2)

- [ ] Advanced monitoring
- [ ] A/B testing framework
- [ ] Performance improvements

---

## 📝 File Checklist

### Implementation Files

- [ ] server/integrations/litellm/config/litellm.config.yaml
- [ ] server/integrations/litellm/docker/docker-compose.litellm.yml
- [ ] server/integrations/litellm/types.ts
- [ ] server/integrations/litellm/errors.ts
- [ ] server/integrations/litellm/constants.ts
- [ ] server/integrations/litellm/client.ts
- [ ] server/integrations/litellm/index.ts
- [ ] server/integrations/litellm/monitoring/metrics.ts
- [ ] server/integrations/litellm/monitoring/logger.ts

### Test Files

- [ ] tests/integrations/litellm/client.test.ts
- [ ] tests/integrations/litellm/integration.test.ts
- [ ] tests/integrations/litellm/e2e.test.ts

### Documentation Files

- [x] docs/integrations/litellm/ARCHITECTURE.md
- [x] docs/integrations/litellm/DECISIONS.md
- [x] docs/integrations/litellm/MIGRATION_PLAN.md
- [ ] docs/integrations/litellm/SETUP.md
- [ ] docs/integrations/litellm/API.md
- [ ] docs/integrations/litellm/TROUBLESHOOTING.md

---

**Status:** ✅ READY TO START
**Next Action:** Day 1, Task 1.1 - Install LiteLLM
**Estimated Completion:** 2-3 weeks
**Risk Level:** LOW
**Cost Impact:** $0.00
