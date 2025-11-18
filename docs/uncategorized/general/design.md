# Design Document - CRM Module for Friday AI

## Overview

The CRM Module is an **integrated module within Friday AI** that extends the existing lead intelligence system into a comprehensive customer relationship management platform. It is NOT a separate platform - it lives inside the Friday AI workspace and shares the same database, authentication, and UI framework.

The CRM module provides Friday AI with the necessary customer data and workflows to manage the complete customer lifecycle, from lead capture through service delivery and invoicing, specifically tailored for Rendetalje's cleaning business.

### Design Principles

1. **Integrated Module**: CRM is part of Friday AI, not a separate system - same repo, same database, same auth

1. **Build on Existing Foundation**: Extend current `customer_profiles`, `leads`, and `tasks` tables rather than creating parallel systems
1. **Manual-First, AI-Enhanced**: Core workflows are manual with optional AI assistance (Fase 1: Manual, Fase 2: AI-enhanced)
1. **Mobile-Optimized**: Field worker interface prioritizes mobile usability
1. **Type-Safe**: 100% TypeScript coverage with TRPC for API layer
1. **Performance**: Sub-500ms API responses, optimistic UI updates
1. **Rendetalje-Specific**: Tailored for cleaning business workflows (ejendom-centric, service templates, booking workflows)

## Architecture

### System Architecture Diagram

````text
┌─────────────────────────────────────────────────────────────┐
│              FRIDAY AI WORKSPACE (Single Platform)           │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AI Assistant │  │ Email Center │  │ Smart        │      │
│  │ Panel        │  │ Panel        │  │ Workspace    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │     CRM MODULE (Integrated - Accessible via Nav)    │    │

│  │                                                       │    │
│  │  Routes: /crm/customers, /crm/leads, /crm/bookings  │    │
│  │                                                       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │Customers │ │  Leads   │ │ Bookings │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │Properties│ │ Services │ │Dashboard │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  │                                                       │    │
│  │  Shares: Auth, Database, Components, AI Features    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ TRPC (Type-Safe API)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  CRM Router (server/routers/crm-router.ts)         │    │
│  │  - Customer Management                              │    │

│  │  - Property Management                              │    │

│  │  - Booking Management                               │    │

│  │  - Service Templates                                │    │

│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Existing Routers (Extend)                         │    │
│  │  - friday-leads-router.ts (Lead Intelligence)      │    │

│  │  - customer-router.ts (Customer Profiles)          │    │

│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Integration Services                               │    │
│  │  - Billy Sync (Invoicing)                          │    │

│  │  - Google Calendar (Booking Sync)                  │    │

│  │  - Email Intelligence (Customer Linking)           │    │

│  │  - ChromaDB (Semantic Search)                      │    │

│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Drizzle ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)                  │
│                                                               │
│  Existing Tables (Extend):                                   │
│  - customer_profiles (add fields)                            │

│  - leads (add assignment fields)                             │

│  - tasks (add customer/lead links)                           │

│  - customer_invoices (existing)                              │

│  - calendar_events (existing)                                │

│                                                               │
│  New Tables:                                                  │
│  - customer_properties (ejendomme)                           │

│  - service_templates (cleaning services)                     │

│  - bookings (scheduled services)                             │

│  - customer_notes (activity notes)                           │

└─────────────────────────────────────────────────────────────┘

```bash

### Technology Stack

**Frontend:**

- React 19 with TypeScript

- **100% Custom Apple-Inspired UI Components** (no UI library)

- TailwindCSS for utility styling

- CSS Modules for component-specific styling

- Wouter for routing

- TanStack Query for data fetching

- React Hook Form for forms

- Lucide React for icons (SF Symbols style)

- **Framer Motion** for Apple-style animations

- **GSAP** for advanced scroll-driven animations

- **Lenis** for smooth scrolling

- **@use-gesture/react** for gesture interactions

**Backend:**

- Node.js with TypeScript

- TRPC for type-safe API

- Drizzle ORM for database

- Zod for validation

- PostgreSQL (Supabase)

**Integrations:**

- Billy API (invoicing)

- Google Calendar API

- Gmail API

- ChromaDB (AI/semantic search)

- Claude AI (intelligence)

**Design Philosophy:**

- Apple Human Interface Guidelines (HIG)

- San Francisco font aesthetic (system font stack)

- Frosted glass effects (backdrop-filter)

- Spring-based animations (iOS/macOS style)

- 8pt grid system

- Minimalist, clarity-focused design

## Components and Interfaces

### Frontend Component Structure (Within Friday AI Repo)

```bash
client/src/
├── pages/
│   ├── WorkspaceLayout.tsx           # EXISTING: Main 3-panel layout
│   ├── LeadsDemoPage.tsx             # EXISTING: Lead intelligence demo
│   └── crm/                          # NEW: CRM module pages
│       ├── CRMDashboard.tsx          # Main dashboard with metrics
│       ├── CustomerManagement.tsx     # Customer list and search
│       ├── CustomerProfile.tsx        # Detailed customer view
│       ├── LeadManagement.tsx         # Lead pipeline view
│       ├── BookingCalendar.tsx        # Booking schedule
│       ├── ServiceTemplates.tsx       # Service configuration
│       └── MobileFieldWorker.tsx      # Mobile-optimized interface
│
├── components/
│   ├── leads/                        # EXISTING: Lead components
│   │   └── CustomerCard.tsx          # EXISTING: Basic customer card
│   └── crm/                          # NEW: Extended CRM components
│       ├── CustomerCard.tsx           # Extended customer summary card
│       ├── PropertyCard.tsx           # Property details card
│       ├── BookingCard.tsx            # Booking summary card
│       ├── ServiceTemplateCard.tsx    # Service template card
│       ├── LeadCard.tsx               # Lead summary card
│       ├── CustomerForm.tsx           # Create/edit customer
│       ├── PropertyForm.tsx           # Create/edit property
│       ├── BookingForm.tsx            # Create/edit booking
│       ├── ServiceTemplateForm.tsx    # Create/edit service
│       ├── CustomerTimeline.tsx       # Activity timeline
│       ├── CustomerNotes.tsx          # Notes interface
│       ├── CustomerStats.tsx          # Financial metrics
│       ├── StatusBadge.tsx            # Status indicator
│       ├── PriorityBadge.tsx          # Priority indicator
│       └── CRMFilters.tsx             # Search and filter UI
│
└── hooks/
    └── crm/                          # NEW: CRM-specific hooks
        ├── useCustomers.ts            # Customer data hooks
        ├── useProperties.ts           # Property data hooks
        ├── useBookings.ts             # Booking data hooks
        ├── useServiceTemplates.ts     # Service template hooks
        ├── useCRMStats.ts             # Dashboard stats hooks
        └── useCRMFilters.ts           # Filter state management

```text

### Backend Router Structure (Within Friday AI Repo)

```text
server/
├── routers/
│   ├── friday-leads-router.ts         # EXISTING: Lead intelligence (extend)
│   ├── customer-router.ts             # EXISTING: Customer profiles (extend)
│   └── crm-router.ts                  # NEW: CRM-specific endpoints
│
├── modules/
│   └── crm/                          # NEW: CRM business logic
│       ├── customer-service.ts        # Customer management
│       ├── property-service.ts        # Property management
│       ├── booking-service.ts         # Booking workflows
│       ├── service-template-service.ts # Template management
│       └── crm-analytics.ts           # Dashboard metrics
│
├── integrations/
│   ├── billy.ts                      # EXISTING: Billy API (extend)
│   ├── google-api.ts                 # EXISTING: Google Calendar (extend)
│   └── email-customer-link.ts        # NEW: Auto-link emails to customers
│
└── db.ts                             # EXISTING: Database connection (shared)

