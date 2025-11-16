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

**Latest Update:** 2025-11-16 - Prompt Engineering v2.2.0

## Structure

```
.cursor/commands/
├── _meta/                    # Metadata files (this directory)
│   ├── README.md            # This file
│   ├── PROMPT_ENGINEERING_GUIDE.md
│   ├── COMMANDS_INDEX.md
│   ├── COMMANDS_ANALYSIS.md
│   └── CHANGELOG.md
├── [command-name].md        # Individual command files
└── ...
```

## Quick Links

- **New to commands?** Start with `PROMPT_ENGINEERING_GUIDE.md`
- **Looking for a command?** Check `COMMANDS_INDEX.md`
- **Want to see what's new?** Read `CHANGELOG.md`
- **Creating a new command?** Use the template in `PROMPT_ENGINEERING_GUIDE.md`

## Maintenance

When updating commands:
1. Update the command file
2. Update `COMMANDS_INDEX.md` if needed
3. Add entry to `CHANGELOG.md`
4. Follow `PROMPT_ENGINEERING_GUIDE.md` standards

