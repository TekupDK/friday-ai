# Friday AI Chat - Auto-Generated API Reference

**Generated:** 2025-01-28  
**Based on:** Actual codebase scan  
**Version:** 2.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [tRPC API Endpoints](#trpc-api-endpoints)
4. [Data Models & Types](#data-models--types)
5. [Data Flow](#data-flow)
6. [Dependencies](#dependencies)
7. [AI Tools & Functions](#ai-tools--functions)
8. [Examples](#examples)
9. [Diagrams](#diagrams)

---

## Overview

Friday AI Chat is a business automation platform built with:

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM
- **Database:** Supabase PostgreSQL
- **AI:** Gemini 2.5 Flash, Claude 3.5 Sonnet, GPT-4o
- **Integrations:** Google Workspace (Gmail, Calendar), Billy.dk (accounting)

### Base URLs

- **Development:** `http://localhost:3000/api/trpc`
- **Production:** `https://[your-domain].manus.space/api/trpc`

### Authentication

All `protectedProcedure` endpoints require a valid session cookie (`friday_session`).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React 19)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Chat UI    │  │  Inbox UI    │  │   CRM UI     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                    ┌───────▼────────┐                        │
│                    │  tRPC Client  │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP/WebSocket
┌────────────────────────────▼─────────────────────────────────┐
│                    SERVER (Express + tRPC)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Routers    │  │  AI Router   │  │  DB Layer    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                    ┌───────▼────────┐                        │
│                    │   Drizzle ORM  │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Users      │  │  Emails     │  │    CRM       │    │
│  │ Conversations│  │  Threads    │  │   Leads      │    │
│  │   Messages   │  │  Invoices   │  │  Customers   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## tRPC API Endpoints

### Main Router Structure

```typescript
appRouter = {
  system: systemRouter,
  auth: authRouter,
  workspace: workspaceRouter,
  inbox: inboxRouter,
  docs: docsRouter,
  aiMetrics: aiMetricsRouter,
  emailIntelligence: emailIntelligenceRouter,
  fridayLeads: fridayLeadsRouter,
  uiAnalysis: uiAnalysisRouter,
  crm: {
    customer: crmCustomerRouter,
    lead: crmLeadRouter,
    booking: crmBookingRouter,
    serviceTemplate: crmServiceTemplateRouter,
    stats: crmStatsRouter,
    activity: crmActivityRouter,
    extensions: crmExtensionsRouter,
  },
  chat: {
    getConversations,
    getMessages,
    createConversation,
    sendMessage,
    deleteConversation,
  },
  friday: {
    findRecentLeads,
    getCustomers,
    searchCustomer,
  },
  automation: automationRouter,
  chatStreaming: chatStreamingRouter,
};
```

---

### Auth Router (`auth`)

#### `auth.me`

Get current authenticated user information.

**Type:** Query (Public)  
**Input:** None  
**Output:**

```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: Date;
  lastSignedIn: Date;
} | null
```

**Example:**

```typescript
const { data: user } = trpc.auth.me.useQuery();
if (user) {
  console.log(`Logged in as ${user.name}`);
}
```

#### `auth.login`

Authenticate user and create session.

**Type:** Mutation (Public)  
**Input:**

```typescript
{
  email: string; // Valid email address
  password: string; // Minimum 1 character
}
```

**Output:**

```typescript
{
  id: string; // openId format: "email:user@example.com"
  email: string;
  name: string; // Extracted from email
}
```

**Example:**

```typescript
const loginMutation = trpc.auth.login.useMutation();
await loginMutation.mutateAsync({
  email: "user@example.com",
  password: "password123",
});
```

#### `auth.logout`

Log out current user and clear session cookie.

**Type:** Mutation (Public)  
**Input:** None  
**Output:**

```typescript
{
  success: true;
}
```

---

### Chat Router (`chat`)

#### `chat.getConversations`

Get all conversations for current user.

**Type:** Query (Protected)  
**Input:** None  
**Output:**

```typescript
Array<{
  id: number;
  userId: number;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}>;
```

#### `chat.getMessages`

Get messages for a conversation with pagination.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  conversationId: number;
  cursor?: number;    // Start index (default: 0)
  limit?: number;     // 1-50 (default: 20)
}
```

**Output:**

```typescript
{
  messages: Array<{
    id: number;
    conversationId: number;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: Date;
  }>;
  hasMore: boolean;
  nextCursor?: number;
}
```

#### `chat.createConversation`

Create a new conversation.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  title?: string;     // Optional conversation title
}
```

**Output:**

```typescript
{
  id: number;
  userId: number;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `chat.sendMessage`

Send a message and get AI response.

**Type:** Mutation (Protected)  
**Rate Limit:** 10 messages per minute (Redis-based)

**Input:**

```typescript
{
  conversationId: number;
  content: string;    // 1-10,000 characters
  model?: string;      // Optional AI model override
  context?: {
    selectedEmails?: string[];
    calendarEvents?: any[];
    searchQuery?: string;
    hasEmails?: boolean;
    hasCalendar?: boolean;
    hasInvoices?: boolean;
    page?: string;
  };
}
```

**Output:**

```typescript
{
  id: number;
  conversationId: number;
  role: "user";
  content: string;
  createdAt: Date;
}
```

**Example:**

```typescript
const sendMutation = trpc.chat.sendMessage.useMutation();
await sendMutation.mutateAsync({
  conversationId: 1,
  content: "Find all unread emails from today",
  context: {
    hasEmails: true,
    page: "inbox",
  },
});
```

#### `chat.deleteConversation`

Delete a conversation.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  conversationId: number;
}
```

**Output:**

```typescript
{
  success: true;
}
```

---

### Inbox Router (`inbox`)

#### `inbox.email.list`

List email threads with optional filtering.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  maxResults?: number;  // Default: 20
  query?: string;       // Gmail search query
}
```

**Output:**

```typescript
Array<{
  id: string; // Gmail thread ID
  subject: string;
  from: string;
  snippet: string;
  unread: boolean;
  starred: boolean;
  labels: string[];
  messageCount: number;
  lastMessageDate: Date;
}>;
```

**Example:**

```typescript
const { data: threads } = trpc.inbox.email.list.useQuery({
  query: "is:unread newer_than:1d",
  maxResults: 50,
});
```

#### `inbox.email.getThread`

Get full email thread with all messages.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  threadId: string; // Gmail thread ID
}
```

**Output:**

```typescript
{
  id: string;
  subject: string;
  messages: Array<{
    id: string;
    from: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    htmlBody?: string;
    date: Date;
    attachments?: Array<{
      filename: string;
      mimeType: string;
      size: number;
      attachmentId: string;
    }>;
  }>;
  labels: string[];
}
```

#### `inbox.email.send`

Send an email via Gmail.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  to: string | string[];
  subject: string;
  body: string;
  htmlBody?: string;
  cc?: string | string[];
  bcc?: string | string[];
  threadId?: string;    // Reply to thread
  attachments?: Array<{
    filename: string;
    mimeType: string;
    data: string;       // Base64 encoded
  }>;
}
```

**Output:**

```typescript
{
  id: string; // Gmail message ID
  threadId: string;
}
```

#### `inbox.email.archive`

Archive email thread.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  threadId: string;
}
```

**Output:**

```typescript
{
  success: true;
}
```

#### `inbox.email.addLabel` / `inbox.email.removeLabel`

Add or remove Gmail labels.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  threadId: string;
  label: string;
}
```

**Output:**

```typescript
{
  success: true;
}
```

#### `inbox.email.getSummary`

Get AI-generated email summary.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  emailId: number; // Internal email ID
}
```

**Output:**

```typescript
{
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: "positive" | "neutral" | "negative";
  priority: "low" | "medium" | "high";
  generatedAt: Date;
}
```

#### `inbox.email.getLabelSuggestions`

Get AI-suggested labels for email.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  emailId: number;
}
```

**Output:**

```typescript
{
  suggestions: Array<{
    label: string;
    category: "lead" | "invoice" | "booking" | "general" | "spam";
    confidence: number; // 0-1
    reason: string;
  }>;
}
```

---

### CRM Lead Router (`crm.lead`)

#### `crm.lead.listLeads`

List leads with optional status filter.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  status?: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  limit?: number;      // 1-100 (default: 20)
  offset?: number;     // Default: 0
}
```

**Output:**

```typescript
Array<{
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  score: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}>;
```

#### `crm.lead.getLead`

Get single lead by ID.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  id: number;
}
```

**Output:** Lead object (same structure as listLeads)

#### `crm.lead.updateLeadStatus`

Update lead status.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  id: number;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
}
```

