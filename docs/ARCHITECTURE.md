# Friday AI Chat - System Architecture

**Author:** Manus AI  
**Last Updated:** January 28, 2025  
**Version:** 1.1.0

## Executive Summary

Friday AI Chat is a comprehensive business automation platform built for TekupDK (Rendetalje.dk cleaning company). The system integrates AI-powered chat, email management, invoice tracking, calendar scheduling, lead management, and customer relationship management into a unified interface. The architecture follows a modern full-stack approach with React 19 frontend, Express 4 + tRPC 11 backend, MySQL database, and integrations with Google Workspace (Gmail, Calendar) and Billy.dk accounting system.

## System Overview

### Technology Stack

The application is built on the following core technologies:

**Frontend:**

- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui component library
- tRPC React Query for type-safe API calls
- Wouter for client-side routing
- Streamdown for markdown rendering

**Backend:**

- Node.js 22.13.0 with TypeScript
- Express 4 web server
- tRPC 11 for type-safe API layer
- Drizzle ORM for database access
- MySQL/TiDB database

**AI & Integrations:**

- Gemini 2.5 Flash (primary AI model)
- Claude 3.5 Sonnet, GPT-4o (alternative models)
- Google Gmail API (email management)
- Google Calendar API (scheduling)
- Billy.dk API via MCP (invoicing)
- Manus OAuth for authentication

### Architecture Diagram

````text
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  ChatPanel   │  │ InboxPanel   │  │CustomerProfile│      │
│  │              │  │              │  │              │      │
│  │ - Conversation│  │ - Email      │  │ - Overview   │      │
│  │ - Messages   │  │ - Invoices   │  │ - Invoices   │      │
│  │ - AI Chat    │  │ - Calendar   │  │ - Emails     │      │
│  │              │  │ - Leads      │  │ - Chat       │      │
│  │              │  │ - Tasks      │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
│                    ┌──────▼───────┐                        │
│                    │  tRPC Client │                        │
│                    └──────┬───────┘                        │
└───────────────────────────┼────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            │
┌───────────────────────────▼────────────────────────────────┐
│                      Backend Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              tRPC Router (routers.ts)                │  │
│  │                                                      │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │  │
│  │  │  auth  │ │  chat  │ │ inbox  │ │customer│       │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘       │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │  │
│  │  │ system │ │   crm  │ │subscript│ │  ai    │       │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘       │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                      │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │           Business Logic Layer                       │  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │  │
│  │  │ AI Router    │  │Intent Actions│  │Tool      │  │  │
│  │  │ - Model sel. │  │ - 7 intents  │  │Handlers  │  │  │
│  │  │ - Streaming  │  │ - Execution  │  │ - 12 tools│  │  │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │  │
│  │  │Customer Mgmt │  │Billy Sync    │  │Google API│  │  │
│  │  │ - Profiles   │  │ - Invoices   │  │ - Gmail  │  │  │
│  │  │ - Balance    │  │ - Contacts   │  │ - Calendar│  │  │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                      │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │            Data Access Layer (db.ts)                 │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         Drizzle ORM                          │   │  │
│  │  └──────────────┬───────────────────────────────┘   │  │
│  └─────────────────┼──────────────────────────────────────┘
└────────────────────┼──────────────────────────────────────┘
                     │
                     │ MySQL Protocol
                     │
┌────────────────────▼──────────────────────────────────────┐
│                   Database Layer                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              MySQL/TiDB Database                     │ │
│  │                                                      │ │
│  │  13 Tables:                                          │ │
│  │  - users, conversations, messages                    │ │
│  │  - email_threads, invoices, calendar_events          │ │
│  │  - leads, tasks, analytics_events                    │ │
│  │  - customer_profiles, customer_invoices              │ │
│  │  - customer_emails, customer_conversations           │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│                  External Integrations                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ Google     │  │ Billy.dk   │  │ Manus AI   │          │
│  │ Workspace  │  │ Accounting │  │ Services   │          │
│  │            │  │            │  │            │          │
│  │ - Gmail    │  │ - Invoices │  │ - LLM      │          │
│  │ - Calendar │  │ - Contacts │  │ - Storage  │          │
│  │ - OAuth    │  │ - MCP      │  │ - OAuth    │          │
│  └────────────┘  └────────────┘  └────────────┘          │
└───────────────────────────────────────────────────────────┘

