import * as Sentry from "@sentry/react";

import { trpc } from "@/lib/trpc";

import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
  hydrate,
} from "@tanstack/react-query";
import {
  httpBatchLink,
  httpLink,
  splitLink,
  TRPCClientError,
} from "@trpc/client";
import React from "react";
import { createRoot } from "react-dom/client";
import superjson from "superjson";

import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import { chatSendAbort } from "./lib/abortSignals";
import {
  createOptimizedQueryClient,
  invalidateAuthQueries,
  warmupCache,
  getCacheConfig,
} from "./lib/cacheStrategy";
import { getCsrfHeaders } from "./lib/csrf";
import { requestQueue } from "./lib/requestQueue";
import { intelligentRetryDelay, shouldRetry } from "./lib/retryStrategy";

import { UNAUTHED_ERR_MSG } from "@shared/const";

// Initialize Sentry error tracking (before React app)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const sentryEnabled = import.meta.env.VITE_SENTRY_ENABLED === "true";
const sentryEnvironment = import.meta.env.MODE || "development";
const sentryTracesSampleRate = parseFloat(
  import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "0.1"
);

if (sentryEnabled && sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: sentryEnvironment,
    tracesSampleRate: sentryTracesSampleRate,
    integrations: [
      // Automatically instrument browser performance
      Sentry.browserTracingIntegration(),
      // Note: reactRouterV6BrowserTracingIntegration is for React Router v6
      // Since we use wouter, we only need browserTracingIntegration
    ],
    // Note: captureUnhandledRejections and captureUncaughtExceptions are enabled by default in v10
  });
  console.log("[Sentry] Error tracking initialized");
} else {
  console.log(
    "[Sentry] Error tracking disabled (VITE_SENTRY_ENABLED=false or VITE_SENTRY_DSN not set)"
  );
}

// Phase 7.2: Optimized QueryClient with intelligent cache strategy
const queryClient = createOptimizedQueryClient();

// Lightweight cache persistence (localStorage) to speed up reloads
const PERSIST_KEY = "rq:dehydrated:v1";

function safeLoadPersistedState() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; state: unknown } | null;
    // Only reuse if not too old (5 minutes)
    if (!parsed || !parsed.state || !parsed.ts) return null;
    if (Date.now() - parsed.ts > 5 * 60 * 1000) return null;
    return parsed.state as unknown;
  } catch {
    return null;
  }
}

const persistedState = safeLoadPersistedState();
if (persistedState) {
  try {
    hydrate(queryClient, persistedState as any);
  } catch {}
}

function persistNow() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const state = dehydrate(queryClient, {
      // Persist all queries for simplicity; adjust later if needed
      shouldDehydrateQuery: () => true,
    });
    localStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({ ts: Date.now(), state })
    );
  } catch {}
}

// Throttle persistence to avoid excessive writes
let persistTimer: number | null = null;
function schedulePersist() {
  if (persistTimer) return;
  persistTimer = window.setTimeout(() => {
    persistTimer = null;
    persistNow();
  }, 800);
}

// Persist on query updates and before unload
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "added" || event.type === "updated") {
    schedulePersist();
  }
});

window.addEventListener("beforeunload", () => {
  try {
    persistNow();
  } catch {}
});

const redirectToLoginIfUnauthorized = async (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Phase 7.1: Try silent refresh before redirecting
  try {
    console.log(
      "[Auth] Attempting silent session refresh before login redirect"
    );
    const refreshResponse = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (refreshResponse.ok) {
      // Check if response has content before parsing JSON
      const contentType = refreshResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("[Auth] Refresh response is not JSON, skipping");
        return;
      }

      const text = await refreshResponse.text();
      if (!text || text.trim().length === 0) {
        console.warn("[Auth] Refresh response is empty, skipping");
        return;
      }

      let refreshData;
      try {
        refreshData = JSON.parse(text);
      } catch (parseError) {
        console.error("[Auth] Failed to parse refresh response:", parseError);
        return;
      }

      if (refreshData.refreshed) {
        console.log(
          "[Auth] Session refreshed successfully - avoiding login redirect"
        );
        // Phase 7.2: Intelligent auth-aware cache invalidation
        invalidateAuthQueries(queryClient);
        return;
      }
    }
  } catch (refreshError) {
    console.warn(
      "[Auth] Silent refresh failed, proceeding with login redirect",
      refreshError
    );
  }

  // If refresh failed or wasn't needed, redirect to login
  window.location.href = getLoginUrl();
};