**Output:** Updated lead object

#### `crm.lead.convertToCustomer`

Convert lead to customer profile.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  leadId: number;
}
```

**Output:**

```typescript
{
  customerId: number;
  success: true;
}
```

---

### CRM Customer Router (`crm.customer`)

#### `crm.customer.list`

List all customers.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  limit?: number;
  offset?: number;
  search?: string;     // Search name/email
}
```

**Output:**

```typescript
Array<{
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}>;
```

#### `crm.customer.get`

Get customer by ID with full profile.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  id: number;
}
```

**Output:** Customer object with extended profile data

#### `crm.customer.create`

Create new customer.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
```

**Output:** Created customer object

---

### CRM Booking Router (`crm.booking`)

#### `crm.booking.list`

List bookings with optional filters.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  customerId?: number;
  status?: "planned" | "in_progress" | "completed" | "cancelled";
  startDate?: string;  // ISO date
  endDate?: string;    // ISO date
}
```

**Output:**

```typescript
Array<{
  id: number;
  customerId: number;
  serviceTemplateId: number;
  scheduledDate: Date;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
}>;
```

#### `crm.booking.create`

Create new booking.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  customerId: number;
  serviceTemplateId: number;
  scheduledDate: string;  // ISO date
  notes?: string;
}
```

**Output:** Created booking object

