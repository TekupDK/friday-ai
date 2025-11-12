import { router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Auth router with login functionality
export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user ?? null),

  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    // For demo purposes - accept any email/password
    // In production, implement proper authentication
    if (input.email && input.password) {
      // Create mock user session
      const mockUser = {
        id: "demo-user",
        email: input.email,
        name: input.email.split("@")[0],
      };

      // Set session cookie (simplified for demo)
      ctx.res?.cookie("app_session_id", "demo-session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return mockUser;
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid email or password",
    });
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    // Clear session cookie
    ctx.res?.clearCookie("app_session_id");
    return { success: true };
  }),
});
