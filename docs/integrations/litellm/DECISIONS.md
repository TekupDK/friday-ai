# LiteLLM Integration - Technical Decisions

**Version:** 1.0.0  
**Date:** November 9, 2025  
**Status:** Approved for Implementation  

---

## 📋 Executive Summary

This document records the key technical decisions for integrating LiteLLM as Friday AI's unified LLM gateway. All decisions prioritize **zero cost increase** (maintaining $0.00/month) while improving reliability and maintainability.

---

## 🎯 Decision 1: Why LiteLLM?

### Problem Statement
Friday AI currently uses direct API calls to OpenRouter with:
- ❌ No automatic retry logic
- ❌ No fallback between providers
- ❌ No circuit breaker pattern
- ❌ No centralized metrics/monitoring
- ❌ Manual provider failover (via env vars)

### Decision
**Adopt LiteLLM as unified LLM gateway**

### Rationale
1. **Zero Cost** - Self-hosted, open source ($0.00/month)
2. **Provider Flexibility** - Easy to switch between FREE models
3. **Automatic Fallback** - Built-in retry/fallback logic
4. **Battle-Tested** - Used by 100+ companies in production
5. **OpenAI Compatible** - Drop-in replacement for existing code
6. **Monitoring Built-in** - Metrics, logging, health checks

### Alternatives Considered

#### Option A: Build Custom Gateway
- **Pros:** Full control, tailored to needs
- **Cons:** 2-3 weeks development, ongoing maintenance
- **Verdict:** ❌ Too much effort for uncertain ROI

#### Option B: Use Multiple Direct API Calls
- **Pros:** Simple, no new dependencies
- **Cons:** Complex error handling, no unified metrics
- **Verdict:** ❌ Doesn't solve core problems

#### Option C: Use Vercel AI SDK
- **Pros:** Modern, TypeScript-first
- **Cons:** Opinionated, less flexibility for free models
- **Verdict:** ❌ Not optimized for FREE OpenRouter models

#### Option D: LiteLLM (CHOSEN) ✅
- **Pros:** All benefits above, zero cost, battle-tested
- **Cons:** Extra layer (minimal latency ~5-10ms)
- **Verdict:** ✅ Best fit for Friday AI's needs

---

## 🎯 Decision 2: FREE Models Only

### Problem Statement
We need provider diversity but cannot increase costs beyond $0.00/month.

### Decision
**Use ONLY FREE OpenRouter models in fallback cascade**

### Rationale
1. **Cost Constraint** - Friday AI budget: $0.00/month for LLM
2. **5+ FREE Options** - OpenRouter has excellent FREE tier
3. **Quality Maintained** - GLM-4.5 Air has "100% Accuracy" rating
4. **Danish Support** - Current model (GLM-4.5) supports Danish well

### Provider Cascade (All FREE!)
```yaml
1. glm-4.5-air:free          ($0.00) - Primary (current)
2. deepseek-chat-v3.1:free   ($0.00) - Fallback 1 (coding)
3. minimax-m2:free           ($0.00) - Fallback 2 (fast)
4. kimi-k2:free              ($0.00) - Fallback 3 (long context)
5. qwen3-coder:free          ($0.00) - Fallback 4 (code tasks)
```

**Total Cost:** $0.00/month 🎉

### Alternatives Considered
- **Paid fallbacks** (Claude, GPT-4): ❌ Budget violation
- **Local models** (Ollama): ❌ Already used for dev, not reliable for prod
- **Single provider**: ❌ No fallback (current problem)

---

## 🎯 Decision 3: Wrapper Pattern (No Breaking Changes)

### Problem Statement
6-10 files use `invokeLLM()`. How to migrate without breaking existing code?

### Decision
**Implement wrapper pattern with same function signature**

### Rationale
1. **Zero Breaking Changes** - Existing code works unchanged
2. **Gradual Migration** - Can update one file at a time
3. **Easy Rollback** - Just change import path
4. **Test Compatibility** - All tests pass without modification