---

### Docs Router (`docs`)

#### `docs.list`

List documents with filtering.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  category?: string;
  tags?: string[];
  author?: string;
  search?: string;
  limit?: number;      // 1-100 (default: 50)
  offset?: number;     // Default: 0
}
```

**Output:**

```typescript
{
  documents: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    author: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
}
```

#### `docs.get`

Get single document by ID.

**Type:** Query (Protected)  
**Input:**

```typescript
{
  id: string;
}
```

**Output:** Document object with full content

#### `docs.create`

Create new document.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  title: string;
  content: string;
  category: string;
  tags?: string[];
}
```

**Output:** Created document object

#### `docs.update`

Update document.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  id: string;
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
}
```

**Output:** Updated document object

#### `docs.delete`

Delete document.

**Type:** Mutation (Protected)  
**Input:**

```typescript
{
  id: string;
}
```

**Output:**

```typescript
{
  success: true;
}
```

---

### Workspace Router (`workspace`)

#### `workspace.dashboard.overview`

Get dashboard overview data.

**Type:** Query (Protected)  
**Input:** None  
**Output:**

```typescript
{
  todayBookings: any[];
  urgentActions: {
    unpaidInvoices: number;
    leadsNeedingReply: number;
    upcomingReminders: number;
  };
  weekStats: {
    bookings: number;
    revenue: number;
    profit: number;
    newLeads: number;
    conversion: number;
  };
}
```

---

## Data Models & Types

### Core Database Schema

#### Users

```typescript
{
  id: number; // Primary key
  openId: string; // Unique identifier
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: Date;
  lastSignedIn: Date;
}
```

#### Conversations

```typescript
{
  id: number;
  userId: number; // Foreign key to users
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Messages

```typescript
{
  id: number;
  conversationId: number; // Foreign key to conversations
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}
```

#### Email Threads

```typescript
{
  id: number;
  userId: number;
  threadId: string; // Gmail thread ID
  subject: string;
  fromEmail: string;
  toEmail: string;
  snippet: string;
  unread: boolean;
  starred: boolean;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Leads

```typescript
{
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  score: number;                  // 0-100
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Customer Profiles

```typescript
{
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Bookings

```typescript
{
  id: number;
  customerId: number;             // Foreign key to customer_profiles
  serviceTemplateId: number;      // Foreign key to service_templates
  scheduledDate: Date;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Documents

```typescript
{
  id: string;                     // nanoid
  title: string;
  content: string;
  category: string;
  tags: string[];                 // JSON array
  author: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Shared Types

#### BillyInvoice

```typescript
interface BillyInvoice {
  id: string;
  organizationId: string;
  invoiceNo: string | null;
  contactId: string;
  entryDate: string; // YYYY-MM-DD
  dueDate?: string | null;
  state: "draft" | "approved" | "sent" | "paid" | "overdue" | "voided";
  amount: number; // Excl. tax
  tax: number;
  grossAmount: number; // Incl. tax
  balance: number; // Unpaid amount
  currencyId: string;
  lines?: BillyInvoiceLine[];
}
```

#### AIResponse

```typescript
interface AIResponse {
  content: string;
  model: AIModel;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: Array<{
    name: string;
    arguments: string;
  }>;
  pendingAction?: PendingAction;
}
```

#### EmailContext

```typescript
interface EmailContext {
  page?: string;
  selectedThreads?: string[];
  openThreadId?: string;
  folder?: string;
  viewMode?: string;
  selectedLabels?: string[];
  searchQuery?: string;
  openDrafts?: number;
  previewThreadId?: string;
}
```

---

## Data Flow

### Chat Message Flow

```
User Input
    │
    ▼
chat.sendMessage (tRPC)
    │
    ├─► Rate Limit Check (Redis)
    │   └─► Fail → 429 Error
    │
    ├─► Save User Message (DB)
    │
    ├─► Load Conversation History
    │
    ├─► Format Messages for AI
    │
    ├─► routeAI()
    │   ├─► Select Model (model-router)
    │   ├─► Get System Prompt
    │   ├─► Invoke LLM (with tools)
    │   ├─► Parse Tool Calls
    │   └─► Execute Tools (if any)
    │
    ├─► Save AI Response (DB)
    │
    ├─► Track Analytics
    │
    └─► Return Message
```

### Email Processing Flow

```
Gmail API
    │
    ▼
inbox.email.list (tRPC)
    │
    ├─► Check Query Type
    │   ├─► Gmail-specific → Direct Gmail API
    │   └─► Simple → Database Cache
    │
    ├─► Fetch from Gmail
    │
    ├─► Cache to Database
    │
    └─► Return Threads
```

### AI Tool Execution Flow

```
AI Model Request
    │
    ▼
Tool Call Detected
    │
    ├─► Parse Tool Name & Args
    │
    ├─► Route to Handler
    │   ├─► Gmail Tools → google-api.ts
    │   ├─► Calendar Tools → google-api.ts
    │   ├─► Billy Tools → billy.ts
    │   └─► CRM Tools → lead-db.ts / customer-db.ts
    │
    ├─► Execute Tool
    │
    ├─► Format Result
    │
    └─► Return to AI Model
```

### Lead Creation Flow

```
Email Received
    │
    ▼
Email Analysis (AI)
    │
    ├─► Detect Lead Intent
    │
    ├─► Extract Lead Data
    │   ├─► Name
    │   ├─► Email
    │   ├─► Phone
    │   └─► Source
    │
    ├─► Create Lead (DB)
    │
    ├─► Update Email Pipeline
    │
    └─► Notify User
```

---

## Dependencies

### Core Backend Dependencies

```json
{
  "@trpc/server": "^11.0.0", // tRPC framework
  "drizzle-orm": "^0.29.0", // ORM
  "zod": "^3.22.0", // Schema validation
  "express": "^4.18.0", // HTTP server
  "@supabase/supabase-js": "^2.38.0" // Database client
}
```

### AI & LLM Dependencies

```json
{
  "@google/generative-ai": "^0.2.0", // Gemini
  "@anthropic-ai/sdk": "^0.9.0", // Claude
  "openai": "^4.20.0" // GPT-4
}
```

### Integration Dependencies

```json
{
  "googleapis": "^126.0.0", // Google Workspace APIs
  "axios": "^1.6.0" // HTTP client
}
```

### Frontend Dependencies

```json
{
  "react": "^19.0.0",
  "typescript": "^5.3.0",
  "@tanstack/react-query": "^5.0.0", // Data fetching
  "@trpc/client": "^11.0.0", // tRPC client
  "tailwindcss": "^4.0.0" // Styling
}
```

---

## AI Tools & Functions

Friday AI has 35+ tools available for function calling. Here are the main categories:

### Gmail Tools

1. **search_gmail** - Search Gmail with query
2. **get_gmail_thread** - Get full email thread
3. **create_gmail_draft** - Create email draft
4. **send_gmail_message** - Send email (requires approval)
5. **archive_gmail_thread** - Archive thread
6. **add_label_to_thread** - Add Gmail label
7. **remove_label_from_thread** - Remove Gmail label

### Calendar Tools

1. **list_calendar_events** - List calendar events
2. **create_calendar_event** - Create event
3. **update_calendar_event** - Update event
4. **delete_calendar_event** - Delete event
5. **check_calendar_availability** - Check availability

### Billy Invoice Tools

1. **list_billy_invoices** - List invoices
2. **search_billy_customer** - Search customer by email
3. **create_billy_invoice** - Create invoice (requires approval)

### CRM Tools

1. **create_lead** - Create lead from email
2. **update_lead_status** - Update lead status
3. **get_lead_details** - Get lead information
4. **create_customer_profile** - Create customer
5. **create_booking** - Create booking
6. **update_booking_status** - Update booking

### Pipeline Tools

1. **get_pipeline_state** - Get current pipeline state
2. **update_pipeline_stage** - Move email to stage
3. **create_task** - Create task
4. **update_task_status** - Update task status

### Analysis Tools

1. **analyze_email_intent** - Analyze email intent
2. **generate_email_summary** - Generate summary
3. **suggest_labels** - Suggest labels
4. **calculate_lead_score** - Calculate lead score

---

## Examples

### Example 1: Send Chat Message

```typescript
import { trpc } from "@/lib/trpc";

function ChatInput({ conversationId }: { conversationId: number }) {
  const sendMutation = trpc.chat.sendMessage.useMutation();

  const handleSend = async (content: string) => {
    try {
      await sendMutation.mutateAsync({
        conversationId,
        content,
        context: {
          hasEmails: true,
          page: "inbox",
        },
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <input
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSend(e.currentTarget.value);
        }
      }}
    />
  );
}
```

### Example 2: List Email Threads

```typescript
import { trpc } from "@/lib/trpc";

function InboxList() {
  const { data: threads, isLoading } = trpc.inbox.email.list.useQuery({
    query: "is:unread newer_than:1d",
    maxResults: 50,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {threads?.map((thread) => (
        <div key={thread.id}>
          <h3>{thread.subject}</h3>
          <p>{thread.snippet}</p>
          {thread.unread && <span>Unread</span>}
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Create Lead

```typescript
import { trpc } from "@/lib/trpc";

function CreateLeadForm() {
  const createMutation = trpc.crm.lead.create.useMutation({
    onSuccess: () => {
      trpc.useUtils().crm.lead.listLeads.invalidate();
    },
  });

  const handleSubmit = async (data: {
    name: string;
    email: string;
    phone?: string;
  }) => {
    await createMutation.mutateAsync({
      ...data,
      source: "manual",
    });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleSubmit({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
      });
    }}>
      {/* Form fields */}
    </form>
  );
}
```

### Example 4: Get AI Email Summary

```typescript
import { trpc } from "@/lib/trpc";

function EmailSummary({ emailId }: { emailId: number }) {
  const { data: summary, isLoading } = trpc.inbox.email.getSummary.useQuery({
    emailId,
  });

  if (isLoading) return <div>Generating summary...</div>;

  return (
    <div>
      <h3>Summary</h3>
      <p>{summary?.summary}</p>
      <div>
        <h4>Key Points</h4>
        <ul>
          {summary?.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Action Items</h4>
        <ul>
          {summary?.actionItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## Diagrams

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   React UI  │  │  tRPC Hook  │  │   State     │          │
│  │ Components  │◄─┤   Client    │◄─┤ Management  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTP/WebSocket
┌────────────────────────────▼──────────────────────────────────┐
│                        SERVER LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  tRPC      │  │   AI        │  │   Database   │          │
│  │  Routers   │◄─┤  Router     │◄─┤   Layer     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│         │                │                │                    │
│         └────────────────┼────────────────┘                    │
│                          │                                    │
│                  ┌────────▼────────┐                         │
│                  │  Tool Handlers   │                         │
│                  └────────┬─────────┘                         │
└───────────────────────────┼───────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                      EXTERNAL SERVICES                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Gmail    │  │  Calendar   │  │   Billy.dk   │          │
│  │    API     │  │    API      │  │     API     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
Client Request
    │
    ▼
┌─────────────────┐
│  tRPC Client    │
│  (React Hook)   │
└────────┬─────────┘
         │ HTTP POST
         ▼
┌─────────────────┐
│  Express Server │
│  /api/trpc      │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│  tRPC Router    │
│  (Validation)    │
└────────┬─────────┘
         │
         ├─► Auth Check
         │
         ├─► Rate Limit
         │
         ├─► Input Validation (Zod)
         │
         ▼
┌─────────────────┐
│  Handler Logic  │
│  (Business)     │
└────────┬─────────┘
         │
         ├─► Database Query
         │   └─► Drizzle ORM
         │       └─► PostgreSQL
         │
         ├─► AI Call
         │   └─► Model Router
         │       └─► LLM API
         │
         └─► External API
             └─► Google/Billy
         │
         ▼
┌─────────────────┐
│  Response       │
│  (Type-safe)    │
└────────┬─────────┘
         │
         ▼
    Client Receives
```

### Database Schema Relationships

```
users
  │
  ├─► conversations (1:N)
  │     └─► messages (1:N)
  │
  ├─► email_threads (1:N)
  │     └─► emails (1:N)
  │
  ├─► leads (1:N)
  │
  └─► customer_profiles (1:N)
        └─► bookings (1:N)
              └─► service_templates (N:1)
```

### AI Tool Execution

```
AI Model
    │
    ▼
Tool Call Request
    │
    ├─► Parse Function Name
    │
    ├─► Validate Parameters
    │
    ├─► Route to Handler
    │   │
    │   ├─► Gmail Tools
    │   │   └─► google-api.ts
    │   │
    │   ├─► Calendar Tools
    │   │   └─► google-api.ts
    │   │
    │   ├─► Billy Tools
    │   │   └─► billy.ts
    │   │
    │   └─► CRM Tools
    │       └─► lead-db.ts / customer-db.ts
    │
    ├─► Execute Tool
    │
    ├─► Format Result
    │
    └─► Return to AI
        │
        └─► Continue Conversation
```

---

## Error Handling

### tRPC Error Codes

- `UNAUTHORIZED` (401) - Not authenticated
- `FORBIDDEN` (403) - No permission
- `NOT_FOUND` (404) - Resource not found
- `BAD_REQUEST` (400) - Invalid input
- `TOO_MANY_REQUESTS` (429) - Rate limit exceeded
- `INTERNAL_SERVER_ERROR` (500) - Server error

### Example Error Handling

```typescript
try {
  await mutation.mutateAsync(data);
} catch (error) {
  if (error.data?.code === "TOO_MANY_REQUESTS") {
    // Handle rate limit
    const resetTime = error.data.reset;
    console.log(`Rate limited. Reset at: ${resetTime}`);
  } else if (error.data?.code === "UNAUTHORIZED") {
    // Redirect to login
    router.push("/login");
  } else {
    // Generic error
    toast.error(error.message);
  }
}
```

---

## Rate Limiting

### Chat Messages

- **Limit:** 10 messages per minute
- **Storage:** Redis
- **Window:** 60 seconds
- **Error:** `TOO_MANY_REQUESTS` with reset time

### Email Operations

- **Limit:** Varies by operation
- **Gmail API:** Google's quota limits apply
- **Caching:** Database cache reduces API calls

---

## WebSocket Support

### Chat Streaming

The `chatStreaming` router provides WebSocket support for real-time chat:

```typescript
// Client-side
const stream = trpc.chatStreaming.sendMessage.useSubscription({
  conversationId: 1,
  content: "Hello",
});

stream.on("data", chunk => {
  // Handle streaming response
});
```

---

**Documentation Generated:** 2025-01-28  
**Last Code Scan:** 2025-01-28  
**Maintained by:** Auto-generated from codebase
