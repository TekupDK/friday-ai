# 📁 OMRÅDE 1: CORE APPLICATION - Komplet Analyse

**Generated:** 2025-11-08 17:39 UTC+01:00  
**Status:** Production Ready ✅

---

## 🎯 **OVERVIEW**

Core Application består af:
- **Client (Frontend):** React + TypeScript + Vite
- **Server (Backend):** Node.js + tRPC + Express
- **Shared:** Fælles types og utilities

**Total Files:** 150+ core files  
**Tech Stack:** React, TypeScript, tRPC, Drizzle ORM, PostgreSQL

---

## 📂 **CLIENT STRUCTURE - DETALJERET**

### **Root Level (`client/src/`)**

```
client/src/
├── App.tsx              # Main app component (routing, layout)
├── main.tsx             # Entry point (React.render)
├── index.css            # Global styles (Tailwind)
├── const.ts             # Client constants
├── components/          # React components (50+)
├── hooks/               # Custom hooks (15+)
├── pages/               # Page components (6)
├── lib/                 # Utilities & helpers
├── services/            # API services
├── contexts/            # React contexts
├── types/               # TypeScript types
├── config/              # Configuration
├── _core/               # Core utilities
└── __tests__/           # Client tests
```

---

## 🎨 **COMPONENTS - KATEGORISERET**

### **1. Chat Components (`components/chat/`)**

**Purpose:** Friday AI chat interface

**Files:**
```
chat/
├── ChatInput.tsx              # Message input with suggestions
├── ShortWaveChatPanel.tsx     # Main chat panel (Shortwave-style)
├── WelcomeScreen.tsx          # Welcome screen with suggestions
├── ChatMessage.tsx            # Message display component
├── MessageList.tsx            # Message list with virtualization
└── TypingIndicator.tsx        # Loading indicator
```

**Key Features:**
- ✅ Shortwave-inspired UI
- ✅ Auto-scroll to latest message
- ✅ Optimistic updates
- ✅ Loading states
- ✅ Error handling
- ✅ Message timestamps
- ✅ Welcome screen with suggestions

**Used By:**
- `AIAssistantPanelV2.tsx` (main panel)

---

### **2. Panel Components (`components/panels/`)**

**Purpose:** Main application panels (3-panel layout)

**Files:**
```
panels/
├── AIAssistantPanelV2.tsx     # Friday AI chat panel (RIGHT)
├── EmailCenterPanel.tsx       # Email center (MIDDLE)
├── SmartWorkspacePanel.tsx    # Workspace panel (LEFT)
├── LeadsPanel.tsx             # Leads management
└── AnalyticsPanel.tsx         # Analytics dashboard
```

**Key Features:**
- ✅ 3-panel layout
- ✅ Context-aware chat
- ✅ Email integration
- ✅ Workspace management
- ✅ Lead tracking

**Architecture:**
```
┌─────────────┬──────────────┬─────────────┐
│  Workspace  │    Email     │  Friday AI  │
│   (LEFT)    │   (MIDDLE)   │   (RIGHT)   │
│             │              │             │
│  - Leads    │  - Threads   │  - Chat     │
│  - Tasks    │  - Messages  │  - Context  │
│  - Calendar │  - Actions   │  - Tools    │
└─────────────┴──────────────┴─────────────┘
```

---

### **3. Inbox Components (`components/inbox/`)**

**Purpose:** Email inbox functionality

**Files:**
```
inbox/
├── EmailList.tsx              # Email thread list
├── EmailThread.tsx            # Thread view
├── EmailComposer.tsx          # Compose email
├── EmailActions.tsx           # Email actions (archive, label, etc.)
└── EmailFilters.tsx           # Filter controls
```

**Key Features:**
- ✅ Gmail integration
- ✅ Thread management
- ✅ Label management
- ✅ AI summaries
- ✅ Smart suggestions

---

### **4. Workspace Components (`components/workspace/`)**

**Purpose:** Business workspace features

**Files:**
```
workspace/
├── LeadCard.tsx               # Lead display
├── TaskList.tsx               # Task management
├── CustomerProfile.tsx        # Customer details
├── InvoiceView.tsx            # Invoice display
├── CalendarView.tsx           # Calendar integration
└── DashboardStats.tsx         # Analytics widgets
```

**Key Features:**
- ✅ Lead management
- ✅ Task tracking
- ✅ Customer profiles
- ✅ Billy integration
- ✅ Calendar sync

