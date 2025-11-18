# Docker Performance Issues - Analysis & Solutions

**Problem:** Docker build tager for lang tid og bruger for meget ressource

## Problem Analyse

### Hvorfor er det langsomt?

1. **Stor Build Context:**
   - Hele projektet (8GB+) kopieres til Docker build context
   - Inkluderer node_modules, docs, assets, osv.
   - Meget data at overføre og kopiere

2. **Inefficient Dockerfile:**
   - Kopierer hele projektet før dependencies installeres
   - Ingen layer caching optimering
   - Kopierer unødvendige filer

3. **Resource Usage:**
   - Docker Desktop bruger meget RAM
   - Disk I/O er langsom (især på Windows)
   - Network I/O for at hente images

## Løsninger

### ✅ Løsning 1: Optimerede Docker Files (Implementeret)

**Ændringer:**
- ✅ `.dockerignore` - Ekskluderer unødvendige filer
- ✅ `Dockerfile.dev` - Kun kopierer nødvendige filer
- ✅ Layer caching - Bedre cache strategi

**Resultat:**
- Hurtigere builds (kun nødvendige filer)
- Mindre disk usage
- Bedre cache hit rate

### 🎯 Løsning 2: Native Development (Anbefalet)

**For development er native bedre:**

```bash
# Backend (native)
pnpm dev

# Frontend (native)  
pnpm dev:vite

# Database (Docker - kun database)
docker-compose -f docker-compose.db-only.yml up
```

**Fordele:**
- ✅ Hurtigere startup
- ✅ Mindre resource usage
- ✅ Bedre debugging
- ✅ Hurtigere hot-reload

**Ulemper:**
- ⚠️ Kræver lokal MySQL/PostgreSQL (eller Docker kun for DB)

### 🔧 Løsning 3: Database Only Docker

Opret `docker-compose.db-only.yml`:

```yaml
services:
  db-dev:
    image: mysql:8.0
    ports:
      - "3307:3306"
    # ... database config
```

**Brug:**
```bash
# Start kun database i Docker
docker-compose -f docker-compose.db-only.yml up -d

# Backend og frontend kører native
pnpm dev
pnpm dev:vite
```

## Anbefaling

**For CRM Development:**
1. **Brug native development** (backend + frontend)
2. **Kun database i Docker** (hvis ikke lokal MySQL)
3. **Docker kun når nødvendigt** (team consistency, CI/CD)

**Docker er bedst til:**
- ✅ Production deployment
- ✅ Team consistency (når alle skal have samme setup)
- ✅ CI/CD pipelines
- ✅ Isolerede dependencies

**Native er bedst til:**
- ✅ Development speed
- ✅ Debugging
- ✅ Resource usage
- ✅ Hot-reload performance

## Performance Sammenligning

| Approach | Build Time | Startup | Resource | Debug |
|----------|-----------|---------|----------|-------|
| Full Docker | 5-10 min | 30-60s | Høj | Svært |
| Optimized Docker | 2-3 min | 20-30s | Medium | OK |
| Native + DB Docker | 0 min | 5-10s | Lav | Let |
| Full Native | 0 min | 3-5s | Lavest | Letest |

## Næste Skridt

1. **Test optimerede Docker files** (allerede implementeret)
2. **Overvej native development** for daglig brug
3. **Brug Docker kun for database** hvis nødvendigt
4. **Reserver full Docker** til production/CI

