# CRM API Reference for Frontend (Kiro)

**Generated:** November 11, 2025
**Status:** Backend Ready - Frontend kan starte
**Tech Stack:** TRPC + Drizzle ORM + PostgreSQL (Supabase)

---

## 📋 Available CRM Endpoints

### **crm.customer** - Customer & Property Management

#### `listProfiles`

**Purpose:** Hent liste af customer profiles med søgning og pagination

```typescript
// Input
{
  search?: string;       // Søg i name, email, phone
  limit?: number;        // Default: 20, max: 100
  offset?: number;       // Default: 0
}

// Output
CustomerProfile[] = [
  {
    id: number;
    userId: number;
    leadId: number | null;
    email: string;
    name: string;
    phone: string | null;
    status: "new" | "active" | "vip" | "at_risk" | "inactive";
    tags: string[];
    customerType: "private" | "business" | null;
    totalInvoiced: number;
    totalPaid: number;
    balance: number;
    invoiceCount: number;
    emailCount: number;
    lastContactDate: string | null;
    lastSyncDate: string | null;
    aiResume: string | null;
    createdAt: string;
    updatedAt: string;
  }
]

// Example
const { data } = trpc.crm.customer.listProfiles.useQuery({
  search: "jensen",
  limit: 50
});

```text

#### `getProfile`

**Purpose:** Hent enkelt customer profile

```typescript
// Input
{
  id: number;
}

// Output
CustomerProfile;

// Example
const { data } = trpc.crm.customer.getProfile.useQuery({ id: 123 });

```text

#### `listProperties`

**Purpose:** Hent alle ejendomme for en customer

```typescript
// Input
{ customerProfileId: number }

// Output
CustomerProperty[] = [
  {
    id: number;
    customerProfileId: number;
    address: string;
    city: string | null;
    postalCode: string | null;
    isPrimary: boolean;
    attributes: Record<string, any>;  // { type, size, accessCode, parking, etc. }
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }
]

// Example
const { data } = trpc.crm.customer.listProperties.useQuery({
  customerProfileId: 123
});

```text

#### `createProperty`

**Purpose:** Opret ny ejendom for en customer

```typescript
// Input
{
  customerProfileId: number;
  address: string;          // Min 3 chars
  city?: string;
  postalCode?: string;
  isPrimary?: boolean;      // Default: false
  attributes?: Record<string, any>;
  notes?: string;
}

// Output
CustomerProperty

// Example
const { mutate } = trpc.crm.customer.createProperty.useMutation();
mutate({
  customerProfileId: 123,
  address: "Vesterbrogade 10",
  city: "København V",
  postalCode: "1620",
  isPrimary: true,
  attributes: {
    type: "villa",
    size: 150,
    accessCode: "1234",
    parking: "Gade parkering"
  }
});

```text

#### `updateProperty`

**Purpose:** Opdater eksisterende ejendom

```typescript
// Input
{
  id: number;
  address?: string;
  city?: string;
  postalCode?: string;
  isPrimary?: boolean;
  attributes?: Record<string, any>;
  notes?: string;
}

// Output
CustomerProperty

// Example
const { mutate } = trpc.crm.customer.updateProperty.useMutation();
mutate({ id: 456, isPrimary: true });

```text

#### `deleteProperty`

**Purpose:** Slet ejendom

```typescript
// Input
{
  id: number;
}

// Output
{
  success: boolean;
}

```text

---

### **crm.lead** - Lead Management

#### `listLeads`

**Purpose:** Hent leads med filtering

```typescript
// Input
{
  status?: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  limit?: number;        // Default: 20, max: 100
  offset?: number;       // Default: 0
}

// Output
Lead[] = [
  {
    id: number;
    userId: number;
    source: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
    score: number;
    notes: string | null;
    metadata: Record<string, any> | null;
    assignedTo: string | null;
    assignedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }
]

// Example
const { data } = trpc.crm.lead.listLeads.useQuery({ status: "new" });

```text

#### `getLead`

**Purpose:** Hent enkelt lead

```typescript
// Input
{
  id: number;
}

// Output
Lead;

```text

#### `updateLeadStatus`

**Purpose:** Opdater lead status (for kanban drag-drop)

