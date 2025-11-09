# LiteLLM Integration Addendum - Model Router System

**Version:** 1.0.0  
**Date:** November 9, 2025  
**Status:** CRITICAL SUPPLEMENT  
**Priority:** Must Read Before Implementation  

---

## 🚨 KRITISK OPDAGELSE

Under dyb analyse af kodebasen blev der opdaget et **avanceret model routing system** som IKKE var inkluderet i den originale plan. Dette system er **KRITISK** for LiteLLM integration!

---

## 📊 Model Router System (`server/model-router.ts`)

### Core Functionality

Friday AI har ALLEREDE et intelligent routing system:

```typescript
// server/model-router.ts (271 linjer)

export type AIModel = 
  | "glm-4.5-air-free"        // Primary (100% accuracy)
  | "gpt-oss-20b-free"        // Fast analysis
  | "deepseek-chat-v3.1-free" // Coding
  | "minimax-m2-free"         // Fast
  | "qwen3-coder-free"        // Code specialist
  | "kimi-k2-free"            // Long context (200K)
  | "gemma-3-27b-free";       // Legacy

export type TaskType =
  | "chat"
  | "email-draft"
  | "email-analysis"
  | "invoice-create"
  | "calendar-check"
  | "calendar-create"
  | "lead-analysis"
  | "data-analysis"
  | "code-generation"
  | "complex-reasoning";
```

### Intelligent Model Selection

**Model routing matrix** mapper task types til optimale modeller:

```typescript
const MODEL_ROUTING_MATRIX: Record<TaskType, ModelRoutingConfig> = {
  chat: {
    primary: "glm-4.5-air-free",
    fallbacks: ["gpt-oss-20b-free", "gemma-3-27b-free"],
    reasoning: "100% accuracy, excellent Danish",
    costLevel: "free",
  },
  
  "code-generation": {
    primary: "qwen3-coder-free",
    fallbacks: ["deepseek-chat-v3.1-free", "claude-3-haiku"],
    reasoning: "Specialized code model",
    costLevel: "free",
  },
  
  "email-draft": {
    primary: "glm-4.5-air-free",
    fallbacks: ["gpt-oss-20b-free", "claude-3-haiku"],
    reasoning: "Professional writing",
    costLevel: "free",
  },
  // ... 7 more task types
};
```

### `invokeLLMWithRouting()` - Wrapper Funktion

**DETTE ER NØGLEN:**

```typescript
export async function invokeLLMWithRouting(
  taskType: TaskType,
  messages: any[],
  options: {
    userId?: number;
    stream?: boolean;
    forceModel?: AIModel;
    maxRetries?: number;
  } = {}
) {
  const { userId, stream = false, forceModel, maxRetries = 2 } = options;
  const flags = getFeatureFlags(userId);
  
  // Select model based on task type
  const model = selectModel(taskType, userId, forceModel);
  const config = getModelConfig(taskType);
  
  // Try primary model
  try {
    if (stream) {
      return await streamResponse(messages);
    } else {
      return await invokeLLM({ messages });
    }
  } catch (error) {
    // Try fallbacks
    for (const fallbackModel of config.fallbacks) {
      try {
        return await invokeLLM({ messages, model: fallbackModel });
      } catch (fallbackError) {
        // Continue to next fallback
      }
    }
    throw error; // All fallbacks failed
  }
}
```

---

## 🔍 AI Router System (`server/ai-router.ts`)

### Main Entry Point

```typescript
// server/ai-router.ts - Main routing logic

export async function routeAI(options: AIRouterOptions) {
  const { messages, taskType, userId, model } = options;
  const flags = getFeatureFlags(userId);
  
  // Parse intent from message
  const intent = parseIntent(lastMessage);
  const actionResult = await executeAction(intent);
  
  let response;
  
  if (flags.enableModelRouting && !explicitModel) {
    // Use new model routing system with fallbacks
    response = await invokeLLMWithRouting(taskType, finalMessages, {
      userId,
      stream: false,
      maxRetries: 2,
    });
  } else {
    // Use legacy LLM invocation
    response = await invokeLLM({
      messages: finalMessages,
      model: selectedModel,
    });
  }
  
  return response;
}
```

**Dette betyder:**
- Nogle calls går gennem `invokeLLMWithRouting()`
- Andre går direkte til `invokeLLM()`
- Feature flag: `enableModelRouting` styrer dette

---

## 📋 KOMPLET Liste af Filer

