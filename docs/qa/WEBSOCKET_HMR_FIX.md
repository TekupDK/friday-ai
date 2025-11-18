# WebSocket HMR Fix

**Date:** 2025-11-17  
**Status:** ✅ Fixed

## Problem

**Error:**

```
WebSocket connection to 'ws://localhost:5173/?token=...' failed
[vite] failed to connect to websocket (Error: WebSocket closed without opened.)
```

**Root Cause:**

- Vite HMR config had hardcoded port `5173` in `vite.config.ts`
- Vite dev server was running on port `5174` (because 5173 was occupied)
- WebSocket tried to connect to 5173, but server was on 5174
- Connection failed → HMR not working

**System:** Frontend Development (Vite HMR)

## Fix Applied

**File:** `vite.config.ts`

**Before:**

```typescript
hmr: {
  protocol: "ws",
  host: "localhost",
  port: 5173,        // ❌ Hardcoded
  clientPort: 5173,  // ❌ Hardcoded
  overlay: true,
},
```

**After:**

```typescript
hmr: {
  protocol: "ws",
  host: "localhost",
  // ✅ port and clientPort omitted - Vite uses dev server port automatically
  overlay: true,
},
```

**Why This Works:**

- When `port` and `clientPort` are omitted, Vite automatically uses the same port as the dev server
- This prevents port mismatch issues when Vite falls back to a different port
- WebSocket connection will always match the actual server port

## Verification

**Steps to Verify:**

1. Restart Vite server: `pnpm dev:vite`
2. Open browser: http://localhost:5174 (or whatever port Vite uses)
3. Check browser console - no WebSocket errors
4. Make a code change - HMR should work

**Expected Result:**

- ✅ No WebSocket connection errors in console
- ✅ HMR works when editing files
- ✅ Browser updates automatically on file changes

## Related Issues

This fix also prevents similar issues when:

- Port 5173 is occupied → Vite uses 5174, 5175, etc.
- Multiple Vite instances running
- Port changes between restarts

## Files Modified

- `vite.config.ts` - Removed hardcoded HMR ports

---

**Status:** ✅ Fixed - Ready for testing
