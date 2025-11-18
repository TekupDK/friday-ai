# Add Accessibility Features

You are a senior accessibility engineer adding WCAG 2.1 AA compliant features to Friday AI Chat. You START IMPLEMENTING immediately.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Standards:** WCAG 2.1 AA compliance
- **Focus:** Semantic HTML, ARIA, keyboard navigation, screen readers
- **Tools:** axe DevTools, screen readers, keyboard testing
- **Patterns:** shadcn/ui components (already accessible), custom components need work

## TASK

Add accessibility features to components/pages to meet WCAG 2.1 AA standards. START IMPLEMENTING immediately.

## CRITICAL: START IMPLEMENTING IMMEDIATELY

**DO NOT:**
- Just describe what needs to be done
- Wait for approval
- Show a plan without implementing

**DO:**
- Start adding accessibility features immediately
- Use tools to make code changes
- Test with screen reader
- Verify keyboard navigation

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Accessible Button
```typescript
// ✅ Good: Accessible button
<button
  onClick={onClose}
  aria-label="Close dialog"
  className="focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:outline-none"
>
  <X className="w-4 h-4" />
  <span className="sr-only">Close</span>
</button>
```

### Example: Accessible Form
```typescript
// ✅ Good: Proper form labels
<form onSubmit={handleSubmit}>
  <label htmlFor="email" className="block text-sm font-medium mb-2">
    Email Address
  </label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error email-help"
    aria-invalid={!!error}
    className="w-full px-3 py-2 border rounded-md"
  />
  {error && (
    <div id="email-error" role="alert" className="text-sm text-destructive mt-1">
      {error.message}
    </div>
  )}
</form>
```

## IMPLEMENTATION STEPS

1. **Audit current component:**
   - Check semantic HTML
   - Check ARIA attributes
   - Test keyboard navigation
   - Check color contrast

2. **Add accessibility features:**
   - Add semantic HTML
   - Add ARIA labels
   - Add keyboard support
   - Add focus management

3. **Test accessibility:**
   - Test with screen reader
   - Test keyboard-only navigation
   - Check color contrast
   - Verify focus indicators

4. **Verify:**
   - WCAG 2.1 AA compliant
   - Screen reader tested
   - Keyboard navigation works

## OUTPUT FORMAT

```markdown
### Accessibility Features Added: [Component]

**Features Added:**
- Semantic HTML: [changes]
- ARIA attributes: [added]
- Keyboard navigation: [improvements]
- Screen reader: [announcements]

**Before:**
\`\`\`typescript
[Before code]
\`\`\`

**After:**
\`\`\`typescript
[After code]
\`\`\`

**Verification:**
- ✅ WCAG 2.1 AA: PASSED
- ✅ Screen reader: TESTED
- ✅ Keyboard navigation: WORKING
```

