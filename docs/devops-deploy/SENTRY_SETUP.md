# Sentry Error Tracking Setup

**Status:** ✅ Implemented  
**Date:** January 28, 2025

## Overview

Sentry error tracking has been integrated into both the server and client to capture and monitor errors in production.

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

### Server Configuration

Sentry is initialized in `server/_core/index.ts` before any other imports:

```typescript
if (ENV.sentryEnabled && ENV.sentryDsn) {
  Sentry.init({
    dsn: ENV.sentryDsn,
    environment: ENV.sentryEnvironment,
    tracesSampleRate: ENV.sentryTracesSampleRate,
    captureUnhandledRejections: true,
    captureUncaughtExceptions: true,
  });
}
```

### Client Configuration

Sentry is initialized in `client/src/main.tsx` before React app:

```typescript
if (sentryEnabled && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnvironment,
    tracesSampleRate: sentryTracesSampleRate,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.reactRouterV6BrowserTracingIntegration(),
    ],
  });
}
```

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

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Node.js Integration](https://docs.sentry.io/platforms/javascript/guides/node/)
- [React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
