# Improved Code-Focused Prompts

**Date:** 2025-01-28  
**Purpose:** Optimized prompts for code-focused LLMs following best practices

---

## Analysis of Existing Prompts

### Current Issues Identified:

1. **Vague instructions** - "beskriv kort findings" (how short?)
2. **Missing context** - No file paths, code structure, or constraints
3. **Unclear output format** - No specification of what the deliverable should look like
4. **No verification criteria** - How to know if the task is complete?
5. **Missing role definition** - What is the AI's role and expertise?

---

## Prompt 1: Exploratory Debugging

### Original Prompt:

```
Formål: Find skjulte fejl, edgecases eller "gammel gæld" i eksisterende kode.
1. Start med at læse kode, tests og kendte bug-rapporter (beskriv kort findings).
2. Skriv hypotetiske tests for uforudsete input, ekstremværdi-scenarier og utilsigtet brug.
3. Brug AI til at generere og køre probable exploits eller forkert konfigurations-case.
4. Dokumenter enhver anomali og foreslå hvordan automatiske tests kan dække dem fremover.
```

### Issues:

- ❌ No role definition
- ❌ Vague scope ("kort findings" - how short?)
- ❌ No file paths or code structure context
- ❌ No output format specification
- ❌ No verification criteria
- ❌ Missing constraints (time, scope, priority)

---

### ✅ Improved Version:

`````markdown
# Exploratory Debugging - Systematic Code Analysis

## ROLE

You are a senior software engineer performing exploratory debugging to identify hidden bugs, edge cases, and technical debt in production code.

## TASK

Systematically analyze the codebase to find potential issues that automated tests might miss, focusing on edge cases, extreme values, and unintended usage patterns.

## CONTEXT

- **Codebase:** [Specify: e.g., "Rate limiting system in `server/rate-limiter-*.ts`"]
- **Scope:** [Specify: e.g., "All rate limiting functions and middleware"]
- **Known Issues:** [Reference: e.g., "See `docs/BUGFINDINGS.md` for known bugs"]
- **Test Coverage:** [Specify: e.g., "Existing tests in `server/__tests__/rate-limiter-*.test.ts`"]

## CONSTRAINTS

- **Time Limit:** [Specify: e.g., "Complete analysis within 30 minutes"]
- **Priority:** Focus on critical and high-priority issues first
- **Output Format:** Markdown report with code references
- **Code Style:** Follow existing patterns in codebase

## STEPS

### 1. Code Review & Documentation Scan

- Read target files: [List specific files]
- Read existing tests: [List test files]
- Read known bug reports: [List documentation files]
- **Output:** Summary table with:
  - Files analyzed (count)
  - Known bugs found (count)
  - Test coverage gaps identified (list)

### 2. Edge Case Test Generation

Create test files for:

- **Extreme values:** `userId = 0, -1, MAX_INT, NaN, undefined`
- **Invalid config:** `limit = 0, -1, Infinity, windowMs = 0`
- **Concurrent scenarios:** Rapid requests, multiple users, race conditions
- **Error recovery:** Redis failures, network timeouts, malformed data
- **Security exploits:** Key injection, bypass attempts, resource exhaustion

**Output:** Test file at `server/__tests__/[feature]-edge-cases.test.ts` with:

- Minimum 20 test cases
- Each test has descriptive name and clear assertion
- Tests are organized by category (describe blocks)

### 3. Exploit Attempt Generation

Generate and run tests for:

- **Input manipulation:** Special characters, unicode, null bytes
- **Configuration attacks:** Negative values, very large numbers
- **Timing attacks:** Boundary conditions, race conditions
- **Resource exhaustion:** Memory pressure, CPU exhaustion

**Output:** Test file at `server/__tests__/[feature]-exploit-attempts.test.ts`

### 4. Anomaly Documentation

For each anomaly found:

- **File:** `docs/EXPLORATORY_DEBUGGING_REPORT.md`
- **Format:**

  ````markdown
  ## ANOMALY #N: [Title] [Priority]

  **Systemlag:** [UI/API/DB/Logic/Data]
  **Fil:** `path/to/file.ts:line`

  **Problem:**

  ```typescript
  // Code snippet showing issue
  ```
  ````
`````

