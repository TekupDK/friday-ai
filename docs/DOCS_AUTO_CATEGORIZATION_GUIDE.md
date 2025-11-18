# Documentation Auto-Categorization Guide

**Created:** 2025-01-28  
**Status:** Active

## Overview

The auto-categorization script automatically organizes markdown files in the `docs/` folder into a structured hierarchy based on filename patterns and content analysis.

## Quick Start

### Dry Run (Preview Changes)

```bash
npm run docs:categorize:dry-run
```

This shows what files would be moved without actually moving them.

### Execute Categorization

```bash
npm run docs:categorize
```

This will actually move files to their categorized locations.

### Verbose Mode

```bash
npm run docs:categorize:verbose
```

Shows detailed information about each file being processed.

## Category Structure

The script organizes files into the following categories:

### Status Reports (`status-reports/`)

- **sessions/** - Session status and summaries
- **sprints/** - Sprint planning and todos
- **phases/** - Phase completion reports
- **daily-progress/** - Daily progress updates
- **feature-status/** - Feature status reports
- **reviews/** - Code reviews and comprehensive reviews
- **todos/** - TODO audits and completed todos

### AI & Automation (`ai-automation/`)

- **docs-generation/** - AI documentation generation
- **friday-ai/** - Friday AI system documentation
- **agentic-rag/** - Agentic RAG implementation
- **guides/** - AI-related guides

### Email System (`email-system/`)

- **email-center/** - Email center features
- **leads/** - Lead flow and management
- **integrations/** - Email integrations (Gmail, Shortwave)
- **guides/** - Email system guides

### Integrations (`integrations/`)

- **langfuse/** - Langfuse integration
- **litellm/** - LiteLLM integration
- **chromadb/** - ChromaDB integration
- **tools/** - Tool calling and execution
- **general/** - General integration documentation

### CRM Business (`crm-business/`)

- **phases/** - CRM phase implementations
- **guides/** - CRM guides and analysis

### UI & Frontend (`ui-frontend/`)

- **components/** - UI components documentation
- **features/** - Frontend features (3-panel, virtual scrolling)
- **branding/** - Branding and logo documentation
- **guides/** - UI/UX guides

### DevOps & Deployment (`devops-deploy/`)

- **deployment/** - Deployment documentation
- **security/** - Security implementation and reviews
- **monitoring/** - Health checks and performance

### Development Notes (`development-notes/`)

- **fixes/** - Bug fixes and error handling
- **debugging/** - Debugging guides and reports
- **security/** - Security-related development notes
- **configuration/** - Configuration and setup
- **organization/** - Workspace organization

### Guides (`guides/`)

- **general/** - General guides
- **quick-start/** - Quick start guides
- **showcases/** - Showcase documentation
- **testing/** - Testing guides (accessibility, lighthouse, etc.)

### Core Documentation (`core/`)

- **architecture/** - System architecture
- **api/** - API reference and optimization
- **development/** - Development guides
- **guides/** - Core guides (RBAC, state management, etc.)
- **reference/** - Action catalogs and references
- **documentation/** - Documentation system docs

### Features (`features/`)

- **realtime/** - Realtime features
- **cursor-integration/** - Cursor integration
- **ab-testing/** - A/B testing

### Migration (`migration/`)

- **versioning/** - Version migration and updates

### Uncategorized (`uncategorized/`)

- **general/** - Files that don't match any pattern

## Files Kept in Root

These files remain in `docs/` root:

- `README.md`
- `ARCHITECTURE.md`
- `API_REFERENCE.md`
- `DEVELOPMENT_GUIDE.md`

## How It Works

1. **Scans** all `.md` files in `docs/` (recursively, excluding `archive/`)
2. **Categorizes** each file based on filename patterns
3. **Moves** files to appropriate `category/subcategory/` folders
4. **Skips** files already in correct location
5. **Warns** if target file already exists

## Categorization Rules

The script uses pattern matching with priority-based rules:

- **High Priority (100)**: Specific patterns like `SESSION_`, `PHASE[0-9]`, `FRIDAY_AI`
- **Medium Priority (80-90)**: General patterns like `_GUIDE`, `_STATUS`
- **Low Priority (70)**: Fallback patterns

Patterns are checked in priority order, so more specific rules take precedence.

## Examples

### Before

```
docs/
├── SESSION_STATUS_2025-01-28.md
├── AI_DOCS_COMPONENTS_AI.md
├── EMAIL_CENTER_ANALYSIS.md
└── CRM_PHASE1_COMPLETE.md
```

### After

```
docs/
├── README.md (kept in root)
├── ARCHITECTURE.md (kept in root)
├── status-reports/
│   └── sessions/
│       └── SESSION_STATUS_2025-01-28.md
├── ai-automation/
│   └── docs-generation/
│       └── AI_DOCS_COMPONENTS_AI.md
├── email-system/
│   └── email-center/
│       └── EMAIL_CENTER_ANALYSIS.md
└── crm-business/
    └── phases/
        └── CRM_PHASE1_COMPLETE.md
```

## Safety Features

1. **Dry Run Mode**: Always test with `--dry-run` first
2. **Skip Existing**: Files already in correct location are skipped
3. **Conflict Detection**: Warns if target file already exists
4. **Archive Protection**: `archive/` folder is never scanned

## Troubleshooting

### Too Many Uncategorized Files

If many files end up in `uncategorized/`, you can:

1. Review the patterns in `scripts/auto-categorize-docs.ts`
2. Add new category rules for common patterns
3. Manually move files that need special handling

### Files Not Moving

Check:

- Is the file already in the correct location?
- Does the target file already exist?
- Is the file in the `archive/` folder? (skipped by default)

### Broken Links

After moving files, you may need to:

1. Update internal markdown links
2. Update code references to documentation
3. Check for broken references

## Adding New Categories

To add a new category, edit `scripts/auto-categorize-docs.ts`:

```typescript
{
  pattern: /^YOUR_PATTERN/i,
  category: "your-category",
  subcategory: "your-subcategory",
  priority: 100
}
```

## Best Practices

1. **Always run dry-run first** to preview changes
2. **Commit before running** so you can revert if needed
3. **Review uncategorized files** and add rules if needed
4. **Update links** after moving files
5. **Keep core docs in root** for easy access

## Related Documentation

- `DOCS_CLEANUP_PLAN.md` - Original cleanup plan
- `ARCHITECTURE.md` - System architecture
- `DEVELOPMENT_GUIDE.md` - Development guidelines

---

**Last Updated:** 2025-01-28
