# 🤖 AI Documentation Generator - Implementation Plan

**Dato:** 2024-11-08
**Formål:** Auto-generér dokumentation baseret på leads, emails, samtaler og kalender

---

## 🎯 Use Cases

### 1. Lead Documentation

**Input:**

- Lead data (navn, email, phone, company)

- Email threads relateret til lead

- Meeting notes fra kalender

- Chat samtaler med lead

**Output:**

`````markdown
# Lead: [Company Name]

## Overview

- Contact: [Name]

- Email: [email]

- Phone: [phone]

- Status: [Active/Cold/Converted]

## Communication History

### Email Threads (5)

- Thread 1: Re: Invoice discussion - 2024-11-05

  Summary: Discussed invoice terms...

- Thread 2: Meeting follow-up - 2024-11-03

  Summary: Confirmed requirements...

### Meetings (3)

- 2024-11-06: Initial consultation

  Notes: Discussed project scope...

- 2024-11-04: Requirements gathering

  Notes: Customer needs...

### Chat Conversations (2)

- 2024-11-07: Quick question about pricing

- 2024-11-02: Feature request

## AI Analysis

### Key Topics

- Invoice payment terms

- Feature requirements

- Timeline expectations

### Sentiment Analysis

- Overall: Positive

- Last interaction: Neutral

### Action Items

- [ ] Send invoice quote by Friday

- [ ] Schedule follow-up meeting

- [ ] Prepare feature demo

### Recommendations

- High priority lead - active engagement

- Consider upsell opportunities

- Schedule regular check-ins

````text

### 2. Project Documentation

**Input:**

- Alle leads relateret til projekt

- Email threads om projektet

- Meetings tagged med projekt

- Task beskrivelser

**Output:**

```markdown

# Project: [Project Name]

## Timeline

Start: [date]
End: [date]
Status: [In Progress/Completed]

## Stakeholders

- Lead 1: Primary contact

- Lead 2: Decision maker

## Communication Log

[Chronological list af alle interactions]

## Decisions Made

[AI extracted decisions fra emails/meetings]

## Open Questions

[AI identified unanswered questions]

## Risk Analysis

[AI detected potential issues]

```text

### 3. Weekly Digest

**Input:**

- Alle emails denne uge

- Alle meetings

- Alle samtaler

**Output:**

```markdown

# Weekly Digest: Week 45, 2024

## Summary

- 23 emails processed

- 8 meetings attended

- 15 lead interactions

## Key Highlights

[AI summary af vigtige events]

## Action Items Generated

[Aggregated tasks fra alle sources]

## Trends

- Increased interest in Feature X

- 3 new leads from cold outreach

- 2 deals close to closing

```text

---

## 🏗️ Architecture

### Phase 1: Data Collection

```typescript
// server/docs/ai/data-collector.ts

interface DataSources {
  leads: Lead[];
  emailThreads: EmailThread[];
  calendarEvents: CalendarEvent[];
  chatMessages: Message[];
}

async function collectLeadData(leadId: string): Promise<DataSources> {
  // Fetch from database
  const lead = await db.query.leads.findFirst({ where: eq(leads.id, leadId) });

  // Fetch email threads
  const emailThreads = await db.query.email_threads.findMany({
    where: or(
      eq(email_threads.from_email, lead.email),
      eq(email_threads.to_email, lead.email)
    ),
  });

  // Fetch calendar events
  const calendarEvents = await calendar.events.list({
    q: lead.email,
    timeMin: lead.createdAt,
  });

  // Fetch chat messages (if applicable)
  const chatMessages = await db.query.conversations.findMany({
    where: like(conversations.context, `%${lead.email}%`),
  });

  return { lead, emailThreads, calendarEvents, chatMessages };
}

```text

### Phase 2: AI Analysis

```typescript
// server/docs/ai/analyzer.ts

interface Analysis {
  summary: string;
  keyTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  actionItems: string[];
  decisions: string[];
  questions: string[];
  risks: string[];
}