```text

### Key TypeScript Interfaces

```typescript
// Customer Profile (extends existing)
interface CustomerProfile {
  id: number;
  userId: number;
  leadId?: number;
  email: string;
  name?: string;
  phone?: string;
  status: "new" | "active" | "inactive" | "vip" | "at_risk";
  tags: string[];
  customerType: "private" | "business";
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  invoiceCount: number;
  emailCount: number;
  aiResume?: string;
  lastContactDate?: Date;
  lastSyncDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Property (NEW)
interface CustomerProperty {
  id: number;
  customerProfileId: number;
  address: string;
  city?: string;
  postalCode?: string;
  coordinates?: { lat: number; lng: number };
  isPrimary: boolean;
  attributes?: {
    type?: "villa" | "lejlighed" | "kontor" | "sommerhus";
    size?: number; // m²
    floors?: number;
    accessCode?: string;
    parkingInfo?: string;
    specialRequirements?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service Template (NEW)
interface ServiceTemplate {
  id: number;
  userId: number;
  title: string;
  description?: string;
  category:
    | "general"
    | "vinduespolering"
    | "facaderens"
    | "tagrens"
    | "graffiti"
    | "other";
  durationMinutes: number;
  priceDkk: number;
  isActive: boolean;
  metadata?: {
    materials?: string[];
    checklist?: string[];
    photoRequirements?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Booking (NEW)
interface Booking {
  id: number;
  userId: number;
  customerProfileId: number;
  propertyId?: number;
  serviceTemplateId?: number;
  title?: string;
  notes?: string;
  scheduledStart: Date;
  scheduledEnd?: Date;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  assigneeUserId?: number;
  metadata?: {
    actualStart?: Date;
    actualEnd?: Date;
    photos?: Array<{ url: string; label: string; timestamp: Date }>;
    materials?: Array<{ name: string; quantity: number }>;
    completionNotes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Lead Assignment (extends existing)
interface Lead {
  id: number;
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  source?: string;
  notes?: string;
  lastContactedAt?: Date;
  score: number;
  metadata?: any;
  // NEW fields:
  assignedTo?: string;
  assignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// CRM Dashboard Stats
interface CRMDashboardStats {
  customers: {
    total: number;
    active: number;
    vip: number;
    atRisk: number;
    new: number;
  };
  financial: {
    totalRevenue: number;
    paidRevenue: number;
    outstandingBalance: number;
    avgInvoiceAmount: number;
  };
  bookings: {
    planned: number;
    inProgress: number;
    completedThisMonth: number;
    completedThisWeek: number;
  };
  leads: {
    total: number;
    qualified: number;
    conversionRate: number;
  };
}

```text

## Data Models

### Database Schema Extensions

```sql
-- Extend existing leads table

ALTER TABLE friday_ai.leads
ADD COLUMN assigned_to TEXT,
ADD COLUMN assigned_at TIMESTAMP;

-- Extend existing customer_profiles table

ALTER TABLE friday_ai.customer_profiles
ADD COLUMN preferred_times JSONB,
ADD COLUMN special_requests TEXT;

-- New: customer_properties table (already exists in schema)
-- See drizzle/schema.ts: customerPropertiesInFridayAi

-- New: service_templates table (already exists in schema)
-- See drizzle/schema.ts: serviceTemplatesInFridayAi

-- New: bookings table (already exists in schema)
-- See drizzle/schema.ts: bookingsInFridayAi

-- New: customer_notes table (already exists in schema)
-- See drizzle/schema.ts: customerNotesInFridayAi

-- Indexes for performance

CREATE INDEX idx_bookings_scheduled_start ON friday_ai.bookings(scheduled_start);
CREATE INDEX idx_bookings_assignee ON friday_ai.bookings(assignee_user_id);
CREATE INDEX idx_customer_properties_customer ON friday_ai.customer_properties(customer_profile_id);
CREATE INDEX idx_service_templates_category ON friday_ai.service_templates(category);

```text

### Data Relationships

```text
users (existing)
  ├── customer_profiles (existing, extend)
  │   ├── customer_properties (NEW)
  │   ├── bookings (NEW)
  │   ├── customer_notes (existing)
  │   ├── customer_invoices (existing)
  │   └── customer_emails (existing)
  │
  ├── leads (existing, extend)
  │   └── customer_profiles (conversion link)
  │
  ├── service_templates (NEW)
  │   └── bookings (template reference)
  │
  ├── bookings (NEW)
  │   ├── customer_profiles (customer link)
  │   ├── customer_properties (property link)
  │   ├── service_templates (template link)
  │   └── users (assignee link)
  │
  └── tasks (existing, extend)
      ├── customer_profiles (customer link)
      └── leads (lead link)

```text

## Error Handling

### Error Categories

1. **Validation Errors**: Invalid input data (400 Bad Request)
1. **Authentication Errors**: Missing or invalid JWT (401 Unauthorized)
1. **Authorization Errors**: Insufficient permissions (403 Forbidden)
1. **Not Found Errors**: Resource doesn't exist (404 Not Found)
1. **Conflict Errors**: Duplicate or conflicting data (409 Conflict)
1. **Integration Errors**: External API failures (502 Bad Gateway)
1. **Database Errors**: Query failures (500 Internal Server Error)

### Error Handling Strategy

```typescript
// TRPC Error Handling
import { TRPCError } from "@trpc/server";

// Example: Customer not found
throw new TRPCError({
  code: "NOT_FOUND",
  message: "Customer not found",
  cause: { customerId },
});

// Example: Validation error
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Invalid email format",
  cause: { field: "email", value: input.email },
});

// Example: Permission denied
throw new TRPCError({
  code: "FORBIDDEN",
  message: "You do not have permission to edit this customer",
  cause: { customerId, userId },
});

```text

### Frontend Error Display

```typescript
// React Query error handling
const { data, error, isError } = useQuery({
  queryKey: ["customer", customerId],
  queryFn: () => trpc.crm.getCustomer.query({ customerId }),
  onError: error => {
    toast.error(error.message);
  },
});

// Form validation errors
const form = useForm({
  resolver: zodResolver(customerSchema),
  onError: errors => {
    Object.entries(errors).forEach(([field, error]) => {
      toast.error(`${field}: ${error.message}`);
    });
  },
});

```text

### Retry Logic

```typescript
// Automatic retry for transient errors
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (
          error.data?.code === "BAD_REQUEST" ||
          error.data?.code === "NOT_FOUND"
        ) {
          return false;
        }
        // Retry up to 3 times for 5xx errors
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 *2** attemptIndex, 30000),

    },
  },
});

```text

## Testing Strategy

### Unit Tests

**Backend (Vitest):**

```typescript
// server/modules/crm/__tests__/customer-service.test.ts
describe("CustomerService", () => {
  it("should create customer profile", async () => {
    const customer = await CustomerService.createCustomer({
      userId: 1,
      email: "<test@example.com>",
      name: "Test Customer",
    });
    expect(customer.id).toBeDefined();
    expect(customer.status).toBe("new");
  });

  it("should update customer status to vip when revenue exceeds threshold", async () => {
    const customer = await CustomerService.updateCustomerFinancials({
      customerId: 1,
      totalInvoiced: 60000,
    });
    expect(customer.status).toBe("vip");
  });
});

```text

**Frontend (Vitest + React Testing Library):**

```typescript
// client/src/components/crm/__tests__/CustomerCard.test.tsx
describe('CustomerCard', () => {
  it('should display customer name and status', () => {
    const customer = {
      id: 1,
      name: 'Test Customer',
      status: 'active',
      email: '<test@example.com>'
    };
    render(<CustomerCard customer={customer} />);
    expect(screen.getByText('Test Customer')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(<CustomerCard customer={mockCustomer} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockCustomer);
  });
});

```bash

### Integration Tests

**API Integration (Playwright):**

```typescript
// tests/crm/customer-management.spec.ts
test("should create and view customer", async ({ page }) => {
  await page.goto("/crm/customers");
  await page.click('button:has-text("Ny Kunde")');
  await page.fill('input[name="name"]', "Test Customer");
  await page.fill('input[name="email"]', "<test@example.com>");
  await page.click('button:has-text("Gem")');

  await expect(page.locator("text=Test Customer")).toBeVisible();
});

test("should assign lead to user", async ({ page }) => {
  await page.goto("/crm/leads");
  await page.click('[data-testid="lead-1"]');
  await page.click('button:has-text("Assign")');
  await page.selectOption('select[name="assignee"]', "user-2");
  await page.click('button:has-text("Confirm")');

  await expect(page.locator("text=Assigned to")).toBeVisible();
});

```text

### E2E Tests

**Complete Workflows:**

```typescript
// tests/crm/booking-workflow.spec.ts
test("complete booking workflow", async ({ page }) => {
  // 1. Create customer
  await createCustomer(page, { name: "Test Customer" });

  // 2. Add property
  await addProperty(page, { address: "Test Address 123" });

  // 3. Create booking
  await createBooking(page, {
    serviceTemplate: "Grundrengøring",
    date: "2025-12-01",
  });

  // 4. Assign to field worker
  await assignBooking(page, { worker: "Field Worker 1" });

  // 5. Complete booking
  await completeBooking(page, { photos: 3 });

  // 6. Verify invoice created
  await expect(page.locator("text=Invoice created")).toBeVisible();
});

```text

### Performance Tests

**Load Testing:**

```typescript
// tests/performance/crm-load.test.ts
test("should handle 100 concurrent customer queries", async () => {
  const promises = Array.from({ length: 100 }, (_, i) =>
    trpc.crm.getCustomer.query({ customerId: i + 1 })

  );

  const start = Date.now();
  await Promise.all(promises);
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(5000); // 5 seconds for 100 queries
});

```text

## Performance Considerations

### Database Optimization

1. **Indexes**: Add indexes on frequently queried fields
   - `customer_profiles.email`

   - `customer_profiles.status`

   - `bookings.scheduled_start`

   - `bookings.assignee_user_id`

1. **Query Optimization**:
   - Use `select()` to fetch only needed fields

   - Implement pagination (50 records per page)

   - Use database-level aggregations for stats

1. **Caching Strategy**:
   - TanStack Query cache (5 minutes stale time)

   - Redis cache for dashboard stats (1 minute TTL)

   - Service worker cache for mobile offline support

### Frontend Optimization

1. **Code Splitting**:
   - Lazy load CRM pages

   - Dynamic imports for heavy components

1. **Memoization**:
   - `useMemo` for expensive calculations

   - `React.memo` for pure components

   - `useCallback` for event handlers

1. **Virtual Scrolling**:
   - Implement for customer lists > 100 items

   - Use `react-window` or `react-virtual`

1. **Optimistic Updates**:
   - Update UI immediately on mutations

   - Rollback on error

### API Performance

1. **Batch Requests**:
   - TRPC batch link for multiple queries

   - Combine related data fetches

1. **Response Compression**:
   - Enable gzip compression

   - Minimize JSON payload size

1. **Rate Limiting**:
   - 100 requests per minute per user

   - Exponential backoff on rate limit

## Security Considerations

### Authentication & Authorization

1. **JWT Validation**: All CRM endpoints require valid JWT
1. **Role-Based Access**: Admin vs User permissions
1. **Row-Level Security**: Users can only access their own data

### Data Protection

1. **Input Validation**: Zod schemas for all inputs
1. **SQL Injection Prevention**: Drizzle ORM parameterized queries
1. **XSS Prevention**: DOMPurify for user-generated content
1. **CSRF Protection**: SameSite cookies

### Audit Logging

```typescript
// Log all CRM mutations
await db.insert(auditLogs).values({
  userId: ctx.user.id,
  action: "UPDATE_CUSTOMER",
  entityType: "customer_profile",
  entityId: customerId,
  details: { changes: diff },
  ipAddress: ctx.req.ip,
  userAgent: ctx.req.headers["user-agent"],
});

```text

## Integration Points

### Billy Integration

**Invoice Creation from Booking:**

```typescript
async function createInvoiceFromBooking(booking: Booking) {
  const customer = await getCustomerProfile(booking.customerProfileId);
  const serviceTemplate = await getServiceTemplate(booking.serviceTemplateId);

  // Create invoice in Billy
  const billyInvoice = await billyApi.createInvoice({
    contactId: customer.billyCustomerId,
    lines: [
      {
        description: serviceTemplate.title,
        unitPrice: serviceTemplate.priceDkk,
        quantity: 1,
      },
    ],
  });

  // Store invoice reference
  await db.insert(customerInvoices).values({
    userId: booking.userId,
    customerId: customer.id,
    billyInvoiceId: billyInvoice.id,
    amount: serviceTemplate.priceDkk,
    status: "draft",
  });
}

```text

### Google Calendar Integration

**Sync Booking to Calendar:**

```typescript
async function syncBookingToCalendar(booking: Booking) {
  const customer = await getCustomerProfile(booking.customerProfileId);
  const property = booking.propertyId
    ? await getProperty(booking.propertyId)
    : null;

  const event = await googleCalendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `${booking.title} - ${customer.name}`,

      description: booking.notes,
      location: property?.address,
      start: { dateTime: booking.scheduledStart.toISOString() },
      end: { dateTime: booking.scheduledEnd.toISOString() },
      attendees: [{ email: customer.email }],
    },
  });

  // Store calendar event reference
  await db.insert(calendarEvents).values({
    userId: booking.userId,
    googleEventId: event.id,
    title: booking.title,
    startTime: booking.scheduledStart,
    endTime: booking.scheduledEnd,
  });
}

```text

### Email Intelligence Integration

**Auto-Link Emails to Customers:**

```typescript
async function linkEmailToCustomer(email: Email) {
  // Find customer by email address
  const customer = await db
    .select()
    .from(customerProfiles)
    .where(eq(customerProfiles.email, email.fromEmail))
    .limit(1);

  if (customer.length > 0) {
    // Link email to customer
    await db
      .update(emails)
      .set({ customerId: customer[0].id })
      .where(eq(emails.id, email.id));

    // Update customer email count
    await db
      .update(customerProfiles)
      .set({
        emailCount: sql`${customerProfiles.emailCount} + 1`,

        lastContactDate: new Date(),
      })
      .where(eq(customerProfiles.id, customer[0].id));
  }
}

```text

## Deployment Strategy

### Phase 1: Foundation (Week 1-2)

- CRM router and basic endpoints

- Customer management UI

- Property management UI

- Database migrations

### Phase 2: Core Features (Week 3-4)

- Service templates

- Booking management

- Lead assignment

- Dashboard

### Phase 3: Integration (Week 5-6)

- Billy invoice automation

- Calendar sync

- Email linking

- Mobile interface

### Phase 4: Enhancement (Week 7-8)

- AI insights

- Offline support

- Performance optimization

- Testing and polish

## Monitoring and Observability

### Metrics to Track

1. **Performance Metrics**:
   - API response times (p50, p95, p99)

   - Database query times

   - Frontend render times

1. **Business Metrics**:
   - Customer creation rate

   - Booking completion rate

   - Invoice generation rate

   - Lead conversion rate

1. **Error Metrics**:
   - Error rate by endpoint

   - Failed integrations

   - User-reported issues

### Logging Strategy

```typescript
// Structured logging with Pino
logger.info(
  {
    action: "CREATE_BOOKING",
    userId: ctx.user.id,
    customerId: booking.customerProfileId,
    bookingId: booking.id,
    duration: Date.now() - startTime,

  },
  "Booking created successfully"
);

