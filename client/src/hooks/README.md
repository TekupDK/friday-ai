# React Hooks - Friday AI Chat

**Last Updated:** January 28, 2025  
**Status:** ✅ Production Ready

---

## Overview

Friday AI Chat uses a comprehensive React hooks system with 29+ custom hooks organized by functionality. All hooks follow React's `use*` naming convention and are fully typed with TypeScript.

## Quick Start

```typescript
// Import from central index
import { usePageTitle, useDebouncedValue, useIsMobile } from "@/hooks";

// Or import directly
import { usePageTitle } from "@/hooks/usePageTitle";
```

## Hook Categories

### Core Hooks

Located in `@/_core/hooks/` - Framework-level hooks.

#### `useAuth`

Authentication hook with automatic redirect support.

```typescript
import { useAuth } from "@/_core/hooks/useAuth";

const { user, isAuthenticated, loading, logout } = useAuth({
  redirectOnUnauthenticated: true,
  redirectPath: "/login",
});
```

**Returns:**

- `user` - Current user object or null
- `isAuthenticated` - Boolean authentication status
- `loading` - Loading state
- `logout` - Logout function
- `refresh` - Refresh user data function

---

### UI & Layout Hooks

#### `usePageTitle`

Sets page title and meta description for SEO and accessibility.

```typescript
import { usePageTitle } from "@/hooks";

usePageTitle("Dashboard");
// Sets: "Dashboard - Friday AI Chat"
```

**Parameters:**

- `title: string` - Page title (optional, defaults to app title)

**WCAG Compliance:** 2.4.2 (Level A) - Page Titled

---

#### `useIsMobile`

Detects mobile devices based on viewport width.

```typescript
import { useIsMobile } from "@/hooks";

const isMobile = useIsMobile();
// Returns: boolean
```

**Breakpoint:** 768px (max-width: 767px = mobile)

---

#### `useKeyboardShortcuts`

Global keyboard shortcuts handler with category support.

```typescript
import { useKeyboardShortcuts } from "@/hooks";

useKeyboardShortcuts([
  {
    key: "k",
    ctrlKey: true,
    handler: () => openSearch(),
    description: "Open search",
    category: "search",
  },
]);
```

**Categories:** `navigation`, `action`, `search`, `modal`, `help`

**Helper Functions:**

- `getAllKeyboardShortcuts()` - Get all registered shortcuts
- `shouldIgnoreKeyboardEvent(event)` - Check if event should be ignored

---

### Performance & Optimization Hooks

#### `useDebouncedValue`

Debounces a value to reduce API calls and improve performance.

```typescript
import { useDebouncedValue } from "@/hooks";

const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 300);

// Use debouncedSearch in API calls
const { data } = trpc.search.useQuery({ query: debouncedSearch });
```

**Parameters:**

- `value: T` - Value to debounce
- `delay: number` - Delay in milliseconds (default: 300ms)

**Returns:** Debounced value of type `T`

---

#### `useAdaptivePolling`

Adaptive polling with exponential backoff and error handling.

```typescript
import { useAdaptivePolling } from "@/hooks";

const { data, error, refetch } = useAdaptivePolling({
  query: trpc.emails.list.useQuery,
  baseInterval: 5000,
  maxInterval: 60000,
  enabled: true,
});
```

**Parameters:**

- `query` - tRPC query function
- `baseInterval` - Base polling interval (ms)
- `maxInterval` - Maximum polling interval (ms)
- `enabled` - Enable/disable polling

---

#### `useRateLimit`

Rate limiting hook for API calls.

```typescript
import { useRateLimit } from "@/hooks";

const { canMakeRequest, waitTime } = useRateLimit({
  maxRequests: 10,
  windowMs: 60000,
});
```

---

#### `usePersistFn`

Persists function reference across renders.

```typescript
import { usePersistFn } from "@/hooks";

const handleClick = usePersistFn((id: number) => {
  // Function body
});
```

---

### Chat Hooks

#### `useFridayChat`

Enhanced chat hook with pagination and memory management.

