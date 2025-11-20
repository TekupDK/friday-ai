/**
 * PII (Personally Identifiable Information) Masking Utilities
 *
 * ✅ SECURITY: Masks sensitive information in logs, analytics, and non-production environments
 *
 * Supported PII types:
 * - Email addresses
 * - Phone numbers (Danish and international formats)
 * - Credit card numbers
 * - CPR numbers (Danish social security)
 * - IP addresses
 * - Physical addresses (partial)
 */

import { ENV } from "./env";

export interface MaskingOptions {
  /**
   * If true, completely redact the value with [REDACTED]
   * If false, show partial information (e.g., first 2 and last 2 chars)
   */
  fullRedaction?: boolean;

  /**
   * Custom replacement string
   */
  replacement?: string;

  /**
   * Preserve formatting (e.g., keep @ in emails, dashes in phone numbers)
   */
  preserveFormat?: boolean;
}

/**
 * Mask email addresses
 * Examples:
 * - test@example.com → t**t@e****e.com
 * - john.doe@company.dk → j******e@c*****y.dk
 */
export function maskEmail(
  email: string,
  options: MaskingOptions = {}
): string {
  const { fullRedaction = false, replacement = "*", preserveFormat = true } = options;

  if (fullRedaction) {
    return "[REDACTED_EMAIL]";
  }

  const emailRegex = /^([^@]+)@([^.]+)\.(.+)$/;
  const match = email.match(emailRegex);

  if (!match) {
    return email; // Invalid email, return as-is
  }

  const [, username, domain, tld] = match;

  // Show first and last character of username
  const maskedUsername =
    username.length <= 2
      ? replacement.repeat(username.length)
      : username[0] + replacement.repeat(username.length - 2) + username[username.length - 1];

  // Show first and last character of domain
  const maskedDomain =
    domain.length <= 2
      ? replacement.repeat(domain.length)
      : domain[0] + replacement.repeat(domain.length - 2) + domain[domain.length - 1];

  return preserveFormat
    ? `${maskedUsername}@${maskedDomain}.${tld}`
    : `${maskedUsername}${maskedDomain}${tld}`;
}

/**
 * Mask phone numbers
 * Examples:
 * - +45 12 34 56 78 → +45 ** ** ** 78
 * - 12345678 → 12****78
 */
export function maskPhoneNumber(
  phone: string,
  options: MaskingOptions = {}
): string {
  const { fullRedaction = false, replacement = "*", preserveFormat = true } = options;

  if (fullRedaction) {
    return "[REDACTED_PHONE]";
  }

  // Remove all non-digit characters for processing
  const digitsOnly = phone.replace(/\D/g, "");

  if (digitsOnly.length < 4) {
    return replacement.repeat(phone.length);
  }

  // Show first 2 and last 2 digits
  const first2 = digitsOnly.slice(0, 2);
  const last2 = digitsOnly.slice(-2);
  const middleLength = digitsOnly.length - 4;

  if (preserveFormat) {
    // Try to preserve original formatting
    let maskedPhone = phone;
    const middleMask = replacement.repeat(middleLength);

    // Replace middle digits with asterisks while preserving spaces/dashes
    const digitPositions: number[] = [];
    for (let i = 0; i < phone.length; i++) {
      if (/\d/.test(phone[i])) {
        digitPositions.push(i);
      }
    }

    // Mask digits from position 2 to length-2
    for (let i = 2; i < digitPositions.length - 2; i++) {
      const pos = digitPositions[i];
      maskedPhone = maskedPhone.substring(0, pos) + replacement + maskedPhone.substring(pos + 1);
    }

    return maskedPhone;
  }

  return first2 + replacement.repeat(middleLength) + last2;
}

/**
 * Mask credit card numbers
 * Examples:
 * - 4532 1234 5678 9010 → 4532 **** **** 9010
 * - 4532123456789010 → 4532********9010
 */
export function maskCreditCard(
  cardNumber: string,
  options: MaskingOptions = {}
): string {
  const { fullRedaction = false, replacement = "*", preserveFormat = true } = options;

  if (fullRedaction) {
    return "[REDACTED_CARD]";
  }

  const digitsOnly = cardNumber.replace(/\D/g, "");

  if (digitsOnly.length < 8) {
    return replacement.repeat(cardNumber.length);
  }

  // Show first 4 and last 4 digits (standard PCI DSS compliance)
  const first4 = digitsOnly.slice(0, 4);
  const last4 = digitsOnly.slice(-4);
  const middleLength = digitsOnly.length - 8;

  if (preserveFormat) {
    let maskedCard = cardNumber;
    const digitPositions: number[] = [];

    for (let i = 0; i < cardNumber.length; i++) {
      if (/\d/.test(cardNumber[i])) {
        digitPositions.push(i);
      }
    }

    // Mask digits from position 4 to length-4
    for (let i = 4; i < digitPositions.length - 4; i++) {
      const pos = digitPositions[i];
      maskedCard = maskedCard.substring(0, pos) + replacement + maskedCard.substring(pos + 1);
    }

    return maskedCard;
  }

  return first4 + replacement.repeat(middleLength) + last4;
}

