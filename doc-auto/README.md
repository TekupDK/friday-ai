# Auto-Generated Documentation

**Generated:** 2025-01-28  
**Source:** Codebase analysis  
**Version:** 2.0.0

This directory contains automatically generated documentation based on the actual codebase. All documentation is kept in sync with the code through automated scanning and analysis.

## Table of Contents

1. [API Endpoints](./api/README.md) - Complete tRPC API reference
2. [Database Schema](./schema/README.md) - Database tables, enums, and relationships
3. [Component Interfaces](./components/README.md) - React component props and types
4. [Data Flow](./data-flow/README.md) - System architecture and data flow diagrams
5. [Dependencies](./dependencies/README.md) - Project dependencies and versions

## Structure

```
doc-auto/
├── README.md (this file)
├── api/
│   ├── README.md (API overview)
│   ├── routers.md (All tRPC routers)
│   └── endpoints.md (Detailed endpoint documentation)
├── schema/
│   ├── README.md (Schema overview)
│   ├── tables.md (All database tables)
│   └── enums.md (All enums)
├── components/
│   ├── README.md (Components overview)
│   └── interfaces.md (Component props and types)
├── data-flow/
│   ├── README.md (Architecture overview)
│   └── diagrams.md (ASCII diagrams)
└── dependencies/
    └── README.md (Dependencies list)
```

## Update Frequency

This documentation is automatically updated when:
- New routers or endpoints are added
- Database schema changes
- Component interfaces change
- Dependencies are updated

## Manual Updates

To regenerate all documentation, run:

```bash
# This command will be available after implementing the generator
npm run docs:auto-generate
```

## Notes

- All documentation reflects the **current state** of the codebase
- Examples are extracted from actual code
- Type definitions match the TypeScript interfaces exactly
- Endpoint documentation includes input/output schemas

