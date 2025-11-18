# Friday AI Chat - API Reference

**Author:** Manus AI  
**Last Updated:** January 28, 2025  
**Version:** 1.2.0

## Overview

This document provides a complete reference for all tRPC API endpoints, database schema, and external integrations in the Friday AI Chat system. All endpoints are type-safe and validated using Zod schemas.

## Error Handling

All API endpoints use error sanitization to prevent information leakage in production. See [Error Sanitization Guide](./development-notes/fixes/ERROR_SANITIZATION_GUIDE.md) for details.

**Quick Reference:**

```typescript
import { sanitizeError, createSafeTRPCError } from "../_core/errors";

// Option 1: Manual sanitization
catch (error) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: sanitizeError(error),
  });
}

// Option 2: Convenience function (recommended)
catch (error) {
  throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
}
```

## tRPC API Endpoints

### Base URL

**Development:** `http://localhost:3000/api/trpc`
**Production:** `https://[your-domain].manus.space/api/trpc`

### Authentication

All `protectedProcedure` endpoints require a valid session cookie. The cookie is set automatically after OAuth login.

**Cookie Name:** `friday_session` (defined in `COOKIE_NAME` constant)
**Cookie Options:** HTTP-only, Secure (production), SameSite=Lax

### Authorization & RBAC

The system implements Role-Based Access Control (RBAC) with four role levels:

- **guest** - Unauthenticated users (lowest privilege)
- **user** - Standard authenticated users
- **admin** - Administrators with elevated privileges
- **owner** - System owner with full access (highest privilege)

**Procedure Types:**

- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authentication (any logged-in user)
- `adminProcedure` - Requires admin role
- `roleProcedure(role)` - Requires minimum role level (user/admin/owner)
- `permissionProcedure(permission)` - Requires specific permission
- `ownerProcedure` - Owner-only access

**RBAC-Protected Endpoints:**

- `inbox.invoices.create` - Requires `create_invoice` permission (owner-only)
- `automation.createInvoiceFromJob` - Requires `create_invoice` permission (owner-only)
- `inbox.email.bulkDelete` - Requires `delete_email` permission (admin-only)

**Ownership Verification:**

All resource endpoints verify ownership:

- Customer endpoints verify `customerId` ownership
- Lead endpoints verify `leadId` ownership
- Conversation endpoints verify `conversationId` ownership

**See Also:** [RBAC_GUIDE.md](./core/guides/RBAC_GUIDE.md) for comprehensive RBAC documentation.

### Rate Limiting

Rate limiting is implemented using Redis-based sliding window rate limiting with in-memory fallback. Rate limits are enforced per endpoint and per user/IP.

**Rate Limited Endpoints:**

- **`auth.login`**: 5 attempts per 15 minutes per IP address
  - Error: `TOO_MANY_REQUESTS` with message indicating retry time
- **`chat.sendMessage`**: 10 messages per minute per user
  - Error: `TOO_MANY_REQUESTS` with message indicating retry time

**Rate Limit Error Response:**

```typescript
{
  code: "TOO_MANY_REQUESTS",
  message: "Too many requests. Please try again in X seconds."
}
```

---

## REST API Endpoints

### Health Check Endpoints

Health check endpoints provide monitoring and deployment verification capabilities. See [Health Check Endpoints Documentation](./devops-deploy/monitoring/HEALTH_CHECK_ENDPOINTS.md) for complete details.

**Note:** All errors are automatically tracked via Sentry v10. See [Sentry Setup Guide](./devops-deploy/SENTRY_SETUP.md) for error tracking configuration.

#### GET `/api/health`

Basic health check endpoint that always returns 200 if the server is running.

**Purpose:** Used by load balancers and basic monitoring to verify the server process is alive.

**Response:** HTTP 200

**Response Body:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T11:00:00.000Z",
  "uptime": 3600,
  "version": "2.0.0",
  "environment": "production",
  "responseTime": "2ms"
}
```

**Example:**

```bash
curl http://localhost:3000/api/health
```

#### GET `/api/ready`

Readiness check endpoint that verifies all critical dependencies are available.

**Purpose:** Used by Kubernetes readiness probes to determine if the pod should receive traffic.

**Response:**

- HTTP 200 if all dependencies are ready
- HTTP 503 if any critical dependency is unavailable

**Response Body (Ready):**

```json
{
  "status": "ready",
  "timestamp": "2025-11-16T11:00:00.000Z",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 15
    },
    "redis": {
      "status": "ok",
      "responseTime": 8
    }
  }
}
```

**Response Body (Not Ready):**

```json
{
  "status": "not_ready",
  "timestamp": "2025-11-16T11:00:00.000Z",
  "checks": {
    "database": {
      "status": "error",
      "message": "Database connection not available"
    },
    "redis": {
      "status": "not_configured",
      "message": "Redis not configured (using in-memory fallback)"
    }
  }
}
```

**Dependencies Checked:**

- **Database:** Verifies connection with `SELECT 1` query
- **Redis:** Optional check (falls back to in-memory if not configured)

**Example:**

```bash
curl http://localhost:3000/api/ready
```

**See Also:** [Health Check Endpoints Documentation](./devops-deploy/monitoring/HEALTH_CHECK_ENDPOINTS.md) for detailed usage, troubleshooting, and Kubernetes configuration examples.

---

## Error Handling

All API endpoints use comprehensive error handling including error sanitization, retry logic, and circuit breakers. See [Error Handling Guide](./development-notes/fixes/ERROR_HANDLING_GUIDE.md) and [Error Handling Implementation](./development-notes/fixes/ERROR_HANDLING_IMPLEMENTATION.md) for complete documentation.

### Error Sanitization

**Location:** `server/_core/errors.ts`

Error messages are automatically sanitized based on the environment:

- **Production:** Generic messages: `"An error occurred. Please try again later."`
- **Development:** Full error messages for debugging

#### `sanitizeError(error: unknown): string`

Sanitizes error messages to prevent exposing sensitive information.

**Example:**

```typescript
import { sanitizeError } from "../_core/errors";
import { TRPCError } from "@trpc/server";

