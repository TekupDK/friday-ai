# Chat Improvements - Test Guide

## 📋 Overview

This guide covers testing for the chat panel improvements:

1. **LLM Output Formatting** - No raw JSON in responses
2. **ChatInput Buttons** - Disabled state with feedback
3. **UI Compactness** - Optimized for 20% panel width

---

## 🧪 Test Suite

### 1. Promptfoo - LLM Output Quality

**Location:** `tests/ai/promptfoo-action-formatting.yaml`

**What it tests:**

- Action results don't contain raw JSON
- AI presents results naturally in Danish
- Responses are concise and user-friendly
- Error messages don't expose technical details

**Run:**

```bash
# Install promptfoo if not installed
npm install -g promptfoo

# Run the test
cd tests/ai
promptfoo eval -c promptfoo-action-formatting.yaml

# View results in web UI
promptfoo view
```

**Expected Results:**

- ✅ 4/4 test cases pass
- ✅ No output contains `{`, `}`, or `"`
- ✅ All responses in natural Danish
- ✅ New models (glm-4.5-air, deepseek-v3.1) score higher than legacy gemma-3-27b

---

### 2. Playwright E2E - Button Functionality

**Location:** `tests/chat-input-buttons.spec.ts`

**What it tests:**

- Attach, Apps, Mic buttons are disabled
- Tooltips show "kommer snart"
- Send button enabled/disabled based on input
- Stop button appears during streaming
- Compact UI renders correctly in narrow panel
- Messages use compact styling (p-2, text-xs)

**Run:**

```bash
# Run all chat input tests
npm run test:e2e -- chat-input-buttons

# Run specific test
npm run test:e2e -- chat-input-buttons -g "disabled buttons"

# Run with UI mode (headful)
npm run test:e2e -- chat-input-buttons --headed

# Debug mode
npm run test:e2e -- chat-input-buttons --debug
```

**Expected Results:**

- ✅ 8/8 tests pass
- ✅ Disabled buttons have correct tooltips
- ✅ Send button logic works
- ✅ UI is compact in narrow viewport (400px)

---

### 3. Vitest Unit Tests - Formatting Function

**Location:** `server/__tests__/action-result-formatting.test.ts`

**What it tests:**

- `formatActionResultForAI()` never outputs raw JSON
- Success/failure results formatted correctly
- Arrays truncated to 3 items with "... og X flere"
- Object data summarized cleanly
- Calendar events, emails, leads formatted properly
- Error messages sanitized (no technical details)

**Run:**

```bash
# Run all unit tests
npm test

# Run only formatting tests
npm test action-result-formatting

# Watch mode
npm test -- --watch action-result-formatting

# Coverage
npm test -- --coverage action-result-formatting
```

**Expected Results:**

- ✅ 12/12 tests pass
- ✅ 100% code coverage on formatActionResultForAI
- ✅ No JSON structure in any output

---

## 🎯 Full Test Run

Run all tests in sequence:

```bash
# 1. Unit tests (fastest)
npm test action-result-formatting

# 2. Playwright E2E (medium speed)
npm run test:e2e -- chat-input-buttons

# 3. Promptfoo LLM quality (slowest, requires API calls)
cd tests/ai && promptfoo eval -c promptfoo-action-formatting.yaml
```

---

## 📊 Success Criteria

All tests should pass with these results:

| Test Suite     | Tests                   | Expected | Notes                       |
| -------------- | ----------------------- | -------- | --------------------------- |
| Unit Tests     | 12                      | 12/12 ✅ | Fast, no API calls          |
| Playwright E2E | 8                       | 8/8 ✅   | Requires running dev server |
| Promptfoo LLM  | 4 cases x 3 models = 12 | 12/12 ✅ | Requires OpenRouter API key |

**Total:** 32 tests should pass

---

## 🐛 Troubleshooting

### Promptfoo fails with API errors

```bash
# Check OpenRouter API key is set
echo $OPENROUTER_API_KEY

# Or in .env.dev
grep OPENROUTER .env.dev

# Test with single provider first
promptfoo eval -c promptfoo-action-formatting.yaml --no-cache
```

### Playwright can't find elements

```bash
# Make sure dev server is running
npm run dev

# Update Playwright browsers
npx playwright install

# Run with trace for debugging
npm run test:e2e -- chat-input-buttons --trace on
```

### Unit tests import errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Check TypeScript types
npm run typecheck
```

---

## 📈 Metrics to Track

After running tests, track these metrics:

1. **LLM Output Quality** (Promptfoo)
   - % responses without JSON: Target 100%
   - Average response length: Target < 150 words
   - Model comparison: New models should score ≥ legacy

2. **UI Responsiveness** (Playwright)
   - Button states: 100% correct
   - Compact styling: All measurements within bounds
   - Tooltip visibility: 100% shown

3. **Code Coverage** (Vitest)
   - formatActionResultForAI: Target 100%
   - Related functions: Target >80%

---

## 🔄 Regression Testing

Re-run these tests after:

- ✅ Any changes to `ai-router.ts`
- ✅ Model router updates
- ✅ ChatInput component changes
- ✅ UI styling updates

---

## 📝 Adding New Tests

### For new action types:

Add test case to `promptfoo-action-formatting.yaml`:

```yaml
- vars:
    actionResult: |
      [Handling Udført] ✅ Succes: [Your message]
      ...
  assert:
    - type: not-contains
      value: "{"
```

### For new UI features:

Add test to `chat-input-buttons.spec.ts`:

```typescript
test("should handle new feature", async ({ page }) => {
  // Your test here
});
```

---

## ✅ Final Checklist

Before deploying:

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Promptfoo shows improvement over baseline
- [ ] Manual browser test confirms no raw JSON
- [ ] Disabled buttons show correct tooltips
- [ ] UI looks good in narrow panel (20% width)
