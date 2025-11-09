# Friday AI - Current LLM State Analysis

**Analyzed:** November 9, 2025  
**Files Reviewed:** `server/_core/llm.ts`, `env.ts`, `model-mappings.ts`  

---

## 🔍 CURRENT IMPLEMENTATION

### Primary LLM Function
**File:** `server/_core/llm.ts` (582 lines)

**Core Functions:**
```typescript
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult>
export async function* streamResponse(messages, params): AsyncGenerator<string>
```

### Current Provider Hierarchy
```
1. OpenRouter (Primary)
   └─ Model: z-ai/glm-4.5-air:free (GLM-4.5 Air FREE)
   └─ API: https://openrouter.ai/api/v1/chat/completions
   └─ Key: process.env.OPENROUTER_API_KEY

2. Ollama (Fallback - Local Dev)
   └─ Model: gemma3:9b  
   └─ API: {OLLAMA_BASE_URL}/api/chat
   └─ Used when: OpenRouter key missing

3. Gemini (Fallback)
   └─ API: Google Generative Language API
   └─ Key: process.env.GEMINI_API_KEY

4. OpenAI (Final Fallback)
   └─ Model: gpt-4o-mini
   └─ Key: process.env.OPENAI_API_KEY
```

---

## 📊 FREE MODELS AVAILABLE

Friday AI har **7 FREE OpenRouter modeller** konfigureret:

### Tier 1: 100% Accuracy FREE Models
```typescript
"glm-4.5-air-free": "z-ai/glm-4.5-air:free"        // PRIMARY
"gpt-oss-20b-free": "openai/gpt-oss-20b:free"      
"deepseek-chat-v3.1-free": "deepseek/deepseek-chat-v3.1:free"
"minimax-m2-free": "minimax/minimax-m2:free"
"qwen3-coder-free": "qwen/qwen3-coder:free"
"kimi-k2-free": "moonshotai/kimi-k2:free"
```

### Tier 2: Legacy FREE Model
```typescript
"gemma-3-27b-free": "google/gemma-3-27b-it:free"
```

### Model Metadata (from model-mappings.ts)
```typescript
"glm-4.5-air-free": {
  displayName: "GLM-4.5 Air",
  provider: "Z-AI",
  accuracy: "100%",
  specialization: "General purpose, Danish support",
  contextWindow: 128000,
  costTier: "free"
}
```

---

## 🏗️ CURRENT ARCHITECTURE

### Direct API Calls
```typescript
// Current flow (llm.ts:419-432)
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "authorization": `Bearer ${ENV.openRouterApiKey}`,
    "HTTP-Referer": "https://tekup.dk",
    "X-Title": "Friday AI",
    "content-type": "application/json"
  },
  body: JSON.stringify({
    model: ENV.openRouterModel, // "z-ai/glm-4.5-air:free"
    messages: messages.map(normalizeMessage),
    max_tokens: 32768,
    tools: tools,
    response_format: responseFormat
  })
});
```

### No Retry/Fallback Logic
- ❌ Single provider per request
- ❌ No automatic retry
- ❌ No circuit breaker
- ❌ No load balancing
- ❌ No cost tracking
- ❌ Manual fallback only (via env vars)

---

## 🎯 WHERE LITELLM FITS IN

### Replace invokeLLM() Flow
```
BEFORE:
Friday AI → OpenRouter API directly

AFTER:
Friday AI → LiteLLM Proxy → OpenRouter FREE models (with fallback)
```

### Keep Using Same FREE Models
```yaml
# LiteLLM Config will use:
- z-ai/glm-4.5-air:free          (Primary - Current)
- deepseek/deepseek-chat-v3.1:free (Fallback 1)
- minimax/minimax-m2:free          (Fallback 2)
- qwen/qwen3-coder:free            (Fallback 3)
- moonshotai/kimi-k2:free          (Fallback 4)
```

### Benefits
✅ Automatic fallback between FREE models
✅ Retry logic with exponential backoff
✅ Circuit breaker prevents cascading failures
✅ Cost tracking ($0.00 but track usage)
✅ Metrics & monitoring
✅ Still 100% FREE! ($0.00/month)

---

## 📍 FILES USING invokeLLM()

### Core AI Features
```
server/ai-email-summary.ts          - Email AI summaries
server/ai-label-suggestions.ts      - Smart label suggestions  
server/ai-metrics.ts                - AI usage metrics
server/docs/ai/analyzer.ts          - Friday Docs analyzer
server/docs/ai/auto-create.ts       - Friday Docs generator
server/routers/chat-streaming.ts    - Chat streaming
```

### All Need Migration
**Estimated:** ~6-10 files to update
**Pattern:** Replace `invokeLLM()` with `litellm.chatCompletion()`

---

