/**
 * Hooks - Central Export
 *
 * Central export file for all React hooks in Friday AI Chat.
 * Import hooks from here for cleaner imports.
 */

// Core hooks
export { useAuth } from "@/_core/hooks/useAuth";

// UI & Layout hooks
export { usePageTitle } from "./usePageTitle";
export { useIsMobile } from "./useIsMobile";
export {
  useKeyboardShortcuts,
  getAllKeyboardShortcuts,
  shouldIgnoreKeyboardEvent,
} from "./useKeyboardShortcuts";
export type { KeyboardShortcut } from "./useKeyboardShortcuts";

// Performance & Optimization hooks
export { useDebouncedValue } from "./useDebouncedValue";
export { useAdaptivePolling } from "./useAdaptivePolling";
export { useRateLimit } from "./useRateLimit";
export { usePersistFn } from "./usePersistFn";

// Chat hooks
export { useFridayChat } from "./useFridayChat";
export { useFridayChatSimple } from "./useFridayChatSimple";
export { useStreamingChat, useFallbackStreaming } from "./useStreamingChat";
export { useChatInput } from "./useChatInput";
export { useOpenRouter } from "./useOpenRouter";

// Email hooks
export { useEmailActions } from "./useEmailActions";
export { useEmailKeyboardShortcuts } from "./useEmailKeyboardShortcuts";

// Action & Suggestion hooks
export { useActionSuggestions } from "./useActionSuggestions";

// Composition hooks
export { useComposition } from "./useComposition";

// CRM hooks (re-export from crm subdirectory)
export * from "./crm";

// Docs hooks (re-export from docs subdirectory)
export * from "./docs/useDocuments";
export * from "./docs/useDocsWebSocket";
export * from "./docs/useAIGeneration";
export {
  useDocsKeyboardShortcuts,
  DocsKeyboardShortcutsHint,
} from "./docs/useDocsKeyboardShortcuts";
