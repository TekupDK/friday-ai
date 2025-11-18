# Session TODOs - January 28, 2025

Generated from session reflection and conversation analysis.

**Last Updated:** January 28, 2025  
**Status:** Active

---

## 🔴 P1 - Critical (Immediate)

### Backend

- [ ] **Review database indexes** - Verify `database/performance-indexes.sql` indexes are applied to production database
  - **Owner:** Backend team
  - **Area:** Infrastructure
  - **Size:** Small
  - **Note:** Indexes created but need verification

### Frontend

- [ ] **Add error boundaries** - Implement React error boundaries for better error handling
  - **Owner:** Frontend team
  - **Area:** Frontend
  - **Size:** Medium
  - **Priority:** P1 (Immediate)
  - **Files:** Start with `CRMDashboard.tsx`, then expand to other major components

### Testing

- [ ] **Fix CORS test** - Resolve test infrastructure issue with OAuth route setup
  - **Owner:** Testing team
  - **Area:** Tests
  - **Size:** Small
  - **Note:** Test infrastructure issue, not code bug

---

## 🟡 P2 - High Priority (Short-term)

### Backend

- [x] **Add Redis caching for expensive queries** - Implement `server/db-cache.ts` for database query caching ✅ COMPLETE
  - **Owner:** Backend team
  - **Area:** Backend
  - **Size:** Medium
  - **Note:** Pattern already established with AI response caching
  - **Reference:** `server/integrations/litellm/response-cache-redis.ts`
  - **Implementation:**
    - ✅ `server/db-cache.ts` already exists and is complete
    - ✅ Integrated into `crm-customer-router.ts` `listProfiles` query
    - ✅ Added cache invalidation on mutations (createProperty, updateProperty, deleteProperty)
    - ✅ Already used in `crm-stats-router.ts` for dashboard stats

- [ ] **Add cache metrics** - Monitor Redis cache hit rates and performance
  - **Owner:** Backend team
  - **Area:** Infrastructure
  - **Size:** Small
  - **Note:** Redis cache implemented, metrics needed

- [ ] **Database query analysis** - Identify slow queries and optimize
  - **Owner:** Backend team
  - **Area:** Performance
  - **Size:** Medium
  - **Note:** Use database query logs to identify bottlenecks

### Frontend

- [ ] **Add comprehensive error boundaries** - Cover all major React components
  - **Owner:** Frontend team
  - **Area:** Frontend
  - **Size:** Medium
  - **Note:** Start with critical components, expand incrementally

- [ ] **Reduce `any` types** - Continue incremental type safety improvements
  - **Owner:** Frontend/Backend team
  - **Area:** Code Quality
  - **Size:** Large
  - **Progress:** Fixed cache and intent-actions, ~820 `any` types remaining
  - **Note:** Focus on critical paths first

### Security

- [ ] **Add linting rules** - Enforce HTML sanitization in code review
  - **Owner:** DevOps team
  - **Area:** Security
  - **Size:** Small
  - **Note:** Prevent future XSS vulnerabilities

- [ ] **Automated security scanning** - Integrate security scanning into CI/CD pipeline
  - **Owner:** DevOps team
  - **Area:** Security
  - **Size:** Medium
  - **Note:** Long-term security improvement

---

## 🟢 P3 - Medium Priority (Long-term)

### Backend

- [ ] **Audit TODOs** - Review 577 TODO comments, convert to issues or remove
  - **Owner:** Engineering team
  - **Area:** Code Quality
  - **Size:** Large
  - **Note:** Can be done incrementally

- [ ] **Replace console.log** - Replace 1,448 console.log statements with structured logging
  - **Owner:** Engineering team
  - **Area:** Code Quality
  - **Size:** Large
  - **Note:** Can be done incrementally

- [ ] **Remove deprecated code** - Clean up 16 `@deprecated` markers
  - **Owner:** Engineering team
  - **Area:** Code Quality
  - **Size:** Small

- [ ] **Environment variable validation** - Use `zod` to validate all env vars at startup
  - **Owner:** Backend team
  - **Area:** Infrastructure
  - **Size:** Small

### Frontend

- [ ] **Optimize bundle size** - Analyze with `rollup-plugin-visualizer`
  - **Owner:** Frontend team
  - **Area:** Performance
  - **Size:** Small

### Testing

- [ ] **Add integration tests** - Add more integration tests for critical workflows
  - **Owner:** Testing team
  - **Area:** Tests
  - **Size:** Medium
  - **Note:** Focus on invoice creation, booking creation workflows

- [ ] **Add performance tests** - Add performance tests for caching and database queries
  - **Owner:** Testing team
  - **Area:** Tests
  - **Size:** Medium

### Documentation

- [ ] **Keep documentation current** - Update documentation as code changes
  - **Owner:** Engineering team
  - **Area:** Documentation
  - **Size:** Ongoing

- [ ] **Add architecture diagrams** - Visual representation of system
  - **Owner:** Engineering team
  - **Area:** Documentation
  - **Size:** Small

- [ ] **Update README** - Current state, setup instructions
  - **Owner:** Engineering team
  - **Area:** Documentation
  - **Size:** Small

---

## 📊 Summary by Area

### Backend (7 tasks)

- P1: 0 tasks
- P2: 3 tasks
- P3: 4 tasks

### Frontend (4 tasks)

- P1: 1 task (Error boundaries)
- P2: 2 tasks
- P3: 1 task

### Infrastructure (4 tasks)

- P1: 1 task (Database indexes)
- P2: 2 tasks
- P3: 1 task

### Testing (3 tasks)

- P1: 1 task (Fix CORS test)
- P2: 0 tasks
- P3: 2 tasks

### Security (2 tasks)

- P1: 0 tasks
- P2: 2 tasks
- P3: 0 tasks

### Documentation (3 tasks)

- P1: 0 tasks
- P2: 0 tasks
- P3: 3 tasks

### Code Quality (3 tasks)

- P1: 0 tasks
- P2: 1 task
- P3: 2 tasks

---

## 🎯 Next Actions

**Immediate (This Week):**

1. Add error boundaries to React components
2. Review database indexes
3. Fix CORS test

**Short-term (Next 2 Weeks):**

1. Add Redis caching for expensive queries
2. Add cache metrics
3. Add comprehensive error boundaries

**Long-term (Next Month):**

1. Audit TODOs incrementally
2. Replace console.log statements incrementally
3. Add integration tests for critical workflows

---

**Last Updated:** January 28, 2025  
**Maintained by:** TekupDK Development Team
