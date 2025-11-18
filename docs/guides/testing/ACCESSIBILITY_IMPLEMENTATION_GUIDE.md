# Accessibility Implementation Guide

This guide provides step-by-step instructions for implementing the accessibility improvements identified in the audit.

## Quick Start

### 1. Add Skip Links to Main Layout

Update `App.tsx` or your main layout component:

```typescript
import { SkipLinks } from "@/components/SkipLinks";

function App() {
  return (
    <ErrorBoundary>
      <SkipLinks />
      <ThemeProvider defaultTheme="dark" switchable={true}>
        {/* ... rest of app */}
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

### 2. Add Page Titles

Update page components to use the `usePageTitle` hook:

```typescript
import { usePageTitle } from "@/hooks/usePageTitle";

function WorkspaceLayout() {
  usePageTitle("Workspace");
  // ... rest of component
}
```

### 3. Add Main Content and Navigation IDs

Update layout components to include skip link targets:

```typescript
// DashboardLayout.tsx
<Sidebar id="navigation">
  {/* ... sidebar content */}
</Sidebar>

<SidebarInset>
  <main id="main-content" className="flex-1 p-4">
    {children}
  </main>
</SidebarInset>
```

### 4. Fix Heading Hierarchy

Replace generic headings with proper semantic hierarchy:

```typescript
// Before
<h3 className="text-sm font-semibold">Settings</h3>

// After
<h2 className="text-base font-semibold">Settings</h2>
```

### 5. Add ARIA Labels to Icon Buttons

```typescript
// Before
<button onClick={handleClick}>
  <XIcon />
</button>

// After
<button onClick={handleClick} aria-label="Close dialog">
  <XIcon aria-hidden="true" />
  <span className="sr-only">Close</span>
</button>
```

### 6. Enhance Focus Indicators

Add focus styles to interactive elements:

```typescript
// Add to component className
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

### 7. Improve Image Alt Text

```typescript
// Before
<img src={logo} alt="Logo" />

// After
<img src={logo} alt={`${APP_TITLE} logo`} />

// Or for decorative images
<img src={decoration} alt="" role="presentation" aria-hidden="true" />
```

## Priority Implementation Order

### Week 1: Critical Fixes
1. ✅ Add SkipLinks component
2. ✅ Implement usePageTitle hook
3. ✅ Fix heading hierarchy in SettingsDialog
4. ✅ Add ARIA labels to all icon buttons
5. ✅ Add focus indicators to EmailListV2

### Week 2: High Priority
1. ✅ Improve color contrast
2. ✅ Add keyboard shortcuts dialog
3. ✅ Enhance form error announcements
4. ✅ Fix touch target sizes
5. ✅ Add aria-describedby to complex controls

### Week 3: Testing & Documentation
1. ✅ Set up automated accessibility testing
2. ✅ Manual testing with screen readers
3. ✅ Create accessibility documentation
4. ✅ Train team on accessibility

## Testing Checklist

- [ ] Run Lighthouse accessibility audit (target: 90+)
- [ ] Test with NVDA screen reader
- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test keyboard navigation (Tab, Enter, Space, Esc)
- [ ] Test at 200% zoom
- [ ] Verify color contrast ratios
- [ ] Test with axe DevTools
- [ ] Run automated tests

## Resources

- [Full Accessibility Audit](../../status-reports/feature-status/ACCESSIBILITY_AUDIT.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

