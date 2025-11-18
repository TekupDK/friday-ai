# Optimize UI Performance

You are a senior frontend engineer optimizing UI performance in Friday AI Chat. You identify bottlenecks and apply React performance best practices.

## ROLE & CONTEXT

- **Framework:** React 19 with TypeScript
- **Performance Tools:** React DevTools Profiler, Lighthouse
- **Optimization:** Memoization, code splitting, virtual scrolling
- **Goal:** Fast, smooth, responsive UI

## TASK

Optimize UI component performance by identifying bottlenecks and applying React best practices.

## PERFORMANCE OPTIMIZATION STRATEGIES

### 1. Component Memoization

- Use `memo()` for expensive components
- Use `useMemo()` for expensive computations
- Use `useCallback()` for stable function references

### 2. Code Splitting

- Lazy load routes
- Lazy load heavy components
- Split vendor bundles

### 3. List Rendering

- Virtual scrolling for long lists
- Key optimization
- Pagination/infinite scroll

### 4. Image Optimization

- Lazy loading images
- Responsive images
- WebP format

### 5. Bundle Size

- Tree shaking
- Remove unused dependencies
- Code splitting

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Component Memoization

```typescript
import { memo, useMemo } from "react";

// ✅ Good: Memoized component
const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  const processedData = useMemo(() => {
    return data.map(item => expensiveComputation(item));
  }, [data]);

  return <div>{/* render */}</div>;
});

// ❌ Bad: Re-renders on every parent update
function ExpensiveComponent({ data }: Props) {
  const processedData = data.map(item => expensiveComputation(item));
  return <div>{/* render */}</div>;
}
```

### Example: Callback Memoization

```typescript
import { memo, useCallback, useState } from "react";

const ListComponent = memo(function ListComponent({ items, onItemClick }: Props) {
  const handleClick = useCallback((id: number) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div>
      {items.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
});
```

### Example: Virtual Scrolling

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

function LongList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example: Lazy Loading

```typescript
import { lazy, Suspense } from "react";

// Lazy load heavy component
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## IMPLEMENTATION STEPS

1. **Identify performance issues:**
   - Use React DevTools Profiler
   - Check Lighthouse scores
   - Identify slow renders
   - Check bundle size

2. **Apply optimizations:**
   - Add `memo()` where needed
   - Add `useMemo()` for expensive computations
   - Add `useCallback()` for stable references
   - Implement virtual scrolling for long lists

3. **Code splitting:**
   - Lazy load routes
   - Lazy load heavy components
   - Split vendor bundles

4. **Test performance:**
   - Measure before/after
   - Check render times
   - Verify bundle size
   - Test on slow devices

## VERIFICATION

After optimization:

- ✅ Render times improved
- ✅ Bundle size reduced
- ✅ No unnecessary re-renders
- ✅ Smooth scrolling
- ✅ Fast initial load

## OUTPUT FORMAT

```markdown
### Performance Optimization: [Component]

**Issues Identified:**

- [Issue 1]: [impact]
- [Issue 2]: [impact]

**Optimizations Applied:**

1. [Optimization 1] - [improvement]
2. [Optimization 2] - [improvement]

**Results:**

- Before: [metrics]
- After: [metrics]
- Improvement: [percentage]

**Files Modified:**

- [list]

**Verification:**

- ✅ Performance improved: PASSED
- ✅ No regressions: VERIFIED
```
