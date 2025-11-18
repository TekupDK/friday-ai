# Detaljeret Feature Implementation: Abonnementsløsning

**Dato:** 2025-01-28  
**Status:** ✅ Backend Core Complete  
**Version:** 1.0.0

---

## Feature Oversigt

### Beskrivelse

Abonnementsløsningen er en omfattende subscription management system til Rendetalje.dk, der gør det muligt for kunder at abonnere på månedlige rengøringstjenester. Systemet håndterer:

- **5 forskellige abonnementsplaner** (tier1-3, flex_basis, flex_plus)
- **Automatisk månedlig fakturering** via Billy.dk integration
- **Usage tracking** med overage detection
- **Recurring calendar events** via Google Calendar
- **Comprehensive analytics** (MRR, ARR, ARPU, Churn Rate)
- **Audit trail** for alle subscription ændringer
- **Discount system** for referrals og promotioner

### Status

- ✅ **Backend Implementation** - Komplet
- ✅ **Database Schema** - Implementeret med performance indexes
- ✅ **tRPC API** - 15+ endpoints
- ✅ **Business Logic** - Alle core operations
- ✅ **Integration Points** - Billy.dk og Google Calendar
- ⏳ **Frontend** - Ikke implementeret endnu
- ⏳ **Background Jobs** - Ikke implementeret endnu
- ⏳ **Testing** - Ikke implementeret endnu
- ⏳ **Email Templates** - Ikke implementeret endnu

### Business Value

- **Forudsigelig indtægt:** MRR giver stabil cash flow
- **Reduceret churn:** Abonnementer har typisk 5% churn vs. 15% for one-time
- **Bedre kundeforhold:** Recurring bookings skaber loyalitet
- **Automatisering:** Månedlig fakturering og booking sker automatisk
- **Data-driven insights:** Analytics giver indsigt i kundeadfærd

---

## Arkitektur og Design

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React)                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Subscription Management UI                       │   │
│  │  - Plan selector                                 │   │
│  │  - Usage dashboard                               │   │
│  │  - Billing history                               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ tRPC
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  tRPC API Layer                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ subscription-router.ts                          │   │
│  │  - create, list, get, update, cancel           │   │
│  │  - getUsage, getHistory, stats                 │   │
│  │  - getMRR, getARPU, getChurnRate               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Business   │ │  Database    │ │ Integration  │
│    Logic     │ │   Helpers    │ │   Services   │
│              │ │              │ │              │
│ subscription-│ │ subscription-│ │ Billy.dk     │
│  actions.ts  │ │    -db.ts   │ │ Calendar API │
│              │ │              │ │              │
│ subscription-│ │              │ │              │
│  helpers.ts  │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ subscriptions│ │ subscription│ │ subscription│   │
│  │              │ │   _usage    │ │  _history   │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Design Beslutninger

#### 1. **Separation of Concerns (SoC)**

**Rationale:**  
Koden er opdelt i 4 klare lag:
- **Router Layer** (`subscription-router.ts`) - API endpoints og input validation
- **Action Layer** (`subscription-actions.ts`) - Business logic og orchestration
- **Helper Layer** (`subscription-helpers.ts`) - Calculations og analytics
- **Database Layer** (`subscription-db.ts`) - Data access med RBAC

**Alternativer overvejet:**
- Monolithic router med alt logic (afvist - for svært at teste og vedligeholde)
- Service layer pattern (overvejet - valgt actions i stedet for bedre navngivning)

**Trade-offs:**
- ✅ Bedre testbarhed og vedligeholdelse
- ✅ Klar separation mellem concerns
- ⚠️ Flere filer at navigere (men bedre organisation)

#### 2. **Price Storage: øre vs. DKK**

**Rationale:**  
Priser gemmes i øre (integer) for at undgå floating-point fejl i finansielle beregninger.

```typescript
monthlyPrice: integer().notNull(), // Price in øre (e.g., 120000 = 1,200 kr)
```

**Alternativer overvejet:**
- Decimal/Numeric type (afvist - kan give rounding errors)
- Float/Double (afvist - præcisionsproblemer)

**Trade-offs:**
- ✅ Præcis finansiel beregning
- ✅ Ingen rounding errors
- ⚠️ Konvertering nødvendig ved display (120000 / 100 = 1,200 kr)

#### 3. **Async Calendar Creation**