```bash

## Core Components

### 1. Frontend Architecture

The frontend follows a component-based architecture with clear separation of concerns:

**Main Application Shell** (`client/src/App.tsx`):

- Route configuration using Wouter
- Theme provider for dark/light mode
- Global error boundary
- Toast notification system

**Chat Interface** (`client/src/pages/ChatInterface.tsx`):

- Split-panel layout (60/40 desktop, single column mobile)
- ChatPanel for conversations and AI interaction
- InboxPanel for email, invoices, calendar, leads, tasks
- Responsive design with hamburger menu on mobile

**Component Structure:**

```bash
client/src/
├── pages/
│   ├── ChatInterface.tsx      # Main app interface
│   ├── Home.tsx                # Landing page
│   └── NotFound.tsx            # 404 page
├── components/
│   ├── ChatPanel.tsx           # Conversation sidebar + chat
│   ├── InboxPanel.tsx          # Tab navigation for inbox
│   ├── CustomerProfile.tsx     # Customer profile modal
│   ├── inbox/
│   │   ├── EmailTab.tsx        # Email management
│   │   ├── InvoicesTab.tsx     # Invoice tracking
│   │   ├── CalendarTab.tsx     # Calendar view
│   │   ├── LeadsTab.tsx        # Lead management
│   │   └── TasksTab.tsx        # Task management
│   └── ui/                     # shadcn/ui components
├── contexts/
│   └── ThemeContext.tsx        # Theme management
├── hooks/
│   └── useAuth.ts              # Authentication hook
└── lib/
    └── trpc.ts                 # tRPC client setup

```text

### 2. Backend Architecture

The backend uses a layered architecture with clear separation between routing, business logic, and data access:

**API Layer** (`server/routers.ts`):

- tRPC router with type-safe procedures
- Public and protected procedure middleware
- Input validation using Zod schemas
- Organized into feature-based sub-routers

**Business Logic Layer:**

- `ai-router.ts`: AI model selection and routing
- `intent-actions.ts`: Intent parsing and action execution
- `friday-tool-handlers.ts`: Tool function implementations
- `customer-router.ts`: Customer profile management
- `billy-sync.ts`: Billy.dk invoice synchronization
- `google-api.ts`: Gmail and Calendar API integration

**Data Access Layer** (`server/db.ts`, `server/customer-db.ts`):

- Drizzle ORM query builders
- Database helper functions
- Transaction management
- Connection pooling

### 3. Database Schema

The database consists of 13 tables organized into logical groups:

**Authentication & Users:**

- `users`: User accounts with OAuth integration

**Conversations & Messaging:**

- `conversations`: Chat conversation metadata
- `messages`: Individual chat messages with AI responses

**Email Management:**

- `email_threads`: Gmail thread metadata and content

**Financial Management:**

- `invoices`: Billy.dk invoice data
- `customer_invoices`: Customer-specific invoice junction table

**Calendar & Scheduling:**

- `calendar_events`: Google Calendar events

**Lead & Task Management:**

- `leads`: Sales leads with scoring
- `tasks`: User tasks and reminders

**Customer Relationship Management:**

- `customer_profiles`: Aggregated customer data
- `customer_emails`: Email history per customer
- `customer_conversations`: Dedicated chat per customer

**Analytics:**

- `analytics_events`: User interaction tracking

### 4. AI System Architecture

The AI system uses a multi-model approach with intelligent routing:

**Model Selection Strategy:**

```text
Task Type          → Primary Model      → Fallback
─────────────────────────────────────────────────────
chat               → gemini-2.5-flash   → gpt-4o
email-draft        → claude-3-5-sonnet  → gpt-4o
invoice-create     → gpt-4o             → claude
calendar-check     → gemini-2.5-flash   → gpt-4o
lead-analysis      → claude-3-5-sonnet  → gemini
data-analysis      → gemini-2.5-flash   → claude
code-generation    → claude-3-5-sonnet  → gpt-4o