````

**Forklaring:**

1. Step-by-step explanation
2. Root cause analysis
3. Impact assessment

**Evidence:**

- Test failure: `test-name` (line X)
- Code review: Pattern match
- Historical: Similar bugs in past

**Fix Proposal:**

```typescript
// Proposed fix with code
```

**Regression Test:**

```typescript
// Test to prevent regression
```

````

## OUTPUT FORMAT

### Deliverable 1: Test Files

- `server/__tests__/[feature]-edge-cases.test.ts` (minimum 20 tests)
- `server/__tests__/[feature]-exploit-attempts.test.ts` (minimum 10 tests)
- All tests must pass or document expected failures

### Deliverable 2: Analysis Report

- `docs/EXPLORATORY_DEBUGGING_REPORT.md`
- Sections:

1. Executive Summary (anomalies found, priority breakdown)
2. Code Review Findings (files analyzed, known bugs)
3. Anomalies Identified (detailed analysis per anomaly)
4. Fixes Proposed (code patches with diffs)
5. Test Coverage Recommendations (automated tests to add)

### Deliverable 3: Fixes Applied (if any)

- `docs/EXPLORATORY_DEBUGGING_FIXES.md`
- Summary of fixes implemented with verification

## VERIFICATION CRITERIA

- ✅ All test files created and runnable
- ✅ Minimum 5 anomalies identified and documented
- ✅ Each anomaly has: problem description, root cause, impact, fix proposal
- ✅ Report includes code references (line numbers, file paths)
- ✅ All fixes have regression tests
- ✅ Report is actionable (clear next steps)

## EXAMPLES

**Good Anomaly Report:**

````markdown
## ANOMALY #1: Negative secondsUntilReset 🔴 CRITICAL

**Systemlag:** API Layer (Error Message)
**Fil:** `server/rate-limit-middleware.ts:63-65`

**Problem:**

```typescript
const secondsUntilReset = Math.ceil(
  (rateLimit.reset * 1000 - Date.now()) / 1000
);
// ⚠️ Can be negative if reset time is in the past!
```
````

**Test Evidence:**

```typescript
// server/__tests__/rate-limiter-edge-cases.test.ts:45
it("should handle negative secondsUntilReset", async () => {
  // Test that fails
});
```

````

**Bad Anomaly Report:**
```markdown
## Issue: Something might be wrong
// Too vague, no code reference, no test
````

````

---

### ✅ Minimal Version:

```markdown
# Exploratory Debugging

**Role:** Senior engineer finding hidden bugs
**Scope:** [Feature/File] - [Time limit]

**Steps:**
1. Read code + tests + docs → Summary table
2. Write edge case tests → `[feature]-edge-cases.test.ts` (20+ tests)
3. Write exploit tests → `[feature]-exploit-attempts.test.ts` (10+ tests)
4. Document anomalies → `EXPLORATORY_DEBUGGING_REPORT.md`

**Output:**
- Test files (runnable, passing)
- Report with: anomaly title, file:line, problem code, fix proposal, regression test

**Verification:**
- ✅ 5+ anomalies documented
- ✅ All have code references
- ✅ All have fix proposals
````

---

## Prompt 2: AI Bug Hunter

### Original Prompt:

```
Du fungerer som en AI bug hunter.
1. Når du modtager en fejlmeldings-tekst, kode eller stack trace:
   - Forklar præcis, hvad der gik galt, og i hvilket systemlag (UI, API, DB, logic, data).
   - List mindst 3–5 plausibel root causes, baseret på mønstre, kodeanmeldelser og historiske fejl.
   - Bed om ekstra information for at udelukke/indkredse fejlårsager.
2. Læg en handlingsplan for systematisk at isolere og reproducere fejlen via automatiserede tests.
3. Når fejlårsagen er fundet: Forklar, lav et patch (med diff) og opret regressionstest.
4. Opret en kort rapport med læringspunkter til udviklerteamet.
```

### Issues:

- ❌ Mixed language (Danish/English)
- ❌ No input format specification
- ❌ Vague output ("kort rapport" - how short?)
- ❌ No file structure or naming conventions
- ❌ Missing verification steps

---

### ✅ Improved Version:

````markdown
# AI Bug Hunter - Systematic Error Analysis

## ROLE

You are an AI bug hunter with expertise in:

- System architecture (UI, API, DB, Logic, Data layers)
- Error pattern recognition
- Root cause analysis
- Test-driven debugging

## TASK

When given an error message, code snippet, or stack trace, systematically identify the root cause, create a fix, and prevent regression.

## INPUT FORMAT

Provide one of:

1. **Error Message:** Full error text with context
2. **Stack Trace:** Complete stack trace with line numbers
3. **Code Snippet:** Problematic code with file path and line numbers
4. **Behavioral Description:** "When X happens, Y occurs instead of Z"

**Required Context:**

- File path(s) where error occurs
- Environment (development/production)
- Steps to reproduce
- Expected vs actual behavior

## CONSTRAINTS

- **Time Limit:** [Specify: e.g., "Complete analysis within 20 minutes"]
- **Priority:** Critical bugs first
- **Output Format:** Markdown with code references
- **Code Style:** Follow existing patterns

## STEPS

### 1. Error Analysis

**Input:** Error message/code/stack trace

**Output:** Analysis in `docs/AI_BUG_HUNTER_REPORT.md`:

```markdown
## Error Analysis

### What Went Wrong

- **System Layer:** [UI/API/DB/Logic/Data]
- **File:** `path/to/file.ts:line`
- **Error Type:** [TypeError/ReferenceError/LogicError/etc.]
- **Impact:** [Critical/High/Medium/Low]

### Step-by-Step Deviation

1. Expected: [What should happen]
2. Actual: [What actually happens]
3. Deviation: [Where it goes wrong]

### Affected Endpoints/Components

- `endpoint1` - [Impact description]
- `endpoint2` - [Impact description]
```
````

### 2. Root Cause Hypotheses

**Output:** List in report:

```markdown
## Root Cause Hypotheses

### Hypothesis #1: [Title] (Confidence: High/Medium/Low)

- **Pattern:** [Known pattern match]
- **Evidence:**
  - Code review: `file.ts:line` - [issue]
  - Historical: [Similar bug reference]
- **Test to Verify:** [Test description]

### Hypothesis #2: [Title] (Confidence: High/Medium/Low)

[...]
```

**Requirements:**

- Minimum 3 hypotheses
- Each has confidence level
- Each has evidence (code references)
- Each has verification test

### 3. Information Gathering

**Output:** Questions list:

```markdown
## Additional Information Needed

To narrow down root causes, please provide:

1. **Environment Details:**
   - [ ] Node.js version
   - [ ] Database version
   - [ ] Redis status (if applicable)

2. **Reproduction Steps:**
   - [ ] Can reproduce consistently? (Yes/No/Intermittent)
   - [ ] Specific user/input that triggers it?

3. **Logs:**
   - [ ] Server logs around time of error
   - [ ] Client console errors

4. **Related Issues:**
   - [ ] Similar errors in past?
   - [ ] Recent code changes?
```

### 4. Action Plan

**Output:** Test plan in report:

```markdown
## Action Plan - Systematic Isolation

### Phase 1: Reproduce (5 min)

- [ ] Create minimal test case
- [ ] Verify test fails with error
- [ ] Document exact failure

### Phase 2: Isolate (10 min)

- [ ] Test each hypothesis with targeted test
- [ ] Eliminate false hypotheses
- [ ] Identify root cause

### Phase 3: Fix (10 min)

- [ ] Implement fix
- [ ] Verify test passes
- [ ] Run regression tests

### Phase 4: Document (5 min)

- [ ] Update bug report
- [ ] Create regression test
- [ ] Document learning points
```

### 5. Fix Implementation

**When root cause found:**

**Output:**

1. **Fix Patch:** In report with diff:

   ````markdown
   ## Fix Implementation

   **File:** `path/to/file.ts`

   **Before:**

   ```typescript
   // Problematic code
   ```
   ````

   **After:**

   ```typescript
   // Fixed code
   ```

   **Diff:**

   ```diff
   - old code
   + new code
   ```

   ```

   ```