async function analyzeData(data: DataSources): Promise<Analysis> {
  const prompt = `
Analyze the following data about a lead:

Lead Info:
${JSON.stringify(data.lead)}

Email Threads (${data.emailThreads.length}):
${data.emailThreads.map(t => \`
Subject: \${t.subject}
Date: \${t.date}
Snippet: \${t.snippet}
\`).join('\\n')}

Calendar Events (${data.calendarEvents.length}):
${data.calendarEvents.map(e => \`
Title: \${e.summary}
Date: \${e.start}
Description: \${e.description}
\`).join('\\n')}

Provide:

1. Executive summary (2-3 sentences)
2. Key topics discussed
3. Overall sentiment
4. Action items extracted
5. Decisions made
6. Open questions
7. Potential risks

Format as JSON.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

```text

### Phase 3: Document Generation

```typescript
// server/docs/ai/generator.ts

async function generateLeadDoc(leadId: string): Promise<string> {
  // Collect data
  const data = await collectLeadData(leadId);

  // Analyze
  const analysis = await analyzeData(data);

  // Generate markdown
  const markdown = `

# Lead: ${data.lead.company || data.lead.name}

## Overview

- **Contact:** ${data.lead.name}

- **Email:** ${data.lead.email}

- **Phone:** ${data.lead.phone || 'N/A'}

- **Status:** ${data.lead.status}

- **Created:** ${formatDate(data.lead.createdAt)}

## AI Summary

${analysis.summary}

## Communication History

### Email Threads (${data.emailThreads.length})

${data.emailThreads.slice(0, 10).map((thread, i) => \`

#### ${i + 1}. ${thread.subject}

**Date:** ${formatDate(thread.date)}
**Summary:** ${thread.snippet}

\`).join('\\n')}

### Meetings (${data.calendarEvents.length})

${data.calendarEvents.map((event, i) => \`

#### ${i + 1}. ${event.summary}

**Date:** ${formatDate(event.start)}
**Notes:** ${event.description || 'No notes'}

\`).join('\\n')}

## AI Analysis

### Key Topics

${analysis.keyTopics.map(t => \`- ${t}\`).join('\\n')}

### Sentiment Analysis

**Overall Sentiment:** ${analysis.sentiment}

### Action Items

${analysis.actionItems.map(a => \`- [ ] ${a}\`).join('\\n')}

### Decisions Made

${analysis.decisions.map(d => \`- ${d}\`).join('\\n')}

### Open Questions

${analysis.questions.map(q => \`- ${q}\`).join('\\n')}

### Risk Assessment

${analysis.risks.map(r => \`- ⚠️ ${r}\`).join('\\n')}

---
**Generated:** ${new Date().toISOString()}
**Source:** AI Analysis of ${data.emailThreads.length} emails, ${data.calendarEvents.length} meetings

`;

  return markdown;
}

```text

### Phase 4: Auto-Create Doc

```typescript
// server/docs/ai/auto-create.ts

async function autoCreateLeadDoc(leadId: string) {
  // Generate content
  const content = await generateLeadDoc(leadId);

  // Get lead for title
  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, leadId)
  });

  // Create doc in database
  const docId = nanoid();
  await db.insert(documents).values({
    id: docId,
    path: \`leads/\${lead.company || lead.name}.md\`,
    title: \`Lead: \${lead.company || lead.name}\`,
    content,
    category: "Leads & Sales",
    tags: ["lead", "ai-generated", "auto-analysis"],
    author: "ai-system",
    version: 1,
  });

  // Log change
  await db.insert(documentChanges).values({
    id: nanoid(),
    documentId: docId,
    userId: "ai-system",
    operation: "create",
    diff: "AI-generated lead documentation",
  });

  return docId;
}

```text

---

## 🔧 Implementation Steps

### Step 1: Backend AI Module (1-2 timer)

- [x] Create `server/docs/ai/` folder

- [ ] `data-collector.ts` - Fetch data from multiple sources

- [ ] `analyzer.ts` - AI analysis with OpenAI

- [ ] `generator.ts` - Markdown generation

- [ ] `auto-create.ts` - Auto-create docs

### Step 2: tRPC Endpoints (30 min)

```typescript
// server/routers/docs-router.ts

// Generate doc for lead
generateLeadDoc: protectedProcedure
  .input(z.object({ leadId: z.string() }))
  .mutation(async ({ input }) => {
    const docId = await autoCreateLeadDoc(input.leadId);
    return { docId };
  }),

// Generate weekly digest
generateWeeklyDigest: protectedProcedure
  .mutation(async () => {
    const docId = await generateWeeklyDigest();
    return { docId };
  }),

// Bulk generate for all leads
generateAllLeadDocs: protectedProcedure
  .mutation(async () => {
    const leads = await getAllLeads();
    const docIds = [];

    for (const lead of leads) {
      const docId = await autoCreateLeadDoc(lead.id);
      docIds.push(docId);
    }

    return { count: docIds.length, docIds };
  }),

```text

### Step 3: Frontend UI (30 min)

```typescript
// client/src/components/leads/LeadCard.tsx

<DropdownMenu>
  <DropdownMenuItem onClick={() => generateDoc(lead.id)}>
    <FileText className="h-4 w-4 mr-2" />
    Generate AI Doc
  </DropdownMenuItem>
</DropdownMenu>

// client/src/pages/docs/DocsPage.tsx

<Button onClick={generateWeeklyDigest}>
  <Sparkles className="h-4 w-4 mr-2" />
  Generate Weekly Digest
</Button>

```text

### Step 4: Automation (30 min)

```typescript
// server/jobs/auto-docs.ts

// Cron job - runs daily

cron.schedule("0 0 * * *", async () => {

  // Generate docs for new leads
  const newLeads = await getLeadsWithoutDocs();

  for (const lead of newLeads) {
    await autoCreateLeadDoc(lead.id);
  }

  // Update existing docs if significant new data
  const activeLeads = await getActiveLeads();

  for (const lead of activeLeads) {
    const lastDocUpdate = await getLastDocUpdate(lead.id);
    const newDataCount = await countNewDataSince(lead.id, lastDocUpdate);

    if (newDataCount > 5) {
      // Regenerate doc
      await updateLeadDoc(lead.id);
    }
  }
});

// Weekly digest - runs Sunday night

cron.schedule("0 20 * * 0", async () => {

  await generateWeeklyDigest();
});
````
`````

```

---

## 📊 Expected Results

### Metrics

- **Lead docs:** 1 per lead (~10-50 leads = 10-50 docs)

- **Weekly digests:** 1 per week (~52 per year)

- **Project docs:** 1 per project

- **Generation time:** ~30 seconds per doc

- **Accuracy:** ~85-90% (human review recommended)

### Benefits

1. **Time saving:** 30 min manual work → 30 sec auto

1. **Consistency:** All docs same format

1. **Insights:** AI spots patterns humans miss

1. **Up-to-date:** Auto-regenerate on new data

1. **Searchable:** All context in one place

---

## 🚀 Next Steps

1. Implement data collector
1. Integrate OpenAI API
1. Create doc generator
1. Add UI buttons
1. Test with real lead data
1. Set up automation

**ETA:** 3-4 timer total

---

## 💡 Future Enhancements

1. **Voice-to-doc:** Transcribe meetings → auto-doc

1. **Slack integration:** Pull Slack threads

1. **Smart updates:** Only regenerate changed sections

1. **Multi-language:** Support dansk/english

1. **Custom templates:** Per lead type

1. **Export:** PDF med branding
```
