# Docker Live Fixing Guide

**Status:** ✅ Updated for Live Editing  
**Date:** 2025-11-17

## 🚀 Quick Start - Live Fixing

### Start Docker med Live Editing

```bash
# Start alle services (backend + frontend + database)
docker-compose -f docker-compose.dev.yml up

# Eller i background
docker-compose -f docker-compose.dev.yml up -d
```

### Live Fix Workflow

1. **Rediger kode** direkte i projektet
2. **Save fil** (Ctrl+S)
3. **Se ændringer** automatisk:
   - **Backend:** Genstarter automatisk (tsx watch)
   - **Frontend:** Browser opdateres automatisk (Vite HMR)

## ✨ Live Fixing Features

### ✅ Backend Live Fixing

**Hvordan det virker:**
- Alle `server/` filer er mounted (read-write)
- `tsx watch` detekterer filændringer
- Backend genstarter automatisk
- Ingen manuel restart nødvendig

**Eksempel:**
```bash
# 1. Rediger server/routers/crm-lead-router.ts
# 2. Save fil
# 3. Backend genstarter automatisk
# 4. Test: http://localhost:3000/api/trpc/crm.lead.listLeads
```

### ✅ Frontend Live Fixing

**Hvordan det virker:**
- Alle `client/` filer er mounted (read-write)
- Vite HMR detekterer filændringer
- Browser opdateres automatisk
- Ingen page refresh nødvendig

**Eksempel:**
```bash
# 1. Rediger client/src/pages/crm/CustomerList.tsx
# 2. Save fil
# 3. Browser opdateres automatisk
# 4. Se ændring: http://localhost:5173/crm/customers
```

## 📁 Volume Mounts

### Backend Volumes (Read-Write)

```yaml
volumes:
  - ./server:/app/server          # ✅ Live editing enabled
  - ./shared:/app/shared
  - ./drizzle:/app/drizzle
  - ./package.json:/app/package.json
  - ./tsconfig.json:/app/tsconfig.json
```

### Frontend Volumes (Read-Write)

```yaml
volumes:
  - ./client:/app/client          # ✅ Live editing enabled
  - ./shared:/app/shared
  - ./vite.config.ts:/app/vite.config.ts
  - ./tsconfig.json:/app/tsconfig.json
```

## 🔧 Live Fix Examples

### Fix Backend Bug

**Scenario:** Fix en fejl i CRM lead router

1. **Åbn fil:** `server/routers/crm-lead-router.ts`
2. **Ret fejlen:**
   ```typescript
   // Før
   return await db.select().from(leads);
   
   // Efter
   return await db.select().from(leads).where(eq(leads.userId, ctx.user.id));
   ```
3. **Save fil** (Ctrl+S)
4. **Backend genstarter automatisk**
5. **Test fix:** http://localhost:3000/api/trpc/crm.lead.listLeads

### Fix Frontend Bug

**Scenario:** Fix en UI fejl i Customer List

1. **Åbn fil:** `client/src/pages/crm/CustomerList.tsx`
2. **Ret fejlen:**
   ```typescript
   // Før
   <h1>Customers</h1>
   
   // Efter
   <h1 data-testid="customers-page-title">Customers</h1>
   ```
3. **Save fil** (Ctrl+S)
4. **Browser opdateres automatisk**
5. **Se ændring:** http://localhost:5173/crm/customers

### Fix Database Schema

**Scenario:** Tilføj nyt felt til schema

1. **Rediger:** `drizzle/schema.ts`
2. **Save fil**
3. **Kør migration:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend-dev pnpm db:push
   ```
4. **Schema opdateres live**

## 🎯 Best Practices

### 1. Use Your Editor

- **Rediger direkte** i projektet - volumes er mounted
- **Brug din editor** (VS Code, Cursor, etc.)
- **Ingen behov** for at kopiere filer eller SSH ind i container

### 2. Watch Logs

**Backend logs:**
```bash
docker-compose -f docker-compose.dev.yml logs -f backend-dev
```

**Frontend logs:**
```bash
docker-compose -f docker-compose.dev.yml logs -f frontend-dev
```

**Alle logs:**
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### 3. Test Changes Immediately

- **Backend:** Test via API eller tRPC
- **Frontend:** Browser opdateres automatisk
- **Database:** Kør migrations i container

## ⚠️ Troubleshooting

### Backend Not Reloading

**Problem:** Ændringer i `server/` genstarter ikke backend

**Fix:**
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs backend-dev

# Restart backend
docker-compose -f docker-compose.dev.yml restart backend-dev

# Check volume mounts
docker-compose -f docker-compose.dev.yml config | grep volumes
```

### Frontend Not Reloading

**Problem:** Ændringer i `client/` opdaterer ikke browseren

**Fix:**
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs frontend-dev

# Restart frontend
docker-compose -f docker-compose.dev.yml restart frontend-dev

# Check Vite HMR connection (browser console)
```

### File Changes Not Detected (Windows)

**Problem:** Docker detekterer ikke filændringer på Windows

**Fix:**
1. **Use WSL2:** Mount volumes via WSL2 for bedre performance
2. **Docker Desktop Settings:** Enable file sharing
3. **Polling Mode:** Add to `vite.config.ts`:
   ```typescript
   server: {
     watch: {
       usePolling: true
     }
   }
   ```

## 📊 Performance

**Live Editing Performance:**
- **Backend Reload:** ~2-3 sekunder
- **Frontend HMR:** <1 sekund
- **File Detection:** Realtid (via volume mounts)

**Resource Usage:**
- **Backend Container:** ~150MB RAM
- **Frontend Container:** ~100MB RAM
- **Database Container:** ~200MB RAM
- **Total:** ~450MB RAM

## 🎉 Resultat

Nu kan du:
- ✅ **Redigere kode direkte** i projektet
- ✅ **Se ændringer med det samme** (hot-reload)
- ✅ **Live fixe bugs** uden at genstarte
- ✅ **Test ændringer** med det samme

**Docker setup er nu klar til live fixing! 🚀**

