/**
 * tRPC Client Export
 * 
 * Exports the tRPC client instance for use in standalone components.
 * This creates a client with the same configuration as the main app.
 */

import { httpBatchLink, httpLink, splitLink } from "@trpc/client";
import superjson from "superjson";

import { trpc } from "./trpc";

// Create tRPC client with same configuration as main app
export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition(op: any) {
        return op.type === "mutation" && op.path === "chat.sendMessage";
      },
      true: httpLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch(input: RequestInfo | URL, init?: RequestInit) {
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers: {
              ...(init?.headers ?? {}),
            },
          });
        },
      }),
      false: httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch(input: RequestInfo | URL, init?: RequestInit) {
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
            headers: {
              ...(init?.headers ?? {}),
            },
          });
        },
      }),
    }),
  ],
});