**Rationale:**  
Calendar events oprettes asynkront uden at blokere subscription creation.

```typescript
// Create recurring calendar events (async, don't wait)
createRecurringBookings(...).catch((error) => {
  console.error("Error creating recurring bookings:", error);
  // Don't fail subscription creation if calendar fails
});
```

**Alternativer overvejet:**
- Synkron creation (afvist - langsomt, kan fejle)
- Queue system (overvejet - for komplekst for MVP)

**Trade-offs:**
- ✅ Hurtigere subscription creation
- ✅ Subscription oprettes selv hvis calendar fejler
- ⚠️ Calendar events kan mangle hvis API fejler (men kan rettes manuelt)

#### 4. **Comprehensive Indexing Strategy**

**Rationale:**  
Alle queries har dedikerede indexes for optimal performance.

```typescript
// Example from schema.ts
index("idx_subscriptions_user_id"), // User-scoped queries
index("idx_subscriptions_status"), // Status filtering
index("idx_subscriptions_next_billing_date"), // Billing jobs
index("idx_subscription_usage_subscription_month_year"), // Monthly usage
```

**Alternativer overvejet:**
- Minimal indexing (afvist - dårlig performance)
- Over-indexing (overvejet - valgt balanced approach)

**Trade-offs:**
- ✅ Optimal query performance
- ✅ Hurtigere billing jobs
- ⚠️ Lidt langsommere writes (men minimal impact)

#### 5. **Audit Trail Pattern**

**Rationale:**  
Alle subscription ændringer logges i `subscription_history` for compliance og debugging.

```typescript
await addSubscriptionHistory({
  subscriptionId,
  action: "created",
  oldValue: null,
  newValue: subscription,
  changedBy: userId,
  timestamp: new Date().toISOString(),
});
```

**Alternativer overvejet:**
- Event sourcing (overvejet - for komplekst for MVP)
- No audit trail (afvist - compliance krav)

**Trade-offs:**
- ✅ Fuld traceability
- ✅ Compliance ready
- ⚠️ Ekstra storage (men minimal)

### Data Flow

#### Subscription Creation Flow

```
1. Frontend → tRPC.subscription.create.mutate()
   ↓
2. subscription-router.ts: create()
   - Input validation (Zod)
   - User authentication (protectedProcedure)
   ↓
3. subscription-actions.ts: createSubscription()
   - Validate customer exists
   - Check for existing active subscription
   - Get plan configuration
   - Calculate next billing date
   ↓
4. Database: INSERT into subscriptions
   ↓
5. subscription-db.ts: addSubscriptionHistory()
   - Log creation event
   ↓
6. subscription-actions.ts: createRecurringBookings()
   - Calculate booking dates (12 months)
   - Create Google Calendar events (async)
   ↓
7. Return subscription to frontend
```

#### Renewal Flow

```
1. Background Job (cron: 1st of month)
   ↓
2. subscription-db.ts: getSubscriptionsDueForBilling()
   - Query subscriptions where nextBillingDate <= today
   ↓
3. subscription-actions.ts: processRenewal()
   - Get customer Billy contact ID
   - Create invoice via Billy.dk API
   - Update nextBillingDate
   - Log renewal in history
   ↓
4. Return success with invoice ID
```

---

## Implementation Detaljer

### Backend Implementation

#### Files Structure

```
server/
├── subscription-db.ts          # Database helpers (CRUD operations)
├── subscription-helpers.ts     # Business logic helpers (calculations, analytics)
├── subscription-actions.ts     # Business actions (create, renew, cancel, discount)
└── routers/
    └── subscription-router.ts  # tRPC API endpoints
```

#### Key Components

##### 1. Database Schema (`drizzle/schema.ts`)

```typescript
export const subscriptionsInFridayAi = fridayAi.table("subscriptions", {
  id: serial().primaryKey().notNull(),
  userId: integer().notNull(),
  customerProfileId: integer().notNull(),
  planType: subscriptionPlanTypeInFridayAi().notNull(),
  monthlyPrice: integer().notNull(), // Price in øre
  includedHours: numeric({ precision: 5, scale: 2 }).notNull(),
  startDate: timestamp({ mode: "string" }).notNull(),
  endDate: timestamp({ mode: "string" }), // null = ongoing
  status: subscriptionStatusInFridayAi().default("active").notNull(),
  autoRenew: boolean().default(true).notNull(),
  nextBillingDate: timestamp({ mode: "string" }),
  cancelledAt: timestamp({ mode: "string" }),
  cancellationReason: text(),
  metadata: jsonb(), // Discounts, referrals, etc.
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});
```

