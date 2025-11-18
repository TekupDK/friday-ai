# Accessibility Testing Guide

**Date:** January 28, 2025  
**Project:** Friday AI Chat (TekupDK)  
**WCAG Target Level:** AA (WCAG 2.1)

## Overview

This guide provides comprehensive procedures for testing accessibility in the Friday AI Chat application. It covers automated testing, manual testing with screen readers, keyboard navigation testing, and visual accessibility checks.

---

## Table of Contents

1. [Automated Testing](#automated-testing)
2. [Manual Screen Reader Testing](#manual-screen-reader-testing)
3. [Keyboard Navigation Testing](#keyboard-navigation-testing)
4. [Visual Accessibility Testing](#visual-accessibility-testing)
5. [Testing Checklist](#testing-checklist)
6. [Tools and Resources](#tools-and-resources)

---

## 1. Automated Testing

### 1.1 Jest + axe-core Setup

**Status:** ✅ Example test created at `client/src/__tests__/accessibility/LoginPage.a11y.test.tsx`

**Installation:**
```bash
pnpm add -D jest-axe @axe-core/react
```

**Test Structure:**
```typescript
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import LoginPage from "@/pages/LoginPage";

expect.extend(toHaveNoViolations);

describe("LoginPage Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 1.2 Running Automated Tests

```bash
# Run all accessibility tests
pnpm test -- a11y

# Run specific test file
pnpm test LoginPage.a11y.test.tsx

# Run with coverage
pnpm test --coverage -- a11y
```

### 1.3 Components to Test

**Priority 1 (Critical User Flows):**
- ✅ `LoginPage.tsx` - Authentication flow
- `WorkspaceLayout.tsx` - Main application interface
- `EmailListV2.tsx` - Email browsing
- `SettingsDialog.tsx` - Settings configuration

**Priority 2 (Secondary Features):**
- `DashboardLayout.tsx` - Dashboard navigation
- `ChatInput.tsx` - Message composition
- `UserProfileDialog.tsx` - User profile management

**Priority 3 (Supporting Components):**
- All dialog components
- All form components
- All navigation components

### 1.4 Continuous Integration

Add to CI/CD pipeline:
```yaml
# .github/workflows/accessibility.yml
- name: Run accessibility tests
  run: pnpm test -- a11y
```

---

## 2. Manual Screen Reader Testing

### 2.1 NVDA (Windows)

**Setup:**
1. Download NVDA from https://www.nvaccess.org/
2. Install and start NVDA
3. Use `Insert + Q` to quit, `Insert + S` to toggle speech

**Testing Procedure:**

1. **Page Navigation:**
   - Press `H` to navigate headings
   - Press `1-6` to navigate heading levels
   - Press `L` to navigate links
   - Press `F` to navigate forms
   - Press `B` to navigate buttons

2. **Landmarks:**
   - Press `D` to navigate landmarks
   - Verify skip links are announced
   - Verify main content region is identified

3. **Forms:**
   - Tab through form fields
   - Verify labels are announced
   - Verify error messages are announced
   - Verify required fields are indicated

4. **Interactive Elements:**
   - Verify button purposes are clear
   - Verify link purposes are clear
   - Verify ARIA labels are announced
   - Verify state changes are announced

**Test Checklist:**
- [ ] All headings are properly announced
- [ ] Skip links are functional
- [ ] Form labels are associated correctly
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Dialog titles and descriptions are announced
- [ ] Button purposes are clear
- [ ] Link purposes are clear (not just "link")

### 2.2 VoiceOver (macOS/iOS)

**Setup:**
1. Enable VoiceOver: `Cmd + F5` (macOS) or Settings > Accessibility > VoiceOver (iOS)
2. Use `Ctrl + Option` as the VoiceOver modifier key

**Testing Procedure:**

1. **Navigation:**
   - `Ctrl + Option + H` - Navigate headings
   - `Ctrl + Option + L` - Navigate links
   - `Ctrl + Option + F` - Navigate forms
   - `Ctrl + Option + B` - Navigate buttons
   - `Ctrl + Option + R` - Navigate regions

2. **Reading:**
   - `Ctrl + Option + Right Arrow` - Read next item
   - `Ctrl + Option + Left Arrow` - Read previous item
   - `Ctrl + Option + A` - Start reading from cursor

3. **Forms:**
   - Tab through form fields
   - Verify labels are announced
   - Verify error messages are announced
   - Verify required fields are indicated

**Test Checklist:**
- [ ] All headings are properly announced
- [ ] Skip links are functional
- [ ] Form labels are associated correctly
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Dialog titles and descriptions are announced
- [ ] Button purposes are clear
- [ ] Link purposes are clear

### 2.3 Screen Reader Testing Checklist

**For Each Major User Flow:**

1. **Login Flow:**
   - [ ] Page title is announced
   - [ ] Form labels are announced
   - [ ] Error messages are announced
   - [ ] Loading state is announced
   - [ ] Success state is announced

2. **Email Browsing:**
   - [ ] Email list is announced as listbox
   - [ ] Email items are announced with sender, subject, read status
   - [ ] Selected email is announced
   - [ ] Keyboard navigation works (arrow keys)
   - [ ] Actions are accessible

3. **Settings:**
   - [ ] Dialog title is announced
   - [ ] Section headings are announced
   - [ ] Switch controls have labels and descriptions
   - [ ] Changes are announced
   - [ ] Close button is accessible

4. **Chat Interface:**
   - [ ] Message input is announced
   - [ ] Messages are announced in order
   - [ ] Loading states are announced
   - [ ] Error messages are announced

---

## 3. Keyboard Navigation Testing

### 3.1 Basic Keyboard Navigation

**Test Procedure:**

1. **Tab Navigation:**
   - Press `Tab` to move forward
   - Press `Shift + Tab` to move backward
   - Verify focus order is logical
   - Verify focus indicators are visible

2. **Form Navigation:**
   - Tab through all form fields
   - Verify labels are associated
   - Verify error messages are accessible
   - Verify submit buttons are accessible

3. **Dialog Navigation:**
   - Open dialog with keyboard
   - Verify focus is trapped in dialog
   - Verify `Esc` closes dialog
   - Verify focus returns to trigger

4. **List Navigation:**
   - Use arrow keys to navigate lists
   - Use `Enter` or `Space` to select
   - Verify selected state is indicated

### 3.2 Keyboard Shortcuts

**Test All Shortcuts:**

- [ ] `?` or `Shift + ?` - Opens keyboard shortcuts dialog
- [ ] `Ctrl + 1/2/3` - Focus panels (WorkspaceLayout)
- [ ] `Esc` - Closes dialogs/modals
- [ ] `Tab` - Navigates forward
- [ ] `Shift + Tab` - Navigates backward
- [ ] `Enter` - Activates buttons/links
- [ ] `Space` - Activates buttons/checkboxes

### 3.3 Keyboard Testing Checklist

**For Each Component:**

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] Keyboard shortcuts work as expected
- [ ] No keyboard traps
- [ ] Escape key closes modals/dialogs
- [ ] Tab order follows visual order

---

## 4. Visual Accessibility Testing

### 4.1 Color Contrast

**Tools:**
- Browser DevTools (Chrome/Firefox)
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools browser extension

**Test Procedure:**

1. **Text Contrast:**
   - Test all text colors against backgrounds
   - Verify 4.5:1 ratio for normal text (WCAG AA)
   - Verify 3:1 ratio for large text (WCAG AA)
   - Test in both light and dark modes

2. **Interactive Elements:**
   - Test button text contrast
   - Test link text contrast
   - Test focus indicator contrast
   - Test disabled state contrast

**Test Checklist:**
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Large text (18pt+) meets 3:1 contrast ratio
- [ ] Focus indicators meet 3:1 contrast ratio
- [ ] Works in both light and dark modes

### 4.2 Touch Target Sizes

**Requirements:**
- Minimum 44x44px for touch targets (iOS/Android guidelines)
- Minimum 24x24px for desktop (WCAG 2.1)

**Test Procedure:**

1. **Mobile Testing:**
   - Test on actual device or browser DevTools mobile view
   - Verify all buttons are at least 44x44px
   - Verify spacing between touch targets
   - Test with thumb navigation

2. **Desktop Testing:**
   - Verify interactive elements are at least 24x24px
   - Verify hover states are accessible
   - Test with mouse and keyboard

**Test Checklist:**
- [ ] All touch targets meet minimum size requirements
- [ ] Spacing between targets is adequate
- [ ] Targets are not overlapping
- [ ] Works on both mobile and desktop

### 4.3 Visual Focus Indicators

**Test Procedure:**

1. **Keyboard Focus:**
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Verify focus indicators have sufficient contrast
   - Verify focus indicators are not obscured

2. **Focus Styles:**
   - Test `focus-visible` styles
   - Test `focus` styles (if needed)
   - Verify focus rings are 2px minimum
   - Verify focus offset is visible

**Test Checklist:**
- [ ] All interactive elements have visible focus indicators
- [ ] Focus indicators meet contrast requirements
- [ ] Focus indicators are not obscured
- [ ] Focus styles are consistent

---

## 5. Testing Checklist

### 5.1 Pre-Release Checklist

**Automated Testing:**
- [ ] All accessibility tests pass
- [ ] No axe violations in critical flows
- [ ] Lighthouse accessibility score > 90

**Manual Testing:**
- [ ] NVDA testing completed on Windows
- [ ] VoiceOver testing completed on macOS
- [ ] Keyboard navigation tested
- [ ] Color contrast verified
- [ ] Touch targets verified

**Documentation:**
- [ ] Accessibility statement updated
- [ ] Known issues documented
- [ ] Testing results documented

### 5.2 Component-Level Checklist

**For Each New Component:**

- [ ] Automated test created
- [ ] Screen reader tested
- [ ] Keyboard navigation tested
- [ ] Color contrast verified
- [ ] Touch targets verified
- [ ] ARIA attributes verified
- [ ] Focus management verified

---

## 6. Tools and Resources

### 6.1 Automated Testing Tools

- **jest-axe** - Jest matchers for axe-core
- **@axe-core/react** - React wrapper for axe-core
- **axe DevTools** - Browser extension for Chrome/Firefox
- **Lighthouse** - Built into Chrome DevTools
- **WAVE** - Web accessibility evaluation tool

### 6.2 Manual Testing Tools

- **NVDA** - Free screen reader for Windows
- **VoiceOver** - Built-in screen reader for macOS/iOS
- **JAWS** - Commercial screen reader for Windows
- **TalkBack** - Built-in screen reader for Android

### 6.3 Color Contrast Tools

- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Colour Contrast Analyser** - Desktop application
- **axe DevTools** - Built-in contrast checking

### 6.4 Documentation Resources

- **WCAG 2.1 Guidelines** - https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices** - https://www.w3.org/WAI/ARIA/apg/
- **WebAIM** - https://webaim.org/
- **A11y Project** - https://www.a11yproject.com/

---

## 7. Reporting Issues

### 7.1 Issue Template

When reporting accessibility issues, include:

1. **Issue Description:**
   - What is the problem?
   - Where does it occur?
   - What is the expected behavior?

2. **WCAG Reference:**
   - Which WCAG criterion is violated?
   - What is the level (A, AA, AAA)?

3. **Impact:**
   - Who is affected?
   - How severe is the impact?

4. **Steps to Reproduce:**
   - How can the issue be reproduced?
   - What tools were used to identify it?

5. **Suggested Fix:**
   - What is the proposed solution?
   - Are there any alternatives?

### 7.2 Priority Levels

- **P1 (Critical):** Blocks core functionality, affects all users
- **P2 (High):** Affects many users, significant impact
- **P3 (Medium):** Affects some users, moderate impact
- **P4 (Low):** Minor impact, nice to have

---

## 8. Continuous Improvement

### 8.1 Regular Testing Schedule

- **Weekly:** Automated tests in CI/CD
- **Monthly:** Manual screen reader testing
- **Quarterly:** Full accessibility audit
- **Before Release:** Complete testing checklist

### 8.2 Training Resources

- WCAG 2.1 Quick Reference
- ARIA Authoring Practices Guide
- WebAIM Articles
- A11y Project Checklists

---

## 9. Known Issues

**Current Known Issues:**

1. **Color Contrast (P2):**
   - Some muted text colors may not meet 4.5:1 ratio
   - Status: Manual testing recommended with Lighthouse

2. **Touch Targets (P2):**
   - Some icon buttons may be smaller than 44x44px
   - Status: Fixed for critical elements, ongoing review

**Resolved Issues:**

- ✅ Skip links implemented
- ✅ Page titles implemented
- ✅ ARIA descriptions added to form controls
- ✅ Loading state announcements improved
- ✅ Reduced motion support added

---

## 10. Contact

For accessibility questions or issues:

- **Development Team:** See project README
- **Accessibility Lead:** [To be assigned]
- **Documentation:** `docs/ACCESSIBILITY_AUDIT.md`

---

**Last Updated:** January 28, 2025  
**Next Review:** After next major release

