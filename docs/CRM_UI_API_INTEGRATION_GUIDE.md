# CRM UI-to-API Integration Guide

**Author:** Development Team  
**Last Updated:** January 28, 2025  
**Version:** 1.0.0

## Overview

This guide documents the UI-to-API integration patterns used in the CRM module, including tRPC hook usage, state management, accessibility improvements, and best practices for connecting React components to backend APIs.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [tRPC Integration Patterns](#trpc-integration-patterns)
3. [State Handling](#state-handling)
4. [Accessibility Implementation](#accessibility-implementation)
5. [Component Examples](#component-examples)
6. [Best Practices](#best-practices)
7. [Common Pitfalls](#common-pitfalls)

---

## Architecture Overview

### Component Structure

The CRM module follows a consistent pattern for connecting UI components to backend APIs:

```
CRM Page Component
├── tRPC Hook (useQuery/useMutation)
├── State Management (React Query)
├── Loading State Component
├── Error State Component
├── Empty State Component
└── Success State (Data Display)
```

### Data Flow

```
User Action → Component → tRPC Hook → Backend API → Database
                ↓
         React Query Cache
                ↓
         Component Re-render
```

---

## tRPC Integration Patterns

### Query Hooks (Data Fetching)

#### Basic Query Pattern

```typescript
import { trpc } from "@/lib/trpc";

export default function CustomerList() {
  const { data, isLoading, error, isError } = trpc.crm.customer.listProfiles.useQuery(
    {
      search: debouncedSearch || undefined,
      limit: 50,
    }
  );

  // Component implementation...
}
```

#### Query with No Input Parameters

For queries that don't require input parameters:

```typescript
const { data: stats, isLoading, error, isError } = 
  trpc.crm.stats.getDashboardStats.useQuery();
```

**Note:** When a query has no input, call `useQuery()` with no arguments. Do not pass `undefined` or an empty object.

#### Query with Options

```typescript
const { data, isLoading, error } = trpc.crm.customer.listProfiles.useQuery(
  { limit: 50 },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (React Query v5)
    refetchOnWindowFocus: false,
    enabled: someCondition, // Conditional fetching
  }
);
```

### Mutation Hooks (Data Updates)

#### Basic Mutation Pattern

```typescript
const utils = trpc.useUtils();

const createMutation = trpc.crm.customer.createProfile.useMutation({
  onSuccess: () => {
    // Invalidate and refetch
    utils.crm.customer.listProfiles.invalidate();
    toast.success("Customer created");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Usage
await createMutation.mutateAsync({
  name: "John Doe",
  email: "john@example.com",
});
```

#### Optimistic Updates

```typescript
const updateMutation = trpc.crm.lead.updateLead.useMutation({
  onMutate: async (newLead) => {
    // Cancel outgoing refetches
    await utils.crm.lead.listLeads.cancel();
    
    // Snapshot previous value
    const previous = utils.crm.lead.listLeads.getData();
    
    // Optimistically update
    utils.crm.lead.listLeads.setData(undefined, (old) => {
      return old?.map((lead) => 
        lead.id === newLead.id ? { ...lead, ...newLead } : lead
      ) ?? [];
    });
    
    return { previous };
  },
  onError: (err, newLead, context) => {
    // Rollback on error
    if (context?.previous) {
      utils.crm.lead.listLeads.setData(undefined, context.previous);
    }
  },
  onSettled: () => {
    // Always refetch after error or success
    utils.crm.lead.listLeads.invalidate();
  },
});
```

---

## State Handling

All CRM components must handle four states: **Loading**, **Error**, **Empty**, and **Success**.

### Complete State Handling Pattern

```typescript
export default function CustomerList() {
  const { data: customers, isLoading, error, isError } = 
    trpc.crm.customer.listProfiles.useQuery({ limit: 50 });

  // Loading state
  if (isLoading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading customers">
        <LoadingSpinner message="Loading customers..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorDisplay 
        message="Failed to load customers" 
        error={error}
      />
    );
  }

  // Empty state
  if (!customers || customers.length === 0) {
    return (
      <section aria-label="Empty state">
        <AppleCard variant="elevated">
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No customers found</h3>
            <p className="text-muted-foreground">
              Get started by creating your first customer
            </p>
          </div>
        </AppleCard>
      </section>
    );
  }

  // Success state
  return (
    <section aria-label="Customer list">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
        {customers.map((customer) => (
          <CustomerCard key={customer.id} customer={customer} />
        ))}
      </div>
    </section>
  );
}
```

### State Components

#### LoadingSpinner

```typescript
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";

<LoadingSpinner message="Loading customers..." />
```

#### ErrorDisplay

```typescript
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";

<ErrorDisplay 
  message="Failed to load customers" 
  error={error}
/>
```

**Features:**
- Displays error message
- Shows retry button
- Handles network errors gracefully
- Provides user-friendly error messages

---

## Accessibility Implementation

All CRM components follow WCAG 2.1 AA standards for accessibility.

### Semantic HTML

Use proper HTML elements for structure:

```typescript
<main className="p-6">
  <header>
    <h1>Customers</h1>
    <p>Manage your customer profiles</p>
  </header>
  
  <section aria-label="Search customers">
    {/* Search input */}
  </section>
  
  <section aria-label="Customer list">
    {/* Customer cards */}
  </section>
</main>
```

### ARIA Attributes

#### Loading States

```typescript
<div role="status" aria-live="polite" aria-label="Loading customers">
  <LoadingSpinner message="Loading customers..." />
</div>
```

#### Interactive Elements

```typescript
<AppleCard
  role="listitem"
  tabIndex={0}
  aria-label={`Customer: ${customer.name}, ${customer.email}. Status: ${customer.status}. Click to view details.`}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
  {/* Card content */}
</AppleCard>
```

#### Decorative Icons

```typescript
<Users className="w-6 h-6 text-primary" aria-hidden="true" />
```

#### Form Labels

```typescript
<label htmlFor="customer-search" className="sr-only">
  Search customers
</label>
<AppleSearchField
  id="customer-search"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search customers..."
  aria-label="Search customers by name or email"
/>
```

### Keyboard Navigation

All interactive elements must be keyboard accessible:

```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
>
  {/* Content */}
</div>
```

### Focus Indicators

Always include visible focus indicators:

```typescript
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
```

---

## Component Examples

### CRM Dashboard

**File:** `client/src/pages/crm/CRMDashboard.tsx`

**Features:**
- Fetches dashboard statistics from `trpc.crm.stats.getDashboardStats`
- Displays KPIs: customers, leads, bookings, revenue
- Handles all states (loading, error, success)
- Fully accessible with ARIA labels

**Key Implementation:**

```typescript
export default function CRMDashboard() {
  const { data: stats, isLoading, error, isError } = 
    trpc.crm.stats.getDashboardStats.useQuery();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("da-DK").format(num);
  };

  return (
    <CRMLayout>
      <main className="p-6">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div role="status" aria-live="polite" aria-label="Loading dashboard statistics">
            <LoadingSpinner message="Loading dashboard statistics..." />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <ErrorDisplay 
            message="Failed to load dashboard statistics" 
            error={error}
          />
        )}

        {/* Success state */}
        {!isLoading && !isError && stats && (
          <section aria-label="Key performance indicators">
            {/* KPI Cards */}
          </section>
        )}
      </main>
    </CRMLayout>
  );
}
```

### Customer List

**File:** `client/src/pages/crm/CustomerList.tsx`

**Features:**
- Debounced search input
- Pagination support
- Accessible customer cards
- Empty state handling

**Key Implementation:**

```typescript
export default function CustomerList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: customers, isLoading, error, isError } = 
    trpc.crm.customer.listProfiles.useQuery({
      search: debouncedSearch || undefined,
      limit: 50,
    });

  // State handling...
}
```

### Lead Pipeline

**File:** `client/src/pages/crm/LeadPipeline.tsx`

**Features:**
- Kanban board layout
- Lead filtering by stage
- Accessible lead cards
- Keyboard navigation

**Key Implementation:**

```typescript
export default function LeadPipeline() {
  const { data: leads, isLoading, error, isError } = 
    trpc.crm.lead.listLeads.useQuery({ limit: 100 });

  const leadsByStage = useMemo(() => {
    if (!leads) return {};
    const grouped: Record<string, typeof leads> = {};
    stages.forEach((stage) => {
      grouped[stage] = leads.filter((lead) => lead.status === stage);
    });
    return grouped;
  }, [leads, stages]);

  // Render kanban board...
}
```

---

## Best Practices

### 1. Always Handle All States

✅ **Good:**
```typescript
if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorDisplay error={error} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataDisplay data={data} />;
```

❌ **Bad:**
```typescript
return <DataDisplay data={data} />; // No state handling
```

### 2. Use Semantic HTML

✅ **Good:**
```typescript
<main>
  <header>
    <h1>Page Title</h1>
  </header>
  <section aria-label="Content section">
    {/* Content */}
  </section>
</main>
```

❌ **Bad:**
```typescript
<div>
  <div>
    <div>Page Title</div>
  </div>
  <div>
    {/* Content */}
  </div>
</div>
```

### 3. Provide ARIA Labels

✅ **Good:**
```typescript
<button
  aria-label="Close dialog"
  onClick={onClose}
>
  <X className="w-4 h-4" />
</button>
```

❌ **Bad:**
```typescript
<button onClick={onClose}>
  <X className="w-4 h-4" />
</button>
```

### 4. Configure Caching Appropriately

✅ **Good:**
```typescript
trpc.crm.customer.listProfiles.useQuery(
  { limit: 50 },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

❌ **Bad:**
```typescript
// No caching configuration - may cause unnecessary refetches
trpc.crm.customer.listProfiles.useQuery({ limit: 50 });
```

### 5. Invalidate Queries After Mutations

✅ **Good:**
```typescript
const createMutation = trpc.crm.customer.createProfile.useMutation({
  onSuccess: () => {
    utils.crm.customer.listProfiles.invalidate();
  },
});
```

❌ **Bad:**
```typescript
// Mutation doesn't update the list
const createMutation = trpc.crm.customer.createProfile.useMutation();
```

### 6. Use Debouncing for Search

✅ **Good:**
```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 300);

trpc.crm.customer.listProfiles.useQuery({
  search: debouncedSearch || undefined,
});
```

❌ **Bad:**
```typescript
// Triggers API call on every keystroke
trpc.crm.customer.listProfiles.useQuery({
  search: search || undefined,
});
```

---

## Common Pitfalls

### 1. Not Handling All States

**Problem:** Component crashes or shows incorrect UI when data is loading or errors occur.

**Solution:** Always implement loading, error, empty, and success states.

### 2. Missing ARIA Labels

**Problem:** Screen readers can't understand the purpose of interactive elements.

**Solution:** Add descriptive `aria-label` attributes to all interactive elements.

### 3. Forgetting to Invalidate Queries

**Problem:** UI doesn't update after mutations, showing stale data.

**Solution:** Always invalidate related queries in mutation `onSuccess` callbacks.

### 4. Not Using Semantic HTML

**Problem:** Poor accessibility and SEO.

**Solution:** Use proper HTML elements (`<main>`, `<header>`, `<section>`, etc.).

### 5. Missing Keyboard Navigation

**Problem:** Users can't interact with components using only the keyboard.

**Solution:** Add `tabIndex={0}` and `onKeyDown` handlers for all interactive elements.

### 6. Incorrect Query Input for No-Parameter Queries

**Problem:** TypeScript errors when calling queries with no input.

**Solution:** Call `useQuery()` with no arguments, not `useQuery(undefined)` or `useQuery({})`.

---

## API Endpoints Reference

### CRM Stats Router

#### `crm.stats.getDashboardStats`

**Type:** Query (Protected)  
**Input:** None  
**Output:**

```typescript
{
  customers: {
    total: number;
    active: number;
    vip: number;
    atRisk: number;
  };
  revenue: {
    total: number;
    paid: number;
    outstanding: number;
  };
  bookings: {
    planned: number;
    inProgress: number;
    completed: number;
  };
}
```

**Usage:**
```typescript
const { data: stats } = trpc.crm.stats.getDashboardStats.useQuery();
```

### CRM Customer Router

#### `crm.customer.listProfiles`

**Type:** Query (Protected)  
**Input:**

```typescript
{
  search?: string;
  status?: string;
  limit?: number; // default: 20, max: 100
  offset?: number; // default: 0
}
```

**Output:** Array of customer profile objects

**Usage:**
```typescript
const { data: customers } = trpc.crm.customer.listProfiles.useQuery({
  search: "John",
  limit: 50,
});
```

### CRM Lead Router

#### `crm.lead.listLeads`

**Type:** Query (Protected)  
**Input:**

```typescript
{
  status?: string;
  limit?: number; // default: 20, max: 100
  offset?: number; // default: 0
}
```

**Output:** Array of lead objects

**Usage:**
```typescript
const { data: leads } = trpc.crm.lead.listLeads.useQuery({
  limit: 100,
});
```

### CRM Booking Router

#### `crm.booking.listBookings`

**Type:** Query (Protected)  
**Input:**

```typescript
{
  customerProfileId?: number;
  status?: string;
  limit?: number; // default: 20, max: 100
  offset?: number; // default: 0
}
```

**Output:** Array of booking objects

**Usage:**
```typescript
const { data: bookings } = trpc.crm.booking.listBookings.useQuery({
  limit: 100,
});
```

---

## Testing

### Unit Testing

Test state handling:

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { trpc } from "@/lib/trpc";
import CustomerList from "./CustomerList";

test("shows loading state", () => {
  // Mock loading state
  // Assert loading spinner is shown
});

test("shows error state", () => {
  // Mock error
  // Assert error display is shown
});

test("shows empty state", () => {
  // Mock empty data
  // Assert empty state is shown
});

test("shows customer list", async () => {
  // Mock successful data
  // Assert customers are displayed
});
```

### Accessibility Testing

Use `@testing-library/jest-dom` and `jest-axe`:

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("has no accessibility violations", async () => {
  const { container } = render(<CustomerList />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Related Documentation

- [API Reference](./API_REFERENCE.md) - Complete API endpoint documentation
- [CRM Routes Implementation](./CRM_ROUTES_IMPLEMENTATION.md) - Backend implementation details
- [Accessibility Guide](./ACCESSIBILITY_IMPLEMENTATION_GUIDE.md) - Comprehensive accessibility guide
- [Development Guide](./DEVELOPMENT_GUIDE.md) - General development practices

---

## Changelog

### Version 1.0.0 (January 28, 2025)

- Initial documentation
- Documented UI-to-API integration patterns
- Added accessibility implementation guide
- Included component examples
- Documented best practices and common pitfalls

---

**Last Updated:** January 28, 2025  
**Maintained by:** Development Team