```text

## Future Enhancements

### Phase 5+ (Post-MVP)

1. **Advanced Analytics**:
   - Customer lifetime value prediction

   - Churn risk scoring

   - Revenue forecasting

1. **Automation**:
   - Automatic booking reminders

   - Smart scheduling suggestions

   - Predictive maintenance alerts

1. **Mobile App**:
   - Native iOS/Android apps

   - Offline-first architecture

   - Push notifications

1. **Team Collaboration**:
   - Internal messaging

   - Task assignment workflows

   - Team performance dashboards

1. **Customer Portal**:
   - Self-service booking

   - Invoice viewing

   - Service history

## Design Decisions and Rationale

### Why Extend Existing Tables

**Decision**: Extend `customer_profiles` and `leads` rather than create new tables.

**Rationale**:

- Maintains data consistency

- Leverages existing relationships

- Reduces migration complexity

- Preserves historical data

### Why Manual-First Approach

**Decision**: Core workflows are manual with optional AI assistance.

**Rationale**:

- Builds user trust gradually

- Allows validation of AI suggestions

- Reduces risk of automation errors

- Easier to debug and maintain

### Why TRPC Over REST

**Decision**: Use TRPC for all new CRM endpoints.

**Rationale**:

- Type safety end-to-end

- Automatic TypeScript inference

- Better developer experience

- Consistent with existing architecture

### Why Mobile-Optimized Over Native App

**Decision**: Build mobile-optimized web interface first.

**Rationale**:

- Faster time to market

- Single codebase to maintain

- Progressive Web App capabilities

- Easier updates and deployment

## Conclusion

This design provides a comprehensive, scalable CRM module that integrates seamlessly with Friday AI's existing architecture. The manual-first approach with optional AI enhancement ensures user trust while leveraging the platform's AI capabilities. The mobile-optimized interface addresses field worker needs, and the integration with Billy and Google Calendar streamlines business operations.

The design prioritizes:

- **Type safety** through TypeScript and TRPC

- **Performance** through caching and optimization

- **Maintainability** through clear separation of concerns

- **Scalability** through efficient database design

- **User experience** through responsive, intuitive interfaces

Next steps: Review this design document and proceed to implementation task breakdown.

## Deployment Strategy

### Fase 1: Manual CRM Foundation (Måned 1 - December 2025)

**Scope**: Core CRUD operations, manual workflows, no AI

- Week 1-2: CRM router, database extensions, basic UI

- Week 3-4: Customer/Property/Lead management, service templates

- **Milestone**: Manual CRM workflows functional

- **Deployment**: Same Friday AI deployment, feature flag controlled

### Fase 2: Rendetalje Customization (Måned 2 - Januar 2026)

**Scope**: Booking system, mobile interface, workflow polish

- Week 5-6: Booking management, calendar integration

- Week 7-8: Mobile field worker interface, task workflows

- **Milestone**: Complete booking-to-invoice workflow

- **Deployment**: Incremental rollout within Friday AI

### Fase 3: Integration & Intelligence (Måned 3 - Februar 2026)

**Scope**: External integrations, basic AI assistance (opt-in)

- Week 9-10: Billy automation, email linking

- Week 11-12: AI suggestions (feature flagged), basic reporting

- **Milestone**: Integrated CRM with optional AI assistance

- **Deployment**: Gradual AI feature enablement

### Fase 4: Optimization & Launch (Måned 4 - Marts 2026)

**Scope**: Performance, testing, production launch

- Week 13-14: Performance tuning, comprehensive testing

- Week 15-16: User training, production deployment, monitoring

- **Milestone**: Production-ready CRM module

- **Deployment**: Full production launch within Friday AI

**Important**: All phases deploy within the same Friday AI application - no separate deployments or infrastructure needed. CRM is accessed via Friday AI navigation (/crm/\* routes).

## CRM Module Integration Points

### Navigation Integration

CRM module is accessible through Friday AI's main navigation:

```typescript
// client/src/pages/WorkspaceLayout.tsx
const navigationItems = [
  // Existing items
  { icon: Bot, label: "AI Assistant", path: "/" },
  { icon: Mail, label: "Email Center", path: "/email" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },

  // NEW: CRM Navigation
  { icon: Users, label: "Kunder", path: "/crm/customers" },
  { icon: Target, label: "Leads", path: "/crm/leads" },
  { icon: Calendar, label: "Bookings", path: "/crm/bookings" },
  { icon: BarChart, label: "CRM Dashboard", path: "/crm/dashboard" },
];

```text

### Data Sharing

CRM module shares all data with Friday AI:

- **Same Database**: All CRM tables in same PostgreSQL database

- **Same Auth**: JWT authentication shared across all modules

- **Same API**: TRPC router extended with CRM endpoints

- **Same Components**: Shadcn/ui components reused throughout

### AI Integration

CRM leverages Friday AI's existing AI capabilities:

- **ChromaDB**: Semantic search for customer intelligence

- **Claude**: AI-generated customer insights and suggestions

- **Lead Intelligence**: Existing lead scoring and analysis

- **Email Intelligence**: Auto-linking emails to customers

## Conclusion

This design provides a comprehensive, scalable CRM module that is **fully integrated within Friday AI** as a native module, not a separate platform. The manual-first approach with optional AI enhancement ensures user trust while leveraging Friday AI's AI capabilities. The mobile-optimized interface addresses field worker needs, and the integration with Billy and Google Calendar streamlines business operations.

The design prioritizes:

- **Integration**: CRM is part of Friday AI, sharing all infrastructure

- **Type safety**: Through TypeScript and TRPC

- **Performance**: Through caching and optimization

- **Maintainability**: Through clear separation of concerns

- **Scalability**: Through efficient database design

- **User experience**: Through responsive, intuitive interfaces

- **Rendetalje-Specific**: Ejendom-centric, service templates, booking workflows

**Key Architectural Decision**: CRM is developed in the same repository as Friday AI (`tekup-ai-v2`), extending existing tables and routers rather than creating a separate system. This ensures zero integration overhead, seamless data sharing, and optimal maintainability.

Next steps: Review this design document and proceed to implementation task breakdown.

## Backend Status - ALREADY IMPLEMENTED ✅

**IMPORTANT**: The CRM backend is **ALREADY FULLY IMPLEMENTED**. The following routers exist and are functional:

- ✅ `server/routers/crm-customer-router.ts` - Customer profiles & properties CRUD

- ✅ `server/routers/crm-lead-router.ts` - Lead management & conversion

- ✅ `server/routers/crm-booking-router.ts` - Booking management

- ✅ `drizzle/schema.ts` - Complete database schema (customer_properties, service_templates, bookings)

- ✅ `server/__tests__/crm-smoke.test.ts` - Backend tests passing

**This spec focuses EXCLUSIVELY on FRONTEND/UI implementation** to connect to the existing backend APIs.

### Available Backend Endpoints

**Customer Router** (`crm.customer.*`):

- `listProfiles({ search?, limit?, offset? })` - List customer profiles

- `getProfile({ id })` - Get single profile

- `listProperties({ customerProfileId })` - List properties for customer

- `createProperty({ customerProfileId, address, ... })` - Create property

- `updateProperty({ id, address?, ... })` - Update property

- `deleteProperty({ id })` - Delete property

**Lead Router** (`crm.lead.*`):

- `listLeads({ status?, limit?, offset? })` - List leads

- `getLead({ id })` - Get single lead

- `updateLeadStatus({ id, status })` - Update lead status

- `convertLeadToCustomer({ id })` - Convert lead to customer profile

**Booking Router** (`crm.booking.*`):

- `listBookings({ customerProfileId?, start?, end?, limit?, offset? })` - List bookings

- `createBooking({ customerProfileId, scheduledStart, ... })` - Create booking

- `updateBookingStatus({ id, status })` - Update booking status

- `deleteBooking({ id })` - Delete booking

**Implementation tasks will focus on building React components and pages that consume these existing endpoints.**

## UI Component Library - CRM Specific Components

This section details all UI components needed for the CRM module, organized by category. All components use Shadcn/ui as the base library.

### 🧱 **1. Struktur og Layout**

#### **Container / Card Components**

- `CustomerCard` - Displays customer summary with status, tags, and quick actions

- `PropertyCard` - Shows property details (address, type, access codes)

- `BookingCard` - Booking summary with date, status, and customer info

- `ServiceTemplateCard` - Service template with price, duration, category

- `LeadCard` - Lead information with score and status

- `DashboardWidget` - KPI card for dashboard metrics

#### **Grid / Stack / Flex Layouts**

- `CustomerGrid` - Grid layout for customer cards (responsive: 1/2/3 columns)

- `PropertyList` - Vertical stack of property cards

- `BookingCalendarGrid` - Calendar grid view for bookings

- `DashboardGrid` - Dashboard widget grid (2x2, 3x2 layouts)

#### **Section / Panel Components**

- `CRMSidebar` - Left navigation panel for CRM sections

- `CustomerProfilePanel` - Right panel showing detailed customer info

- `FilterPanel` - Collapsible filter sidebar

- `QuickActionsPanel` - Floating action panel

#### **Tabs**

- `CustomerProfileTabs` - Tabs for Overview, Properties, Bookings, Invoices, Notes

- `CRMDashboardTabs` - Tabs for different dashboard views

- `LeadPipelineTabs` - Tabs for lead stages (New, Contacted, Qualified, etc.)

#### **Accordion**

- `PropertyDetailsAccordion` - Expandable property details

- `BookingHistoryAccordion` - Collapsible booking history

- `CustomerNotesAccordion` - Expandable notes section

---

### 🖊 **2. Input og Formularer**

#### **Button Components**

- `PrimaryButton` - Main actions (Save, Create, Confirm)

- `SecondaryButton` - Secondary actions (Cancel, Back)

- `IconButton` - Icon-only buttons (Edit, Delete, More)

- `ActionButton` - Quick action buttons (Call, Email, Book)

#### **TextField / Input / TextArea**

- `CustomerNameInput` - Text input for customer name

- `EmailInput` - Email input with validation

- `PhoneInput` - Phone number input with formatting

- `AddressInput` - Multi-line address input

- `NotesTextArea` - Large text area for notes

- `SearchInput` - Search bar with icon

#### **Select / Dropdown**

- `StatusSelect` - Dropdown for customer status (new, active, vip, at_risk)

- `CustomerTypeSelect` - Dropdown for customer type (private, business)

- `ServiceCategorySelect` - Service category dropdown

- `PropertyTypeSelect` - Property type dropdown (villa, lejlighed, kontor)

- `LeadStatusSelect` - Lead status dropdown

- `BookingStatusSelect` - Booking status dropdown

#### **Checkbox / Radio**

- `TagCheckboxGroup` - Multiple tag selection

- `PropertyPrimaryRadio` - Select primary property

- `ServiceOptionsCheckbox` - Service options selection

#### **Slider / Switch / Toggle**

- `PriceRangeSlider` - Filter by price range

- `ActiveToggle` - Toggle service template active/inactive

- `NotificationSwitch` - Enable/disable notifications

#### **DatePicker / TimePicker**

- `BookingDatePicker` - Select booking date

- `BookingTimePicker` - Select booking time

- `DateRangePicker` - Filter by date range

- `LastContactDatePicker` - Set last contact date

#### **FileUpload**

- `PropertyPhotoUpload` - Upload property photos

- `BookingPhotoUpload` - Upload before/after photos

- `DocumentUpload` - Upload customer documents

---

### 💬 **3. Dialog og Feedback**

#### **Modal / Dialog**

- `CustomerFormModal` - Create/edit customer modal

- `PropertyFormModal` - Create/edit property modal

- `BookingFormModal` - Create/edit booking modal

- `ServiceTemplateFormModal` - Create/edit service template modal

- `LeadConversionModal` - Convert lead to customer modal

- `DeleteConfirmModal` - Confirm delete action

- `AssignLeadModal` - Assign lead to user modal

#### **Drawer / Sidebar**

- `CustomerProfileDrawer` - Slide-in customer details (840px width)

- `FilterDrawer` - Slide-in filter options

- `NotificationDrawer` - Slide-in notifications

- `QuickActionsDrawer` - Mobile quick actions drawer

#### **Toast / Snackbar**

- `SuccessToast` - Success message (green)

- `ErrorToast` - Error message (red)

- `InfoToast` - Information message (blue)

- `WarningToast` - Warning message (yellow)

- `LoadingToast` - Loading indicator toast

#### **Alert / Confirm / Prompt**

- `DeleteAlert` - Confirm delete with warning

- `UnsavedChangesAlert` - Warn about unsaved changes

- `ConversionConfirm` - Confirm lead conversion

- `StatusChangeAlert` - Confirm status change

#### **Tooltip**

- `StatusTooltip` - Explain status meanings

- `IconTooltip` - Explain icon actions

- `MetricTooltip` - Show metric details

- `ShortcutTooltip` - Show keyboard shortcuts

#### **Popover / Menu**

- `CustomerActionsMenu` - Context menu for customer actions

- `BookingActionsMenu` - Context menu for booking actions

- `MoreOptionsPopover` - Three-dot menu

- `FilterPopover` - Quick filter popover

---

### 📑 **4. Data-visning**

#### **Table / DataGrid**

- `CustomersTable` - Sortable, filterable customer table

- `BookingsTable` - Booking list with date sorting

- `InvoicesTable` - Invoice list with status

- `PropertiesTable` - Property list for customer

#### **List / ListItem**

- `CustomerList` - Vertical list of customer cards

- `LeadList` - Lead pipeline list

- `BookingList` - Chronological booking list

- `ActivityList` - Customer activity timeline

- `NotesList` - Customer notes list

#### **Card** (Detailed)

- `CustomerCard` - Shows: name, email, phone, status badge, tags, quick actions

- `PropertyCard` - Shows: address, type icon, access code, primary badge

- `BookingCard` - Shows: date, time, customer name, status, assigned worker

- `ServiceTemplateCard` - Shows: title, category, price, duration, active toggle

- `LeadCard` - Shows: name, score, status, source, last contacted

#### **Badge / Chip / Tag**

- `StatusBadge` - Color-coded status (new=blue, active=green, vip=gold, at_risk=red)

- `PriorityBadge` - Priority indicator (low, medium, high, urgent)

- `TagChip` - Removable tag chip

- `CategoryBadge` - Service category badge

- `ScoreBadge` - Lead score badge (0-100)

#### **Avatar / Icon / Image**

- `CustomerAvatar` - Customer initials or photo

- `PropertyIcon` - Property type icon (villa, lejlighed, etc.)

- `ServiceIcon` - Service category icon

- `StatusIcon` - Status indicator icon

#### **Chart / Graph**

- `RevenueChart` - Line chart for revenue over time

- `BookingChart` - Bar chart for bookings per month

- `LeadConversionFunnel` - Funnel chart for lead pipeline

- `CustomerGrowthChart` - Area chart for customer growth

- `ServiceDistributionPie` - Pie chart for service types

---

### 🧭 **5. Navigation**

#### **Navbar / Header**

- `CRMHeader` - Top navigation with breadcrumbs

- `CRMNavbar` - Main CRM navigation bar

- `UserMenu` - User profile dropdown in header

#### **Sidebar / Menu / Drawer**

- `CRMSidebar` - Left sidebar with CRM sections:

  - Dashboard

  - Kunder (Customers)

  - Leads

  - Bookings

  - Service Templates

  - Reports

- `MobileCRMMenu` - Mobile hamburger menu

#### **Breadcrumbs**

- `CRMBreadcrumbs` - Shows: CRM > Kunder > [Customer Name]

- `NavigationBreadcrumbs` - Shows current location in app

#### **Pagination**

- `CustomerPagination` - Paginate customer list (50 per page)

- `BookingPagination` - Paginate booking list

- `TablePagination` - Generic table pagination

#### **Stepper / Wizard**

- `BookingWizard` - Multi-step booking creation:

  1. Select Customer
  1. Select Property
  1. Select Service
  1. Set Date/Time
  1. Confirm

- `LeadConversionWizard` - Lead to customer conversion steps

---

### ⚙️ **6. Avancerede Interaktive Komponenter**

#### **SearchBar / Filter / Sort**

- `CustomerSearchBar` - Search by name, email, phone

- `CRMFilters` - Multi-filter component:

  - Status filter

  - Tag filter

  - Date range filter

  - Customer type filter

- `SortDropdown` - Sort by: name, date, revenue, status

#### **ModalForm / WizardDialog**

- `CustomerFormModal` - Full customer form in modal

- `BookingWizardModal` - Step-by-step booking creation

- `PropertyFormModal` - Property details form

#### **Dashboard Widgets / KPI Cards**

- `TotalCustomersWidget` - Shows total customer count

- `ActiveCustomersWidget` - Shows active customers

- `VIPCustomersWidget` - Shows VIP customers

- `RevenueWidget` - Shows total revenue

- `BookingsThisMonthWidget` - Shows monthly bookings

- `LeadConversionWidget` - Shows conversion rate

#### **Kanban / Drag-and-Drop Boards**

- `LeadPipelineBoard` - Kanban board for lead stages:

  - New

  - Contacted

  - Qualified

  - Proposal

  - Won

  - Lost

- `BookingStatusBoard` - Kanban for booking status:

  - Planned

  - In Progress

  - Completed

  - Cancelled

---

## UI Component Specifications

### Component Design Patterns

#### **1. CustomerCard Component**

```typescript
interface CustomerCardProps {
  customer: CustomerProfile;
  onEdit?: (customer: CustomerProfile) => void;
  onView?: (customer: CustomerProfile) => void;
  onDelete?: (customer: CustomerProfile) => void;
  compact?: boolean;
}