// Store rate limit state globally
let globalRateLimitState: {
  isRateLimited: boolean;
  retryAfter: Date | null;
} = {
  isRateLimited: false,
  retryAfter: null,
};

/**
 * Extract retry-after from error message
 */
const extractRetryAfter = (error: unknown): Date | null => {
  if (!(error instanceof TRPCClientError)) return null;

  const message = error.message || "";
  const retryAfterMatch = message.match(/retry after ([^,]+)/i);

  if (retryAfterMatch) {
    try {
      const timestamp = new Date(retryAfterMatch[1].trim());
      if (!isNaN(timestamp.getTime())) {
        return timestamp;
      }
    } catch {
      // Invalid date, ignore
    }
  }

  // Also check error.data
  const retryAfter = (error.data as any)?.retryAfter;
  if (retryAfter) {
    try {
      const timestamp = new Date(retryAfter);
      if (!isNaN(timestamp.getTime())) {
        return timestamp;
      }
    } catch {
      // Invalid date, ignore
    }
  }

  return null;
};

/**
 * Check if error is rate limit error
 */
const isRateLimitError = (error: unknown): boolean => {
  if (!(error instanceof TRPCClientError)) return false;

  const message = (error.message || "").toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("rate limit exceeded") ||
    message.includes("too many requests") ||
    message.includes("429") ||
    (error.data as any)?.code === "RATE_LIMIT_EXCEEDED"
  );
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);

    // Handle rate limit errors
    if (isRateLimitError(error)) {
      const retryAfter = extractRetryAfter(error);
      if (retryAfter) {
        globalRateLimitState = {
          isRateLimited: true,
          retryAfter,
        };
        // Update request queue with rate limit
        requestQueue.setRateLimitUntil(retryAfter);
        console.warn("[Rate Limit]", {
          retryAfter: retryAfter.toISOString(),
          message: error.message,
          queueSize: requestQueue.getQueueSize(),
        });
      }
    }

    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);

    // Handle rate limit errors
    if (isRateLimitError(error)) {
      const retryAfter = extractRetryAfter(error);
      if (retryAfter) {
        globalRateLimitState = {
          isRateLimited: true,
          retryAfter,
        };
        // Update request queue with rate limit
        requestQueue.setRateLimitUntil(retryAfter);
        console.warn("[Rate Limit]", {
          retryAfter: retryAfter.toISOString(),
          message: error.message,
          queueSize: requestQueue.getQueueSize(),
        });
      }
    }

    console.error("[API Mutation Error]", error);
  }
});

// Auto-clear rate limit when retry-after time passes
setInterval(() => {
  if (globalRateLimitState.isRateLimited && globalRateLimitState.retryAfter) {
    const now = new Date();
    if (now >= globalRateLimitState.retryAfter) {
      globalRateLimitState = {
        isRateLimited: false,
        retryAfter: null,
      };
      // Clear request queue rate limit
      requestQueue.clearRateLimit();
    }
  }
}, 1000); // Check every second

const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition(op) {
        return op.type === "mutation" && op.path === "chat.sendMessage";
      },
      true: httpLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch(input, init) {
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers: {
              ...(init?.headers ?? {}),
              ...getCsrfHeaders(),
            },
            signal: chatSendAbort.controller?.signal ?? undefined,
          });
        },
      }),
      false: httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch(input, init) {
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers: {
              ...(init?.headers ?? {}),
              ...getCsrfHeaders(),
            },
          });
        },
      }),
    }),
  ],
});

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

root.render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

// HMR: Preserve React state on hot reload
if (import.meta.hot) {
  import.meta.hot.accept("./App", newModule => {
    if (newModule) {
      root.render(
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <newModule.default />
          </QueryClientProvider>
        </trpc.Provider>
      );
    }
  });

  // Preserve query client state on HMR
  import.meta.hot.dispose(() => {
    // State is already persisted to localStorage, so it will be restored
  });
}