### Implementation
```typescript
// OLD: server/_core/llm.ts
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult>

// NEW: server/integrations/litellm/client.ts  
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  // Same signature - routes through LiteLLM proxy
  return litellmClient.chatCompletion(params);
}

// Migration: Just change import!
// OLD: import { invokeLLM } from '@/server/_core/llm';
// NEW: import { invokeLLM } from '@/server/integrations/litellm';
```

### Alternatives Considered
- **Direct replacement**: ❌ High risk, all-or-nothing
- **New function name**: ❌ Requires updating all calls
- **Feature toggle**: ⚠️ Complex, but will use for rollout

---

## 🎯 Decision 4: Feature Flag Rollout

### Problem Statement
How to safely deploy LiteLLM to production without big-bang release?

### Decision
**Use existing feature flag system for gradual rollout**

### Rationale
1. **Risk Mitigation** - Can quickly disable if issues
2. **User-Based Testing** - Consistent experience per user
3. **Easy Monitoring** - Track metrics by flag state
4. **Already Built** - Feature flags exist in codebase

### Rollout Plan
```typescript
// Phase 1: 0% - Testing only
LITELLM_ENABLED=false (force for specific users)

// Phase 2: 10% - Early adopters
LITELLM_ROLLOUT_PERCENTAGE=10

// Phase 3: 50% - Half of users
LITELLM_ROLLOUT_PERCENTAGE=50

// Phase 4: 100% - Everyone
LITELLM_ROLLOUT_PERCENTAGE=100
```

### Feature Flag Implementation
```typescript
// server/_core/feature-flags.ts
export interface FeatureFlags {
  enableLiteLLM: boolean;
  litellmRolloutPercentage: number;
}

// Usage in code:
if (featureFlags.enableLiteLLM) {
  return litellmClient.chatCompletion(params);
} else {
  return originalInvokeLLM(params);
}
```

### Alternatives Considered
- **Blue-Green Deployment**: ❌ Overkill for this change
- **Canary Deployment**: ⚠️ Similar to feature flags, more complex
- **Direct cutover**: ❌ Too risky

---

## 🎯 Decision 5: Self-Hosted LiteLLM Proxy

### Problem Statement
Run LiteLLM as SaaS (hosted) or self-hosted?

### Decision
**Self-host LiteLLM proxy alongside Friday AI**

### Rationale
1. **Zero Cost** - No SaaS fees
2. **Data Privacy** - All requests stay in our infrastructure
3. **Full Control** - Can customize config, no rate limits
4. **Low Latency** - Localhost connection (~1-2ms)

### Deployment Options

#### Development
```yaml
# Docker Compose (local)
services:
  litellm:
    image: ghcr.io/berriai/litellm:main-stable
    ports:
      - "4000:4000"
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
```

#### Production
```yaml
# Same Docker Compose (server)
# Or: Kubernetes sidecar pattern
# Or: Separate service in same VPC
```

### Alternatives Considered
- **LiteLLM Cloud**: ❌ Costs $50-200/month
- **Vercel AI SDK**: ❌ No self-hosted proxy option
- **Build custom proxy**: ❌ Reinventing the wheel

---

## 🎯 Decision 6: Monitoring & Metrics

### Problem Statement
How to track LiteLLM performance and reliability?

### Decision
**Use LiteLLM's built-in metrics + custom Friday AI tracking**

### Rationale
1. **Built-in Metrics** - LiteLLM provides /metrics endpoint
2. **Existing Infrastructure** - Friday AI has analytics system
3. **Cost Tracking** - Even at $0.00, track usage
4. **Error Detection** - Quick identification of issues

### Metrics to Track
```typescript
interface LiteLLMMetrics {
  // Request metrics
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  p95Latency: number;
  
  // Provider metrics
  primarySuccess: number;      // GLM-4.5 success rate
  fallbackRate: number;        // How often we use fallback
  providerHealth: Record<string, 'healthy' | 'degraded'>;
  
  // Cost metrics (even at $0)
  totalTokens: number;
  tokensPerRequest: number;
  
  // Error metrics
  errorRate: number;
  errorsByType: Record<string, number>;
}
```