---

### **5. UI Components (`components/ui/`)**

**Purpose:** Reusable UI primitives (shadcn/ui)

**Files:** 30+ components
```
ui/
├── button.tsx                 # Button component
├── input.tsx                  # Input component
├── dialog.tsx                 # Dialog/modal
├── dropdown-menu.tsx          # Dropdown
├── scroll-area.tsx            # Scroll container
├── toast.tsx                  # Toast notifications
├── card.tsx                   # Card container
├── badge.tsx                  # Badge/tag
├── avatar.tsx                 # Avatar component
├── separator.tsx              # Divider
├── skeleton.tsx               # Loading skeleton
└── ... (20+ more)
```

**Tech:** shadcn/ui + Radix UI + Tailwind CSS

---

### **6. Other Components**

```
components/
├── ErrorBoundary.tsx          # Error boundary wrapper
├── PanelErrorBoundary.tsx     # Panel-specific error handling
├── DashboardLayout.tsx        # Main layout
├── LoginDialog.tsx            # Login modal
├── SettingsDialog.tsx         # Settings modal
├── ActionApprovalModal.tsx    # AI action approval
├── ActivityTimeline.tsx       # Activity feed
├── SafeHtmlView.tsx           # Safe HTML rendering
└── Map.tsx                    # Map component
```

---

## 🪝 **HOOKS - CUSTOM REACT HOOKS**

### **Chat Hooks**

**1. `useFridayChatSimple.ts`** ⭐ MAIN CHAT HOOK
```typescript
// Simple chat hook with optimistic updates
const {
  messages,           // Chat messages
  isLoading,          // Loading state
  error,              // Error state
  sendMessage,        // Send message function
} = useFridayChatSimple({
  conversationId,
  context,            // Email/calendar context
});
```

**Features:**
- ✅ Message loading
- ✅ Message sending
- ✅ Optimistic updates
- ✅ Error handling
- ✅ Context integration
- ✅ Auto-refetch

**Used In:** `ShortWaveChatPanel.tsx`

---

**2. `useFridayChat.ts`** - ADVANCED CHAT HOOK
```typescript
// Advanced chat with pagination
const {
  messages,
  loadMoreMessages,   // Load older messages
  hasMoreMessages,    // Has more flag
  isLoading,
  sendMessage,
} = useFridayChat({
  conversationId,
  maxMessages: 50,    // Memory management
});
```

**Features:**
- ✅ Message pagination
- ✅ Infinite scroll
- ✅ Memory management (max 50 messages)
- ✅ Cursor-based pagination

---

**3. `useStreamingChat.ts`** - STREAMING HOOK
```typescript
// Real-time streaming responses
const {
  streamingMessage,   // Current streaming message
  isStreaming,        // Streaming state
  stopStreaming,      // Stop function
} = useStreamingChat({
  conversationId,
  onChunk: (chunk) => {
    // Handle each chunk
  }
});
```

**Features:**
- ✅ Server-Sent Events (SSE)
- ✅ Real-time streaming
- ✅ Stop streaming
- ✅ Chunk handling

---

### **Utility Hooks**

**4. `useDebounce.ts`**
- Debounce values (search, input)

**5. `useKeyboardShortcuts.ts`**
- Global keyboard shortcuts

**6. `useRateLimit.ts`**
- Client-side rate limiting

**7. `useMobile.tsx`**
- Mobile detection

**8. `useActionSuggestions.ts`**
- AI action suggestions

**9. `useAdaptivePolling.ts`**
- Smart polling for updates

**10. `useChatInput.ts`**
- Chat input management

---

## 📄 **PAGES - MAIN ROUTES**

```
pages/
├── Home.tsx                   # Dashboard home (/)
├── LoginPage.tsx              # Login page (/login)
├── WorkspaceLayout.tsx        # Main workspace layout
├── ChatInterface.tsx          # Chat interface
├── ComponentShowcase.tsx      # UI component showcase
└── NotFound.tsx               # 404 page
```

**Routing:**
```typescript
/ → Home (Dashboard)
/login → LoginPage
/workspace → WorkspaceLayout (3-panel)
/chat → ChatInterface
/showcase → ComponentShowcase
* → NotFound
```

---

## 🔧 **LIB - UTILITIES & HELPERS**

