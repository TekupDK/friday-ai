# Real-time Documentation System Architecture

**Status:** 🟢 Active Development  
**Last Updated:** November 8, 2025  
**Version:** 1.0.0

---

## 🎯 Overview

This document describes the architecture for the Tekup AI real-time documentation system with CLI integration, Git synchronization, and AI-powered workflows.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Documentation Portal                      │
│                    (React + WebSocket)                        │
└────────────┬────────────────────────────────┬────────────────┘
             │                                │
    ┌────────▼────────┐            ┌─────────▼──────────┐
    │  WebSocket Hub  │            │   REST API Server  │
    │  (Real-time)    │            │  (CRUD + Search)   │
    └────────┬────────┘            └─────────┬──────────┘
             │                                │
    ┌────────▼────────────────────────────────▼──────────┐
    │         Documentation Sync Engine                   │
    │   (Git Integration + Conflict Resolution)          │
    └────────┬──────────────┬──────────────┬─────────────┘
             │              │              │
    ┌────────▼──────┐  ┌───▼────────┐  ┌──▼──────────────┐
    │  Git Monitor  │  │  File Watcher │  │  Change Queue   │
    │  (Webhook)    │  │  (FS Events) │  │  (Redis/Memory) │
    └───────────────┘  └──────────────┘  └─────────────────┘
             │              │              │
    ┌────────▼──────────────▼──────────────▼─────────────┐
    │              Git Repository                         │
    │           (Source of Truth)                         │
    └─────────────────────────────────────────────────────┘
             ▲                                ▲
             │                                │
    ┌────────┴──────────┐          ┌─────────┴────────────┐
    │   CLI Tool        │          │  AI Documentation    │
    │   (tekup-docs)    │          │  Agent               │
    └───────────────────┘          └──────────────────────┘
```

## 📋 Core Components

### 1. Documentation API Server (`server/docs/`)
- **Purpose:** RESTful API for documentation CRUD operations
- **Technology:** Express + tRPC
- **Features:**
  - Document creation, reading, updating, deletion
  - Full-text search with metadata
  - Version history and diff tracking
  - Access control and permissions
  - AI-powered content suggestions

### 2. Real-time Sync Engine (`server/docs/sync/`)
- **Purpose:** Bidirectional Git synchronization
- **Technology:** Node.js + simple-git
- **Features:**
  - File system watching for local changes
  - Git webhook integration for remote changes
  - Automatic commit and push
  - Conflict detection and resolution
  - Change queue with retry logic

### 3. WebSocket Hub (`server/docs/ws/`)
- **Purpose:** Real-time collaboration and live updates
- **Technology:** ws (WebSocket library)
- **Features:**
  - Live document editing notifications
  - Presence tracking (who's viewing what)
  - Real-time comments and annotations
  - Collaborative cursor positions
  - Live preview synchronization

### 4. CLI Tool (`cli/tekup-docs/`)
- **Purpose:** Terminal-based documentation management
- **Technology:** Commander.js + Inquirer
- **Features:**
  - Create, edit, search documents from CLI
  - Git operations (commit, push, pull, resolve)
  - AI-powered documentation generation
  - Batch operations and scripting support
  - Interactive TUI for browsing

### 5. AI Documentation Agent (`server/docs/ai/`)
- **Purpose:** Automated documentation workflows
- **Technology:** OpenRouter + LangChain
- **Features:**
  - Auto-generate documentation from code
  - Smart content suggestions
  - Documentation quality analysis
  - Auto-categorization and tagging
  - Context-aware updates

### 6. Documentation Portal (`client/src/pages/docs/`)
- **Purpose:** Web-based documentation browser
- **Technology:** React + TanStack Query
- **Features:**
  - Markdown rendering with syntax highlighting
  - Real-time collaborative editing
  - Search with filters and facets
  - Version history viewer
  - Comment threads and annotations

## 🔄 Data Flow

### Write Flow (CLI → Git → Portal)

```
1. User runs: tekup-docs create "New Feature"
   ↓
2. CLI validates input & generates content
   ↓
3. File written to docs/ directory
   ↓