```typescript
import { useFridayChat } from "@/hooks";

const {
  sendMessage,
  messages,
  isLoading,
  isStreaming,
  error,
  loadMoreMessages,
  hasMoreMessages,
} = useFridayChat({
  conversationId: 123,
  context: { selectedEmails: ["1", "2"] },
  maxMessages: 50,
});
```

**Features:**

- Message pagination
- Streaming support
- Context injection
- Error handling
- Memory management

---

#### `useFridayChatSimple`

Simplified chat hook for basic use cases.

```typescript
import { useFridayChatSimple } from "@/hooks";

const { sendMessage, messages, isLoading } = useFridayChatSimple({
  conversationId: 123,
});
```

---

#### `useStreamingChat`

Streaming chat with fallback support.

```typescript
import { useStreamingChat, useFallbackStreaming } from "@/hooks";

const { streamMessage, isStreaming } = useStreamingChat({
  onComplete: response => console.log(response),
  onError: error => console.error(error),
});
```

---

#### `useChatInput`

Chat input management with composition support.

```typescript
import { useChatInput } from "@/hooks";

const { input, setInput, handleSubmit, isComposing } = useChatInput({
  onSubmit: message => sendMessage(message),
  disabled: false,
});
```

---

#### `useOpenRouter`

OpenRouter API integration for AI models.

```typescript
import { useOpenRouter } from "@/hooks";

const { generate, isLoading, error } = useOpenRouter({
  model: "gpt-4",
  temperature: 0.7,
});
```

---

### Email Hooks

#### `useEmailActions`

Email action handlers (reply, forward, archive, etc.).

```typescript
import { useEmailActions } from "@/hooks";

const { reply, forward, archive, deleteEmail, markAsRead } = useEmailActions();
```

---

#### `useEmailKeyboardShortcuts`

Email-specific keyboard shortcuts.

```typescript
import { useEmailKeyboardShortcuts } from "@/hooks";

useEmailKeyboardShortcuts({
  onReply: () => handleReply(),
  onForward: () => handleForward(),
  onArchive: () => handleArchive(),
});
```

---

### CRM Hooks

Located in `@/hooks/crm/` - CRM-specific hooks.

#### `useAdaptiveRendering`

Adaptive rendering based on device performance.

```typescript
import { useAdaptiveRendering } from "@/hooks/crm";

const {
  enableAnimations,
  enableBlur,
  enableShadows,
  imageQuality,
  maxListItems,
} = useAdaptiveRendering();
```

**Performance Tiers:** `high`, `medium`, `low`

---

#### `useFeatureDetection`

Detects browser features and capabilities.

```typescript
import { useFeatureDetection } from "@/hooks/crm";

const { backdropFilter, reducedMotion, webGL, webWorker } =
  useFeatureDetection();
```

---

#### `usePerformanceTier`

Determines device performance tier.

```typescript
import { usePerformanceTier } from "@/hooks/crm";

const { tier, score } = usePerformanceTier();
// tier: "high" | "medium" | "low"
```

---

#### `useReducedMotion`

Detects user's motion preferences.

```typescript
import { useReducedMotion } from "@/hooks/crm";

const prefersReducedMotion = useReducedMotion();
```

---

#### `useSmoothScroll`

Smooth scrolling with performance optimization.

```typescript
import { useSmoothScroll } from "@/hooks/crm";

const scrollTo = useSmoothScroll({
  behavior: "smooth",
  block: "start",
});
```

---

### Docs Hooks

Located in `@/hooks/docs/` - Documentation system hooks.

#### `useDocuments`

Document management with tRPC.

```typescript
import {
  useDocuments,
  useDocument,
  useDocumentSearch,
} from "@/hooks/docs/useDocuments";

// List documents
const { data, isLoading } = useDocuments({
  category: "leads",
  search: "query",
  limit: 20,
});

// Single document
const { data: document } = useDocument(documentId);

// Search
const { data: results } = useDocumentSearch({
  query: "search term",
});
```

---

#### `useDocsWebSocket`

Real-time document synchronization.

