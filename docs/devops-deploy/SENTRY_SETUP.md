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

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Create a new project (Node.js for server, React for client)
   - Copy the DSN

2. **Add Environment Variables**
   - Add `SENTRY_DSN` and `VITE_SENTRY_DSN` to `.env.dev` and `.env.prod`
   - Set `SENTRY_ENABLED=true` and `VITE_SENTRY_ENABLED=true`

3. **Test Integration**
   - Start the server and check logs for "[Sentry] Error tracking initialized"
   - Trigger a test error to verify it appears in Sentry dashboard

4. **Configure Alerts**
   - Set up alerts in Sentry for critical errors
   - Configure email/Slack notifications

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

