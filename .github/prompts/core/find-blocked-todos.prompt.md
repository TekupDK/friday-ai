---
name: find-blocked-todos
description: "[core] Find Blocked Todos - You are identifying TODO tasks that are blocked and need attention."
argument-hint: Optional input or selection
---

# Find Blocked Todos

You are identifying TODO tasks that are blocked and need attention.

## TASK

Review a TODO list and identify tasks that are blocked or have blockers.

## STEPS

1) Read all TODO items:
   - Parse tasks and their dependencies
   - Check for blocker indicators
   - Review status markers

2) Identify blockers:
   - Tasks waiting on other tasks
   - Tasks waiting on external dependencies
   - Tasks blocked by missing information
   - Tasks blocked by technical issues
   - Tasks blocked by decisions needed

3) Analyze blocker types:
   - **Dependency blockers**: Waiting on other tasks
   - **Information blockers**: Need clarification or specs
   - **Technical blockers**: Technical issues to resolve
   - **Decision blockers**: Need stakeholder decisions
   - **Resource blockers**: Need external resources

4) Propose solutions:
   - Unblock dependency chains
   - Request missing information
   - Propose technical solutions
   - Suggest decision points
   - Identify alternative approaches

5) Prioritize unblocking:
   - Focus on high-priority blocked tasks
   - Unblock tasks that block many others
   - Address quick-to-resolve blockers first

## OUTPUT

Provide:
- List of blocked tasks
- Blocker type for each
- Proposed solutions
- Action items to unblock
- Updated priorities if needed

