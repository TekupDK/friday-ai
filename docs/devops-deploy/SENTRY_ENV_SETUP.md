# Sentry Environment Variables Setup

**Date:** January 28, 2025  
**Projects:** 
- `friday-ai-server` (Node.js)
- `friday-ai-client` (React)

## 📋 Environment Variables

Tilføj disse linjer til din `.env.dev` fil:

```bash
# ============================================
# Sentry Error Tracking
# ============================================

# Server Project (friday-ai-server)
SENTRY_DSN=https://38abb6a712137ee472f8ee6215dc7b37@o4510243450388480.ingest.de.sentry.io/4510383150727248
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1

# Client Project (friday-ai-client)
VITE_SENTRY_DSN=https://12339bf53c39de932596de72504d2c1f@o4510243450388480.ingest.de.sentry.io/4510383153610832
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

## 🔧 Hvordan tilføjer jeg dem?

### Metode 1: Manuelt (Anbefalet)

1. **Åbn `.env.dev` filen** i projektroden
2. **Tilføj linjerne ovenfor** nederst i filen
3. **Gem filen**

### Metode 2: PowerShell (Windows)

```powershell
# Naviger til projektroden
cd C:\Users\empir\Tekup\services\tekup-ai-v2

# Tilføj Sentry variabler
Add-Content -Path .env.dev -Value "`n# Sentry Error Tracking`nSENTRY_DSN=https://38abb6a712137ee472f8ee6215dc7b37@o4510243450388480.ingest.de.sentry.io/4510383150727248`nSENTRY_ENABLED=true`nSENTRY_TRACES_SAMPLE_RATE=0.1`nVITE_SENTRY_DSN=https://12339bf53c39de932596de72504d2c1f@o4510243450388480.ingest.de.sentry.io/4510383153610832`nVITE_SENTRY_ENABLED=true`nVITE_SENTRY_TRACES_SAMPLE_RATE=0.1"
```

### Metode 3: Bash (Linux/Mac)

```bash
# Naviger til projektroden
cd /path/to/tekup-ai-v2

# Tilføj Sentry variabler
cat >> .env.dev << 'EOF'

# Sentry Error Tracking
SENTRY_DSN=https://38abb6a712137ee472f8ee6215dc7b37@o4510243450388480.ingest.de.sentry.io/4510383150727248
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_DSN=https://12339bf53c39de932596de72504d2c1f@o4510243450388480.ingest.de.sentry.io/4510383153610832
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
EOF
```

## ✅ Verificering

Efter du har tilføjet variablerne:

1. **Start serveren:**
   ```bash
   pnpm dev
   ```

2. **Check logs** - du skal se:
   ```
   [Sentry] Error tracking initialized
   ```

3. **Test error tracking:**
   - Åbn browser console (F12)
   - Kør: `throw new Error("Test Sentry")`
   - Check Sentry dashboard - fejlen skal vises inden for få sekunder

## 🔍 Troubleshooting

### Sentry not initializing?

- ✅ Check at `SENTRY_ENABLED=true` (string, ikke boolean)
- ✅ Check at DSN er korrekt kopieret (ingen ekstra spaces)
- ✅ Restart server efter at have tilføjet variablerne
- ✅ Check server logs for fejlmeddelelser

### Errors not appearing in Sentry?

- ✅ Verify DSN er korrekt
- ✅ Check Sentry project settings
- ✅ Ensure environment matches (`development` vs `production`)
- ✅ Check browser console for errors

## 📝 Production Setup

Når du deployer til production, tilføj samme variabler til `.env.prod`:

```bash
# Production Sentry (samme DSN'er eller separate production projekter)
SENTRY_DSN=https://38abb6a712137ee472f8ee6215dc7b37@o4510243450388480.ingest.de.sentry.io/4510383150727248
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_DSN=https://12339bf53c39de932596de72504d2c1f@o4510243450388480.ingest.de.sentry.io/4510383153610832
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

**Note:** Overvej at oprette separate Sentry projekter til production for bedre organisering.

## 🔗 Links

- **Server Project:** https://sentry.io/organizations/tekup-r5/projects/friday-ai-server/
- **Client Project:** https://sentry.io/organizations/tekup-r5/projects/friday-ai-client/
- **Organization:** https://sentry.io/organizations/tekup-r5/