2. **Regression Test:** `server/__tests__/[feature]-bug-[id].test.ts`:

   ```typescript
   describe("Regression: [Bug Title]", () => {
     it("should prevent [bug description]", () => {
       // Test that would have caught the bug
     });
   });
   ```

3. **Verification:**
   - ✅ Original error test passes
   - ✅ Regression test passes
   - ✅ All existing tests still pass

### 6. Learning Report

**Output:** `docs/AI_BUG_HUNTER_LEARNINGS.md`:

```markdown
# Learning Points - [Bug Title]

## What Went Wrong

[Brief description]

## Root Cause

[Detailed explanation]

## Prevention

- **Code Pattern to Avoid:** [Pattern]
- **Test Pattern to Add:** [Pattern]
- **Code Review Checklist:** [Items]

## Similar Bugs to Check

- [ ] `file1.ts` - Similar pattern
- [ ] `file2.ts` - Similar pattern
```

## OUTPUT FORMAT

### Deliverable 1: Analysis Report

- `docs/AI_BUG_HUNTER_REPORT.md`
- Sections: Error Analysis, Root Causes, Action Plan, Fix

### Deliverable 2: Regression Test

- `server/__tests__/[feature]-bug-[id].test.ts`
- Test that reproduces bug and verifies fix

### Deliverable 3: Learning Report

- `docs/AI_BUG_HUNTER_LEARNINGS.md`
- Team learning points and prevention strategies

## VERIFICATION CRITERIA

- ✅ Error analyzed with system layer identified
- ✅ Minimum 3 root cause hypotheses with evidence
- ✅ Action plan with specific steps and time estimates
- ✅ Fix implemented with code diff
- ✅ Regression test created and passing
- ✅ Learning report with actionable prevention steps

## EXAMPLES

**Good Error Analysis:**

```markdown
### What Went Wrong

- **System Layer:** Logic (Rate Limiting)
- **File:** `server/rate-limiter-redis.ts:332`
- **Error Type:** LogicError (keySuffix ignored in fallback)
- **Impact:** High - Rate limits not enforced correctly
```

**Bad Error Analysis:**

```markdown
### What Went Wrong

Something is broken in the rate limiter.
// Too vague, no file reference, no impact assessment
```

````

---

### ✅ Minimal Version:

```markdown
# AI Bug Hunter

**Role:** Bug hunter analyzing errors
**Input:** Error message/code/stack trace + file path

**Steps:**
1. Analyze error → System layer, file:line, impact
2. List 3+ root cause hypotheses → Each with evidence + test
3. Create action plan → Reproduce → Isolate → Fix → Test
4. Implement fix → Code diff + regression test
5. Document learnings → Prevention strategies

**Output:**
- `AI_BUG_HUNTER_REPORT.md` (analysis + fix)
- `[feature]-bug-[id].test.ts` (regression test)
- `AI_BUG_HUNTER_LEARNINGS.md` (prevention)

**Verification:**
- ✅ Root cause identified
- ✅ Fix implemented with diff
- ✅ Regression test passes
````

---

## Prompt 3: Minimal Reproducible Test

### Original Prompt:

```
1. Skriv en minimal test, der tydeligt udløser fejlen.
2. Gennemgå trinvist, hvad der går galt i output.
3. List realistiske løsninger, og vurder fordele, ulemper og risici for hver.
4. Implementér kun det fix, der kan bekræftes ved, at alle tests består.
```

### Issues:

- ❌ No role definition
- ❌ No input format (what error/bug?)
- ❌ Vague output format
- ❌ No file naming convention
- ❌ Missing verification criteria

---

### ✅ Improved Version:

````markdown
# Minimal Reproducible Test and Fix

## ROLE

You are a test-driven developer creating minimal reproducible tests to isolate and fix bugs.

## TASK

Given a bug description or error, create the smallest possible test that reproduces it, analyze the failure, propose solutions, and implement only the fix that passes all tests.

## INPUT FORMAT

Provide:

- **Bug Description:** "When [action], [unexpected behavior] occurs"
- **Error Message:** (if available)
- **File/Component:** Path to code where bug occurs
- **Expected Behavior:** What should happen

## CONSTRAINTS

- **Test Must Be:** Minimal (only code needed to reproduce)
- **Fix Must Be:** Verifiable (all tests pass)
- **Output Format:** Test file + fix with code references
- **Time Limit:** [Specify: e.g., "15 minutes"]

## STEPS

### 1. Create Minimal Test

**Output:** `server/__tests__/[feature]-minimal-repro.test.ts`

**Requirements:**

- Test name clearly describes the bug
- Minimal setup (only what's needed)
- Single assertion that fails
- Clear expected vs actual in test output

**Example:**

```typescript
describe("Minimal Reproducible Test - [Bug Title]", () => {
  it("should demonstrate [bug description]", async () => {
    // Minimal setup
    const result = await functionUnderTest(input);

    // This assertion fails, proving the bug
    expect(result.success).toBe(true); // Expected true, got false
  });
});
```
````

### 2. Analyze Test Failure

**Output:** Analysis in `docs/MINIMAL_REPRO_TEST_ANALYSIS.md`

**Format:**

```markdown
## Test Failure Analysis

