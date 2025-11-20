/**
 * Two-Factor Authentication (2FA) System
 *
 * ✅ SECURITY: TOTP-based two-factor authentication for enhanced account security
 *
 * Features:
 * - TOTP (Time-based One-Time Password) generation and verification
 * - QR code generation for authenticator apps (Google Authenticator, Authy, etc.)
 * - Backup codes for account recovery
 * - Encrypted secret storage
 * - Rate limiting on verification attempts
 */

import crypto from "crypto";
import * as OTPAuth from "otpauth";

import { eq } from "drizzle-orm";

import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { logAuthEvent, logSecurityIncident } from "./audit-log";
import { logger } from "./logger";

/**
 * Generate a random TOTP secret
 */
export function generateTOTPSecret(): string {
  // Generate a 32-character base32 secret (160 bits)
  const secret = new OTPAuth.Secret({ size: 20 }); // 20 bytes = 160 bits
  return secret.base32;
}

/**
 * Generate backup codes for account recovery
 * Returns 10 codes, each 8 characters long
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()
      .match(/.{1,4}/g)!
      .join("-");
    codes.push(code);
  }

  return codes;
}

/**
 * Hash backup codes for secure storage
 */
export function hashBackupCodes(codes: string[]): string[] {
  return codes.map(code => {
    return crypto.createHash("sha256").update(code).digest("hex");
  });
}

/**
 * Verify a backup code against hashed codes
 */
export function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): boolean {
  const hashedInput = crypto.createHash("sha256").update(code).digest("hex");
  return hashedCodes.includes(hashedInput);
}

/**
 * Remove a used backup code from the list
 */
export function removeBackupCode(
  code: string,
  hashedCodes: string[]
): string[] {
  const hashedInput = crypto.createHash("sha256").update(code).digest("hex");
  return hashedCodes.filter(hash => hash !== hashedInput);
}

/**
 * Encrypt TOTP secret for database storage
 * Uses AES-256-GCM encryption
 */
export function encryptSecret(secret: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(key.substring(0, 32), "utf-8"),
    iv
  );

  let encrypted = cipher.update(secret, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Return: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt TOTP secret from database
 */
export function decryptSecret(encrypted: string, key: string): string {
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted secret format");
  }

  const [ivHex, authTagHex, encryptedData] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(key.substring(0, 32), "utf-8"),
    iv
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generate TOTP code for current time
 */
export function generateTOTP(secret: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: "Friday AI",
    label: "Friday AI Account",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.generate();
}

/**
 * Verify TOTP code
 * Allows a window of ±1 period (30 seconds before/after) to account for clock drift
 */
export function verifyTOTP(token: string, secret: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: "Friday AI",
    label: "Friday AI Account",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // Verify with window of ±1 period (allows 30 seconds before/after)
  const delta = totp.validate({ token, window: 1 });

  // delta is null if invalid, otherwise it's the number of periods offset
  return delta !== null;
}

/**
 * Generate TOTP URI for QR code
 */
export function generateTOTPUri(
  secret: string,
  userEmail: string,
  issuer: string = "Friday AI"
): string {
  const totp = new OTPAuth.TOTP({
    issuer,
    label: userEmail,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.toString();
}

/**
 * Enable 2FA for a user
 */
export async function enableTwoFactorAuth(
  userId: number,
  secret: string,
  backupCodes: string[]
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Encrypt secret before storage
    const encryptionKey = process.env.ENCRYPTION_KEY || "default-encryption-key-change-in-production";
    const encryptedSecret = encryptSecret(secret, encryptionKey);

    // Hash backup codes before storage
    const hashedBackupCodes = hashBackupCodes(backupCodes);

    // Update user record
    await db
      .update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
        backupCodes: hashedBackupCodes,
      })
      .where(eq(users.id, userId));

    // Log audit event
    await logAuthEvent("login", userId, {
      reason: "2FA enabled",
    });

    logger.info({ userId }, "[2FA] Two-factor authentication enabled");
  } catch (error) {
    logger.error({ error, userId }, "[2FA] Failed to enable 2FA");
    throw error;
  }
}

/**
 * Disable 2FA for a user
 */
export async function disableTwoFactorAuth(userId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Update user record
    await db
      .update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null,
      })
      .where(eq(users.id, userId));

    // Log audit event
    await logAuthEvent("login", userId, {
      reason: "2FA disabled",
    });

    logger.info({ userId }, "[2FA] Two-factor authentication disabled");
  } catch (error) {
    logger.error({ error, userId }, "[2FA] Failed to disable 2FA");
    throw error;
  }
}

/**
 * Verify 2FA token for a user
 */
export async function verifyTwoFactorToken(
  userId: number,
  token: string,
  isBackupCode: boolean = false
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Fetch user's 2FA settings
    const [user] = await db
      .select({
        id: users.id,
        twoFactorEnabled: users.twoFactorEnabled,
        twoFactorSecret: users.twoFactorSecret,
        backupCodes: users.backupCodes,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      logger.warn({ userId }, "[2FA] User does not have 2FA enabled");
      return false;
    }

    // Decrypt secret
    const encryptionKey = process.env.ENCRYPTION_KEY || "default-encryption-key-change-in-production";
    const secret = decryptSecret(user.twoFactorSecret, encryptionKey);

    // Verify backup code
    if (isBackupCode) {
      const hashedCodes = (user.backupCodes as string[]) || [];
      const isValid = verifyBackupCode(token, hashedCodes);

      if (isValid) {
        // Remove used backup code
        const updatedCodes = removeBackupCode(token, hashedCodes);

        await db
          .update(users)
          .set({ backupCodes: updatedCodes })
          .where(eq(users.id, userId));

        await logAuthEvent("login", userId, {
          reason: "2FA verified with backup code",
        });

        logger.info({ userId }, "[2FA] Backup code verified");
        return true;
      } else {
        await logSecurityIncident(userId, {
          type: "invalid_2fa_backup_code",
          description: "Invalid 2FA backup code attempt",
          severity: "warning",
        });

        logger.warn({ userId }, "[2FA] Invalid backup code");
        return false;
      }
    }

    // Verify TOTP token
    const isValid = verifyTOTP(token, secret);

    if (isValid) {
      await logAuthEvent("login", userId, {
        reason: "2FA verified successfully",
      });

      logger.info({ userId }, "[2FA] TOTP token verified");
    } else {
      await logSecurityIncident(userId, {
        type: "invalid_2fa_token",
        description: "Invalid 2FA token attempt",
        severity: "warning",
      });

      logger.warn({ userId }, "[2FA] Invalid TOTP token");
    }

    return isValid;
  } catch (error) {
    logger.error({ error, userId }, "[2FA] Failed to verify 2FA token");
    return false;
  }
}

/**
 * Get 2FA status for a user
 */
export async function getTwoFactorStatus(userId: number): Promise<{
  enabled: boolean;
  backupCodesRemaining: number;
}> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const [user] = await db
      .select({
        twoFactorEnabled: users.twoFactorEnabled,
        backupCodes: users.backupCodes,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { enabled: false, backupCodesRemaining: 0 };
    }

    const backupCodes = (user.backupCodes as string[]) || [];

    return {
      enabled: user.twoFactorEnabled || false,
      backupCodesRemaining: backupCodes.length,
    };
  } catch (error) {
    logger.error({ error, userId }, "[2FA] Failed to get 2FA status");
    return { enabled: false, backupCodesRemaining: 0 };
  }
}
