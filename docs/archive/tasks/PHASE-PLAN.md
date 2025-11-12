# OpenRouter Models Integration - Phase Plan

## 📋 Oversigt

Integration af 6 nye free OpenRouter AI modeller med 100% accuracy ratings og evaluering af Friday AI systemet.

**Status:** 🟢 Phase 1-2 Complete | 🟡 Phase 3 In Progress

---

## ✅ Phase 1: Model Integration (COMPLETE)

**Mål:** Integrere nye OpenRouter modeller i systemet

### Completed Tasks:

- [x] Tilføj 6 nye modeller til `AIModel` type
  - GLM-4.5 Air (100% accuracy)
  - GPT-OSS 20B (100% accuracy)
  - DeepSeek Chat v3.1 (advanced reasoning)
  - MiniMax M2 (fast & efficient)
  - Qwen3 Coder (code specialist)
  - Kimi K2 (long context - 200K tokens)

- [x] Opdater `MODEL_ROUTING_MATRIX`
  - Chat → GLM-4.5 Air
  - Email drafting → GLM-4.5 Air
  - Email analysis → DeepSeek v3.1
  - Code generation → Qwen3 Coder
  - Complex reasoning → DeepSeek v3.1
  - Long context → Kimi K2

- [x] Opret model mapping fil (`model-mappings.ts`)
  - Internal names → OpenRouter IDs
  - Model metadata (context, pricing, capabilities)

- [x] Opdater environment filer
  - `.env` → GLM-4.5 Air som default
  - `.env.dev` → GLM-4.5 Air som default
  - `.env.prod.template` → Production config
  - Bevaret eksisterende API keys

- [x] Opdater client-side config
  - `ai-config.ts` → GLM-4.5 Air reference
  - `ai.ts` → Active model constant

**Deliverables:** ✅

- 6 nye modeller tilgængelige
- Task-based routing konfigureret
- Environment filer opdateret med nye defaults

---

## ✅ Phase 2: Evaluation Setup (COMPLETE)

**Mål:** Opsætte evaluation frameworks til testing

### Completed Tasks:

- [x] Promptfoo configuration (`ai-eval-config.yaml`)
  - 5 test providers konfigureret
  - 12 test prompts (dansk business context)
  - Automatisk sammenligning af modeller
  - Output til HTML rapport

- [x] DeepEval test suite (`tests/ai/deepeval-test.py`)
  - Answer Relevancy metric
  - Faithfulness metric
  - Hallucination detection
  - 4 test cases (email, chat, invoice, calendar)

- [x] Dokumentation
  - `AI_MODEL_SELECTION_GUIDE.md` (466 linjer)
  - `AI_MODELS_UPGRADE_SUMMARY.md` (200 linjer)
  - Omfattende migration guide
  - Best practices for model selection

**Deliverables:** ✅

- Promptfoo eval config klar
- DeepEval Python tests klar
- Komplet dokumentation

---

## 🟡 Phase 3: Testing & Validation (IN PROGRESS)

**Mål:** Teste modeller og validere performance

### Tasks:

#### 3.1 Promptfoo Evaluation

```bash
# Kør evaluation
promptfoo eval -c ai-eval-config.yaml

# Se resultater
promptfoo view
```

**Test områder:**

- [ ] Dansk sprogkvalitet (alle modeller)
- [ ] Business tone (professionel vs casual)
- [ ] Email drafting quality
- [ ] Response times (sammenlign hastighed)
- [ ] Cost per request (verificer free tier)

**Success Criteria:**

- GLM-4.5 Air: ≥ 90% kvalitet på dansk
- Response time: < 3 sekunder
- Ingen hallucinations i business context
- 100% free tier coverage

#### 3.2 DeepEval Testing

```bash
# Kør Python tests
cd tests/ai
python deepeval-test.py
```

**Test cases:**

- [ ] Email summary relevancy (150 char max)
- [ ] Chat response faithfulness
- [ ] Invoice parameter extraction accuracy
- [ ] Calendar date parsing correctness

**Success Criteria:**

