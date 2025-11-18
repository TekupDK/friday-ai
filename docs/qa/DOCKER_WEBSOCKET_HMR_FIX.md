# Docker WebSocket HMR Fix

**Date:** 2025-11-17  
**Status:** ✅ Fixed

## Problem

**Error in Docker:**

```
WebSocket connection to 'ws://localhost:5173/?token=...' failed
[vite] failed to connect to websocket (Error: WebSocket closed without opened.)
```

**Root Cause:**

- Vite HMR config in `vite.config.ts` had no port configuration (good for native)
- But in Docker, HMR needs explicit configuration to work through Docker network
- WebSocket connection failed because HMR couldn't determine correct host/port in container

**System:** Docker Frontend Development (Vite HMR)

## Fix Applied

### 1. Updated `docker-compose.dev.yml`

**Added HMR Environment Variables:**

```yaml
environment:
  - VITE_HMR_HOST=localhost
  - VITE_HMR_PORT=5173
```

**Why:**

- Explicitly tells Vite HMR which host/port to use in Docker
- Ensures WebSocket connects to correct port (5173) in container
- Works with Docker port mapping (5173:5173)

### 2. Updated `vite.config.ts`

**Made HMR Config Docker-Aware:**

```typescript
hmr: {
  protocol: "ws",
  host: process.env.VITE_HMR_HOST || "localhost",
  // Use env var in Docker, auto-detect in native
  ...(process.env.VITE_HMR_PORT && {
    port: parseInt(process.env.VITE_HMR_PORT, 10),
    clientPort: parseInt(process.env.VITE_HMR_PORT, 10),
  }),
  overlay: true,
},
```

**Why:**

- Uses environment variables when in Docker (explicit config)
- Falls back to auto-detection in native development (flexible)
- Works in both Docker and native environments

## How It Works

### Native Development

- No `VITE_HMR_PORT` env var → Vite auto-detects port
- Works with any port (5173, 5174, etc.)
- Flexible and works out of the box

### Docker Development

- `VITE_HMR_PORT=5173` set in docker-compose → Vite uses explicit port
- `VITE_HMR_HOST=localhost` → WebSocket connects to correct host
- Works through Docker port mapping

## Verification

**Steps to Verify:**

1. Start Docker services: `docker-compose -f docker-compose.dev.yml up`
2. Open browser: http://localhost:5173
3. Check browser console - no WebSocket errors
4. Make a code change - HMR should work
5. Check logs: `docker-compose -f docker-compose.dev.yml logs -f frontend-dev`

**Expected Result:**

- ✅ No WebSocket connection errors in console
- ✅ HMR works when editing files in Docker
- ✅ Browser updates automatically on file changes
- ✅ Works in both Docker and native environments

## Files Modified

- `docker-compose.dev.yml` - Added HMR environment variables
- `vite.config.ts` - Made HMR config Docker-aware

## Related

- See `docs/qa/WEBSOCKET_HMR_FIX.md` for native development fix
- See `docs/devops-deploy/DOCKER_LIVE_EDITING.md` for Docker setup

---

**Status:** ✅ Fixed - Works in both Docker and Native
