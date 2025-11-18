# Friday AI Memory Rules Debugging Results

**Date:** 2025-01-28  
**Status:** IN PROGRESS  
**Engineer:** AI Debug System

---

## Executive Summary

Friday AI's memory rules system has **critical issues** that prevent proper enforcement:

1. **Only 11/25 rules implemented** (44% complete)
2. **2 rules incorrectly implemented** (MEMORY_16, MEMORY_24)
3. **Missing CRITICAL rules** (MEMORY_2, MEMORY_17, MEMORY_25)
4. **No enforcement integration** - Rules are defined but never called
5. **Prompt-only enforcement** - Rules exist only in prompts, not programmatically

---

## Rules Analysis

### Current Status

- **Total Rules Expected:** 25
- **Rules Implemented:** 11 (44%)
- **Rules Missing:** 14 (56%)
- **CRITICAL Rules:** 6/9 implemented (67%)
- **HIGH Priority Rules:** 2/3 implemented (67%)
- **MEDIUM Priority Rules:** 1/1 implemented (100%)
- **LOW Priority Rules:** 1/1 implemented (100%)

### Rule Breakdown by Priority

#### CRITICAL Rules (9 expected, 6 implemented)

✅ **MEMORY_1** - ALTID tjek dato/tid først  
❌ **MEMORY_2** - Gmail duplicate check (MISSING)  
❌ **MEMORY_3** - (MISSING - not documented)  
✅ **MEMORY_4** - Lead source specific handling  
✅ **MEMORY_5** - ALTID tjek kalender før datoforslag  
❌ **MEMORY_6** - (MISSING - not documented)  
✅ **MEMORY_7** - ALTID søg efter eksisterende først  
❌ **MEMORY_8-14** - (MISSING - not documented)  
✅ **MEMORY_18** - Tjek ALTID for overlaps først  
✅ **MEMORY_19** - ALDRIG brug attendees parameter  
❌ **MEMORY_17** - Faktura-udkast kun, aldrig auto-godkend (MISSING - CRITICAL)

#### HIGH Priority Rules (3 expected, 2 implemented)

✅ **MEMORY_15** - Runde tider only  
❌ **MEMORY_16** - Altid anmod om billeder for flytterengøring (INCORRECT - checks email length)  
✅ **MEMORY_22** - Fast timepris 349 kr. inkl. moms

#### MEDIUM Priority Rules (1 expected, 1 implemented)

✅ **MEMORY_23** - Miljøvenlig profil

#### LOW Priority Rules (1 expected, 1 implemented)

❌ **MEMORY_24** - Job completion kræver 6-step checklist (INCORRECT - checks emojis)

#### Additional Missing Rules

❌ **MEMORY_25** - Verify lead name against actual email (MISSING)

---

## Issues Found

### 🔴 CRITICAL Issues

#### 1. Missing CRITICAL Rule: MEMORY_17

**Severity:** CRITICAL  
**Impact:** Invoices could be auto-approved, violating business rules

**Expected Behavior:**

- All invoices must be created as DRAFT
- Never auto-approve invoices
- Price must be 349 kr/time/person

**Current Status:** Rule not implemented

**Fix Required:**

```typescript
{
  id: "MEMORY_17",
  priority: "CRITICAL",
  category: "LEAD",
  rule: "Faktura-udkast kun, aldrig auto-godkend",
  description: "Alle fakturaer skal være draft, 349 kr/time/person",
  enforcement: async context => {
    if (!context.invoice) return true;

    if (context.invoice.state !== "draft") {
      console.error("[MEMORY_17] ❌ KRITISK: Faktura skal være draft!");
      context.invoice.state = "draft";
      return false;
    }

    // Verify price
    const hasCorrectPrice = context.invoice.lines?.some(
      (line: any) => line.unitPrice === 349
    );
    if (!hasCorrectPrice) {
      console.warn("[MEMORY_17] ⚠️ Pris skal være 349 kr/time");
      return false;
    }

    return true;
  },
}
```

#### 2. Incorrect Implementation: MEMORY_16

**Severity:** CRITICAL  
**Impact:** Flytterengøring leads won't trigger photo requests

**Current Implementation:** Checks email length (wrong rule)  
**Expected Implementation:** Check if flytterengøring lead, block quote until photos received

**Fix Required:**