### Gruppe 1: Direct `invokeLLM()` (8 filer)
```
1. server/_core/llm.ts                    (DEFINITION)
2. server/docs/ai/analyzer.ts             (2 calls)
3. server/ai-email-summary.ts             (1 call)
4. server/ai-label-suggestions.ts         (1 call)
5. server/title-generator.ts              (1 call)
6. server/customer-router.ts              (1 call)
7. server/ai-router.ts                    (1 call, MAIN)
8. server/model-router.ts                 (1 call, ROUTING)
```

### Gruppe 2: Via `invokeLLMWithRouting()` (indirect)
```
1. server/ai-router.ts                    (calls routing)
2. server/_core/streaming.ts              (uses routing)
```

### Gruppe 3: `streamResponse()` (3 filer)
```
1. server/_core/streaming.ts
2. server/routers/chat-streaming.ts
3. server/model-router.ts
```

---

## 🎯 OPDATERET INTEGRATION STRATEGI

### Original Plan (Ikke Optimal)
```typescript
// Wrapper på invokeLLM level
export async function invokeLLM(params) {
  if (enableLiteLLM) {
    return litellmClient.chatCompletion(params);
  }
  return originalInvokeLLM(params);
}
```
**Problem:** Bypasser model router logic! ❌

### BEDRE Plan (Respekterer Model Router)

#### Option A: Integration i Model Router 🎯 (ANBEFALET)

```typescript
// server/model-router.ts

export async function invokeLLMWithRouting(
  taskType: TaskType,
  messages: any[],
  options: { userId, stream, maxRetries }
) {
  const model = selectModel(taskType, userId);
  const config = getModelConfig(taskType);
  
  if (ENV.enableLiteLLM) {
    // LiteLLM håndterer fallback automatisk
    return litellmClient.chatCompletion({
      model: mapToLiteLLMModel(model),
      messages,
      fallbacks: config.fallbacks.map(mapToLiteLLMModel),
      maxRetries: options.maxRetries || 2,
    });
  }
  
  // Original fallback logic
  try {
    return await invokeLLM({ messages, model });
  } catch (error) {
    for (const fallback of config.fallbacks) {
      try {
        return await invokeLLM({ messages, model: fallback });
      } catch {}
    }
    throw error;
  }
}
```

**Fordele:**
- ✅ Respekterer task-based routing
- ✅ Bevar intelligent model selection
- ✅ LiteLLM håndterer fallback
- ✅ Single integration point

#### Option B: Dual Layer (Mere Kompleks)

```typescript
// Layer 1: LiteLLM wrapper
export async function invokeLLM(params) {
  if (enableLiteLLM) {
    return litellmClient.chatCompletion(params);
  }
  return originalInvokeLLM(params);
}

// Layer 2: Model router (unchanged)
export async function invokeLLMWithRouting(...) {
  // Uses invokeLLM internally
  // Routing logic preserved
}
```

**Fordele:**
- ✅ Minimal code changes
- ✅ Both paths get LiteLLM

**Ulemper:**
- ⚠️ Duplicate fallback logic
- ⚠️ More complex debugging

---

## 🔧 Model Mapping

Friday AI bruger OpenRouter model IDs. LiteLLM skal mappe disse:

```typescript
// server/integrations/litellm/model-mappings.ts

export function mapToLiteLLMModel(fridayModel: AIModel): string {
  const mapping: Record<AIModel, string> = {
    // Friday AI navn → LiteLLM format
    "glm-4.5-air-free": "openrouter/z-ai/glm-4.5-air:free",
    "deepseek-chat-v3.1-free": "openrouter/deepseek/deepseek-chat-v3.1:free",
    "minimax-m2-free": "openrouter/minimax/minimax-m2:free",
    "qwen3-coder-free": "openrouter/qwen/qwen3-coder:free",
    "kimi-k2-free": "openrouter/moonshotai/kimi-k2:free",
    "gpt-oss-20b-free": "openrouter/openai/gpt-oss-20b:free",
    "gemma-3-27b-free": "openrouter/google/gemma-3-27b-it:free",
  };
  
  return mapping[fridayModel] || mapping["glm-4.5-air-free"];
}
```

---

## 📊 Environment Variables - Allerede Implementeret!

Friday AI har ALLEREDE rollout system:

```bash
# .env.dev (EXISTING!)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
OPENROUTER_ROLLOUT_PERCENTAGE=100  # 0-100
FORCE_OPENROUTER=false

# Feature flags (EXISTING!)
enableOpenRouterModels=true
enableModelRouting=true
```

**LiteLLM skal tilføje:**
```bash
# New for LiteLLM
ENABLE_LITELLM=false
LITELLM_BASE_URL=http://localhost:4000
LITELLM_ROLLOUT_PERCENTAGE=0
```

---

## 🎯 OPDATERET MIGRATION STRATEGI

### Phase 1: Setup (Unchanged)
- Install LiteLLM
- Configure FREE models
- Create Docker setup

