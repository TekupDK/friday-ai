# Lighthouse Accessibility Audit Guide

**Date:** January 28, 2025  
**Project:** Friday AI Chat (TekupDK)  
**Purpose:** Guide for running and documenting Lighthouse accessibility audits

## Overview

This guide provides step-by-step instructions for running Lighthouse accessibility audits on all major pages of the Friday AI Chat application. Regular audits help ensure we maintain WCAG 2.1 Level AA compliance.

---

## Prerequisites

1. **Chrome or Edge Browser** (Lighthouse is built-in)
2. **Access to all major pages** (authenticated routes)
3. **Stable internet connection** (for accurate performance metrics)

---

## How to Run Lighthouse Audit

### Method 1: Chrome DevTools (Recommended)

1. **Open the page** you want to audit in Chrome
2. **Open DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (macOS)
   - Right-click → "Inspect"
3. **Open Lighthouse tab:**
   - Click the "Lighthouse" tab in DevTools
   - If not visible, click `>>` to see more tabs
4. **Configure audit:**
   - Select "Accessibility" category
   - Optionally select "Performance" and "Best Practices"
   - Choose "Desktop" or "Mobile" device
   - Click "Generate report"
5. **Wait for audit to complete** (usually 30-60 seconds)
6. **Review results:**
   - Accessibility score (0-100)
   - Passed audits (green)
   - Failed audits (red)
   - Manual checks (blue)

### Method 2: Chrome Extension

1. **Install Lighthouse Extension:**
   - Chrome Web Store: "Lighthouse"
   - Or use built-in DevTools (Method 1)
2. **Navigate to page**
3. **Click Lighthouse extension icon**
4. **Select "Accessibility" and generate report**

### Method 3: Command Line (CI/CD)

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Run audit on local server
lhci autorun --collect.url=http://localhost:5173/

# Or audit specific pages
lhci autorun --collect.url=http://localhost:5173/ \
  --collect.url=http://localhost:5173/docs \
  --collect.url=http://localhost:5173/accessibility
```

---

## Pages to Audit

### Priority 1: Critical User Flows

- [ ] `/` - WorkspaceLayout (Main application)
- [ ] `/preview/login` - LoginPage (Public preview)
- [ ] `/docs` - Documentation page
- [ ] `/accessibility` - Accessibility statement

### Priority 2: Secondary Features

- [ ] `/showcase` - Component showcase
- [ ] `/chat-components` - Chat components showcase
- [ ] `/crm/dashboard` - CRM Dashboard
- [ ] `/crm/customers` - Customer list
- [ ] `/crm/leads` - Lead pipeline
- [ ] `/crm/bookings` - Booking calendar

### Priority 3: Supporting Pages

- [ ] `/404` - Not found page
- [ ] `/lead-analysis` - Lead analysis dashboard

---

## Audit Checklist

For each page, document:

### 1. Basic Information

- [ ] Page URL
- [ ] Date of audit
- [ ] Browser version
- [ ] Device type (Desktop/Mobile)
- [ ] Authentication state (Logged in/Out)

### 2. Accessibility Score

- [ ] Overall score (0-100)
- [ ] Target: ≥ 90 (WCAG AA)
- [ ] Previous score (if available)
- [ ] Score change from previous audit

### 3. Critical Issues

- [ ] List all failed audits (red)
- [ ] Priority level (P1/P2/P3)
- [ ] WCAG criterion violated
- [ ] Impact description
- [ ] Screenshot (if helpful)

### 4. Manual Checks

- [ ] Review manual checks (blue)
- [ ] Document findings
- [ ] Note any concerns

### 5. Recommendations

- [ ] List recommended fixes
- [ ] Estimate effort (S/M/L)
- [ ] Assign priority

---

## Audit Results Template

```markdown
# Lighthouse Audit Results - [Page Name]

