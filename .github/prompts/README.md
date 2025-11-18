# Repository Prompts (Synced from .cursor/commands)

This directory contains a copy of prompt command files from `.cursor/commands`, organized for GitHub visibility and usage with tools that read from `.github/prompts`.

- Source: `.cursor/commands`
- Target: `.github/prompts`
- Sync script: `pnpm sync:prompts` or `npm run sync:prompts`

Notes:
  - The `_meta` and `_meta/archive` folders are intentionally excluded.
  - Markdown command files are converted to Copilot Chat prompt files with extension `*.prompt.md`.
- Structure is preserved.