### Monitoring Endpoints
```
GET /health              - LiteLLM health check
GET /health/providers    - Per-provider status
GET /metrics            - Prometheus metrics
GET /api/litellm/stats  - Friday AI custom stats
```

---

## 🎯 Decision 7: File Structure

### Problem Statement
Where to place LiteLLM integration code?

### Decision
**Create dedicated `server/integrations/litellm/` directory**

### Rationale
1. **Clear Separation** - Integration code isolated
2. **Easy to Find** - Clear naming convention
3. **Maintainable** - Small, focused files
4. **Testable** - Easy to mock/test independently

### Structure
```
server/integrations/litellm/
├── config/
│   ├── litellm.config.yaml     (50 lines)
│   └── providers.config.ts     (80 lines)
├── client.ts                   (100 lines)
├── types.ts                    (80 lines)
├── errors.ts                   (60 lines)
├── fallback/
│   ├── strategy.ts             (120 lines)
│   ├── retry.ts                (80 lines)
│   └── circuit-breaker.ts      (100 lines)
├── monitoring/
│   ├── metrics.ts              (100 lines)
│   └── logger.ts               (80 lines)
└── index.ts                    (30 lines - exports)

Total: ~880 lines (well-organized)
```

### Alternatives Considered
- **Flat structure**: ❌ Would exceed 200 lines per file
- **Within _core**: ❌ Would mix concerns
- **Separate npm package**: ❌ Overkill for now

---

## 🎯 Decision 8: Testing Strategy

### Problem Statement
How to ensure LiteLLM integration works correctly?

### Decision
**Multi-layered testing: Unit, Integration, E2E, and Manual**

### Rationale
1. **Coverage >80%** - High confidence in code
2. **Fast Feedback** - Unit tests run in seconds
3. **Real Scenarios** - E2E tests with actual providers
4. **Safety Net** - Catch issues before production

### Test Layers

#### 1. Unit Tests (Vitest)
```typescript
// tests/integrations/litellm/client.test.ts
describe('LiteLLMClient', () => {
  it('should format requests correctly', () => {});
  it('should handle timeouts', () => {});
  it('should retry on failure', () => {});
});
```

#### 2. Integration Tests (Vitest + Mock Server)
```typescript
// tests/integrations/litellm/integration.test.ts
describe('LiteLLM Integration', () => {
  it('should fallback to secondary provider', () => {});
  it('should activate circuit breaker', () => {});
});
```

#### 3. E2E Tests (Playwright)
```typescript
// tests/litellm-e2e.spec.ts
test('AI chat with LiteLLM', async ({ page }) => {
  // Test full flow with real LiteLLM proxy
});
```

#### 4. Manual Testing
- Test with all FREE models
- Verify fallback behavior
- Check error messages
- Monitor metrics

### Test Coverage Target
- Unit tests: >90%
- Integration tests: >80%
- E2E tests: Critical paths only
- Overall: >80%

---

## 🎯 Decision 9: Documentation Standards

### Problem Statement
How to document LiteLLM integration for team?

### Decision
**Comprehensive docs in `docs/integrations/litellm/`**

### Rationale
1. **Team Onboarding** - New devs can understand quickly
2. **Troubleshooting** - Common issues documented
3. **Operations** - Clear deployment/monitoring guides
4. **Future Reference** - Decisions recorded (this doc!)

### Documentation Structure
```
docs/integrations/litellm/
├── ARCHITECTURE.md         ✅ System design
├── DECISIONS.md           ✅ This document
├── MIGRATION_PLAN.md      ✅ Step-by-step guide
├── SETUP.md               🔜 Setup instructions
├── API.md                 🔜 API reference
├── MONITORING.md          🔜 Monitoring guide
├── TROUBLESHOOTING.md     🔜 Common issues
└── FRIDAY_AI_CURRENT_STATE.md ✅ Current analysis
```

