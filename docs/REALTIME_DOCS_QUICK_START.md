# Real-time Documentation System - Quick Start Guide

**Status:** 🟡 Ready for Implementation
**Last Updated:** November 8, 2025
**Version:** 1.0.0

---

## 🚀 Quick Start

Get the real-time documentation system up and running in 5 minutes.

### Step 1: Install Dependencies

```bash
# Install all required packages
pnpm add simple-git@^3.20.0 chokidar@^3.5.3 ws@^8.14.2 commander@^11.1.0 inquirer@^9.2.12 chalk@^5.3.0 ora@^7.0.1 markdown-it@^14.0.0 gray-matter@^4.0.3

# Install dev dependencies
pnpm add -D @types/ws@^8.5.9 @types/markdown-it@^13.0.7 @types/inquirer@^9.0.7

```text

### Step 2: Configure Environment

Add to your `.env.dev`:

```bash
# Documentation System Configuration
DOCS_REPO_PATH=./
DOCS_PATH=docs
DOCS_GIT_BRANCH=main
DOCS_AUTO_COMMIT=true
DOCS_AUTO_PUSH=false
DOCS_WS_PORT=3002

```text

### Step 3: Run Database Migrations

```bash
# Create documentation tables
pnpm db:migrate:dev

```text

### Step 4: Start the Documentation Service

```bash
# Start dev server (includes docs service)
pnpm dev

```text

### Step 5: Install CLI Tool (Optional)

```bash
cd cli/tekup-docs
pnpm install
pnpm link --global

# Test installation
tekup-docs --version

```text

---

## 📖 Basic Usage

### From CLI

```bash
# List all documentation
tekup-docs list

# Create new document
tekup-docs create "New Feature Documentation" \
  --category="Features" \
  --tags="feature,api"

# Search documentation
tekup-docs search "email sync"

# Sync with Git
tekup-docs sync

```text

### From API

```typescript
// Fetch all documents
const response = await fetch("<http://localhost:3000/api/docs>");
const docs = await response.json();

// Create new document
await fetch("<http://localhost:3000/api/docs",> {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "New Doc",
    content: "# New Doc\n\nContent here...",
    category: "API",
    tags: ["api", "new"],
  }),
});

```text

### From WebSocket

```typescript
import { WebSocket } from "ws";

const ws = new WebSocket("ws://localhost:3002?userId=user123");

// Subscribe to document updates
ws.send(
  JSON.stringify({
    type: "doc:subscribe",
    document_id: "doc-uuid",
  })
);

// Listen for updates
ws.on("message", data => {
  const event = JSON.parse(data.toString());
  console.log("Document updated:", event);
});

```text

---

## 🏗️ Project Structure

```bash
tekup-ai-v2/
├── server/
│   └── docs/
│       ├── types.ts                    # Type definitions ✅
│       ├── sync/
│       │   └── git-sync-engine.ts     # Git synchronization ✅
│       ├── ws/
│       │   └── websocket-hub.ts       # Real-time collaboration ✅
│       ├── api/
│       │   └── docs-router.ts         # API routes 🔄
│       └── ai/
│           └── docs-agent.ts          # AI integration 🔄
│
├── cli/
│   └── tekup-docs/
│       ├── package.json               # CLI package ✅
│       ├── src/
│       │   ├── index.ts              # CLI entry point ✅
│       │   ├── commands/             # Command implementations 🔄
│       │   ├── api/                  # API client 🔄
│       │   └── utils/                # Utilities 🔄
│       └── README.md                 # CLI documentation ✅
│
├── client/
│   └── src/
│       └── pages/
│           └── docs/                 # Documentation portal 🔄
│
└── docs/
    ├── REALTIME_DOCS_SYSTEM_ARCHITECTURE.md      ✅
    ├── REALTIME_DOCS_QUICK_START.md              ✅
    ├── DOCUMENTATION_SYSTEM_DEPENDENCIES.md       ✅
    └── *.md                          # Your existing docs

Legend:
✅ Complete
🔄 In Progress
⏳ Pending

```bash

---

## 🔧 Configuration Options

### Git Sync Configuration

```typescript
const gitConfig = {
  repoPath: process.env.DOCS_REPO_PATH || "./",
  docsPath: process.env.DOCS_PATH || "docs",
  branch: process.env.DOCS_GIT_BRANCH || "main",
  autoCommit: process.env.DOCS_AUTO_COMMIT === "true",
  autoPush: process.env.DOCS_AUTO_PUSH === "true",
  commitMessage: files => `docs: Update ${files.length} file(s)`,
  watchPatterns: ["**/*.md"],
  ignorePatterns: ["**/node_modules/**", "**/.git/**"],
};

```text