// Visual Structure:
// ┌─────────────────────────────────────┐
// │ [Avatar] Name              [Status] │
// │          <email@example.com>          │
// │          +45 12 34 56 78            │
// │                                     │
// │ [Tag1] [Tag2] [Tag3]               │
// │                                     │
// │ Revenue: 25.000 kr | Bookings: 12  │
// │                                     │
// │ [Edit] [View] [More ▼]             │
// └─────────────────────────────────────┘

```text

#### **2. BookingFormModal Component**

```typescript
interface BookingFormModalProps {
  open: boolean;
  onClose: () => void;
  customerId?: number;
  propertyId?: number;
  onSuccess?: (booking: Booking) => void;
}

// Modal Structure:
// ┌─────────────────────────────────────┐
// │ Opret Booking                  [X]  │
// ├─────────────────────────────────────┤
// │                                     │
// │ Kunde: [Select Customer ▼]         │
// │ Ejendom: [Select Property ▼]       │
// │ Service: [Select Template ▼]       │
// │                                     │
// │ Dato: [DatePicker]                 │
// │ Tid: [TimePicker]                  │
// │                                     │
// │ Noter: [TextArea]                  │
// │                                     │
// │        [Annuller] [Opret Booking]  │
// └─────────────────────────────────────┘

```text

#### **3. LeadPipelineBoard Component**

```typescript
interface LeadPipelineBoardProps {
  leads: Lead[];
  onLeadMove: (leadId: number, newStatus: LeadStatus) => void;
  onLeadClick: (lead: Lead) => void;
}

// Kanban Structure:
// ┌──────┬──────┬──────┬──────┬──────┬──────┐
// │ New  │Contact│Qualif│Propos│ Won  │ Lost │
// │ (5)  │ (3)  │ (2)  │ (1)  │ (8)  │ (2)  │
// ├──────┼──────┼──────┼──────┼──────┼──────┤
// │[Lead]│[Lead]│[Lead]│[Lead]│[Lead]│[Lead]│
// │[Lead]│[Lead]│[Lead]│      │[Lead]│[Lead]│
// │[Lead]│[Lead]│      │      │[Lead]│      │
// │[Lead]│      │      │      │[Lead]│      │
// │[Lead]│      │      │      │[Lead]│      │
// └──────┴──────┴──────┴──────┴──────┴──────┘

```text

#### **4. CRMDashboard Layout**

```typescript
// Dashboard Grid Layout:
// ┌─────────────────────────────────────────────────┐
// │ CRM Dashboard                                   │
// ├─────────────────────────────────────────────────┤
// │ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
// │ │ Total    │ │ Active   │ │ VIP      │        │
// │ │ Customers│ │ Customers│ │ Customers│        │
// │ │   245    │ │   189    │ │    23    │        │
// │ └──────────┘ └──────────┘ └──────────┘        │
// │                                                 │
// │ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
// │ │ Revenue  │ │ Bookings │ │ Lead     │        │
// │ │ This     │ │ This     │ │ Conversion│       │
// │ │ Month    │ │ Month    │ │ Rate     │        │
// │ │ 125.000kr│ │    45    │ │   32%    │        │
// │ └──────────┘ └──────────┘ └──────────┘        │
// │                                                 │
// │ ┌─────────────────────────────────────────┐   │
// │ │ Revenue Chart (Last 6 Months)           │   │
// │ │ [Line Chart]                            │   │
// │ └─────────────────────────────────────────┘   │
// │                                                 │
// │ ┌─────────────────────────────────────────┐   │
// │ │ Recent Activity                         │   │
// │ │ • Customer X booked service             │   │
// │ │ • Lead Y converted to customer          │   │
// │ │ • Booking Z completed                   │   │
// │ └─────────────────────────────────────────┘   │
// └─────────────────────────────────────────────────┘

```text

#### **5. CustomerProfileDrawer Component**

```typescript
interface CustomerProfileDrawerProps {
  customerId: number;
  open: boolean;
  onClose: () => void;
}

// Drawer Structure (840px width):
// ┌─────────────────────────────────────┐
// │ [X] Customer Profile                │
// ├─────────────────────────────────────┤
// │ [Avatar] John Doe          [Status] │
// │          <john@example.com>           │
// │          +45 12 34 56 78            │
// │                                     │
// │ [Overview][Properties][Bookings]... │
// ├─────────────────────────────────────┤
// │                                     │
// │ Financial Summary:                  │
// │ Total Invoiced: 45.000 kr          │
// │ Total Paid: 40.000 kr              │
// │ Balance: 5.000 kr                  │
// │                                     │
// │ Recent Bookings:                    │
// │ • 2025-11-15 - Grundrengøring      │

// │ • 2025-10-20 - Vinduespolering     │

// │                                     │
// │ Properties:                         │
// │ • Hovedgade 123, 2100 København    │
// │ • Strandvej 45, 2900 Hellerup      │
// │                                     │
// │ Notes:                              │
// │ [Add Note Button]                  │
// │ • 2025-11-10: Called customer...   │
// │                                     │
// │ [Edit Customer] [Create Booking]   │
// └─────────────────────────────────────┘

```text

---

## Color Scheme & Styling

### Status Colors

```typescript
const statusColors = {
  // Customer Status
  new: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  vip: "bg-yellow-100 text-yellow-800 border-yellow-200",
  at_risk: "bg-red-100 text-red-800 border-red-200",

  // Booking Status
  planned: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",

  // Lead Status
  qualified: "bg-green-100 text-green-800",
  proposal: "bg-yellow-100 text-yellow-800",
  won: "bg-green-500 text-white",
  lost: "bg-red-100 text-red-800",
};

```text

### Component Sizing

```typescript
const componentSizes = {
  card: {
    sm: "p-3 rounded-md",
    md: "p-4 rounded-lg",
    lg: "p-6 rounded-xl",
  },
  button: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  },
  input: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  },
};