**Design Notes:**
- `userId` for multi-tenancy og RBAC
- `metadata` JSONB for fleksibel extensibility
- `endDate` nullable for ongoing subscriptions
- Comprehensive indexes for performance

##### 2. Database Helpers (`server/subscription-db.ts`)

```typescript
export async function getSubscriptionByCustomerId(
  customerProfileId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.customerProfileId, customerProfileId),
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}
```

**Pattern:** User-scoped queries med RBAC
- Alle queries inkluderer `userId` check
- Returnerer `undefined` hvis ikke fundet (ikke `null`)
- Sorteret efter `createdAt DESC` for seneste først

##### 3. Business Logic Helpers (`server/subscription-helpers.ts`)

```typescript
export const SUBSCRIPTION_PLANS = {
  tier1: {
    name: "Basis Abonnement",
    monthlyPrice: 120000, // 1,200 kr
    includedHours: 3.0,
    description: "1x månedlig rengøring (3 timer)",
  },
  // ... other plans
} as const;

export async function calculateMonthlyRevenue(
  userId: number
): Promise<number> {
  const activeSubscriptions = await getActiveSubscriptions(userId);
  return activeSubscriptions.reduce((total, sub) => {
    return total + Number(sub.monthlyPrice);
  }, 0);
}
```

**Pattern:** Configuration as Code
- Plans defineret som const object for type safety
- Helper functions for alle calculations
- Async functions for database operations

##### 4. Business Actions (`server/subscription-actions.ts`)

```typescript
export async function createSubscription(
  userId: number,
  customerProfileId: number,
  planType: SubscriptionPlanType,
  options?: {
    startDate?: string;
    autoRenew?: boolean;
    metadata?: Record<string, any>;
  }
): Promise<Subscription> {
  // 1. Validate customer exists
  // 2. Check for existing subscription
  // 3. Get plan config
  // 4. Create subscription
  // 5. Add history entry
  // 6. Create calendar events (async)
  // 7. Return subscription
}
```

**Pattern:** Transaction-like operations
- Alle validations først
- Database operation
- History logging
- External integrations (async, non-blocking)

##### 5. tRPC Router (`server/routers/subscription-router.ts`)

```typescript
export const subscriptionRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        customerProfileId: z.number().int().positive(),
        planType: z.enum(["tier1", "tier2", "tier3", "flex_basis", "flex_plus"]),
        startDate: z.string().optional(),
        autoRenew: z.boolean().default(true),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createSubscription(
        ctx.user.id,
        input.customerProfileId,
        input.planType,
        {
          startDate: input.startDate,
          autoRenew: input.autoRenew,
          metadata: input.metadata,
        }
      );
    }),
  // ... other endpoints
});
```

**Pattern:** Thin Router Layer
- Router håndterer kun input validation og authentication
- Business logic i actions layer
- Konsistent error handling via TRPCError

#### tRPC Endpoints

| Endpoint | Type | Description |
|----------|------|-------------|
| `create` | Mutation | Create new subscription |
| `list` | Query | List subscriptions with filters |
| `get` | Query | Get single subscription by ID |
| `getByCustomer` | Query | Get subscription by customer ID |
| `update` | Mutation | Update subscription (plan, status, etc.) |
| `cancel` | Mutation | Cancel subscription |
| `getUsage` | Query | Get usage statistics for month |
| `getHistory` | Query | Get audit trail |
| `stats` | Query | Get subscription statistics |
| `getMRR` | Query | Calculate Monthly Recurring Revenue |
| `getChurnRate` | Query | Calculate churn rate for period |
| `getARPU` | Query | Calculate Average Revenue Per User |
| `applyDiscount` | Mutation | Apply discount to subscription |
| `renew` | Mutation | Manually trigger renewal (admin) |

### Frontend Implementation

**Status:** ⏳ Ikke implementeret endnu

**Foreslåede Components:**

```typescript
// client/src/components/subscription/SubscriptionPlanSelector.tsx
export function SubscriptionPlanSelector() {
  // Plan selection UI
}

// client/src/components/subscription/SubscriptionDashboard.tsx
export function SubscriptionDashboard() {
  // Usage tracking, billing history, stats
}

// client/src/pages/SubscriptionsPage.tsx
export function SubscriptionsPage() {
  // Main subscription management page
}
```