### WebSocket Configuration

```typescript
const wsConfig = {
  port: parseInt(process.env.DOCS_WS_PORT || "3002"),
  heartbeatInterval: 30000, // 30 seconds
  maxConnections: 1000,
};

```text

### AI Configuration

```typescript
const aiConfig = {
  provider: "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY,
  model: "anthropic/claude-3.5-sonnet",
  maxTokens: 4000,
  temperature: 0.7,
};

```bash

---

## 🧪 Testing

### Test Git Sync

```bash
# Create a test document
echo "# Test Doc" > docs/TEST.md

# Wait 2 seconds for auto-commit
sleep 2

# Check Git log
git log -1 --oneline
# Should show: "docs: Update 1 file(s)"

```text

### Test WebSocket

```bash
# Terminal 1: Start server
pnpm dev

# Terminal 2: Connect with wscat
npm install -g wscat
wscat -c "ws://localhost:3002?userId=test"

# Send subscription
{"type":"doc:subscribe","document_id":"test-123"}

```text

### Test CLI

```bash
# List documents
tekup-docs list

# Create document
tekup-docs create "Test Document"

# Check sync status
tekup-docs status

```text

---

## 🐛 Troubleshooting

### Issue: Dependencies Not Found

```bash
# Clear pnpm cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install

```text

### Issue: TypeScript Errors

```bash
# Check TypeScript configuration
pnpm check

# If logger errors persist, see server/docs/sync/git-sync-engine.ts
# The pino logger expects: logger.info('message', { context })

```bash

### Issue: Git Sync Not Working

```bash
# Check Git repository
git status

# Verify configuration
echo $DOCS_REPO_PATH
echo $DOCS_PATH
echo $DOCS_GIT_BRANCH

# Check file watcher
# Files should be in the watched directory
ls -la docs/

```text

### Issue: WebSocket Connection Failed

```bash
# Check if port is available
netstat -an | grep 3002

# Verify WebSocket server started
# Look for: "[WSHub] WebSocket server started" in logs
pnpm logs

```text

### Issue: CLI Command Not Found

```bash
# Re-link globally
cd cli/tekup-docs
pnpm link --global

# Or use npx
npx tekup-docs list

```bash

---

## 📝 Next Steps

### Phase 1: Core Implementation (This Week)

1. **Fix TypeScript Issues**
   - Update logger usage in git-sync-engine.ts
   - Add missing type definitions
   - Fix iterator issues with downlevelIteration

1. **Complete API Router**
   - Implement tRPC procedures
   - Add authentication middleware
   - Set up rate limiting

1. **Build CLI Commands**
   - Implement all command handlers
   - Add API client
   - Create utilities

### Phase 2: Real-time Features (Next Week)

1. **WebSocket Integration**
   - Connect to API server
   - Add presence tracking
   - Implement collaborative features

1. **Frontend Portal**
   - Create documentation browser
   - Add markdown renderer
   - Implement live updates

### Phase 3: AI Features (Week 3)

1. **AI Documentation Agent**
   - Document generation
   - Content improvement
   - Quality analysis

1. **Automated Workflows**
   - Auto-update on code changes
   - Smart suggestions
   - Context-aware assistance

### Phase 4: Production Ready (Week 4)

1. **Testing & QA**
   - Unit tests
   - Integration tests
   - E2E tests

1. **Deployment**
   - CI/CD pipeline
   - Production config
   - Monitoring setup

---

## 🎯 Success Criteria

- [ ] All dependencies installed
- [ ] Database migrations complete
- [ ] Git sync operational
- [ ] CLI tool functional
- [ ] WebSocket server running
- [ ] API endpoints responding
- [ ] Basic documentation CRUD working
- [ ] Real-time updates functioning

---

## 📚 Additional Resources

- **Architecture:** [REALTIME_DOCS_SYSTEM_ARCHITECTURE.md](./REALTIME_DOCS_SYSTEM_ARCHITECTURE.md)
- **Dependencies:** [DOCUMENTATION_SYSTEM_DEPENDENCIES.md](./DOCUMENTATION_SYSTEM_DEPENDENCIES.md)
- **CLI Guide:** [cli/tekup-docs/README.md](../cli/tekup-docs/README.md)
- **API Reference:** [API_REFERENCE.md](./API_REFERENCE.md)

---

## 💬 Support

For questions or issues:

1. Check existing documentation
1. Review troubleshooting section
1. Check GitHub issues
1. Ask in team chat

---

**Status:** Ready to proceed with implementation!

**Next Command:**

```bash
pnpm add simple-git chokidar ws commander inquirer chalk ora markdown-it gray-matter @types/ws @types/markdown-it @types/inquirer -D

```
