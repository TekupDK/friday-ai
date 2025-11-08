# 📚 Documentation Strategy - Ny Tilgang

**Dato:** 2024-11-08  
**Status:** Proposal

---

## 🎯 Vision

En **levende dokumentation** der:
- ✅ Auto-kategoriserer sig selv
- ✅ Opdager når den er forældet
- ✅ Foreslår relaterede docs
- ✅ Bruges aktivt i udviklingsflow

---

## 📂 Ny Kategori-Struktur

### ❌ Gamle Tilgang (Path-Based)
```
tasks/invoice-ui/PLAN.md → Category: "Tasks"
.copilot/DEBUG.md → Category: "Development"
```

**Problemer:**
- Rigid struktur
- Svært at have docs i flere kategorier
- Path bestemmer alt

### ✅ Ny Tilgang (Tag-Based Taxonomy)

#### 1️⃣ Primary Categories (Broad)
```
- 🏗️ Architecture & Design
- 💼 Business Logic (Invoices, Leads, etc.)
- 🎨 Frontend & UI
- ⚙️ Backend & API
- 🗄️ Database & Data
- 🤖 AI & Automation
- 🧪 Testing & QA
- 🚀 DevOps & Deploy
- 📖 Guides & Tutorials
```

#### 2️⃣ Secondary Tags (Specific)
```
Feature Tags:
- #email-system
- #invoice-integration
- #calendar
- #friday-ai
- #authentication

Status Tags:
- #active
- #deprecated
- #archived
- #draft

Type Tags:
- #spec
- #guide
- #changelog
- #troubleshooting
- #reference
- #meeting-notes

Priority Tags:
- #critical
- #important
- #nice-to-have
```

#### 3️⃣ Smart Auto-Tags
AI-genererede baseret på content:
```
- #contains-code
- #has-screenshots
- #needs-update
- #frequently-accessed
- #related-to-[other-doc]
```

---

## 🔄 Workflow for Nye Docs

### Scenario 1: Developer Opretter Doc Manuelt

**Gammel måde:**
1. Lav `tasks/new-feature/PLAN.md`
2. Skriv content
3. Commit til git
4. (Doc findes kun i git)

**Ny måde:**
1. Klik "New Document" i `/docs` UI
2. Vælg template (Plan, Guide, Bug, Feature Spec)
3. System foreslår kategori + tags baseret på titel
4. Skriv content med live markdown preview
5. Auto-save til database
6. Auto-commit til git (hvis enabled)

### Scenario 2: AI/Tool Genererer Doc

**Use case:** Friday AI laver en analyse eller rapport

**Flow:**
```typescript
// Fra Friday AI chat
await trpc.docs.create.mutate({
  title: "Email Thread Analysis - Thread #123",
  content: aiGeneratedContent,
  category: "AI & Automation",
  tags: ["email-system", "ai-generated", "analysis"],
  metadata: {
    generatedBy: "friday-ai",
    relatedTo: "thread-123",
    confidence: 0.95
  }
});
```

### Scenario 3: Import fra External Source

**Sources:**
- Notion export
- Confluence export
- GitHub issues/PRs
- Meeting notes fra Teams/Slack

**Flow:**
```bash
# CLI command
tekup-docs import --source notion --path ./export.zip

# Eller UI upload
# Drag & drop .md/.html files → Auto-convert & categorize
```

---

## 🤖 AI-Powered Features

### 1. Auto-Categorization
```typescript
// Når ny doc oprettes
const suggestedCategory = await analyzedContent({
  title: doc.title,
  content: doc.content,
  existingTags: doc.tags
});

// Forslag: "Denne doc ligner 'Email System' docs (87% match)"
```

### 2. Deprecation Detection
```typescript
// Dagligt job
const outdatedDocs = await findOutdatedDocs({
  notAccessedSince: "90 days",
  referencesDeletedCode: true,
  mentionsOldVersions: true
});

// Auto-add tag: #needs-review eller #deprecated
```

### 3. Smart Linking
```typescript
// Mens du skriver
"This relates to the email thread implementation..."

// AI foreslår:
💡 Did you mean: [Email Thread Loading Performance](link)?
💡 Related docs: 
   - Email Functions Documentation
   - Email Tab Analysis
```