4. File watcher detects change
   ↓
5. Sync engine commits to Git
   ↓
6. WebSocket broadcasts change
   ↓
7. Portal updates in real-time
```

### Read Flow (Portal → Git → Display)

```
1. User opens documentation portal
   ↓
2. API fetches docs from Git
   ↓
3. Markdown parsed and rendered
   ↓
4. WebSocket connection established
   ↓
5. Live updates stream in real-time
```

### Conflict Resolution Flow

```
1. Concurrent edits detected
   ↓
2. Sync engine creates conflict markers
   ↓
3. CLI/Portal notified of conflict
   ↓
4. User chooses: accept local, remote, or manual merge
   ↓
5. Resolution committed to Git
   ↓
6. All clients synchronized
```

## 🗄️ Database Schema

### Documents Table
```typescript
interface Document {
  id: string;              // UUID
  path: string;            // Relative path in repo
  title: string;           // Document title
  content: string;         // Markdown content
  category: string;        // Category/folder
  tags: string[];          // Search tags
  author: string;          // Last author
  created_at: Date;
  updated_at: Date;
  git_hash: string;        // Latest commit hash
  version: number;         // Version counter
}
```

### Document Changes Table
```typescript
interface DocumentChange {
  id: string;
  document_id: string;
  user_id: string;
  operation: 'create' | 'update' | 'delete';
  diff: string;            // Git diff
  git_hash: string;
  timestamp: Date;
}
```

### Comments Table
```typescript
interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  line_number?: number;    // For line-specific comments
  resolved: boolean;
  created_at: Date;
}
```

## 🔌 API Endpoints

### REST API

```typescript
// Documents
GET    /api/docs                    // List all docs
GET    /api/docs/:id                // Get specific doc
POST   /api/docs                    // Create new doc
PUT    /api/docs/:id                // Update doc
DELETE /api/docs/:id                // Delete doc
GET    /api/docs/:id/history        // Get version history
GET    /api/docs/:id/diff/:version  // Get diff between versions

// Search
GET    /api/docs/search?q=query&category=cat&tags=tag1,tag2

// AI Operations
POST   /api/docs/ai/generate        // Generate doc from prompt
POST   /api/docs/ai/improve         // Improve existing doc
POST   /api/docs/ai/summarize       // Summarize doc

// Sync
POST   /api/docs/sync/push          // Push changes to Git
POST   /api/docs/sync/pull          // Pull changes from Git
GET    /api/docs/sync/status        // Get sync status
POST   /api/docs/sync/resolve       // Resolve conflict

// Comments
GET    /api/docs/:id/comments       // Get doc comments
POST   /api/docs/:id/comments       // Add comment
PUT    /api/docs/:id/comments/:cid  // Update comment
DELETE /api/docs/:id/comments/:cid  // Delete comment
```

### WebSocket Events

```typescript
// Client → Server
'doc:subscribe'      // Subscribe to document updates
'doc:unsubscribe'    // Unsubscribe from document
'doc:edit'           // Notify editing start
'comment:add'        // Add real-time comment
'presence:update'    // Update user presence

// Server → Client
'doc:updated'        // Document content changed
'doc:conflict'       // Conflict detected
'comment:new'        // New comment added
'presence:joined'    // User joined document
'presence:left'      // User left document
'sync:status'        // Sync status update
```

## 🖥️ CLI Commands

```bash
# Document Management
tekup-docs list [--category <cat>] [--tags <tags>]
tekup-docs create <title> [--template <template>]
tekup-docs edit <id|path>
tekup-docs delete <id|path>
tekup-docs search <query>
tekup-docs view <id|path>

# Git Operations
tekup-docs sync                    # Sync with Git
tekup-docs push [--message <msg>]  # Push changes
tekup-docs pull                    # Pull changes
tekup-docs status                  # Show sync status
tekup-docs resolve <id>            # Resolve conflict

# AI Operations
tekup-docs ai generate <prompt> [--context <files>]
tekup-docs ai improve <id|path>
tekup-docs ai audit                # Check doc quality

