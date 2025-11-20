/**
 * Audit Logging System
 *
 * ✅ SECURITY: Comprehensive audit logging for sensitive operations
 *
 * Tracks all security-relevant events:
 * - Authentication (login, logout, failed attempts)
 * - Authorization (access denied, privilege changes)
 * - Data access (viewing sensitive data)
 * - Data modification (create, update, delete)
 * - Configuration changes
 * - System events (rollbacks, errors)
 */

import { analyticsEvents, type InsertAnalyticsEvent } from "../../drizzle/schema";
import { getDb } from "../db";
import { logger } from "./logger";
import { redact } from "./redact";

/**
 * Audit event types
 */
export type AuditEventType =
  // Authentication events
  | "auth_login"
  | "auth_logout"
  | "auth_login_failed"
  | "auth_token_refresh"
  | "auth_token_expired"
  // Authorization events
  | "authz_access_denied"
  | "authz_role_changed"
  | "authz_permission_granted"
  | "authz_permission_revoked"
  // Data access events
  | "data_read_email"
  | "data_read_customer"
  | "data_read_lead"
  | "data_read_invoice"
  | "data_export"
  // Data modification events
  | "data_create"
  | "data_update"
  | "data_delete"
  | "data_bulk_delete"
  // Configuration events
  | "config_changed"
  | "feature_flag_changed"
  | "integration_enabled"
  | "integration_disabled"
  // System events
  | "system_error"
  | "rollback_executed"
  | "rate_limit_exceeded"
  | "security_incident";

/**
 * Severity levels for audit events
 */
export type AuditSeverity = "info" | "warning" | "error" | "critical";

/**
 * Audit event metadata
 */
export interface AuditEventData {
  // Required fields
  eventType: AuditEventType;
  userId: number;
  severity?: AuditSeverity;

  // Optional context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  // Resource information
  resourceType?: string; // e.g., "email", "customer", "lead"
  resourceId?: string | number;
  resourceName?: string;

  // Operation details
  action?: string; // e.g., "view", "edit", "delete"
  changes?: Record<string, any>; // Before/after values
  reason?: string; // Reason for action

  // Additional metadata
  metadata?: Record<string, any>;
}

/**
 * Log an audit event
 *
 * @example
 * ```ts
 * await logAuditEvent({
 *   eventType: "data_read_email",
 *   userId: 1,
 *   severity: "info",
 *   resourceType: "email",
 *   resourceId: "thread-123",
 *   ipAddress: "192.168.1.100",
 * });
 * ```
 */
export async function logAuditEvent(data: AuditEventData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      logger.warn("[Audit] Database not available, logging to console only");
      logger.info("[Audit]", redact(data));
      return;
    }

    // Build event data with redacted sensitive information
    const eventData: InsertAnalyticsEvent = {
      userId: data.userId,
      eventType: data.eventType,
      eventData: redact({
        severity: data.severity || "info",
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        resourceType: data.resourceType,
        resourceId: data.resourceId?.toString(),
        resourceName: data.resourceName,
        action: data.action,
        changes: data.changes,
        reason: data.reason,
        metadata: data.metadata,
        timestamp: new Date().toISOString(),
      }),
    };

    // Insert into database
    await db.insert(analyticsEvents).values(eventData);

    // Also log to application logger for immediate visibility
    const logLevel =
      data.severity === "critical" || data.severity === "error"
        ? "error"
        : data.severity === "warning"
          ? "warn"
          : "info";

    logger[logLevel](
      {
        auditEvent: data.eventType,
        userId: data.userId,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
      },
      `[Audit] ${data.eventType} by user ${data.userId}`
    );
  } catch (error) {
    // ✅ SECURITY: Never fail operations due to audit logging failures
    // Log error and continue
    logger.error(
      { error, eventType: data.eventType },
      "[Audit] Failed to log audit event"
    );
  }
}

/**
 * Log authentication events
 */
export async function logAuthEvent(
  type: "login" | "logout" | "login_failed" | "token_refresh" | "token_expired",
  userId: number | null,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    reason?: string;
    email?: string;
  }
): Promise<void> {
  await logAuditEvent({
    eventType: `auth_${type}` as AuditEventType,
    userId: userId || 0, // Use 0 for failed login attempts without userId
    severity: type === "login_failed" ? "warning" : "info",
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
    reason: metadata?.reason,
    metadata: metadata?.email ? { email: metadata.email } : undefined,
  });
}