### 4. Auto-Summary
```typescript
// På lange docs
const summary = await generateSummary(doc.content);

// Vises i doc header:
📝 TL;DR: This document describes the email sync process...
⏱️ Est. read time: 5 min
🔑 Key points: Auth, Error handling, Performance
```

---

## 📊 Document Lifecycle

### States
```
Draft → Active → Maintenance → Deprecated → Archived
```

### Auto-Transitions
```typescript
// Draft → Active
if (doc.hasContent && doc.isReviewed) {
  doc.status = "active";
}

// Active → Maintenance
if (daysSinceLastEdit > 90 && stillReferenced) {
  doc.status = "maintenance";
  doc.tags.add("needs-update");
}

// Maintenance → Deprecated
if (referencesDeletedCode || markedAsObsolete) {
  doc.status = "deprecated";
  doc.tags.add("outdated");
}

// Deprecated → Archived
if (daysSinceDeprecated > 180 && notAccessed) {
  doc.status = "archived";
  moveToArchive(doc);
}
```

---

## 🏗️ Foreslået Folder Structure

### Option A: Flat Database (Anbefalet)
```
Database:
  └── documents (alle docs)
       ├── Kategorier via tags
       ├── Hierarki via relationer
       └── Git backup i docs/backup/

Frontend:
  └── Dynamisk træ baseret på filters
```

**Fordele:**
- Flexibel kategorisering
- Kan være i flere kategorier
- Let at søge på tværs

### Option B: Hybrid (Git + Database)
```
Git repo:
  docs/
    ├── active/           ← Aktive docs (sync to DB)
    │   ├── email/
    │   ├── invoices/
    │   └── ai/
    ├── archive/          ← Gamle docs (read-only i DB)
    └── templates/        ← Doc templates

Database:
  └── Mirror of active/ + metadata
```

**Fordele:**
- Git versionering
- Kan browse offline
- Traditionel struktur

---

## 🎨 UI Redesign Forslag

### Current: List View
```
[Search box]
[Filter by category dropdown]
[Document 1]
[Document 2]
...
```

### Proposed: Multi-View
```
┌─────────────────────────────────────┐
│ 📚 Documentation                     │
├─────────────────────────────────────┤
│ Views: [All] [Tree] [Timeline] [AI] │
├─────────────────────────────────────┤
│                                      │
│ Sidebar:              Main:          │
│ ┌──────────┐         ┌─────────────┐│
│ │Categories│         │Doc content  ││
│ │  Email   │         │             ││
│ │  Invoice │         │Related docs ││
│ │  AI      │         │Comments     ││
│ │          │         │Version hist││
│ │Tags      │         └─────────────┘│
│ │ #urgent  │                        │
│ │ #guide   │         Quick Actions: │
│ │ #active  │         [Edit] [Share] │
│ └──────────┘         [Export] [AI]  │
└─────────────────────────────────────┘
```

### Tree View (Ny!)
```
📁 Email System (117)
├─ 📄 Email Functions Guide
├─ 📄 Email Sync Implementation
├─ 📁 Gmail Integration
│  ├─ 📄 OAuth Setup
│  └─ 📄 API Reference
└─ 📁 Testing
   └─ 📄 E2E Test Guide

📁 Invoices & Billy (156)
├─ 📄 Billy Integration
└─ ...
```

### Timeline View (Ny!)
```
Today
├─ 📄 New doc created
└─ 📄 3 docs updated

This Week
├─ 📊 15 docs accessed
└─ 🤖 5 AI summaries generated

This Month
├─ 📝 23 new docs
└─ ⚠️ 8 marked outdated
```

### AI View (Ny!)
```
🤖 AI Insights

📊 Most Important Docs (This Week)
  1. Email Sync - Accessed 45 times
  2. Invoice Flow - 12 updates
  
⚠️ Needs Attention
  - "Old Login Flow" - References deleted code
  - "V1 Migration" - Not accessed in 6 months
  
💡 Suggested Reading
  Based on your recent work on email:
  - Email Thread Performance
  - Gmail API Limits
```