```text

---

## Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: "max-w-[640px]", // 1 column
  tablet: "max-w-[768px]", // 2 columns
  desktop: "max-w-[1024px]", // 3 columns
  wide: "max-w-[1280px]", // 4 columns
};

// Grid Layouts
const gridLayouts = {
  customerGrid: {
    mobile: "grid-cols-1",
    tablet: "md:grid-cols-2",
    desktop: "lg:grid-cols-3",
  },
  dashboardGrid: {
    mobile: "grid-cols-1",
    tablet: "md:grid-cols-2",
    desktop: "lg:grid-cols-3",
  },
};

```text

---

## Accessibility Requirements

All components must meet WCAG 2.1 AA standards:

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
1. **Screen Reader Support**: Proper ARIA labels and roles
1. **Color Contrast**: Minimum 4.5:1 contrast ratio for text
1. **Focus Indicators**: Visible focus states for all interactive elements
1. **Error Messages**: Clear, descriptive error messages
1. **Form Labels**: All form inputs have associated labels

```typescript
// Example: Accessible Button
<Button
  aria-label="Edit customer"
  aria-describedby="edit-customer-description"
  className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  <Edit className="w-4 h-4" />
</Button>

```text

---

This comprehensive UI component library ensures consistent, accessible, and user-friendly interfaces throughout the CRM module.

## UI/UX Design & Visual Effects

### Animation & Interaction Patterns

#### **1. Page Transitions**

```typescript
// Smooth page transitions using Framer Motion
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function CustomerManagement() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/*Page content*/}

    </motion.div>
  );
}

```text

#### **2. Card Hover Effects**

```css
/*CustomerCard hover animation*/

.customer-card {
  transition: all 0.2s ease-in-out;
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.customer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/*Smooth border color transition*/

.customer-card {
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.customer-card:hover {
  border-color: var(--crm-primary);
}

```text

#### **3. Status Badge Animations**

```typescript
// Animated status badge with pulse effect
const StatusBadge = ({ status }: { status: CustomerStatus }) => {
  return (
    <motion.div
      className={`status-badge status-${status}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
    >
      {status === "at_risk" && (
        <motion.span
          className="pulse-indicator"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
      {status}
    </motion.div>
  );
};

```text

#### **4. Modal/Drawer Animations**

```typescript
// CustomerProfileDrawer slide-in animation
const drawerVariants = {
  closed: { x: "100%", opacity: 0 },
  open: { x: 0, opacity: 1 },
};

export function CustomerProfileDrawer({ open, onClose }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/*Backdrop fade*/}

          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/*Drawer slide*/}

          <motion.div
            className="drawer-content"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/*Drawer content*/}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

```text

#### **5. List Item Stagger Animation**

```typescript
// Staggered animation for customer list
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CustomerList({ customers }: { customers: Customer[] }) {
  return (
    <motion.div
      className="customer-grid"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {customers.map(customer => (
        <motion.div key={customer.id} variants={itemVariants}>
          <CustomerCard customer={customer} />
        </motion.div>
      ))}
    </motion.div>
  );
}

```text

#### **6. Loading Skeletons**

```typescript
// Shimmer loading effect
const Skeleton = () => (
  <div className="skeleton-wrapper">
    <div className="skeleton-shimmer" />
  </div>
);

// CSS for shimmer effect
const shimmerCSS = `
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f8f8f8 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
`;

// CustomerCard skeleton
export function CustomerCardSkeleton() {
  return (
    <div className="customer-card skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-text skeleton-text-lg" />
      <div className="skeleton-text skeleton-text-md" />
      <div className="skeleton-text skeleton-text-sm" />
    </div>
  );
}

```text

#### **7. Button Interactions**

```css
/*Button press animation*/

.crm-button {
  transition: all 0.15s ease;
  transform: scale(1);
}

.crm-button:active {
  transform: scale(0.95);
}

.crm-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/*Loading spinner in button*/

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.button-spinner {
  animation: spin 1s linear infinite;
}

```text

#### **8. Toast Notifications**

```typescript
// Animated toast notifications using Sonner
import { toast } from "sonner";

// Success toast with icon animation
const showSuccessToast = (message: string) => {
  toast.success(message, {
    icon: (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        ✓
      </motion.div>
    ),
    duration: 3000,
  });
};

// Error toast with shake animation
const showErrorToast = (message: string) => {
  toast.error(message, {
    icon: (
      <motion.div
        animate={{ x: [-10, 10, -10, 10, 0] }}
        transition={{ duration: 0.4 }}
      >
        ✕
      </motion.div>
    ),
    duration: 5000,
  });
};

```text

#### **9. Drag and Drop Visual Feedback**

```typescript
// LeadPipelineBoard drag feedback
import { DndContext, DragOverlay } from "@dnd-kit/core";

export function LeadPipelineBoard() {
  const [activeId, setActiveId] = useState(null);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/*Kanban columns*/}

      <DragOverlay>
        {activeId && (
          <motion.div
            initial={{ scale: 1, rotate: 0 }}
            animate={{ scale: 1.05, rotate: 3 }}
            style={{ cursor: "grabbing" }}
          >
            <LeadCard lead={getLeadById(activeId)} isDragging />
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// CSS for drag states
const dragCSS = `
.lead-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.kanban-column.drag-over {
  background-color: rgba(59, 130, 246, 0.1);
  border: 2px dashed #3b82f6;
}
`;

```text

#### **10. Form Field Animations**

```typescript
// Animated form field with error shake
const FormField = ({ error }: { error?: string }) => {
  return (
    <motion.div
      animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      <input className={error ? "input-error" : ""} />
      {error && (
        <motion.p
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

```text

---

### Visual Effects & Micro-interactions

#### **1. Ripple Effect on Click**

```typescript
// Material Design ripple effect
const RippleButton = ({ children, onClick }: ButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const y = e.clientY - rect.top;

    setRipples([...ripples, { x, y, id: Date.now() }]);
    onClick?.(e);

    setTimeout(() => {
      setRipples(ripples => ripples.slice(1));
    }, 600);
  };

  return (
    <button className="ripple-button" onClick={handleClick}>
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="ripple"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </button>
  );
};

```text

#### **2. Progress Indicators**

```typescript
// Animated progress bar
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="progress-container">
    <motion.div
      className="progress-bar"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </div>
);

// Circular progress spinner
const CircularProgress = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} className="circular-progress">
    <motion.circle
      cx={size / 2}
      cy={size / 2}
      r={(size - 8) / 2}

      stroke="currentColor"
      strokeWidth="3"
      fill="none"
      strokeDasharray="100"
      initial={{ strokeDashoffset: 100 }}
      animate={{ strokeDashoffset: 0, rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  </svg>
);

```text

#### **3. Tooltip Animations**

```typescript
// Smooth tooltip with arrow
const Tooltip = ({ content, children }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="tooltip"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
          >
            {content}
            <div className="tooltip-arrow" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

```text

#### **4. Number Counter Animation**

```typescript
// Animated number counter for dashboard metrics
const AnimatedNumber = ({ value, duration = 1 }: NumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    const increment = (end - start) / (duration * 60);

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString("da-DK")}</span>;
};

```text

#### **5. Scroll Reveal Animations**

```typescript
// Reveal elements on scroll
import { useInView } from "framer-motion";

const ScrollReveal = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

```text

#### **6. Confetti Effect on Success**

```typescript
// Confetti animation for major actions (e.g., lead conversion)
import confetti from "canvas-confetti";

const celebrateSuccess = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#10b981", "#3b82f6", "#f59e0b"],
  });
};

// Use in LeadConversionModal
const handleConversion = async () => {
  await convertLead();
  celebrateSuccess();
  toast.success("Lead converted to customer! 🎉");
};

```text

---

### Responsive Design Patterns

#### **Mobile Optimizations**

```css
/*Touch-friendly button sizes*/

@media (max-width: 768px) {
  .crm-button {
    min-height: 44px; /*iOS recommended touch target*/

    min-width: 44px;
    padding: 12px 20px;
  }

  /*Larger tap targets for mobile*/

  .customer-card {
    padding: 16px;
  }

  /*Bottom sheet for mobile modals*/

  .modal-mobile {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 16px 16px 0 0;
    max-height: 90vh;
  }
}

```text

#### **Gesture Support**

```typescript
// Swipe to delete gesture
import { motion, useMotionValue, useTransform } from "framer-motion";

const SwipeableCard = ({ onDelete }: { onDelete: () => void }) => {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-200, 0, 200],
    ["#ef4444", "#ffffff", "#10b981"]
  );

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      style={{ x, background }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -150) {
          onDelete();
        }
      }}
    >
      {/*Card content*/}

    </motion.div>
  );
};

```text

---

### Dark Mode Support

```css
/*CRM Dark Mode Theme*/

:root[data-theme="dark"] {
  --crm-background: #0f172a;
  --crm-surface: #1e293b;
  --crm-border: #334155;
  --crm-text: #f1f5f9;
  --crm-text-secondary: #94a3b8;

  /*Status colors adjusted for dark mode*/

  --crm-status-new: #3b82f6;
  --crm-status-active: #10b981;
  --crm-status-vip: #f59e0b;
  --crm-status-at-risk: #ef4444;
}

/*Smooth theme transition*/

* {

  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

```text

---

### Performance Optimizations

#### **1. Virtualized Lists**

```typescript
// Virtual scrolling for large customer lists
import { useVirtualizer } from "@tanstack/react-virtual";

export function VirtualCustomerList({ customers }: { customers: Customer[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: customers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated card height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="customer-list-container">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <CustomerCard customer={customers[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}

```text

#### **2. Image Lazy Loading**

```typescript
// Lazy load customer avatars and property photos
const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="lazy-image-container">
      {!isLoaded && <Skeleton />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </div>
  );
};

```text

---

### Accessibility Enhancements

#### **Focus Management**

```typescript
// Trap focus in modal
import { useFocusTrap } from "@/hooks/useFocusTrap";

export function Modal({ open, onClose }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, open);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/*Modal content*/}

    </div>
  );
}

```text

#### **Keyboard Navigation**

```typescript
// Keyboard shortcuts for CRM
import { useHotkeys } from "react-hotkeys-hook";

export function CRMKeyboardShortcuts() {
  useHotkeys("alt+c", () => navigate("/crm/customers"));
  useHotkeys("alt+l", () => navigate("/crm/leads"));
  useHotkeys("alt+b", () => navigate("/crm/bookings"));
  useHotkeys("ctrl+k", () => openCommandPalette());
  useHotkeys("esc", () => closeModal());

  return null;
}

```text

---

## Visual Design Summary

**Animation Philosophy**: Smooth, purposeful animations that enhance UX without being distracting.

**Key Principles**:

- ✅ **Fast**: Animations complete in 150-300ms

- ✅ **Smooth**: Use easing functions (ease-out, ease-in-out)

- ✅ **Purposeful**: Every animation serves a UX purpose

- ✅ **Accessible**: Respect `prefers-reduced-motion`

- ✅ **Performant**: Use CSS transforms and opacity for 60fps

**Visual Hierarchy**:

1. **Primary actions**: Bold colors, prominent placement
1. **Secondary actions**: Muted colors, smaller size
1. **Tertiary actions**: Icon-only, minimal styling

**Feedback Loops**:

- Immediate visual feedback on all interactions

- Loading states for async operations

- Success/error notifications

- Progress indicators for long operations

This comprehensive visual design ensures a modern, polished, and delightful user experience throughout the CRM module.

## Apple-Inspired Design System

### Design Principles (Apple HIG)

The CRM module follows Apple's Human Interface Guidelines with three core principles:

1. **Clarity**: Text is legible, icons are precise, functionality is intuitive
1. **Deference**: UI helps understanding without competing for attention
1. **Depth**: Visual layers and realistic motion provide hierarchy and vitality

### Typography System (San Francisco Inspired)

```typescript
// Apple-style typography scale
export const typography = {
  // Display styles
  largeTitle: {
    fontSize: "34px",
    lineHeight: "41px",
    fontWeight: 700,
    letterSpacing: "-0.4px",
  },
  title1: {
    fontSize: "28px",
    lineHeight: "34px",
    fontWeight: 700,
    letterSpacing: "-0.4px",
  },
  title2: {
    fontSize: "22px",
    lineHeight: "28px",
    fontWeight: 700,
    letterSpacing: "-0.4px",
  },
  title3: {
    fontSize: "20px",
    lineHeight: "25px",
    fontWeight: 600,
    letterSpacing: "-0.4px",
  },

  // Body styles
  headline: {
    fontSize: "17px",
    lineHeight: "22px",
    fontWeight: 600,
    letterSpacing: "-0.4px",
  },
  body: {
    fontSize: "17px",
    lineHeight: "22px",
    fontWeight: 400,
    letterSpacing: "-0.4px",
  },
  callout: {
    fontSize: "16px",
    lineHeight: "21px",
    fontWeight: 400,
    letterSpacing: "-0.3px",
  },
  subheadline: {
    fontSize: "15px",
    lineHeight: "20px",
    fontWeight: 400,
    letterSpacing: "-0.2px",
  },
  footnote: {
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: 400,
    letterSpacing: "-0.1px",
  },
  caption1: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 400,
    letterSpacing: "0px",
  },
  caption2: {
    fontSize: "11px",
    lineHeight: "13px",
    fontWeight: 400,
    letterSpacing: "0.1px",
  },
};

