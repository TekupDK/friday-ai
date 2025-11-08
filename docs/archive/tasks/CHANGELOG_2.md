# Chat System — Changelog

All notable changes to this task will be documented here.
Format: YYYY-MM-DD · type(scope): description

## 2025-11-06

- feat(chat): implement modern conversation navigation with emoji titles
- feat(chat): add automatic emoji injection for legacy conversation titles
- feat(chat): add message preview (40 chars) in conversation list
- feat(chat): implement hover actions (edit/delete) with inline rename
- feat(chat): add modern visual states (gradient borders, shadows, blue theme)
- feat(chat): add relative timestamps ("4 t siden", "1 d siden")
- fix(chat): prevent message preview overlap with padding and max-width
- perf(chat): optimize message preview truncation (60→40 chars)
- style(chat): improve spacing and readability (padding, icon sizes)
- refactor(chat): create ensureTitleHasEmoji() for backward compatibility
- feat(tools): add ToolRegistry with zod validation + approval gating
- sec(tools): require approval for destructive tools (create/update/delete calendar, create_billy_invoice)
- feat(analytics): audit log tool calls via trackEvent (tool_call with correlationId)
- fix(gmail): add bcc to create_gmail_draft schema; clarify search_gmail description

### Navigation improvements detail

- **Emoji Title System** (3-tier fallback):
  - Tier 1: Intent-based (💼 Lead, 📅 Møde, 🏠 Flytter, 📧 Email, etc.)
  - Tier 2: Keyword-based (✨ Hovedrengøring, 🔄 Fast rengøring, etc.)
  - Tier 3: AI-generated with Gemma 3 27B (max 32 chars with emoji)
  - Tier 4: Fallback (💬 Samtale {time})
- **Frontend emoji injection**: Adds emoji to old titles without DB migration
- **Message preview**: Shows first 40 chars of last message under title
- **Hover actions**: Edit (inline rename) and Delete (with confirmation)
- **Visual polish**: Gradient borders, blue highlights, improved spacing

### Commits

- c544059: Modern chat navigation: Emoji titles + Message preview + Hover actions
- 6608d4e: UI Fix: Forbedret chat navigation layout og læsbarhed
- b1ce9c5: Frontend emoji injection: Tilføj emoji til legacy conversation titles
- bcc71f0: Fix: Kort message preview (60→40 chars) + padding for hover actions

## 2025-11-04

- docs: add STATUS.md and CHANGELOG.md for chat task
- docs: update PLAN.md with Phase 2 completion (AI suggestions via Gemini)
- docs: update tasks/README.md to reflect chat task in progress (Phase 3)

## 2025-11 (earlier)

- feat(chat): add icons to suggestion cards with hover states (Phase 3)
- feat(chat): replace static suggestions with AI-powered Gemini analysis
- feat(chat): implement getSuggestions TRPC endpoint
- feat(chat): add audit logging for action lifecycle events
- feat(chat): implement idempotency manager with in-memory store
- feat(chat): implement executeAction with idempotency keys
- feat(chat): implement dryRunAction TRPC endpoint
- feat(chat): finalize ActionCatalog schema and validators
- feat(chat): build and deploy MVP UI (ApprovalModal, SuggestionsBar)
- feat(chat): gate chat features with FRIDAY_ACTION_SUGGESTIONS flag
