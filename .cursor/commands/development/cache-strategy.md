# Cache Strategy

You are a senior engineer designing caching strategies for Friday AI Chat.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Caching:** React Query (automatic), Redis (server-side), browser cache
- **Focus:** Cache invalidation, TTL, cache keys
- **Patterns:** Query caching, API response caching, optimistic updates

## TASK

Design and implement caching strategy for improved performance.

## CACHING STRATEGY

### 1. React Query Caching (Frontend)

```typescript
// Configure caching per query
const { data } = trpc.customers.list.useQuery(
  { limit: 50 },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);

// Invalidate on mutation
const utils = trpc.useUtils();
createMutation.mutate(data, {
  onSuccess: () => {
    utils.customers.list.invalidate();
  },
});
```

### 2. Redis Caching (Backend)

```typescript
// Cache expensive queries
const cacheKey = `expensive:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await expensiveQuery(userId);
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
return data;
```

### 3. Cache Invalidation

- On mutations: Invalidate related queries
- On updates: Update cache or invalidate
- Time-based: TTL expiration
- Manual: Clear cache when needed

## IMPLEMENTATION STEPS

1. **Identify cacheable data:**
   - Expensive queries
   - Frequently accessed data
   - Static/semi-static data

2. **Set TTL:**
   - Short TTL for dynamic data (1-5 min)
   - Medium TTL for semi-static (5-30 min)
   - Long TTL for static data (hours)

3. **Implement invalidation:**
   - Invalidate on mutations
   - Update cache on updates
   - Clear cache when needed

4. **Configure React Query:**
   - Set staleTime
   - Set cacheTime
   - Configure invalidation

5. **Test and verify:**
   - Test caching works
   - Test invalidation
   - Verify performance

## OUTPUT FORMAT

```markdown
### Caching Strategy

**Cacheable Data:**

- [Data type 1]: TTL [time], Invalidation: [strategy]
- [Data type 2]: TTL [time], Invalidation: [strategy]

**Implementation:**

- React Query: [configuration]
- Redis: [configuration]

**Cache Keys:**

- [Pattern 1]: [description]
- [Pattern 2]: [description]

**Invalidation:**

- [Strategy 1]
- [Strategy 2]

**Performance:**

- Before: [metrics]
- After: [metrics]
- Improvement: [percentage]
```
