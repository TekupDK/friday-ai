---
name: create-ui-component
description: "[development] Create UI Component - You are a senior frontend engineer creating reusable UI components for Friday AI Chat. You follow design system patterns exactly."
argument-hint: Optional input or selection
---

# Create UI Component

You are a senior frontend engineer creating reusable UI components for Friday AI Chat. You follow design system patterns exactly.

## ROLE & CONTEXT

- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Location:** `client/src/components/` for shared components
- **Patterns:** Functional components, memo, proper TypeScript, accessibility
- **Design System:** Consistent spacing, typography, colors, interactions

## TASK

Create a new reusable UI component following Friday AI Chat patterns exactly.

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Reusable UI Component
```typescript
import { memo, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const Card = memo(forwardRef<HTMLDivElement, CardProps>(
  ({ title, description, children, onAction, actionLabel, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 p-6 bg-background border rounded-lg shadow-sm",
          className
        )}
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        {children && <div className="flex-1">{children}</div>}
        
        {onAction && (
          <Button onClick={onAction} variant="outline" size="sm">
            {actionLabel || "Action"}
          </Button>
        )}
      </div>
    );
  }
));

Card.displayName = "Card";

export default Card;
```

### Example: Component with Loading/Error States
```typescript
import { memo } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DataCardProps {
  data?: { title: string; value: string };
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

const DataCard = memo(function DataCard({
  data,
  isLoading = false,
  error,
  onRetry,
}: DataCardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error.message}</span>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <h4 className="text-sm font-medium">{data.title}</h4>
      <p className="text-2xl font-bold">{data.value}</p>
    </div>
  );
});

export default DataCard;
```

## IMPLEMENTATION STEPS

1. **Define component interface:**
   - Create TypeScript interface for props
   - Use descriptive prop names
   - Mark optional props with `?`
   - Add JSDoc comments for complex props

2. **Create component structure:**
   - Use `memo()` for performance
   - Use `forwardRef()` if ref needed
   - Add `displayName` for debugging
   - Export default

3. **Implement component:**
   - Handle all states (loading, error, empty, success)
   - Use shadcn/ui components when possible
   - Use Tailwind CSS 4 for styling
   - Follow design system tokens

4. **Add accessibility:**
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation support
   - Focus management

5. **Add Storybook story:**
   - Create story in `stories/` directory
   - Show all variants
   - Show all states
   - Document props

## VERIFICATION

After implementation:
- ✅ TypeScript strict mode passes
- ✅ All states handled
- ✅ Accessibility attributes added
- ✅ Follows design system
- ✅ Storybook story added
- ✅ No `any` types

## OUTPUT FORMAT

```markdown
### UI Component: [ComponentName]

**File:** `client/src/components/[ComponentName].tsx`

**Props Interface:**
\`\`\`typescript
interface [ComponentName]Props {
  // props
}
\`\`\`

**Implementation:**
\`\`\`typescript
[Full component code]
\`\`\`

**Usage:**
\`\`\`typescript
<[ComponentName] prop1="value" prop2={value} />
\`\`\`

**Files Created:**
- `client/src/components/[ComponentName].tsx`
- `stories/[ComponentName].stories.tsx`

**Verification:**
- ✅ Typecheck: PASSED
- ✅ Pattern match: PASSED
- ✅ Storybook: ADDED
```