```typescript
// Input
{
  id: number;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
}

// Output
{
  success: boolean;
}

// Example (Kanban board)
const { mutate } = trpc.crm.lead.updateLeadStatus.useMutation();
mutate({ id: 789, status: "qualified" });

```text

#### `convertLeadToCustomer`

**Purpose:** Konvertér lead til customer profile

```typescript
// Input
{
  id: number;
}

// Output
{
  success: boolean;
  customerProfileId: number;
}

// Example
const { mutate } = trpc.crm.lead.convertLeadToCustomer.useMutation();
mutate(
  { id: 789 },
  {
    onSuccess: data => {
      navigate(`/crm/customers/${data.customerProfileId}`);
    },
  }
);

```text

---

### **crm.booking** - Service Booking Management

#### `listBookings`

**Purpose:** Hent bookings med filtering

```typescript
// Input
{
  customerProfileId?: number;
  start?: string;          // ISO 8601 datetime
  end?: string;            // ISO 8601 datetime
  limit?: number;          // Default: 50, max: 100
  offset?: number;         // Default: 0
}

// Output
Booking[] = [
  {
    id: number;
    userId: number;
    customerProfileId: number;
    propertyId: number | null;
    serviceTemplateId: number | null;
    title: string | null;
    notes: string | null;
    scheduledStart: string;   // ISO datetime
    scheduledEnd: string | null;
    status: "planned" | "in_progress" | "completed" | "cancelled";
    assigneeUserId: number | null;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  }
]

// Example (Calendar view)
const { data } = trpc.crm.booking.listBookings.useQuery({
  start: "2025-11-01T00:00:00Z",
  end: "2025-11-30T23:59:59Z"
});

```text

#### `createBooking`

**Purpose:** Opret ny booking

```typescript
// Input
{
  customerProfileId: number;
  propertyId?: number;
  serviceTemplateId?: number;
  title?: string;
  notes?: string;
  scheduledStart: string;      // ISO datetime
  scheduledEnd?: string;
  assigneeUserId?: number;
}

// Output
Booking

// Example (BookingForm wizard)
const { mutate } = trpc.crm.booking.createBooking.useMutation();
mutate({
  customerProfileId: 123,
  propertyId: 456,
  serviceTemplateId: 1,  // Grundrengøring
  scheduledStart: "2025-11-15T09:00:00Z",
  scheduledEnd: "2025-11-15T13:00:00Z",
  assigneeUserId: 2,
  notes: "Husk adgangskode: 1234"
});

```text

#### `updateBookingStatus`

**Purpose:** Opdater booking status (mobile field worker)

```typescript
// Input
{
  id: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
}

// Output
Booking;

// Example (Field worker app)
const { mutate } = trpc.crm.booking.updateBookingStatus.useMutation();
mutate({ id: 999, status: "in_progress" }); // Worker started job

```text

#### `deleteBooking`

**Purpose:** Slet booking

```typescript
// Input
{
  id: number;
}

// Output
{
  success: boolean;
}

```text

---

### **crm.serviceTemplate** - Service Templates (NEW! ✨)

#### `list`

**Purpose:** Hent service templates til BookingForm dropdown

```typescript
// Input
{
  category?: "general" | "vinduespolering" | "facaderens" | "tagrens" | "graffiti" | "other";
  isActive?: boolean;
  limit?: number;       // Default: 50, max: 100
  offset?: number;      // Default: 0
}

// Output
ServiceTemplate[] = [
  {
    id: number;
    userId: number;
    title: string;               // "Grundrengøring", "Flytterengøring"
    description: string | null;
    category: "general" | "vinduespolering" | "facaderens" | "tagrens" | "graffiti" | "other";
    durationMinutes: number | null;
    priceDkk: number | null;
    isActive: boolean;
    metadata: Record<string, any>;  // { pricePerHour, checklist, tasks, requiresPhotos }
    createdAt: string;
    updatedAt: string;
  }
]

// Example (BookingForm)
const { data: templates } = trpc.crm.serviceTemplate.list.useQuery({
  isActive: true
});

```text

#### `get`

**Purpose:** Hent enkelt service template

```typescript
// Input
{
  id: number;
}

// Output
ServiceTemplate;

```text

#### `create`

**Purpose:** Opret ny service template (admin)

