# LiteLLM Integration Architecture

**Version:** 1.0.0  
**Status:** Design Phase  
**Author:** Friday AI Team  
**Date:** November 9, 2025

---

## 🎯 Overview

LiteLLM serves as our unified AI gateway, providing:

- Single interface to multiple LLM providers
- Automatic failover and retry logic
- Cost tracking and monitoring
- Load balancing across providers
- Rate limiting and quota management

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Friday AI Application                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              LiteLLM Proxy Gateway (Port 4000)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Request Router & Load Balancer             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Fallback Strategy & Circuit Breaker Pattern       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Cost Tracking & Metrics Collection          │   │
│  └──────────────────────────────────────────────────────┘   │
└┌──────────────┬────────────┬────────────┬───────────────────┘
               │            │            │
               │ ALL FREE OPENROUTER MODELS ($0.00!)
               │            │            │
┌──────────────▼────┐ ┌────▼──────┐ ┌──▼────────┐ ┌─▼─────────┐
│  DeepSeek Chat    │ │ GLM-4.5   │ │ Mistral  │ │  Llama    │
│  (Primary)        │ │(Fallback1)│ │(Fallback2)│ │(Fallback3)│
│  $0.00 FREE ✅    │ │$0.00 FREE│ │$0.00 FREE│ │$0.00 FREE │
└───────────────────┘ └───────────┘ └──────────┘ └───────────┘
```

---

## 📂 File Structure

```
server/integrations/litellm/
├── config/
│   ├── litellm.config.yaml     # LiteLLM proxy config
│   └── providers.config.ts     # Provider settings
├── docker/
│   └── docker-compose.litellm.yml
├── client.ts                   # LiteLLM client wrapper
├── types.ts                    # TypeScript types
├── errors.ts                   # Custom error classes
├── constants.ts                # Constants & defaults
├── fallback/
│   ├── strategy.ts             # Fallback cascade logic
│   ├── retry.ts                # Retry mechanism
│   └── circuit-breaker.ts      # Circuit breaker pattern
├── adapters/
│   └── openrouter-adapter.ts   # OpenRouter response normalization
├── monitoring/
│   ├── metrics.ts              # Metrics collection
│   ├── logger.ts               # Structured logging
│   └── health.ts               # Health checks
└── index.ts                    # Main exports

docs/integrations/litellm/
├── ARCHITECTURE.md             # This file
├── DECISIONS.md                # Technical decisions
├── MIGRATION_PLAN.md           # Migration strategy
├── SETUP.md                    # Setup guide
├── API.md                      # API reference
├── MONITORING.md               # Monitoring guide
└── TROUBLESHOOTING.md          # Common issues
```

---

## 🔄 Request Flow

### Happy Path (Primary Provider Success)

```
1. Friday AI → LiteLLM Client
   ├─ model: "gpt-4o"
   ├─ messages: [...]
   └─ fallback: ["claude-3-opus", "gpt-3.5-turbo"]

2. LiteLLM Client → LiteLLM Proxy (localhost:4000)
   └─ POST /chat/completions

3. LiteLLM Proxy → OpenRouter (Primary)
   └─ Uses glm-4.5-air:free model

4. OpenRouter → LiteLLM Proxy
   └─ Success response

5. LiteLLM Proxy → LiteLLM Client
   └─ Normalized response

6. LiteLLM Client → Friday AI
   └─ Success ✅
```

### Fallback Path (Primary Fails)

```
1. Friday AI → LiteLLM Client
   └─ Same request

2. LiteLLM Proxy → OpenRouter DeepSeek (Primary)
   └─ ❌ Timeout / Rate Limit / Error

3. Circuit Breaker Activates
   └─ Mark DeepSeek as degraded

