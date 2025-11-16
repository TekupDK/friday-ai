# Wire UI to API

You are a senior frontend engineer connecting UI components to backend APIs in Friday AI Chat. You use tRPC hooks and handle all states properly.

## ROLE & CONTEXT

- **API Layer:** tRPC 11 with React Query
- **Hooks:** `trpc.[router].[procedure].useQuery()` and `.useMutation()`
- **State Management:** React Query caching, invalidation
- **Patterns:** Loading, error, empty states, optimistic updates

## TASK

Connect a UI component to a backend API/tRPC procedure, handling all states properly.

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Query Hook with All States
```typescript
import { memo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

const CustomerList = memo(function CustomerList() {
  const { data, isLoading, error, refetch } = trpc.crm.customer.list.useQuery(
    { limit: 50 },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading customers...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-sm text-destructive">
          Failed to load customers: {error.message}
        </div>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-sm text-muted-foreground">No customers found</div>
        <Button onClick={() => {/* create customer */}}>
          Create Customer
        </Button>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex flex-col gap-4">
      {data.map((customer) => (
        <div key={customer.id} className="p-4 border rounded-lg">
          {customer.name}
        </div>
      ))}
    </div>
  );
});
```

### Example: Mutation Hook with Optimistic Updates
```typescript
import { memo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

const CreateCustomer = memo(function CreateCustomer() {
  const [name, setName] = useState("");
  const utils = trpc.useUtils();

  const createMutation = trpc.crm.customer.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.crm.customer.list.invalidate();
      setName("");
    },
    onError: (error) => {
      console.error("Failed to create:", error);
      // Show error toast
    },
    // Optimistic update
    onMutate: async (newCustomer) => {
      // Cancel outgoing refetches
      await utils.crm.customer.list.cancel();
      
      // Snapshot previous value
      const previous = utils.crm.customer.list.getData();
      
      // Optimistically update
      utils.crm.customer.list.setData(undefined, (old) => {
        return old ? [...old, { ...newCustomer, id: Date.now() }] : [newCustomer];
      });
      
      return { previous };
    },
    onError: (err, newCustomer, context) => {
      // Rollback on error
      if (context?.previous) {
        utils.crm.customer.list.setData(undefined, context.previous);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, email: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-3 py-2 border rounded-md"
      />
      <Button
        type="submit"
        disabled={createMutation.isPending || !name}
      >
        {createMutation.isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  );
});
```

## IMPLEMENTATION STEPS

1. **Identify API endpoint:**
   - Find tRPC procedure: `trpc.[router].[procedure]`
   - Check input/output types
   - Review documentation

2. **Implement data fetching:**
   - Use `trpc.[router].[procedure].useQuery()` for reads
   - Use `trpc.[router].[procedure].useMutation()` for writes
   - Configure caching (staleTime, cacheTime)

3. **Handle all states:**
   - **Loading:** Show skeleton/spinner
   - **Error:** Show error message + retry
   - **Empty:** Show empty state + CTA
   - **Success:** Show data

4. **Handle mutations:**
   - Invalidate queries on success
   - Show loading state during mutation
   - Handle errors
   - Optional: Optimistic updates

5. **Add tests/stories:**
   - Test loading state
   - Test error state
   - Test empty state
   - Test success state

## VERIFICATION

After implementation:
- ✅ All states handled (loading, error, empty, success)
- ✅ Proper caching configured
- ✅ Mutations invalidate queries
- ✅ Error handling implemented
- ✅ Loading states shown
- ✅ TypeScript types correct

## OUTPUT FORMAT

```markdown
### UI to API: [Component Name]

**tRPC Hook:**
\`\`\`typescript
const { data, isLoading, error } = trpc.[router].[procedure].useQuery(...);
\`\`\`

**States Handled:**
- ✅ Loading: [how handled]
- ✅ Error: [how handled]
- ✅ Empty: [how handled]
- ✅ Success: [how handled]

**Caching:**
- staleTime: [value]
- cacheTime: [value]

**Files Modified:**
- `client/src/components/[Component].tsx`

**Verification:**
- ✅ All states: PASSED
- ✅ Caching: CONFIGURED
- ✅ TypeScript: PASSED
```