try {
  await operation();
} catch (error) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: sanitizeError(error),
  });
}
```

#### `createSafeTRPCError(error: unknown, code?: string): TRPCError`

Convenience function that sanitizes and creates a TRPCError.

**Example:**

```typescript
import { createSafeTRPCError } from "../_core/errors";

try {
  await operation();
} catch (error) {
  throw createSafeTRPCError(error, "INTERNAL_SERVER_ERROR");
}
```

### Error Handling Utilities

**Location:** `server/_core/error-handling.ts`

#### `retryWithBackoff<T>(fn, config?): Promise<T>`

Retries a function with exponential backoff for transient failures.

**Example:**

```typescript
import { retryWithBackoff } from "../_core/error-handling";

const result = await retryWithBackoff(async () => await fetchData(), {
  maxAttempts: 3,
  initialDelayMs: 1000,
});
```

#### `createCircuitBreaker(config?): CircuitBreaker`

Creates a circuit breaker to prevent cascading failures.

**Example:**

```typescript
import { createCircuitBreaker } from "../_core/error-handling";

const breaker = createCircuitBreaker({ failureThreshold: 5 });
const result = await breaker.execute(() => callExternalService());
```

#### `withDatabaseErrorHandling<T>(operation, errorMessage?): Promise<T>`

Wraps database operations with comprehensive error handling.

**Example:**

```typescript
import { withDatabaseErrorHandling } from "../_core/error-handling";

const users = await withDatabaseErrorHandling(
  () => db.select().from(users),
  "Failed to fetch users"
);
```

#### `withApiErrorHandling<T>(operation, config?): Promise<T>`

Wraps external API calls with retry logic and error handling.

**Example:**

```typescript
import { withApiErrorHandling } from "../_core/error-handling";

const data = await withApiErrorHandling(
  () => fetch("https://api.example.com/data"),
  { maxAttempts: 3 }
);
```

**See Also:**

- [Error Sanitization Guide](./development-notes/fixes/ERROR_SANITIZATION_GUIDE.md) - Error message sanitization
- [Error Handling Guide](./development-notes/fixes/ERROR_HANDLING_GUIDE.md) - Usage guide
- [Error Handling Implementation](./development-notes/fixes/ERROR_HANDLING_IMPLEMENTATION.md) - Complete API reference

---

## Auth Router (`auth`)

### `auth.me`

Get current authenticated user information.

**Type:** Query (Public)
**Input:** None
**Output:**

````typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: Date;
  lastSignedIn: Date;
} | undefined

```text

**Example:**

```typescript
const { data: user } = trpc.auth.me.useQuery();
if (user) {
  // Frontend: Use browser console for debugging
  // Backend: Use structured logger (see DEVELOPMENT_GUIDE.md)
  console.log(`Logged in as ${user.name}`);
}

```text

### `auth.logout`

Log out current user and clear session cookie.

**Type:** Mutation (Public)
**Input:** None
**Output:**

```typescript
{
  success: true;
}

```text

**Example:**

```typescript
const logoutMutation = trpc.auth.logout.useMutation();
await logoutMutation.mutateAsync();

```text

---

## Chat Router (`chat`)

### `chat.getConversations`

Get all conversations for current user.

**Type:** Query (Protected)
**Input:** None
**Output:**

```typescript
Array<{
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}>;

```text

### `chat.conversations.get`

Get specific conversation with messages.

**Type:** Query (Protected)
**Input:**

```typescript
{
  conversationId: number;
}

```text

**Output:**

```typescript
{
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

```text

### `chat.conversations.create`

Create new conversation.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  title?: string; // Optional, defaults to "New Conversation"
}

```text

**Output:**

```typescript
{
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

```text

### `chat.messages.list`

Get all messages in a conversation.

**Type:** Query (Protected)
**Input:**

```typescript
{
  conversationId: number;
}

```text

**Output:**

```typescript
Array<{
  id: number;
  conversationId: number;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  pendingAction: object | null;
  createdAt: Date;
}>;

```text

### `chat.sendMessage`

Send message and get AI response.

**Type:** Mutation (Protected)

**Rate Limit:** 10 messages per minute per user

**Input:**

```typescript
{
  conversationId: number; // Positive integer, required
  content: string; // Required, min 1 char, max 5000 chars, cannot be only whitespace
  model?: string; // Optional, max 100 chars
  context?: {
    selectedEmails?: string[]; // Optional, max 50 items, each string max 100 chars
    calendarEvents?: any[]; // Optional, max 100 items
    searchQuery?: string; // Optional, max 500 chars
    hasEmails?: boolean; // Optional
    hasCalendar?: boolean; // Optional
    hasInvoices?: boolean; // Optional
    page?: string; // Optional, max 100 chars
  };
}

```text

**Output:**

```typescript
{
  userMessage: {
    id: number;
    content: string;
    role: "user";
    createdAt: Date;
  }
  aiMessage: {
    id: number;
    content: string;
    role: "assistant";
    model: string;
    pendingAction: object | null;
    createdAt: Date;
  }
}

```text

**Behavior:**

1. Saves user message to database
1. Routes to AI model based on task type
1. Parses intent and executes actions if confidence > 0.7
1. Returns pending action if requireApproval is true
1. Saves AI response to database
1. Auto-generates conversation title if first message

### `chat.analyzeInvoice`

Analyze invoice with AI.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  invoiceId: string;
  invoiceData: {
    invoiceNo: string;
    customer: string;
    amount: number;
    status: string;
    entryDate: string;
    paymentTerms: string;
  }
}

```text

**Output:**

```typescript
{
  analysis: string; // AI-generated analysis in markdown
}

```text

### `chat.submitAnalysisFeedback`

Submit feedback on AI invoice analysis.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  invoiceId: string;
  rating: "up" | "down";
  analysis: string;
  comment?: string; // Optional detailed feedback
}

