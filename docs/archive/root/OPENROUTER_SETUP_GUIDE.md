# OpenRouter API Configuration Guide

**For Promptfoo LLM Quality Tests**

## 🎯 Problem

Promptfoo tests fail with:

```
API error: 404 Not Found
"No endpoints found matching your data policy (Free model publication)"
```

## ✅ Solution: Configure Data Policy

### Step 1: Open OpenRouter Settings

1. Visit: **https://openrouter.ai/settings/privacy**
2. Log in if needed

### Step 2: Update Data Policy

Find the **"Data Policy"** section and configure:

#### Option A: Enable Free Models (Recommended for Testing)

- ✅ **Enable:** "Free model publication"
- This allows your requests to be used for free tier model improvements
- Good for: Testing, development, non-sensitive data

#### Option B: Paid Models Only (Production)

- ✅ Keep "Free model publication" disabled
- Use paid models in promptfoo config
- Good for: Production, sensitive data, guaranteed privacy

### Step 3: Verify Configuration

#### If Using Free Models:

```yaml
# tests/ai/promptfoo-action-formatting.yaml
providers:
  - id: openrouter:deepseek/deepseek-chat-v3.1:free
    config:
      temperature: 0.3
```

Run test:

```bash
cd tests/ai
promptfoo eval -c promptfoo-action-formatting.yaml
```

#### If Using Paid Models:

Update config to use paid models:

```yaml
# tests/ai/promptfoo-action-formatting.yaml
providers:
  # Paid tier - No data policy restrictions
  - id: openrouter:anthropic/claude-3-haiku
    config:
      temperature: 0.3
  - id: openrouter:openai/gpt-3.5-turbo
    config:
      temperature: 0.3
```

## 🔑 Check API Key

Verify your OpenRouter API key is set:

### In .env.dev:

```bash
OPENROUTER_API_KEY=sk-or-v1-...
```

### Test API Key:

```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

## 🧪 Run Tests

### After Configuration:

```bash
# From project root
cd tests/ai
promptfoo eval -c promptfoo-action-formatting.yaml

# View results
promptfoo view
```

### Expected Output (Success):

```
✓ Test 1: Calendar events formatted naturally
✓ Test 2: Email threads without raw JSON
✓ Test 3: Danish language output
✓ Test 4: Error handling graceful

4/4 tests passed
```

## 🔍 Troubleshooting

### Error: "Invalid API key"

- Check `.env.dev` has correct `OPENROUTER_API_KEY`
- Verify key starts with `sk-or-v1-`
- Get new key: https://openrouter.ai/keys

### Error: "Rate limit exceeded"

- Free tier has limits
- Wait 60 seconds between test runs
- Consider using fewer models in config

### Error: "Model not available"

- Check model ID matches exactly: `deepseek/deepseek-chat-v3.1:free`
- See available models: https://openrouter.ai/models
- Verify free model if using free tier

## 📚 Available Free Models

Valid model IDs for free tier (as of our config):

```
z-ai/glm-4.5-air:free
deepseek/deepseek-chat-v3.1:free
google/gemma-3-27b-it:free
qwen/qwen3-coder:free
moonshotai/kimi-k2:free
```

See `server/_core/model-mappings.ts` for full list.

## ✅ Quick Start Checklist

- [ ] 1. Visit https://openrouter.ai/settings/privacy
- [ ] 2. Enable "Free model publication" (or use paid models)
- [ ] 3. Verify `OPENROUTER_API_KEY` in `.env.dev`
- [ ] 4. Run: `cd tests/ai && promptfoo eval -c promptfoo-action-formatting.yaml`
- [ ] 5. Check results: `promptfoo view`

## 🎉 Success Criteria

When configured correctly, you'll see:

```bash
$ promptfoo eval -c promptfoo-action-formatting.yaml

Running tests...
✓ formatActionResult - Calendar events (2.3s)
✓ formatActionResult - Email threads (1.8s)
✓ formatActionResult - Danish output (2.1s)
✓ formatActionResult - Error handling (1.5s)

Results: 4/4 passed (100%)
View: promptfoo view
```

---

**Next Steps After Setup:**

1. Run tests to verify configuration
2. Review test results for quality
3. Update test cases if needed
4. Document any model-specific behaviors

**Need Help?**

- OpenRouter Docs: https://openrouter.ai/docs
- Promptfoo Docs: https://promptfoo.dev/docs
- Our Test Guide: `tests/CHAT_IMPROVEMENTS_TEST_GUIDE.md`
