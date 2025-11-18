# Detaljeret Gennemgang: Abonnementsløsning for Rendetalje

**Dato:** 2025-11-17  
**Status:** 📋 Planning & Analysis Complete - Ready for Implementation  
**Prioritet:** HIGH

---

## Kontekst fra Tidligere Diskussion

### **Oprindeligt Spørgsmål**

Brugeren spurgte om mulighederne for at lave en **abonnementsløsning** for Rendetalje's kunder, både til eksisterende kunder og til at tiltrække nye kunder. Spørgsmålet var baseret på faktiske data fra systemet.

### **Hvad Vi Har Opnået**

✅ **Omfattende Business Analyse** - Baseret på faktiske data fra V4.3.5  
✅ **3 Abonnementsmodeller** - Fast Rengøring, Flex, Erhverv  
✅ **Finansiel Projektion** - 253,000-541,000 kr/år potential  
✅ **Implementation Plan** - 28 konkrete tasks med prioritering  
✅ **AI Integration Strategi** - 6 AI-forbedringer med 723,780 kr/år potential  
✅ **Marketing Strategi** - Lead generation, referral program, digital marketing

**Status:**

- ✅ Analyse dokumenteret (`SUBSCRIPTION_SOLUTION_ANALYSIS.md`)
- ✅ Implementation TODOs oprettet (`SUBSCRIPTION_IMPLEMENTATION_TODOS.md`)
- ✅ AI-forbedringer identificeret (`SUBSCRIPTION_AI_IDEAS.md`)
- ⏳ Afventer godkendelse fra management
- ⏳ Implementation ikke startet endnu

---

## Nuværende Status

### **Code Quality**

- ✅ **TypeScript check:** Ikke relevant endnu (ingen kode skrevet)
- ✅ **Code review:** N/A (planning fase)
- ✅ **Dokumentation:** Komplet analyse og plan dokumenteret
- ⏳ **Tests:** Ikke skrevet endnu (planlagt i TODO)

### **Klar til:**

- 📋 **Review med management** - Budget approval (40,000 kr MVP)
- 📋 **Prioritering** - Hvilke features skal i MVP vs. Phase 2
- 📋 **Design decisions** - Final pricing, plan features
- 🚀 **Implementation start** - Når godkendt

---

## Detaljeret Gennemgang

### **Hvad Vi Har Opnået**

#### 1. **Omfattende Business Analyse**

**Beskrivelse:**
En dybdegående analyse baseret på faktiske data fra Friday AI Chat systemet, inkluderet:

- 24 recurring kunder med 50,738 kr/måned revenue
- 231 total leads med 224,132 kr total revenue
- Lead acquisition costs (150-750 kr/lead)
- Service type distribution og pricing

**Tekniske Detaljer:**

- Data source: `server/integrations/chromadb/` - V4.3.5 dataset
- Pricing constants: `client/src/constants/pricing.ts` (349 kr/time)
- Customer data: `drizzle/schema.ts` - `customerProfilesInFridayAi` table
- Recurring patterns: Analyseret fra Google Calendar events

**Implementation:**

- Analyse dokumenteret i `docs/analysis/SUBSCRIPTION_SOLUTION_ANALYSIS.md`
- Baseret på faktiske data fra juli-december 2025
- Inkluderer finansiel projektion og ROI analyse

**Features:**

- 3 abonnementsmodeller (Fast, Flex, Erhverv)
- 5 plan tiers (Tier 1-3, Flex Basis/Plus, Erhverv Basis/Plus)
- Pricing fra 1,000-4,000 kr/måned
- Revenue projection: 253,000-541,000 kr/år

#### 2. **Implementation Plan**

**Beskrivelse:**
En detaljeret TODO liste med 28 konkrete tasks opdelt i:

- Backend (8 tasks)
- Frontend (6 tasks)
- Integration (4 tasks)
- Marketing (5 tasks)
- Testing (3 tasks)
- Documentation (2 tasks)

**Tekniske Detaljer:**

- Database schema design (3 tables: subscriptions, subscription_usage, subscription_history)
- tRPC router med 6 endpoints
- Billy.dk integration for monthly invoicing
- Google Calendar integration for recurring bookings
- Email automation templates

