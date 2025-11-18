# Auto-Generated Documentation - Friday AI Chat

**Generated:** January 28, 2025  
**Source:** Codebase analysis  
**Version:** 2.0.0

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Component Props & Interfaces](#component-props--interfaces)
3. [Data Flow](#data-flow)
4. [Dependencies](#dependencies)
5. [Examples](#examples)
6. [Diagrams](#diagrams)

---

## API Endpoints

### CRM Module

#### Customer Management

**Router:** `crm.customer`

**Endpoints:**

1. **`listProfiles`** - List customer profiles
   - **Type:** Query
   - **Input:**
     ```typescript
     {
       search?: string;      // Optional search query
       limit?: number;        // Default: 20, max: 100
       offset?: number;       // Default: 0
     }
     ```
   - **Output:** `CustomerProfile[]`
   - **Auth:** Protected
   - **Cache:** 5 minutes

2. **`getProfile`** - Get customer profile by ID
   - **Type:** Query
   - **Input:**
     ```typescript
     {
       id: number;
     }
     ```
   - **Output:** `CustomerProfile`
   - **Auth:** Protected
   - **RBAC:** Verifies ownership

3. **`createProfile`** - Create new customer profile
   - **Type:** Mutation
   - **Input:**
     ```typescript
     {
       name: string;                    // Min: 1, Max: 255
       email: string;                    // Valid email
       phone?: string;                    // Max: 50
       status?: "new" | "active" | "inactive" | "vip" | "at_risk";
       customerType?: "private" | "erhverv";
       tags?: string[];
     }
     ```
   - **Output:** `CustomerProfile`
   - **Auth:** Protected
   - **Error:** `CONFLICT` if email already exists

4. **`updateProfile`** - Update customer profile
   - **Type:** Mutation
   - **Input:**
     ```typescript
     {
       id: number;
       name?: string;
       email?: string;
       phone?: string;
       status?: "new" | "active" | "inactive" | "vip" | "at_risk";
       customerType?: "private" | "erhverv";
       tags?: string[];
     }
     ```
   - **Output:** `CustomerProfile`
   - **Auth:** Protected
   - **RBAC:** Verifies ownership

5. **`listProperties`** - List customer properties
   - **Type:** Query
   - **Input:**
     ```typescript
     {
       customerProfileId: number;
     }
     ```
   - **Output:** `CustomerProperty[]`
   - **Auth:** Protected

6. **`createProperty`** - Create customer property
   - **Type:** Mutation
   - **Input:**
     ```typescript
     {
       customerProfileId: number;
       address: string;                  // Max: 255
       city: string;                      // Max: 100
       postalCode: string;                 // Max: 20
       isPrimary?: boolean;
       notes?: string;                     // Max: 1000
     }
     ```
   - **Output:** `CustomerProperty`
   - **Auth:** Protected

7. **`listNotes`** - List customer notes
   - **Type:** Query
   - **Input:**
     ```typescript
     {
       customerProfileId: number;
     }
     ```
   - **Output:** `CustomerNote[]`
   - **Auth:** Protected

8. **`addNote`** - Add customer note
   - **Type:** Mutation
   - **Input:**
     ```typescript
     {
       customerProfileId: number;
       content: string;                   // Max: 5000
     }
     ```
   - **Output:** `CustomerNote`
   - **Auth:** Protected

#### Lead Management

**Router:** `crm.lead`

**Endpoints:**

1. **`listLeads`** - List leads
   - **Type:** Query
   - **Input:**
     ```typescript
     {
       status?: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
       limit?: number;        // Default: 20, max: 100
       offset?: number;       // Default: 0
     }
     ```
   - **Output:** `Lead[]`
   - **Auth:** Protected

2. **`createLead`** - Create new lead
   - **Type:** Mutation
   - **Input:**
     ```typescript
     {
       name: string;                      // Min: 1, Max: 255
       email?: string;                     // Valid email
       phone?: string;                     // Max: 50
       company?: string;                   // Max: 255
       source?: string;                    // Max: 100
       notes?: string;
       status?: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
     }
     ```
   - **Output:** `Lead`
   - **Auth:** Protected

3. **`updateLeadStatus`** - Update lead status
   - **Type:** Mutation
   - **Input:**
     ```typescript
     {
       id: number;
       status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
     }
     ```
   - **Output:** `Lead`
   - **Auth:** Protected
   - **RBAC:** Verifies ownership

#### Opportunities/Deals

**Router:** `crm.extensions` (Opportunities)

**Endpoints:**

1. **`createOpportunity`** - Create opportunity
   - **Type:** Mutation
   - **Input:**
     ```typescript
     {
       customerProfileId: number;
       title: string;                     // Max: 255
       description?: string;              // Max: 5000
       stage?: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
       value?: number;                     // Min: 0
       probability?: number;               // Min: 0, Max: 100
       expectedCloseDate?: string;         // ISO date
       nextSteps?: string;                 // Max: 500
       metadata?: Record<string, any>;
     }
     ```
   - **Output:** `Opportunity`
   - **Auth:** Protected

2. **`listOpportunities`** - List opportunities
   - **Type:** Query
   - **Input:**
     ```typescript
     {
       customerProfileId?: number;
       stage?: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
       limit?: number;
       offset?: number;
     }
     ```
   - **Output:** `Opportunity[]`
   - **Auth:** Protected

#### Subscriptions

**Router:** `subscription`

**Endpoints:**

1. **`getByCustomer`** - Get subscription by customer
   - **Type:** Query
   - **Input:**
     ```typescript
     {
       customerProfileId: number;
     }
     ```
   - **Output:** `Subscription | null`
   - **Auth:** Protected

---

## Component Props & Interfaces

### CustomerList Component

**File:** `client/src/pages/crm/CustomerList.tsx`

**Props:** None (page component)

**State:**
```typescript
{
  search: string;
  showCreateModal: boolean;
  formData: {
    name: string;
    email: string;
    phone: string;
    status: "new";
    customerType: "private" | "erhverv";
  };
}
```

**Hooks Used:**
- `usePageTitle("Customers")`
- `useLocation()` - Navigation
- `useDebouncedValue(search, 300)` - Debounced search
- `trpc.crm.customer.listProfiles.useQuery()`
- `trpc.crm.customer.createProfile.useMutation()`

### CustomerDetail Component

**File:** `client/src/pages/crm/CustomerDetail.tsx`

**Props:** None (page component with route params)

**Route Params:**
```typescript
{
  id: string;  // Customer ID from URL
}
```

**State:**
```typescript
{
  activeTab: "overview" | "properties" | "notes" | "relationships" | "subscriptions" | "audit" | "activities";
  showNoteModal: boolean;
  showPropertyModal: boolean;
  editingNote: number | null;
  editingProperty: number | null;
  noteContent: string;
  propertyData: {
    address: string;
    city: string;
    postalCode: string;
    isPrimary: boolean;
    notes: string;
  };
}
```

**Hooks Used:**
- `useRoute<{ id: string }>("/crm/customers/:id")`
- `trpc.crm.customer.getProfile.useQuery()`
- `trpc.crm.customer.listProperties.useQuery()`
- `trpc.crm.customer.listNotes.useQuery()`
- `trpc.crm.activity.listActivities.useQuery()`

### CustomerSubscriptionBadge Component

**File:** `client/src/pages/crm/CustomerList.tsx` (nested component)

**Props:**
```typescript
{
  customerId: number;
}
```

**Returns:** `SubscriptionStatusBadge | null`

### CRMLayout Component

**File:** `client/src/components/crm/CRMLayout.tsx`

**Props:**
```typescript
{
  children: React.ReactNode;
}
```

**Features:**
- Sidebar navigation
- Responsive design
- Active route highlighting

### Database Schema Types

**File:** `drizzle/schema.ts`

**CustomerProfile:**
```typescript
{
  id: number;
  userId: number;
  email: string;
  name: string;
  phone?: string;
  status: "new" | "active" | "inactive" | "vip" | "at_risk";
  customerType: "private" | "erhverv";
  tags: string[];
  totalInvoiced: number;
  totalPaid: number;
  balance: number;
  invoiceCount: number;
  emailCount: number;
  healthScore?: number;
  createdAt: string;  // ISO date
  updatedAt: string;  // ISO date
}
```

**Lead:**
```typescript
{
  id: number;
  userId: number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  score: number;
  createdAt: string;
  updatedAt: string;
}
```

**Opportunity:**
```typescript
{
  id: number;
  userId: number;
  customerProfileId: number;
  title: string;
  description?: string;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  value?: number;
  probability?: number;
  expectedCloseDate?: string;
  nextSteps?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

**Subscription:**
```typescript
{
  id: number;
  userId: number;
  customerProfileId: number;
  status: "active" | "paused" | "cancelled" | "expired";
  startDate: string;
  endDate?: string;
  // ... other fields
}
```

---

## Data Flow

### Customer List Flow

```
User Action
    │
    ├─> Type in search field
    │   └─> useDebouncedValue (300ms delay)
    │       └─> trpc.crm.customer.listProfiles.useQuery()
    │           └─> Backend: crmCustomerRouter.listProfiles
    │               └─> Database: SELECT from customer_profiles
    │                   └─> Cache: 5 minute TTL
    │                       └─> Return CustomerProfile[]
    │                           └─> Render customer cards
    │
    ├─> Click "Create Customer"
    │   └─> Open modal
    │       └─> Fill form
    │           └─> Submit
    │               └─> trpc.crm.customer.createProfile.useMutation()
    │                   └─> Backend: crmCustomerRouter.createProfile
    │                       └─> Validate input (Zod)
    │                           └─> Check duplicate email
    │                               └─> Database: INSERT into customer_profiles
    │                                   └─> Invalidate cache
    │                                       └─> Return CustomerProfile
    │                                           └─> Navigate to /crm/customers/:id
    │
    └─> Click customer card
        └─> Navigate to /crm/customers/:id
            └─> CustomerDetail component
                └─> trpc.crm.customer.getProfile.useQuery()
                    └─> Backend: crmCustomerRouter.getProfile
                        └─> Database: SELECT from customer_profiles WHERE id = ?
                            └─> RBAC: Verify ownership
                                └─> Return CustomerProfile
                                    └─> Render customer details
```

### CSV Export Flow

```
User clicks "Export CSV"
    │
    └─> onClick handler
        └─> Generate CSV content
            ├─> Map customers to CSV rows
            ├─> Escape CSV values
            └─> Create Blob
                └─> Create download link
                    └─> Trigger download
                        └─> Show success toast
```

### Subscription Badge Flow

```
CustomerList renders CustomerSubscriptionBadge
    │
    └─> trpc.subscription.getByCustomer.useQuery()
        └─> Backend: subscriptionRouter.getByCustomer
            └─> Database: SELECT from subscriptions WHERE customerProfileId = ?
                └─> Return Subscription | null
                    └─> If subscription exists
                        └─> Render SubscriptionStatusBadge
                    └─> If null
                        └─> Return null (no badge)
```

---

## Dependencies

### Frontend Dependencies

**Core:**
- `react` ^19.1.1
- `react-dom` ^19.1.1
- `typescript` 5.9.3

**Routing:**
- `wouter` ^3.3.5

**State Management:**
- `@tanstack/react-query` ^5.90.2
- `@trpc/react-query` ^11.6.0

**UI Components:**
- `@radix-ui/*` - UI primitives
- `lucide-react` ^0.453.0 - Icons
- `sonner` ^2.0.7 - Toast notifications
- `tailwindcss` ^4.1.14 - Styling

**Forms:**
- `react-hook-form` ^7.64.0
- `zod` ^4.1.12 - Validation

### Backend Dependencies

**Core:**
- `express` ^4.21.2
- `@trpc/server` ^11.6.0
- `typescript` 5.9.3

**Database:**
- `drizzle-orm` ^0.44.5
- `pg` ^8.12.0
- `postgres` ^3.4.5

**Validation:**
- `zod` ^4.1.12

**Logging:**
- `pino` ^9.4.0

**Security:**
- `helmet` ^8.1.0
- `express-rate-limit` ^8.2.1
- `jose` 6.1.0 - JWT

### External Integrations

**Google Workspace:**
- `googleapis` ^165.0.0
- `google-auth-library` ^10.5.0

**Billy.dk:**
- MCP server integration

**AI Services:**
- `@google/genai` ^1.29.1
- `langfuse` ^3.38.6

---

## Examples

### Example: Create Customer

**Frontend:**
```typescript
const createMutation = trpc.crm.customer.createProfile.useMutation({
  onSuccess: (customer) => {
    utils.crm.customer.listProfiles.invalidate();
    toast.success("Customer created successfully");
    navigate(`/crm/customers/${customer.id}`);
  },
  onError: (error) => {
    toast.error(error.message || "Failed to create customer");
  },
});

await createMutation.mutateAsync({
  name: "John Doe",
  email: "john@example.com",
  phone: "+45 12 34 56 78",
  customerType: "private",
  status: "new",
});
```

**Backend:**
```typescript
createProfile: protectedProcedure
  .input(
    z.object({
      name: validationSchemas.name,
      email: validationSchemas.email,
      phone: validationSchemas.phone.optional(),
      customerType: z.enum(["private", "erhverv"]).default("private"),
      status: z.enum(["new", "active", "inactive", "vip", "at_risk"]).default("new"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    // ... validation and creation logic
  });
```

### Example: Search Customers

**Frontend:**
```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 300);

const { data: customers } = trpc.crm.customer.listProfiles.useQuery({
  search: debouncedSearch || undefined,
  limit: 50,
});
```

**Backend:**
```typescript
listProfiles: protectedProcedure
  .input(
    z.object({
      search: validationSchemas.searchQuery.optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    const whereClause = input.search
      ? and(
          eq(customerProfiles.userId, ctx.user.id),
          or(
            ilike(customerProfiles.name, `%${input.search}%`),
            ilike(customerProfiles.email, `%${input.search}%`)
          )!
        )
      : eq(customerProfiles.userId, ctx.user.id);
    
    return await db
      .select()
      .from(customerProfiles)
      .where(whereClause)
      .orderBy(desc(customerProfiles.updatedAt))
      .limit(input.limit)
      .offset(input.offset);
  });
```

### Example: Export CSV

```typescript
const exportCustomersToCSV = (customers: CustomerProfile[]) => {
  const csvEscape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = ["ID", "Name", "Email", "Phone", "Status"];
  const rows = customers.map(c => [
    c.id, c.name || "", c.email || "", c.phone || "", c.status || ""
  ]);

  const csvContent = [
    headers.map(csvEscape).join(","),
    ...rows.map(row => row.map(csvEscape).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};
```

---

## Diagrams

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CustomerList │  │CustomerDetail│  │LeadPipeline  │      │
│  │              │  │              │  │              │      │
│  │ - Search     │  │ - Overview   │  │ - Kanban     │      │
│  │ - Create     │  │ - Properties │  │ - Filters    │      │
│  │ - Export CSV │  │ - Notes      │  │ - Create     │      │
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
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐     │  │
│  │  │ crm.customer│ │ crm.lead   │ │crm.extensions│    │  │
│  │  └────────────┘ └────────────┘ └────────────┘     │  │
│  │  ┌────────────┐ ┌────────────┐                     │  │
│  │  │ subscription│ │  activity   │                     │  │
│  │  └────────────┘ └────────────┘                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                      │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │            Business Logic Layer                       │  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │  │
│  │  │Customer DB   │  │Subscription  │  │Activity  │  │  │
│  │  │Helpers       │  │Helpers       │  │Helpers   │  │  │
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
                     │ PostgreSQL Protocol
                     │
┌────────────────────▼──────────────────────────────────────┐
│                   Database Layer                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              PostgreSQL Database                     │ │
│  │                                                      │ │
│  │  Tables:                                            │ │
│  │  - customer_profiles                                 │ │
│  │  - customer_properties                               │ │
│  │  - customer_notes                                    │ │
│  │  - leads                                             │ │
│  │  - opportunities                                     │ │
│  │  - subscriptions                                     │ │
│  │  - customer_activities                               │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### Customer Creation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Click "Create Customer"
     ▼
┌─────────────────────┐
│  CustomerList.tsx   │
│  - Open modal       │
│  - Show form        │
└────┬────────────────┘
     │
     │ 2. Fill form & submit
     ▼
┌─────────────────────┐
│  Form Validation    │
│  - Check required   │
│  - Validate email   │
└────┬────────────────┘
     │
     │ 3. Call mutation
     ▼
┌─────────────────────┐
│  tRPC Client        │
│  createProfile      │
└────┬────────────────┘
     │
     │ 4. HTTP POST
     ▼
┌─────────────────────┐
│  Backend Router     │
│  crmCustomerRouter  │
│  .createProfile     │
└────┬────────────────┘
     │
     │ 5. Validate input (Zod)
     ▼
┌─────────────────────┐
│  Check Duplicate    │
│  - Query by email   │
└────┬────────────────┘
     │
     │ 6. Insert into DB
     ▼
┌─────────────────────┐
│  Database           │
│  INSERT customer    │
└────┬────────────────┘
     │
     │ 7. Invalidate cache
     ▼
┌─────────────────────┐
│  Cache              │
│  Clear customer list│
└────┬────────────────┘
     │
     │ 8. Return customer
     ▼
┌─────────────────────┐
│  Frontend           │
│  - Show success     │
│  - Navigate to detail│
└─────────────────────┘
```

### Data Relationships

```
customer_profiles
    │
    ├─── customer_properties (1:N)
    │    └─── Properties/Addresses
    │
    ├─── customer_notes (1:N)
    │    └─── Notes/History
    │
    ├─── opportunities (1:N)
    │    └─── Deals/Pipeline
    │
    ├─── subscriptions (1:N)
    │    └─── Active subscriptions
    │
    ├─── customer_activities (1:N)
    │    └─── Activity log
    │
    └─── leads (N:1)
         └─── Converted from lead
```

---

## Summary

This documentation was auto-generated from the codebase on January 28, 2025. It includes:

- **API Endpoints:** All tRPC procedures with input/output types
- **Component Props:** React component interfaces and state
- **Data Flow:** Step-by-step flow diagrams
- **Dependencies:** All major dependencies listed
- **Examples:** Code examples for common operations
- **Diagrams:** ASCII architecture and flow diagrams

**Last Updated:** January 28, 2025  
**Maintained by:** Auto-generated from codebase

