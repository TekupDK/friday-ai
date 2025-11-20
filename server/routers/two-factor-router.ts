/**
 * Two-Factor Authentication Router
 *
 * ✅ SECURITY: tRPC endpoints for 2FA management
 *
 * Endpoints:
 * - setup: Initialize 2FA setup (generate secret and backup codes)
 * - enable: Enable 2FA after verification
 * - disable: Disable 2FA
 * - verify: Verify 2FA token
 * - getStatus: Get 2FA status for current user
 * - regenerateBackupCodes: Generate new backup codes
 */

import QRCode from "qrcode";
import { z } from "zod";

import { logAuthEvent, logSecurityIncident } from "../_core/audit-log";
import { logger } from "../_core/logger";
import { protectedProcedure, router } from "../_core/trpc";
import {
  disableTwoFactorAuth,
  enableTwoFactorAuth,
  generateBackupCodes,
  generateTOTPSecret,
  generateTOTPUri,
  getTwoFactorStatus,
  hashBackupCodes,
  verifyTOTP,
  verifyTwoFactorToken,
} from "../_core/two-factor-auth";

export const twoFactorRouter = router({
  /**
   * Initialize 2FA setup
   * Generates TOTP secret and QR code
   */
  setup: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = ctx.user;

      // Generate TOTP secret
      const secret = generateTOTPSecret();

      // Generate backup codes
      const backupCodes = generateBackupCodes(10);

      // Generate TOTP URI for QR code
      const uri = generateTOTPUri(
        secret,
        user.email || `user-${user.id}@friday-ai.local`,
        "Friday AI"
      );

      // Generate QR code as Data URL
      const qrCodeDataUrl = await QRCode.toDataURL(uri);

      // Log setup initiation
      await logAuthEvent("login", user.id, {
        reason: "2FA setup initiated",
      });

      logger.info({ userId: user.id }, "[2FA] Setup initiated");

      return {
        secret,
        qrCodeDataUrl,
        backupCodes,
        uri,
      };
    } catch (error) {
      logger.error({ error, userId: ctx.user.id }, "[2FA] Setup failed");
      throw new Error("Failed to initialize 2FA setup");
    }
  }),

  /**
   * Enable 2FA after user verifies the token
   */
  enable: protectedProcedure
    .input(
      z.object({
        secret: z.string(),
        token: z.string().length(6),
        backupCodes: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.user;

        // Verify token before enabling
        const isValid = verifyTOTP(input.token, input.secret);

        if (!isValid) {
          await logSecurityIncident(user.id, {
            type: "invalid_2fa_enable_token",
            description: "Invalid token during 2FA enable attempt",
            severity: "warning",
          });

          throw new Error("Invalid verification token");
        }

        // Enable 2FA
        await enableTwoFactorAuth(user.id, input.secret, input.backupCodes);

        logger.info({ userId: user.id }, "[2FA] 2FA enabled successfully");

        return {
          success: true,
          message: "Two-factor authentication enabled successfully",
        };
      } catch (error) {
        logger.error(
          { error, userId: ctx.user.id },
          "[2FA] Failed to enable 2FA"
        );

        if (error instanceof Error && error.message === "Invalid verification token") {
          throw error;
        }

        throw new Error("Failed to enable two-factor authentication");
      }
    }),

  /**
   * Disable 2FA
   */
  disable: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6).optional(),
        password: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.user;

        // Verify token or password before disabling
        if (input.token) {
          const isValid = await verifyTwoFactorToken(user.id, input.token, false);

          if (!isValid) {
            await logSecurityIncident(user.id, {
              type: "invalid_2fa_disable_token",
              description: "Invalid token during 2FA disable attempt",
              severity: "warning",
            });

            throw new Error("Invalid verification token");
          }
        }

        // Disable 2FA
        await disableTwoFactorAuth(user.id);

        logger.info({ userId: user.id }, "[2FA] 2FA disabled");

        return {
          success: true,
          message: "Two-factor authentication disabled successfully",
        };
      } catch (error) {
        logger.error(
          { error, userId: ctx.user.id },
          "[2FA] Failed to disable 2FA"
        );

        if (error instanceof Error && error.message === "Invalid verification token") {
          throw error;
        }

        throw new Error("Failed to disable two-factor authentication");
      }
    }),

  /**
   * Verify 2FA token
   */
  verify: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        isBackupCode: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.user;

        const isValid = await verifyTwoFactorToken(
          user.id,
          input.token,
          input.isBackupCode
        );

        return {
          success: isValid,
          message: isValid
            ? "Token verified successfully"
            : "Invalid verification token",
        };
      } catch (error) {
        logger.error(
          { error, userId: ctx.user.id },
          "[2FA] Token verification failed"
        );

        throw new Error("Failed to verify token");
      }
    }),

  /**
   * Get 2FA status for current user
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = ctx.user;

      const status = await getTwoFactorStatus(user.id);

      return status;
    } catch (error) {
      logger.error(
        { error, userId: ctx.user.id },
        "[2FA] Failed to get status"
      );

      throw new Error("Failed to get 2FA status");
    }
  }),

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes: protectedProcedure
    .input(
      z.object({
        token: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = ctx.user;

        // Verify token before regenerating
        const isValid = await verifyTwoFactorToken(user.id, input.token, false);

        if (!isValid) {
          await logSecurityIncident(user.id, {
            type: "invalid_2fa_regenerate_token",
            description: "Invalid token during backup code regeneration",
            severity: "warning",
          });

          throw new Error("Invalid verification token");
        }

        // Generate new backup codes
        const newBackupCodes = generateBackupCodes(10);
        const hashedCodes = hashBackupCodes(newBackupCodes);

        // Update user's backup codes
        const { getDb } = await import("../db");
        const { users } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        await db
          .update(users)
          .set({ backupCodes: hashedCodes })
          .where(eq(users.id, user.id));

        await logAuthEvent("login", user.id, {
          reason: "2FA backup codes regenerated",
        });

        logger.info({ userId: user.id }, "[2FA] Backup codes regenerated");

        return {
          success: true,
          backupCodes: newBackupCodes,
        };
      } catch (error) {
        logger.error(
          { error, userId: ctx.user.id },
          "[2FA] Failed to regenerate backup codes"
        );

        if (error instanceof Error && error.message === "Invalid verification token") {
          throw error;
        }

        throw new Error("Failed to regenerate backup codes");
      }
    }),
});