```text

**Output:**

```typescript
{
  success: true;
}

```text

### `chat.executeAction`

Execute a pending action after user approval.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  conversationId: number;
  actionId: string;
  actionType: string;
  actionParams: Record<string, any>;
}

```text

**Output:**

```typescript
{
  success: boolean;
  result: ActionResult;
}

```text

---

## Inbox Router (`inbox`)

### `inbox.emails.list`

List Gmail threads.

**Type:** Query (Protected)
**Input:** None
**Output:**

```typescript
Array<{
  id: string;
  snippet: string;
  messages: Array<{
    id: string;
    threadId: string;
    from: string;
    to: string;
    subject: string;
    body: string;
    date: string;
  }>;
}>;

```text

### `inbox.invoices.list`

List Billy.dk invoices.

**Type:** Query (Protected)
**Input:** None
**Output:**

```typescript
Array<{
  id: string;
  invoiceNo: string;
  contactId: string;
  contactName: string;
  state: string;
  entryDate: string;
  paymentTermsDate: string;
  totalAmount: number;
  currency: string;
}>;

```text

### `inbox.calendar.list`

List Google Calendar events.

**Type:** Query (Protected)
**Input:** None
**Output:**

```typescript
Array<{
  id: string;
  summary: string;
  description: string | null;
  start: Date;
  end: Date;
  location: string | null;
  attendees: string[];
}>;

```text

### `inbox.calendar.findFreeSlots`

Find free time slots in calendar.

**Type:** Query (Protected)
**Input:**

```typescript
{
  startDate: string; // ISO date
  endDate: string; // ISO date
  duration: number; // Minutes
}

```text

**Output:**

```typescript
Array<{
  start: Date;
  end: Date;
}>;

```text

### `inbox.leads.list`

List all leads.

**Type:** Query (Protected)
**Input:** None
**Output:**

```typescript
Array<{
  id: number;
  userId: number;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  score: number;
  notes: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}>;

```text

### `inbox.leads.create`

Create new lead.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  source: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

```text

**Output:**

```typescript
{
  id: number;
  userId: number;
  source: string;
  // ... other lead fields
}

```text

### `inbox.leads.updateStatus`

Update lead status.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  leadId: number;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
}

```text

**Output:**

```typescript
{
  success: true;
}

```text

### `inbox.leads.updateScore`

Update lead score.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  leadId: number;
  score: number; // 0-100
}

```text

**Output:**

```typescript
{
  success: true;
}