**Implementation:**

- Planlagt i `docs/analysis/SUBSCRIPTION_IMPLEMENTATION_TODOS.md`
- Prioriteret (P1/P2/P3)
- Timeline: 8 uger til MVP
- Budget: 40,000 kr for MVP

**Features:**

- Complete database schema
- Full tRPC API
- React components
- Integration med eksisterende systemer
- Background jobs for billing og reminders

#### 3. **AI Integration Strategi**

**Beskrivelse:**
6 AI-forbedringer der kan automatisere og optimere abonnementsløsningen:

- Intelligent subscription recommendations
- Predictive churn detection
- Automated usage optimization
- Dynamic pricing engine
- Intelligent upsell/cross-sell
- Automated customer success

**Tekniske Detaljer:**

- Vector search via ChromaDB (4 collections)
- Friday AI tools (6 nye tools)
- AI model routing (Gemini 2.5 Flash + Claude 3.5 Sonnet)
- Integration med eksisterende AI infrastructure

**Implementation:**

- Dokumenteret i `docs/analysis/SUBSCRIPTION_AI_IDEAS.md`
- Expected impact: 723,780 kr/år
- ROI: 1,316%
- Payback period: 1 måned

**Features:**

- Churn prediction (reducer fra 15% til <5%)
- Plan recommendations (højere konvertering)
- Usage optimization (reducer overage)
- Upsell automation (højere ARPU)

---

## Feature Implementation Detaljer

### **Arkitektur og Design**

#### **System Design**

```text
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Plan Selector│  │ Management   │  │ Billing      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  tRPC API Layer                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ subscription-router.ts                          │   │
│  │  - createSubscription                           │   │
│  │  - listSubscriptions                            │   │
│  │  - updateSubscription                           │   │
│  │  - cancelSubscription                           │   │
│  │  - getUsage                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Database   │ │  Billy.dk    │ │   Calendar   │
│  (PostgreSQL)│ │  Integration │ │  Integration │
└──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Background Jobs (Cron)                      │
│  - Monthly billing (1st of month)                       │
│  - Renewal reminders (7 days, 1 day before)             │
│  - Usage tracking (daily)                               │
└─────────────────────────────────────────────────────────┘
```

#### **Design Beslutninger**

**1. Database Schema Design**

**Rationale:**

- Separeret `subscriptions` table for core data
- `subscription_usage` table for tracking timer brugt
- `subscription_history` table for audit trail (P2)

**Alternativer overvejet:**

- Single table med JSONB for usage (afvist - for kompleks)
- Separate tables per plan type (afvist - for rigid)

**Trade-offs:**

- ✅ Normaliseret design (bedre queries)
- ✅ Fleksibel (nem at tilføje nye plan types)
- ⚠️ Mere kompleks (3 tables vs. 1)

**2. tRPC Router Design**

**Rationale:**

- Følger eksisterende pattern fra `server/routers/`
- Protected procedures for security
- Zod validation for type safety

**Alternativer overvejet:**

- REST API (afvist - tRPC er bedre for TypeScript)
- GraphQL (afvist - overkill for dette use case)

**Trade-offs:**

- ✅ Type-safe end-to-end
- ✅ Automatisk client generation
- ⚠️ Kun TypeScript clients

**3. Billy.dk Integration**

**Rationale:**

- Eksisterende integration i `server/integrations/billy/`
- Reuse existing product IDs (REN-001 til REN-005)
- Add new subscription product IDs (SUB-001 til SUB-005)

**Alternativer overvejet:**

- Egen fakturering (afvist - Billy.dk allerede i brug)
- Stripe integration (afvist - ikke relevant for B2B)

**Trade-offs:**

- ✅ Konsistent med eksisterende system
- ✅ Ingen ekstra payment provider
- ⚠️ Afhængig af Billy.dk API

### **Data Flow**

```text
1. Customer subscribes
   └─> Frontend: SubscriptionPlanSelector
       └─> tRPC: createSubscription
           └─> Database: Insert subscription
               └─> Billy.dk: Create customer (if new)
                   └─> Calendar: Create recurring events
                       └─> Email: Send welcome email

2. Monthly billing cycle
   └─> Cron job: subscription-billing.ts (1st of month)
       └─> Database: Get active subscriptions
           └─> Billy.dk: Create invoice
               └─> Email: Send invoice email
                   └─> Database: Track invoice status

3. Usage tracking
   └─> Booking completed
       └─> Database: Insert subscription_usage
           └─> Check: Hours used vs. included
               └─> Alert: If overage detected
```