```
lib/
├── trpc.ts                    # tRPC client setup
├── utils.ts                   # General utilities (cn, etc.)
├── api.ts                     # API helpers
├── storage.ts                 # LocalStorage wrapper
├── date.ts                    # Date utilities
├── email.ts                   # Email utilities
└── validation.ts              # Validation helpers
```

**Key Utilities:**
- `cn()` - Tailwind class merging
- `trpc` - tRPC client instance
- Storage helpers
- Date formatting
- Email parsing

---

## 🎯 **CORE UTILITIES (`_core/`)**

```
_core/
├── types.ts                   # Core types
├── constants.ts               # Core constants
├── errors.ts                  # Error classes
└── config.ts                  # Core config
```

---

## 🌐 **CONTEXTS - REACT CONTEXTS**

```
contexts/
├── AuthContext.tsx            # Authentication state
├── ThemeContext.tsx           # Theme (dark/light)
├── WorkspaceContext.tsx       # Workspace state
└── EmailContext.tsx           # Email state
```

---

## 📊 **CLIENT STATISTICS**

| Category | Count | Purpose |
|----------|-------|---------|
| Components | 50+ | UI components |
| Hooks | 15+ | Custom hooks |
| Pages | 6 | Route pages |
| Contexts | 4 | Global state |
| Utilities | 20+ | Helper functions |
| Tests | 30+ | Component tests |

---

## 🖥️ **SERVER STRUCTURE - DETALJERET**

### **Root Level (`server/`)**

```
server/
├── routers.ts               # Main tRPC router ⭐
├── ai-router.ts             # AI orchestration ⭐
├── friday-tools.ts          # AI tools (35+) ⭐
├── friday-tool-handlers.ts  # Tool implementations ⭐
├── db.ts                    # Database functions ⭐
├── google-api.ts            # Google APIs
├── billy.ts                 # Billy integration
├── analytics.ts             # Analytics tracking
├── routers/                 # Sub-routers
├── _core/                   # Core server utilities
├── api/                     # API endpoints
├── scripts/                 # Server scripts
└── __tests__/               # Server tests
```

---

## 🔌 **MAIN ROUTER (`routers.ts`)** ⭐

**Purpose:** Main tRPC API router

**Endpoints:**

### **Chat Endpoints**
```typescript
chat: {
  createConversation()       // Create new conversation
  getUserConversations()     // Get user's conversations
  deleteConversation()       // Delete conversation
  getMessages()              // Get conversation messages
  sendMessage()              // Send message + AI response
}
```

### **Email Endpoints**
```typescript
email: {
  getThreads()               // Get email threads
  getThread()                // Get single thread
  sendEmail()                // Send email
  archiveThread()            // Archive thread
  labelThread()              // Add/remove labels
  searchEmails()             // Search emails
}
```

### **Calendar Endpoints**
```typescript
calendar: {
  getEvents()                // Get calendar events
  createEvent()              // Create event
  updateEvent()              // Update event
  deleteEvent()              // Delete event
}
```

### **Billy Endpoints**
```typescript
billy: {
  getInvoices()              // Get invoices
  createInvoice()            // Create invoice
  getCustomers()             // Get customers
  syncData()                 // Sync Billy data
}
```

### **Analytics Endpoints**
```typescript
analytics: {
  trackEvent()               // Track event
  getMetrics()               // Get metrics
  getDashboard()             // Get dashboard data
}
```

---

## 🤖 **AI ROUTER (`ai-router.ts`)** ⭐

**Purpose:** AI orchestration and routing

**Function:** `routeAI()`

**Flow:**
```
1. Receive message + context + history
2. Select appropriate AI model
3. Inject system prompts
4. Add available tools (35+)
5. Call LLM (OpenRouter)
6. Parse response
7. Handle tool calls
8. Create pending actions
9. Return response
```

**Features:**
- ✅ Model selection (gemma-3-27b, gpt-4, etc.)
- ✅ Context injection
- ✅ Tool integration
- ✅ Action approval system
- ✅ Error handling
- ✅ Streaming support

**Code Structure:**
```typescript
export async function routeAI({
  messages,      // Conversation history
  context,       // Email/calendar context
  tools,         // Available tools (35+)
  userId,        // User ID
  conversationId // Conversation ID
}) {
  // 1. Select model
  const model = selectModel(messages);
  
  // 2. Build system prompt
  const systemPrompt = buildSystemPrompt(context);
  
  // 3. Call LLM
  const response = await callLLM({
    model,
    messages: [systemPrompt, ...messages],
    tools,
  });
  
  // 4. Handle tool calls
  if (response.toolCalls) {
    await handleToolCalls(response.toolCalls);
  }
  
  // 5. Return response
  return response;
}
```

