# 📧 Email Intelligence Feature Design

**Implementation Plan for Friday AI**

---

## 🎯 OVERVIEW

Add AI-powered email intelligence capabilities to Friday AI to help users manage their inbox more efficiently.

### Core Features

1. **Smart Categorization** - Automatic email classification
1. **Auto-Response Suggestions** - AI-generated reply templates
1. **Priority Detection** - Intelligent importance scoring
1. **Smart Summaries** - Quick email overviews (already exists, enhance)

---

## 🏗️ ARCHITECTURE

### 1. Smart Categorization System

```typescript
// server/email-intelligence/categorizer.ts
interface EmailCategory {
  category:
    | "work"
    | "personal"
    | "finance"
    | "marketing"
    | "important"
    | "other";
  confidence: number; // 0-1
  subcategory?: string;
  reasoning?: string;
}

async function categorizeEmail(email: EmailMessage): Promise<EmailCategory> {
  // Use LLM to analyze email and determine category
  // Consider: sender, subject, content, previous interactions
  return {
    category: "work",
    confidence: 0.95,
    subcategory: "project_update",
    reasoning: "Email discusses project timeline from team member",
  };
}

```text

**Benefits:**

- Automatic inbox organization
- Reduce manual sorting
- Better email discovery
- Smart filtering

---

### 2. Auto-Response Suggestions

```typescript
// server/email-intelligence/response-generator.ts
interface ResponseSuggestion {
  type: "quick_reply" | "detailed" | "forward" | "schedule";
  text: string;
  tone: "professional" | "friendly" | "formal";
  confidence: number;
}

async function generateResponseSuggestions(
  email: EmailMessage,
  context?: ConversationContext
): Promise<ResponseSuggestion[]> {
  // Analyze email content and context
  // Generate 2-3 appropriate response options
  return [
    {
      type: "quick_reply",
      text: "Tak for din mail! Jeg vender tilbage inden for 24 timer.",
      tone: "professional",
      confidence: 0.9,
    },
    {
      type: "detailed",
      text: "Hej [name],\n\nTak for din henvendelse...",
      tone: "professional",
      confidence: 0.85,
    },
  ];
}

```text

**Benefits:**

- Faster email responses
- Consistent tone
- Reduce writer's block
- Learn from user patterns

---

### 3. Priority Detection

```typescript
// server/email-intelligence/priority-scorer.ts
interface EmailPriority {
  score: number; // 0-100
  level: "urgent" | "high" | "normal" | "low";
  factors: {
    sender_importance: number;
    content_urgency: number;
    deadline_mentioned: boolean;
    requires_action: boolean;
  };
}

async function scorePriority(email: EmailMessage): Promise<EmailPriority> {
  // Analyze multiple factors:
  // - Sender relationship (VIP, customer, colleague)
  // - Content urgency keywords
  // - Deadlines mentioned
  // - Action items present
  // - Historical response patterns

  return {
    score: 85,
    level: "high",
    factors: {
      sender_importance: 0.9, // VIP customer
      content_urgency: 0.8, // Contains "urgent"
      deadline_mentioned: true,
      requires_action: true,
    },
  };
}

```text

**Benefits:**

- Focus on important emails first
- Never miss urgent messages
- Better time management
- Reduced stress

---

## 🛠️ IMPLEMENTATION PLAN

### Phase 1: Backend Intelligence (1-2 hours)

**Files to Create:**

```text
server/email-intelligence/
├── categorizer.ts          # Email categorization logic
├── response-generator.ts   # Response suggestion engine
├── priority-scorer.ts      # Priority detection
├── index.ts               # Main exports
└── __tests__/
    ├── categorizer.test.ts
    ├── response-generator.test.ts
    └── priority-scorer.test.ts

```text

**Dependencies:**

- ✅ OpenRouter LLM (already configured)
- ✅ Email data access (already available)
- ✅ TRPC router (for API endpoints)

---

### Phase 2: Database Schema (15 min)

**New Tables:**

```sql
-- email_categories
CREATE TABLE email_categories (
  id INTEGER PRIMARY KEY,
  thread_id TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  confidence REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES email_threads(id)
);

-- email_priority
CREATE TABLE email_priority (
  id INTEGER PRIMARY KEY,
  thread_id TEXT NOT NULL,
  priority_score INTEGER NOT NULL,
  priority_level TEXT NOT NULL,
  factors TEXT NOT NULL, -- JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES email_threads(id)
);

-- response_suggestions
CREATE TABLE response_suggestions (
  id INTEGER PRIMARY KEY,
  thread_id TEXT NOT NULL,
  suggestion_text TEXT NOT NULL,
  suggestion_type TEXT NOT NULL,
  tone TEXT NOT NULL,
  confidence REAL NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES email_threads(id)
);

```text

---

### Phase 3: TRPC API Endpoints (30 min)

