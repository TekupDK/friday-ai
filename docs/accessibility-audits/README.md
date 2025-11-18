# Lighthouse Accessibility Audit Results

This directory contains Lighthouse accessibility audit results for all pages in the Friday AI Chat application.

## Directory Structure

```
accessibility-audits/
├── README.md (this file)
├── 2025-01-28-workspace-lighthouse.md
├── 2025-01-28-login-lighthouse.md
├── 2025-01-28-docs-lighthouse.md
└── summary.md (overall summary)
```

## Naming Convention

- Format: `YYYY-MM-DD-[page-name]-lighthouse.md`
- Example: `2025-01-28-workspace-lighthouse.md`

## Audit Schedule

- **Weekly:** Critical pages (Login, Workspace)
- **Monthly:** All Priority 1 pages
- **Quarterly:** All pages (full audit)
- **Before Release:** All pages (full audit)

## How to Add New Audit

1. Run Lighthouse audit following `docs/LIGHTHOUSE_AUDIT_GUIDE.md`
2. Use the template from the guide
3. Save results in this directory
4. Update `summary.md` with overall scores and trends

## Summary Report

See `summary.md` for:

- Overall accessibility scores
- Common issues across pages
- Trends over time
- Action items and priorities

---

**Last Updated:** January 28, 2025