```text

**Intent Recognition System:**

The system recognizes 7 core intents with confidence scoring:

1. **search_gmail**: Search email threads
1. **book_meeting**: Schedule calendar events
1. **create_invoice**: Generate Billy invoices
1. **create_lead**: Add new sales leads
1. **create_task**: Create tasks/reminders
1. **request_flytter_photos**: Request moving photos from customers
1. **job_completion**: Mark jobs as complete

**Tool System:**

12 tools are available to the AI for executing actions:

| Tool Name               | Description               | Parameters                            |
| ----------------------- | ------------------------- | ------------------------------------- |
| `search_gmail`          | Search Gmail threads      | query, maxResults                     |
| `get_gmail_thread`      | Get specific email thread | threadId                              |
| `create_gmail_draft`    | Draft email reply         | to, subject, body                     |
| `list_calendar_events`  | List calendar events      | timeMin, timeMax                      |
| `create_calendar_event` | Create calendar event     | summary, start, end, description      |
| `check_calendar`        | Check calendar events     | date, query                           |
| `find_free_slots`       | Find free time slots      | startDate, endDate, duration          |
| `get_billy_invoices`    | List Billy invoices       | status, customerId                    |
| `create_billy_invoice`  | Create new invoice        | customer, items, dueDate              |
| `create_lead`           | Add sales lead            | name, email, phone, source            |
| `create_task`           | Create task               | title, description, dueDate, priority |
| `get_leads`             | List all leads            | status, source                        |

### 5. Integration Architecture

**Google Workspace Integration:**

Authentication uses service account with domain-wide delegation:

- Service account key stored in `GOOGLE_SERVICE_ACCOUNT_KEY`
- Impersonates user via `GOOGLE_IMPERSONATED_USER`
- Scopes: Gmail (read/send), Calendar (full access)

**Billy.dk Integration:**

Uses Model Context Protocol (MCP) server:

- MCP server: `billy` (billy-mcp by TekupDK)
- API key: `BILLY_API_KEY`
- Organization ID: `BILLY_ORGANIZATION_ID`
- Tools: `billy_get_invoices`, `billy_create_invoice`, `billy_get_contacts`

**Manus Services Integration:**

Built-in services provided by Manus platform:

- LLM API: `BUILT_IN_FORGE_API_URL` + `BUILT_IN_FORGE_API_KEY`
- S3 Storage: Pre-configured via `storagePut()` helper
- OAuth: `OAUTH_SERVER_URL` + `VITE_OAUTH_PORTAL_URL`

## Data Flow

### Typical User Interaction Flow

1. **User sends message in chat:**

```text
   User → ChatPanel → trpc.chat.sendMessage
   → AI Router → Intent Parser → Tool Handler
   → External API → Database → Response
   → AI Router → ChatPanel → User

```text

1. **Customer profile view:**

```text
   User → LeadsTab → "View Profile" button
   → trpc.customer.getProfileByLeadId
   → customer-db.ts → Database
   → CustomerProfile component → User

```text

1. **Invoice sync:**

```text
   User → CustomerProfile → "Opdater" button
   → trpc.customer.syncBillyInvoices
   → billy-sync.ts → Billy MCP → Billy API
   → customer-db.ts → Database
   → Balance calculation → UI update

