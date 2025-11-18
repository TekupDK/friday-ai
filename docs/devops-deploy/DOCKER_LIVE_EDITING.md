# Docker Live Editing Setup

**Status:** ✅ Updated for Live Fixing  
**Date:** 2025-11-17  
**Version:** 2.0.0

## Overview

Docker development setup er nu opdateret til at understøtte **live editing** - du kan redigere kode direkte og se ændringer med det samme uden at genstarte containeren.

## 🚀 Live Editing Features

### ✅ Backend Hot-Reload
- **Volume Mounts:** Alle server filer er mounted (read-write)
- **Watch Mode:** `tsx watch` genstarter automatisk ved filændringer
- **Live Fixes:** Rediger kode i `server/` og se ændringer med det samme

### ✅ Frontend Hot-Reload (Optional)
- **Volume Mounts:** Alle client filer er mounted (read-write)
- **Vite HMR:** Vite hot module replacement virker i container
- **Live Fixes:** Rediger kode i `client/` og se ændringer med det samme

### ✅ Database Persistence
- **Volume:** Database data persisteres i Docker volume
- **Migrations:** Kør migrations direkte i container

## Quick Start

### Option 1: Full Docker (Backend + Frontend + Database)

```bash
# Start alle services
docker-compose -f docker-compose.dev.yml up

# Eller i background
docker-compose -f docker-compose.dev.yml up -d
```

**Services:**
- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Database: localhost:3307
- Adminer: http://localhost:8081

### Option 2: Hybrid (Backend + DB Docker, Frontend Native)

```bash
# Start backend + database
docker-compose -f docker-compose.dev.yml up backend-dev db-dev

# I ny terminal: Start frontend native
pnpm dev:vite
```

**Fordele:**
- Hurtigere frontend hot-reload (native Vite)
- Backend isolation i Docker
- Bedre debugging for frontend

## Live Editing Workflow

### 1. Start Docker Services

```bash
docker-compose -f docker-compose.dev.yml up
```

### 2. Rediger Kode

**Backend:**
- Rediger filer i `server/` directory
- `tsx watch` detekterer ændringer automatisk
- Backend genstarter automatisk
- Se logs: `docker-compose -f docker-compose.dev.yml logs -f backend-dev`

**Frontend:**
- Rediger filer i `client/` directory
- Vite HMR opdaterer browseren automatisk
- Se logs: `docker-compose -f docker-compose.dev.yml logs -f frontend-dev`

### 3. Se Ændringer Live

- **Backend:** Tjek http://localhost:3000/health
- **Frontend:** Browser opdateres automatisk (Vite HMR)
- **CRM:** http://localhost:5173/crm/dashboard

## Volume Mounts

### Backend Volumes

```yaml
volumes:
  - ./server:/app/server          # Backend source (read-write)
  - ./shared:/app/shared          # Shared code
  - ./drizzle:/app/drizzle         # Database schema
  - ./package.json:/app/package.json
  - ./pnpm-lock.yaml:/app/pnpm-lock.yaml
  - ./check-env.js:/app/check-env.js
  - ./tsconfig.json:/app/tsconfig.json
  - /app/node_modules             # Exclude (use container's)
  - /app/dist                     # Exclude
```

### Frontend Volumes

```yaml
volumes:
  - ./client:/app/client          # Frontend source (read-write)
  - ./shared:/app/shared          # Shared code
  - ./package.json:/app/package.json
  - ./vite.config.ts:/app/vite.config.ts
  - ./tsconfig.json:/app/tsconfig.json
  - /app/node_modules             # Exclude (use container's)
  - /app/client/dist             # Exclude
```

## Live Fixing Examples

### Fix Backend Bug

1. **Rediger fil:** `server/routers/crm-lead-router.ts`
2. **Save fil**
3. **Backend genstarter automatisk** (tsx watch)
4. **Test fix:** http://localhost:3000/api/trpc/crm.lead.listLeads

### Fix Frontend Bug

1. **Rediger fil:** `client/src/pages/crm/CustomerList.tsx`
2. **Save fil**
3. **Browser opdateres automatisk** (Vite HMR)
4. **Se ændring:** http://localhost:5173/crm/customers