**State Management:**
- tRPC hooks for data fetching
- React Query for caching og invalidation
- Local state for UI interactions

---

## Integration Points

### External APIs

#### 1. Billy.dk Integration

**Purpose:** Automatisk månedlig fakturering

**Implementation:**
```typescript
// server/subscription-actions.ts
const invoice = await createInvoice({
  contactId: billyContactId,
  entryDate: new Date().toISOString().split("T")[0],
  paymentTermsDays: 14,
  lines: [
    {
      description: `${planConfig.name} - ${monthName}`,
      quantity: 1,
      unitPrice: subscription.monthlyPrice / 100, // Convert øre to DKK
      productId: `SUB-${subscription.planType.toUpperCase().replace("_", "-")}`,
    },
  ],
});
```

**Error Handling:**
- Returns `{ success: boolean, error?: string }` pattern
- Logs errors but doesn't throw (for background jobs)
- Invoice ID stored in history for tracking

**Dependencies:**
- `server/billy.ts` - Billy.dk API client
- Requires `billyCustomerId` or `billyOrganizationId` on customer profile

#### 2. Google Calendar Integration

**Purpose:** Automatisk oprettelse af recurring bookings

**Implementation:**
```typescript
// server/subscription-actions.ts
async function createRecurringBookings(
  subscriptionId: number,
  planConfig: ReturnType<typeof getPlanConfig>,
  customerName: string
): Promise<void> {
  // Calculate dates for next 12 months
  // Create calendar events (async, non-blocking)
  await createCalendarEvent({
    summary: `🏠 ${planConfig.name} - ${customerName}`,
    description: `Abonnement rengøring\nPlan: ${planConfig.name}`,
    start: startTime.toISOString(),
    end: endTime.toISOString(),
  });
}
```

