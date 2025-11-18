# 🔧 useEffect Dependency Fixes - Action Plan

**Date:** 2025-11-08
**Priority:** 🔴 HIGH
**Estimated Time:** 2 days
**Files Affected:** 44 files, 79 useEffect calls

---

## 🎯 **OBJECTIVE**

Fix all useEffect dependency issues to:

- Prevent infinite loops
- Ensure correct re-execution
- Follow React best practices
- Pass ESLint checks

---

## 📊 **ISSUE BREAKDOWN**

### **Critical Issues (Fix First):**

1. **AIAssistantPanelV2.tsx** - Mutation in dependencies
1. **App.tsx** - queryClient in dependencies
1. **ShortWaveChatPanel.tsx** - Scroll behavior
1. **CalendarTab.tsx** - Multiple useEffects
1. **EmailListAI.tsx** - Polling logic

### **Medium Issues:**

6-20. Various components with missing dependencies

### **Low Priority:**

21-79. Minor dependency warnings

---

## 🔴 **CRITICAL FIX #1: AIAssistantPanelV2.tsx**

**File:** `client/src/components/panels/AIAssistantPanelV2.tsx`

**Current Code:**

````typescript
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  if (!isInitialized) {
    createConversation.mutate({ title: "Friday AI Chat" });
    setIsInitialized(true);
  }
}, [isInitialized, createConversation]); // ❌ createConversation changes every render

```text

**Problem:**

- `createConversation` is a mutation object that changes on every render
- `isInitialized` flag is a workaround
- Violates React best practices

**Solution:**

```typescript
// Remove mutation from dependencies
useEffect(() => {
  createConversation.mutate({ title: "Friday AI Chat" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Run once on mount

```bash

**Impact:** 🔴 HIGH - Prevents potential infinite loops

---

## 🔴 **CRITICAL FIX #2: App.tsx - CacheWarmer**

**File:** `client/src/App.tsx`

**Current Code:**

```typescript
useEffect(() => {
  if (isAuthenticated && user?.id) {
    warmupCache(queryClient, String(user.id));
  }
}, [isAuthenticated, user?.id, queryClient]); // ❌ queryClient is stable but unnecessary

```text

**Problem:**

- `queryClient` is stable but shouldn't be in dependencies
- Adds unnecessary complexity

**Solution:**

```typescript
useEffect(() => {
  if (isAuthenticated && user?.id) {
    warmupCache(queryClient, String(user.id)).catch(err =>
      console.warn("Cache warmup failed:", err)
    );
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated, user?.id]); // Remove queryClient

```bash

**Impact:** 🟡 MEDIUM - Cleanup, no functional change

---

## 🔴 **CRITICAL FIX #3: ShortWaveChatPanel.tsx**

**File:** `client/src/components/chat/ShortWaveChatPanel.tsx`

**Current Code:**

```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]); // ❌ Scrolls on every message change

```text

**Problem:**

- Scrolls even when user is reading old messages
- Should only scroll if user is at bottom

**Solution:**

```typescript
const [autoScroll, setAutoScroll] = useState(true);

useEffect(() => {
  if (autoScroll && messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages, autoScroll]);

// Detect if user scrolled up
const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
  setAutoScroll(isAtBottom);
};

```bash

**Impact:** 🟡 MEDIUM - Better UX

---

## 🟡 **MEDIUM FIX #4: CalendarTab.tsx**

**File:** `client/src/components/inbox/CalendarTab.tsx`

**Issue:** Multiple useEffects with complex dependencies

**Solution:** Consolidate and simplify

---

## 📋 **FIX CHECKLIST**

### **Phase 1: Critical Fixes (Day 1)**

- [ ] Fix AIAssistantPanelV2.tsx
- [ ] Fix App.tsx CacheWarmer
- [ ] Fix ShortWaveChatPanel.tsx scroll
- [ ] Test all fixes
- [ ] Verify no regressions

### **Phase 2: Medium Fixes (Day 2)**

- [ ] Fix CalendarTab.tsx
- [ ] Fix EmailListAI.tsx
- [ ] Fix DashboardLayout.tsx
- [ ] Fix remaining critical files
- [ ] Run full test suite

### **Phase 3: Cleanup (Day 3)**

- [ ] Add ESLint rules
- [ ] Document patterns
- [ ] Update guidelines
- [ ] Code review

---

## 🛠️ **IMPLEMENTATION STRATEGY**

### **1. Create Branch**

```bash
git checkout -b fix/useeffect-dependencies

```text

### **2. Fix Files One by One**

- Fix file
- Test locally
- Commit
- Move to next

### **3. Testing**

```bash
# Run tests
pnpm test

# Build check
pnpm build

# Manual testing
pnpm dev

```text

### **4. Merge**

```bash
git push origin fix/useeffect-dependencies
# Create PR
# Review
# Merge

```text

---

## 📝 **ESLINT RULES TO ADD**

Add to `.eslintrc.json`:

```json
{
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}

```text

---

## 📚 **DOCUMENTATION**

Create `docs/REACT_PATTERNS.md`:

```markdown
# React Patterns & Best Practices

## useEffect Dependencies

### ✅ DO

- Include all values used inside effect
- Use primitive dependencies when possible
- Add eslint-disable comment when intentional

### ❌ DON'T

- Include stable refs (queryClient, etc.)
- Include mutation objects
- Ignore ESLint warnings without comment

### Examples

#### Good

\`\`\`typescript
useEffect(() => {
fetchData(userId);
}, [userId]); // Primitive dependency
\`\`\`

#### Bad

\`\`\`typescript
useEffect(() => {
mutation.mutate();
}, [mutation]); // Mutation changes every render
\`\`\`

#### Intentional

\`\`\`typescript
useEffect(() => {
initOnce();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Intentionally run once
\`\`\`

````

---

## 🎯 **SUCCESS CRITERIA**

- [ ] All critical useEffect issues fixed
- [ ] No ESLint warnings
- [ ] All tests passing
- [ ] No performance regressions
- [ ] Documentation updated
- [ ] Team trained on patterns

---

## 📊 **EXPECTED RESULTS**

### **Before:**

- 79 useEffect calls
- ~20 with issues
- ESLint warnings
- Potential bugs

### **After:**

- 79 useEffect calls
- 0 issues
- No ESLint warnings
- Stable behavior

---

## 🚀 **READY TO START?**

**Next Steps:**

1. Create branch
1. Fix AIAssistantPanelV2.tsx
1. Fix App.tsx
1. Fix ShortWaveChatPanel.tsx
1. Test
1. Commit

**Estimated Time:** 2 days

Skal jeg starte med at lave fixes? 🔧
