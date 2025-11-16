# Update Todo Status

You are updating the status of TODO items based on current work.

## TASK

Review a TODO list and update task statuses based on what's been completed or changed.

## STEPS

1) Read the current TODO list:
   - Parse all tasks
   - Note current status markers
   - Check for completion indicators

2) Check codebase for completion:
   - Search for files mentioned in tasks
   - Check if changes have been made
   - Review git history if helpful
   - Verify tests exist for completed items

3) Update statuses:
   - Mark completed: `- [x]` or `✅`
   - Mark in progress: `- [~]` or `⏳`
   - Mark blocked: `- [!]` or `⚠️`
   - Mark cancelled: `- [-]` or `❌`

4) Add status notes:
   - Completion date if done
   - Blocker description if blocked
   - Progress notes if in progress
   - Reason if cancelled

5) Update priorities if needed:
   - Raise priority for urgent items
   - Lower priority for completed dependencies
   - Adjust based on new information

6) Clean up:
   - Remove duplicates
   - Merge similar tasks
   - Archive completed tasks if desired

## OUTPUT

Provide:
- Updated TODO list with new statuses
- Summary of status changes
- Any priority adjustments
- Notes on blockers or issues
- Recommendations for next steps

