# API Endpoints Documentation

**Generated:** 2025-01-28  
**Last Updated:** 2025-01-28  
**Source:** `server/routers.ts` and router files

This document provides a complete reference for all tRPC API endpoints in the Friday AI Chat application.

## Table of Contents

1. [Overview](#overview)
2. [Router Structure](#router-structure)
3. [Authentication](#authentication)
4. [Routers](#routers)
   - [System Router](#system-router)
   - [Auth Router](#auth-router)
   - [Workspace Router](#workspace-router)
   - [Inbox Router](#inbox-router)
   - [CRM Routers](#crm-routers)
   - [Chat Routers](#chat-routers)
   - [Subscription Router](#subscription-router)
   - [Other Routers](#other-routers)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

## Overview

The API is built with **tRPC 11** and uses TypeScript for end-to-end type safety. All endpoints are protected by authentication unless explicitly marked as public.

### Base URL

- **Development:** `http://localhost:3000/trpc`
- **Production:** `https://your-domain.com/trpc`

### Request Format

All requests use HTTP POST with JSON body:

```typescript
POST /trpc/{router}.{procedure}
Content-Type: application/json

{
  "input": { /* procedure input */ }
}
```

### Response Format

```typescript
{
  "result": {
    "data": { /* procedure output */ }
  }
}
```

## Router Structure

The main application router (`appRouter`) is composed of the following sub-routers:

```typescript
appRouter = {
  system: systemRouter,
  customer: customerRouter,
  auth: authRouter,
  workspace: workspaceRouter,
  inbox: inboxRouter,
  docs: docsRouter,
  aiMetrics: aiMetricsRouter,
  emailIntelligence: emailIntelligenceRouter,
  fridayLeads: fridayLeadsRouter,
  uiAnalysis: uiAnalysisRouter,
  admin: {
    users: adminUserRouter,
  },
  crm: {
    customer: crmCustomerRouter,
    lead: crmLeadRouter,
    booking: crmBookingRouter,
    serviceTemplate: crmServiceTemplateRouter,
    stats: crmStatsRouter,
    activity: crmActivityRouter,
    extensions: crmExtensionsRouter,
  },
  chat: chatRouter,
  friday: fridayRouter,
  automation: automationRouter,
  chatStreaming: chatStreamingRouter, // Enhanced chat with streaming and unified flow
  reports: reportsRouter, // Business reports and analytics
  subscription: subscriptionRouter, // Subscription management (15+ endpoints)
};
```

## Authentication

Most endpoints require authentication via the `protectedProcedure`. The user context is automatically injected:

```typescript
{
  user: {
    id: number;
    email: string;
    role: "user" | "admin";
  }
}
```

## Routers

### System Router

**Path:** `system.*`

System-level operations and health checks.

### Auth Router

**Path:** `auth.*`

Authentication and authorization endpoints.

### Workspace Router

**Path:** `workspace.*`

Workspace management operations.

### Inbox Router

**Path:** `inbox.*`

Main inbox router combining email, calendar, leads, tasks, invoices, and AI features.

#### Sub-routers:

- **email:** Email operations (list, send, archive, etc.)
- **invoices:** Invoice management
- **calendar:** Calendar event management
- **leads:** Lead management
- **tasks:** Task management
- **pipeline:** Email pipeline state management
- **AI features:** Email summaries and label suggestions (at inbox level for backward compatibility)

### CRM Routers

#### Customer Router (`crm.customer.*`)

Customer profile and property management.

**Endpoints:**

- `createProfile` - Create customer profile
- `listProfiles` - List customer profiles with search and pagination
- `getProfile` - Get customer profile by ID
- `listProperties` - List properties for a customer
- `createProperty` - Create property
- `updateProperty` - Update property
- `deleteProperty` - Delete property
- `addNote` - Add note to customer
- `listNotes` - List notes for customer
- `updateNote` - Update note
- `deleteNote` - Delete note
- `getEmailHistory` - Get email history for customer
- `linkEmailToCustomer` - Link email thread to customer
- `getHealthScore` - Get customer health score
- `recalculateHealthScore` - Recalculate customer health score

**Example:**

```typescript
// Create customer profile
const result = await trpc.crm.customer.createProfile.mutate({
  name: "John Doe",
  email: "john@example.com",
  phone: "+45 12 34 56 78",
  status: "new",
  customerType: "private",
  tags: ["vip"],
});
```

#### Lead Router (`crm.lead.*`)

Lead management and conversion.

**Endpoints:**

- `createLead` - Create new lead
- `listLeads` - List leads with optional status filter
- `getLead` - Get lead by ID
- `updateLeadStatus` - Update lead status
- `convertLeadToCustomer` - Convert lead to customer profile

**Example:**

```typescript
// Create lead
const lead = await trpc.crm.lead.createLead.mutate({
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "+45 98 76 54 32",
  company: "Acme Corp",
  source: "website",
  status: "new",
});
```

#### Booking Router (`crm.booking.*`)

Service booking management.

#### Service Template Router (`crm.serviceTemplate.*`)

Service template management.

#### Stats Router (`crm.stats.*`)

CRM statistics and analytics.

#### Activity Router (`crm.activity.*`)

Customer activity tracking.

#### Extensions Router (`crm.extensions.*`)

Advanced CRM features:

- Opportunities/Deals Pipeline (6 endpoints)
- Customer Segmentation (5 endpoints)
- Documents & File Uploads (3 endpoints)
- Audit Log for GDPR (2 endpoints)
- Relationship Mapping (3 endpoints)

**Total:** 20 endpoints

### Chat Routers

#### Chat Router (`chat.*`)

Basic chat operations.

**Endpoints:**

- `getConversations` - List user conversations
- `getMessages` - Get messages for a conversation (paginated)
- `createConversation` - Create new conversation
- `sendMessage` - Send message in conversation
- `deleteConversation` - Delete conversation

**Example:**

```typescript
// Send message
const response = await trpc.chat.sendMessage.mutate({
  conversationId: 1,
  content: "Hello, how can I help?",
  model: "gpt-4o",
  context: {
    selectedEmails: ["email-id-1"],
    hasEmails: true,
  },
});
```

#### Chat Streaming Router (`chatStreaming.*`)

Enhanced chat with streaming support and unified flow.

### Subscription Router

**Path:** `subscription.*`

Subscription management and billing.

**Endpoints:**

- `create` - Create new subscription
- `list` - List subscriptions with optional filters
- `get` - Get subscription by ID
- `getByCustomer` - Get subscription by customer ID
- `update` - Update subscription (plan change, pause, etc.)
- `cancel` - Cancel subscription
- `renew` - Process subscription renewal
- `getUsage` - Get subscription usage for current month
- `getHistory` - Get subscription history
- `getStats` - Get subscription statistics

**Example:**

```typescript
// Create subscription
const subscription = await trpc.subscription.create.mutate({
  customerProfileId: 1,
  planType: "tier1",
  startDate: "2025-02-01",
  autoRenew: true,
});
```

### Other Routers

- **docs:** Documentation management
- **aiMetrics:** AI metrics and analytics
- **emailIntelligence:** Email intelligence features
- **fridayLeads:** Friday AI leads integration
- **uiAnalysis:** UI analysis features
- **automation:** Automation features
- **reports:** Business reports and analytics
- **admin.users:** Admin user management

## Error Handling

All endpoints use consistent error handling:

```typescript
throw new TRPCError({
  code:
    "NOT_FOUND" |
    "BAD_REQUEST" |
    "UNAUTHORIZED" |
    "FORBIDDEN" |
    "INTERNAL_SERVER_ERROR",
  message: "Error message",
});
```

## Rate Limiting

Rate limiting is implemented using Redis and applies to:

- AI/LLM endpoints
- Email operations
- Chat messages

See `server/rate-limiter-redis.ts` for implementation details.

---

For detailed endpoint documentation, see:

- [Routers Detail](./routers.md)
- [Endpoints Detail](./endpoints.md)
