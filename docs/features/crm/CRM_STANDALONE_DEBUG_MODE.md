# CRM Standalone Debug Mode

**Author:** Development Team  
**Last Updated:** 2025-11-17  
**Version:** 1.0.0

## Overview

CRM Standalone Debug Mode provides isolated access to the CRM module for debugging, development, and testing purposes. This mode allows developers to access and test CRM features without the full application context, making it easier to debug issues and develop new features.

**Key Features:**

- ✅ Isolated CRM module access
- ✅ Dedicated query client for debugging
- ✅ Error boundaries for better error handling
- ✅ Standalone routing
- ✅ Development-only banner indicator
- ✅ All CRM routes accessible

## Access Methods

### Method 1: Direct URL Access

Navigate directly to any of these URLs:

**Main Entry Points:**

- `http://localhost:3000/crm-standalone` - Standalone CRM home
- `http://localhost:3000/crm-standalone/dashboard` - CRM Dashboard
- `http://localhost:3000/crm/debug` - Alternative entry point

**Specific CRM Routes:**

- `http://localhost:3000/crm-standalone/customers` - Customer List
- `http://localhost:3000/crm-standalone/customers/:id` - Customer Detail
- `http://localhost:3000/crm-standalone/leads` - Lead Pipeline
- `http://localhost:3000/crm-standalone/leads/:id` - Lead Detail
- `http://localhost:3000/crm-standalone/opportunities` - Opportunities
- `http://localhost:3000/crm-standalone/segments` - Segments
- `http://localhost:3000/crm-standalone/segments/:id` - Segment Detail
- `http://localhost:3000/crm-standalone/bookings` - Booking Calendar

### Method 2: Development Environment

In development mode, a yellow debug banner appears at the top indicating standalone mode is active.

## Architecture

### Component Structure

```
CRMStandalone (Root)
├── ErrorBoundary
│   └── CRMLayout
│       └── StandaloneCRMRouter
│           ├── Suspense
│           └── Switch (Routes)
│               ├── CRMDashboardStandalone
│               ├── CustomerListStandalone
│               ├── CustomerDetailStandalone
│               ├── LeadPipelineStandalone
│               ├── LeadDetailStandalone
│               ├── OpportunityPipelineStandalone
│               ├── SegmentListStandalone
│               ├── SegmentDetailStandalone
│               └── BookingCalendarStandalone
```

### Data Flow

```
User Request
  ↓
Standalone Router
  ↓
Lazy-loaded CRM Component
  ↓
tRPC Query/Mutation
  ↓
Backend API
  ↓
Database
```

### Query Client Configuration

The standalone mode uses a dedicated QueryClient with optimized settings for debugging:

```typescript
const standaloneQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduced retries for faster error detection
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
    },
  },
});
```

## Implementation Details

### Standalone Page Component

**Location:** `client/src/pages/crm/CRMStandalone.tsx`

**Key Features:**

- Dedicated QueryClient for isolation
- Error boundaries for better error handling
- Lazy-loaded components for performance
- Development banner indicator
- Standalone routing

**Code Structure:**

```typescript
export default function CRMStandalone() {
  return (
    <trpc.Provider client={trpcClient} queryClient={standaloneQueryClient}>
      <QueryClientProvider client={standaloneQueryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {/* Debug Banner */}
            {import.meta.env.DEV && (
              <div className="bg-yellow-500/10 border-b border-yellow-500/20">
                🐛 CRM Standalone Debug Mode
              </div>
            )}
            <StandaloneCRMRouter />
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Routing Configuration

**Location:** `client/src/App.tsx`

Routes are added to the main router:

```typescript
<Route
  path={"/crm-standalone"}
  component={lazy(() => import("./pages/crm/CRMStandalone"))}
/>
<Route
  path={"/crm-standalone/:path*"}
  component={lazy(() => import("./pages/crm/CRMStandalone"))}
/>
<Route
  path={"/crm/debug"}
  component={lazy(() => import("./pages/crm/CRMStandalone"))}
/>
```

### Error Handling

**Error Boundary:**

- Catches React errors in CRM components
- Displays user-friendly error message
- Shows stack trace in development
- Provides "Try Again" button

**Error Fallback Component:**

```typescript
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Error in CRM Module
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <button onClick={resetErrorBoundary}>
            Try Again
          </button>
        </div>
        <details>
          <summary>Stack Trace</summary>
          <pre>{error.stack}</pre>
        </details>
      </div>
    </div>
  );
}
```

## Usage Examples

### Accessing CRM Standalone

**1. Direct Navigation:**

```
http://localhost:3000/crm-standalone/dashboard
```

**2. From Browser Console:**

```javascript
window.location.href = "/crm-standalone/customers";
```

**3. Programmatic Navigation:**

```typescript
import { useLocation } from "wouter";

