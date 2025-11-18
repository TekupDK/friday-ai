# State Management Guide

**Last Updated:** January 28, 2025  
**Status:** ✅ Well-Implemented

---

## Overview

Friday AI Chat uses a hybrid state management approach:

- **React Query (TanStack Query)** for server state
- **useState/useReducer** for local UI state
- **Context API** for shared UI state (when needed)

This guide documents the patterns and best practices used throughout the application.

---

## Architecture

### State Management Layers

```
┌─────────────────────────────────────┐
│   React Components                  │
│   (UI State: useState/useReducer)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   React Query (Server State)        │
│   - useQuery (data fetching)        │
│   - useMutation (data updates)      │
│   - Cache management                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   tRPC Client                        │
│   - Type-safe API calls             │
│   - Automatic CSRF token injection  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Backend API (tRPC)                 │
│   - Server-side validation          │
│   - Database queries                │
└─────────────────────────────────────┘
```

---

## Server State (React Query)

### Query Pattern

**Basic Query:**

```typescript
import { trpc } from "@/lib/trpc";

export default function CustomerList() {
  const { data, isLoading, error, isError } =
    trpc.crm.customer.listProfiles.useQuery({
      search: debouncedSearch || undefined,
      limit: 50,
    });

  // Handle states: loading, error, success
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay error={error} />;
  return <CustomerList data={data} />;
}
```

**Query with Options:**

```typescript
const { data } = trpc.crm.customer.listProfiles.useQuery(
  { limit: 50 },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: someCondition, // Conditional fetching
  }
);
```

### Mutation Pattern

**Basic Mutation:**

```typescript
const utils = trpc.useUtils();

const createMutation = trpc.crm.customer.createProfile.useMutation({
  onSuccess: () => {
    // Invalidate and refetch
    utils.crm.customer.listProfiles.invalidate();
    toast.success("Customer created");
  },
  onError: error => {
    toast.error(error.message);
  },
});

// Usage
await createMutation.mutateAsync({
  name: "John Doe",
  email: "john@example.com",
});
```

**Optimistic Updates:**

```typescript
const updateMutation = trpc.crm.lead.updateLead.useMutation({
  onMutate: async newLead => {
    // Cancel outgoing refetches
    await utils.crm.lead.listLeads.cancel();

    // Snapshot previous value
    const previous = utils.crm.lead.listLeads.getData();

    // Optimistically update
    utils.crm.lead.listLeads.setData(undefined, old => {
      return (
        old?.map(lead =>
          lead.id === newLead.id ? { ...lead, ...newLead } : lead
        ) ?? []
      );
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

## Local State (useState/useReducer)

### UI State Pattern

**Simple UI State:**

```typescript
const [search, setSearch] = useState("");
const [isOpen, setIsOpen] = useState(false);
```

**Debounced Input:**

```typescript
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 300);

// Use debouncedSearch in queries
const { data } = trpc.crm.customer.listProfiles.useQuery({
  search: debouncedSearch || undefined,
});
```

**Complex UI State (useReducer):**

```typescript
type State = {
  selectedItems: string[];
  filter: "all" | "active" | "inactive";
  sortBy: "name" | "date";
};

type Action =
  | { type: "TOGGLE_ITEM"; id: string }
  | { type: "SET_FILTER"; filter: State["filter"] }
  | { type: "SET_SORT"; sortBy: State["sortBy"] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_ITEM":
      return {
        ...state,
        selectedItems: state.selectedItems.includes(action.id)
          ? state.selectedItems.filter(id => id !== action.id)
          : [...state.selectedItems, action.id],
      };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    case "SET_SORT":
      return { ...state, sortBy: action.sortBy };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, {
  selectedItems: [],
  filter: "all",
  sortBy: "name",
});
```

---

## Cache Strategy

### Cache Configuration

The application uses intelligent cache strategies based on data type:

```typescript
// From client/src/lib/cacheStrategy.ts