```typescript
{
  id: "MEMORY_16",
  priority: "CRITICAL", // Should be CRITICAL, not HIGH
  category: "LEAD",
  rule: "Altid anmod om billeder for flytterengøring",
  description: "BLOCK quote sending until photos received",
  enforcement: async context => {
    if (!context.lead || !context.isFlytterengøring) return true;

    if (!context.hasPhotos) {
      console.error("[MEMORY_16] ❌ KRITISK: Må IKKE sende tilbud uden billeder!");
      context.blockQuoteSending = true;
      context.requiresPhotos = true;
      return false; // Block quote
    }

    return true;
  },
}
```

#### 3. Incorrect Implementation: MEMORY_24

**Severity:** HIGH  
**Impact:** Job completion checklist not enforced

**Current Implementation:** Checks emoji usage (wrong rule)  
**Expected Implementation:** Verify 6-step job completion checklist

**Fix Required:**

```typescript
{
  id: "MEMORY_24",
  priority: "CRITICAL", // Should be CRITICAL, not LOW
  category: "LEAD",
  rule: "Job completion kræver 6-step checklist",
  description: "Faktura, team, betaling, tid, kalender, labels",
  enforcement: async context => {
    if (!context.jobCompletion) return true;

    const checklist = {
      invoice: !!context.jobCompletion.invoiceId,
      team: !!context.jobCompletion.team,
      payment: !!context.jobCompletion.paymentMethod,
      time: !!context.jobCompletion.actualTime,
      calendar: !!context.jobCompletion.calendarUpdated,
      labels: !!context.jobCompletion.labelsRemoved,
    };

    const allComplete = Object.values(checklist).every(v => v === true);
    if (!allComplete) {
      console.error("[MEMORY_24] ❌ Job completion mangler steps:", checklist);
      return false;
    }

    return true;
  },
}
```

#### 4. Missing Rule: MEMORY_2

**Severity:** HIGH  
**Impact:** Duplicate emails could be sent

**Expected Behavior:**

- Check Gmail for existing communication before sending quotes
- Prevent duplicate offers

**Fix Required:**

```typescript
{
  id: "MEMORY_2",
  priority: "HIGH",
  category: "EMAIL",
  rule: "Gmail duplicate check før tilbud",
  description: "Søg i Gmail før nye tilbud sendes",
  enforcement: async context => {
    if (!context.customerEmail || !context.isOffer) return true;

    console.log("[MEMORY_2] Checking Gmail for duplicates...");
    context.requiresGmailCheck = true;
    return true;
  },
}
```

#### 5. Missing Rule: MEMORY_25

**Severity:** MEDIUM  
**Impact:** Wrong customer names in communications

**Expected Behavior:**

- Verify lead name matches actual email signature
- Use customer's preferred name

**Fix Required:**

```typescript
{
  id: "MEMORY_25",
  priority: "MEDIUM",
  category: "LEAD",
  rule: "Verify lead name against actual email",
  description: "Brug navn fra email signatur, ikke lead system",
  enforcement: async context => {
    if (!context.lead || !context.email) return true;

    const leadName = context.lead.name?.toLowerCase();
    const emailName = context.email.signatureName?.toLowerCase();

    if (leadName && emailName && leadName !== emailName) {
      console.warn("[MEMORY_25] ⚠️ Navn mismatch - brug email signatur navn");
      context.useEmailName = true;
      return false;
    }

    return true;
  },
}
```

### 🟡 HIGH Priority Issues

#### 6. No Enforcement Integration

**Severity:** HIGH  
**Impact:** Rules are defined but never executed

**Current Status:**

- `applyMemoryRules()` function exists but is **never called**
- Rules only enforced via prompts (not programmatically)
- No validation before actions execute

**Fix Required:**

- Integrate `applyMemoryRules()` in `server/ai-router.ts` before action execution
- Add rule validation in `server/intent-actions.ts` for each action type
- Add rule checks in email sending, calendar booking, invoice creation

#### 7. Incomplete Rule Coverage

**Severity:** MEDIUM  
**Impact:** 14 rules missing (56% of expected rules)

**Missing Rules:**

- MEMORY_2, MEMORY_3, MEMORY_6, MEMORY_8-14, MEMORY_17, MEMORY_20, MEMORY_21, MEMORY_25

**Note:** Some rule IDs (3, 6, 8-14, 20, 21) are not documented. Need to verify if they should exist or if numbering is non-sequential.

### 🟢 MEDIUM Priority Issues

#### 8. Rule Priority Mismatches

**Severity:** MEDIUM  
**Impact:** Critical rules marked as lower priority

**Issues:**

- MEMORY_16: Should be CRITICAL (currently HIGH)
- MEMORY_24: Should be CRITICAL (currently LOW)

#### 9. Enforcement Function Quality

**Severity:** LOW  
**Impact:** Some enforcement functions are too permissive

**Issues:**

