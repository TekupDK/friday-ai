# Sentry Error Tracking Setup

**Status:** ✅ Implemented (Sentry v10)  
**Date:** January 28, 2025  
**Version:** @sentry/node 10.25.0, @sentry/react 10.25.0

## Overview

Sentry error tracking has been integrated into both the server and client to capture and monitor errors in production. This setup uses **Sentry v10** with the new integration APIs.

## Configuration

### Environment Variables

Add these to your `.env.dev` and `.env.prod` files:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Server Configuration (Sentry v10)

Sentry is initialized in `server/_core/index.ts` before any other imports:

```typescript
// Initialize Sentry v10
if (ENV.sentryEnabled && ENV.sentryDsn) {
  Sentry.init({
    dsn: ENV.sentryDsn,
    environment: ENV.sentryEnvironment,
    tracesSampleRate: ENV.sentryTracesSampleRate,
    // Note: captureUnhandledRejections and captureUncaughtExceptions
    // are enabled by default in v10
  });
  logger.info("[Sentry] Error tracking initialized");
}
```

**Express Integration (v10):**

The Express integration is configured in `Sentry.init()` and automatically handles everything:

```typescript
// In server/_core/index.ts - Sentry.init() call
if (ENV.sentryEnabled && ENV.sentryDsn) {
  Sentry.init({
    dsn: ENV.sentryDsn,
    environment: ENV.sentryEnvironment,
    tracesSampleRate: ENV.sentryTracesSampleRate,
    integrations: [
      // Express integration automatically handles:
      // - Request/response tracking
      // - Error capturing
      // - Performance monitoring
      Sentry.expressIntegration(),
    ],
  });
}
```

**In `startServer()` function:**

No additional middleware setup is needed! The `expressIntegration()` in `Sentry.init()` automatically:
- ✅ Instruments Express requests/responses
- ✅ Captures unhandled errors
- ✅ Tracks performance
- ✅ Adds request context to errors

```typescript
// In startServer() - No Sentry middleware needed!
// The expressIntegration() in Sentry.init() handles everything automatically
async function startServer() {
  const app = express();
  // ... other middleware ...
  // Sentry is already configured and working!
}
```

**Key Changes in v10:**

- ❌ Removed: `Sentry.Handlers.requestHandler()` and `Sentry.Handlers.tracingHandler()`
- ❌ Removed: `Sentry.setupExpressErrorHandler(app)` (automatic via expressIntegration)
- ✅ New: `Sentry.expressIntegration()` in `Sentry.init()` - handles everything automatically
- ✅ Automatic: Unhandled rejections/exceptions captured by default
- ✅ Automatic: Express error handling via expressIntegration

### Client Configuration (Sentry v10)

Sentry is initialized in `client/src/main.tsx` before React app:

```typescript
if (sentryEnabled && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnvironment,
    tracesSampleRate: sentryTracesSampleRate,
    integrations: [
      // Automatically instrument browser performance
      Sentry.browserTracingIntegration(),
      // Note: We use wouter (not react-router), so only browserTracingIntegration is needed
    ],
    // Note: captureUnhandledRejections and captureUncaughtExceptions
    // are enabled by default in v10
  });
  console.log("[Sentry] Error tracking initialized");
}
```

**Key Changes in v10:**

- ✅ New: `browserTracingIntegration()` replaces old performance integration
- ❌ Removed: `reactRouterV6BrowserTracingIntegration()` (we use wouter, not react-router)
- ✅ Automatic: Unhandled rejections/exceptions captured by default

## Features

### Automatic Error Capture

- ✅ Unhandled promise rejections
- ✅ Uncaught exceptions
- ✅ React component errors (via ErrorBoundary)
- ✅ Express.js request/response errors
- ✅ Performance tracing (10% sample rate)

### Error Context

Errors include:

- User context (if available)
- Request context (URL, method, headers)
- Stack traces
- Environment information
- Custom tags and breadcrumbs

## Usage

### Manual Error Reporting

```typescript
import * as Sentry from "@sentry/react"; // or "@sentry/node"

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "payment" },
    extra: { userId: 123 },
  });
}
```

### Adding Breadcrumbs

```typescript
Sentry.addBreadcrumb({
  message: "User clicked button",
  category: "ui",
  level: "info",
});
```

