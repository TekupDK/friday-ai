# 🧪 AI Documentation Generator - Test Guide

## 🚀 Kør Test

### Option 1: Fuld Test (Anbefalet)
```bash
node scripts/test-ai-docs.mjs
```

Dette tester:
1. ✅ Data collection (leads, emails, conversations)
2. ✅ AI analysis (OpenRouter FREE model)
3. ✅ Markdown generation
4. ✅ Database insertion

### Option 2: Manual Test via tRPC
```typescript
// I browser console eller Postman
await fetch('/api/trpc/docs.generateLeadDoc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    leadId: 1  // Brug faktisk lead ID
  })
});
```

---

## 📊 Forventet Output

```
🧪 Testing AI Documentation Generator

============================================================

📊 Step 1: Testing Data Collection

✓ Found test lead: John Doe (john@example.com)
  ID: 1
  Company: Acme Corp
  Status: active

  Collecting data...
  ✓ Email threads found: 5
  ✓ Calendar events: 0
  ✓ Chat messages: 2

🤖 Step 2: Testing AI Analysis

  Sending to OpenRouter GLM-4.5-Air (FREE)...
  ✓ Summary: Active lead with strong engagement. Multiple touchpoints...
  ✓ Sentiment: positive
  ✓ Priority: high
  ✓ Key topics: 3
  ✓ Action items: 4
  ✓ Risks identified: 1

  Topics discussed:
    - Invoice payment terms
    - Software integration
    - Timeline and budget

  Action items:
    - Schedule follow-up meeting
    - Send contract for review
    - Prepare technical demo

📝 Step 3: Testing Markdown Generation

  ✓ Generated 145 lines
  ✓ Word count: 892
  ✓ Contains emojis: Yes

  Preview:
  ----------------------------------------------------------
  # 🤝 Lead: Acme Corp
  
  > 🟠 **Priority:** HIGH | 😊 **Sentiment:** positive
  
  ## 📋 Overview
  - **Contact:** John Doe
  - **Company:** Acme Corp
  ...
  ----------------------------------------------------------
  ... (130 more lines)

💾 Step 4: Testing Database Insertion

  Running full pipeline (collect → analyze → generate → save)...
  ✓ Document created successfully!
  ✓ Document ID: abc123xyz
  ✓ View at: /docs?id=abc123xyz

============================================================
✅ ALL TESTS PASSED!

📊 Summary:
   Lead: John Doe
   Emails analyzed: 5
   Sentiment: positive
   Priority: high
   Document ID: abc123xyz
   Markdown size: 8432 chars

💰 Cost: $0.00 (FREE!)

🎉 AI Documentation Generator is working perfectly!
============================================================
```

---

## ⚠️ Hvis Test Fejler

### Error: "No leads found in database"
**Fix:** Opret en test lead først:
```sql
INSERT INTO friday_ai.leads (name, email, company, status)
VALUES ('Test Lead', 'test@example.com', 'Test Corp', 'active');
```

### Error: "Database not available"
**Fix:** Check `.env` filen har korrekt `DATABASE_URL`

### Error: "No response from LLM"
**Fix:** Check at `OPENROUTER_API_KEY` er sat i `.env`

### Error: "Module not found"
**Fix:** Kør `pnpm install` først

---

## 🎯 Næste Steps Efter Test

### Hvis Test Passer ✅
1. **Add UI buttons** - Gør det tilgængeligt i frontend
2. **Test med flere leads** - Bulk generation
3. **Review output quality** - Adjust prompts hvis nødvendigt

### Hvis Test Fejler ❌
1. Check error message
2. Verify database connection
3. Verify OpenRouter API key
4. Check logs for details

---

## 📋 Manual Test Checklist

- [ ] Database connection works
- [ ] Lead data collected
- [ ] Email threads found
- [ ] AI analysis completes
- [ ] Markdown generated
- [ ] Document saved to database
- [ ] Can view document in `/docs`

---

## 💡 Tips

**Test med forskelligt lead data:**
```bash
# Lead med mange emails
node scripts/test-ai-docs.mjs

# Lead uden emails (skal stadig virke)
# Modify script to use specific lead ID
```

**Check generated doc:**
```bash
# Efter test, åbn docs page
# Navigate to: http://localhost:3000/docs?id=<docId>
```

**Check database:**
```sql
-- Se alle genererede docs
SELECT id, title, category, tags, author, created_at
FROM friday_ai.documents
WHERE author = 'ai-system'
ORDER BY created_at DESC;
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies (hvis ikke gjort)
pnpm install

# 2. Start dev server (i anden terminal)
pnpm dev

# 3. Run test
node scripts/test-ai-docs.mjs

# 4. Check output
# Navigate to: http://localhost:3000/docs
```

---

**KLAR TIL TEST! 🎉**
