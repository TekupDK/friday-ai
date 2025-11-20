import * as Sentry from "@sentry/react";

import { trpc } from "@/lib/trpc";

import { dehydrate, hydrate, QueryClientProvider } from "@tanstack/react-query";
import {
  httpBatchLink,
  httpLink,
  splitLink,
  TRPCClientError,
} from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";

import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import { chatSendAbort } from "./lib/abortSignals";
import {
  createOptimizedQueryClient,
  invalidateAuthQueries,
} from "./lib/cacheStrategy";
import { getCsrfHeaders } from "./lib/csrf";
import { requestQueue } from "./lib/requestQueue";

import { UNAUTHED_ERR_MSG } from "@shared/const";

// Initialize Sentry error tracking (before React app)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const sentryEnabled = import.meta.env.VITE_SENTRY_ENABLED === "true";
const sentryEnvironment = import.meta.env.MODE || "development";
const sentryTracesSampleRate = parseFloat(
  import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || "0.1"
);

if (sentryEnabled && sentryDsn) {
  if (import.meta.env.DEV) {
    console.log("[Sentry] Error tracking initialized");
  }
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
} else {
  if (import.meta.env.DEV) {
    console.log(
      "[Sentry] Error tracking disabled (VITE_SENTRY_ENABLED=false or VITE_SENTRY_DSN not set)"
    );
  }
}

// Phase 7.2: Optimized QueryClient with intelligent cache strategy
const queryClient = createOptimizedQueryClient();

// Lightweight cache persistence (localStorage) to speed up reloads
const PERSIST_KEY = "rq:dehydrated:v1";

function safeLoadPersistedState() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw || raw.trim().length === 0) return null;

    // Validate JSON before parsing to avoid "Unexpected end of JSON input"
    let parsed: { ts: number; state: unknown } | null = null;
    try {
      parsed = JSON.parse(raw) as { ts: number; state: unknown } | null;
    } catch (parseError) {
      // Corrupted JSON - clear it
      if (import.meta.env.DEV) {
        console.warn(
          "[Cache] Corrupted localStorage state, clearing:",
          parseError
        );
      }
      localStorage.removeItem(PERSIST_KEY);
      return null;
    }
    // Only reuse if not too old (5 minutes)
    if (!parsed || !parsed.state || !parsed.ts) return null;
    if (Date.now() - parsed.ts > 5 * 60 * 1000) {
      // Clear old state
      localStorage.removeItem(PERSIST_KEY);
      return null;
    }

    // Filter out queries that might cause hydration issues (tRPC queries need fresh queryFn)
    const state = parsed.state as { queries?: Array<{ queryKey: unknown[] }> };
    if (state?.queries) {
      // Only keep non-tRPC queries for hydration (tRPC queries will be re-fetched)
      const filteredQueries = state.queries.filter((q: any) => {
        const key = Array.isArray(q.queryKey) ? q.queryKey : [];
        // Skip tRPC queries - they need fresh queryFn
        if (key.length > 0 && typeof key[0] === "string") {
          // tRPC queries have structure like ["auth", "me"] or ["workspace", ...]
          return false; // Don't hydrate tRPC queries
        }
        return true;
      });

      if (filteredQueries.length === 0) {
        // No valid queries to hydrate, clear state
        localStorage.removeItem(PERSIST_KEY);
        return null;
      }

      return { ...state, queries: filteredQueries };
    }

    return parsed.state as unknown;
  } catch {
    // On error, clear corrupted state
    try {
      localStorage.removeItem(PERSIST_KEY);
    } catch {}
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
      // Don't persist tRPC queries - they need fresh queryFn on hydration
      shouldDehydrateQuery: query => {
        const key = Array.isArray(query.queryKey) ? query.queryKey : [];
        // Skip tRPC queries (they have string array keys like ["auth", "me"])
        if (key.length > 0 && typeof key[0] === "string") {
          return false; // Don't dehydrate tRPC queries
        }
        return true; // Dehydrate other queries
      },
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
    if (import.meta.env.DEV) {
      console.log(
        "[Auth] Attempting silent session refresh before login redirect"
      );
    }
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
        if (import.meta.env.DEV) {
          console.warn("[Auth] Refresh response is not JSON, skipping");
        }
        return;
      }

      const text = await refreshResponse.text();
      if (!text || text.trim().length === 0) {
        if (import.meta.env.DEV) {
          console.warn("[Auth] Refresh response is empty, skipping");
        }
        return;
      }

      let refreshData;
      try {
        refreshData = JSON.parse(text);
      } catch (parseError) {
        if (import.meta.env.DEV) {
          console.error("[Auth] Failed to parse refresh response:", parseError);
        }
        return;
      }

      if (refreshData.refreshed) {
        if (import.meta.env.DEV) {
          console.log(
            "[Auth] Session refreshed successfully - avoiding login redirect"
          );
        }
        // Phase 7.2: Intelligent auth-aware cache invalidation
        invalidateAuthQueries(queryClient);
        return;
      }
    }
  } catch (refreshError) {
    if (import.meta.env.DEV) {
      console.warn(
        "[Auth] Silent refresh failed, proceeding with login redirect",
        refreshError
      );
    }
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
        if (import.meta.env.DEV) {
          console.warn("[Rate Limit]", {
            retryAfter: retryAfter.toISOString(),
            message: error.message,
            queueSize: requestQueue.getQueueSize(),
          });
        }
      }
    }

    if (import.meta.env.DEV) {
      console.error("[API Query Error]", error);
    }
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
        if (import.meta.env.DEV) {
          console.warn("[Rate Limit]", {
            retryAfter: retryAfter.toISOString(),
            message: error.message,
            queueSize: requestQueue.getQueueSize(),
          });
        }
      }
    }

    if (import.meta.env.DEV) {
      console.error("[API Mutation Error]", error);
    }
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
          return globalThis
            .fetch(input, {
              ...(init ?? {}),
              credentials: "include",
              headers: {
                ...(init?.headers ?? {}),
                ...getCsrfHeaders(),
              },
            })
            .then(async response => {
              // Validate response has content before tRPC tries to parse it
              if (!response.ok) {
                // For error responses, ensure we have valid JSON
                const contentType = response.headers.get("content-type");
                if (contentType?.includes("application/json")) {
                  const text = await response.clone().text();
                  if (!text || text.trim().length === 0) {
                    // Empty JSON response - return a proper error response
                    return new Response(
                      JSON.stringify({
                        error: { message: "Empty response from server" },
                      }),
                      {
                        status: response.status,
                        statusText: response.statusText,
                        headers: { "Content-Type": "application/json" },
                      }
                    );
                  }
                }
              }
              return response;
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