```typescript
// Input
{
  title: string;              // Min 3, max 100 chars
  description?: string;
  category?: "general" | "vinduespolering" | "facaderens" | "tagrens" | "graffiti" | "other";
  durationMinutes?: number;   // 15-1440 (15min - 24h)

  priceDkk?: number;          // Min 0
  isActive?: boolean;         // Default: true
  metadata?: Record<string, any>;
}

// Output
ServiceTemplate

```text

#### `update`

**Purpose:** Opdater service template

```typescript
// Input
{
  id: number;
  title?: string;
  description?: string;
  category?: "general" | "vinduespolering" | "facaderens" | "tagrens" | "graffiti" | "other";
  durationMinutes?: number;
  priceDkk?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

// Output
ServiceTemplate

```text

#### `delete`

**Purpose:** Soft delete (set isActive=false)

```typescript
// Input
{
  id: number;
}

// Output
{
  success: boolean;
}

```bash

---

## 🎯 Rendetalje Standard Service Templates

Følgende templates er seedet i databasen (kørt via `pnpm run crm:seed:templates`):

1. **Grundrengøring** - 4t, 1396 kr (349 kr/t)

1. **Flytterengøring** - 8t, 2792 kr (kræver fotos)

1. **Vinduespudsning - Lejlighed** - 2t, 698 kr

1. **Vinduespudsning - Villa** - 4t, 1396 kr

1. **Erhvervsrengøring - Kontor** - 3t, 1047 kr (recurring support)

1. **Dybderengøring** - 6t, 2094 kr (forår/efterår)

---

## � Dashboard Stats (NEW! ✨)

### **crm.stats.getDashboardStats**

**Purpose:** Hent real-time dashboard metrics for CRM oversigt

```typescript
// Input
// No input parameters - returns stats for authenticated user

// Output
{
  customers: {
    total: number;        // Alle customers
    active: number;       // Status = 'active'
    vip: number;          // Status = 'vip'
    atRisk: number;       // Status = 'at_risk'
  },
  revenue: {
    total: number;        // Sum af totalInvoiced (øre)
    paid: number;         // Sum af totalPaid (øre)
    outstanding: number;  // Sum af balance (øre)
  },
  bookings: {
    planned: number;      // Status = 'planned'
    inProgress: number;   // Status = 'in_progress'
    completed: number;    // Status = 'completed'
  }
}

// Example (CRM Dashboard)
const { data: stats } = trpc.crm.stats.getDashboardStats.useQuery();

// Display in UI
<div>
  <Card>
    <h3>Customers</h3>
    <p>Total: {stats.customers.total}</p>
    <p>Active: {stats.customers.active}</p>
    <p>VIP: {stats.customers.vip}</p>
    {stats.customers.atRisk > 0 && (
      <Alert variant="warning">
        ⚠️ {stats.customers.atRisk} customers at risk
      </Alert>
    )}
  </Card>
  <Card>
    <h3>Revenue</h3>
    <p>Total: {(stats.revenue.total / 100).toLocaleString('da-DK')} kr</p>
    <p>Paid: {(stats.revenue.paid / 100).toLocaleString('da-DK')} kr</p>
    <p>Outstanding: {(stats.revenue.outstanding / 100).toLocaleString('da-DK')} kr</p>
  </Card>
</div>

```text

---

## 📝 Customer Notes (NEW! ✨)

### **crm.customer.addNote**

**Purpose:** Tilføj note til customer profile

```typescript
// Input
{
  customerProfileId: number;
  content: string; // Min 1, max 5000 chars
}

// Output
{
  id: number;
  customerId: number;
  userId: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

// Example
const addNote = trpc.crm.customer.addNote.useMutation();
addNote.mutate({
  customerProfileId: 123,
  content: "Kunde ønsker service kl. 08:00. Adgangskode til port: 1234",
});

```text

### **crm.customer.listNotes**

**Purpose:** Hent alle notes for en customer (kronologisk)

```typescript
// Input
{
  customerProfileId: number;
  limit?: number;        // Default: 50, max: 100
  offset?: number;       // Default: 0
}

// Output
CustomerNote[] = [
  {
    id: number;
    customerId: number;
    userId: number;
    note: string;
    createdAt: string;
    updatedAt: string;
  }
]

// Example (CustomerProfile timeline)
const { data: notes } = trpc.crm.customer.listNotes.useQuery({
  customerProfileId: 123
});

// Display in timeline
{notes?.map(note => (
  <TimelineItem key={note.id}>
    <p>{note.note}</p>
    <small>{new Date(note.createdAt).toLocaleString('da-DK')}</small>
  </TimelineItem>
))}

```text