```text

## Security Architecture

### Authentication Flow

1. User clicks login → Redirected to Manus OAuth portal
1. OAuth callback → JWT token issued
1. Token stored in HTTP-only cookie (`COOKIE_NAME`)
1. Every request → Cookie validated → User context injected
1. Protected procedures check `ctx.user` existence

### Authorization Model

**Role-based Access Control (RBAC):**

The system implements a comprehensive RBAC system with four role levels:

- `guest`: Unauthenticated or unknown users (lowest privilege)
- `user`: Standard authenticated users
- `admin`: Administrators with elevated privileges
- `owner`: System owner with full access (highest privilege)

Higher roles inherit permissions from lower roles. Owner check takes precedence over database role.

**Procedure Protection:**

- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires valid user session
- `adminProcedure`: Requires admin role (checks `ctx.user.role === "admin"`)
- `roleProcedure(role)`: Requires minimum role level (user/admin/owner)
- `permissionProcedure(permission)`: Requires specific permission (e.g., "create_invoice")
- `ownerProcedure`: Shorthand for owner-only endpoints

**Ownership Verification:**

All resource access endpoints verify ownership using:
- `requireOwnership()` - Verify single resource ownership
- `verifyResourceOwnership()` - Fetch and verify resource ownership
- `requireOwnershipBatch()` - Verify multiple resources ownership

**See Also:** [RBAC_GUIDE.md](./core/guides/RBAC_GUIDE.md) for comprehensive RBAC documentation.

### Data Security

**Sensitive Data Handling:**

- API keys stored in environment variables
- Database credentials injected by platform
- No credentials in code or version control
- S3 storage uses non-enumerable keys with random suffixes

**Input Validation:**

- All tRPC inputs validated with Zod schemas
- Email addresses validated with `.email()` constraint
- Enum values restricted to predefined sets
- SQL injection prevented by Drizzle ORM parameterization

## Performance Considerations

### Frontend Optimization

**Code Splitting:**

- Route-based lazy loading (not yet implemented)
- Component-level code splitting for large components

**Query Optimization:**

- Auto-refresh intervals (30s for email/invoices/calendar)
- Optimistic updates for instant UI feedback
- Query invalidation on mutations

**Asset Optimization:**

- Tailwind CSS purging for minimal bundle size
- Vite build optimization
- Image lazy loading (not yet implemented)

### Backend Optimization

**Database Performance:**

- Indexed columns: `userId`, `openId`, `email`
- Connection pooling via Drizzle
- Lazy database initialization

**API Performance:**

- tRPC batching for multiple queries
- Superjson for efficient serialization
- Response caching (not yet implemented)

**External API Rate Limiting:**

- Gmail API: 250 quota units/user/second
- Billy API: No documented limits
- LLM API: Platform-managed rate limits

## Deployment Architecture

### Development Environment

**Local Development:**

```bash
pnpm install
pnpm db:push          # Migrate database
pnpm dev              # Start dev server (port 3000)

```text

**Environment Variables:**

- Managed by Manus platform
- Auto-injected during development
- No manual `.env` file needed

### Production Deployment

**Manus Platform Deployment:**

1. Create checkpoint: `webdev_save_checkpoint`
1. Click "Publish" in Management UI
1. Auto-deployed to `*.manus.space` domain
1. Custom domain binding available in Settings

**Database Migration:**

```bash
pnpm db:push  # Generates and applies migrations

```text

**Build Process:**

```bash
pnpm build    # Builds frontend and backend

````

## Monitoring & Observability

### Health Check Endpoints

Friday AI Chat provides health check endpoints for monitoring and deployment verification:

**GET `/api/health`** - Basic health check

- Always returns HTTP 200 if server is running
- Used by load balancers for basic liveness checks
- Returns: status, timestamp, uptime, version, environment

**GET `/api/ready`** - Readiness check

- Verifies all critical dependencies (Database, Redis)
- Returns HTTP 200 if ready, HTTP 503 if not ready
- Used by Kubernetes readiness probes
- Includes response times for each dependency check

**Implementation:**

- Location: `server/routes/health.ts`
- Database check: Verifies connection with `SELECT 1` query
- Redis check: Optional (falls back to in-memory if not configured)
- Error handling: Graceful degradation with detailed status

**Usage:**

```bash
# Basic health check
curl http://localhost:3000/api/health

# Readiness check
curl http://localhost:3000/api/ready
```

**See Also:** [Health Check Endpoints Documentation](./devops-deploy/monitoring/HEALTH_CHECK_ENDPOINTS.md) for detailed usage, Kubernetes configuration, and troubleshooting.

### Logging

All application logging uses structured logging via Pino:

**Location:** `server/_core/logger.ts`

**Log Levels:**

- `logger.error()` - Errors requiring attention
- `logger.warn()` - Warnings and non-critical issues
- `logger.info()` - Informational messages
- `logger.debug()` - Debug information (development only)

**Structured Logging Format:**

```typescript
import { logger } from "./_core/logger";

// ✅ Good: Structured logging with context
logger.error({ err: error }, "[Operation] Failed to execute");
logger.info({ userId: 1, action: "login" }, "[Auth] User logged in");

// ❌ Bad: Console logging (replaced with logger)
console.error("Error:", error); // Don't use
console.log("User logged in"); // Don't use
```

**Recent Improvements:**

- Replaced all `console.log/error/warn` calls with structured logger
- Consistent error logging format across all modules
- Error context included in all log entries

