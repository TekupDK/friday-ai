# 🤖 AI Assistant – Left Panel (3-Panel Layout)

## Overview

- Purpose: Persistent AI assistant at 25% width in the 3‑panel desktop layout (AI | Email | Workflow).
- Modes: Chat, Voice, Agent, Smart.
- Rendering: Header + Tabs are visible in the panel. Mode content scrolls independently.
- ChatPanel is embedded with `hideHeader={true}` (to avoid duplicate headers).

## File Map

- Panels
  - `client/src/components/panels/AIAssistantPanel.tsx`
- Chat
  - `client/src/components/ChatPanel.tsx`
- AI Modes
  - `client/src/components/ai-modes/VoiceMode.tsx`
  - `client/src/components/ai-modes/AgentMode.tsx`
  - `client/src/components/ai-modes/SmartMode.tsx`
- Context
  - `client/src/contexts/AIContext.tsx` (active mode + prefs)
  - `client/src/contexts/EmailContext.tsx` (Shortwave-like context for LLM)
- Tests
  - `client/src/components/panels/__tests__/AIAssistantPanel.test.tsx`

## Current State (Implemented)

- Layout
  - Left panel integrated with `ResizablePanel` (desktop) and single column on mobile.
  - ChatPanel header is hidden in embedded mode; compact padding and smaller welcome UI.
- LLM Integration
  - tRPC: `chat.list/get/sendMessage/executeAction`.
  - Context sent per message (see “LLM Context Schema”).
- Accessibility & Testability
  - `aria-live="polite"` on messages container.
  - Roles/labels: `role=list`/`listitem` for messages and suggestions.
  - `data-testid` for panel/input/send/stop/messages/suggestions.
  - Panel is focusable with focus ring.
- Keyboard
  - Enter = send, Shift+Enter = new line.
  - Global shortcuts (Ctrl/Alt+1) focus AI panel.
- Approval Flow
  - `ActionApprovalModal` wired (approve/reject callbacks).

## Deep Review + Action Plan

- Status: ChatPanel embed er robust (Popover dropdown, compact controls, skeletons, a11y/testids, rig LLM‑kontekst).
- Quick wins næste:
  - Fokus tilbage i textarea efter send.
  - Genveje: Ctrl+Enter=send, Esc=luk popover.
  - Ryd ubrugt import (Badge, Input).
  - Typesafety for `executeAction` response (undgå `any`).
  - Optional: boble max‑width finjustering i embedded; suggestion chips vandret med snap.

## LLM Context Schema (ChatPanel)

Sent with each message (cleaned of `undefined` and empty arrays):

- `page`: "email-tab" when path includes `/inbox`.
- `selectedThreads`: string[] from `EmailContext.state.selectedThreads`.
- `emailFolder`: `inbox | sent | archive | starred`.
- `emailViewMode`: `list | pipeline | dashboard`.
- `emailOpenThreadId`: string | undefined.
- `emailSelectedLabels`: string[] | undefined.
- `emailSearchQuery`: string | undefined.
- `emailContextText`: human‑readable summary from `EmailContext.getContextForAI()`.

See also: `SHORTWAVE_CONTEXT_FEATURE.md` for intent and tests.

## UX Spec (Chat in left panel)

- Empty state
  - Welcome card with 4 suggestions. In narrow layout: compact paddings; grid layout.
- Conversation
  - Messages animate in; bubbles adapt to sender (user vs assistant).
  - Dropdown for conversation switching exists i header; kompakt selector i embedded mode.
- Input
  - Auto‑resizing textarea. Send button enabled when input is non‑empty. Placeholder for Stop button.

## Open Items (Backlog)

- Stop streaming
  - Add abort/stop for in‑flight LLM request (AbortController + mutation cancel, UI state).
- VoiceMode → STT + LLM
  - Bind mic transcript to send pipeline.
- Keyboard enhancers
  - Ctrl+Enter=send, Esc=close popover.
- Tests
  - ChatPanel unit tests (send, suggestions, a11y). E2E for action approvals og popover/skeleton states.
- A11y polish
  - Landmarks/regions and labels for buttons where helpful.

## Acceptance Criteria

- Left panel fits 25% width, header + tabs visible, content scrollable.
- ChatPanel embedded without duplicate header.
- A11y: screen readers announce new messages; input/controls are labeled.
- LLM receives Shortwave-like context fields consistently.
- Keyboard: Enter/Shift+Enter work; Ctrl/Alt+1 focuses panel.
- No layout shift when switching modes; animation subtle and performant.

## Manual Test Checklist

- Focus AI panel with Ctrl+1 and Alt+1.
- Empty chat → suggestions visible; clicking suggestion fills input.
- Type+Enter sends; Shift+Enter adds newline; send button disabled on empty input.
- Approval modal appears when backend returns `pendingAction`; approve/reject updates state.
- Messages container auto‑scrolls on new messages.
- A11y: VoiceOver/NVDA reads message list and suggestions; input has aria‑label; send/stop buttons labeled.

## Risks & Notes

- Stop streaming requires small transport change in tRPC/fetch; UI already in place.
- Conversation switching in embedded mode is implemented via compact selector.
- Dropdown clipping is mitigated by Popover in both header and embedded controls.

## Changelog (Left Panel)

- Added compact conversation selector in embedded mode (left panel).
- Switched conversation dropdowns to Popover (header + embedded).
- Added skeleton loaders for conversations and messages.
- Added a11y/test IDs to ChatPanel.
- Extended LLM context with detailed email state and `getContextForAI()` text.
- Adjusted paddings and layout tweaks for narrow column.
- Ensured memoization and error boundaries are preserved.
- **Final session updates:**
  - Implemented Stop streaming via AbortController (splitLink for chat.sendMessage).
  - Enhanced keyboard: Ctrl/Cmd+Enter=send, Escape=close popover.
  - Focus returns to textarea after send.
  - Improved typesafety: ActionResult interface for executeAction response.
  - Added comprehensive unit tests (ChatPanel.test.tsx) covering send, suggestions, keyboard, embedded mode, loading states, context passing.

## Task Status: ✅ COMPLETED

All major features for left panel (AI Assistant) are implemented and tested:

- Layout integration with 3-panel design
- Chat functionality with LLM integration and rich context
- Stop streaming capability
- Accessibility and testability
- Comprehensive unit test coverage
- Documentation updated