### **crm.customer.updateNote**

**Purpose:** Rediger eksisterende note

```typescript
// Input
{
  id: number;
  content: string; // Min 1, max 5000 chars
}

// Output
CustomerNote;

// Example
const updateNote = trpc.crm.customer.updateNote.useMutation();
updateNote.mutate({
  id: 456,
  content: "OPDATERET: Ny adgangskode til port: 5678",
});

```text

### **crm.customer.deleteNote**

**Purpose:** Slet note

```typescript
// Input
{
  id: number;
}

// Output
{
  success: boolean;
}

// Example
const deleteNote = trpc.crm.customer.deleteNote.useMutation();
deleteNote.mutate({ id: 456 });

```text

---

## 🔧 Setup i Frontend

### 1. TRPC Client Setup

````typescript
// client/src/lib/trpc.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

---

## ⚙️ Advanced CRM Extensions (Phase 2-6)

Namespace: `crm.extensions`

This section documents the advanced CRM backend features implemented in Phase 2-6: Opportunities/Deals pipeline, Customer Segmentation, Document management, Audit logging, and Relationship mapping.

---

### **crm.extensions.createOpportunity**

**Purpose:** Opret en ny opportunity/deal for en kunde

```typescript

// Input
{
  customerProfileId: number;
  title: string;
  description?: string;
  value: number; // i øre
  probability: number; // 0-100
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  expectedCloseDate?: string; // ISO date
  metadata?: Record<string, any>;
}

// Output
Opportunity

```text

**Example:**

```typescript

const { mutate } = trpc.crm.extensions.createOpportunity.useMutation();
mutate({
  customerProfileId: 1,
  title: "Stort facaderens projekt",
  value: 75000 * 100,

  probability: 60,
  stage: "proposal",
  expectedCloseDate: "2025-11-25",
});

```text

### **crm.extensions.listOpportunities**

**Purpose:** List opportunities with filters & pagination

```typescript

// Input
{
  customerProfileId?: number;
  stage?: string;
  minValue?: number;
  maxValue?: number;
  limit?: number; // default 20
  offset?: number; // default 0
}

// Output
Opportunity[]

```text

### **crm.extensions.updateOpportunity**

**Purpose:** Update an existing opportunity

```typescript

// Input
{
  id: number;
  title?: string;
  description?: string;
  value?: number;
  probability?: number;
  stage?: string;
  expectedCloseDate?: string;
  wonReason?: string;
  lostReason?: string;
}

// Output
Opportunity

```text

### **crm.extensions.deleteOpportunity**

**Purpose:** Delete an opportunity

```typescript

// Input
{
  id: number;
}
// Output
{
  success: boolean;
}

```text

### **crm.extensions.getPipelineStats**

**Purpose:** Get aggregated pipeline stats by stage

```typescript

// Input: none
// Output:
{ [stage: string]: { count: number; totalValue: number; avgProbability: number } }

```text

### **crm.extensions.getRevenueForecast**

**Purpose:** Get revenue forecast (total & weighted by probability)

```typescript

// Input: none
// Output:
{
  totalValue: number;
  weightedValue: number;
  count: number;
}

```text

---

### **crm.extensions.createSegment**

**Purpose:** Create a customer segment (manual or automatic)

```typescript

// Input
{
  name: string;
  type: "manual" | "automatic";
  description?: string;
  rules?: Record<string, any>; // JSONB rule object
  color?: string;
}

// Output
Segment

```text

### **crm.extensions.listSegments**

**Purpose:** List segments for the authenticated user

```typescript

// Input
{ limit?: number; offset?: number }
// Output
Segment[]

```text

### **crm.extensions.addToSegment**

**Purpose:** Batch add customers to a segment

```typescript

// Input
{ segmentId: number; customerProfileIds: number[] }
// Output
{ added: number }

```text

### **crm.extensions.removeFromSegment**

**Purpose:** Batch remove customers from a segment

```typescript

// Input
{ segmentId: number; customerProfileIds: number[] }
// Output
{ removed: number }

```text

### **crm.extensions.getSegmentMembers**