**Error Handling:**
- Async execution (doesn't block subscription creation)
- Errors logged but don't fail subscription
- Can be retried manually if needed

**Dependencies:**
- `server/google-api.ts` - Google Calendar API client
- Requires Google OAuth authentication

### Internal Services

#### 1. Customer Profiles

**Integration:** Subscriptions linked via `customerProfileId`

**Validation:**
```typescript
// Check customer exists and belongs to user
const [customer] = await db
  .select()
  .from(customerProfiles)
  .where(
    and(
      eq(customerProfiles.id, customerProfileId),
      eq(customerProfiles.userId, userId)
    )
  )
  .limit(1);
```

#### 2. Bookings System

**Integration:** Usage tracking linked via `bookingId` in `subscription_usage`

**Future Enhancement:**
- Auto-create bookings from subscription calendar events
- Link bookings to subscription for usage tracking

### Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@trpc/server` | ^11.0.0 | tRPC framework |
| `drizzle-orm` | Latest | ORM for database |
| `zod` | Latest | Input validation |
| `postgres` | Latest | PostgreSQL driver |

---

## Code Patterns

### Design Patterns

#### 1. **Repository Pattern**

**Hvor brugt:** `subscription-db.ts`

```typescript
// All database operations abstracted behind functions
export async function getSubscriptionById(
  subscriptionId: number,
  userId: number
) {
  // Database access logic
}
```

**Benefit:** Separation of concerns, easier testing

#### 2. **Service Layer Pattern**

**Hvor brugt:** `subscription-actions.ts`

```typescript
// Business logic orchestration
export async function createSubscription(...) {
  // Orchestrates multiple operations
}
```

**Benefit:** Reusable business logic, clear responsibilities

#### 3. **Configuration Pattern**

**Hvor brugt:** `subscription-helpers.ts`

```typescript
// Configuration as code
export const SUBSCRIPTION_PLANS = { ... } as const;
```

**Benefit:** Type-safe, easy to modify

#### 4. **Audit Trail Pattern**

**Hvor brugt:** `subscription-history` table

```typescript
// Every change logged
await addSubscriptionHistory({
  action: "created",
  oldValue: null,
  newValue: subscription,
  changedBy: userId,
});
```

**Benefit:** Full traceability, compliance

### Best Practices

#### ✅ **User Scoping (RBAC)**

Alle queries inkluderer `userId` check:

```typescript
.where(
  and(
    eq(subscriptions.id, subscriptionId),
    eq(subscriptions.userId, userId) // ✅ RBAC
  )
)
```

#### ✅ **Input Validation**

Zod schemas for alle inputs:

```typescript
.input(
  z.object({
    subscriptionId: z.number().int().positive(),
    planType: z.enum(["tier1", "tier2", ...]),
  })
)
```

#### ✅ **Error Handling**

Konsistent error handling med TRPCError:

```typescript
if (!subscription) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Subscription not found",
  });
}
```

#### ✅ **Type Safety**

TypeScript types fra Drizzle schema:

```typescript
import type { Subscription } from "../drizzle/schema";
```

#### ✅ **Async Non-Blocking**

External integrations køres async:

```typescript
createRecurringBookings(...).catch((error) => {
  // Log but don't fail
});
```

### Code Examples

#### Eksempel 1: Subscription Creation med Validation

```typescript
export async function createSubscription(
  userId: number,
  customerProfileId: number,
  planType: SubscriptionPlanType,
  options?: { ... }
): Promise<Subscription> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database connection failed",
    });
  }

  // 1. Validate customer exists
  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(
      and(
        eq(customerProfiles.id, customerProfileId),
        eq(customerProfiles.userId, userId)
      )
    )
    .limit(1);

  if (!customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Customer profile not found",
    });
  }

  // 2. Check for existing subscription
  const existing = await getSubscriptionByCustomerId(customerProfileId, userId);
  if (existing && existing.status === "active") {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Customer already has an active subscription",
    });
  }

  // 3. Create subscription
  const [subscription] = await db
    .insert(subscriptions)
    .values({ ... })
    .returning();

  // 4. Log history
  await addSubscriptionHistory({ ... });

  // 5. Create calendar events (async)
  createRecurringBookings(...).catch((error) => {
    console.error("Error creating recurring bookings:", error);
  });

  return subscription;
}
```

#### Eksempel 2: Usage Tracking med Overage Detection

```typescript
export async function checkOverage(
  subscriptionId: number,
  year: number,
  month: number,
  userId: number
): Promise<{ hasOverage: boolean; hoursUsed: number; includedHours: number; overageHours: number }> {
  // Get subscription
  const subscription = await getSubscriptionById(subscriptionId, userId);
  const includedHours = Number(subscription.includedHours);

  // Get total usage for month
  const usageResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${subscriptionUsage.hoursUsed}), 0)`,
    })
    .from(subscriptionUsage)
    .where(
      and(
        eq(subscriptionUsage.subscriptionId, subscriptionId),
        eq(subscriptionUsage.year, year),
        eq(subscriptionUsage.month, month)
      )
    );

  const hoursUsed = Number(usageResult[0]?.total || 0);
  const overageHours = Math.max(0, hoursUsed - includedHours);
  const hasOverage = hoursUsed > includedHours;

  return {
    hasOverage,
    hoursUsed,
    includedHours,
    overageHours,
  };
}
```

#### Eksempel 3: Renewal Processing med Billy.dk

```typescript
export async function processRenewal(
  subscriptionId: number,
  userId: number
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  const subscription = await getSubscriptionById(subscriptionId, userId);
  if (!subscription || subscription.status !== "active") {
    return { success: false, error: "Subscription not active" };
  }

  const customer = await getCustomer(subscription.customerProfileId);
  const billyContactId = customer.billyCustomerId || customer.billyOrganizationId;
  if (!billyContactId) {
    return { success: false, error: "Customer has no Billy contact ID" };
  }

  // Create invoice
  const invoice = await createInvoice({
    contactId: billyContactId,
    entryDate: new Date().toISOString().split("T")[0],
    paymentTermsDays: 14,
    lines: [
      {
        description: `${planConfig.name} - ${monthName}`,
        quantity: 1,
        unitPrice: subscription.monthlyPrice / 100,
        productId: `SUB-${subscription.planType.toUpperCase()}`,
      },
    ],
  });

  // Update next billing date
  await db
    .update(subscriptions)
    .set({
      nextBillingDate: calculateNextBillingDate(subscription.nextBillingDate),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(subscriptions.id, subscriptionId));

  // Log history
  await addSubscriptionHistory({
    subscriptionId,
    action: "renewed",
    oldValue: { nextBillingDate: subscription.nextBillingDate },
    newValue: { nextBillingDate, invoiceId: invoice.id },
    changedBy: null, // System action
  });

  return { success: true, invoiceId: invoice.id };
}
```

---

## Testing

### Unit Tests

**Status:** ⏳ Ikke implementeret endnu

**Foreslåede Tests:**

```typescript
// tests/subscription-helpers.test.ts
describe("calculateMonthlyRevenue", () => {
  it("should sum all active subscription prices", async () => {
    // Test implementation
  });
});

// tests/subscription-actions.test.ts
describe("createSubscription", () => {
  it("should create subscription with all required fields", async () => {
    // Test implementation
  });
  
  it("should reject if customer already has active subscription", async () => {
    // Test implementation
  });
});
```

### Integration Tests

**Status:** ⏳ Ikke implementeret endnu

**Foreslåede Tests:**

```typescript
// tests/subscription-router.test.ts
describe("subscription router", () => {
  it("should create subscription via tRPC", async () => {
    // Test full flow
  });
});
```

### E2E Tests

**Status:** ⏳ Ikke implementeret endnu

**Foreslåede Tests:**

```typescript
// tests/e2e/subscription-flow.test.ts
describe("Subscription E2E Flow", () => {
  it("should create subscription, track usage, and renew", async () => {
    // Full end-to-end test
  });
});
```

---

## Performance Considerations

### Database Optimization

1. **Comprehensive Indexing**
   - All query patterns have dedicated indexes
   - Composite indexes for common queries (e.g., `subscription_month_year`)
   - Indexes on foreign keys for joins

2. **Query Optimization**
   - User-scoped queries use indexes
   - Limit clauses for pagination
   - Efficient date filtering

3. **Connection Pooling**
   - Reuses database connections via `getDb()`
   - Lazy initialization pattern

### Caching Strategy

**Status:** ⏳ Ikke implementeret endnu

**Anbefalinger:**
- Cache subscription stats (MRR, ARPU) for 5 minutes
- Cache plan configurations (static data)
- Invalidate cache on subscription changes

### Background Jobs

**Status:** ⏳ Ikke implementeret endnu

**Anbefalinger:**
- Monthly billing job: Run 1st of month at 00:00
- Batch processing for multiple subscriptions
- Retry logic for failed renewals
- Dead letter queue for persistent failures

---

## Security Considerations

### Authentication & Authorization

1. **User Scoping (RBAC)**
   - All queries include `userId` check
   - Prevents cross-user data access
   - Enforced at database helper level

2. **Input Validation**
   - Zod schemas for all inputs
   - Type checking at compile time
   - Runtime validation at API boundary

3. **SQL Injection Prevention**
   - Drizzle ORM uses parameterized queries
   - No raw SQL strings with user input

### Data Protection

1. **Sensitive Data**
   - Prices stored in øre (not sensitive, but financial data)
   - Customer IDs are internal (not exposed)
   - Metadata JSONB for extensibility (validate structure)

2. **Audit Trail**
   - All changes logged with user ID
   - Timestamp for compliance
   - Old/new values for rollback capability

### Error Handling

1. **Information Disclosure**
   - Generic error messages for users
   - Detailed errors logged server-side
   - No stack traces in production

2. **Rate Limiting**
   - ⏳ Not implemented yet (recommend adding)
   - Prevent abuse of subscription endpoints

---

## Anbefalinger

### Forbedringer

#### 1. **Background Jobs Implementation** (Priority: HIGH)

**Beskrivelse:**  
Implementer cron jobs for månedlig billing og renewal reminders.

**Estimated:** 8-12 hours

**Implementation:**
```typescript
// server/jobs/subscription-billing.ts
export async function processMonthlyBilling() {
  const subscriptions = await getSubscriptionsDueForBilling();
  for (const sub of subscriptions) {
    await processRenewal(sub.id, sub.userId);
  }
}

// Cron: Run 1st of month at 00:00
```

#### 2. **Usage Tracking Integration** (Priority: HIGH)

**Beskrivelse:**  
Integrer med bookings system for automatisk usage tracking.

**Estimated:** 6-8 hours

**Implementation:**
```typescript
// When booking completed
await createSubscriptionUsage({
  subscriptionId,
  bookingId,
  hoursUsed: booking.duration,
  date: booking.date,
  month: booking.month,
  year: booking.year,
});
```

#### 3. **Email Templates** (Priority: MEDIUM)

**Beskrivelse:**  
Implementer email templates for welcome, invoice, renewal, cancellation.

**Estimated:** 4-6 hours

**Templates needed:**
- Welcome email (subscription created)
- Invoice email (monthly billing)
- Renewal reminder (7 days, 1 day before)
- Cancellation confirmation

#### 4. **Frontend Implementation** (Priority: HIGH)

**Beskrivelse:**  
Opret React components for subscription management.

**Estimated:** 16-24 hours

**Components:**
- Subscription plan selector
- Subscription dashboard
- Usage tracking display
- Billing history
- Customer subscription page

#### 5. **Testing Suite** (Priority: MEDIUM)

**Beskrivelse:**  
Implementer unit, integration, og E2E tests.

**Estimated:** 12-16 hours

**Coverage:**
- Unit tests for helpers og actions
- Integration tests for router
- E2E tests for full flow

### Optimizations

#### 1. **Caching Layer** (Priority: MEDIUM)

**Beskrivelse:**  
Implementer caching for stats og plan configurations.

**Expected impact:** 50-70% reduction in database queries for stats

**Implementation:**
```typescript
// Cache MRR, ARPU for 5 minutes
const cachedStats = await getCachedQuery("subscription-stats", async () => {
  return await getSubscriptionStats(userId);
}, { ttl: 300 });
```

#### 2. **Batch Processing** (Priority: LOW)

**Beskrivelse:**  
Optimize renewal processing med batch operations.

**Expected impact:** 30-40% faster renewal processing

**Implementation:**
```typescript
// Process renewals in batches of 10
const batches = chunk(subscriptions, 10);
for (const batch of batches) {
  await Promise.all(batch.map(sub => processRenewal(sub.id, sub.userId)));
}
```

#### 3. **Database Query Optimization** (Priority: LOW)

**Beskrivelse:**  
Review og optimize slow queries med EXPLAIN ANALYZE.

**Expected impact:** 10-20% faster queries

### Refactoring Muligheder

#### 1. **Extract Calendar Service** (Priority: LOW)

**Beskrivelse:**  
Opret separate service for calendar operations.

**Benefit:** Bedre separation of concerns, easier testing

**Implementation:**
```typescript
// server/services/calendar-service.ts
export class CalendarService {
  async createRecurringBookings(subscription: Subscription) {
    // Calendar logic
  }
}
```

#### 2. **Extract Billing Service** (Priority: LOW)

**Beskrivelse:**  
Opret separate service for billing operations.

**Benefit:** Bedre organization, easier to test

**Implementation:**
```typescript
// server/services/billing-service.ts
export class BillingService {
  async processRenewal(subscription: Subscription) {
    // Billing logic
  }
}
```

---

## Næste Skridt

### Immediate (Week 1-2)

1. ✅ **Backend Core** - Complete (DONE)
2. ⏳ **Database Migration** - Generate and apply migration
3. ⏳ **Frontend MVP** - Basic subscription management UI
4. ⏳ **Background Jobs** - Monthly billing cron job

### Short-term (Week 3-4)

5. ⏳ **Usage Tracking** - Integrate with bookings system
6. ⏳ **Email Templates** - Welcome, invoice, renewal emails
7. ⏳ **Testing** - Unit and integration tests

### Medium-term (Month 2)

8. ⏳ **Advanced Features** - Discounts, promotions, referrals
9. ⏳ **Analytics Dashboard** - Visual stats and insights
10. ⏳ **Performance Optimization** - Caching, query optimization

---

## Konklusion

Abonnementsløsningen er implementeret med solid arkitektur, klare separation of concerns, og comprehensive features. Backend core er komplet og klar til frontend integration. Systemet følger best practices for security, performance, og maintainability.

**Key Strengths:**
- ✅ Clean architecture med separation of concerns
- ✅ Comprehensive database schema med performance indexes
- ✅ Type-safe implementation med TypeScript
- ✅ Full audit trail for compliance
- ✅ Integration ready (Billy.dk, Google Calendar)

**Areas for Improvement:**
- ⏳ Frontend implementation
- ⏳ Background jobs for automation
- ⏳ Testing suite
- ⏳ Email templates
- ⏳ Caching layer

**Estimated Time to Production:** 4-6 weeks (med frontend og testing)

---

**Last Updated:** 2025-01-28  
**Maintained by:** TekupDK Development Team


