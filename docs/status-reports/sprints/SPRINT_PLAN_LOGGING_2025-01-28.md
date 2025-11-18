# Sprint Plan: Strategic Logging & Debugging Improvements

**Sprint Duration:** 1 week  
**Start Date:** January 28, 2025  
**Team:** TekupDK Development Team

---

## Sprint Goal

Enhance debugging capabilities and observability through strategic logging improvements and documentation.

---

## Sprint Backlog

### ✅ Completed (Pre-Sprint)

1. **Strategic Logging Implementation**
   - ✅ Added strategic logging to `server/routers.ts` (sendMessage endpoint)
   - ✅ Enhanced logging in `server/ai-router.ts` (routeAI function)
   - ✅ Added entry/exit logging to `server/friday-tool-handlers.ts` (tool handlers)
   - ✅ Created comprehensive documentation (`docs/STRATEGIC_LOGGING.md`)
   - ✅ Completed exploratory debugging analysis

**Effort:** 4 hours  
**Status:** ✅ COMPLETE

---

## Current Sprint Tasks

### 🔴 High Priority (P1)

#### Task 1: Verify Logging in Production Environment

**Priority:** P1  
**Size:** S (Small)  
**Estimate:** 1 hour

**Description:**

- Test strategic logging in development environment
- Verify logs appear correctly in console
- Check correlation ID propagation
- Verify log format consistency

**Acceptance Criteria:**

- ✅ All logs appear with correct format
- ✅ Correlation IDs are present and unique
- ✅ No sensitive data in logs
- ✅ Error logs include stack traces

**Files:**

- `server/routers.ts`
- `server/ai-router.ts`
- `server/friday-tool-handlers.ts`

---

#### Task 2: Add Correlation ID to All Tool Handlers ✅

**Priority:** P1  
**Size:** M (Medium)  
**Estimate:** 2 hours  
**Status:** ✅ COMPLETE

**Description:**

- Ensure all tool handler functions accept correlationId parameter
- Update tool handler signatures
- Propagate correlationId through all calls
- Update tests if needed

**Acceptance Criteria:**

- ✅ All tool handlers accept correlationId
- ✅ CorrelationId propagated through all calls
- ✅ Typecheck passes
- ✅ All handlers include correlationId in logs

**Files Modified:**

- `server/friday-tool-handlers.ts` - Updated all 18 tool handlers

**Changes Made:**

- Updated `ToolRegistryEntry` type to include correlationId in handler signature
- Updated all 18 tool handler functions to accept correlationId parameter
- Updated all TOOL_REGISTRY entries to pass correlationId to handlers
- Added correlationId to all handler logs (entry, success, error)
- Fixed `draft.id` → `draft.draftId` bug
- Added error handling and logging to handlers that were missing it

---

### 🟡 Medium Priority (P2)

#### Task 3: Create Log Filtering Utilities

**Priority:** P2  
**Size:** M (Medium)  
**Estimate:** 3 hours

**Description:**

- Create utility scripts for log filtering
- Filter by correlation ID
- Filter by component
- Filter by log level
- Add to development tools

**Acceptance Criteria:**

- ✅ Script to filter logs by correlation ID
- ✅ Script to filter logs by component
- ✅ Script to filter logs by level
- ✅ Documentation for usage

**Files:**

- `scripts/filter-logs-by-correlation.ts` (new)
- `scripts/filter-logs-by-component.ts` (new)
- `docs/STRATEGIC_LOGGING.md` (update)

---

#### Task 4: Add Performance Metrics to Logs

**Priority:** P2  
**Size:** M (Medium)  
**Estimate:** 2 hours

**Description:**

- Add timing information to key operations
- Log duration for AI router calls
- Log duration for tool executions
- Log duration for database operations

**Acceptance Criteria:**

- ✅ Duration logged for AI router calls
- ✅ Duration logged for tool executions
- ✅ Duration logged for database operations
- ✅ Performance metrics in structured format

**Files:**

- `server/routers.ts` (enhance existing logs)
- `server/ai-router.ts` (enhance existing logs)
- `server/friday-tool-handlers.ts` (enhance existing logs)

---

### 🟢 Low Priority (P3)

#### Task 5: Create Log Visualization Dashboard (Future)