```typescript
import { useDocsWebSocket } from "@/hooks/docs/useDocsWebSocket";

const { isConnected, conflicts } = useDocsWebSocket();
```

---

#### `useAIGeneration`

AI-powered document generation.

```typescript
import { useAIGeneration } from "@/hooks/docs/useAIGeneration";

const { generateLeadDoc, generateWeeklyDigest, isGenerating } =
  useAIGeneration();

generateLeadDoc.mutate({ leadId: 123 });
```

---

#### `useDocsKeyboardShortcuts`

Document editor keyboard shortcuts.

```typescript
import { useDocsKeyboardShortcuts } from "@/hooks/docs/useDocsKeyboardShortcuts";

useDocsKeyboardShortcuts({
  onSave: () => handleSave(),
  onSearch: () => openSearch(),
  onNew: () => createNew(),
  onPreview: () => togglePreview(),
  onEscape: () => handleCancel(),
});
```

**Shortcuts:**

- `Ctrl+S / Cmd+S` - Save
- `Ctrl+K / Cmd+K` - Search
- `Ctrl+N / Cmd+N` - New document
- `Ctrl+P / Cmd+P` - Preview
- `Escape` - Cancel

---

### Utility Hooks

#### `useActionSuggestions`

AI-powered action suggestions.

```typescript
import { useActionSuggestions } from "@/hooks";

const { suggestions, isLoading } = useActionSuggestions({
  context: { emails: [...], calendar: [...] }
});
```

---

#### `useComposition`

Composition event handling for IME support.

```typescript
import { useComposition } from "@/hooks";

const {
  isComposing,
  compositionValue,
  handleCompositionStart,
  handleCompositionEnd,
} = useComposition<string>();
```

---

## Best Practices

### 1. Import from Central Index

```typescript
// ✅ Good
import { usePageTitle, useDebouncedValue } from "@/hooks";

// ❌ Avoid (unless needed for tree-shaking)
import { usePageTitle } from "@/hooks/usePageTitle";
```

### 2. Use TypeScript Types

All hooks are fully typed. Use TypeScript for better IDE support:

```typescript
const debouncedValue: string = useDebouncedValue(search, 300);
```

### 3. Handle Loading States

Always handle loading and error states:

```typescript
const { data, isLoading, error } = useDocuments();

if (isLoading) return <Loading />;
if (error) return <Error message={error.message} />;
```

### 4. Cleanup Effects

Hooks with side effects automatically cleanup, but be aware of dependencies:

```typescript
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup (automatic in most hooks)
  };
}, [dependencies]);
```

### 5. Performance Optimization

Use debouncing for search inputs and API calls:

```typescript
const debouncedSearch = useDebouncedValue(search, 300);
// Prevents excessive API calls
```

---

## Testing

Some hooks have tests in `client/src/hooks/__tests__/`:

- `useFridayChat.test.ts`
- `useFridayChatSimple.test.ts`
- `useKeyboardShortcuts.test.tsx`

**Note:** Test coverage is being expanded. See [HOOKS_TODO.md](../../../docs/development-notes/hooks/HOOKS_TODO.md) for planned tests.

---

## File Structure

```
client/src/hooks/
├── index.ts                    # Central export
├── usePageTitle.ts
├── useIsMobile.ts
├── useKeyboardShortcuts.ts
├── useDebouncedValue.ts
├── ... (other hooks)
├── crm/
│   ├── index.ts
│   └── ... (CRM hooks)
└── docs/
    └── ... (Docs hooks)
```

---

## Related Documentation

- [HOOKS_SYSTEM_REFACTOR.md](../../../docs/development-notes/hooks/HOOKS_SYSTEM_REFACTOR.md) - Refactoring history
- [HOOKS_TODO.md](../../../docs/development-notes/hooks/HOOKS_TODO.md) - Planned improvements
- [STATE_MANAGEMENT_GUIDE.md](../../../docs/core/guides/STATE_MANAGEMENT_GUIDE.md) - State management patterns

---

**Last Updated:** January 28, 2025  
**Maintained by:** TekupDK Development Team