export const CACHE_CONFIGS = {
  // Real-time data - short cache
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  // User interaction data - medium cache
  interactive: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },

  // Reference data - long cache
  reference: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },

  // Static data - very long cache
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
};
```

### Data Type Mapping

```typescript
// Automatic cache config based on data type
getCacheConfig("emails"); // → interactive (2 min)
getCacheConfig("leads"); // → interactive (2 min)
getCacheConfig("bookings"); // → reference (15 min)
getCacheConfig("invoices"); // → reference (15 min)
getCacheConfig("customers"); // → static (1 hour)
getCacheConfig("dashboard"); // → interactive (2 min)
getCacheConfig("auth"); // → realtime (30 sec)
```

---

## State Handling Patterns

### Complete State Handling

All components must handle four states: **Loading**, **Error**, **Empty**, and **Success**.

```typescript
export default function CustomerList() {
  const { data, isLoading, error, isError } =
    trpc.crm.customer.listProfiles.useQuery({ limit: 50 });

  // Loading state
  if (isLoading) {
    return (
      <div role="status" aria-live="polite">
        <LoadingSpinner message="Loading customers..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return <ErrorDisplay message="Failed to load customers" error={error} />;
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No customers found</p>
      </div>
    );
  }

  // Success state
  return (
    <section aria-label="Customer list">
      {data.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </section>
  );
}
```

---

## Context API (When Needed)

### Shared UI State

Use Context API sparingly, only for state that needs to be shared across many components:

```typescript
// Example: EmailContext for email selection state
const EmailContext = createContext<{
  selectedEmail: Email | null;
  setSelectedEmail: (email: Email | null) => void;
}>({
  selectedEmail: null,
  setSelectedEmail: () => {},
});

export function EmailContextProvider({ children }: { children: ReactNode }) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  return (
    <EmailContext.Provider value={{ selectedEmail, setSelectedEmail }}>
      {children}
    </EmailContext.Provider>
  );
}
```

**Note:** Prefer React Query for server state, useState for local state. Only use Context for truly shared UI state.

---

## Best Practices

### ✅ DO

1. **Use React Query for all server state**
   - Data fetching, mutations, caching
   - Automatic refetching, error handling

2. **Use useState for simple UI state**
   - Form inputs, toggles, modals
   - Component-specific state

3. **Use useReducer for complex UI state**
   - Multiple related state values
   - Complex state transitions

4. **Implement optimistic updates for mutations**
   - Better UX for fast actions
   - Always rollback on error

5. **Handle all states (loading, error, empty, success)**
   - Consistent UX across components
   - Accessibility considerations

6. **Use debounced values for search/filter inputs**
   - Reduce API calls
   - Better performance

7. **Invalidate queries after mutations**
   - Keep data fresh
   - Use `utils.invalidate()` or `invalidateQueries()`

### ❌ DON'T

1. **Don't store server state in useState**
   - Use React Query instead
   - Avoid manual cache management

2. **Don't use Context for server state**
   - React Query handles this better
   - Context is for shared UI state only

3. **Don't forget error handling**
   - Always handle error states
   - Show user-friendly error messages

4. **Don't skip loading states**
   - Show loading indicators
   - Improve perceived performance

5. **Don't forget to invalidate after mutations**
   - Data can become stale
   - Use `onSuccess` callbacks

---

## Examples

### Complete Example: Customer List with Search

```typescript
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";

export default function CustomerList() {
  // Local state for search input
  const [search, setSearch] = useState("");

  // Debounce search to reduce API calls
  const debouncedSearch = useDebouncedValue(search, 300);

  // Server state with React Query
  const { data: customers, isLoading, error, isError } =
    trpc.crm.customer.listProfiles.useQuery({
      search: debouncedSearch || undefined,
      limit: 50,
    });

  // Handle all states
  if (isLoading) {
    return <LoadingSpinner message="Loading customers..." />;
  }

  if (isError) {
    return <ErrorDisplay message="Failed to load customers" error={error} />;
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {search ? "No customers found" : "No customers yet"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customers..."
      />
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Example: Mutation with Optimistic Update

```typescript
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function LeadCard({ lead }: { lead: Lead }) {
  const utils = trpc.useUtils();

  const updateMutation = trpc.crm.lead.updateLead.useMutation({
    onMutate: async (newLead) => {
      // Cancel outgoing refetches
      await utils.crm.lead.listLeads.cancel();

      // Snapshot previous value
      const previous = utils.crm.lead.listLeads.getData();

      // Optimistically update
      utils.crm.lead.listLeads.setData(undefined, (old) => {
        return old?.map((l) =>
          l.id === newLead.id ? { ...l, ...newLead } : l
        ) ?? [];
      });

      return { previous };
    },
    onError: (err, newLead, context) => {
      // Rollback on error
      if (context?.previous) {
        utils.crm.lead.listLeads.setData(undefined, context.previous);
      }
      toast.error("Failed to update lead");
    },
    onSuccess: () => {
      toast.success("Lead updated");
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.crm.lead.listLeads.invalidate();
    },
  });

  const handleUpdate = async () => {
    await updateMutation.mutateAsync({
      id: lead.id,
      status: "contacted",
    });
  };

  return (
    <div>
      <p>{lead.name}</p>
      <button onClick={handleUpdate} disabled={updateMutation.isPending}>
        {updateMutation.isPending ? "Updating..." : "Mark as Contacted"}
      </button>
    </div>
  );
}
```

---

## Related Documentation

- `docs/CRM_UI_API_INTEGRATION_GUIDE.md` - UI-to-API integration patterns
- `client/src/lib/cacheStrategy.ts` - Cache configuration
- `client/src/lib/trpc.ts` - tRPC client setup
- `client/src/main.tsx` - QueryClient configuration

---

**Last Updated:** January 28, 2025  
**Status:** ✅ Well-Implemented - No improvements needed
