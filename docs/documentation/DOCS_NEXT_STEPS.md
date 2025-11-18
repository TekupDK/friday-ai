# 📚 Docs System - Næste Steps

**Status:** Ready for Next Phase
**Dato:** 2024-11-08

---

## ✅ Hvad Vi Har Nu

### Backend

- ✅ 340 docs i database

- ✅ 9 smarte kategorier (Email System, Invoices & Billy, osv.)

- ✅ Auto-tagging (outdated, completed, urgent)

- ✅ WebSocket live updates

- ✅ Git sync engine

- ✅ 4 doc templates (Feature, Bug, Guide, Meeting)

### Frontend

- ✅ Browse/search/view docs

- ✅ Filter by category

- ✅ Live/Offline indicator

- ✅ 340 docs synkroniseret

### Cleanup

- ✅ 219 .md filer flyttet til `docs/archive/`

- ✅ Workspace er clean

- ✅ 49 docs markeret som outdated

---

## 🎯 Anbefalede Næste Steps

### 🚀 Quick Wins (1-2 timer)

#### 1. Test Templates i UI

Tilføj template selector når ny doc oprettes:

````typescript
// client/src/pages/DocsPage.tsx
const templates = [
  { id: 'feature', name: 'Feature Spec', icon: '🎯' },
  { id: 'bug', name: 'Bug Report', icon: '🐛' },
  { id: 'guide', name: 'Guide', icon: '📖' },
  { id: 'meeting', name: 'Meeting Notes', icon: '📝' },
];

// Når user klikker "New Document"
<Select placeholder="Choose template...">
  {templates.map(t => (
    <Option value={t.id}>{t.icon} {t.name}</Option>
  ))}
</Select>

```text

#### 2. Tilføj "Outdated" Filter

```typescript
// I DocsPage.tsx filters
const filterOptions = [
  { label: "All", value: "all" },
  { label: "⚠️ Needs Review (49)", value: "outdated" },
  { label: "✅ Active", value: "active" },
];

```text

#### 3. Quick Actions Menu

```typescript
// På hver doc i list
<DropdownMenu>
  <DropdownItem>✏️ Edit</DropdownItem>
  <DropdownItem>🔗 Copy Link</DropdownItem>
  <DropdownItem>⚠️ Mark Outdated</DropdownItem>
  <DropdownItem>🗄️ Archive</DropdownItem>
</DropdownMenu>

```text

---

### 🤖 AI Features (2-3 dage)

#### 1. Auto-Categorization API

```typescript
// server/routers/docs-router.ts
suggestCategory: protectedProcedure
  .input(
    z.object({
      title: z.string(),
      content: z.string(),
    })
  )
  .query(async ({ input }) => {
    const prompt = `Categorize this document:
    Title: ${input.title}
    Content: ${input.content.slice(0, 500)}...

    Choose from: Email System, Invoices & Billy, AI & Friday, ...
    Response format: { category, confidence, tags[] }`;

    const result = await ai.complete(prompt);
    return JSON.parse(result);
  });

```text

#### 2. Smart Search (Semantic)

```typescript
// Brug embeddings til bedre search
searchSemantic: protectedProcedure
  .input(z.object({ query: z.string() }))
  .query(async ({ input }) => {
    // Generate embedding for query
    const queryEmbedding = await ai.embed(input.query);

    // Find similar docs by embedding similarity
    const similar = await db
      .select()
      .from(documents)
      .where(cosineDistance(documents.embedding, queryEmbedding) < 0.3)
      .orderBy(cosineSimilarity);

    return similar;
  });

```text

#### 3. Auto-Summary

```typescript
// Generate TLDR for long docs
summarize: protectedProcedure
  .input(z.object({ docId: z.string() }))
  .mutation(async ({ input }) => {
    const doc = await getDocument(input.docId);

    const summary = await ai.complete(`
      Summarize this document in 2-3 sentences:
      ${doc.content}
    `);

    await db
      .update(documents)
      .set({ summary })
      .where(eq(documents.id, input.docId));

    return { summary };
  });

```text

---

### 🎨 UI Improvements (3-4 dage)

#### 1. Tree View

```typescript
// Vis docs i træ-struktur
<Tree>
  <TreeNode title="📁 Email System (117)">
    <TreeNode title="📄 Email Sync Implementation" />
    <TreeNode title="📄 Gmail OAuth Setup" />
    <TreeNode title="📁 Testing">
      <TreeNode title="📄 E2E Tests" />
    </TreeNode>
  </TreeNode>
</Tree>

```text

#### 2. Better Markdown Editor

```bash

# Install

pnpm add @uiw/react-md-editor

# Replace textarea med

<MDEditor value={content} onChange={setContent} />

