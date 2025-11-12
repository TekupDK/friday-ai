# Friday Chat Improvements - Implementation Plan

## Status: PARTIAL IMPLEMENTATION

### ✅ Completed

1. Hide verbose `[Action Executed]` system messages - cleaner chat UI

### 🚀 Quick Wins (Next 30 min)

1. **Optimistic UI** - Show user message immediately before API response
2. **Cache Strategy** - Keep previous data while switching conversations
3. **Error Boundary** - Prevent whole app crash on message render errors

### 📋 Full Implementation (2-3 hours)

1. **Streaming** - Connect frontend to existing SSE backend endpoint
   - Backend: `/api/trpc/chat.sendMessageStream` EXISTS ✅
   - Frontend: Need to implement SSE connection + buffered parsing
   - Features: Stop button, ESC key, partial message on cancel

2. **Message Virtualization** - Use imported `@tanstack/react-virtual`
   - Library: IMPORTED ✅
   - Implementation: Apply to message list

3. **Keyboard Shortcuts**
   - `Cmd+K` - Search conversations
   - `Cmd+N` - New conversation
   - `ESC` - Clear input / close mobile sidebar
   - `↑/↓` - Navigate conversation history

4. **Context Usage** - Make Friday actually USE the context we send
   - Currently: Context is logged but not used in AI prompts
   - Fix: Update backend to include context in system prompt

5. **Auto-title Feedback** - Show "Generating title..." loading state

### 🔄 Decision: Focus on Quick Wins first

User wants everything, but let's deliver value incrementally.
Next step: Implement Optimistic UI + Cache improvements (high ROI, low risk)