---

## 🛠️ **FRIDAY TOOLS (`friday-tools.ts`)** ⭐

**Purpose:** AI function definitions (35+ tools)

**Categories:**

### **1. Gmail Tools (15 tools)**
```typescript
- gmail_search_emails          // Search emails
- gmail_get_thread             // Get email thread
- gmail_send_email             // Send email
- gmail_reply_to_email         // Reply to email
- gmail_archive_thread         // Archive thread
- gmail_label_thread           // Add/remove labels
- gmail_mark_read              // Mark as read/unread
- gmail_get_labels             // Get all labels
- gmail_create_label           // Create label
- gmail_delete_label           // Delete label
- gmail_get_attachments        // Get attachments
- gmail_download_attachment    // Download attachment
- gmail_get_draft              // Get draft
- gmail_create_draft           // Create draft
- gmail_send_draft             // Send draft
```

### **2. Calendar Tools (8 tools)**
```typescript
- calendar_get_events          // Get events
- calendar_create_event        // Create event
- calendar_update_event        // Update event
- calendar_delete_event        // Delete event
- calendar_search_events       // Search events
- calendar_get_free_busy       // Get availability
- calendar_list_calendars      // List calendars
- calendar_create_calendar     // Create calendar
```

### **3. Billy Tools (7 tools)**
```typescript
- billy_get_invoices           // Get invoices
- billy_create_invoice         // Create invoice
- billy_get_customers          // Get customers
- billy_create_customer        // Create customer
- billy_get_products           // Get products
- billy_sync_data              // Sync data
- billy_get_stats              // Get statistics
```

### **4. Database Tools (5 tools)**
```typescript
- db_get_leads                 // Get leads
- db_create_lead               // Create lead
- db_update_lead               // Update lead
- db_get_tasks                 // Get tasks
- db_create_task               // Create task
```

**Total:** 35+ tools

---

## 🎯 **TOOL HANDLERS (`friday-tool-handlers.ts`)** ⭐

**Purpose:** Implement tool functions

**Structure:**
```typescript
export const toolHandlers = {
  gmail_search_emails: async (params) => {
    // Implementation
    const results = await searchGmail(params);
    return results;
  },
  
  calendar_create_event: async (params) => {
    // Implementation
    const event = await createCalendarEvent(params);
    return event;
  },
  
  // ... 35+ handlers
};
```

**Features:**
- ✅ Error handling
- ✅ Validation
- ✅ Rate limiting
- ✅ Logging
- ✅ Idempotency

---

## 🗄️ **DATABASE (`db.ts`)** ⭐

**Purpose:** Database operations

**Functions:**

### **Conversation Functions**
```typescript
- createConversation()         // Create conversation
- getConversation()            // Get conversation
- getUserConversations()       // Get user's conversations
- deleteConversation()         // Delete conversation
- updateConversation()         // Update conversation
```

### **Message Functions**
```typescript
- createMessage()              // Create message
- getMessages()                // Get messages
- getConversationMessages()    // Get conversation messages
- deleteMessage()              // Delete message
```

### **Email Functions**
```typescript
- saveEmailThread()            // Save email thread
- getEmailThreads()            // Get email threads
- updateEmailThread()          // Update thread
- deleteEmailThread()          // Delete thread
```

### **Analytics Functions**
```typescript
- trackEvent()                 // Track event
- getAnalytics()               // Get analytics
- getMetrics()                 // Get metrics
```

**Tech:** Drizzle ORM + PostgreSQL

---

## 🔧 **CORE SERVER UTILITIES (`_core/`)**

```
_core/
├── index.ts                   # Main server entry
├── trpc.ts                    # tRPC setup
├── context.ts                 # Request context
├── db-pool.ts                 # Database pool
├── llm.ts                     # LLM client
├── cookies.ts                 # Cookie handling
├── feature-flags.ts           # Feature flags
└── errors.ts                  # Error handling
```

**Key Files:**

**1. `context.ts`** - Request Context
```typescript
export async function createContext({ req, res }) {
  // Get user from session
  const user = await getUserFromSession(req);
  
  return {
    req,
    res,
    user,
    db: getDb(),
  };
}
```

