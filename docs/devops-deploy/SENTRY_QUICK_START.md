# Sentry Quick Start Guide

**For:** Tekup Organization (`tekup-r5`)  
**Date:** January 28, 2025

## 🎯 Hvad skal du gøre?

Du har allerede:

- ✅ Oprettet Sentry organization (`tekup-r5`)
- ✅ Oprettet organization token (til CLI/API)

Du mangler:

- ⚠️ **DSN (Data Source Name)** - Dette er det vigtigste!

## 📝 Forskellen mellem Token og DSN

### Organization Token

- **Bruges til:** CLI, API, source map uploads
- **Format:** `sntrys_xxxxx...`
- **Hvor:** Settings → Organization → Tokens
- **Brug:** `sentry-cli`, CI/CD scripts

### DSN (Data Source Name)

- **Bruges til:** SDK integration (din applikation)
- **Format:** `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
- **Hvor:** Project Settings → Client Keys (DSN)
- **Brug:** `Sentry.init({ dsn: "..." })`

**Du skal bruge DSN til applikationen, ikke organization token!**

## 🚀 Hurtig Setup (5 minutter)

### 1. Opret Projekter

1. Gå til https://sentry.io og log ind
2. Klik "Create Project" (eller Projects → Create Project)

**Server Project:**

- Platform: **Node.js**
- Name: `friday-ai-server`
- Klik "Create Project"
- **Kopier DSN** fra "Configure SDK" side

**Client Project:**

- Platform: **React**
- Name: `friday-ai-client`
- Klik "Create Project"
- **Kopier DSN** fra "Configure SDK" side

### 2. Find DSN

Hvis du allerede har projekter:

1. Gå til **Projects** i Sentry
2. Klik på dit projekt
3. Gå til **Settings → Client Keys (DSN)**
4. Kopier DSN (ser ud som: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)

### 3. Tilføj til Environment

Tilføj til `.env.dev`:

```bash
# Server DSN (fra Node.js projekt)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENABLED=true

# Client DSN (fra React projekt)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENABLED=true
```

### 4. Test

```bash
# Start server
pnpm dev

# Check logs - skal vise:
# [Sentry] Error tracking initialized

# Test error i browser console:
throw new Error("Test Sentry")
```

## 🔍 Hvor finder jeg DSN?

### Metode 1: Project Settings

1. Projects → Vælg projekt
2. Settings → Client Keys (DSN)
3. Kopier DSN

### Metode 2: Project Onboarding

1. Projects → Vælg projekt
2. Hvis du ser "Configure SDK" side
3. DSN er vist øverst

### Metode 3: API

```bash
# Brug organization token til at hente DSN
curl -H "Authorization: Bearer YOUR_ORG_TOKEN" \
  https://sentry.io/api/0/projects/tekup-r5/PROJECT_SLUG/keys/
```

## ❓ FAQ

**Q: Kan jeg bruge samme DSN til server og client?**  
A: Ja, men anbefales at have separate projekter for bedre organisering.

**Q: Hvad hvis jeg ikke kan finde DSN?**  
A: Gå til Project Settings → Client Keys → Create New Key

**Q: Skal jeg bruge organization token?**  
A: Nej, kun hvis du bruger `sentry-cli` eller API. Til SDK integration bruger du DSN.

**Q: Hvor mange projekter skal jeg oprette?**  
A: Minimum 1 (kan bruges til både server og client), men anbefales 2 (ét til server, ét til client).

## 📚 Næste Skridt

Efter du har DSN:

1. ✅ Tilføj til `.env.dev` og `.env.prod`
2. ✅ Test integration
3. ✅ Setup alerts i Sentry
4. ✅ Configure notifications (email/Slack)

Se `SENTRY_SETUP.md` for komplet dokumentation.
