# Quick Start: Native CRM Development (Anbefalet)

**For:** Hurtig CRM Development & Debugging  
**Time:** 2 minutter setup  
**Resource Usage:** Lav

## Hvorfor Native?

✅ **Hurtigere** - Ingen Docker build overhead  
✅ **Mindre ressource** - Ingen Docker Desktop overhead  
✅ **Bedre debugging** - Native tools og performance  
✅ **Hurtigere hot-reload** - Direkte file watching  

## Quick Start (3 Steps)

### 1. Start Database (Docker - kun database)

```bash
pnpm dev:db
```

Dette starter kun MySQL database (hurtigt, ~30 sekunder).

### 2. Start Backend (Native)

```bash
# I ny terminal
pnpm dev
```

Backend kører på http://localhost:3000

### 3. Start Frontend (Native)

```bash
# I ny terminal
pnpm dev:vite
```

Frontend kører på http://localhost:5173

## Access CRM

- **CRM Dashboard:** http://localhost:5173/crm/dashboard
- **CRM Standalone:** http://localhost:5173/crm-standalone
- **CRM Debug Mode:** http://localhost:5173/crm/debug

## Database Setup

```bash
# Run migrations
pnpm db:push
```

## Useful Commands

```bash
# Stop database
pnpm dev:db:down

# View database logs
pnpm dev:db:logs

# Access database admin
# http://localhost:8081
# Server: db-dev
# User: friday_user
# Password: friday_password
```

## Environment Variables

Sørg for at `.env.dev` har:

```env
# Database (Docker MySQL)
DATABASE_URL=mysql://friday_user:friday_password@localhost:3307/friday_ai

# Eller brug Supabase
# DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?schema=friday_ai&sslmode=require
```

## Performance

**Startup Time:**
- Database: ~30 sekunder (første gang)
- Backend: ~5 sekunder
- Frontend: ~3 sekunder

**Total:** ~40 sekunder første gang, ~8 sekunder efterfølgende

**Resource Usage:**
- Database: ~200MB RAM
- Backend: ~150MB RAM
- Frontend: ~100MB RAM
- **Total:** ~450MB RAM (vs. 2-3GB med full Docker)

## Troubleshooting

**Port 3307 allerede i brug?**
```bash
# Stop eksisterende container
pnpm dev:db:down

# Eller ændr port i docker-compose.db-only.yml
```

**Database connection failed?**
```bash
# Check database is running
docker ps | grep friday-db-dev

# Check logs
pnpm dev:db:logs
```

## Sammenligning

| Approach | Startup | Resource | Build Time |
|----------|---------|----------|------------|
| **Native + DB Docker** | ~40s | ~450MB | 0s |
| Full Docker | ~5-10min | ~2-3GB | 5-10min |

**Anbefaling:** Brug native + DB Docker for development! 🚀