**Priority:** P3  
**Size:** L (Large)  
**Estimate:** 8 hours

**Description:**

- Create simple dashboard for log visualization
- Show request flow with correlation IDs
- Filter and search capabilities
- Timeline view of requests

**Acceptance Criteria:**

- ✅ Dashboard displays logs
- ✅ Filter by correlation ID
- ✅ Search functionality
- ✅ Timeline view

**Files:**

- `client/src/pages/LogViewer.tsx` (new)
- `server/routers/log-viewer-router.ts` (new)

**Note:** Deferred to future sprint

---

#### Task 6: Implement Log Sampling for High-Volume Operations

**Priority:** P3  
**Size:** M (Medium)  
**Estimate:** 3 hours

**Description:**

- Implement log sampling for high-volume operations
- Sample rate based on operation type
- Ensure critical operations always logged
- Configurable sampling rates

**Acceptance Criteria:**

- ✅ Sampling implemented for high-volume operations
- ✅ Critical operations always logged
- ✅ Configurable sampling rates
- ✅ Documentation updated

**Files:**

- `server/_core/log-sampler.ts` (new)
- `server/routers.ts` (update)
- `docs/STRATEGIC_LOGGING.md` (update)

**Note:** Deferred to future sprint

---

## Daily Breakdown

### Day 1 (Jan 28)

- ✅ Complete strategic logging implementation
- ✅ Create documentation
- ✅ Exploratory debugging
- 🔄 Verify logging in development

### Day 2 (Jan 29)

- ✅ Add correlation ID to all tool handlers
- ✅ Update tests
- ✅ Verify correlation ID propagation

### Day 3 (Jan 30)

- 🔄 Create log filtering utilities
- 🔄 Test filtering scripts
- 🔄 Update documentation

### Day 4 (Jan 31)

- 🔄 Add performance metrics to logs
- 🔄 Test performance logging
- 🔄 Verify metrics accuracy

### Day 5 (Feb 1)

- 🔄 Code review
- 🔄 Final testing
- 🔄 Documentation review
- 🔄 Sprint retrospective

---

## Success Criteria

### Must Have (Sprint Goal)

- ✅ Strategic logging implemented and documented
- ✅ Logs appear correctly in development
- ✅ Correlation IDs work correctly
- ✅ No sensitive data in logs

### Should Have

- ✅ Correlation IDs in all tool handlers
- 🔄 Log filtering utilities
- 🔄 Performance metrics in logs

### Nice to Have

- ⏸️ Log visualization dashboard (deferred)
- ⏸️ Log sampling (deferred)

---

## Risk Items

### Risk 1: Log Volume

**Risk:** Too many logs could impact performance  
**Mitigation:** Monitor log volume, implement sampling if needed  
**Status:** 🟢 LOW RISK

### Risk 2: Correlation ID Propagation

**Risk:** Some functions may not receive correlationId  
**Mitigation:** Add correlationId to all function signatures  
**Status:** 🟢 LOW RISK (✅ RESOLVED - All tool handlers updated)

### Risk 3: Sensitive Data Exposure

**Risk:** Accidentally logging sensitive data  
**Mitigation:** Code review, security audit  
**Status:** 🟢 LOW RISK (audited)

---

## Dependencies

### Internal

- ✅ Strategic logging implementation (completed)
- ✅ Documentation (completed)
- 🔄 Development environment access

### External

- None

---

## Metrics

### Sprint Metrics

- **Total Tasks:** 6
- **Completed:** 2
- **In Progress:** 0
- **Planned:** 2
- **Deferred:** 2

### Effort Estimates

- **Completed:** 6 hours
- **Remaining:** 6 hours
- **Total:** 12 hours

---

## Notes

- Strategic logging is for development/debugging, not production monitoring
- Production uses structured logger (Pino) for observability
- Console.log is intentional for strategic debugging
- Correlation IDs enable request tracing across components

---

## Related Documentation

- [Strategic Logging Guide](../../core/development/STRATEGIC_LOGGING.md)
- [Exploratory Debugging Report](../../development-notes/debugging/EXPLORATORY_DEBUGGING_STRATEGIC_LOGGING.md)
- [Development Guide](../../DEVELOPMENT_GUIDE.md)
