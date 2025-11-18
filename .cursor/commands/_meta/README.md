# Commands System - Metadata

This directory contains metadata and documentation for the Friday AI Chat commands system.

## Files

### `PROMPT_ENGINEERING_GUIDE.md`
Complete guide to prompt engineering techniques used in all commands. This is the reference for creating and updating commands.

**Version:** 2.2.0  
**Last Updated:** 2025-11-16

### `COMMANDS_INDEX.md`
Complete alphabetical index of all commands. Use this to find commands quickly.

**Total Commands:** 200+  
**Last Updated:** 2025-11-16

### `COMMANDS_ANALYSIS.md`
Analysis of command coverage, gaps, and recommendations. Useful for understanding what commands exist and what might be missing.

**Last Updated:** 2025-11-16

### `CHANGELOG.md`
Changelog tracking all changes to the commands system. Updated with each major change or batch of updates.

**Latest Update:** 2025-11-16 - Prompt Engineering v2.2.0 + Template System

### `COMMANDS_BY_CATEGORY.md`
Commands organized by category for easy discovery. Includes Most Used commands and category-based navigation.

**Last Updated:** 2025-11-16

### `COMMANDS_INDEX_ANALYSIS.md`
Comprehensive analysis of command coverage, gaps, and recommendations for Tekup/Friday AI Chat.

**Last Updated:** 2025-11-16

### `COMMAND_TEMPLATE.md`
Base template for creating new commands. Use this for general commands.

**Last Updated:** 2025-11-16

### `TEMPLATE_AI_FOCUSED.md`
Specialized template for AI-focused commands (testing, optimization, analysis).

**Last Updated:** 2025-11-16

### `TEMPLATE_ANALYSIS.md`
Specialized template for analysis commands (code, systems, performance).

**Last Updated:** 2025-11-16

### `TEMPLATE_DEBUG.md`
Specialized template for debug commands (bug fixes, troubleshooting).

**Last Updated:** 2025-11-16

### `TEMPLATE_GUIDE.md`
Guide for selecting and using the right template for your command type.

**Last Updated:** 2025-11-16

## Structure

```
.cursor/commands/
├── _meta/                    # Metadata files (this directory)
│   ├── README.md            # This file
│   ├── PROMPT_ENGINEERING_GUIDE.md
│   ├── COMMANDS_INDEX.md    # A-Z index with Most Used
│   ├── COMMANDS_BY_CATEGORY.md  # Category-based navigation
│   ├── COMMANDS_INDEX_ANALYSIS.md  # Analysis & recommendations
│   ├── COMMANDS_ANALYSIS.md
│   ├── CHANGELOG.md
│   ├── COMMAND_TEMPLATE.md  # Base template
│   ├── TEMPLATE_AI_FOCUSED.md
│   ├── TEMPLATE_ANALYSIS.md
│   ├── TEMPLATE_DEBUG.md
│   ├── TEMPLATE_GUIDE.md
│   └── QUICK_REFERENCE.md
├── [command-name].md        # Individual command files
└── ...
```

## Quick Links

- **New to commands?** Start with `PROMPT_ENGINEERING_GUIDE.md`
- **Looking for a command?** 
  - Check `COMMANDS_INDEX.md` (A-Z with Most Used)
  - Browse `COMMANDS_BY_CATEGORY.md` (by category)
  - See `QUICK_REFERENCE.md` (quick guide)
- **Want to see what's new?** Read `CHANGELOG.md`
- **Want analysis?** Read `COMMANDS_INDEX_ANALYSIS.md`
- **Creating a new command?** Check `TEMPLATE_GUIDE.md` to select the right template
- **AI-focused command?** Use `TEMPLATE_AI_FOCUSED.md`
- **Analysis command?** Use `TEMPLATE_ANALYSIS.md`
- **Debug command?** Use `TEMPLATE_DEBUG.md`
- **General command?** Use `COMMAND_TEMPLATE.md`

## Maintenance

When updating commands:
1. Update the command file
2. Update `COMMANDS_INDEX.md` if needed
3. Add entry to `CHANGELOG.md`
4. Follow `PROMPT_ENGINEERING_GUIDE.md` standards