---

## Implementation Detaljer

### **Backend Implementation**

#### **Database Schema**

**Files:**

- `drizzle/schema.ts` - Add subscription tables

**Key Components:**

```typescript
// Subscription table
export const subscriptionsInFridayAi = fridayAi.table(
  "subscriptions",
  {
    id: serial().primaryKey().notNull(),
    userId: integer().notNull(),
    customerProfileId: integer().notNull(),
    planType: varchar({ length: 50 }).notNull(), // 'tier1', 'tier2', 'tier3', 'flex_basis', 'flex_plus'
    monthlyPrice: integer().notNull(), // Price in øre (DKK × 100)
    includedHours: numeric({ precision: 5, scale: 2 }).notNull(),
    startDate: timestamp({ mode: "string" }).notNull(),
    endDate: timestamp({ mode: "string" }), // NULL for ongoing
    status: varchar({ length: 20 }).default("active").notNull(), // 'active', 'paused', 'cancelled'
    autoRenew: boolean().default(true).notNull(),
    billyProductId: varchar({ length: 50 }), // SUB-001, SUB-002, etc.
    metadata: jsonb(), // Flexible fields (discounts, referral codes, etc.)
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_subscriptions_customer").using(
      "btree",
      table.customerProfileId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_subscriptions_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops")
    ),
    index("idx_subscriptions_end_date").using(
      "btree",
      table.endDate.asc().nullsLast()
    ),
  ]
);

// Subscription usage tracking
export const subscriptionUsageInFridayAi = fridayAi.table(
  "subscription_usage",
  {
    id: serial().primaryKey().notNull(),
    subscriptionId: integer().notNull(),
    bookingId: integer(), // Link to bookings table
    hoursUsed: numeric({ precision: 5, scale: 2 }).notNull(),
    date: timestamp({ mode: "string" }).notNull(),
    serviceType: varchar({ length: 50 }), // REN-001, REN-002, etc.
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    index("idx_subscription_usage_subscription").using(
      "btree",
      table.subscriptionId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_subscription_usage_date").using(
      "btree",
      table.date.desc().nullsLast()
    ),
  ]
);
```

**tRPC Endpoints:**

```typescript
// server/routers/subscription-router.ts
export const subscriptionRouter = router({
  createSubscription: protectedProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        planType: z.enum([
          "tier1",
          "tier2",
          "tier3",
          "flex_basis",
          "flex_plus",
          "erhverv_basis",
          "erhverv_plus",
        ]),
        startDate: z.string().optional(), // Default: today
        autoRenew: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Get plan configuration
      const planConfig = getPlanConfig(input.planType);

      // Check if customer already has active subscription
      const existing = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.customerProfileId, input.customerId),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Customer already has an active subscription",
        });
      }

      // Create subscription
      const [subscription] = await db
        .insert(subscriptions)
        .values({
          userId: ctx.user.id,
          customerProfileId: input.customerId,
          planType: input.planType,
          monthlyPrice: planConfig.price,
          includedHours: planConfig.includedHours,
          startDate: input.startDate || new Date().toISOString(),
          status: "active",
          autoRenew: input.autoRenew,
          billyProductId: planConfig.billyProductId,
        })
        .returning();

      // Create recurring calendar events
      await createRecurringBookings(subscription.id, planConfig);

      // Send welcome email
      await sendWelcomeEmail(subscription.id);

      return subscription;
    }),

  listSubscriptions: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "paused", "cancelled", "all"]).optional(),
        customerId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      const conditions = [eq(subscriptions.userId, ctx.user.id)];

      if (input?.status && input.status !== "all") {
        conditions.push(eq(subscriptions.status, input.status));
      }

      if (input?.customerId) {
        conditions.push(eq(subscriptions.customerProfileId, input.customerId));
      }

      return await db
        .select()
        .from(subscriptions)
        .where(and(...conditions))
        .orderBy(desc(subscriptions.createdAt));
    }),

  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().int().positive(),
        reason: z.string().optional(),
        effectiveDate: z.string().optional(), // Default: end of current period
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      // Get subscription
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.id, input.subscriptionId),
            eq(subscriptions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      // Calculate end date (end of current billing period)
      const endDate =
        input.effectiveDate || calculatePeriodEnd(subscription.startDate);

      // Update subscription
      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          endDate: endDate,
          autoRenew: false,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(subscriptions.id, input.subscriptionId));

      // Cancel future calendar events
      await cancelFutureBookings(subscription.id, endDate);

      // Send cancellation email
      await sendCancellationEmail(subscription.id, input.reason);

      return { success: true };
    }),
});
```