// Font family stack (San Francisco fallback)
export const fontFamily = {
  system: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif`,
  mono: `'SF Mono', 'Monaco', 'Menlo', monospace`,
};

```text

### Color System (Apple System Colors)

```typescript
// Apple-inspired color palette
export const colors = {
  // System colors (light mode)
  systemBlue: "#007AFF",
  systemGreen: "#34C759",
  systemIndigo: "#5856D6",
  systemOrange: "#FF9500",
  systemPink: "#FF2D55",
  systemPurple: "#AF52DE",
  systemRed: "#FF3B30",
  systemTeal: "#5AC8FA",
  systemYellow: "#FFCC00",

  // Gray scale
  systemGray: "#8E8E93",
  systemGray2: "#AEAEB2",
  systemGray3: "#C7C7CC",
  systemGray4: "#D1D1D6",
  systemGray5: "#E5E5EA",
  systemGray6: "#F2F2F7",

  // Label colors
  label: "#000000",
  secondaryLabel: "#3C3C43",
  tertiaryLabel: "#3C3C43",
  quaternaryLabel: "#3C3C43",

  // Fill colors
  systemFill: "rgba(120, 120, 128, 0.2)",
  secondarySystemFill: "rgba(120, 120, 128, 0.16)",
  tertiarySystemFill: "rgba(118, 118, 128, 0.12)",
  quaternarySystemFill: "rgba(116, 116, 128, 0.08)",

  // Background colors
  systemBackground: "#FFFFFF",
  secondarySystemBackground: "#F2F2F7",
  tertiarySystemBackground: "#FFFFFF",

  // Grouped background colors
  systemGroupedBackground: "#F2F2F7",
  secondarySystemGroupedBackground: "#FFFFFF",
  tertiarySystemGroupedBackground: "#F2F2F7",

  // Dark mode variants
  dark: {
    systemBlue: "#0A84FF",
    systemGreen: "#30D158",
    systemIndigo: "#5E5CE6",
    systemOrange: "#FF9F0A",
    systemPink: "#FF375F",
    systemPurple: "#BF5AF2",
    systemRed: "#FF453A",
    systemTeal: "#64D2FF",
    systemYellow: "#FFD60A",

    systemGray: "#8E8E93",
    systemGray2: "#636366",
    systemGray3: "#48484A",
    systemGray4: "#3A3A3C",
    systemGray5: "#2C2C2E",
    systemGray6: "#1C1C1E",

    label: "#FFFFFF",
    secondaryLabel: "rgba(235, 235, 245, 0.6)",
    tertiaryLabel: "rgba(235, 235, 245, 0.3)",
    quaternaryLabel: "rgba(235, 235, 245, 0.18)",

    systemBackground: "#000000",
    secondarySystemBackground: "#1C1C1E",
    tertiarySystemBackground: "#2C2C2E",

    systemGroupedBackground: "#000000",
    secondarySystemGroupedBackground: "#1C1C1E",
    tertiarySystemGroupedBackground: "#2C2C2E",
  },
};

// CRM-specific status colors
export const statusColors = {
  new: colors.systemBlue,
  active: colors.systemGreen,
  inactive: colors.systemGray,
  vip: colors.systemYellow,
  at_risk: colors.systemRed,

  // Booking status
  planned: colors.systemBlue,
  in_progress: colors.systemOrange,
  completed: colors.systemGreen,
  cancelled: colors.systemGray,
};

```text

### Spacing System (8pt Grid)

```typescript
// Apple's 8pt grid system
export const spacing = {
  0: "0px",
  1: "4px", // 0.25rem
  2: "8px", // 0.5rem
  3: "12px", // 0.75rem
  4: "16px", // 1rem
  5: "20px", // 1.25rem
  6: "24px", // 1.5rem
  8: "32px", // 2rem
  10: "40px", // 2.5rem
  12: "48px", // 3rem
  16: "64px", // 4rem
  20: "80px", // 5rem
  24: "96px", // 6rem
};

// Component-specific spacing
export const componentSpacing = {
  cardPadding: spacing[5], // 20px
  cardGap: spacing[4], // 16px
  sectionGap: spacing[6], // 24px
  listItemPadding: spacing[4], // 16px
  buttonPadding: "12px 20px",
  inputPadding: "10px 16px",
};

```text

### Border Radius System

```typescript
// Apple-style border radius
export const borderRadius = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  "2xl": "22px",
  full: "9999px",

  // Component-specific
  card: "16px",
  button: "12px",
  input: "10px",
  badge: "12px",
  modal: "20px",
  sheet: "16px",
};

```text

### Shadow System

```typescript
// Apple-style elevation shadows
export const shadows = {
  // Light mode
  sm: "0 1px 3px rgba(0, 0, 0, 0.08)",
  md: "0 2px 8px rgba(0, 0, 0, 0.08)",
  lg: "0 4px 16px rgba(0, 0, 0, 0.12)",
  xl: "0 8px 24px rgba(0, 0, 0, 0.15)",
  "2xl": "0 16px 48px rgba(0, 0, 0, 0.18)",

  // Dark mode
  dark: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.3)",
    md: "0 2px 8px rgba(0, 0, 0, 0.4)",
    lg: "0 4px 16px rgba(0, 0, 0, 0.5)",
    xl: "0 8px 24px rgba(0, 0, 0, 0.6)",
    "2xl": "0 16px 48px rgba(0, 0, 0, 0.7)",
  },

  // Inset shadows (for pressed states)
  inset: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
};

```text

### Material Effects (Frosted Glass)

```typescript
// Apple's frosted glass/vibrancy effects
export const materials = {
  // Blur intensity
  ultraThin: {
    backdropFilter: "blur(2px) saturate(180%)",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  thin: {
    backdropFilter: "blur(10px) saturate(180%)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  regular: {
    backdropFilter: "blur(20px) saturate(180%)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  thick: {
    backdropFilter: "blur(30px) saturate(180%)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },

  // Dark mode variants
  dark: {
    ultraThin: {
      backdropFilter: "blur(2px) saturate(180%)",
      backgroundColor: "rgba(28, 28, 30, 0.7)",
    },
    thin: {
      backdropFilter: "blur(10px) saturate(180%)",
      backgroundColor: "rgba(28, 28, 30, 0.8)",
    },
    regular: {
      backdropFilter: "blur(20px) saturate(180%)",
      backgroundColor: "rgba(28, 28, 30, 0.9)",
    },
    thick: {
      backdropFilter: "blur(30px) saturate(180%)",
      backgroundColor: "rgba(28, 28, 30, 0.95)",
    },
  },
};

// CSS implementation
export const materialCSS = `
.material-regular {
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background-color: rgba(255, 255, 255, 0.9);
  border: 0.5px solid rgba(255, 255, 255, 0.18);
}

@media (prefers-color-scheme: dark) {
  .material-regular {
    background-color: rgba(28, 28, 30, 0.9);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
`;

```text

### Animation System (Apple Springs)

```typescript
// Apple-style spring animations
export const springs = {
  // iOS default spring
  default: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  // Gentle spring (macOS style)
  gentle: {
    type: "spring",
    stiffness: 260,
    damping: 20,
    mass: 1,
  },

  // Snappy spring (quick interactions)
  snappy: {
    type: "spring",
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },

  // Bouncy spring (playful)
  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 15,
    mass: 1,
  },

  // Smooth spring (slow and smooth)
  smooth: {
    type: "spring",
    stiffness: 200,
    damping: 25,
    mass: 1.2,
  },
};

// Easing curves (Apple.com style)
export const easings = {
  // Apple's custom cubic-bezier
  appleEase: [0.4, 0, 0.2, 1],
  appleEaseIn: [0.4, 0, 1, 1],
  appleEaseOut: [0, 0, 0.2, 1],
  appleEaseInOut: [0.4, 0, 0.2, 1],

  // Standard easings
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
};

// Duration scale
export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
  slowest: 1200,
};

```text

### Icon System (SF Symbols Style)

```typescript
// Lucide icons configured for SF Symbols aesthetic
export const iconConfig = {
  size: 20,
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Icon sizes
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
};

// Usage example
import { Mail } from 'lucide-react';

<Mail
  size={iconSizes.md}
  strokeWidth={2.5}
  style={{
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }}
/>

```text

### Component Patterns

#### Button Variants

```typescript
// Apple-style button variants
export const buttonVariants = {
  // Primary (filled)
  primary: {
    background: colors.systemBlue,
    color: "#FFFFFF",
    border: "none",
    boxShadow: shadows.sm,
    hover: {
      background: "#0051D5",
      boxShadow: shadows.md,
    },
    active: {
      background: "#004FC4",
      boxShadow: shadows.inset,
    },
  },

  // Secondary (outline)
  secondary: {
    background: "transparent",
    color: colors.systemBlue,
    border: `1px solid ${colors.systemGray4}`,
    hover: {
      background: colors.systemGray6,
    },
    active: {
      background: colors.systemGray5,
    },
  },

  // Tertiary (text only)
  tertiary: {
    background: "transparent",
    color: colors.systemBlue,
    border: "none",
    hover: {
      background: colors.systemGray6,
    },
    active: {
      background: colors.systemGray5,
    },
  },

  // Destructive
  destructive: {
    background: colors.systemRed,
    color: "#FFFFFF",
    border: "none",
    hover: {
      background: "#E5342E",
    },
    active: {
      background: "#D32F2A",
    },
  },
};

```text

#### Card Variants

```typescript
// Apple-style card variants
export const cardVariants = {
  // Elevated (with shadow)
  elevated: {
    background: colors.systemBackground,
    borderRadius: borderRadius.card,
    boxShadow: shadows.md,
    border: "none",
  },

  // Filled (solid background)
  filled: {
    background: colors.secondarySystemBackground,
    borderRadius: borderRadius.card,
    boxShadow: "none",
    border: "none",
  },

  // Glass (frosted glass effect)
  glass: {
    ...materials.regular,
    borderRadius: borderRadius.card,
    boxShadow: shadows.sm,
  },

  // Outlined
  outlined: {
    background: colors.systemBackground,
    borderRadius: borderRadius.card,
    boxShadow: "none",
    border: `0.5px solid ${colors.systemGray4}`,
  },
};

```text

### Responsive Design

```typescript
// Apple-style breakpoints
export const breakpoints = {
  // iPhone
  mobile: "375px",
  mobileLarge: "428px",

  // iPad
  tablet: "768px",
  tabletLarge: "1024px",

  // Mac
  desktop: "1280px",
  desktopLarge: "1440px",
  desktopXL: "1920px",
};

// Media queries
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.tablet})`,
  tablet: `@media (min-width: ${breakpoints.tablet}) and (max-width: ${breakpoints.desktop})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,

  // Hover capability
  hover: "@media (hover: hover) and (pointer: fine)",

  // Dark mode
  dark: "@media (prefers-color-scheme: dark)",

  // Reduced motion
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
};

```text

### Accessibility (Apple Standards)

```typescript
// Apple accessibility guidelines
export const a11y = {
  // Minimum touch target size (iOS)
  minTouchTarget: "44px",

  // Minimum contrast ratios
  contrastRatios: {
    normalText: 4.5,
    largeText: 3,
    uiComponents: 3,
  },

  // Focus indicators
  focusRing: {
    outline: `2px solid ${colors.systemBlue}`,
    outlineOffset: "2px",
    borderRadius: borderRadius.sm,
  },

  // Reduced motion
  reducedMotion: {
    transition: "none",
    animation: "none",
  },
};

```text

This Apple-inspired design system ensures a premium, polished, and consistent user experience throughout the CRM module, following industry-leading design standards.

## Browser Compatibility & Fallbacks

### Frosted Glass Effect Fallbacks

```typescript
// Progressive enhancement for backdrop-filter
export const glassFallback = `
/*Modern browsers with backdrop-filter support*/

@supports (backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px)) {
  .glass-card {
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background-color: rgba(255, 255, 255, 0.9);
  }
}

/*Fallback for browsers without backdrop-filter*/

@supports not (backdrop-filter: blur(20px)) and not (-webkit-backdrop-filter: blur(20px)) {
  .glass-card {
    background-color: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}
`;

// JavaScript feature detection
export const supportsBackdropFilter = () => {
  return (
    CSS.supports('backdrop-filter', 'blur(20px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(20px)')
  );
};

// Component with fallback
export function GlassCard({ children }: { children: React.ReactNode }) {
  const hasBackdropFilter = supportsBackdropFilter();

  return (
    <div
      className={hasBackdropFilter ? 'glass-card' : 'glass-card-fallback'}
      style={{
        ...(hasBackdropFilter
          ? {
              backdropFilter: 'blur(20px) saturate(180%)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }
          : {
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }),
      }}
    >
      {children}
    </div>
  );
}

```text

### Browser Support Matrix

| Feature         | Chrome | Firefox | Safari  | Edge   | Mobile Safari | Mobile Chrome |
| --------------- | ------ | ------- | ------- | ------ | ------------- | ------------- |

| backdrop-filter | ✅ 76+ | ✅ 103+ | ✅ 9+   | ✅ 79+ | ✅ 9+         | ✅ 76+        |

| CSS Grid        | ✅ 57+ | ✅ 52+  | ✅ 10+  | ✅ 16+ | ✅ 10+        | ✅ 57+        |

| Framer Motion   | ✅ All | ✅ All  | ✅ All  | ✅ All | ✅ All        | ✅ All        |
| CSS Variables   | ✅ 49+ | ✅ 31+  | ✅ 9.1+ | ✅ 15+ | ✅ 9.3+       | ✅ 49+        |

**Minimum Browser Support:**

- Chrome 76+

- Firefox 103+

- Safari 9+

- Edge 79+

- iOS Safari 9+

- Android Chrome 76+

### Performance Optimizations for Older Devices

```typescript
// Detect device performance tier
export const getPerformanceTier = (): 'high' | 'medium' | 'low' => {
  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;

  // Check for device memory (if available)
  const memory = (navigator as any).deviceMemory || 4;

  // Check for connection speed
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';

  if (cores >= 8 && memory >= 8 && effectiveType === '4g') {
    return 'high';
  } else if (cores >= 4 && memory >= 4) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Adaptive rendering based on performance
export function useAdaptiveRendering() {
  const [tier, setTier] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    setTier(getPerformanceTier());
  }, []);

  return {
    tier,
    // Disable heavy effects on low-end devices
    enableBlur: tier !== 'low',
    enableParallax: tier === 'high',
    enableComplexAnimations: tier !== 'low',
    // Reduce animation duration on medium devices
    animationDuration: tier === 'high' ? 1 : tier === 'medium' ? 0.7 : 0.5,
  };
}

// Usage in components
export function CustomerCard({ customer }: CustomerCardProps) {
  const { enableBlur, enableComplexAnimations } = useAdaptiveRendering();

  return (
    <motion.div
      className={enableBlur ? 'glass-card' : 'solid-card'}
      animate={enableComplexAnimations ? complexAnimation : simpleAnimation}
    >
      {/*Card content*/}

    </motion.div>
  );
}

```text

### Reduced Motion Support

```typescript
// Respect user's motion preferences
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
};

// Adaptive animation variants
export const getAnimationVariants = (prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { type: "spring", stiffness: 400, damping: 30 },
  };
};

// Global CSS for reduced motion
const reducedMotionCSS = `
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

```text

### Performance Budget

```typescript
// Performance monitoring
export const performanceBudget = {
  // Bundle sizes
  maxBundleSize: 200, // KB for UI components
  maxInitialLoad: 500, // KB for initial page load

  // Timing metrics
  maxFCP: 1800, // First Contentful Paint (ms)
  maxLCP: 2500, // Largest Contentful Paint (ms)
  maxTTI: 3800, // Time to Interactive (ms)
  maxCLS: 0.1, // Cumulative Layout Shift

  // Animation performance
  minFPS: 60, // Minimum frames per second
  maxFrameTime: 16.67, // Max time per frame (ms)
};

// Performance monitoring hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor FPS
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {

        const fps = Math.round((frames * 1000) / (currentTime - lastTime));

        if (fps < performanceBudget.minFPS) {
          console.warn(`Low FPS detected: ${fps}`);
        }

        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }, []);
}

```text

These fallbacks and optimizations ensure the CRM module works smoothly across all devices and browsers while maintaining the premium Apple-inspired experience on capable devices.

## Component Documentation with Storybook

### Storybook Setup

```bash

# Install Storybook

npx storybook@latest init

# Install addons

npm install --save-dev @storybook/addon-a11y @storybook/addon-viewport @storybook/addon-themes

```text

### Storybook Configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../client/src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@storybook/addon-viewport",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;

```text

```typescript
// .storybook/preview.ts
import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import "../client/src/styles/apple-design-system/globals.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#F2F2F7",
        },
        {
          name: "dark",
          value: "#000000",
        },
      ],
    },
    viewport: {
      viewports: {
        iphone: {
          name: "iPhone 14 Pro",
          styles: { width: "393px", height: "852px" },
        },
        ipad: {
          name: "iPad Pro",
          styles: { width: "1024px", height: "1366px" },
        },
        macbook: {
          name: "MacBook Pro",
          styles: { width: "1440px", height: "900px" },
        },
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
};

export default preview;

```text

### Example Story: AppleButton

```typescript
// client/src/components/crm/apple-ui/AppleButton/AppleButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AppleButton } from './AppleButton';
import { Mail, Plus, Trash } from 'lucide-react';

const meta = {
  title: 'Apple UI/AppleButton',
  component: AppleButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Apple-inspired button component with spring animations and multiple variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'destructive'],
      description: 'Button visual style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner',
    },
  },
} satisfies Meta<typeof AppleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

// Secondary button
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

// Tertiary button
export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Tertiary Button',
  },
};

// Destructive button
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

// With icon
export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <Plus size={20} strokeWidth={2.5} />
        New Customer
      </>
    ),
  },
};

// Loading state
export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Saving...',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};

// All sizes
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <AppleButton size="sm">Small</AppleButton>
      <AppleButton size="md">Medium</AppleButton>
      <AppleButton size="lg">Large</AppleButton>
    </div>
  ),
};

// All variants
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <AppleButton variant="primary">Primary</AppleButton>
      <AppleButton variant="secondary">Secondary</AppleButton>
      <AppleButton variant="tertiary">Tertiary</AppleButton>
      <AppleButton variant="destructive">Destructive</AppleButton>
    </div>
  ),
};

```text

### Example Story: CustomerCard

```typescript
// client/src/components/crm/domain/customer/CustomerCard/CustomerCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { CustomerCard } from './CustomerCard';
import type { CustomerProfile } from '@/types/crm';

const meta = {
  title: 'CRM/CustomerCard',
  component: CustomerCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Customer card with Apple-inspired design, frosted glass effect, and smooth animations.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CustomerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCustomer: CustomerProfile = {
  id: 1,
  userId: 1,
  email: '<john<.doe@example.co>m>',
  name: 'John Doe',
  phone: '+45 12 34 56 78',
  status: 'active',
  tags: ['VIP', 'Recurring'],
  customerType: 'private',
  totalInvoiced: 4500000, // 45,000 kr
  totalPaid: 4000000,
  balance: 500000,
  invoiceCount: 12,
  emailCount: 24,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2025-11-10'),
};

// Active customer
export const Active: Story = {
  args: {
    customer: mockCustomer,
  },
};

// VIP customer
export const VIP: Story = {
  args: {
    customer: {
      ...mockCustomer,
      status: 'vip',
      totalInvoiced: 12500000, // 125,000 kr
      invoiceCount: 45,
    },
  },
};

// At risk customer
export const AtRisk: Story = {
  args: {
    customer: {
      ...mockCustomer,
      status: 'at_risk',
      tags: ['At Risk', 'No Recent Activity'],
    },
  },
};

// New customer
export const New: Story = {
  args: {
    customer: {
      ...mockCustomer,
      status: 'new',
      totalInvoiced: 0,
      totalPaid: 0,
      balance: 0,
      invoiceCount: 0,
      tags: [],
    },
  },
};

// Grid of customers
export const Grid: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      maxWidth: '1200px',
    }}>
      <CustomerCard customer={{ ...mockCustomer, status: 'active' }} />
      <CustomerCard customer={{ ...mockCustomer, status: 'vip' }} />
      <CustomerCard customer={{ ...mockCustomer, status: 'at_risk' }} />
      <CustomerCard customer={{ ...mockCustomer, status: 'new' }} />
      <CustomerCard customer={{ ...mockCustomer, status: 'inactive' }} />
      <CustomerCard customer={{ ...mockCustomer, status: 'active' }} />
    </div>
  ),
};

```text

### Storybook Scripts

```json
// package.json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "storybook:test": "test-storybook"
  }
}

```text

### Accessibility Testing in Storybook

```typescript
// All stories automatically include a11y addon
// Run accessibility checks with:
// npm run storybook
// Then check the "Accessibility" tab in Storybook

// Example: Testing keyboard navigation
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    // Test focus
    await userEvent.tab();
    expect(button).toHaveFocus();

    // Test enter key
    await userEvent.keyboard("{Enter}");

    // Test space key
    await userEvent.keyboard(" ");
  },
};

```text

Storybook provides a comprehensive component documentation and testing environment, making it easy to develop, test, and showcase the Apple-inspired CRM components.

## Cross-Platform Design Strategy

### Platform-Specific Adaptations

While the design is Apple-inspired, it adapts gracefully to all platforms while maintaining a premium feel.

#### iOS (Mobile Safari)

```typescript
// iOS-specific optimizations
export const iOSOptimizations = {
  // Safe area insets for notch/home indicator
  safeArea: {
    top: "env(safe-area-inset-top)",
    bottom: "env(safe-area-inset-bottom)",
    left: "env(safe-area-inset-left)",
    right: "env(safe-area-inset-right)",
  },

  // Disable iOS zoom on input focus
  preventZoom: `
    input, select, textarea {
      font-size: 16px !important;
    }
  `,

  // iOS momentum scrolling
  momentumScrolling: `
    -webkit-overflow-scrolling: touch;
  `,

  // Disable iOS callout menu
  disableCallout: `
    -webkit-touch-callout: none;
  `,
};

// iOS detection
export const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  );
};

```text

#### Android (Chrome Mobile)

```typescript
// Android-specific optimizations
export const androidOptimizations = {
  // Material Design ripple effect (Android users expect this)
  rippleEffect: true,

  // Android back button handling
  handleBackButton: () => {
    window.addEventListener("popstate", e => {
      // Handle drawer/modal close on back button
      if (isDrawerOpen) {
        e.preventDefault();
        closeDrawer();
      }
    });
  },

  // Android status bar color
  statusBarColor: "#007AFF",

  // Android splash screen
  splashScreen: {
    backgroundColor: "#F2F2F7",
    icon: "/icons/android-chrome-512x512.png",
  },
};

// Android detection
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

```text

#### Windows (Chrome/Edge)

```typescript
// Windows-specific adaptations
export const windowsOptimizations = {
  // Windows scrollbar styling
  scrollbar: `
    /*Custom scrollbar for Windows*/

    ::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }

    ::-webkit-scrollbar-track {
      background: #F2F2F7;
    }

    ::-webkit-scrollbar-thumb {
      background: #C7C7CC;
      border-radius: 6px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #AEAEB2;
    }
  `,

  // Windows keyboard shortcuts (Ctrl instead of Cmd)
  keyboardShortcuts: {
    newCustomer: "Ctrl+N",
    search: "Ctrl+K",
    save: "Ctrl+S",
  },

  // Windows title bar (if using Electron)
  titleBar: {
    height: "32px",
    backgroundColor: "#FFFFFF",
    controls: "right", // Windows controls on right
  },
};

// Windows detection
export const isWindows = () => {
  return /Win/.test(navigator.platform);
};

```text

