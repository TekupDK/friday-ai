# Dependencies Documentation

**Generated:** 2025-01-28  
**Source:** `package.json`

This document lists all project dependencies and their purposes.

## Table of Contents

1. [Overview](#overview)
2. [Production Dependencies](#production-dependencies)
3. [Development Dependencies](#development-dependencies)
4. [Key Dependencies](#key-dependencies)

## Overview

The project uses **pnpm** as the package manager and follows a modern TypeScript stack.

### Package Manager

- **pnpm:** `10.4.1`

## Production Dependencies

### Core Framework

- **react:** `^19.1.1` - React UI library
- **react-dom:** `^19.1.1` - React DOM renderer
- **express:** `^4.21.2` - Web server framework
- **typescript:** `5.9.3` - TypeScript compiler

### API & Data

- **@trpc/server:** `^11.6.0` - tRPC server
- **@trpc/client:** `^11.6.0` - tRPC client
- **@trpc/react-query:** `^11.6.0` - React Query integration
- **@tanstack/react-query:** `^5.90.2` - Data fetching and caching
- **drizzle-orm:** `^0.44.5` - Type-safe ORM
- **pg:** `^8.12.0` - PostgreSQL client
- **postgres:** `^3.4.5` - Alternative PostgreSQL client

### UI Components

- **@radix-ui/react-*** - Headless UI components (20+ packages)
- **tailwindcss:** `^4.1.14` - Utility-first CSS
- **lucide-react:** `^0.453.0` - Icon library
- **framer-motion:** `^12.23.22` - Animation library
- **recharts:** `^2.15.2` - Chart library

### AI & ML

- **@google/genai:** `^1.29.1` - Google Gemini AI
- **@google/generative-ai:** `^0.11.0` - Google Generative AI
- **langfuse:** `^3.38.6` - LLM observability
- **langfuse-node:** `^3.38.6` - Langfuse Node.js SDK
- **chromadb:** `^3.1.1` - Vector database
- **@chroma-core/default-embed:** `^0.1.8` - ChromaDB embeddings

### Integrations

- **googleapis:** `^165.0.0` - Google APIs
- **google-auth-library:** `^10.5.0` - Google authentication
- **@supabase/supabase-js:** `^2.47.10` - Supabase client

### Utilities

- **zod:** `^4.1.12` - Schema validation
- **date-fns:** `^4.1.0` - Date utilities
- **nanoid:** `^5.1.6` - ID generation
- **cookie:** `^1.0.2` - Cookie parsing
- **jose:** `6.1.0` - JWT handling
- **cors:** `^2.8.5` - CORS middleware
- **helmet:** `^8.1.0` - Security headers

### Caching & Rate Limiting

- **@upstash/redis:** `^1.35.6` - Redis client
- **express-rate-limit:** `^8.2.1` - Rate limiting

### Other

- **ws:** `^8.18.3` - WebSocket support
- **pino:** `^9.4.0` - Logging
- **wouter:** `^3.3.5` - Routing
- **react-markdown:** `^10.1.0` - Markdown rendering
- **sonner:** `^2.0.7` - Toast notifications

## Development Dependencies

### Testing

- **vitest:** `^2.1.4` - Test runner
- **@playwright/test:** `^1.56.1` - E2E testing
- **@testing-library/react:** `^16.3.0` - React testing utilities
- **@testing-library/jest-dom:** `^6.9.1` - DOM matchers

### Build Tools

- **vite:** `^7.1.7` - Build tool
- **esbuild:** `^0.25.0` - Bundler
- **tsx:** `^4.19.1` - TypeScript execution
- **drizzle-kit:** `^0.31.4` - Drizzle migrations

### Linting & Formatting

- **eslint:** `^9.14.0` - Linter
- **prettier:** `^3.6.2` - Code formatter
- **@typescript-eslint/eslint-plugin:** `^8.12.2` - TypeScript ESLint
- **markdownlint-cli:** `^0.41.0` - Markdown linting

### Type Definitions

- **@types/node:** `^24.9.2`
- **@types/react:** `^19.1.16`
- **@types/express:** `4.17.21`
- **@types/cors:** `^2.8.17`

### Other Dev Tools

- **dotenv:** `^17.2.3` - Environment variables
- **dotenv-cli:** `^11.0.0` - Dotenv CLI
- **cross-env:** `^10.1.0` - Cross-platform env vars
- **storybook:** `^10.0.7` - Component development

## Key Dependencies

### tRPC Stack

- **@trpc/server, @trpc/client, @trpc/react-query:** End-to-end type-safe APIs

### Database Stack

- **drizzle-orm, drizzle-kit:** Type-safe database access and migrations
- **pg, postgres:** PostgreSQL clients

### UI Stack

- **react, react-dom:** UI framework
- **@radix-ui/react-***:** Accessible component primitives
- **tailwindcss:** Styling
- **framer-motion:** Animations

### AI Stack

- **@google/genai:** Google Gemini integration
- **langfuse:** LLM observability
- **chromadb:** Vector database for RAG

### State Management

- **@tanstack/react-query:** Server state management
- **React Context:** Client state

---

For version updates, check `package.json` or run:

```bash
pnpm outdated
```