**Helper Functions:**

```typescript
// server/subscription-helpers.ts
export const PLAN_CONFIG = {
  tier1: {
    name: "Basis Abonnement",
    price: 120000, // 1,200 kr in øre
    includedHours: 3,
    billyProductId: "SUB-001",
    frequency: "monthly",
  },
  tier2: {
    name: "Premium Abonnement",
    price: 180000, // 1,800 kr
    includedHours: 4,
    billyProductId: "SUB-002",
    frequency: "monthly",
  },
  tier3: {
    name: "VIP Abonnement",
    price: 250000, // 2,500 kr
    includedHours: 6, // 2x 3 hours
    billyProductId: "SUB-003",
    frequency: "biweekly", // 2x per month
  },
  flex_basis: {
    name: "Flex Basis",
    price: 100000, // 1,000 kr
    includedHours: 2.5,
    billyProductId: "SUB-004",
    frequency: "monthly",
    canAccumulate: true,
    maxAccumulation: 5, // hours
  },
  flex_plus: {
    name: "Flex Plus",
    price: 150000, // 1,500 kr
    includedHours: 4,
    billyProductId: "SUB-005",
    frequency: "monthly",
    canAccumulate: true,
    maxAccumulation: 8, // hours
  },
} as const;

export function getPlanConfig(
  planType: keyof typeof PLAN_CONFIG
): (typeof PLAN_CONFIG)[keyof typeof PLAN_CONFIG] {
  return PLAN_CONFIG[planType];
}

export function calculateMonthlyRevenue(
  subscriptions: Array<{ monthlyPrice: number; status: string }>
): number {
  return subscriptions
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + s.monthlyPrice, 0);
}

export function calculateChurnRate(
  cancellations: number,
  activeSubscriptions: number
): number {
  if (activeSubscriptions === 0) return 0;
  return (cancellations / activeSubscriptions) * 100;
}
```

### **Frontend Implementation**

**Files:**

- `client/src/components/subscription/SubscriptionPlanSelector.tsx`
- `client/src/components/subscription/SubscriptionCard.tsx`
- `client/src/components/subscription/SubscriptionManagement.tsx`
- `client/src/pages/SubscriptionManagement.tsx`

**Key Components:**