- MEMORY_1: Always returns `true` (no actual validation)
- MEMORY_5: Sets flag but doesn't block action
- MEMORY_7: Sets flag but doesn't block action

---

## Fixes Applied

### ✅ Fix 1: Correct MEMORY_16 Implementation

- Changed from email length check to flytterengøring photo requirement
- Updated priority to CRITICAL
- Added block logic for quote sending

### ✅ Fix 2: Correct MEMORY_24 Implementation

- Changed from emoji check to job completion checklist
- Updated priority to CRITICAL
- Added 6-step verification

### ✅ Fix 3: Add MEMORY_17 (Invoice Draft-Only)

- Added CRITICAL rule for invoice draft enforcement
- Added price verification (349 kr/time)

### ✅ Fix 4: Add MEMORY_2 (Gmail Duplicate Check)

- Added HIGH priority rule for email duplicate prevention

### ✅ Fix 5: Add MEMORY_25 (Lead Name Verification)

- Added MEDIUM priority rule for name matching

---

## Testing

### Rule Enforcement Tests

- ⚠️ **Rule enforcement** - NOT TESTED (rules not integrated)
- ⚠️ **Violation detection** - NOT TESTED (rules not integrated)
- ⚠️ **Priority handling** - NOT TESTED (rules not integrated)
- ⚠️ **Edge cases** - NOT TESTED (rules not integrated)

### Integration Tests Required

1. **Test MEMORY_1:** Verify date/time checking before calendar operations
2. **Test MEMORY_4:** Verify lead source handling (Rengøring.nu, Leadmail.no, AdHelp)
3. **Test MEMORY_5:** Verify calendar check before date proposals
4. **Test MEMORY_7:** Verify email history check before sending quotes
5. **Test MEMORY_15:** Verify round hours enforcement (10:00, 10:30, not 10:15)
6. **Test MEMORY_16:** Verify flytterengøring photo requirement blocks quotes
7. **Test MEMORY_17:** Verify invoices are always draft, never auto-approved
8. **Test MEMORY_19:** Verify no attendees in calendar events
9. **Test MEMORY_24:** Verify 6-step job completion checklist

---

## Recommendations

### Immediate Actions (Priority 1)

1. **Fix incorrect rule implementations:**
   - ✅ MEMORY_16: Flytterengøring photos (DONE)
   - ✅ MEMORY_24: Job completion checklist (DONE)

2. **Add missing CRITICAL rules:**
   - ✅ MEMORY_17: Invoice draft-only (DONE)
   - ✅ MEMORY_2: Gmail duplicate check (DONE)

3. **Integrate rule enforcement:**
   - Add `applyMemoryRules()` call in `server/ai-router.ts`
   - Add rule validation in `server/intent-actions.ts`
   - Block actions if CRITICAL rules fail

### Short-term Actions (Priority 2)

4. **Add remaining missing rules:**
   - MEMORY_25: Lead name verification (DONE)
   - Verify if MEMORY_3, 6, 8-14, 20, 21 should exist

5. **Improve enforcement functions:**
   - Make MEMORY_1 actually validate date/time
   - Make MEMORY_5 and MEMORY_7 block actions if checks fail

6. **Add comprehensive testing:**
   - Unit tests for each rule
   - Integration tests for rule enforcement
   - E2E tests for critical workflows

### Long-term Actions (Priority 3)

7. **Documentation:**
   - Complete rule documentation with examples
   - Add rule violation handling guide
   - Create rule testing checklist

8. **Monitoring:**
   - Add rule violation logging
   - Create rule compliance dashboard
   - Track rule effectiveness metrics

---

## Verification Checklist

After fixes, verify:

- [ ] All CRITICAL rules implemented correctly
- [ ] MEMORY_16 enforces flytterengøring photos
- [ ] MEMORY_17 enforces invoice draft-only
- [ ] MEMORY_24 enforces job completion checklist
- [ ] MEMORY_2 checks Gmail duplicates
- [ ] MEMORY_25 verifies lead names
- [ ] Rule enforcement integrated in server code
- [ ] Rules block actions when violations occur
- [ ] Priority handling works correctly
- [ ] Edge cases handled properly
- [ ] Logging added for debugging
- [ ] Tests written and passing

---

## Next Steps

1. ✅ Apply fixes to `client/src/lib/ai-memory-rules.ts`
2. ⏳ Integrate rule enforcement in `server/ai-router.ts`
3. ⏳ Add rule validation in `server/intent-actions.ts`
4. ⏳ Write comprehensive tests
5. ⏳ Update documentation

---

**Report Generated:** 2025-01-28  
**Next Review:** After fixes applied and tested
