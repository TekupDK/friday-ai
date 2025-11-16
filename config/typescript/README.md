# TypeScript Configuration Variants

This directory contains specialized TypeScript configuration files for specific use cases.

## Files

- **`tsconfig.docs.json`** - Configuration for documentation TypeScript files
- **`tsconfig.experimental.json`** - Configuration for experimental features and code
- **`tsconfig.runtime.json`** - Configuration for runtime-specific type checking

## Usage

These configs extend the main `tsconfig.json` in the project root. They are used by CI pipelines and specific build tasks that need different compiler settings.

The main `tsconfig.json` in the root handles the primary codebase (client, server, shared).