```typescript
// client/src/components/subscription/SubscriptionPlanSelector.tsx
interface Plan {
  id: string;
  name: string;
  price: number;
  includedHours: number;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "tier1",
    name: "Basis Abonnement",
    price: 1200,
    includedHours: 3,
    features: [
      "1x månedlig rengøring (3 timer)",
      "Standard service",
      "Fast pris, ingen overraskelser",
    ],
  },
  {
    id: "tier2",
    name: "Premium Abonnement",
    price: 1800,
    includedHours: 4,
    features: [
      "1x månedlig rengøring (4 timer)",
      "Hovedrengøring inkluderet",
      "Prioriteret booking",
      "Dedikeret koordinator",
    ],
    popular: true,
  },
  {
    id: "tier3",
    name: "VIP Abonnement",
    price: 2500,
    includedHours: 6,
    features: [
      "2x månedlig rengøring (3 timer hver)",
      "Hovedrengøring hver 3. måned",
      "Prioriteret booking",
      "Dedikeret koordinator",
      "Gratis ekstra service ved behov",
    ],
  },
];

export function SubscriptionPlanSelector({
  customerId,
  onSelect,
}: {
  customerId?: number;
  onSelect?: (planId: string) => void;
}) {
  const createMutation = trpc.subscription.createSubscription.useMutation({
    onSuccess: () => {
      toast.success("Abonnement oprettet!");
      onSelect?.("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSelect = (planId: string) => {
    if (!customerId) {
      toast.error("Vælg venligst en kunde først");
      return;
    }

    createMutation.mutate({
      customerId,
      planType: planId as any,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            "relative",
            plan.popular && "border-2 border-primary"
          )}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Mest populære
            </Badge>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <div className="text-3xl font-bold">
              {plan.price} kr<span className="text-sm font-normal">/måned</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              onClick={() => handleSelect(plan.id)}
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? "Opretter..." : "Vælg Plan"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### **Integration Points**

#### **Billy.dk Integration**

**Existing Integration:**

- `server/integrations/billy/` - Existing Billy API client
- `server/friday-prompts.ts` - BILLY_INVOICE_PROMPT with product IDs

**New Requirements:**

- Add subscription product IDs (SUB-001 til SUB-005)
- Monthly invoice generation (cron job)
- Payment tracking

**Implementation:**

```typescript
// server/integrations/billy/subscription-invoicing.ts
export async function createMonthlyInvoice(
  subscriptionId: number,
  userId: number
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Get subscription
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);

  if (!subscription) throw new Error("Subscription not found");

  // Get customer
  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.id, subscription.customerProfileId))
    .limit(1);

  if (!customer) throw new Error("Customer not found");

  // Create invoice via Billy API
  const invoice = await billyClient.createInvoice({
    contactId: customer.billyCustomerId || customer.billyOrganizationId,
    entryDate: new Date().toISOString().split("T")[0],
    lines: [
      {
        productId: subscription.billyProductId,
        description: `${getPlanConfig(subscription.planType).name} - ${new Date().toLocaleDateString("da-DK", { month: "long", year: "numeric" })}`,
        quantity: 1,
        unitPrice: subscription.monthlyPrice / 100, // Convert from øre to DKK
      },
    ],
    paymentTermsDays: 14,
  });

  return invoice.id;
}
```

#### **Google Calendar Integration**

**Existing Integration:**

- `server/integrations/google/calendar/` - Existing Calendar API client
- `drizzle/schema.ts` - `calendarEventsInFridayAi` table

**New Requirements:**

- Recurring event creation based on subscription
- Automatic event updates on subscription changes
- Reminder emails 24h before booking

**Implementation:**

```typescript
// server/integrations/google/calendar/subscription-bookings.ts
export async function createRecurringBookings(
  subscriptionId: number,
  planConfig: (typeof PLAN_CONFIG)[keyof typeof PLAN_CONFIG]
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, subscriptionId))
    .limit(1);

  if (!subscription) throw new Error("Subscription not found");

  const [customer] = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.id, subscription.customerProfileId))
    .limit(1);

  if (!customer) throw new Error("Customer not found");

  // Calculate next booking dates based on frequency
  const dates = calculateBookingDates(
    subscription.startDate,
    planConfig.frequency,
    12 // 12 months ahead
  );

  // Create calendar events
  for (const date of dates) {
    await calendarClient.createEvent({
      summary: `🏠 ${planConfig.name} - ${customer.name}`,
      description: `Abonnement rengøring\nPlan: ${planConfig.name}\nInkluderet timer: ${planConfig.includedHours}`,
      start: {
        dateTime: date.toISOString(),
        timeZone: "Europe/Copenhagen",
      },
      end: {
        dateTime: new Date(
          date.getTime() + planConfig.includedHours * 60 * 60 * 1000
        ).toISOString(),
        timeZone: "Europe/Copenhagen",
      },
      recurrence:
        planConfig.frequency === "monthly"
          ? ["RRULE:FREQ=MONTHLY;COUNT=12"]
          : planConfig.frequency === "biweekly"
            ? ["RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=24"]
            : undefined,
    });
  }
}
```

---

## Code Patterns

### **Design Patterns**

- **Repository Pattern** - `server/subscription-db.ts` for database operations
- **Service Layer** - `server/subscription-actions.ts` for business logic
- **Factory Pattern** - `getPlanConfig()` for plan configuration
- **Observer Pattern** - Background jobs observe subscription state changes

### **Best Practices**

- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Input Validation** - Zod schemas for all inputs
- ✅ **Error Handling** - TRPCError for consistent error responses
- ✅ **Database Indexes** - Optimized queries with proper indexes
- ✅ **Audit Trail** - subscription_history table for changes
- ✅ **Separation of Concerns** - Clear separation between API, business logic, and data access

### **Code Examples**

```typescript
// Example 1: Subscription creation with validation
export async function createSubscription(
  userId: number,
  customerId: number,
  planType: string
): Promise<Subscription> {
  // Validate plan type
  if (!PLAN_CONFIG[planType as keyof typeof PLAN_CONFIG]) {
    throw new Error(`Invalid plan type: ${planType}`);
  }

  // Check for existing subscription
  const existing = await getActiveSubscription(customerId);
  if (existing) {
    throw new Error("Customer already has active subscription");
  }

  // Create subscription
  const subscription = await db
    .insert(subscriptions)
    .values({
      userId,
      customerProfileId: customerId,
      planType,
      // ... other fields
    })
    .returning();

  // Create related resources
  await createRecurringBookings(subscription[0].id, getPlanConfig(planType));
  await sendWelcomeEmail(subscription[0].id);

  return subscription[0];
}