4. LiteLLM Proxy → OpenRouter GLM-4.5 (Fallback #1 FREE!)
   └─ Use GLM-4.5-air:free model

5. OpenRouter → LiteLLM Proxy
   └─ Success response

6. LiteLLM Client → Friday AI
   └─ Success ✅ (with fallback metadata)
   └─ Still $0.00 cost! 🎉
```

### All Providers Fail

```
1. Try all providers in cascade
2. Log detailed error information
3. Return graceful error to user
4. Metrics record failure
5. Alert if threshold exceeded
```

---

## 🔧 Core Components

### 1. LiteLLM Client (`client.ts`)

**Purpose:** Thin wrapper around LiteLLM proxy  
**Max Lines:** 100  
**Responsibilities:**

- HTTP requests to proxy
- Response normalization
- Basic error handling
- Request timeout management

```typescript
export class LiteLLMClient {
  async chatCompletion(params: ChatParams): Promise<ChatResponse> {
    // Simple HTTP call to proxy
    // Timeout: 30s
    // Retry: Handled by proxy
  }
}
```

### 2. Fallback Strategy (`fallback/strategy.ts`)

**Purpose:** Define provider cascade  
**Max Lines:** 120  
**Responsibilities:**

- Provider priority order
- Fallback decision logic
- Model mapping per provider
- Cost-aware routing

```typescript
export class FallbackStrategy {
  getProviderCascade(model: string): Provider[] {
    // Returns ordered list of providers to try
    // Based on: cost, availability, model support
  }
}
```

### 3. Circuit Breaker (`fallback/circuit-breaker.ts`)

**Purpose:** Prevent cascading failures  
**Max Lines:** 100  
**Responsibilities:**

- Track provider health
- Open/Close circuit based on errors
- Auto-recovery after timeout
- Metrics reporting

**States:**

- **CLOSED:** Normal operation
- **OPEN:** Provider marked as down
- **HALF_OPEN:** Testing recovery

### 4. Retry Logic (`fallback/retry.ts`)

**Purpose:** Smart retry with backoff  
**Max Lines:** 80  
**Responsibilities:**

- Exponential backoff
- Max 3 retries
- Different strategies per error type
- Metrics tracking

### 5. OpenRouter Adapter (`adapters/openrouter-adapter.ts`)

**Purpose:** Normalize OpenRouter responses  
**Max Lines:** 80  
**Responsibilities:**

- Convert OpenRouter format → Standard format
- Handle different FREE model quirks
- Ensure consistent response structure
- Map model-specific parameters

---

## 📊 Provider Configuration

### Primary: OpenRouter FREE - DeepSeek Chat

```yaml
- model_name: deepseek-chat
  litellm_params:
    model: openrouter/deepseek/deepseek-chat:free
    api_key: env/OPENROUTER_API_KEY
  model_info:
    cost_per_token: 0.0
    max_tokens: 8000
    supports_streaming: true
    quality: high
```

### Fallback 1: OpenRouter FREE - GLM-4.5 Air

```yaml
- model_name: glm-4.5-air
  litellm_params:
    model: openrouter/01-ai/yi-lightning:free
    api_key: env/OPENROUTER_API_KEY
  model_info:
    cost_per_token: 0.0
    max_tokens: 4096
    supports_streaming: true
    quality: medium-high
```

### Fallback 2: OpenRouter FREE - Mistral 7B

```yaml
- model_name: mistral-7b
  litellm_params:
    model: openrouter/mistralai/mistral-7b-instruct:free
    api_key: env/OPENROUTER_API_KEY
  model_info:
    cost_per_token: 0.0
    max_tokens: 8000
    supports_streaming: true
    quality: medium
```

### Fallback 3: OpenRouter FREE - Llama 3.2

```yaml
- model_name: llama-3.2
  litellm_params:
    model: openrouter/meta-llama/llama-3.2-3b-instruct:free
    api_key: env/OPENROUTER_API_KEY
  model_info:
    cost_per_token: 0.0
    max_tokens: 8000
    supports_streaming: true
    quality: medium
```

---

## 🎯 Design Principles

### 1. Single Responsibility

- Each file handles ONE concern
- Max 200 lines per file
- Clear module boundaries

### 2. Fail-Safe Defaults

- Always have fallback option
- Graceful degradation
- Never throw unhandled errors

### 3. Observable System

- Log all requests/responses
- Metrics for every operation
- Health checks at all levels

### 4. Type Safety

- Full TypeScript coverage
- No `any` types
- Comprehensive interfaces

### 5. Testability

- Each module independently testable
- Mock-friendly interfaces
- Clear dependencies

---

## 🔍 Monitoring Strategy

### Metrics to Track

```typescript
interface Metrics {
  // Request metrics
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;

  // Provider metrics
  providerRequests: Record<Provider, number>;
  providerErrors: Record<Provider, number>;
  fallbackRate: number;

  // Cost metrics
  totalCost: number;
  costPerRequest: number;

  // Error metrics
  errorRate: number;
  errorsByType: Record<ErrorType, number>;
}
```

### Health Checks

- `/health` - Overall system health
- `/health/providers` - Per-provider status
- `/health/circuit-breakers` - Circuit breaker states

### Alerts

- Error rate > 10%
- Fallback rate > 50%
- Any provider down > 5 min
- Response time > 10s

---

## 🚀 Deployment Architecture

### Development

```
Friday AI Dev → LiteLLM Local (Docker) → Providers
```

### Staging

```
Friday AI Staging → LiteLLM Staging (K8s) → Providers
```

### Production

```
Friday AI Prod → LiteLLM Prod (K8s + Redis) → Providers
  ├─ Pod 1 (Active)
  ├─ Pod 2 (Active)
  └─ Redis (Shared state)
```

---

## 📈 Scalability Considerations

### Current Scale (Phase 1)

- Single Docker container
- 100 req/min expected
- Local state (no Redis needed)
- Simple health checks

### Future Scale (Phase 2+)

- Multiple instances (K8s)
- 1000+ req/min
- Shared state (Redis)
- Advanced monitoring (Prometheus/Grafana)
- Auto-scaling based on load

---

## 🔒 Security Considerations

### API Key Management

- Never hardcode keys
- Use environment variables
- Rotate keys quarterly
- Different keys per environment

### Request Validation

- Validate all inputs (Zod)
- Sanitize user content
- Rate limiting per user
- Request size limits

### Response Handling

- Never expose provider errors directly
- Sanitize error messages
- Log sensitive data separately
- GDPR compliance

---

## ⚡ Performance Targets

### Response Times

- **p50:** < 1s
- **p95:** < 3s
- **p99:** < 5s
- **Timeout:** 30s

### Availability

- **Uptime:** 99.9%
- **Max downtime:** 43 min/month
- **MTTR:** < 5 min

### Throughput

- **Current:** 100 req/min
- **Target:** 1000 req/min
- **Peak:** 2000 req/min

---

## 🔄 Migration Strategy

### Phase 1: Setup (Week 1, Day 1-2)

1. Install LiteLLM
2. Configure providers
3. Test locally
4. Document setup

### Phase 2: Integration (Week 1, Day 3)

1. Create client wrapper
2. Implement fallback
3. Add monitoring
4. Write tests

### Phase 3: Migration (Week 1, Day 4)

1. Update Friday Docs AI calls
2. Test with staging data
3. Monitor metrics
4. Fix issues

### Phase 4: Rollout (Week 1, Day 5)

1. Deploy to staging
2. 24h monitoring
3. Production deployment
4. Gradual rollout (10% → 100%)

---

## ✅ Success Criteria

### Phase 1 Complete When:

- [ ] LiteLLM running locally
- [ ] All providers configured
- [ ] Fallback logic working
- [ ] Health checks passing
- [ ] Metrics being collected
- [ ] Tests passing (>80% coverage)
- [ ] Documentation complete
- [ ] Team approved

### Production Ready When:

- [ ] Staging stable for 24h
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Runbook complete
- [ ] Team trained

---

## 📝 Next Steps

1. **Review this architecture** with team
2. **Create DECISIONS.md** (technical decisions)
3. **Create MIGRATION_PLAN.md** (detailed migration)
4. **Get approval** to proceed
5. **Start Task 1.2** (Environment Setup)

---

**Status:** ✅ Architecture Designed  
**Next:** Review & Approve  
**Estimated Time:** 30 min review
