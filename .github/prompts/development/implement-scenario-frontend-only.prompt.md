---
name: implement-scenario-frontend-only
description: "[development] Implement Scenario: Frontend Only - You are implementing frontend-only changes (no backend work)."
argument-hint: Optional input or selection
---

# Implement Scenario: Frontend Only

You are implementing frontend-only changes (no backend work).

## TASK

Implement UI changes, components, and pages without modifying backend code.

## STEPS

1) Understand the frontend requirements:
   - Components to create/modify
   - Pages to add/update
   - UI/UX changes needed
   - State management required

2) Use existing APIs:
   - Check available tRPC procedures
   - Use existing data fetching hooks
   - Work with current data structures
   - Don't request new backend endpoints

3) Create/modify components:
   - Follow React 19 patterns
   - Use TypeScript strictly
   - Use Tailwind CSS 4 for styling
   - Use shadcn/ui components
   - Handle loading/error/empty states

4) Update pages/routes:
   - Add routes if new pages
   - Update existing pages
   - Wire components together
   - Handle navigation

5) Testing:
   - Run typecheck
   - Test component rendering
   - Add Playwright tests if needed
   - Verify UI works with existing backend

## OUTPUT

Provide:
- Components created/modified
- Pages updated
- Routes added/changed
- UI changes summary
- No backend changes made