```text

### `inbox.tasks.list`

List all tasks.

**Type:** Query (Protected)
**Input:** None
**Output:**

```typescript
Array<{
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

```text

### `inbox.tasks.create`

Create new task.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string; // ISO date
}

```text

**Output:**

```typescript
{
  id: number;
  userId: number;
  title: string;
  // ... other task fields
}

```text

### `inbox.tasks.updateStatus`

Update task status.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  taskId: number;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

```text

**Output:**

```typescript
{
  success: true;
}

```text

---

## Customer Router (`customer`)

### `customer.getProfileByLeadId`

Get customer profile by lead ID.

**Type:** Query (Protected)
**Input:**

```typescript
{
  leadId: number;
}

```text

**Output:**

```typescript
{
  id: number;
  userId: number;
  leadId: number | null;
  billyCustomerId: string | null;
  billyOrganizationId: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  totalInvoiced: number; // In øre
  totalPaid: number; // In øre
  balance: number; // In øre
  invoiceCount: number;
  emailCount: number;
  aiResume: string | null;
  lastContactDate: Date | null;
  lastSyncDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

```text

**Behavior:**

- Creates profile from lead if doesn't exist
- Returns existing profile if found

### `customer.getProfileByEmail`

Get customer profile by email.

**Type:** Query (Protected)
**Input:**

```typescript
{
  email: string;
}

```text

**Output:** Same as `getProfileByLeadId`

### `customer.listProfiles`

Get all customer profiles.

**Type:** Query (Protected)
**Input:** None
**Output:** Array of customer profiles (same structure as above)

### `customer.getInvoices`

Get all invoices for a customer.

**Type:** Query (Protected)
**Input:**

```typescript
{
  customerId: number;
}

```text

**Output:**

```typescript
Array<{
  id: number;
  customerId: number;
  invoiceId: number | null;
  billyInvoiceId: string;
  invoiceNo: string | null;
  amount: number; // In øre
  paidAmount: number; // In øre
  status: "draft" | "approved" | "sent" | "paid" | "overdue" | "voided";
  entryDate: Date | null;
  dueDate: Date | null;
  paidDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

```text

### `customer.getEmails`

Get all email threads for a customer.

**Type:** Query (Protected)
**Input:**

```typescript
{
  customerId: number;
}

```text

**Output:**

```typescript
Array<{
  id: number;
  customerId: number;
  emailThreadId: number | null;
  gmailThreadId: string;
  subject: string | null;
  snippet: string | null;
  lastMessageDate: Date | null;
  isRead: boolean;
  createdAt: Date;
}>;

```text

### `customer.getConversation`

Get or create dedicated conversation for customer.

**Type:** Query (Protected)
**Input:**

```typescript
{
  customerId: number;
}

```text

**Output:**

```typescript
{
  id: number;
  customerId: number;
  conversationId: number;
  createdAt: Date;
}

```text

**Behavior:**

- Returns existing conversation if found
- Creates new conversation with title "Chat with [customer name]" if not found

### `customer.syncBillyInvoices`

Sync invoices from Billy.dk for customer.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  customerId: number;
}

```text

**Output:**

```typescript
{
  success: true;
  invoiceCount: number;
  balance: {
    totalInvoiced: number;
    totalPaid: number;
    balance: number;
    invoiceCount: number;
  }
}

```text

**Behavior:**

1. Fetches invoices from Billy API via MCP
1. Filters by customer email/Billy customer ID
1. Adds/updates invoices in `customer_invoices` table
1. Recalculates customer balance
1. Updates `lastSyncDate` timestamp

### `customer.syncGmailEmails`

Sync email threads from Gmail for customer.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  customerId: number;
}

```text

**Output:**

```typescript
{
  success: true;
  emailCount: number;
  lastContactDate: Date | null;
}

```text

**Behavior:**

1. Searches Gmail for threads with customer email
1. Adds/updates threads in `customer_emails` table
1. Updates `emailCount` and `lastContactDate`

### `customer.generateResume`

Generate AI summary for customer.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  customerId: number;
}

```text

**Output:**

```typescript
{
  success: true;
  resume: string; // AI-generated markdown summary
}

```text

**Behavior:**

1. Gathers customer data (invoices, emails, balance)
1. Sends to LLM with structured prompt
1. Generates summary covering:
   - Customer relationship status
   - Service history
   - Payment behavior
   - Communication preferences
   - Next recommended actions
1. Saves to `customer_profiles.aiResume`

### `customer.updateProfile`

Update customer profile information.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  customerId: number;
  name?: string;
  phone?: string;
  billyCustomerId?: string;
}

```text

**Output:**

```typescript
{
  success: true;
}

```text

---

## System Router (`system`)

### `system.notifyOwner`

Send notification to project owner.

**Type:** Mutation (Protected)
**Input:**

```typescript
{
  title: string;
  content: string;
}

```text

**Output:**

```typescript
{
  success: boolean;
}

```text

**Use Cases:**

- New form submissions
- Survey feedback
- Workflow completion alerts
- System errors requiring attention

---

## Subscription Router (`subscription`)

Subscription management for recurring service plans.

### `subscription.create`

Create a new subscription for a customer.

**Type:** Mutation (Protected)

**Input:**

```typescript
{
  customerProfileId: number;  // Positive integer
  planType: "tier1" | "tier2" | "tier3" | "flex_basis" | "flex_plus";
  startDate?: string;        // ISO date string (optional)
  autoRenew?: boolean;        // Default: true
  metadata?: Record<string, any>;  // Optional metadata
}
```

**Output:**

```typescript
Subscription {
  id: number;
  userId: number;
  customerProfileId: number;
  planType: string;
  status: "active" | "paused" | "cancelled" | "expired";
  monthlyPrice: number;
  includedHours: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Example:**

```typescript
const subscription = await trpc.subscription.create.mutate({
  customerProfileId: 123,
  planType: "tier1",
  autoRenew: true,
});
```

### `subscription.list`

List subscriptions with optional filters.

**Type:** Query (Protected)

**Input:**

```typescript
{
  status?: "active" | "paused" | "cancelled" | "expired" | "all";
  customerProfileId?: number;  // Filter by customer
}
```

**Output:**

```typescript
Subscription[]
```

**Example:**

```typescript
const { data } = trpc.subscription.list.useQuery({
  status: "active",
  customerProfileId: 123,
});
```

### `subscription.get`

Get a single subscription by ID.

**Type:** Query (Protected)

**Input:**

```typescript
{
  subscriptionId: number;  // Positive integer
}
```

**Output:**

```typescript
Subscription
```

**Errors:**

- `NOT_FOUND` - Subscription not found or not accessible

### `subscription.getByCustomer`

Get subscription by customer profile ID.

**Type:** Query (Protected)

**Input:**

```typescript
{
  customerProfileId: number;  // Positive integer
}
```

**Output:**

```typescript
Subscription | null
```

### `subscription.update`

Update subscription (plan change, pause, etc.).

**Type:** Mutation (Protected)

**Input:**

```typescript
{
  subscriptionId: number;
  planType?: "tier1" | "tier2" | "tier3" | "flex_basis" | "flex_plus";
  status?: "active" | "paused" | "cancelled";
  autoRenew?: boolean;
  metadata?: Record<string, any>;
}
```

**Output:**

```typescript
Subscription
```

**Errors:**

- `NOT_FOUND` - Subscription not found

### `subscription.cancel`

Cancel a subscription.

**Type:** Mutation (Protected)

**Input:**

```typescript
{
  subscriptionId: number;
  reason?: string;
  effectiveDate?: string;  // ISO date string
}
```

**Output:**

```typescript
{
  success: boolean;
}
```

### `subscription.getUsage`

Get usage statistics for a subscription.

**Type:** Query (Protected)

**Input:**

```typescript
{
  subscriptionId: number;
  year?: number;  // Default: current year
  month?: number;  // Default: current month (1-12)
}
```

**Output:**

```typescript
{
  subscription: Subscription;
  usage: {
    hoursUsed: number;
    hoursRemaining: number;
    overage: boolean;
    overageHours?: number;
  };
  totalUsage: number;
}
```

### `subscription.getHistory`

Get subscription history (audit trail).

**Type:** Query (Protected)

**Input:**

```typescript
{
  subscriptionId: number;
  limit?: number;  // Default: 50
  offset?: number;  // Default: 0
}
```

**Output:**

```typescript
SubscriptionHistory[]
```

### `subscription.stats`

Get subscription statistics.

**Type:** Query (Protected)

**Input:** None

**Output:**

```typescript
{
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
}
```

### `subscription.getMRR`

Calculate Monthly Recurring Revenue.

**Type:** Query (Protected)

**Input:** None

**Output:**

```typescript
{
  mrr: number;  // Monthly Recurring Revenue in øre
  currency: string;  // "DKK"
}
```

### `subscription.getChurnRate`

Calculate churn rate for a period.

**Type:** Query (Protected)

**Input:**

```typescript
{
  startDate: string;  // ISO date string
  endDate: string;   // ISO date string
}
```

**Output:**

```typescript
{
  churnRate: number;  // Percentage (0-100)
  period: {
    startDate: string;
    endDate: string;
  };
}
```

### `subscription.getARPU`

Calculate Average Revenue Per User.

**Type:** Query (Protected)

**Input:** None

**Output:**

```typescript
{
  arpu: number;  // Average Revenue Per User in øre
  currency: string;  // "DKK"
}
```

### `subscription.applyDiscount`

Apply discount to a subscription.

**Type:** Mutation (Protected)

**Input:**

```typescript
{
  subscriptionId: number;
  discountPercent: number;  // 0-100
  discountAmount?: number;  // In øre (optional)
  reason?: string;
  validUntil?: string;  // ISO date string
}
```

**Output:**

```typescript
Subscription
```

### `subscription.renew`

Manually trigger subscription renewal (admin).

**Type:** Mutation (Protected)

**Input:**

```typescript
{
  subscriptionId: number;
}
```

**Output:**

```typescript
{
  success: boolean;
  nextBillingDate: string;
}
```

**See Also:** [Subscription Implementation Documentation](./analysis/SUBSCRIPTION_FEATURE_IMPLEMENTATION_DETAILED.md) for detailed feature documentation.

---

## Database Schema

### users

User accounts with OAuth integration.

| Column         | Type         | Constraints                 | Description             |
| -------------- | ------------ | --------------------------- | ----------------------- |
| `id`           | INT          | PRIMARY KEY, AUTO_INCREMENT | User ID                 |
| `openId`       | VARCHAR(64)  | UNIQUE, NOT NULL            | Manus OAuth identifier  |
| `name`         | TEXT         | NULL                        | User full name          |
| `email`        | VARCHAR(320) | NULL                        | Email address           |
| `loginMethod`  | VARCHAR(64)  | NULL                        | OAuth provider          |
| `role`         | ENUM         | NOT NULL, DEFAULT 'user'    | User role (user, admin) |
| `createdAt`    | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Account creation        |
| `updatedAt`    | TIMESTAMP    | NOT NULL, ON UPDATE NOW()   | Last update             |
| `lastSignedIn` | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Last login              |

**Indexes:**

- PRIMARY: `id`
- UNIQUE: `openId`

---

### conversations

Chat conversation metadata.

| Column      | Type         | Constraints                 | Description        |
| ----------- | ------------ | --------------------------- | ------------------ |
| `id`        | INT          | PRIMARY KEY, AUTO_INCREMENT | Conversation ID    |
| `userId`    | INT          | NOT NULL                    | Owner user ID      |
| `title`     | VARCHAR(255) | NOT NULL                    | Conversation title |
| `createdAt` | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Creation time      |
| `updatedAt` | TIMESTAMP    | NOT NULL, ON UPDATE NOW()   | Last update        |

**Indexes:**

- PRIMARY: `id`
- INDEX: `userId`

---

### messages

Individual chat messages.

| Column           | Type        | Constraints                 | Description                            |
| ---------------- | ----------- | --------------------------- | -------------------------------------- |
| `id`             | INT         | PRIMARY KEY, AUTO_INCREMENT | Message ID                             |
| `conversationId` | INT         | NOT NULL                    | Parent conversation                    |
| `role`           | ENUM        | NOT NULL                    | Message role (user, assistant, system) |
| `content`        | TEXT        | NOT NULL                    | Message content                        |
| `model`          | VARCHAR(64) | NULL                        | AI model used                          |
| `attachments`    | JSON        | NULL                        | File attachments                       |
| `pendingAction`  | JSON        | NULL                        | Action awaiting approval               |
| `createdAt`      | TIMESTAMP   | NOT NULL, DEFAULT NOW()     | Message time                           |

**Indexes:**

- PRIMARY: `id`
- INDEX: `conversationId`

---

### email_threads

Gmail thread metadata and content.

| Column          | Type         | Constraints                 | Description       |
| --------------- | ------------ | --------------------------- | ----------------- |
| `id`            | INT          | PRIMARY KEY, AUTO_INCREMENT | Thread ID         |
| `userId`        | INT          | NOT NULL                    | Owner user ID     |
| `threadId`      | VARCHAR(255) | NOT NULL                    | Gmail thread ID   |
| `subject`       | TEXT         | NULL                        | Email subject     |
| `snippet`       | TEXT         | NULL                        | Preview text      |
| `sender`        | VARCHAR(255) | NULL                        | From address      |
| `recipient`     | VARCHAR(255) | NULL                        | To address        |
| `labels`        | JSON         | NULL                        | Gmail labels      |
| `unread`        | BOOLEAN      | NOT NULL, DEFAULT FALSE     | Unread status     |
| `lastMessageAt` | TIMESTAMP    | NULL                        | Last message time |
| `createdAt`     | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | First seen        |

**Indexes:**

- PRIMARY: `id`
- INDEX: `userId`
- INDEX: `threadId`

---

### invoices

Billy.dk invoice data.

| Column             | Type          | Constraints                 | Description      |
| ------------------ | ------------- | --------------------------- | ---------------- |
| `id`               | INT           | PRIMARY KEY, AUTO_INCREMENT | Invoice ID       |
| `userId`           | INT           | NOT NULL                    | Owner user ID    |
| `billyInvoiceId`   | VARCHAR(255)  | NOT NULL                    | Billy invoice ID |
| `invoiceNo`        | VARCHAR(64)   | NULL                        | Invoice number   |
| `contactName`      | VARCHAR(255)  | NULL                        | Customer name    |
| `state`            | VARCHAR(64)   | NULL                        | Invoice status   |
| `entryDate`        | TIMESTAMP     | NULL                        | Invoice date     |
| `paymentTermsDate` | TIMESTAMP     | NULL                        | Due date         |
| `totalAmount`      | DECIMAL(10,2) | NULL                        | Total amount     |
| `currency`         | VARCHAR(3)    | NULL                        | Currency code    |
| `createdAt`        | TIMESTAMP     | NOT NULL, DEFAULT NOW()     | First synced     |

**Indexes:**

- PRIMARY: `id`
- INDEX: `userId`
- INDEX: `billyInvoiceId`

---

### calendar_events

Google Calendar events.

| Column        | Type         | Constraints                 | Description     |
| ------------- | ------------ | --------------------------- | --------------- |
| `id`          | INT          | PRIMARY KEY, AUTO_INCREMENT | Event ID        |
| `userId`      | INT          | NOT NULL                    | Owner user ID   |
| `eventId`     | VARCHAR(255) | NOT NULL                    | Google event ID |
| `summary`     | VARCHAR(255) | NULL                        | Event title     |
| `description` | TEXT         | NULL                        | Event details   |
| `location`    | VARCHAR(255) | NULL                        | Event location  |
| `start`       | TIMESTAMP    | NOT NULL                    | Start time      |
| `end`         | TIMESTAMP    | NOT NULL                    | End time        |
| `attendees`   | JSON         | NULL                        | Attendee list   |
| `status`      | VARCHAR(64)  | NULL                        | Event status    |
| `createdAt`   | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | First synced    |
| `updatedAt`   | TIMESTAMP    | NOT NULL, ON UPDATE NOW()   | Last update     |

**Indexes:**

- PRIMARY: `id`
- INDEX: `userId`
- INDEX: `eventId`
- INDEX: `start`

---

### leads

Sales leads with scoring.

| Column      | Type         | Constraints                 | Description        |
| ----------- | ------------ | --------------------------- | ------------------ |
| `id`        | INT          | PRIMARY KEY, AUTO_INCREMENT | Lead ID            |
| `userId`    | INT          | NOT NULL                    | Owner user ID      |
| `source`    | VARCHAR(255) | NOT NULL                    | Lead source        |
| `name`      | VARCHAR(255) | NULL                        | Contact name       |
| `email`     | VARCHAR(320) | NULL                        | Email address      |
| `phone`     | VARCHAR(32)  | NULL                        | Phone number       |
| `company`   | VARCHAR(255) | NULL                        | Company name       |
| `status`    | ENUM         | NOT NULL, DEFAULT 'new'     | Lead status        |
| `score`     | INT          | NOT NULL, DEFAULT 0         | Lead score (0-100) |
| `notes`     | TEXT         | NULL                        | Additional notes   |
| `metadata`  | JSON         | NULL                        | Custom data        |
| `createdAt` | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Lead created       |
| `updatedAt` | TIMESTAMP    | NOT NULL, ON UPDATE NOW()   | Last update        |

**Status Values:** `new`, `contacted`, `qualified`, `proposal`, `won`, `lost`

**Indexes:**

- PRIMARY: `id`
- INDEX: `userId`
- INDEX: `email`

---

### tasks

User tasks and reminders.

| Column        | Type         | Constraints                 | Description     |
| ------------- | ------------ | --------------------------- | --------------- |
| `id`          | INT          | PRIMARY KEY, AUTO_INCREMENT | Task ID         |
| `userId`      | INT          | NOT NULL                    | Owner user ID   |
| `title`       | VARCHAR(255) | NOT NULL                    | Task title      |
| `description` | TEXT         | NULL                        | Task details    |
| `status`      | ENUM         | NOT NULL, DEFAULT 'pending' | Task status     |
| `priority`    | ENUM         | NOT NULL, DEFAULT 'medium'  | Priority level  |
| `dueDate`     | TIMESTAMP    | NULL                        | Due date        |
| `completedAt` | TIMESTAMP    | NULL                        | Completion time |
| `createdAt`   | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Task created    |
| `updatedAt`   | TIMESTAMP    | NOT NULL, ON UPDATE NOW()   | Last update     |

**Status Values:** `pending`, `in_progress`, `completed`, `cancelled`
**Priority Values:** `low`, `medium`, `high`

**Indexes:**

- PRIMARY: `id`
- INDEX: `userId`
- INDEX: `dueDate`

---

### customer_profiles

Aggregated customer data.

| Column                | Type         | Constraints                 | Description               |
| --------------------- | ------------ | --------------------------- | ------------------------- |
| `id`                  | INT          | PRIMARY KEY, AUTO_INCREMENT | Profile ID                |
| `userId`              | INT          | NOT NULL                    | Owner user ID             |
| `leadId`              | INT          | NULL                        | Reference to leads table  |
| `billyCustomerId`     | VARCHAR(255) | NULL                        | Billy customer ID         |
| `billyOrganizationId` | VARCHAR(255) | NULL                        | Billy org ID              |
| `email`               | VARCHAR(320) | NOT NULL                    | Customer email            |
| `name`                | VARCHAR(255) | NULL                        | Customer name             |
| `phone`               | VARCHAR(32)  | NULL                        | Phone number              |
| `totalInvoiced`       | INT          | NOT NULL, DEFAULT 0         | Total invoiced (øre)      |
| `totalPaid`           | INT          | NOT NULL, DEFAULT 0         | Total paid (øre)          |
| `balance`             | INT          | NOT NULL, DEFAULT 0         | Outstanding balance (øre) |
| `invoiceCount`        | INT          | NOT NULL, DEFAULT 0         | Number of invoices        |
| `emailCount`          | INT          | NOT NULL, DEFAULT 0         | Number of email threads   |
| `aiResume`            | TEXT         | NULL                        | AI-generated summary      |
| `lastContactDate`     | TIMESTAMP    | NULL                        | Last email/call           |
| `lastSyncDate`        | TIMESTAMP    | NULL                        | Last Billy sync           |
| `createdAt`           | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | Profile created           |
| `updatedAt`           | TIMESTAMP    | NOT NULL, ON UPDATE NOW()   | Last update               |

**Indexes:**

- PRIMARY: `id`
- INDEX: `userId`
- INDEX: `email`
- INDEX: `leadId`

---

### customer_invoices

Customer-specific invoice junction table.

| Column           | Type         | Constraints                 | Description                 |
| ---------------- | ------------ | --------------------------- | --------------------------- |
| `id`             | INT          | PRIMARY KEY, AUTO_INCREMENT | Record ID                   |
| `customerId`     | INT          | NOT NULL                    | Customer profile ID         |
| `invoiceId`      | INT          | NULL                        | Reference to invoices table |
| `billyInvoiceId` | VARCHAR(255) | NOT NULL                    | Billy invoice ID            |
| `invoiceNo`      | VARCHAR(64)  | NULL                        | Invoice number              |
| `amount`         | INT          | NOT NULL                    | Invoice amount (øre)        |
| `paidAmount`     | INT          | NOT NULL, DEFAULT 0         | Paid amount (øre)           |
| `status`         | ENUM         | NOT NULL, DEFAULT 'draft'   | Invoice status              |
| `entryDate`      | TIMESTAMP    | NULL                        | Invoice date                |
| `dueDate`        | TIMESTAMP    | NULL                        | Due date                    |
| `paidDate`       | TIMESTAMP    | NULL                        | Payment date                |
| `createdAt`      | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | First synced                |
| `updatedAt`      | TIMESTAMP    | NOT NULL, ON UPDATE NOW()   | Last update                 |

**Status Values:** `draft`, `approved`, `sent`, `paid`, `overdue`, `voided`

**Indexes:**

- PRIMARY: `id`
- INDEX: `customerId`
- INDEX: `billyInvoiceId`

---

### customer_emails

Customer email thread junction table.

| Column            | Type         | Constraints                 | Description                |
| ----------------- | ------------ | --------------------------- | -------------------------- |
| `id`              | INT          | PRIMARY KEY, AUTO_INCREMENT | Record ID                  |
| `customerId`      | INT          | NOT NULL                    | Customer profile ID        |
| `emailThreadId`   | INT          | NULL                        | Reference to email_threads |
| `gmailThreadId`   | VARCHAR(255) | NOT NULL                    | Gmail thread ID            |
| `subject`         | TEXT         | NULL                        | Email subject              |
| `snippet`         | TEXT         | NULL                        | Preview text               |
| `lastMessageDate` | TIMESTAMP    | NULL                        | Last message time          |
| `isRead`          | BOOLEAN      | NOT NULL, DEFAULT FALSE     | Read status                |
| `createdAt`       | TIMESTAMP    | NOT NULL, DEFAULT NOW()     | First synced               |

**Indexes:**

- PRIMARY: `id`
- INDEX: `customerId`
- INDEX: `gmailThreadId`

---

### customer_conversations

Dedicated chat conversations per customer.

| Column           | Type      | Constraints                 | Description         |
| ---------------- | --------- | --------------------------- | ------------------- |
| `id`             | INT       | PRIMARY KEY, AUTO_INCREMENT | Record ID           |
| `customerId`     | INT       | NOT NULL                    | Customer profile ID |
| `conversationId` | INT       | NOT NULL                    | Conversation ID     |
| `createdAt`      | TIMESTAMP | NOT NULL, DEFAULT NOW()     | Created time        |

**Indexes:**

- PRIMARY: `id`
- INDEX: `customerId`
- INDEX: `conversationId`

---

### analytics_events

User interaction tracking.

| Column      | Type        | Constraints                 | Description   |
| ----------- | ----------- | --------------------------- | ------------- |
| `id`        | INT         | PRIMARY KEY, AUTO_INCREMENT | Event ID      |
| `userId`    | INT         | NOT NULL                    | User ID       |
| `eventType` | VARCHAR(64) | NOT NULL                    | Event type    |
| `eventData` | JSON        | NULL                        | Event payload |
| `createdAt` | TIMESTAMP   | NOT NULL, DEFAULT NOW()     | Event time    |

**Common Event Types:**

- `lead_created`
- `task_created`
- `analysis_feedback`

**Indexes:**

- PRIMARY: `id`
- INDEX: `userId`
- INDEX: `eventType`
- INDEX: `createdAt`

---

## External Integrations

### Google Workspace API

**Authentication:** Service Account with Domain-Wide Delegation

**Environment Variables:**

- `GOOGLE_SERVICE_ACCOUNT_KEY`: JSON key file content
- `GOOGLE_IMPERSONATED_USER`: Email to impersonate (e.g., `info@rendetalje.dk`)
- `GOOGLE_CALENDAR_ID`: Calendar ID for events

**Scopes:**

- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.compose`
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

**Rate Limits:**

- Gmail API: 250 quota units/user/second
- Calendar API: 500 queries/100 seconds/user

**Helper Functions:**

- `searchGmailThreads(query, maxResults)`
- `getGmailThread(threadId)`
- `createGmailDraft(to, subject, body)`
- `listCalendarEvents(timeMin, timeMax)`
- `createCalendarEvent(summary, start, end, description)`
- `checkCalendarAvailability(date, duration)`
- `findFreeSlots(startDate, endDate, duration)`

---

### Billy.dk API

**Authentication:** MCP Server

**Environment Variables:**

- `BILLY_API_KEY`: Billy API key
- `BILLY_ORGANIZATION_ID`: Organization ID

**MCP Tools:**

- `billy_get_invoices`: Fetch invoices
- `billy_create_invoice`: Create new invoice
- `billy_get_contacts`: Fetch customer contacts

**Helper Functions:**

- `syncBillyInvoicesForCustomer(email, billyCustomerId)`
- `getBillyCustomerIdByEmail(email)`
- `syncAllBillyCustomers(userId)`

**Data Mapping:**

```typescript
Billy State → Database Status
─────────────────────────────
draft       → draft
approved    → approved
sent        → sent
paid        → paid
overdue     → overdue
voided      → voided
cancelled   → voided

```text

---

### Manus AI Services

**LLM API:**

**Environment Variables:**

- `BUILT_IN_FORGE_API_URL`: API base URL
- `BUILT_IN_FORGE_API_KEY`: Server-side API key
- `VITE_FRONTEND_FORGE_API_KEY`: Frontend API key

**Helper Function:**

```typescript
invokeLLM({
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  response_format?: {
    type: "json_schema";
    json_schema: object;
  };
  tools?: Tool[];
  tool_choice?: "none" | "auto" | "required";
})

```text

**S3 Storage:**

**Helper Function:**

```typescript
storagePut(
  fileKey: string,
  data: Buffer | Uint8Array | string,
  contentType?: string
): Promise<{ key: string; url: string }>

```text

**Best Practices:**

- Add random suffix to file keys to prevent enumeration
- Save metadata (URL, mime type, size) in database
- Use S3 only for file bytes, not metadata

---

## Error Codes

### tRPC Error Codes

| Code                    | HTTP Status | Description              |
| ----------------------- | ----------- | ------------------------ |
| `UNAUTHORIZED`          | 401         | No valid session cookie  |
| `FORBIDDEN`             | 403         | Insufficient permissions |
| `NOT_FOUND`             | 404         | Resource not found       |
| `BAD_REQUEST`           | 400         | Invalid input data       |
| `INTERNAL_SERVER_ERROR` | 500         | Server error             |

### Custom Error Messages

**Authentication Errors:**

- "User not authenticated" → No session cookie
- "Invalid session" → Expired or tampered cookie

**Validation Errors:**

- "Invalid email format" → Email validation failed
- "Required field missing" → Missing required input

**Business Logic Errors:**

- "Customer not found" → Invalid customer ID
- "Lead not found or missing email" → Lead lookup failed
- "Database not available" → Database connection error

---

## Rate Limiting

**Current Status:** Not implemented

**Recommended Implementation:**

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 *60* 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later",
});

app.use("/api/trpc", limiter);

````

---

## Versioning

**Current Version:** 1.0.0

**API Stability:** Unstable (breaking changes expected)

**Deprecation Policy:** Not yet defined

**Future Versioning Strategy:**

- Semantic versioning (MAJOR.MINOR.PATCH)
- Deprecation warnings before breaking changes
- Versioned API endpoints (e.g., `/api/v2/trpc`)

---

## References

This API reference is based on the codebase at <https://github.com/TekupDK/friday-ai>, specifically the tRPC router definitions in `server/routers.ts`, `server/customer-router.ts`, and database schema in `drizzle/schema.ts`.

---

**Document Version:** 1.0.0
**Last Updated:** November 1, 2025
**Maintained by:** TekupDK Development Team

```

```