- Answer Relevancy: ≥ 0.85
- Faithfulness: ≥ 0.90
- Hallucination rate: < 5%

#### 3.3 Intent Detection Validation

**Test intent parsing med nye modeller:**

- [ ] "Opret lead" → create_lead (≥ 90% confidence)
- [ ] "Book møde" → book_meeting (≥ 85% confidence)
- [ ] "Lav faktura" → create_invoice (≥ 90% confidence)
- [ ] "Tjek kalender" → check_calendar (≥ 85% confidence)

**Files to test:**

- `server/intent-actions.ts` (intent parsing)
- `server/ai-router.ts` (confidence thresholds)

#### 3.4 Email Intelligence Testing

**Test AI email features:**

- [ ] Email summaries (min 200 words → max 150 chars)
- [ ] Label suggestions (5 categories, confidence scores)
- [ ] Thread analysis (multiple emails)
- [ ] Auto-labeling (≥ 85% confidence)

**Files:**

- `server/ai-email-summary.ts`
- `server/ai-label-suggestions.ts`
- `server/email-analysis-engine.ts`

#### 3.5 Performance Benchmarking

```bash
# Playwright performance tests
npm run test:ai:performance
```

**Metrics to measure:**

- [ ] First token latency (< 500ms target)
- [ ] Total response time (< 3s target)
- [ ] Token throughput (tokens/sec)
- [ ] Memory usage during AI calls

**Success Criteria:**

- GLM-4.5 Air: Faster than old Gemma 3 27B
- No memory leaks
- Consistent performance over 100 requests

**Deliverables:** 🎯

- Promptfoo evaluation report (HTML)
- DeepEval test results (JSON)
- Performance benchmark data
- Bug fixes for any issues found

---

## 🔵 Phase 4: Production Rollout (PLANNED)

**Mål:** Deploy nye modeller til production

### Tasks:

#### 4.1 Pre-Production Validation

- [ ] Kør alle tests i staging environment
- [ ] Verify API key limits (OpenRouter free tier)
- [ ] Test fallback mechanism (hvis primary model fejler)
- [ ] Load test med 100 concurrent users

#### 4.2 Feature Flag Rollout

```typescript
// Gradual rollout med feature flags
enableModelRouting: true; // Enable for 10% → 50% → 100%
```

- [ ] 10% rollout → Monitor for 24 timer
- [ ] 50% rollout → Monitor for 48 timer
- [ ] 100% rollout → Full deployment

**Monitoring:**

- Error rates (< 1% target)
- Response times (< 3s p95)
- User satisfaction (feedback)

#### 4.3 Production Deployment

```bash
# Deploy til production
npm run db:push:prod
npm run start
```

- [ ] Update `.env.prod` med nye model settings
- [ ] Deploy server changes
- [ ] Deploy client changes
- [ ] Update dokumentation

#### 4.4 Post-Deployment Monitoring

**Monitor i 1 uge:**

- [ ] Daily error logs review
- [ ] Performance metrics tracking
- [ ] User feedback collection
- [ ] Cost tracking (verificer free tier holder)

**Rollback plan:**

```bash
# Hvis problemer opstår
OPENROUTER_MODEL=google/gemma-3-27b-it:free  # Revert
```

**Deliverables:** 🚀

- Production deployment complete
- Monitoring dashboard aktiv
- Zero downtime migration
- Full documentation updated

---

## 🟣 Phase 5: Optimization & Advanced Features (FUTURE)

**Mål:** Optimere og udvide AI capabilities

### Potential Enhancements:

#### 5.1 Advanced Model Routing

- [ ] Dynamic model selection baseret på user feedback
- [ ] A/B testing mellem modeller
- [ ] Cost/quality trade-off optimization
- [ ] User-specific model preferences

#### 5.2 Conversation Memory (Optional LangChain)

```typescript
// Hvis I beslutter jer for LangChain
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
```

- [ ] Evaluere LangChain v1.0 integration
- [ ] Implement conversation memory
- [ ] Multi-turn context retention
- [ ] Summary-based memory compression