## 🔧 INTEGRATION STRATEGY

### Phase 1: Wrapper Layer (Non-Breaking)
```typescript
// server/integrations/litellm/client.ts
export async function invokeLLM(params: InvokeParams) {
  // Route through LiteLLM proxy
  return litellmClient.chatCompletion(params);
}

// Keep same signature - drop-in replacement!
```

### Phase 2: Gradual Migration
```typescript
// Old code works unchanged:
import { invokeLLM } from '@/server/_core/llm';

// New code uses LiteLLM:
import { invokeLLM } from '@/server/integrations/litellm';
```

### Phase 3: Feature Flag Rollout
```typescript
if (featureFlags.useLiteLLM) {
  return litellmClient.chatCompletion(params);
} else {
  return originalInvokeLLM(params);
}
```

---

## 💰 COST IMPACT

### Current Cost
```
OpenRouter FREE: $0.00/month
No fallback cost
Total: $0.00/month
```

### With LiteLLM
```
OpenRouter FREE models only: $0.00/month
LiteLLM Proxy: $0.00 (self-hosted)
Total: $0.00/month

STILL FREE! 🎉
```

---

## 🎯 LITELLM CONFIGURATION

### Updated Provider Cascade (All FREE!)
```yaml
model_list:
  # Primary - Current model
  - model_name: glm-4.5-air
    litellm_params:
      model: openrouter/z-ai/glm-4.5-air:free
      api_key: os.environ/OPENROUTER_API_KEY
    model_info:
      mode: chat
      supports_function_calling: true
      supports_vision: false

  # Fallback 1 - DeepSeek (coding/reasoning)
  - model_name: deepseek-chat
    litellm_params:
      model: openrouter/deepseek/deepseek-chat-v3.1:free
      api_key: os.environ/OPENROUTER_API_KEY

  # Fallback 2 - MiniMax (fast general purpose)
  - model_name: minimax-m2
    litellm_params:
      model: openrouter/minimax/minimax-m2:free
      api_key: os.environ/OPENROUTER_API_KEY

  # Fallback 3 - Qwen Coder (code-specific)
  - model_name: qwen-coder
    litellm_params:
      model: openrouter/qwen/qwen3-coder:free
      api_key: os.environ/OPENROUTER_API_KEY

  # Fallback 4 - Kimi K2 (long context)
  - model_name: kimi-k2
    litellm_params:
      model: openrouter/moonshotai/kimi-k2:free
      api_key: os.environ/OPENROUTER_API_KEY

router_settings:
  routing_strategy: fallback  # Try in order
  retry_after: 0.5
  allowed_fails: 2
  cooldown_time: 60
```

---

## 📋 MIGRATION CHECKLIST

### Environment Variables (Already Set)
- [x] OPENROUTER_API_KEY (existing)
- [x] OPENROUTER_MODEL (existing)
- [ ] LITELLM_MASTER_KEY (new - optional)

### Code Changes Needed
- [ ] Install LiteLLM proxy
- [ ] Create wrapper client
- [ ] Update invokeLLM() calls (6-10 files)
- [ ] Update streamResponse() calls
- [ ] Add monitoring/metrics
- [ ] Add feature flag
- [ ] Test all AI features

### Files to Update
```
server/_core/llm.ts                 - Core wrapper
server/ai-email-summary.ts          - Email AI
server/ai-label-suggestions.ts      - Labels
server/docs/ai/analyzer.ts          - Docs analyzer
server/docs/ai/auto-create.ts       - Docs generator  
server/routers/chat-streaming.ts    - Chat
```

---

## ✅ SUCCESS CRITERIA

### Must Have
- [x] Uses same FREE OpenRouter models
- [ ] Automatic fallback works
- [ ] No cost increase ($0.00 → $0.00)
- [ ] All existing features work
- [ ] Better reliability (>99% uptime)

### Nice to Have
- [ ] Metrics dashboard
- [ ] Cost tracking (even at $0)
- [ ] Error rate monitoring
- [ ] Performance improvements

---

## 🚀 NEXT STEPS

### Recommended Approach
1. **Keep it simple** - Wrapper pattern
2. **No breaking changes** - Same function signatures
3. **Gradual rollout** - Feature flag controlled
4. **Test thoroughly** - All AI features
5. **Monitor closely** - Metrics & alerts

### Timeline
- **Day 1**: Setup LiteLLM proxy locally
- **Day 2**: Create wrapper layer
- **Day 3**: Migrate 1-2 features (test)
- **Day 4**: Migrate remaining features
- **Day 5**: Deploy & monitor

---

**Analysis Complete:** ✅  
**Ready for Implementation:** ✅  
**Cost Impact:** $0.00 (no change)  
**Risk Level:** LOW (wrapper pattern)  
