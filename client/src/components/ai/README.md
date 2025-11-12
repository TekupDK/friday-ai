# Friday AI components

This folder is reserved for AI-related UI components (chat panels, AI controls, suggestions, memory views, etc.).

Current codebase keeps most AI UI under `../chat` and a few top-level components (e.g. `AIChatBox`, `ChatPanel`, `SuggestionsBar`).

Guidelines:

- New AI-specific components can be added here going forward.
- For existing components, migrate gradually (or add thin wrappers only if needed).
- Our docs generator prefers this folder when present; otherwise it falls back to `../chat` and then a heuristic scan.

Docs generator:

- Default: `pnpm run docs:ai-components`
- Specific path: `pnpm run docs:ai-components -- client/src/components/ai`