```text

**Features:**

- Live preview

- Syntax highlighting

- Toolbar med shortcuts

- Image upload

#### 3. Timeline View

```typescript
// Vis docs activity over tid
<Timeline>
  <TimelineItem label="Today">
    📄 3 docs created
    ✏️ 5 docs updated
  </TimelineItem>
  <TimelineItem label="This Week">
    📊 45 docs accessed
    ⚠️ 2 marked outdated
  </TimelineItem>
</Timeline>

```text

---

### 🔧 Workflow Integration (1 uge)

#### 1. Friday AI → Create Doc

```typescript
// I Friday AI chat
if (userAsks("analyze email thread")) {
  const analysis = await analyzeThread(threadId);

  // Auto-create doc
  await trpc.docs.create.mutate({
    title: `Email Analysis: ${thread.subject}`,
    content: analysis,
    category: "Email System",
    tags: ["ai-generated", "email", "analysis"],
    metadata: {
      generatedBy: "friday-ai",
      threadId,
    },
  });

  return "Analysis saved to docs! [View](link)";
}

```text

#### 2. Task Complete → Generate Changelog

```typescript
// Når en task completes
onTaskComplete(async task => {
  const changelog = generateChangelog(task);

  await trpc.docs.create.mutate({
    title: `Changelog: ${task.title}`,
    content: changelog,
    category: "Planning & Roadmap",
    tags: ["changelog", "completed"],
  });
});

```text

#### 3. Error → Link to Troubleshooting

```typescript
// Når error logges
onError(async error => {
  // Find related troubleshooting docs
  const docs = await trpc.docs.search.query({
    search: error.message,
    category: "Testing & QA",
    tags: ["troubleshooting"],
  });

  if (docs.length > 0) {
    logger.info(`💡 See: ${docs[0].title}`);
  }
});

```text

---

## 📊 Success Metrics

Track disse i analytics:

```typescript
// Monthly review
const metrics = {
  // Usage
  totalDocs: 340,
  docsCreatedThisMonth: 23,
  docsAccessedThisMonth: 156,
  avgTimePerDoc: "3.5 min",

  // Quality
  outdatedPercentage: "14.4%", // 49/340
  docsWithoutTags: 5,
  avgTagsPerDoc: 3.2,

  // AI (when implemented)
  aiCategorizeAccuracy: "92%",
  aiSuggestionsAccepted: "78%",

  // Search
  searchQueries: 234,
  avgResultsClicked: 1.8,
};

````

---

## 🎯 Prioriteret Roadmap

### Week 1: Quick Polish

- [ ] Template selector i UI

- [ ] Outdated filter

- [ ] Quick actions menu

- [ ] Better markdown editor

### Week 2: AI Features

- [ ] Auto-categorization

- [ ] Semantic search

- [ ] Auto-summary

- [ ] Related docs suggestion

### Week 3: UI Views

- [ ] Tree view

- [ ] Timeline view

- [ ] AI insights dashboard

- [ ] Keyboard shortcuts

### Week 4: Integration

- [ ] Friday AI → Docs

- [ ] Task → Changelog

- [ ] Error → Troubleshooting

- [ ] Git commit → Suggest doc

---

## 💡 Best Practices Fremover

### For Developers

**Ved ny feature:**

1. Start med Feature Spec template
1. Link til relaterede docs
1. Update når feature er færdig
1. Archive når deprecated

**Ved bug:**

1. Brug Bug Report template
1. Link til fix PR
1. Update status når fixed
1. Keep for reference

**Ved guide:**

1. Brug Guide template
1. Test at steps virker
1. Add screenshots
1. Update ved API changes

### For Teamet

**Ugentlig review:**

- Hvilke docs blev mest brugt?

- Hvilke har `#needs-review`?

- Er der gaps i documentation?

**Månedlig cleanup:**

- Archive old outdated docs

- Update frequently accessed docs

- Remove duplicates

- Improve categorization

---

## 🚀 Start Her

### Dag 1: Test Systemet

1. Gå til `/docs`
1. Test search på "email"
1. Klik på et doc og læs det
1. Test filter by category

### Dag 2: Create Din Første Doc

1. Klik "New Document"
1. Vælg template (fx Bug Report)
1. Udfyld template
1. Gem og se den i listen

### Dag 3: Cleanup Outdated

1. Filter by "outdated" (49 docs)
1. Review hver en:
   - Still relevant? → Remove tag

   - Truly outdated? → Archive

   - Needs update? → Add to backlog

### Dag 4: Plan Improvements

1. Review DOCS_STRATEGY.md
1. Prioriter features
1. Estimate effort
1. Start implementing!

---

## 📚 Resources

- [DOCS_STRATEGY.md](../core/documentation/DOCS_STRATEGY.md) - Komplet strategi

- [DOCS_SYSTEM_STATUS.md](../../archive/root/DOCS_SYSTEM_STATUS.md) - Status rapport (archived)

- [Templates README](../accessibility-audits/README.md) - Template guide

---

**Spørgsmål?** Drop en besked! 💬
