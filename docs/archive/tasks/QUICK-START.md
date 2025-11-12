# 🚀 Quick Start - OpenRouter Models Testing

**Hurtig guide til at teste de nye AI modeller**

---

## ⚡ Kør Tests Nu (5 minutter)

### 1. Promptfoo Evaluation

```bash
# Installer dependencies (hvis ikke allerede gjort)
npm install

# Kør evaluation
promptfoo eval -c ai-eval-config.yaml

# Se resultater i browser
promptfoo view
```

**Hvad det tester:**

- 5 modeller (GLM-4.5 Air, GPT-OSS, DeepSeek, MiniMax, Qwen3)
- 12 forskellige prompts (dansk business context)
- Output quality, response time, cost

**Expected output:**

```
✓ GLM-4.5 Air: 95/100 (Recommended ⭐)
✓ GPT-OSS 20B: 93/100
✓ DeepSeek v3.1: 91/100
✓ MiniMax M2: 88/100
✓ Qwen3 Coder: 85/100
```

---

### 2. DeepEval Tests

```bash
# Install Python dependencies
pip install deepeval openai

# Set OpenRouter API key (hvis ikke i .env)
$env:OPENROUTER_API_KEY = "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"

# Kør tests
python tests/ai/deepeval-test.py
```

**Hvad det tester:**

- Answer Relevancy (≥ 0.85 target)
- Faithfulness (≥ 0.90 target)
- Hallucination detection
- 4 use cases: email, chat, invoice, calendar

**Expected output:**

```json
{
  "test_email_summary": {
    "answer_relevancy": 0.92,
    "faithfulness": 0.95,
    "passed": true
  },
  "test_chat_response": {
    "answer_relevancy": 0.89,
    "faithfulness": 0.91,
    "passed": true
  }
}
```

---

### 3. Manual Testing (Friday AI)

```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

**Test scenarios:**

1. **Chat Test:**
   - "Hej Friday, hvad kan du hjælpe med?"
   - Check: Dansk sprog, professionel tone, relevant svar

2. **Email Test:**
   - Gå til Emails tab
   - Check: Summary generation, label suggestions

3. **Intent Test:**
   - "Opret et lead for Jens Jensen, email jens@test.dk"
   - Check: Pending action modal appears, correct parameters

4. **Calendar Test:**
   - "Hvad har jeg i min kalender i dag?"
   - Check: Correct date parsing, calendar data shown

---

## 📊 Resultater at Kigge Efter

### ✅ Success Indicators

- **Dansk kvalitet:** Naturligt, professionelt dansk
- **Response time:** < 3 sekunder
- **Confidence:** Intent detection ≥ 85%
- **No hallucinations:** Faktuelle svar, ingen opdigtede data
- **Cost:** $0.00 (free tier)

### ⚠️ Warning Signs

- Engelsk i stedet for dansk
- Response time > 5 sekunder
- Intent detection < 70% confidence
- Hallucinations (opdigtede fakta)
- API errors eller rate limits

---

## 🐛 Troubleshooting

### Promptfoo Command Not Found

```bash
# Install globalt
npm install -g promptfoo

# Eller kør via npx
npx promptfoo eval -c ai-eval-config.yaml
```

### DeepEval Import Error

```bash
# Install dependencies
pip install deepeval openai anthropic

# Eller brug conda
conda install -c conda-forge deepeval
```

### OpenRouter API Error

```bash
# Check API key
echo $env:OPENROUTER_API_KEY

# Verify key works
curl https://openrouter.ai/api/v1/models `
  -H "Authorization: Bearer sk-or-v1-6f45d089..."
```

### Model Not Found Error

```bash
# Verify model ID in .env
OPENROUTER_MODEL=z-ai/glm-4.5-air:free

# Restart dev server
npm run dev
```

---

## 📝 Log Resultater

### Create Test Report

```bash
# Efter tests, gem resultater
mkdir test-results

# Promptfoo
promptfoo eval -c ai-eval-config.yaml --output test-results/promptfoo-results.json

# DeepEval
python tests/ai/deepeval-test.py > test-results/deepeval-results.txt
```

### Share Results

```markdown
## Test Results - [DATE]

**Promptfoo Score:** 95/100
**DeepEval Metrics:**

- Answer Relevancy: 0.92
- Faithfulness: 0.95

**Issues Found:** None
**Recommendation:** ✅ Ready for production
```

---

## 🎯 Next Steps After Testing

### If Tests Pass ✅

1. Review `PHASE-PLAN.md` → Phase 4
2. Prepare production deployment
3. Update `.env.prod` with new models
4. Schedule deployment window

### If Tests Fail ❌

1. Document issues in `ISSUES.md`
2. Adjust model parameters
3. Test again
4. Consult `AI_MODEL_SELECTION_GUIDE.md`

---

## 📞 Need Help?

**Check Documentation:**

- `docs/AI_MODEL_SELECTION_GUIDE.md` - Detailed guide
- `AI_MODELS_UPGRADE_SUMMARY.md` - Quick reference
- `PHASE-PLAN.md` - Full project plan

**Review Code:**

- `server/model-router.ts` - Model configuration
- `server/ai-router.ts` - AI routing logic
- `ai-eval-config.yaml` - Promptfoo config
- `tests/ai/deepeval-test.py` - DeepEval tests

**Common Issues:**

- API key not set → Check `.env.dev`
- Model not found → Verify `OPENROUTER_MODEL`
- Slow responses → Check network/API status
- Danish quality → Adjust prompts in `friday-prompts.ts`

---

**Ready? Start testing! 🚀**

```bash
promptfoo eval -c ai-eval-config.yaml && promptfoo view
```