### Setting User Context

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});
```

## Setup Steps

### Step 1: Create Sentry Projects

Du skal oprette **to projekter** - ét til server (Node.js) og ét til client (React):

1. **Gå til Sentry Dashboard**
   - https://sentry.io
   - Log ind med din Tekup organization (`tekup-r5`)

2. **Opret Server Project (Node.js)**
   - Klik "Create Project" eller gå til Projects → Create Project
   - Vælg **"Node.js"** platform
   - Project Name: `friday-ai-server` (eller dit valg)
   - Team: Vælg dit team
   - Klik "Create Project"
   - **Kopier DSN** - den ser ud som: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
   - Gem denne som `SENTRY_DSN` i environment variables

3. **Opret Client Project (React)**
   - Klik "Create Project" igen
   - Vælg **"React"** platform
   - Project Name: `friday-ai-client` (eller dit valg)
   - Team: Vælg dit team
   - Klik "Create Project"
   - **Kopier DSN** - den ser ud som: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
   - Gem denne som `VITE_SENTRY_DSN` i environment variables

**Vigtigt:** Du kan også bruge samme DSN til både server og client, men det anbefales at have separate projekter for bedre organisering.

### Step 2: Add Environment Variables

Tilføj til `.env.dev` og `.env.prod`:

```bash
# Sentry Error Tracking - Server
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1

# Sentry Error Tracking - Client
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENABLED=true
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

**Note:** Organization tokens (som du har oprettet) bruges til CLI/API, ikke til SDK integration. Du skal bruge DSN fra projekterne.

### Step 3: Test Integration

1. **Start Server**

   ```bash
   pnpm dev
   ```

2. **Check Logs**
   - Du skal se: `[Sentry] Error tracking initialized`
   - Hvis du ser: `[Sentry] Error tracking disabled` - tjek environment variables

3. **Trigger Test Error**
   - Åbn browser console
   - Kør: `throw new Error("Test Sentry integration")`
   - Check Sentry dashboard - fejlen skal vises inden for få sekunder

### Step 4: Configure Alerts

1. **Gå til Project Settings → Alerts**
2. **Create Alert Rule**
   - Trigger: "An issue is created"
   - Action: Email/Slack notification
   - Save alert

3. **Set Up Notifications**
   - Settings → Notifications
   - Configure email/Slack integration

## Performance Impact

- **Traces Sample Rate:** 10% (0.1) - only 10% of requests are traced
- **Bundle Size:** ~50KB gzipped (client)
- **Overhead:** Minimal - async error reporting doesn't block execution

## Troubleshooting

### Sentry Not Initializing

- Check `SENTRY_ENABLED` is set to `"true"` (string, not boolean)
- Verify `SENTRY_DSN` is correct
- Check server logs for initialization messages

### Errors Not Appearing

- Verify DSN is correct
- Check Sentry project settings
- Ensure environment matches (`development` vs `production`)

### Performance Issues

- Reduce `SENTRY_TRACES_SAMPLE_RATE` (default: 0.1 = 10%)
- Disable tracing in development: `SENTRY_TRACES_SAMPLE_RATE=0`

## Migration Notes (v8 → v10)

### Breaking Changes Fixed

1. **Express Middleware:**
   - Old (v8): `Sentry.Handlers.requestHandler()` and `Sentry.Handlers.tracingHandler()`
   - New (v10): `Sentry.expressIntegration()` with `Sentry.addIntegration()`

2. **Error Handler:**
   - Old (v8): `Sentry.Handlers.errorHandler()`
   - New (v10): `Sentry.setupExpressErrorHandler(app)`

3. **Init Options:**
   - Removed: `captureUnhandledRejections` and `captureUncaughtExceptions` (auto-enabled)
   - Changed: Integration APIs updated

### Files Modified for v10

- `server/_core/index.ts` - Updated Sentry initialization and middleware
- `client/src/main.tsx` - Updated React integration
- `client/src/hooks/__tests__/useKeyboardShortcuts.test.tsx` - Fixed test mocks

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry v10 Migration Guide](https://docs.sentry.io/platforms/javascript/migration/)
- [Node.js Integration](https://docs.sentry.io/platforms/javascript/guides/node/)
- [React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Express Integration](https://docs.sentry.io/platforms/javascript/guides/express/)
