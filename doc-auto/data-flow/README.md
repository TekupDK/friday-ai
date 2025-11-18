# Data Flow Documentation

**Generated:** 2025-01-28  
**Source:** Codebase analysis

This document describes the data flow and architecture of the Friday AI Chat application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Request Flow](#request-flow)
4. [Data Flow Patterns](#data-flow-patterns)
5. [State Management](#state-management)

## Overview

Friday AI Chat uses a **full-stack TypeScript** architecture with:

- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM
- **Database:** PostgreSQL/TiDB
- **AI:** Gemini 2.5 Flash, Claude 3.5 Sonnet, GPT-4o

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │    Hooks     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘              │
│                           │                                   │
│                    ┌──────▼──────┐                           │
│                    │  tRPC Client │                           │
│                    └──────┬──────┘                           │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP/WebSocket
┌───────────────────────────▼──────────────────────────────────┐
│                      SERVER (Express)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              tRPC Router (appRouter)                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐│   │
│  │  │   CRM    │ │  Inbox   │ │   Chat    │ │   ...    ││   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬──────┘│   │
│  └───────┼────────────┼────────────┼────────────┼───────┘   │
│          │            │            │            │            │
│  ┌───────▼────────────▼────────────▼────────────▼───────┐  │
│  │              Business Logic Layer                       │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │  │
│  │  │ Actions  │ │   Helpers │ │   AI      │             │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘             │  │
│  └───────┼────────────┼────────────┼────────────────────┘  │
│          │            │            │                          │
│  ┌───────▼────────────▼────────────▼──────────────────────┐ │
│  │              Data Access Layer (Drizzle ORM)            │ │
│  └───────────────────────────┬─────────────────────────────┘ │
└───────────────────────────────┼───────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────┐
│                    DATABASE (PostgreSQL)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Tables     │  │    Indexes    │  │    Enums      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. Client Request

```
User Action
    ↓
React Component
    ↓
tRPC Hook (useQuery/useMutation)
    ↓
tRPC Client
    ↓
HTTP POST /trpc/{router}.{procedure}
```

### 2. Server Processing

```
Express Server
    ↓
tRPC Middleware (Auth, Rate Limiting)
    ↓
Router Procedure
    ↓
Business Logic
    ↓
Database Query (Drizzle ORM)
    ↓
Response
```

### 3. Response Flow

```
Database Result
    ↓
Type-safe Response (tRPC)
    ↓
HTTP Response
    ↓
tRPC Client
    ↓
React Query Cache
    ↓
Component Re-render
```

## Data Flow Patterns

### CRM Customer Flow

```
┌─────────────┐
│  Customer   │
│    List     │
└──────┬──────┘
       │
       │ trpc.crm.customer.listProfiles.query()
       ↓
┌──────────────────┐
│  tRPC Router     │
│  (crmCustomer)   │
└──────┬───────────┘
       │
       │ getCachedQuery() or DB query
       ↓
┌──────────────────┐
│   Database       │
│ (customerProfiles)│
└──────┬───────────┘
       │
       │ Return CustomerProfile[]
       ↓
┌──────────────────┐
│  React Query     │
│     Cache        │
└──────┬───────────┘
       │
       │ Component receives data
       ↓
┌─────────────┐
│  Customer   │
│    List     │
│  (rendered) │
└─────────────┘
```

### Email Flow

```
┌─────────────┐
│  Email Tab  │
└──────┬──────┘
       │
       │ trpc.inbox.email.list.query()
       ↓
┌──────────────────┐
│  Inbox Router    │
│  (emailRouter)   │
└──────┬───────────┘
       │
       │ Query emailThreads + emails
       ↓
┌──────────────────┐
│   Database       │
│ (emailThreads,    │
│   emails)        │
└──────┬───────────┘
       │
       │ Return EmailThread[]
       ↓
┌──────────────────┐
│  Email Context    │
│   (React Context) │
└──────┬───────────┘
       │
       │ Components subscribe
       ↓
┌─────────────┐
│  Email List │
│  (rendered) │
└─────────────┘
```

### AI Chat Flow

```
┌─────────────┐
│  Chat UI    │
└──────┬──────┘
       │
       │ trpc.chat.sendMessage.mutate()
       ↓
┌──────────────────┐
│  Chat Router     │
│  (chatRouter)    │
└──────┬───────────┘
       │
       │ Verify ownership
       │ Create message
       ↓
┌──────────────────┐
│  AI Router       │
│  (routeAI)       │
└──────┬───────────┘
       │
       │ LLM API call
       ↓
┌──────────────────┐
│  LLM Provider    │
│ (Gemini/Claude)  │
└──────┬───────────┘
       │
       │ Stream response
       ↓
┌──────────────────┐
│  Save Message    │
│  (messages table)│
└──────┬───────────┘
       │
       │ Return response
       ↓
┌─────────────┐
│  Chat UI    │
│ (updated)   │
└─────────────┘
```

### Subscription Flow

```
┌─────────────┐
│ Subscription│
│   Create    │
└──────┬──────┘
       │
       │ trpc.subscription.create.mutate()
       ↓
┌──────────────────┐
│ Subscription     │
│ Router           │
└──────┬───────────┘
       │
       │ createSubscription()
       ↓
┌──────────────────┐
│ Subscription     │
│ Actions          │
└──────┬───────────┘
       │
       │ Calculate dates
       │ Create record
       ↓
┌──────────────────┐
│   Database       │
│ (subscriptions)  │
└──────┬───────────┘
       │
       │ Return Subscription
       ↓
┌──────────────────┐
│  Invalidate      │
│  Cache           │
└──────┬───────────┘
       │
       │ Component updates
       ↓
┌─────────────┐
│ Subscription│
│   List      │
│ (refreshed) │
└─────────────┘
```

## State Management

### Frontend State

1. **React Query (tRPC):** Server state caching
2. **React Context:** Shared UI state (EmailContext)
3. **Local State (useState):** Component-specific state
4. **URL State:** Route parameters and query strings

### Backend State

1. **Database:** Source of truth
2. **Redis Cache:** Query result caching
3. **Session State:** User sessions (JWT)
4. **Rate Limiting:** Redis-based rate limits

### Cache Strategy

```
Query Request
    ↓
Check Redis Cache
    ├─ Hit → Return cached data
    └─ Miss → Query database
              ↓
              Store in cache (TTL: 5 min)
              ↓
              Return data
```

---

For detailed diagrams, see:

- [Diagrams Detail](./diagrams.md)