### Fix Database Schema

1. **Rediger schema:** `drizzle/schema.ts`
2. **Kør migration:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend-dev pnpm db:push
   ```
3. **Schema opdateres live**

## Performance Tips

### 1. Exclude Unnecessary Files

`.dockerignore` ekskluderer allerede:
- `node_modules`
- `dist`
- `.git`
- `docs`
- `tests`

### 2. Use Named Volumes for node_modules

```yaml
volumes:
  - /app/node_modules  # Use container's node_modules (faster)
```

### 3. Monitor Resource Usage

```bash
# Check container stats
docker stats

# Check disk usage
docker system df
```

## Troubleshooting

### Backend Not Reloading

**Problem:** Ændringer i `server/` genstarter ikke backend

**Solutions:**
1. Check logs: `docker-compose -f docker-compose.dev.yml logs backend-dev`
2. Verify volume mounts: `docker-compose -f docker-compose.dev.yml config`
3. Restart backend: `docker-compose -f docker-compose.dev.yml restart backend-dev`
4. Check file permissions (Windows: ensure WSL2 or Docker Desktop file sharing)

### Frontend Not Reloading

**Problem:** Ændringer i `client/` opdaterer ikke browseren

**Solutions:**
1. Check logs: `docker-compose -f docker-compose.dev.yml logs frontend-dev`
2. Verify Vite HMR connection (check browser console)
3. Restart frontend: `docker-compose -f docker-compose.dev.yml restart frontend-dev`
4. Check network: Frontend skal kunne connecte til backend

### File Changes Not Detected

**Problem:** Docker detekterer ikke filændringer (Windows)

**Solutions:**
1. **Use WSL2:** Mount volumes via WSL2 for bedre performance
2. **Docker Desktop Settings:** Enable file sharing for projekt directory
3. **Polling Mode:** Add to `vite.config.ts`:
   ```typescript
   server: {
     watch: {
       usePolling: true
     }
   }
   ```

### Slow File Watching

**Problem:** File watching er langsomt i Docker

**Solutions:**
1. **Use native frontend:** `pnpm dev:vite` (ikke i Docker)
2. **Exclude more files:** Update `.dockerignore`
3. **Use WSL2:** Bedre performance end Windows volumes

## Best Practices

### 1. Development Workflow

**Anbefalet:**
- Backend + Database i Docker (isolation)
- Frontend native (performance)

**Alternativ:**
- Alt i Docker (hvis du vil have fuld isolation)

### 2. File Editing

- **Rediger direkte i projektet** - volumes er mounted
- **Brug din editor** - ingen behov for at kopiere filer
- **Save og se resultat** - hot-reload håndterer resten

### 3. Testing Changes

- **Backend:** Test via API eller tRPC
- **Frontend:** Browser opdateres automatisk
- **Database:** Kør migrations i container

## Commands Reference

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f backend-dev
docker-compose -f docker-compose.dev.yml logs -f frontend-dev

# Restart service
docker-compose -f docker-compose.dev.yml restart backend-dev

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Run command in container
docker-compose -f docker-compose.dev.yml exec backend-dev pnpm db:push
docker-compose -f docker-compose.dev.yml exec frontend-dev pnpm check

# Access shell
docker-compose -f docker-compose.dev.yml exec backend-dev sh
```

## Performance Comparison

| Setup | Startup | Hot-Reload | Resource |
|-------|---------|------------|----------|
| **Full Docker** | ~2 min | Medium | ~2GB |
| **Hybrid (Backend Docker)** | ~40s | Fast | ~450MB |
| **Native** | ~8s | Fastest | ~300MB |

**Anbefaling:** Hybrid approach for bedste balance mellem isolation og performance.

## Related Documentation

- [Docker Development Setup](./DOCKER_DEV_SETUP.md)
- [Quick Start Docker CRM](../QUICK_START_DOCKER_CRM.md)
- [Quick Start Native CRM](../QUICK_START_NATIVE_CRM.md)

---

**Nu kan du live fixe direkte i Docker! 🚀**