#### macOS (Safari/Chrome)

```typescript
// macOS-specific features (native Apple experience)
export const macOSOptimizations = {
  // macOS keyboard shortcuts (Cmd key)
  keyboardShortcuts: {
    newCustomer: "⌘N",
    search: "⌘K",
    save: "⌘S",
  },

  // macOS scrollbar (overlay style)
  scrollbar: `
    /*macOS overlay scrollbar*/

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }
  `,

  // macOS title bar (if using Electron)
  titleBar: {
    height: "28px",
    backgroundColor: "transparent",
    controls: "left", // macOS controls on left
  },
};

// macOS detection
export const isMacOS = () => {
  return /Mac/.test(navigator.platform);
};

```text

#### Linux (Chrome/Firefox)

```typescript
// Linux-specific adaptations
export const linuxOptimizations = {
  // Linux scrollbar styling
  scrollbar: `
    /*Linux scrollbar*/

    ::-webkit-scrollbar {
      width: 14px;
      height: 14px;
    }

    ::-webkit-scrollbar-track {
      background: #E5E5EA;
    }

    ::-webkit-scrollbar-thumb {
      background: #8E8E93;
      border-radius: 7px;
    }
  `,

  // Linux keyboard shortcuts (Ctrl)
  keyboardShortcuts: {
    newCustomer: "Ctrl+N",
    search: "Ctrl+K",
    save: "Ctrl+S",
  },
};

// Linux detection
export const isLinux = () => {
  return /Linux/.test(navigator.platform);
};

```text

