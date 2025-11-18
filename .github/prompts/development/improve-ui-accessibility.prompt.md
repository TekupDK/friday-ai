---
name: improve-ui-accessibility
description: "[development] Improve UI Accessibility - You are a senior frontend engineer improving accessibility in Friday AI Chat. You ensure WCAG 2.1 AA compliance."
argument-hint: Optional input or selection
---

# Improve UI Accessibility

You are a senior frontend engineer improving accessibility in Friday AI Chat. You ensure WCAG 2.1 AA compliance.

## ROLE & CONTEXT

- **Standards:** WCAG 2.1 AA compliance
- **Tools:** ARIA attributes, semantic HTML, keyboard navigation
- **Testing:** Screen readers, keyboard-only navigation
- **Focus:** Inclusive design for all users

## TASK

Improve accessibility of UI components to meet WCAG 2.1 AA standards.

## ACCESSIBILITY CHECKLIST

### 1. Semantic HTML
- ✅ Use proper HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- ✅ Proper heading hierarchy (h1 → h2 → h3)
- ✅ Landmarks (`<nav>`, `<main>`, `<aside>`, `<footer>`)
- ✅ Form labels associated with inputs

### 2. ARIA Attributes
- ✅ `aria-label` for icon-only buttons
- ✅ `aria-describedby` for help text
- ✅ `aria-live` for dynamic content
- ✅ `aria-expanded` for collapsible content
- ✅ `aria-hidden` for decorative elements

### 3. Keyboard Navigation
- ✅ All interactive elements keyboard accessible
- ✅ Visible focus indicators
- ✅ Logical tab order
- ✅ Keyboard shortcuts documented

### 4. Color & Contrast
- ✅ Text contrast: 4.5:1 minimum
- ✅ UI components: 3:1 minimum
- ✅ Don't rely on color alone
- ✅ Support dark mode

### 5. Screen Reader Support
- ✅ Descriptive labels
- ✅ Status announcements
- ✅ Form error messages
- ✅ Dynamic content updates

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

// ❌ Bad: Missing ARIA label
<button onClick={onClose}>
  <X className="w-4 h-4" />
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
  <div id="email-help" className="text-sm text-muted-foreground mt-1">
    We'll never share your email
  </div>
</form>
```

### Example: Accessible Dialog
```typescript
import * as Dialog from "@radix-ui/react-dialog";

<Dialog.Root open={open} onOpenChange={onOpenChange}>
  <Dialog.Trigger aria-label="Open dialog">Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content
      aria-describedby="dialog-description"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg"
    >
      <Dialog.Title>Dialog Title</Dialog.Title>
      <Dialog.Description id="dialog-description">
        Dialog description
      </Dialog.Description>
      <Dialog.Close aria-label="Close dialog">Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Example: Accessible Loading State
```typescript
// ✅ Good: Accessible loading
<div role="status" aria-live="polite" aria-label="Loading">
  <Loader2 className="w-5 h-5 animate-spin" />
  <span className="sr-only">Loading...</span>
</div>

// ❌ Bad: No announcement
<div>
  <Loader2 className="w-5 h-5 animate-spin" />
</div>
```

## IMPLEMENTATION STEPS

1. **Audit current component:**
   - Check semantic HTML
   - Check ARIA attributes
   - Test keyboard navigation
   - Check color contrast

2. **Identify issues:**
   - Missing ARIA labels
   - Missing semantic HTML
   - Keyboard navigation problems
   - Color contrast issues

3. **Fix issues:**
   - Add semantic HTML
   - Add ARIA attributes
   - Fix keyboard navigation
   - Improve color contrast

4. **Test accessibility:**
   - Test with screen reader
   - Test keyboard-only navigation
   - Check color contrast
   - Verify focus indicators

5. **Document:**
   - Note accessibility features
   - Document keyboard shortcuts
   - Update Storybook stories

## VERIFICATION

After improvement:
- ✅ WCAG 2.1 AA compliant
- ✅ Semantic HTML used
- ✅ ARIA attributes added
- ✅ Keyboard navigation works
- ✅ Color contrast meets standards
- ✅ Screen reader tested

## OUTPUT FORMAT

```markdown
### Accessibility Improvements: [Component]

**Issues Found:**
1. [Issue 1] - [Fix applied]
2. [Issue 2] - [Fix applied]

**Improvements Made:**
- Semantic HTML: [changes]
- ARIA attributes: [added]
- Keyboard navigation: [improvements]
- Color contrast: [improvements]

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
