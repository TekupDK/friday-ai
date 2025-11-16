import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

// TRPC React client strongly typed with the server AppRouter
export const trpc = createTRPCReact<AppRouter>();
