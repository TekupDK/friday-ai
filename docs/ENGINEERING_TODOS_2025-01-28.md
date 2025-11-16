# Engineering TODOs - January 28, 2025

Generated from codebase health analysis and chat conversation.

---

## 🔴 P1 - Critical (Blocks Build/Deploy)

### Backend

- [x] **Fix TypeScript compilation error** - `server/_core/error-handling.ts:62` ✅ DONE
- [ ] **Add input validation** - Max length constraints on all string inputs in tRPC routers
- [ ] **Reduce `any` types** - Start with critical paths (database queries, API responses)
- [ ] **Fix test type errors** - `client/src/__tests__/accessibility/LoginPage.a11y.test.tsx` (missing jest-dom types)

### Security

- [ ] **Add input sanitization** - Prevent DoS attacks via large inputs
- [ ] **Validate all user inputs** - Email, phone, dates, amounts

---

## 🟡 P2 - Important (Affects Quality)

### Backend

- [ ] **Fix N+1 queries** - Refactor `server/routers/friday-leads-router.ts:69-92` to use batch queries
- [ ] **Add Redis caching** - AI responses (`server/integrations/litellm/response-cache-redis.ts`)
- [ ] **Add Redis caching** - Expensive database queries
- [ ] **Add database indexes** - Review `database/performance-indexes.sql` and add missing indexes
- [ ] **Standardize error handling** - Use `withDatabaseErrorHandling()` and `withApiErrorHandling()` consistently
- [ ] **Add invariant assertions** - Create `server/_core/invariants.ts` with reusable checks
- [ ] **Fix memory leaks** - Add cleanup for `setInterval` in `server/integrations/litellm/response-cache.ts:115`
- [ ] **Audit TODOs** - Review 577 TODO comments, convert to issues or remove

### Frontend

- [ ] **Reduce `any` types** - Type API responses properly
- [ ] **Fix CRMDashboard type error** - `client/src/pages/crm/CRMDashboard.tsx:20`
- [ ] **Add error boundaries** - Better error handling for React components

### Testing

- [ ] **Measure test coverage** - Run `pnpm test:coverage` to get baseline
- [ ] **Add missing tests** - Critical business logic (invoice creation, booking creation)
- [ ] **Fix broken tests** - Ensure all tests pass

---

## 🟢 P3 - Nice to Have (Improvements)

### Code Quality

- [ ] **Remove console.log** - Replace 1,448 console.log statements with structured logging
- [ ] **Remove deprecated code** - Clean up 16 `@deprecated` markers
- [ ] **Add JSDoc** - Document public APIs and complex functions
- [ ] **Standardize error messages** - Consistent format across all errors
- [ ] **Code organization** - Split large files into smaller modules

### Performance

- [ ] **Optimize bundle size** - Analyze with `rollup-plugin-visualizer`
- [ ] **Database connection pooling** - Review and optimize pool settings
- [ ] **Query optimization** - Review slow queries and optimize

### Infrastructure

- [ ] **Add monitoring** - Cache hit rates, error rates, performance metrics
- [ ] **Environment variable validation** - Use `zod` to validate all env vars at startup
- [ ] **Rate limiting consistency** - Standardize on `checkRateLimitUnified()`

### Documentation

- [ ] **Update API docs** - Ensure all endpoints are documented
- [ ] **Add architecture diagrams** - Visual representation of system
- [ ] **Update README** - Current state, setup instructions

---

## 📊 Cache Strategy Implementation

### Current State

- ✅ React Query caching implemented (`client/src/lib/cacheStrategy.ts`)
- ✅ LiteLLM in-memory cache (5 min TTL, 100 entries)
- ✅ Redis rate limiting
- ❌ No Redis caching for AI responses
- ❌ No Redis caching for expensive queries

### Implementation Tasks

- [ ] **Create Redis cache wrapper** - `server/integrations/litellm/response-cache-redis.ts`
- [ ] **Add cache invalidation** - Pattern-based invalidation on mutations
- [ ] **Add cache metrics** - Monitor hit rates and performance
- [ ] **Configure TTLs** - Optimize cache expiration times

---

## 🛡️ Invariant Assertions Implementation

### Critical Invariants

- [ ] **Database operations** - `userId` validation, ownership checks
- [ ] **Rate limiting** - Config validation, result validation
- [ ] **AI tool execution** - Tool registry, schema validation
- [ ] **Date/time operations** - Valid dates, future dates, time rounding
- [ ] **Financial operations** - Positive amounts, customer existence
- [ ] **Email operations** - Valid email format, lead source recognition

### Implementation

- [ ] **Create `server/_core/invariants.ts`** - Reusable assertion functions
- [ ] **Add runtime checks** - In critical paths (mutations, tool execution)
- [ ] **Use TypeScript type guards** - Where possible
- [ ] **Log violations** - For monitoring and debugging

---

## 📈 Progress Tracking

**Last Updated:** January 28, 2025  
**Next Review:** February 28, 2025

**Completed:** 1/23 P1 tasks (4%)  
**In Progress:** 0/23 P1 tasks  
**Pending:** 22/23 P1 tasks

---

## Notes

- TypeScript error in `error-handling.ts` has been fixed
- Focus on P1 tasks first (critical issues)
- P2 tasks can be done in parallel
- P3 tasks are improvements, can be done as time permits