```typescript
// server/routers/email-intelligence-router.ts
export const emailIntelligenceRouter = router({
  categorizeEmail: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ input }) => {
      const email = await getEmailThread(input.threadId);
      const category = await categorizeEmail(email);
      await saveEmailCategory(input.threadId, category);
      return category;
    }),

  getResponseSuggestions: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .query(async ({ input }) => {
      const email = await getEmailThread(input.threadId);
      const suggestions = await generateResponseSuggestions(email);
      return suggestions;
    }),

  scorePriority: protectedProcedure
    .input(z.object({ threadId: z.string() }))
    .mutation(async ({ input }) => {
      const email = await getEmailThread(input.threadId);
      const priority = await scorePriority(email);
      await saveEmailPriority(input.threadId, priority);
      return priority;
    }),

  getCategoryStats: protectedProcedure.query(async ({ ctx }) => {
    // Return category distribution for user's emails
    return getEmailCategoryStats(ctx.user.id);
  }),
});

```text

---

### Phase 4: UI Components (1-2 hours)

**Components to Create:**

```bash
client/src/components/email-intelligence/
├── CategoryBadge.tsx          # Display email category
├── PriorityIndicator.tsx      # Show priority level
├── ResponseSuggestions.tsx    # Show suggested responses
├── CategoryFilter.tsx         # Filter by category
└── __tests__/
    └── email-intelligence.test.tsx

```text

**Example Usage:**

```tsx
// In EmailThreadView.tsx
<EmailThread>
  <EmailHeader>
    <PriorityIndicator priority={priority} />
    <CategoryBadge category={category} />
  </EmailHeader>

  <EmailContent>{/*existing content*/}</EmailContent>

  <EmailActions>
    <ResponseSuggestions threadId={threadId} onSelect={handleUseSuggestion} />
  </EmailActions>
</EmailThread>

```text

---

## 📊 TESTING STRATEGY

### Unit Tests (30 min)

```typescript
// Test categorization logic
describe("Email Categorizer", () => {
  it("should categorize work email correctly");
  it("should identify marketing emails");
  it("should handle multiple categories");
});

// Test response generation
describe("Response Generator", () => {
  it("should generate professional responses");
  it("should match email tone");
  it("should include context");
});

// Test priority scoring
describe("Priority Scorer", () => {
  it("should detect urgent emails");
  it("should score VIP senders higher");
  it("should identify action items");
});

```text

### Integration Tests

- TRPC endpoint functionality
- Database persistence
- LLM integration
- UI component rendering

---

## 🎯 SUCCESS METRICS

**User Experience:**

- ✅ Reduce time spent sorting emails
- ✅ Faster response times
- ✅ Better inbox organization
- ✅ Improved email productivity

**Technical:**

- ✅ 90%+ categorization accuracy
- ✅ <2s response suggestion generation
- ✅ 95%+ priority detection accuracy
- ✅ All tests passing

---

## 📝 IMPLEMENTATION CHECKLIST

### Backend (1-2 hours)

- [ ] Create categorizer.ts
- [ ] Create response-generator.ts
- [ ] Create priority-scorer.ts
- [ ] Add database schema
- [ ] Create TRPC endpoints
- [ ] Write unit tests

### Frontend (1-2 hours)

- [ ] Create CategoryBadge component
- [ ] Create PriorityIndicator component
- [ ] Create ResponseSuggestions component
- [ ] Integrate into EmailThreadView
- [ ] Add filtering capabilities
- [ ] Write component tests

### Testing & Polish (30 min)

- [ ] Run all tests
- [ ] Manual testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Commit changes

---

## 🚀 FUTURE ENHANCEMENTS

**V2 Features:**

- Learning from user behavior
- Custom category creation
- Automated email rules
- Smart scheduling
- Email templates library
- Multi-language support

**Analytics:**

- Email response time tracking
- Category distribution over time
- Priority trends
- Suggestion acceptance rate

---

## 💡 TECHNICAL NOTES

**LLM Prompts:**

```typescript
// Categorization prompt
const CATEGORIZATION_PROMPT = `
Analyze this email and determine its category.

Email:
From: {sender}
Subject: {subject}
Content: {content}

Categories: work, personal, finance, marketing, important, other

Respond in JSON:
{
  "category": "work",
  "confidence": 0.95,
  "subcategory": "project_update",
  "reasoning": "Brief explanation"
}
`;

// Response generation prompt
const RESPONSE_PROMPT = `
Generate 2-3 professional response suggestions for this email in Danish.

Email: {content}

Consider:

- Sender relationship
- Email tone
- Action required
- Context from previous emails

Return JSON array of suggestions.
`;

```

**Rate Limiting:**

- Cache category results for 24h
- Batch process suggestions
- Lazy load priority scores
- Use free tier LLMs for categorization

---

**Ready to implement! 🚀**