### Test Output
```

Expected: true
Received: false

```

### Step-by-Step Breakdown
1. **Setup:** [What the test does]
2. **Execution:** [What function does]
3. **Expected:** [What should happen]
4. **Actual:** [What actually happens]
5. **Deviation Point:** [Where it goes wrong - file:line]

### Root Cause
[Explanation of why it fails]
```

### 3. Solution Analysis

**Output:** Solutions table in analysis doc:

```markdown
## Solution Options

| Solution                    | Pros      | Cons      | Risk           | Verdict         |
| --------------------------- | --------- | --------- | -------------- | --------------- |
| **Option 1:** [Description] | ✅ [Pros] | ❌ [Cons] | [Low/Med/High] | [Accept/Reject] |
| **Option 2:** [Description] | ✅ [Pros] | ❌ [Cons] | [Low/Med/High] | [Accept/Reject] |
| **Option 3:** [Description] | ✅ [Pros] | ❌ [Cons] | [Low/Med/High] | [Accept/Reject] |

### Selected Solution

**Option X** - [Reason for selection]
```

**Requirements:**

- Minimum 2 solutions (usually 3-5)
- Each has pros, cons, risk assessment
- One solution selected with rationale

### 4. Implement Fix

**Output:**

1. **Code Fix:** In target file with code reference
2. **Updated Test:** Test now passes
3. **Verification:** All tests pass

**Format:**

````markdown
## Fix Implementation

**File:** `path/to/file.ts:line`

**Change:**

```diff
- // Old code (buggy)
+ // New code (fixed)
```
````

**Verification:**

- ✅ Minimal test passes
- ✅ All existing tests pass
- ✅ No regressions introduced

````

### 5. Documentation
**Output:** `docs/MINIMAL_REPRO_TEST_FIXED.md`

**Format:**
```markdown
# Minimal Reproducible Test - [Bug Title] - FIXED

## Bug Summary
[Brief description]

## Test
- **File:** `server/__tests__/[feature]-minimal-repro.test.ts`
- **Test Name:** [Test name]
- **Status:** ✅ Passing

## Fix
- **File:** `path/to/file.ts:line`
- **Change:** [Description]
- **Verification:** All tests pass

## Learning
[Key takeaway for team]
````

## OUTPUT FORMAT

### Deliverable 1: Minimal Test

- `server/__tests__/[feature]-minimal-repro.test.ts`
- Test that clearly reproduces the bug
- Test fails with clear error message

### Deliverable 2: Analysis Document

- `docs/MINIMAL_REPRO_TEST_ANALYSIS.md`
- Test failure breakdown
- Solution options with pros/cons/risks

### Deliverable 3: Fix Implementation

- Code fix in target file
- Updated test (now passing)
- Verification (all tests pass)

### Deliverable 4: Summary Document

