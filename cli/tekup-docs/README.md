# Tekup Docs CLI

Command-line tool for managing documentation in the Tekup AI project.

## Installation

### Local Development

```bash
cd cli/tekup-docs
pnpm install
pnpm link --global
```

### Usage After Installation

```bash
tekup-docs --help
```

## Commands

### List Documents

```bash
# List all documents
tekup-docs list

# Filter by category
tekup-docs list --category="API"

# Filter by tags
tekup-docs list --tags="email,api"
```

### Create Document

```bash
# Interactive mode
tekup-docs create

# With title
tekup-docs create "New Feature Documentation"

# With template
tekup-docs create "API Endpoint" --template=api

# Full example
tekup-docs create "Email Sync Feature" \
  --category="Features" \
  --tags="email,sync,api" \
  --template=feature
```

### Edit Document

```bash
# Edit by ID
tekup-docs edit abc-123-def

# Edit by path
tekup-docs edit docs/API_REFERENCE.md
```

### Search Documents

```bash
# Search by query
tekup-docs search "email sync"

# Search with filters
tekup-docs search "api" --category="API" --author="john"
```

### View Document

```bash
# View by ID
tekup-docs view abc-123-def

# View by path
tekup-docs view docs/ARCHITECTURE.md

# View with formatting
tekup-docs view abc-123-def --format=pretty
```

### Git Operations

```bash
# Sync with Git (pull + push pending changes)
tekup-docs sync

# Push changes only
tekup-docs push --message="Updated API docs"

# Pull changes only
tekup-docs pull

# Check sync status
tekup-docs status

# Resolve conflict
tekup-docs resolve abc-123-def --strategy=local
tekup-docs resolve abc-123-def --strategy=remote
tekup-docs resolve abc-123-def --strategy=manual
```

### AI Operations

```bash
# Generate documentation from prompt
tekup-docs ai generate "Create documentation for the email sync feature" \
  --context="server/email/*.ts" \
  --category="Features"

# Improve existing documentation
tekup-docs ai improve abc-123-def \
  --focus=clarity,examples

# Summarize documentation
tekup-docs ai summarize abc-123-def --max-length=500

# Audit documentation quality
tekup-docs ai audit
```

### Batch Operations

```bash
# Create multiple documents from JSON
tekup-docs batch create --from=docs.json

# Update multiple documents
tekup-docs batch update --filter="category:API" --set="tags:updated"

# Export documents
tekup-docs export --category="API" --format=pdf
```

### Interactive Mode (TUI)

```bash
# Launch Terminal UI
tekup-docs tui
```

## Configuration

Create `.tekup-docs.json` in your project root:

```json
{
  "repoPath": "./",
  "docsPath": "docs",
  "branch": "main",
  "autoCommit": true,
  "autoPush": false,
  "defaultCategory": "General",
  "defaultTags": [],
  "templates": {
    "api": "templates/api-doc.md",
    "feature": "templates/feature-doc.md",
    "guide": "templates/guide-doc.md"
  },
  "editor": "code",
  "ai": {
    "provider": "openrouter",
    "model": "anthropic/claude-3.5-sonnet"
  }
}
```

## Templates

Templates are markdown files with placeholders:

```markdown
# {{title}}

**Category:** {{category}}  
**Tags:** {{tags}}  
**Author:** {{author}}  
**Date:** {{date}}

---

## Overview

{{description}}

## Details

...
```

Place templates in `cli/tekup-docs/templates/`.

## Environment Variables

```bash
# API endpoint
TEKUP_DOCS_API=http://localhost:3000

# Authentication
TEKUP_DOCS_TOKEN=your-api-token

# AI Provider (uses existing OpenRouter config)
OPENROUTER_API_KEY=your-key
```

## Examples

### Create and Push a New Document

```bash
# Create document
tekup-docs create "New Feature: Real-time Sync" \
  --category="Features" \
  --tags="realtime,sync"

# Edit in your editor (opens automatically)
# Save and close

# Push to Git
tekup-docs push --message="Add real-time sync documentation"
```

### Update Documentation with AI

```bash
# Improve existing doc
tekup-docs ai improve docs/EMAIL_SYNC.md --focus=examples

# Generate from code
tekup-docs ai generate "Document the email sync engine" \
  --context="server/email/sync-engine.ts"
```

### Search and View

```bash
# Search
tekup-docs search "websocket" 

# View result
tekup-docs view abc-123-def --format=pretty
```

### Batch Operations

```bash
# Create docs.json
cat > docs.json << EOF
{
  "documents": [
    {
      "title": "Feature A",
      "content": "# Feature A\n...",
      "category": "Features",
      "tags": ["feature", "new"]
    },
    {
      "title": "Feature B",
      "content": "# Feature B\n...",
      "category": "Features",
      "tags": ["feature", "new"]
    }
  ]
}
EOF

# Batch create
tekup-docs batch create --from=docs.json
```

## Development

### Project Structure

```
cli/tekup-docs/
├── src/
│   ├── commands/       # Command implementations
│   ├── api/            # API client
│   ├── git/            # Git operations
│   ├── ai/             # AI integrations
│   ├── tui/            # Terminal UI
│   ├── utils/          # Utilities
│   └── index.ts        # Entry point
├── templates/          # Document templates
├── package.json
└── README.md
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

## Troubleshooting

### Permission Denied

```bash
# Give execute permission
chmod +x $(which tekup-docs)
```

### Command Not Found

```bash
# Re-link
pnpm link --global
```

### Git Conflicts

```bash
# Check status
tekup-docs status

# Resolve conflicts
tekup-docs resolve --list
tekup-docs resolve <doc-id> --strategy=local
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](../../LICENSE) for details.