#### 5.3 RAG Implementation (If Needed)

**Kun hvis I får brug for document search:**

- [ ] Vector database setup (Pinecone/ChromaDB)
- [ ] Document embedding pipeline
- [ ] Semantic search integration
- [ ] RAGAS evaluation

#### 5.4 Advanced Evaluation

- [ ] Custom evaluation metrics for Danish
- [ ] Business-specific quality scores
- [ ] User satisfaction correlation
- [ ] Continuous evaluation pipeline

**Deliverables:** 🎯

- Optimized model routing
- Advanced features deployed
- Comprehensive evaluation system

---

## 📊 Success Metrics

### Key Performance Indicators (KPIs)

**Phase 3 Targets:**

- ✅ Model integration: 100% complete
- 🎯 Test coverage: ≥ 80%
- 🎯 Promptfoo score: ≥ 85/100
- 🎯 DeepEval metrics: ≥ 0.85

**Phase 4 Targets:**

- 🎯 Zero downtime deployment
- 🎯 Error rate: < 1%
- 🎯 Response time: < 3s (p95)
- 🎯 User satisfaction: ≥ 4.5/5

**Phase 5 Targets:**

- 🎯 Model routing optimization: ≥ 20% cost savings
- 🎯 Advanced features adoption: ≥ 50% users
- 🎯 Continuous evaluation: Daily reports

---

## 🚦 Current Status

### ✅ Completed

- Phase 1: Model Integration (100%)
- Phase 2: Evaluation Setup (100%)

### 🟡 In Progress

- Phase 3: Testing & Validation (20%)
  - Promptfoo: Not started
  - DeepEval: Not started
  - Intent validation: Not started
  - Performance: Not started

### ⏳ Upcoming

- Phase 4: Production Rollout (0%)
- Phase 5: Optimization (0%)

---

## 🎯 Next Actions (Priority Order)

### 1. **Run Promptfoo Evaluation** (TODAY)

```bash
cd c:\Users\empir\Tekup\services\tekup-ai-v2
promptfoo eval -c ai-eval-config.yaml
promptfoo view  # Opens browser with results
```

### 2. **Run DeepEval Tests** (TODAY)

```bash
python tests/ai/deepeval-test.py
```

### 3. **Manual Testing** (THIS WEEK)

- Test Friday AI chat med nye modeller
- Test email summary generation
- Test label suggestions
- Test intent detection accuracy

### 4. **Review Results** (THIS WEEK)

- Analyze Promptfoo HTML report
- Review DeepEval metrics
- Document any issues
- Create bug fixes if needed

### 5. **Prepare for Phase 4** (NEXT WEEK)

- Fix any bugs from Phase 3
- Update production environment
- Create deployment checklist
- Schedule production deployment

---

## 📝 Notes

### Environment Configuration

- ✅ Dev: GLM-4.5 Air (`z-ai/glm-4.5-air:free`)
- ✅ Prod: Ready for GLM-4.5 Air
- ✅ API Key: `sk-or-v1-6f45d089...` (existing key preserved)

### Model Costs

- **GLM-4.5 Air:** $0.00 (100% free)
- **All 6 models:** $0.00 (free tier)
- **Estimated savings:** 100% vs paid models

### Documentation

- ✅ `AI_MODEL_SELECTION_GUIDE.md` - Complete guide
- ✅ `AI_MODELS_UPGRADE_SUMMARY.md` - Quick reference
- ✅ `PHASE-PLAN.md` - This document

---

## 🔗 Quick Links

- **Model Router:** `server/model-router.ts`
- **AI Router:** `server/ai-router.ts`
- **LLM Core:** `server/_core/llm.ts`
- **Promptfoo Config:** `ai-eval-config.yaml`
- **DeepEval Tests:** `tests/ai/deepeval-test.py`
- **Documentation:** `docs/AI_MODEL_SELECTION_GUIDE.md`

---

**Last Updated:** November 8, 2025
**Next Review:** After Phase 3 completion
**Owner:** Tekup Development Team