- `docs/MINIMAL_REPRO_TEST_FIXED.md`
- Bug summary, fix, learning points

## VERIFICATION CRITERIA

- ✅ Minimal test created and fails (reproduces bug)
- ✅ Test failure analyzed step-by-step
- ✅ Multiple solutions evaluated
- ✅ Fix implemented and verified (all tests pass)
- ✅ Documentation complete

## EXAMPLES

**Good Minimal Test:**

```typescript
it("should maintain separate rate limits per operation when Redis unavailable", async () => {
  // Minimal: Just test the bug scenario
  const archiveResult = await checkRateLimitUnified(
    1,
    { limit: 5, windowMs: 60000 },
    "archive"
  );
  expect(archiveResult.success).toBe(true);

  // Fill up archive limit
  for (let i = 0; i < 5; i++) {
    await checkRateLimitUnified(1, { limit: 5, windowMs: 60000 }, "archive");
  }

  // Delete should have separate limit (this fails, proving bug)
  const deleteResult = await checkRateLimitUnified(
    1,
    { limit: 5, windowMs: 60000 },
    "delete"
  );
  expect(deleteResult.success).toBe(true); // Expected true, got false
});
```

**Bad Minimal Test:**

```typescript
it("test bug", () => {
  // Too vague, no clear assertion, doesn't isolate the bug
  testSomething();
});
```

````

---

### ✅ Minimal Version:

```markdown
# Minimal Reproducible Test

**Role:** TDD developer creating minimal tests
**Input:** Bug description + file path

**Steps:**
1. Write minimal test → `[feature]-minimal-repro.test.ts` (fails)
2. Analyze failure → Step-by-step breakdown
3. List solutions → Pros/cons/risks table
4. Implement fix → Code diff + test passes
5. Document → Summary with learning

**Output:**
- Test file (minimal, fails clearly)
- Analysis doc (failure breakdown + solutions)
- Fix (code + verification)
- Summary doc (bug + fix + learning)

**Verification:**
- ✅ Test reproduces bug
- ✅ Fix verified (all tests pass)
````

---

## When to Use Each Version

### Use **Improved Version** when:

- ✅ Complex bugs requiring detailed analysis
- ✅ Team needs comprehensive documentation
- ✅ Multiple stakeholders need to understand the fix
- ✅ Learning points are important for team
- ✅ Time available for thorough documentation

### Use **Minimal Version** when:

- ✅ Quick bug fixes needed
- ✅ Developer is familiar with codebase
- ✅ Simple, isolated bugs
- ✅ Time-constrained situations
- ✅ Personal notes/documentation

---

## Best Practices Applied

### ✅ Role Definition

- Clear role (senior engineer, bug hunter, TDD developer)
- Expertise areas specified

### ✅ Task Clarity

- Specific, actionable task
- Clear scope and boundaries

### ✅ Context Provided

- File paths, code structure
- Known issues, test coverage
- Environment details

### ✅ Constraints Defined

- Time limits
- Priority levels
- Output formats
- Code style requirements

### ✅ Concrete Output

- Specific file names and locations
- Code examples with line numbers
- Verifiable deliverables

### ✅ Verification Criteria

- Clear success metrics
- Test requirements
- Documentation standards

---

## Template for Creating New Prompts

```markdown
# [Prompt Title]

## ROLE

[What is the AI's role and expertise?]

## TASK

[What specific task should be completed?]

## CONTEXT

- **Codebase:** [What code/files are involved?]
- **Scope:** [What's in/out of scope?]
- **Known Issues:** [Reference existing docs]
- **Test Coverage:** [What tests exist?]

## CONSTRAINTS

- **Time Limit:** [How long?]
- **Priority:** [What's most important?]
- **Output Format:** [What format?]
- **Code Style:** [What patterns to follow?]

## STEPS

[Numbered, specific steps with outputs]

## OUTPUT FORMAT

[Specific deliverables with file names]

## VERIFICATION CRITERIA

[How to know it's done correctly?]

## EXAMPLES

[Good vs bad examples]
```

---

**Generated:** 2025-01-28  
**Status:** Ready for use
