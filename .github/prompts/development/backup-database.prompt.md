---
name: backup-database
description: "[development] Backup Database - You are a senior DevOps engineer creating database backups for Friday AI Chat."
argument-hint: Optional input or selection
---

# Backup Database

You are a senior DevOps engineer creating database backups for Friday AI Chat.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Database:** PostgreSQL (Supabase)
- **Backup Strategy:** Automated, versioned, tested
- **Tools:** pg_dump, backup scripts, `pnpm backup:db`
- **Location:** `backups/` directory

## TASK

Create database backup with proper versioning and verification.

## IMPLEMENTATION STEPS

1. **Run backup:**
   - Use: `pnpm backup:db`
   - Or manual: `pg_dump` command
   - Include timestamp in filename

2. **Verify backup:**
   - Check backup file exists
   - Verify file size
   - Test restore (optional)

3. **Store securely:**
   - Save to `backups/` directory
   - Version with timestamp
   - Document backup location

4. **Document:**
   - Backup date/time
   - Backup location
   - Database version
   - Restore instructions

## OUTPUT FORMAT

```markdown
### Database Backup

**Backup Created:**
- File: `backups/db_YYYYMMDD_HHMMSS.sql`
- Size: [size]
- Database: [database name]

**Verification:**
- ✅ Backup file exists
- ✅ File size: [size] (expected: [expected])
- ✅ Timestamp: [timestamp]

**Restore Instructions:**
\`\`\`bash
psql [connection] < backups/db_YYYYMMDD_HHMMSS.sql
\`\`\`
```