### Phase 2: Integration (UPDATED!)

**Task 2.1: Model Mapping Module**
```typescript
// NEW FILE: server/integrations/litellm/model-mappings.ts
export function mapToLiteLLMModel(model: AIModel): string;
export function mapToFridayModel(litellmModel: string): AIModel;
```

**Task 2.2: Integration i Model Router** (CRITICAL!)
```typescript
// MODIFY: server/model-router.ts

export async function invokeLLMWithRouting(...) {
  if (ENV.enableLiteLLM) {
    // Route through LiteLLM with task-based config
    const model = selectModel(taskType);
    const config = getModelConfig(taskType);
    
    return litellmClient.chatCompletion({
      model: mapToLiteLLMModel(model),
      messages,
      fallbacks: config.fallbacks.map(mapToLiteLLMModel),
    });
  }
  
  // Original logic
}
```

**Task 2.3: Fallback Wrapper (Backup)**
```typescript
// MODIFY: server/_core/llm.ts (as backup)

export async function invokeLLM(params: InvokeParams) {
  if (ENV.enableLiteLLM && !calledFromRouter) {
    return litellmClient.chatCompletion(params);
  }
  
  // Original implementation
}
```

### Phase 3: Testing (UPDATED!)

**Test Matrix:**
```
1. Direct invokeLLM() calls → LiteLLM
2. invokeLLMWithRouting() calls → LiteLLM with routing
3. Task-based routing → Correct model selection
4. Fallback logic → Works with LiteLLM
5. Feature flags → Gradual rollout
```

---

## ✅ KRITISKE TAKEAWAYS

### 1. Model Router ER Friday AI's Hjerte
- **10 task types** med optimerede modeller
- **Automatisk fallback** allerede implementeret
- **Feature flag kontrol** allerede på plads

### 2. To Integration Points
- **Primary:** `invokeLLMWithRouting()` i model-router.ts
- **Backup:** `invokeLLM()` i _core/llm.ts

### 3. Eksisterende Rollout System
- **OPENROUTER_ROLLOUT_PERCENTAGE** allerede fungerer
- **enableModelRouting** feature flag eksisterer
- Kan genbruge samme pattern til LiteLLM

### 4. Model Mapping Påkrævet
- Friday AI: `"glm-4.5-air-free"`
- LiteLLM: `"openrouter/z-ai/glm-4.5-air:free"`
- Mapping layer nødvendig

---

## 📝 OPDATEREDE FILER TIL MIGRATION

### Must Modify (3 filer)
```
1. server/model-router.ts              - KRITISK! Main integration point
2. server/_core/llm.ts                 - Backup wrapper
3. server/integrations/litellm/model-mappings.ts - NEW! Mapping
```

### Should Review (5 filer)
```
4. server/ai-router.ts                 - Uses routing
5. server/_core/streaming.ts           - Streaming logic
6. server/title-generator.ts           - Direct calls
7. server/customer-router.ts           - Direct calls
8. server/ai-label-suggestions.ts      - Direct calls
```

### Auto-Covered via Router (2 filer)
```
9. server/docs/ai/analyzer.ts          - Via routing
10. server/ai-email-summary.ts         - Via routing
```

---

## 🚀 ANBEFALING

### Strategi: **Respekt Model Router** ✅

**Fordele:**
- ✅ Minimal disruption
- ✅ Bevar intelligent routing
- ✅ Single integration point
- ✅ Easier testing
- ✅ Cleaner code

**Implementation:**
1. Integrer LiteLLM i `invokeLLMWithRouting()`
2. Tilføj model mapping layer
3. Test med alle task types
4. Gradual rollout via feature flag

**Timeline:** +1 dag til original plan (total 6 dage)

---

## 📊 IMPACT ASSESSMENT

### Original Plan Impact
- **Files to change:** 6-8
- **Integration complexity:** Medium
- **Risk:** Medium

### Updated Plan Impact  
- **Files to change:** 3-5 (færre!)
- **Integration complexity:** Low-Medium
- **Risk:** Low (respects existing architecture)

---

## ✅ NEXT STEPS

1. **Review** denne addendum med team
2. **Update** MIGRATION_PLAN.md med model router tasks
3. **Create** model-mappings.ts specification
4. **Test** task-based routing lokalt
5. **Proceed** med updated plan

---

**Status:** ✅ CRITICAL INFORMATION ADDED  
**Impact:** HIGH - Changes migration approach  
**Action Required:** Review & approve updated strategy  
**Timeline Impact:** +1 day (6 days total for Phase 1)  

**Last Updated:** November 9, 2025  
**Author:** Friday AI Implementation Team  