# Batch Operations
tekup-docs batch create --from <json|yaml>
tekup-docs batch update --filter <pattern>
tekup-docs export --format <md|html|pdf>

# Interactive Mode
tekup-docs tui                     # Launch Terminal UI
```

## 🤖 AI Integration

### Prompt Templates

```typescript
// Generate Documentation
const generatePrompt = `
Generate comprehensive documentation for:
Title: ${title}
Context: ${context}
Code References: ${codeFiles}

Include:
- Overview and purpose
- Usage examples
- API reference
- Best practices
- Related documents
`;

// Improve Documentation
const improvePrompt = `
Improve this documentation:
${currentContent}

Focus on:
- Clarity and readability
- Completeness
- Code examples
- Structure and organization
`;
```

### Auto-Update Triggers

1. **Code Changes:** When code files change, AI suggests doc updates
2. **API Changes:** When API endpoints change, auto-update API docs
3. **Test Results:** When tests fail, add troubleshooting sections
4. **User Feedback:** Comments trigger AI review and improvements

## 🔐 Security & Permissions

### Access Levels
- **Read:** View documentation
- **Write:** Create and edit documents
- **Admin:** Manage categories, approve AI changes
- **System:** Automated operations (CI/CD, AI agents)

### Git Integration
- Use SSH keys for authentication
- Sign commits with GPG
- Branch protection rules
- Required reviews for critical docs

## 📊 Monitoring & Analytics

### Metrics to Track
- Document views and edit frequency
- Search queries and results
- Sync latency and conflicts
- AI generation success rate
- User engagement (comments, annotations)

### Health Checks
- Git sync status
- WebSocket connection count
- API response times
- File system watcher status
- AI service availability

## 🚀 Deployment Architecture

### Production Setup
```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
   ┌───▼────────────────┐
   │ API Servers (N)    │
   │ + WebSocket Hubs   │
   └───┬────────────────┘
       │
   ┌───▼────────────────┐
   │ Redis Cluster      │
   │ (WebSocket sync)   │
   └────────────────────┘
       │
   ┌───▼────────────────┐
   │ PostgreSQL         │
   │ (Metadata DB)      │
   └────────────────────┘
       │
   ┌───▼────────────────┐
   │ Git Repository     │
   │ (Source of Truth)  │
   └────────────────────┘
```

## 🔄 Migration Plan

### Phase 1: Core Infrastructure (Week 1)
- [ ] Set up Git sync engine
- [ ] Create API endpoints
- [ ] Implement file watching
- [ ] Basic CLI tool

### Phase 2: Real-time Features (Week 2)
- [ ] WebSocket hub
- [ ] Live updates
- [ ] Presence tracking
- [ ] Conflict detection

### Phase 3: AI Integration (Week 3)
- [ ] AI documentation agent
- [ ] Auto-generation workflows
- [ ] Content improvement
- [ ] Quality analysis

### Phase 4: Portal & Polish (Week 4)
- [ ] Documentation portal UI
- [ ] Advanced search
- [ ] Comments and annotations
- [ ] Analytics dashboard

## 📚 Technology Stack

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express + tRPC
- **Git:** simple-git
- **WebSocket:** ws
- **Database:** PostgreSQL (via Drizzle ORM)
- **Cache:** Redis (for WebSocket state)
- **AI:** OpenRouter API

### Frontend
- **Framework:** React 19
- **State:** TanStack Query
- **Markdown:** remark + rehype
- **Editor:** CodeMirror or Monaco
- **Styling:** TailwindCSS

### CLI
- **Framework:** Commander.js
- **Prompts:** Inquirer.js
- **TUI:** Ink (React for CLI)
- **Formatting:** Chalk

## 🎯 Success Metrics

1. **Sync Latency:** < 2 seconds from edit to broadcast
2. **Search Speed:** < 100ms for full-text search
3. **AI Generation:** < 10 seconds for new docs
4. **Conflict Rate:** < 1% of all edits
5. **Uptime:** 99.9% for all services

---

**Next Steps:**
1. Review and approve architecture
2. Set up development environment
3. Implement Phase 1 components
4. Test with team workflow
5. Iterate based on feedback
