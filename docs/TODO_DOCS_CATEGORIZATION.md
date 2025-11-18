# TODO: Documentation Categorization Follow-up

**Created:** 2025-01-28  
**Status:** Auto-categorization completed, follow-up tasks pending

## TODO List

| Area        | Task                                                                                                | Priority | Size | Notes                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------- | -------- | ---- | --------------------------------------------------------------------------------------------------- |
| **Docs**    | Review 54 uncategorized files in `docs/uncategorized/general/` and categorize manually or add rules | P2       | M    | Files like `ADDENDUM_MODEL_ROUTER.md`, `BUNDLE_OPTIMIZATION.md`, `BUSINESS-INSIGHTS.md` need review |
| **Docs**    | Update internal markdown links after file moves                                                     | P1       | L    | Many docs reference other docs with relative paths that may be broken                               |
| **Docs**    | Generate index README.md files for each category folder                                             | P2       | M    | Help navigation: `status-reports/README.md`, `ai-automation/README.md`, etc.                        |
| **Docs**    | Improve categorization rules based on uncategorized file patterns                                   | P2       | S    | Analyze patterns in 54 uncategorized files and add rules                                            |
| **Docs**    | Update code references to documentation paths                                                       | P1       | M    | Check for hardcoded paths in code that reference docs                                               |
| **Docs**    | Fix broken relative links in moved documentation files                                              | P1       | M    | Links like `./ERROR_SANITIZATION_GUIDE.md` may need updating                                        |
| **Docs**    | Verify all cross-references between documentation files                                             | P2       | M    | Ensure links in ARCHITECTURE.md, API_REFERENCE.md still work                                        |
| **Docs**    | Update DOCS_CATEGORIZATION_STATUS.md with final results                                             | P3       | S    | Update statistics after all follow-up work is done                                                  |
| **Scripts** | Add link validation to auto-categorize script                                                       | P3       | M    | Future enhancement: detect and fix broken links automatically                                       |
| **Scripts** | Add index file generation to auto-categorize script                                                 | P3       | S    | Auto-generate README.md in each category folder                                                     |

## Priority Breakdown

### P1 - High Priority (Do This Week)

- **Update internal markdown links** - Critical for documentation usability
- **Update code references** - May break if code references old paths
- **Fix broken relative links** - Users will encounter broken links

### P2 - Medium Priority (Do This Month)

- **Review uncategorized files** - Improve organization completeness
- **Generate index files** - Improve navigation and discoverability
- **Improve categorization rules** - Reduce manual work in future
- **Verify cross-references** - Ensure documentation integrity

### P3 - Low Priority (Nice to Have)

- **Update status file** - Documentation only
- **Add link validation** - Future enhancement
- **Add index generation** - Future enhancement

## Statistics

- **Files moved:** 199
- **Files uncategorized:** 54
- **Categories created:** 21
- **Core files preserved:** 8

## Notes

- Some files were already in correct locations (skipped during move)
- Uncategorized files may need manual review for edge cases
- Link updates should be done before documentation is widely used
- Index files will significantly improve navigation

---

**Last Updated:** 2025-01-28