**2. `trpc.ts`** - tRPC Setup
```typescript
export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(authMiddleware);
```

**3. `llm.ts`** - LLM Client
```typescript
export async function callLLM({
  model,
  messages,
  tools,
  stream = false,
}) {
  // Call OpenRouter API
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      stream,
    }),
  });
  
  return response.json();
}
```

---

## 📊 **SERVER STATISTICS**

| Category | Count | Purpose |
|----------|-------|---------|
| Routers | 10+ | API endpoints |
| Tools | 35+ | AI functions |
| Database Functions | 50+ | Data operations |
| Utilities | 30+ | Helper functions |
| Tests | 40+ | Server tests |
| Integrations | 3 | Gmail, Calendar, Billy |

---

## 🔄 **DATA FLOW - COMPLETE**

### **Chat Message Flow:**

```
1. USER TYPES MESSAGE
   ↓
2. ChatInput.tsx
   ↓
3. useFridayChatSimple.sendMessage()
   ↓
4. tRPC: chat.sendMessage
   ↓
5. server/routers.ts
   ↓
6. Analytics: trackEvent('chat_message_sent')
   ↓
7. Rate Limit: checkRateLimit()
   ↓
8. Database: createMessage()
   ↓
9. Load conversation history
   ↓
10. server/ai-router.ts: routeAI()
    ↓
11. Select model + inject context
    ↓
12. Add tools (35+)
    ↓
13. Call OpenRouter LLM
    ↓
14. Parse response + tool calls
    ↓
15. Execute tools (if needed)
    ↓
16. Create pending actions
    ↓
17. Database: createMessage() (AI response)
    ↓
18. Analytics: trackEvent('chat_ai_response')
    ↓
19. Return response to client
    ↓
20. useFridayChatSimple: optimistic update
    ↓
21. ShortWaveChatPanel: display message
    ↓
22. Auto-scroll to bottom
```

---

## 🎯 **KEY INTEGRATION POINTS**

### **1. Client ↔ Server**
- **Protocol:** tRPC (type-safe RPC)
- **Transport:** HTTP/WebSocket
- **Auth:** Session cookies

### **2. Server ↔ Database**
- **ORM:** Drizzle
- **Database:** PostgreSQL
- **Connection:** Connection pool

### **3. Server ↔ AI**
- **Provider:** OpenRouter
- **Models:** gemma-3-27b, gpt-4, etc.
- **Protocol:** REST API

### **4. Server ↔ Google**
- **APIs:** Gmail, Calendar
- **Auth:** OAuth 2.0
- **SDK:** googleapis

### **5. Server ↔ Billy**
- **API:** Billy REST API
- **Auth:** API key
- **Protocol:** REST

---

## 📁 **VIGTIGSTE FILER - QUICK REFERENCE**

### **Client:**
1. `client/src/App.tsx` - Main app
2. `client/src/components/panels/AIAssistantPanelV2.tsx` - Friday AI panel
3. `client/src/components/chat/ShortWaveChatPanel.tsx` - Chat UI
4. `client/src/hooks/useFridayChatSimple.ts` - Chat hook
5. `client/src/lib/trpc.ts` - tRPC client

### **Server:**
1. `server/routers.ts` - Main API router
2. `server/ai-router.ts` - AI orchestration
3. `server/friday-tools.ts` - AI tools (35+)
4. `server/friday-tool-handlers.ts` - Tool implementations
5. `server/db.ts` - Database operations
6. `server/_core/index.ts` - Server entry point

---

## ✅ **HVAD VIRKER**

### **Client:**
- ✅ 3-panel layout
- ✅ Chat interface (Shortwave-style)
- ✅ Optimistic updates
- ✅ Error handling
- ✅ Loading states
- ✅ Auto-scroll
- ✅ Welcome screen
- ✅ Message timestamps
- ✅ Context integration

### **Server:**
- ✅ tRPC API (type-safe)
- ✅ AI routing
- ✅ 35+ tools
- ✅ Context-aware responses
- ✅ Analytics tracking
- ✅ Rate limiting
- ✅ Error handling
- ✅ Streaming support
- ✅ Action approval system

---

## 🎯 **NÆSTE OMRÅDE**

**Område 1: Core Application** ✅ COMPLETE

**Næste:** Område 2 - AI System (Friday AI, Tools, Router)

Vil du fortsætte til næste område? 🤖
