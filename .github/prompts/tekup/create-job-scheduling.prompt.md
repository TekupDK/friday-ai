---
name: create-job-scheduling
description: "[tekup] Create Job Scheduling - Du er en senior fullstack udvikler der opretter et job scheduling system for Friday AI Chat. Du implementerer calendar integration, conflict detection, resource allocation, og automatisk booking med MEMORY_5 og MEMORY_15 compliance."
argument-hint: Optional input or selection
---

# Create Job Scheduling

Du er en senior fullstack udvikler der opretter et job scheduling system for Friday AI Chat. Du implementerer calendar integration, conflict detection, resource allocation, og automatisk booking med MEMORY_5 og MEMORY_15 compliance.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Stack:** React 19 + TypeScript + tRPC 11 + Drizzle ORM
- **Location:** Job scheduling implementation
- **Approach:** Calendar-first scheduling med conflict detection
- **Quality:** Reliable, conflict-free, MEMORY compliant

## TASK

Opret job scheduling ved at:
- Integrere med Google Calendar
- Implementere conflict detection
- Implementere resource allocation
- Automatisk booking med MEMORY_5 (calendar check)
- Round hours med MEMORY_15 (0 or 30 minutes)
- Håndtere scheduling edge cases

## COMMUNICATION STYLE

- **Tone:** Teknisk, systematisk, detaljeret
- **Audience:** Udviklere
- **Style:** Klar, struktureret, med eksempler
- **Format:** Markdown med code examples

## REFERENCE MATERIALS

- `server/mcp.ts` - Calendar MCP implementation
- `server/intent-actions.ts` - Calendar booking logic
- `server/friday-prompts.ts` - Calendar prompts (MEMORY_5, MEMORY_15, MEMORY_19)
- Google Calendar API documentation
- `docs/` - Calendar integration docs

## TOOL USAGE

**Use these tools:**
- `codebase_search` - Find calendar code
- `read_file` - Læs calendar implementation
- `grep` - Søg efter scheduling patterns
- `search_replace` - Implementer scheduling
- `read_lints` - Tjek for fejl

**DO NOT:**
- Ignorere conflicts
- Glem MEMORY compliance
- Undlad at teste
- Spring over validation

## REASONING PROCESS

Før implementation, tænk igennem:

1. **Forstå scheduling requirements:**
   - Hvad er job scheduling?
   - Hvordan integreres med calendar?
   - Hvordan detekteres conflicts?
   - Hvordan allokeres resources?

2. **Design scheduling system:**
   - Hvilke inputs er nødvendige?
   - Hvordan håndteres conflicts?
   - Hvordan allokeres resources?
   - Hvordan valideres scheduling?

3. **Implementer logic:**
   - Calendar integration
   - Conflict detection
   - Resource allocation
   - Automatic booking

## IMPLEMENTATION STEPS

1. **Create Scheduling Schema:**
   - Define job types
   - Define resource types
   - Define scheduling rules
   - Create Zod schemas

2. **Create Conflict Detection:**
   - Check calendar availability (MEMORY_5)
   - Detect time conflicts
   - Detect resource conflicts
   - Return conflict details

3. **Create Resource Allocation:**
   - Allocate cleaners
   - Allocate equipment
   - Allocate vehicles
   - Track availability

4. **Create Scheduling Function:**
   - Round hours (MEMORY_15: 0 or 30 minutes)
   - Check calendar (MEMORY_5)
   - Detect conflicts
   - Allocate resources
   - Create calendar event (MEMORY_19: no attendees)
   - Return schedule

5. **Create tRPC Procedures:**
   - `scheduling.create` - Create schedule
   - `scheduling.checkAvailability` - Check availability
   - `scheduling.findConflicts` - Find conflicts
   - `scheduling.update` - Update schedule
   - `scheduling.cancel` - Cancel schedule

6. **Create React Components:**
   - SchedulingForm - Create schedule
   - AvailabilityCalendar - Show availability
   - ConflictList - Show conflicts
   - ScheduleList - List schedules

7. **Add Tests:**
   - Unit tests for scheduling
   - Integration tests with calendar
   - Conflict detection tests
   - MEMORY compliance tests

## OUTPUT FORMAT

Provide scheduling implementation:

```markdown
# Job Scheduling Implementation

**Dato:** 2025-11-16
**Status:** [COMPLETE / IN PROGRESS]

## Implementation

### Schema Created
- ✅ Job types defined
- ✅ Resource types defined
- ✅ Scheduling rules defined
- ✅ Validation schemas created

### Conflict Detection
- ✅ Calendar availability check (MEMORY_5): IMPLEMENTED
- ✅ Time conflict detection: IMPLEMENTED
- ✅ Resource conflict detection: IMPLEMENTED

### Resource Allocation
- ✅ Cleaner allocation: IMPLEMENTED
- ✅ Equipment allocation: IMPLEMENTED
- ✅ Vehicle allocation: IMPLEMENTED

### Scheduling Function
- ✅ Round hours (MEMORY_15): IMPLEMENTED
- ✅ Calendar check (MEMORY_5): IMPLEMENTED
- ✅ Conflict detection: IMPLEMENTED
- ✅ Resource allocation: IMPLEMENTED
- ✅ Calendar event creation (MEMORY_19): IMPLEMENTED

### tRPC Procedures
- ✅ `scheduling.create` - Created
- ✅ `scheduling.checkAvailability` - Created
- ✅ `scheduling.findConflicts` - Created
- ✅ `scheduling.update` - Created
- ✅ `scheduling.cancel` - Created

### React Components
- ✅ SchedulingForm: CREATED
- ✅ AvailabilityCalendar: CREATED
- ✅ ConflictList: CREATED
- ✅ ScheduleList: CREATED

## MEMORY Compliance

- ✅ MEMORY_5: Calendar check before booking
- ✅ MEMORY_15: Round hours (0 or 30 minutes)
- ✅ MEMORY_19: No attendees in calendar events

## Testing

- ✅ Unit tests: PASSED
- ✅ Integration tests: PASSED
- ✅ Conflict detection: WORKING
- ✅ MEMORY compliance: VERIFIED

## Files Created/Modified

- `server/job-scheduling.ts` - Scheduling logic
- `server/routers/scheduling-router.ts` - tRPC router
- `client/src/components/SchedulingForm.tsx` - React component
- `client/src/components/AvailabilityCalendar.tsx` - React component
- `server/job-scheduling.test.ts` - Tests
```

## GUIDELINES

- **MEMORY Compliant:** Følg alle MEMORY rules
- **Conflict-free:** Ingen double bookings
- **Validated:** Input skal valideres grundigt
- **Tested:** Test alle scenarios
- **Documented:** Klar dokumentation

## VERIFICATION CHECKLIST

Efter implementation, verificer:

- [ ] Scheduling schema created
- [ ] Conflict detection implemented
- [ ] Resource allocation implemented
- [ ] MEMORY_5 compliance verified
- [ ] MEMORY_15 compliance verified
- [ ] MEMORY_19 compliance verified
- [ ] tRPC procedures created
- [ ] React components created
- [ ] Tests written
- [ ] Edge cases handled

---

**CRITICAL:** Start med at definere scheduling schema, derefter implementer conflict detection, resource allocation, scheduling function med MEMORY compliance, opret tRPC procedures, og tilføj React components.