### Unified Platform Detection Hook

```typescript
// Comprehensive platform detection
export function usePlatform() {
  const [platform, setPlatform] = useState<{
    os: "ios" | "android" | "windows" | "macos" | "linux" | "unknown";
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    browser: "chrome" | "firefox" | "safari" | "edge" | "unknown";
  }>({
    os: "unknown",
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    browser: "unknown",
  });

  useEffect(() => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;

    // Detect OS
    let os: typeof platform.os = "unknown";
    if (/iPad|iPhone|iPod/.test(ua)) os = "ios";
    else if (/Android/.test(ua)) os = "android";
    else if (/Win/.test(platform)) os = "windows";
    else if (/Mac/.test(platform)) os = "macos";
    else if (/Linux/.test(platform)) os = "linux";

    // Detect device type
    const isMobile = /iPhone|Android.*Mobile/.test(ua);
    const isTablet = /iPad|Android(?!.*Mobile)/.test(ua);
    const isDesktop = !isMobile && !isTablet;

    // Detect browser
    let browser: typeof platform.browser = "unknown";
    if (/Chrome/.test(ua) && !/Edge/.test(ua)) browser = "chrome";
    else if (/Firefox/.test(ua)) browser = "firefox";
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "safari";
    else if (/Edge/.test(ua)) browser = "edge";

    setPlatform({ os, isMobile, isTablet, isDesktop, browser });
  }, []);

  return platform;
}

```text

### Adaptive Component Example

```typescript
// CustomerCard that adapts to platform
export function CustomerCard({ customer }: CustomerCardProps) {
  const platform = usePlatform();
  const prefersReducedMotion = useReducedMotion();

  // Adapt animations based on platform
  const animationConfig = {
    // iOS: Smooth spring animations
    ios: springs.default,
    // Android: Slightly faster, Material Design feel
    android: { ...springs.snappy, damping: 25 },
    // Desktop: Smooth and polished
    windows: springs.gentle,
    macos: springs.default,
    linux: springs.gentle,
    unknown: springs.default,
  };

  // Adapt touch targets based on platform
  const touchTargetSize = platform.isMobile ? '44px' : '36px';

  // Adapt hover effects (only on desktop with mouse)
  const enableHover = platform.isDesktop;

  return (
    <motion.div
      className="customer-card"
      style={{
        minHeight: touchTargetSize,
      }}
      whileHover={enableHover ? { y: -4 } : undefined}
      whileTap={{ scale: 0.98 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : animationConfig[platform.os]
      }
    >
      {/*Card content*/}

    </motion.div>
  );
}

```text

### Platform-Specific Styling

```css
/*iOS-specific styles*/

@supports (-webkit-touch-callout: none) {
  .customer-card {
    /*iOS safe area*/

    padding-bottom: env(safe-area-inset-bottom);
  }

  /*iOS momentum scrolling*/

  .scrollable-list {
    -webkit-overflow-scrolling: touch;
  }
}

/*Android-specific styles*/

@media (hover: none) and (pointer: coarse) {
  .customer-card {
    /*Larger touch targets for Android*/

    min-height: 48px;
  }

  /*Material Design ripple effect*/

  .button {
    position: relative;
    overflow: hidden;
  }
}

/*Windows-specific styles*/

@media (min-width: 1024px) and (hover: hover) {
  /*Windows scrollbar*/

  ::-webkit-scrollbar {
    width: 12px;
  }

  /*Windows focus outline*/

  button:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: 2px;
  }
}

/*macOS-specific styles*/

@supports (-webkit-backdrop-filter: blur(20px)) {
  .glass-card {
    /*macOS frosted glass works best*/

    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);
  }
}

```text

### Responsive Breakpoints (All Platforms)

```typescript
// Universal breakpoints that work across all platforms
export const breakpoints = {
  // Mobile (iOS & Android)
  mobile: {
    min: 320,
    max: 767,
    devices: ["iPhone SE", "iPhone 14", "Galaxy S23", "Pixel 7"],
  },

  // Tablet (iPad & Android tablets)
  tablet: {
    min: 768,
    max: 1023,
    devices: ["iPad", "iPad Pro", "Galaxy Tab", "Surface Go"],
  },

  // Desktop (Windows, Mac, Linux)
  desktop: {
    min: 1024,
    max: 1439,
    devices: ["MacBook Air", "Surface Laptop", "ThinkPad"],
  },

  // Large desktop
  desktopLarge: {
    min: 1440,
    max: 1919,
    devices: ['MacBook Pro 16"', "Dell XPS", "iMac"],
  },

  // Extra large (4K monitors)
  desktopXL: {
    min: 1920,
    max: Infinity,
    devices: ["4K monitors", 'iMac 27"', "Ultra-wide displays"],
  },
};

```text

### Touch vs Mouse Interactions

```typescript
// Detect input method
export function useInputMethod() {
  const [inputMethod, setInputMethod] = useState<'touch' | 'mouse' | 'hybrid'>('mouse');

  useEffect(() => {
    let hasTouch = false;
    let hasMouse = false;

    const handleTouch = () => {
      hasTouch = true;
      updateInputMethod();
    };

    const handleMouse = () => {
      hasMouse = true;
      updateInputMethod();
    };

    const updateInputMethod = () => {
      if (hasTouch && hasMouse) {
        setInputMethod('hybrid'); // Surface, touchscreen laptops
      } else if (hasTouch) {
        setInputMethod('touch'); // Mobile, tablets
      } else {
        setInputMethod('mouse'); // Desktop
      }
    };

    window.addEventListener('touchstart', handleTouch, { once: true });
    window.addEventListener('mousemove', handleMouse, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return inputMethod;
}

// Adaptive button with touch/mouse support
export function AdaptiveButton({ children, onClick }: ButtonProps) {
  const inputMethod = useInputMethod();

  return (
    <motion.button
      onClick={onClick}
      // Larger touch targets for touch devices
      style={{
        minHeight: inputMethod === 'touch' ? '44px' : '36px',
        minWidth: inputMethod === 'touch' ? '44px' : '36px',
      }}
      // Hover effects only for mouse
      whileHover={inputMethod === 'mouse' ? { scale: 1.05 } : undefined}
      // Tap feedback for all
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

````

### Platform Testing Matrix

| Feature | iOS Safari | Android Chrome | Windows Chrome | macOS Safari | Linux Firefox |
| ------- | ---------- | -------------- | -------------- | ------------ | ------------- |

| Frosted Glass | ✅ Perfect | ⚠️ Fallback | ⚠️ Fallback | ✅ Perfect | ⚠️ Fallback |
| Spring Animations | ✅ Smooth | ✅ Smooth | ✅ Smooth | ✅ Smooth | ✅ Smooth |
| Touch Gestures | ✅ Native | ✅ Native | ✅ Touchscreen | ✅ Trackpad | ⚠️ Limited |
| Keyboard Shortcuts | ⚠️ Limited | ⚠️ Limited | ✅ Full | ✅ Full | ✅ Full |
| Safe Area Insets | ✅ Yes | ⚠️ Partial | ❌ No | ❌ No | ❌ No |
| Momentum Scrolling | ✅ Native | ✅ Native | ✅ Smooth | ✅ Native | ✅ Smooth |

### Summary

The Apple-inspired design system is **universal and adaptive**:

✅ **iOS**: Native Apple experience with full frosted glass, safe areas, momentum scrolling
✅ **Android**: Adapted with Material Design touches (ripple effects, larger touch targets)
✅ **Windows**: Optimized with Windows scrollbars, Ctrl shortcuts, proper focus outlines
✅ **macOS**: Premium Apple experience with Cmd shortcuts, overlay scrollbars
✅ **Linux**: Functional with proper scrollbars, Ctrl shortcuts, all features working

**Key Principle**: Design looks and feels premium on ALL platforms while respecting platform conventions where it matters (keyboard shortcuts, scrollbars, touch targets).
