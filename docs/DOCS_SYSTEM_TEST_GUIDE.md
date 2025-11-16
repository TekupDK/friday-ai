# Documentation System - Test Guide

**Oprettet:** 8. November 2025, 20:50
**Status:** Ready for Testing

---

## 🚀 Quick Start Test

### 1. Database Migration

```bash
# Generate migration fra schema
pnpm db:generate

# Kør migration
pnpm db:migrate:dev

```text

**Forventet output:**

```text
✓ Generated SQL migration
✓ Applied migration: create-documentation-tables

```text

### 2. Enable Docs Service

Tilføj til `.env.dev`:

```env
DOCS_ENABLE=true
DOCS_REPO_PATH=./
DOCS_PATH=docs
DOCS_GIT_BRANCH=main
DOCS_AUTO_COMMIT=true
DOCS_AUTO_PUSH=false
DOCS_WS_PORT=3002

```text

### 3. Start Server

```bash
pnpm dev

```text

**Forventet i logs:**

```text
[Docs] Service started { repoPath: './', docsPath: 'docs', branch: 'main', wsPort: 3002 }
[GitSync] Initialized { repoPath: './', branch: 'main' }
[GitSync] File watcher started { cwd: 'C:\\Users\\...\\docs' }
[WSHub] WebSocket server started { addr: { port: 3002 } }

```text

### 4. Install & Test CLI

```bash
cd cli/tekup-docs
pnpm install
pnpm link

# Test CLI
tekup-docs --help
tekup-docs status

```bash

---

## 🧪 Test Scenarios

### Test 1: Git Sync ✅

**Mål:** Verificer at file watcher + auto-commit virker

```bash
# 1. Rediger en .md fil
echo "# Test Doc" > docs/TEST_DOC.md

# 2. Vent 2 sekunder

# 3. Check Git log
git log -1 --oneline

# Forventet: "docs: update 1 file(s) (docs/TEST_DOC.md)"

```text

**Logs at se efter:**

```text
[Docs] file added { path: 'TEST_DOC.md' }
[GitSync] Committed changes { count: 1 }
[Docs] sync complete { count: 1 }

```text

### Test 2: API Endpoints ✅

**Mål:** Verificer tRPC endpoints virker

```bash
# Test via CLI
export DOCS_API_URL=<http://localhost:3000>

# List docs (skal virke selv hvis tom)
tekup-docs list

# Create document
tekup-docs create "Test Document" \
  --category="Test" \
  --tags="test,cli" \
  --path="test.md"

# Forventet: "✓ Document created: Test Document"

```text

**Eller test direkte i browser/Postman:**

```text
GET <http://localhost:3000/api/trpc/docs.list?input={}>

```text

### Test 3: WebSocket ✅

**Mål:** Verificer real-time connection virker

```bash
# Install wscat hvis ikke allerede
npm install -g wscat

# Connect
wscat -c "ws://localhost:3002?userId=test-user"

# Send subscription
> {"type":"doc:subscribe","document_id":"test-123"}

# Forventet response
< {"type":"presence:joined","user_id":"test-user","document_id":"test-123"}

```text

### Test 4: CLI CRUD ✅

**Mål:** Test alle CLI commands

```bash
# Create
DOC_ID=$(tekup-docs create "CLI Test" --category="Test" | grep "ID:" | awk '{print $2}')

# View
tekup-docs view $DOC_ID

# Edit
tekup-docs edit $DOC_ID --title="CLI Test Updated"

# Search
tekup-docs search "CLI Test"

# Delete (med confirmation)
tekup-docs delete $DOC_ID

# Force delete
tekup-docs delete $DOC_ID --force

```text

### Test 5: Comments ✅

**Mål:** Test comment system

```bash
# Create doc
DOC_ID=$(tekup-docs create "Comment Test" --category="Test" | grep "ID:" | awk '{print $2}')

# Add comment via tRPC (i browser eller curl)
curl -X POST <http://localhost:3000/api/trpc/docs.addComment> \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "documentId": "'$DOC_ID'",
      "content": "Great documentation!",
      "lineNumber": 5
    }
  }'

# View med comments
tekup-docs view $DOC_ID --comments

```text

### Test 6: Conflict Resolution ✅

**Mål:** Test conflict detection (avanceret)

```bash
# 1. Disable auto-commit (i .env.dev)
DOCS_AUTO_COMMIT=false

# 2. Rediger en fil lokalt
echo "Local change" >> docs/test.md

# 3. Simuler remote change (i anden branch eller manual)
git checkout -b test-conflict
echo "Remote change" >> docs/test.md
git add docs/test.md
git commit -m "Remote change"
git checkout main

# 4. Pull (vil skabe conflict)
git pull origin test-conflict

# 5. Check conflicts
tekup-docs status

# 6. Resolve
tekup-docs resolve <conflict-id> --local

```bash

---

## ✅ Success Criteria

| Test         | Criteria                         | Status |
| ------------ | -------------------------------- | ------ |
| Migration    | Tables created i database        | ⏳     |
| Server Start | Docs service logs visible        | ⏳     |
| Git Sync     | Auto-commit efter file change    | ⏳     |
| WebSocket    | Connection established           | ⏳     |
| API          | List/Create/Update/Delete virker | ⏳     |
| CLI          | All commands executable          | ⏳     |
| Comments     | Can add/view comments            | ⏳     |
| Search       | Full-text + facets virker        | ⏳     |

---

## 🐛 Troubleshooting

### Database Issues

**Problem:** Migration fejler

```bash
# Reset database (CAUTION!)
pnpm db:drop
pnpm db:push

# Eller manuel migration
psql $DATABASE_URL -f drizzle/migrations/create-documentation-tables.sql

```bash

### Git Sync Issues

**Problem:** File watcher ikke reagerer

```bash
# Check at docs path er korrekt
ls -la docs/

# Verificer Git repo
git status

# Check logs for fejl
# Kig efter [GitSync] eller [Docs] entries

```text

### WebSocket Issues

**Problem:** Connection refused

```bash
# Check om port 3002 er ledig
netstat -an | grep 3002

# Eller brug anden port
DOCS_WS_PORT=3003

```text

### CLI Issues

**Problem:** Command not found

```bash
# Re-link
cd cli/tekup-docs
pnpm link --force

# Eller kør direkte
node dist/index.js --help

```text

**Problem:** TypeScript fejl

```bash
# Rebuild
pnpm build

# Eller kør i dev mode
pnpm dev

```

---

## 📝 Test Checklist

Brug denne til at tracke test progress:

- [ ] Database migration kørt
- [ ] Server starter med docs service
- [ ] Git sync auto-commit virker
- [ ] WebSocket connection virker
- [ ] CLI installeret og linked
- [ ] CLI `list` virker
- [ ] CLI `create` virker
- [ ] CLI `view` virker
- [ ] CLI `search` virker
- [ ] CLI `edit` virker
- [ ] CLI `delete` virker
- [ ] CLI `status` virker
- [ ] Comments kan tilføjes
- [ ] Comments vises i CLI
- [ ] Search returnerer resultater
- [ ] Facets vises korrekt

---

## 🎯 Næste Efter Tests

Når alle tests er grønne:

1. ✅ Backend verified
1. ✅ CLI verified
1. 🚀 **Start frontend portal**
1. 🤖 **Add AI integration**
1. 🧪 **Write automated tests**

---

**Status:** Klar til test! Start med migration og server startup.