**Date:** YYYY-MM-DD  
**URL:** /path/to/page  
**Device:** Desktop / Mobile  
**Browser:** Chrome [version]  
**Authentication:** Logged In / Logged Out

## Scores

| Category       | Score | Target | Status   |
| -------------- | ----- | ------ | -------- |
| Accessibility  | XX    | ≥90    | ✅/⚠️/❌ |
| Performance    | XX    | ≥90    | ✅/⚠️/❌ |
| Best Practices | XX    | ≥90    | ✅/⚠️/❌ |

## Failed Audits

### [Issue Name]

- **WCAG Criterion:** X.X.X (Level A/AA/AAA)
- **Impact:** [Description]
- **Priority:** P1/P2/P3
- **Fix:** [Recommended solution]
- **Effort:** S/M/L

## Manual Checks

- [ ] [Check name] - [Status/Notes]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

- [ ] Create issues for P1 failures
- [ ] Schedule fixes for P2 failures
- [ ] Document P3 for future improvement
```

---

## Common Issues & Fixes

### Low Contrast Text

- **Issue:** Text doesn't meet 4.5:1 contrast ratio
- **Fix:** Update color values in Tailwind config
- **Reference:** `docs/ACCESSIBILITY_AUDIT.md` - Section 1.4

### Missing Alt Text

- **Issue:** Images without alt attributes
- **Fix:** Add descriptive alt text
- **Reference:** Already fixed in P1 tasks

### Missing Form Labels

- **Issue:** Form inputs without associated labels
- **Fix:** Use `Label` component with `htmlFor`
- **Reference:** Already fixed in P1 tasks

### Missing ARIA Attributes

- **Issue:** Interactive elements without ARIA labels
- **Fix:** Add `aria-label` or `aria-labelledby`
- **Reference:** Already fixed in P1/P2 tasks

### Keyboard Navigation

- **Issue:** Elements not keyboard accessible
- **Fix:** Add `tabIndex={0}` and keyboard handlers
- **Reference:** Already fixed in P1 tasks

---

## Target Scores

### Accessibility

- **Target:** ≥ 90 (WCAG AA compliance)
- **Acceptable:** 85-89 (minor issues)
- **Needs Work:** < 85 (significant issues)

### Performance

- **Target:** ≥ 90
- **Acceptable:** 80-89
- **Needs Work:** < 80

### Best Practices

- **Target:** ≥ 90
- **Acceptable:** 80-89
- **Needs Work:** < 80

---

## Regular Audit Schedule

- **Weekly:** Critical pages (Login, Workspace)
- **Monthly:** All Priority 1 pages
- **Quarterly:** All pages (full audit)
- **Before Release:** All pages (full audit)

---

## Documenting Results

### Location

Create audit results in: `docs/accessibility-audits/`

### Naming Convention

- `YYYY-MM-DD-[page-name]-lighthouse.md`
- Example: `2025-01-28-workspace-lighthouse.md`

### Summary Report

Update `docs/ACCESSIBILITY_AUDIT_SUMMARY.md` with:

- Overall scores
- Common issues
- Trends over time
- Action items

---

## Automation

### CI/CD Integration

Add to GitHub Actions:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0" # Weekly

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @lhci/cli
      - run: |
          lhci autorun \
            --collect.url=http://localhost:5173/ \
            --collect.url=http://localhost:5173/docs \
            --collect.url=http://localhost:5173/accessibility \
            --upload.target=temporary-public-storage
```

---

## Resources

- **Lighthouse Documentation:** https://developers.google.com/web/tools/lighthouse
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Accessibility Testing Guide:** `docs/ACCESSIBILITY_TESTING_GUIDE.md`
- **Accessibility Audit:** `docs/ACCESSIBILITY_AUDIT.md`

---

## Contact

For questions about Lighthouse audits:

- **Development Team:** See project README
- **Accessibility Lead:** [To be assigned]

---

**Last Updated:** January 28, 2025  
**Next Review:** After first audit cycle