const [, navigate] = useLocation();
navigate("/crm-standalone/opportunities");
```

### Testing Specific Features

**Test Document Upload:**

1. Navigate to `/crm-standalone/customers`
2. Click on a customer
3. Go to "Documents" tab
4. Test upload functionality

**Test Lead Conversion:**

1. Navigate to `/crm-standalone/leads`
2. Click on a lead
3. Test "Convert to Customer" functionality

**Test Opportunity Pipeline:**

1. Navigate to `/crm-standalone/opportunities`
2. Test drag-and-drop functionality
3. Test opportunity creation/editing

## Benefits

### Development Benefits

1. **Isolated Testing:**
   - Test CRM features without full app context
   - Faster iteration cycles
   - Easier debugging

2. **Error Isolation:**
   - Errors in CRM don't affect main app
   - Better error messages
   - Stack traces visible

3. **Performance:**
   - Lazy-loaded components
   - Optimized query client
   - Reduced bundle size

### Debugging Benefits

1. **Clear Error Messages:**
   - Error boundaries catch React errors
   - Stack traces in development
   - User-friendly error display

2. **Network Inspection:**
   - All tRPC calls visible in Network tab
   - Easy to inspect API responses
   - Clear request/response logging

3. **State Inspection:**
   - React DevTools for component state
   - TanStack Query DevTools for cache
   - Redux DevTools (if applicable)

## Troubleshooting

### Common Issues

**Issue: "Cannot access /crm-standalone"**

**Solution:**

- Ensure backend server is running (`pnpm dev`)
- Check that route is registered in `App.tsx`
- Verify no authentication redirects are blocking access

**Issue: "Components not loading"**

**Solution:**

- Check browser console for errors
- Verify lazy loading is working
- Check network tab for failed requests

**Issue: "tRPC calls failing"**

**Solution:**

- Verify backend server is running
- Check CORS settings
- Verify authentication (if required)
- Check network tab for request details

### Debug Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] No console errors
- [ ] Network requests succeeding
- [ ] Components rendering correctly
- [ ] Navigation working
- [ ] Error boundaries catching errors

## Best Practices

### Development Workflow

1. **Start Servers:**

   ```bash
   # Terminal 1
   pnpm dev

   # Terminal 2
   pnpm dev:vite
   ```

2. **Access Standalone Mode:**
   - Navigate to `http://localhost:3000/crm-standalone`
   - Or use direct route like `/crm-standalone/customers`

3. **Debug:**
   - Use React DevTools
   - Check Network tab
   - Review console logs
   - Inspect error boundaries

### Testing Strategy

1. **Unit Testing:**
   - Test individual components
   - Mock tRPC calls
   - Test error states

2. **Integration Testing:**
   - Test full workflows
   - Test API integration
   - Test error handling

3. **E2E Testing:**
   - Test user flows
   - Test navigation
   - Test data persistence

## Security Considerations

### Development Only

**Important:** Standalone mode should only be accessible in development:

```typescript
// In production, this route should be disabled or require authentication
if (process.env.NODE_ENV === "production") {
  // Redirect to main app or require authentication
}
```

### Authentication

Currently, standalone mode uses the same authentication as the main app. For true isolation, consider:

1. **Mock Authentication:**
   - Use test user credentials
   - Bypass authentication in development
   - Use development-only auth tokens

2. **Separate Auth Context:**
   - Create standalone auth provider
   - Use test authentication
   - Isolate from main app auth

## Performance Considerations

### Lazy Loading

All CRM components are lazy-loaded to reduce initial bundle size:

```typescript
const CRMDashboardStandalone = React.lazy(() =>
  import("./CRMDashboard").then(m => ({ default: m.default }))
);
```

### Query Client Optimization

Standalone mode uses optimized query client settings:

- Reduced retries (faster error detection)
- Shorter stale time (fresher data)
- Longer cache time (better performance)

## Related Documentation

- [CRM Module Overview](./README.md)
- [Document Management](./DOCUMENT_MANAGEMENT.md)
- [Constants System](./constants/README.md)
- [API Reference](../../../API_REFERENCE.md)

## Future Enhancements

### Planned Features

1. **Mock Data Mode:**
   - Use mock data instead of real API calls
   - Faster development cycles
   - No database dependency

2. **Component Playground:**
   - Test individual components
   - Props editor
   - State inspector

3. **API Mocking:**
   - Mock tRPC endpoints
   - Simulate different scenarios
   - Test error handling

4. **Performance Profiling:**
   - Built-in performance metrics
   - Component render times
   - API call durations