### Documentation Standards
- ✅ Clear headings with emoji
- ✅ Code examples included
- ✅ Decision rationale explained
- ✅ Links to external resources
- ✅ Keep updated as system evolves

---

## 🎯 Decision 10: Rollback Plan

### Problem Statement
What if LiteLLM integration causes issues?

### Decision
**Multi-level rollback strategy**

### Rollback Levels

#### Level 1: Feature Flag (30 seconds)
```bash
# Disable for all users immediately
LITELLM_ROLLOUT_PERCENTAGE=0

# Or force disable
FORCE_DIRECT_OPENROUTER=true
```

#### Level 2: Code Rollback (5 minutes)
```typescript
// Change imports back to original
import { invokeLLM } from '@/server/_core/llm';
// (was: from '@/server/integrations/litellm')

# Restart server
pnpm dev
```

#### Level 3: Docker Rollback (10 minutes)
```bash
# Stop LiteLLM container
docker-compose stop litellm

# Friday AI automatically falls back to direct calls
```

#### Level 4: Git Revert (15 minutes)
```bash
git revert <commit-hash>
git push
# Redeploy
```

### Rollback Decision Criteria
- Error rate >10%
- Latency increase >500ms
- User complaints >5
- Provider failures >50%
- Any data loss/corruption

---

## 📊 Risk Assessment

### High Risk ❌
None identified - wrapper pattern is low risk

### Medium Risk ⚠️
1. **Latency Increase** 
   - Risk: +5-10ms per request
   - Mitigation: Localhost deployment, monitor metrics
   
2. **New Dependency**
   - Risk: LiteLLM bugs/breaking changes
   - Mitigation: Use stable release, pin version

3. **Configuration Complexity**
   - Risk: Misconfigured providers
   - Mitigation: Extensive testing, clear docs

### Low Risk ✅
1. **Breaking Changes**
   - Risk: LOW - wrapper pattern maintains compatibility
   
2. **Cost Increase**
   - Risk: ZERO - only FREE models
   
3. **Rollback Difficulty**
   - Risk: LOW - multiple rollback options

---

## ✅ Success Criteria

### Must Have (P0)
- [x] Uses ONLY FREE OpenRouter models
- [ ] Zero cost increase ($0.00 → $0.00)
- [ ] No breaking changes to existing code
- [ ] Automatic fallback works
- [ ] Test coverage >80%
- [ ] Can rollback in <5 minutes

### Should Have (P1)
- [ ] Latency increase <10ms
- [ ] Uptime improvement (>99%)
- [ ] Metrics dashboard functional
- [ ] Documentation complete

### Nice to Have (P2)
- [ ] Advanced monitoring (Grafana)
- [ ] A/B testing framework
- [ ] Model performance comparison

---

## 📅 Timeline

### Phase 1: Planning (COMPLETE) ✅
- Architecture design
- Technical decisions
- Migration planning
**Status:** DONE

### Phase 2: Implementation (Week 1)
- Install LiteLLM
- Configure providers
- Create wrapper
- Write tests
**Estimate:** 5 days

### Phase 3: Testing (Week 1-2)
- Unit tests
- Integration tests
- E2E tests
- Manual verification
**Estimate:** 3 days

### Phase 4: Rollout (Week 2-3)
- 0% (testing)
- 10% (early adopters)
- 50% (half users)
- 100% (everyone)
**Estimate:** 1 week

**Total Timeline:** 2-3 weeks

---

## 🔍 Review & Approval

### Decision Authority
- **Technical Lead:** Approved ✅
- **Dev Team:** Reviewed ✅
- **Operations:** Consulted ✅

### Next Steps
1. ✅ Review this document
2. 🔜 Proceed with MIGRATION_PLAN.md
3. 🔜 Start implementation (Task 1.2)

---

**Document Status:** ✅ APPROVED  
**Ready for Implementation:** ✅ YES  
**Risk Level:** LOW  
**Estimated Impact:** HIGH (better reliability)  
**Cost Impact:** ZERO ($0.00)  

**Last Updated:** November 9, 2025  
**Next Review:** After Phase 2 completion  