// Example 2: Usage tracking
export async function trackUsage(
  subscriptionId: number,
  bookingId: number,
  hoursUsed: number
): Promise<void> {
  await db.insert(subscriptionUsage).values({
    subscriptionId,
    bookingId,
    hoursUsed,
    date: new Date().toISOString(),
  });

  // Check for overage
  const totalUsed = await getTotalUsageThisMonth(subscriptionId);
  const subscription = await getSubscription(subscriptionId);

  if (totalUsed > subscription.includedHours) {
    await sendOverageAlert(
      subscriptionId,
      totalUsed - subscription.includedHours
    );
  }
}
```

---

## Dependencies

### **External APIs**

- **Billy.dk API** - Invoice generation and payment tracking
- **Google Calendar API** - Recurring event creation
- **Gmail API** - Email automation (welcome, invoices, reminders)

### **Internal Services**

- **Database (PostgreSQL)** - Core data storage
- **tRPC** - API layer
- **Friday AI** - AI-powered features (Phase 2)

### **Dependencies**

- `drizzle-orm` - Database ORM
- `@trpc/server` - tRPC server
- `zod` - Input validation
- `react-query` - Frontend data fetching
- `lucide-react` - Icons

---

## Testing

### **Unit Tests**

**Location:** `tests/subscription.test.ts`

**Test Cases:**

- Subscription creation
- Plan configuration validation
- Renewal logic
- Cancellation flow
- Usage tracking
- Overage detection

### **Integration Tests**

**Location:** `tests/subscription-integration.test.ts`

**Test Cases:**

- Billy.dk invoice generation
- Calendar event creation
- Email sending
- End-to-end subscription flow

### **E2E Tests**

**Location:** `tests/e2e/subscription.test.ts`

**Test Cases:**

- Complete subscription signup flow
- Monthly billing cycle
- Subscription cancellation

---

## Performance Considerations

- **Database Indexes** - Optimized for common queries (customerId, status, endDate)
- **Caching** - Cache subscription data for frequently accessed customers
- **Background Jobs** - Async processing for billing and reminders
- **Pagination** - For subscription lists with many records

---

## Security Considerations

- **Authentication** - All endpoints protected with `protectedProcedure`
- **Authorization** - User can only access their own subscriptions
- **Input Validation** - Zod schemas prevent injection attacks
- **Audit Trail** - subscription_history table tracks all changes
- **Payment Security** - Billy.dk handles payment processing (PCI compliant)

---

## Næste Skridt og Forbedringer

### **Kort Sigt (Næste Uge)**

1. **Management Review**
   - Presenter analyse og plan
   - Godkend budget (40,000 kr)
   - Prioriter features for MVP
   - Estimated: 2 timer

2. **Design Finalization**
   - Final pricing decisions
   - Plan feature specifications
   - UI/UX mockups
   - Estimated: 4 timer

3. **Database Schema Implementation**
   - Create subscription tables
   - Generate Drizzle migration
   - Test on dev database
   - Estimated: 4 timer

### **Medium Sigt (Næste 2 Uger)**

1. **Backend Development**
   - tRPC router implementation
   - Helper functions
   - Database operations
   - Estimated: 16 timer

2. **Integration Development**
   - Billy.dk monthly invoicing
   - Calendar recurring events
   - Email templates
   - Estimated: 12 timer

3. **Frontend Development**
   - Plan selector component
   - Management dashboard
   - Subscription cards
   - Estimated: 12 timer

### **Lang Sigt (Næste Måned)**

1. **Testing & Beta**
   - Unit tests
   - Integration tests
   - Beta test med 5-10 kunder
   - Estimated: 8 timer

2. **AI Features (Phase 2)**
   - Churn prediction
   - Plan recommendations
   - Usage optimization
   - Estimated: 24 timer

3. **Marketing Launch**
   - Landing page
   - Email campaign
   - Social media
   - Estimated: 8 timer

---

## Technical Debt Status

**Før:**

- 0 subscription-related TODOs

**Efter:**

- 28 TODOs i `SUBSCRIPTION_IMPLEMENTATION_TODOS.md`
- Alle prioriteret (P1/P2/P3)
- Klar til implementation

**Remaining High-Priority TODOs:**

- Database schema (P1)
- tRPC router (P1)
- Billy.dk integration (P1)
- Frontend components (P1)
- Basic testing (P1)

---

## Business Impact

### **Revenue Impact**

**Scenario 1 (Konservativ):**

- 21,100 kr/måned = 253,200 kr/år

**Scenario 2 (Optimistisk):**

- 45,100 kr/måned = 541,200 kr/år

**Churn Reduction:**

- Savings: 63,780 kr/år (fra 15% til 5% churn)

**AI Features (Phase 2):**

- Additional: 723,780 kr/år potential

### **Cost Impact**

**Development:**

- MVP: 40,000 kr (one-time)
- Phase 2 (AI): 40,000 kr (one-time)

**Ongoing:**

- Marketing: 5,000 kr/måned
- Maintenance: 2,000 kr/måned
- AI Infrastructure: 5,000 kr/år

### **ROI**

**MVP:**

- Investment: 40,000 kr
- Annual Revenue: 253,200-541,200 kr
- ROI: 533-1,253% (År 1)
- Payback Period: 3-4 måneder

**With AI Features:**

- Total Investment: 80,000 kr
- Annual Revenue: 976,980-1,264,980 kr
- ROI: 1,121-1,481% (År 1)
- Payback Period: 1 måned

---

## Anbefalinger

### **1. Start med MVP (HØJEST PRIORITET)**

**Rationale:**

- Valider koncept med faktiske kunder
- Lavere risiko (40,000 kr vs. 80,000 kr)
- Hurtigere time-to-market (8 uger vs. 12+ uger)

**Action:**

- Godkend budget denne uge
- Start implementation næste uge
- Beta test måned 2
- Launch måned 3

### **2. Implementer AI Features i Phase 2**

**Rationale:**

- Høj ROI (1,316%)
- Men kræver data fra MVP først
- Bedre at validere grundlæggende funktionalitet først

**Action:**

- Start AI features efter MVP launch
- Brug data fra første 3 måneder
- Iterate baseret på feedback

### **3. Fokus på Churn Reduction**

**Rationale:**

- Største impact (63,780 kr/år)
- Relativt nemt at implementere
- Høj værdi for kunderne

**Action:**

- Implementer churn prediction tidligt
- Proactive customer success
- Loyalty rewards program

---

## Hvad Vil Du Gerne Dykke Ned I?

Jeg kan gå i dybden med:

1. **Implementationsdetaljer** - Specifik kode for en feature
2. **Database Design** - Detaljeret schema design og migrations
3. **API Design** - Complete tRPC endpoint specifications
4. **Frontend Components** - React component implementations
5. **Integration Guide** - Step-by-step integration med Billy.dk og Calendar
6. **Testing Strategy** - Comprehensive test plan
7. **Deployment Guide** - Production deployment steps
8. **AI Features** - Detailed AI implementation plan

---

**Last Updated:** 2025-11-17  
**Next Review:** 2025-11-24  
**Status:** 📋 Ready for Implementation Approval
