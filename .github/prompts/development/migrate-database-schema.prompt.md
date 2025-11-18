---
name: migrate-database-schema
description: "[development] Migrate Database Schema - You are performing a database schema migration."
argument-hint: Optional input or selection
---

# Migrate Database Schema

You are performing a database schema migration.

## TASK

Safely migrate the database schema with data preservation.

## STEPS

1) Review current schema in `drizzle/schema.ts`:
   - Identify all changes (additions, modifications, deletions)
   - Check for breaking changes
2) Plan the migration:
   - Determine if data migration is needed
   - Plan for zero-downtime if possible
   - Identify rollback strategy
3) Generate migration:
   - Run `pnpm db:migrate:dev` to generate SQL
   - Review generated SQL in `drizzle/migrations/`
   - Modify if needed for data migration
4) Create data migration script if needed:
   - Create script in `server/scripts/` if data transformation required
   - Test on dev database first
5) Test migration:
   - Test on dev database: `pnpm db:push:dev`
   - Verify data integrity
   - Test rollback if possible
6) Apply to production:
   - Backup database first: `pnpm backup:db`
   - Apply migration: `pnpm db:migrate:prod`
   - Verify application works
   - Monitor for issues

## OUTPUT

Provide:
- Migration SQL file
- Data migration script (if needed)
- Testing results
- Rollback plan
- Production deployment steps