**Purpose:** List members of a segment

```typescript

// Input
{ segmentId: number; limit?: number; offset?: number }
// Output
CustomerProfile[]

```text

---

### **crm.extensions.createDocument**

**Purpose:** Create a document metadata record for a customer (file upload handled by Supabase Storage)

```typescript

// Input
{
  customerProfileId: number;
  filename: string;
  storageUrl: string; // Supabase storage URL
  mimeType: string;
  filesize: number; // bytes
  category?: string;
  tags?: string[];
}

// Output
CustomerDocument

```text

### **crm.extensions.listDocuments**

**Purpose:** List documents for a customer

```typescript

// Input
{ customerProfileId: number; category?: string; limit?: number; offset?: number }
// Output
CustomerDocument[]

```text

### **crm.extensions.deleteDocument**

**Purpose:** Delete document metadata record (storage deletion optional)

```typescript

// Input
{
  id: number;
}
// Output
{
  success: boolean;
}

```text

---

### **crm.extensions.logAudit**

**Purpose:** Log an audit entry for GDPR and security

```typescript

// Input
{
  entityType: string; // e.g., 'customer', 'opportunity'
  entityId: number;
  action: 'created' | 'updated' | 'deleted' | 'exported' | 'consent_given' | 'consent_revoked';
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
// Output
AuditLogEntry

```text

### **crm.extensions.getAuditLog**

**Purpose:** Retrieve audit logs with filters

```typescript

// Input
{ entityType?: string; entityId?: number; action?: string; limit?: number; offset?: number }
// Output
AuditLogEntry[]

```text

---

### **crm.extensions.createRelationship**

**Purpose:** Create a relationship between two customers

```typescript

// Input
{
  customerProfileId: number;
  relatedCustomerProfileId: number;
  relationshipType: 'parent_company' | 'subsidiary' | 'referrer' | 'referred_by' | 'partner' | 'competitor';
  strength?: number; // 1-10
  description?: string;
}
// Output
CustomerRelationship

```text

### **crm.extensions.getRelationships**

**Purpose:** List relationships for a customer

```typescript

// Input
{ customerProfileId?: number; relationshipType?: string; limit?: number; offset?: number }
// Output
CustomerRelationship[]

```text

### **crm.extensions.deleteRelationship**

**Purpose:** Delete a relationship entry

```typescript

// Input
{
  id: number;
}
// Output
{
  success: boolean;
}

```text

---

### Notes & Links

- Router: `server/routers/crm-extensions-router.ts`

- Tests: `server/scripts/test-crm-extensions.ts`

- DB schema: `drizzle/schema.ts` (lines 738-920)

export const trpc = createTRPCReact<AppRouter>();

```text

### 2. TanStack Query Provider

```typescript
// client/src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 *60* 1000, // 5 minutes

      retry: 1,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/trpc',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include', // Send cookies
        });
      },
    }),
  ],
});

root.render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

```text

### 3. Example Usage i Components

```typescript
// CustomerList.tsx
import { trpc } from '@/lib/trpc';

export function CustomerList() {
  const { data: customers, isLoading } = trpc.crm.customer.listProfiles.useQuery({
    limit: 50
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {customers?.map(customer => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
}

// BookingForm.tsx
export function BookingForm() {
  const { data: templates } = trpc.crm.serviceTemplate.list.useQuery({
    isActive: true
  });

  const createBooking = trpc.crm.booking.createBooking.useMutation({
    onSuccess: () => {
      toast.success('Booking created!');
    }
  });

  const handleSubmit = (data) => {
    createBooking.mutate({
      customerProfileId: data.customerId,
      serviceTemplateId: data.templateId,
      scheduledStart: data.start,
      scheduledEnd: data.end,
    });
  };
}

```text

---

## ✅ Testing

Test alle endpoints med:

```bash

# CRM smoke tests

pnpm run crm:test:staging

# Med ChromaDB aktiveret

pnpm run crm:test:staging:chroma

# Watch mode til iteration

pnpm run crm:test:staging:watch

```

---

## 📞 Support

**Backend kontakt:** Jonas ([<jonas@rendetalje.dk>](mailto:jonas@rendetalje.dk))
**Docs:** `.kiro/specs/crm-module/` folder
**Tests:** `server/__tests__/crm-smoke.test.ts`