/**
 * Log authorization events
 */
export async function logAuthzEvent(
  type: "access_denied" | "role_changed" | "permission_granted" | "permission_revoked",
  userId: number,
  metadata?: {
    resourceType?: string;
    resourceId?: string | number;
    role?: string;
    permission?: string;
    reason?: string;
  }
): Promise<void> {
  await logAuditEvent({
    eventType: `authz_${type}` as AuditEventType,
    userId,
    severity: type === "access_denied" ? "warning" : "info",
    resourceType: metadata?.resourceType,
    resourceId: metadata?.resourceId,
    metadata: {
      role: metadata?.role,
      permission: metadata?.permission,
    },
    reason: metadata?.reason,
  });
}

/**
 * Log data access events
 */
export async function logDataAccess(
  resourceType: "email" | "customer" | "lead" | "invoice" | "export",
  userId: number,
  resourceId?: string | number,
  metadata?: {
    action?: string;
    resourceName?: string;
    exportFormat?: string;
    recordCount?: number;
  }
): Promise<void> {
  await logAuditEvent({
    eventType: `data_read_${resourceType}` as AuditEventType,
    userId,
    severity: "info",
    resourceType,
    resourceId,
    resourceName: metadata?.resourceName,
    action: metadata?.action || "view",
    metadata: {
      exportFormat: metadata?.exportFormat,
      recordCount: metadata?.recordCount,
    },
  });
}

/**
 * Log data modification events
 */
export async function logDataModification(
  operation: "create" | "update" | "delete" | "bulk_delete",
  resourceType: string,
  userId: number,
  resourceId?: string | number,
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  }
): Promise<void> {
  await logAuditEvent({
    eventType: `data_${operation}` as AuditEventType,
    userId,
    severity: operation === "delete" || operation === "bulk_delete" ? "warning" : "info",
    resourceType,
    resourceId,
    action: operation,
    changes: changes
      ? {
          before: redact(changes.before),
          after: redact(changes.after),
        }
      : undefined,
  });
}

/**
 * Log configuration changes
 */
export async function logConfigChange(
  configType: string,
  userId: number,
  changes: {
    key: string;
    oldValue?: any;
    newValue?: any;
  },
  reason?: string
): Promise<void> {
  await logAuditEvent({
    eventType: "config_changed",
    userId,
    severity: "warning",
    resourceType: configType,
    resourceName: changes.key,
    action: "update",
    changes: {
      before: redact({ [changes.key]: changes.oldValue }),
      after: redact({ [changes.key]: changes.newValue }),
    },
    reason,
  });
}

/**
 * Log security incidents
 */
export async function logSecurityIncident(
  userId: number | null,
  incident: {
    type: string;
    description: string;
    severity: "warning" | "error" | "critical";
    ipAddress?: string;
    metadata?: Record<string, any>;
  }
): Promise<void> {
  await logAuditEvent({
    eventType: "security_incident",
    userId: userId || 0,
    severity: incident.severity,
    reason: incident.description,
    ipAddress: incident.ipAddress,
    metadata: redact({
      incidentType: incident.type,
      ...incident.metadata,
    }),
  });

  // ✅ SECURITY: Critical incidents should alert immediately
  if (incident.severity === "critical") {
    logger.error(
      {
        incident: redact(incident),
        userId,
      },
      `[SECURITY] Critical security incident: ${incident.type}`
    );
    // TODO: Integrate with alerting system (Slack, PagerDuty, etc.)
  }
}

/**
 * Log rate limit exceeded events
 */
export async function logRateLimitExceeded(
  userId: number | null,
  metadata: {
    endpoint?: string;
    ipAddress?: string;
    limit?: number;
    window?: string;
  }
): Promise<void> {
  await logAuditEvent({
    eventType: "rate_limit_exceeded",
    userId: userId || 0,
    severity: "warning",
    ipAddress: metadata.ipAddress,
    resourceName: metadata.endpoint,
    metadata: {
      limit: metadata.limit,
      window: metadata.window,
    },
  });
}
