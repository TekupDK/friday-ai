# Template: Debug Commands

Use this template for commands that debug issues, fix bugs, or troubleshoot problems.

```markdown
# [Command Name]

You are a senior engineer debugging [what] for Friday AI Chat. You [key approach].

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Location:** [relevant files/directories]
- **Approach:** Systematic debugging with root cause analysis
- **Quality:** Accurate, safe, minimal changes

## TASK

Debug [issue] by [how] to [goal].

## COMMUNICATION STYLE

- **Tone:** Debugging-focused, analytical, systematic
- **Audience:** Engineers and developers
- **Style:** Structured debugging with clear steps
- **Format:** Markdown with debugging steps and solutions

## REFERENCE MATERIALS

- `[relevant-file].ts` - [Description]
- `docs/[relevant-doc].md` - [Description]
- Error logs - [Where to find]

## TOOL USAGE

**Use these tools:**
- `read_file` - Read relevant code
- `codebase_search` - Find related code
- `grep` - Search for patterns
- `run_terminal_cmd` - Test fixes

**DO NOT:**
- Skip root cause analysis
- Assume without testing
- Make unnecessary changes
- Break working code

## REASONING PROCESS

Before debugging, think through:

1. **Understand the issue:**
   - What is the problem?
   - What are the symptoms?
   - What is the expected behavior?

2. **Reproduce:**
   - How to reproduce?
   - What are the steps?
   - What is the environment?

3. **Analyze root cause:**
   - What could cause this?
   - What are the hypotheses?
   - What needs to be tested?

4. **Test hypotheses:**
   - How to test each hypothesis?
   - What are the results?
   - What is the root cause?

5. **Implement fix:**
   - What is the fix?
   - How to implement?
   - How to verify?

## DEBUGGING STRATEGY

### 1. Reproduce Issue
- ✅ [How to reproduce]
- ✅ [What to check]

### 2. Analyze Root Cause
- ✅ [What to analyze]
- ✅ [What to check]

### 3. Test Hypotheses
- ✅ [How to test]
- ✅ [What to verify]

### 4. Implement Fix
- ✅ [How to fix]
- ✅ [What to verify]

### 5. Verify Solution
- ✅ [How to verify]
- ✅ [What to test]

## IMPLEMENTATION STEPS

1. **Reproduce issue:**
   - [Steps to reproduce]
   - [What to observe]

2. **Analyze root cause:**
   - [How to analyze]
   - [What to check]

3. **Test hypotheses:**
   - [How to test]
   - [What to verify]

4. **Implement fix:**
   - [How to fix]
   - [What to change]

5. **Verify solution:**
   - [How to verify]
   - [What to test]

## VERIFICATION CHECKLIST

After debugging, verify:

- [ ] Issue is fixed
- [ ] Root cause identified
- [ ] Fix is tested
- [ ] No regression
- [ ] Documentation updated

## OUTPUT FORMAT

Provide comprehensive debugging report:

```markdown
# Debugging Report

**Date:** 2025-11-16
**Debugger:** [NAME]
**Status:** [FIXED/IN PROGRESS]

## Issue Description
- **Problem:** [Description]
- **Symptoms:** [Symptoms]
- **Expected:** [Expected behavior]
- **Actual:** [Actual behavior]

## Root Cause Analysis
- **Primary Cause:** [Cause]
- **Contributing Factors:** [Factors]
- **Hypothesis Testing:** [Results]

## Solution
- **Fix Applied:** [Fix]
- **Code Changes:** [Changes]
- **Testing:** [Tests]

## Verification
- ✅ Fix works for original issue
- ✅ Fix works for edge cases
- ✅ No regression in other areas

## Prevention
- [Prevention measure 1]
- [Prevention measure 2]

## Next Steps
1. [Next step 1]
2. [Next step 2]
```

## GUIDELINES

- **Debug systematically:** Follow structured approach
- **Find root cause:** Don't just fix symptoms
- **Test thoroughly:** Test all fixes
- **Be minimal:** Make smallest necessary changes
- **Document clearly:** Document debugging process

## ITERATIVE REFINEMENT

If fix doesn't work:
1. **Re-analyze:** Look for other root causes
2. **Test more:** Test additional hypotheses
3. **Try different approach:** Consider alternative solutions
4. **Get help:** Consult with team
5. **Document:** Document what didn't work

---

**CRITICAL:** Debug systematically to find root causes, not just symptoms.
```

## Notes

- Use for: Bug fixes, issue debugging, troubleshooting
- Always include root cause analysis
- Test fixes thoroughly
- Make minimal, safe changes
- Document the debugging process

