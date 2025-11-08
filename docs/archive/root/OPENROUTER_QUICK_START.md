# ⚡ OpenRouter Quick Start - 3 Steps!

## 🎯 Goal
Get Promptfoo LLM tests running in under 5 minutes.

---

## ✅ STEP 1: Get OpenRouter API Key (2 min)

### 1.1 Visit OpenRouter
```
👉 https://openrouter.ai/keys
```

### 1.2 Login/Sign up
- Use Google/GitHub login (quickest)
- Or create account with email

### 1.3 Create API Key
1. Click **"Create API Key"**
2. Name it: `Friday AI Tests - Dev`
3. Copy the key: `sk-or-v1-...` (starts with this)
4. ⚠️ Save it now - you can't see it again!

---

## ✅ STEP 2: Add API Key to .env.dev (1 min)

### 2.1 Open your `.env.dev` file:
```bash
# In project root
notepad .env.dev
```

### 2.2 Find and update these lines:
```bash
# Find:
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key-here
VITE_OPENROUTER_API_KEY=sk-or-v1-your-openrouter-api-key-here

# Replace with your actual key:
OPENROUTER_API_KEY=sk-or-v1-ABC123XYZ... (your key)
VITE_OPENROUTER_API_KEY=sk-or-v1-ABC123XYZ... (your key)
```

### 2.3 Save the file

---

## ✅ STEP 3: Configure Data Policy (1 min)

### Option A: Enable Free Models (Recommended for Tests) ⚡

**This is the quickest way to start testing!**

1. Visit: **https://openrouter.ai/settings/privacy**
2. Find **"Data Policy"** section
3. ✅ **Check:** "I agree to share my requests for free model publication"
4. Click **Save**
5. Done! ✅

**What this means:**
- ✅ You can use free models (like deepseek, gemma, etc.)
- ✅ Perfect for testing and development
- ✅ Your requests help improve free models
- ⚠️ Don't use for sensitive/production data

### Option B: Use Paid Models (Production/Sensitive Data)

**Skip data policy, but pay per request:**

1. Keep data policy disabled
2. Add credits to account: https://openrouter.ai/credits
3. Update test config to use paid models (see below)

---

## 🧪 STEP 4: Run Your First Test! (1 min)

### 4.1 Navigate to test folder:
```bash
cd tests/ai
```

### 4.2 Run the test:
```bash
promptfoo eval -c promptfoo-action-formatting.yaml
```

### 4.3 Expected output:
```
✓ formatActionResult - Calendar events (2.3s)
✓ formatActionResult - Email threads (1.8s)
✓ formatActionResult - Danish output (2.1s)
✓ formatActionResult - Error handling (1.5s)

Results: 4/4 passed (100%)
```

### 4.4 View detailed results:
```bash
promptfoo view
```

---

## 🎉 SUCCESS!

If you see ✓ green checkmarks, you're done! 

**Your setup is working:**
- ✅ API key configured correctly
- ✅ Data policy enabled (or paid models working)
- ✅ Tests running successfully
- ✅ LLM quality verified

---

## 🔧 Troubleshooting

### ❌ Error: "Invalid API key"

**Check:**
```bash
# In .env.dev, verify key format:
OPENROUTER_API_KEY=sk-or-v1-... (must start with this!)

# Test your key:
curl https://openrouter.ai/api/v1/models ^
  -H "Authorization: Bearer sk-or-v1-YOUR-KEY-HERE"
```

**Fix:**
- Re-copy key from https://openrouter.ai/keys
- Make sure no extra spaces
- Restart terminal after changing .env.dev

### ❌ Error: "No endpoints found matching your data policy"

**This means:** Data policy not enabled for free models

**Fix (Choose one):**

**Quick Fix:** Enable free models (1 min)
1. https://openrouter.ai/settings/privacy
2. Check "share requests for free model publication"
3. Save

**OR**

**Alternative:** Switch to paid models (requires credits)
Update `tests/ai/promptfoo-action-formatting.yaml`:
```yaml
providers:
  # Change from:
  - id: openrouter:deepseek/deepseek-chat-v3.1:free
  
  # To:
  - id: openrouter:anthropic/claude-3-haiku
    # or
  - id: openrouter:openai/gpt-3.5-turbo
```

### ❌ Error: "Rate limit exceeded"

**This means:** Too many requests too fast

**Fix:**
- Wait 60 seconds
- Free tier has limits
- Consider using just 1 model instead of multiple

### ❌ Error: "Command 'promptfoo' not found"

**Fix:**
```bash
# Install globally
npm install -g promptfoo

# Or run with npx
npx promptfoo eval -c promptfoo-action-formatting.yaml
```

---

## 📊 What Gets Tested?

Your tests verify:

✅ **No Raw JSON** - LLM outputs natural text, not `{"result": "..."}`
✅ **Danish Language** - Responses in proper Danish
✅ **Smart Formatting** - Arrays truncated, objects summarized
✅ **Error Handling** - Graceful failures

Example test case:
```typescript
Input: { events: [event1, event2, event3, event4, event5] }
Expected: "Fandt 5 begivenheder: Event1, Event2, Event3... og 2 flere"
NOT: {"events": [{"id": 1...}]}
```

---

## 🚀 Next Steps

### After first successful test:

1. **Run all tests:**
   ```bash
   cd tests/ai
   promptfoo eval
   ```

2. **View results in browser:**
   ```bash
   promptfoo view
   ```

3. **Add more test cases** (optional):
   Edit `promptfoo-action-formatting.yaml`

4. **Check unit tests** (already passing!):
   ```bash
   cd ../..
   npm test action-result-formatting
   ```

---

## 💡 Pro Tips

### Free Tier Optimization:
- Use 1 model for faster tests
- Free tier resets daily
- Best free models: `deepseek/deepseek-chat-v3.1:free`

### Test During Development:
```bash
# Quick test while coding
cd tests/ai && promptfoo eval -c promptfoo-action-formatting.yaml
```

### CI/CD Integration:
```bash
# Add to GitHub Actions (after enabling data policy)
- run: cd tests/ai && promptfoo eval --no-interactive
```

---

## 📞 Need Help?

### Resources:
- **OpenRouter Docs:** https://openrouter.ai/docs
- **Promptfoo Docs:** https://promptfoo.dev/docs
- **Our Full Guide:** `OPENROUTER_SETUP_GUIDE.md`
- **Test Guide:** `tests/CHAT_IMPROVEMENTS_TEST_GUIDE.md`

### Common Questions:

**Q: Is my data safe with data policy enabled?**
A: For free models, requests are used for model training. For production, use paid models or disable data sharing.

**Q: How much do paid models cost?**
A: Very cheap - GPT-3.5-Turbo: ~$0.001/request, Claude Haiku: ~$0.0025/request

**Q: Can I use free models in production?**
A: Free models can be used, but consider paid models for guaranteed privacy and better quality.

---

## ✅ You're Ready!

**Summary:**
1. ✅ Got API key from OpenRouter
2. ✅ Added to `.env.dev`
3. ✅ Enabled data policy (or using paid models)
4. ✅ Ran test successfully
5. ✅ LLM quality verified!

**Now you can:**
- Run LLM quality tests anytime
- Verify chat improvements work correctly
- Test different models easily
- Integrate into CI/CD pipeline

**Happy Testing! 🚀**