---

## 🔧 Implementation Roadmap

### Phase 1: Better Categorization (✅ DONE)
- ✅ 9 primary categories
- ✅ Auto-tagging
- ✅ Outdated detection

### Phase 2: AI Features (2-3 dage)
```typescript
// 1. Auto-categorization
POST /api/docs/suggest-category
{ title, content } → { category, confidence, tags }

// 2. Smart search
POST /api/docs/semantic-search
{ query } → { results sorted by relevance }

// 3. Auto-summary
POST /api/docs/summarize
{ docId } → { summary, keyPoints, readTime }

// 4. Related docs
GET /api/docs/:id/related
→ [similar docs based on content]
```

### Phase 3: UI Improvements (3-4 dage)
- Tree view med drag & drop
- Timeline view
- AI insights dashboard
- Better markdown editor (CodeMirror/Monaco)
- Preview mode ved siden af editor

### Phase 4: Workflow Integration (1 uge)
```typescript
// Integrate med eksisterende flows

// 1. Fra Friday AI chat
"Analyse denne email thread"
→ AI genererer doc automatisk

// 2. Fra task completion
Task completed → Generate changelog doc

// 3. Fra git commits
New feature merged → Suggest creating guide

// 4. Fra errors/bugs
Error logged → Link to troubleshooting doc
```

### Phase 5: Advanced Features (2 uger)
- Document templates
- Collaborative editing (real-time)
- Version diffing
- Export til PDF/Notion/Confluence
- Slack/Teams integration (search docs fra chat)

---

## 💡 Best Practices Fremover

### 1. Doc Naming Convention
```
❌ Bad:  PLAN.md, STATUS.md, notes.md
✅ Good: Email-Sync-Implementation-Plan.md
✅ Good: Invoice-UI-Refactor-Status.md
```

### 2. Required Metadata
```markdown
---
title: Email Sync Implementation
category: Backend & API
tags: [email-system, gmail, authentication]
status: active
created: 2024-11-08
updated: 2024-11-08
author: system
reviewers: []
---

# Content here...
```

### 3. Template Usage
```markdown
# [Feature Name] - Implementation Plan

## Overview
Brief description...

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Technical Design
Architecture diagram...

## Timeline
- Week 1: ...
- Week 2: ...

## Risks & Mitigation
...

## Related Docs
- [Link to design doc]
- [Link to API spec]
```

### 4. Link Everything
```markdown
Når du nævner noget:
- Email thread → Link til email docs
- Database schema → Link til schema doc
- API endpoint → Link til API reference

Brug: [Email Functions](link) ikke bare "email"
```

---

## 📈 Success Metrics

### Measure What Matters
```typescript
// Track i database
analytics.track({
  // Usage
  docsViewed: count,
  searchQueries: count,
  avgTimeOnDoc: seconds,
  
  // Quality
  outdatedDocsPercentage: percent,
  docsWithoutTags: count,
  brokenLinks: count,
  
  // AI
  aiSuggestionsAccepted: percent,
  autoCategorizationAccuracy: percent,
  
  // Collaboration
  commentsPerDoc: avg,
  docsShared: count,
});
```

### Monthly Review
- Hvilke docs bruges mest?
- Hvilke kategorier mangler docs?
- Hvor mange outdated docs?
- AI accuracy improving?

---

## 🎯 Konklusion

### Nøgle-Principper
1. **Tag-first, not folder-first** - Flexibilitet
2. **AI-assisted, not AI-driven** - Mennesket beslutter
3. **Living documentation** - Ikke statisk
4. **Integrated workflow** - Del af development process
5. **Measurable quality** - Track metrics

### Quick Wins (Næste Step)
1. ✅ Tilføj doc templates i UI
2. ✅ Implementer semantic search (AI)
3. ✅ Auto-suggest tags ved oprettelse
4. ✅ Tree view i UI
5. ✅ Weekly digest email: "Docs that need attention"

### Long-term Vision
**Målet:** At dokumentation er så nyttig og let at vedligeholde at folk faktisk gør det! 🎉