/**
 * Mask Danish CPR numbers (DDMMYY-XXXX)
 * Examples:
 * - 010190-1234 → 010190-****
 * - 0101901234 → 010190****
 */
export function maskCPR(cpr: string, options: MaskingOptions = {}): string {
  const { fullRedaction = false, replacement = "*", preserveFormat = true } = options;

  if (fullRedaction) {
    return "[REDACTED_CPR]";
  }

  const digitsOnly = cpr.replace(/\D/g, "");

  if (digitsOnly.length !== 10) {
    return replacement.repeat(cpr.length); // Invalid CPR
  }

  // Show first 6 digits (birthdate), mask last 4
  const first6 = digitsOnly.slice(0, 6);
  const masked = first6 + replacement.repeat(4);

  return preserveFormat && cpr.includes("-") ? `${first6}-${replacement.repeat(4)}` : masked;
}

/**
 * Mask IP addresses
 * Examples:
 * - 192.168.1.100 → 192.168.*.*
 * - 2001:0db8:85a3::8a2e:0370:7334 → 2001:0db8:****:****:****:****
 */
export function maskIPAddress(
  ip: string,
  options: MaskingOptions = {}
): string {
  const { fullRedaction = false, replacement = "*" } = options;

  if (fullRedaction) {
    return "[REDACTED_IP]";
  }

  // IPv4
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${replacement}.${replacement}`;
    }
  }

  // IPv6
  if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:${replacement.repeat(4)}:${replacement.repeat(4)}:${replacement.repeat(4)}:${replacement.repeat(4)}`;
    }
  }

  return ip;
}

/**
 * Mask any text containing PII using regex patterns
 * Detects and masks:
 * - Email addresses
 * - Phone numbers
 * - Credit cards
 * - CPR numbers
 */
export function maskPIIInText(
  text: string,
  options: MaskingOptions = {}
): string {
  let maskedText = text;

  // Email pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  maskedText = maskedText.replace(emailRegex, match => maskEmail(match, options));

  // Danish phone numbers (+45 12 34 56 78, 12345678, etc.)
  const phoneRegex = /(\+45[\s]?)?(\d{2}[\s]?\d{2}[\s]?\d{2}[\s]?\d{2})/g;
  maskedText = maskedText.replace(phoneRegex, match => maskPhoneNumber(match, options));

  // Credit card numbers (13-19 digits with optional spaces/dashes)
  const cardRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4,7}\b/g;
  maskedText = maskedText.replace(cardRegex, match => maskCreditCard(match, options));

  // CPR numbers (DDMMYY-XXXX or DDMMYYXXXX)
  const cprRegex = /\b\d{6}[\s-]?\d{4}\b/g;
  maskedText = maskedText.replace(cprRegex, match => maskCPR(match, options));

  return maskedText;
}

/**
 * Conditionally mask PII based on environment
 * In production, only mask if explicitly enabled
 * In development/staging, always mask unless disabled
 */
export function conditionalMask(
  value: string,
  type: "email" | "phone" | "card" | "cpr" | "ip" | "text",
  options: MaskingOptions = {}
): string {
  // ✅ SECURITY: Only mask in non-production OR if PII_MASKING_ENABLED=true
  const shouldMask =
    !ENV.isProduction || process.env.PII_MASKING_ENABLED === "true";

  if (!shouldMask) {
    return value;
  }

  switch (type) {
    case "email":
      return maskEmail(value, options);
    case "phone":
      return maskPhoneNumber(value, options);
    case "card":
      return maskCreditCard(value, options);
    case "cpr":
      return maskCPR(value, options);
    case "ip":
      return maskIPAddress(value, options);
    case "text":
      return maskPIIInText(value, options);
    default:
      return value;
  }
}

/**
 * Mask an object's properties that contain PII
 * Useful for logging objects without exposing sensitive data
 */
export function maskObjectPII<T extends Record<string, any>>(
  obj: T,
  piiFields: Array<{ field: keyof T; type: "email" | "phone" | "card" | "cpr" | "ip" | "text" }>,
  options: MaskingOptions = {}
): T {
  const masked = { ...obj };

  for (const { field, type } of piiFields) {
    if (masked[field] && typeof masked[field] === "string") {
      masked[field] = conditionalMask(masked[field], type, options) as any;
    }
  }

  return masked;
}