**See Also:** [Error Handling Guide](./development-notes/fixes/ERROR_HANDLING_GUIDE.md) for error logging best practices.

### Analytics Tracking

**Event Tracking:**

- `trackEvent()` function in `db.ts`
- Events stored in `analytics_events` table
- Tracked events:
  - `lead_created`
  - `task_created`
  - `analysis_feedback`
  - Custom events via `eventData` JSON

**User Analytics:**

- UV/PV tracking via Manus platform
- Dashboard panel in Management UI

### Error Handling

**Frontend Error Boundary:**

- Global error boundary in `App.tsx`
- Component-level error handling
- Toast notifications for user feedback

**Backend Error Handling:**

- tRPC error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`
- Structured error responses
- Console logging for debugging

### Logging

**Server Logs:**

- Console output captured by Manus platform
- Recent output visible in Management UI
- OAuth initialization logged
- Feedback submissions logged

**Client Logs:**

- Browser console for development
- Error tracking (not yet implemented)

## Scalability Considerations

### Horizontal Scaling

**Stateless Backend:**

- No in-memory session storage
- JWT tokens for authentication
- Database-backed state

**Database Scaling:**

- MySQL/TiDB supports read replicas
- Connection pooling for efficiency
- Prepared statements for performance

### Vertical Scaling

**Resource Requirements:**

- Node.js memory: ~512MB baseline
- Database connections: 10-20 concurrent
- CPU: Minimal (I/O bound workload)

### Future Scaling Needs

**Potential Bottlenecks:**

1. Billy API sync for large customer bases
1. Gmail API quota limits for high-volume users
1. LLM API latency for real-time chat

**Mitigation Strategies:**

1. Background job queue for Billy sync
1. Caching layer for Gmail threads
1. Streaming responses for LLM (already implemented)

## Technology Decisions

### Why tRPC

**Advantages:**

- End-to-end type safety (TypeScript)
- No code generation required
- Automatic client generation
- Built-in React Query integration
- Superjson for Date/Map/Set serialization

**Trade-offs:**

- Coupled to TypeScript ecosystem
- Less suitable for public APIs
- Requires shared types between client/server

### Why Drizzle ORM

**Advantages:**

- Type-safe SQL queries
- Lightweight (no runtime overhead)
- SQL-like syntax (easy migration from raw SQL)
- Automatic migration generation

**Trade-offs:**

- Smaller ecosystem than Prisma
- Less mature tooling
- Manual relationship management

### Why Gemini 2.5 Flash

**Advantages:**

- Fast response times (flash model)
- Cost-effective for high-volume chat
- Good Danish language support
- Multimodal capabilities (future use)

**Trade-offs:**

- Less capable than GPT-4o for complex reasoning
- Requires fallback models for specialized tasks

## Future Architecture Enhancements

### Planned Improvements

1. **Real-time Updates:**
   - WebSocket integration for live chat
   - Server-sent events for inbox updates
   - Optimistic UI updates for all mutations

1. **Caching Layer:**
   - Redis for session storage
   - Gmail thread caching
   - Invoice data caching

1. **Background Jobs:**
   - Bull queue for async tasks
   - Scheduled Billy sync (hourly)
   - Email polling (every 5 minutes)

1. **Enhanced Analytics:**
   - User behavior tracking
   - AI performance metrics
   - Business intelligence dashboard
   - A/B test metrics storage (✅ Implemented)

1. **Mobile App:**
   - React Native wrapper
   - Push notifications
   - Offline support

### Technical Debt

**Current Known Issues:**

1. No automated testing (unit/integration/e2e)
1. No error tracking service integration
1. No performance monitoring
1. Limited input sanitization
1. No rate limiting on API endpoints

**Recommended Fixes:**

1. Add Vitest for unit testing
1. Integrate Sentry for error tracking
1. Add performance monitoring (e.g., New Relic)
1. Implement DOMPurify for XSS prevention
1. Add express-rate-limit middleware

## References

This architecture document is based on the codebase structure and implementation details found in the Friday AI Chat repository at <https://github.com/TekupDK/friday-ai>.

---

**Document Version:** 1.0.0
**Last Updated:** November 1, 2025
**Maintained by:** TekupDK Development Team
