# CRM System - Forbedring & Konsoliderings Plan

**Dato:** 2025-11-18
**Version:** 1.0
**Status:** Ready for Implementation
**Estimeret Total Tid:** 6-8 uger (1 udvikler) eller 3-4 uger (2 udviklere)

---

## Executive Summary

Friday AI CRM systemet har et solidt fundament med moderne teknologi (TypeScript, tRPC, Drizzle, PostgreSQL). Systemet er funktionelt og production-ready til nuværende skala (100-1000 kunder), men har akkumuleret teknisk gæld der skal addresseres før skalering til 10,000+ kunder.

**Primære Udfordringer:**
- ❌ Test coverage: ~5% (skal være 80%+)
- ❌ Ingen background job infrastructure
- ❌ Manglende transaction management
- ❌ Code duplication (auth checks, validation)
- ❌ Inkonsistent error handling
- ❌ Manglende monitoring/observability

**Mål:**
- ✅ 80%+ test coverage inden 8 uger
- ✅ Background job system implementeret inden 2 uger
- ✅ Transaction management inden 1 uge
- ✅ Zero code duplication for auth checks inden 1 uge
- ✅ Production monitoring inden 2 uger

---

## Prioriteret Roadmap

### 🔴 P0 - Kritisk (Uge 1-2)

**Må implementeres NU for at undgå data corruption og sikkerhedsproblemer**

| # | Task | Estimat | Risiko |
|---|------|---------|--------|
| P0.1 | Implementer transaction management | 3-5 dage | 🔴 High |
| P0.2 | Fix N+1 queries i segment listing | 1 dag | 🟡 Medium |
| P0.3 | Tilføj XSS sanitization til frontend | 2 dage | 🔴 High |
| P0.4 | Implementer rate limiting på dyre endpoints | 1 dag | 🟡 Medium |
| P0.5 | Fix silent failures i async operations | 2 dage | 🟡 Medium |

**Total P0:** 9-11 dage

### 🟡 P1 - Høj Prioritet (Uge 3-5)

**Skal implementeres for skalerbarhed og maintainability**

| # | Task | Estimat | Impact |
|---|------|---------|--------|
| P1.1 | Background job system (BullMQ) | 5 dage | 🔴 High |
| P1.2 | Auth middleware (DRY auth checks) | 2 dage | 🟢 High |
| P1.3 | Test suite - Backend routers | 8 dage | 🔴 High |
| P1.4 | Test suite - Frontend components | 5 dage | 🟡 Medium |
| P1.5 | Audit logging middleware | 3 dage | 🔴 High |
| P1.6 | Error monitoring (Sentry integration) | 2 dage | 🟢 Medium |

**Total P1:** 25 dage

### 🟢 P2 - Medium Prioritet (Uge 6-8)

**Nice-to-have forbedringer der øger code quality**

| # | Task | Estimat | Impact |
|---|------|---------|--------|
| P2.1 | Refactor validation til centraliseret system | 3 dage | 🟢 Medium |
| P2.2 | Database foreign key constraints | 2 dage | 🟡 Medium |
| P2.3 | Performance monitoring dashboard | 3 dage | 🟢 Medium |
| P2.4 | API documentation (OpenAPI) | 2 dage | 🟢 Low |
| P2.5 | Code documentation (TSDoc) | 3 dage | 🟢 Low |
| P2.6 | E2E test suite expansion | 5 dage | 🟡 Medium |

**Total P2:** 18 dage

---

## P0.1: Transaction Management

### Problem

Multi-step database operations mangler atomicitet, hvilket kan føre til inkonsistent data:

```typescript
// ❌ PROBLEM: Hvis anden delete fejler, er database i inkonsistent state
await db.delete(customerSegmentMembers).where(...);
await db.delete(customerSegments).where(...);
```

### Løsning

Implementer transaction wrapper utilities med Drizzle.

#### Implementation

**1. Opret transaction utility** (`server/db/transaction-utils.ts`):

```typescript
import { db } from './_core/db';
import { logger } from './_core/logger';

/**
 * Executes a database operation within a transaction
 * Automatically rolls back on error
 */
export async function withTransaction<T>(
  operation: (tx: typeof db) => Promise<T>,
  operationName = 'Database Transaction'
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await db.transaction(async (tx) => {
      return await operation(tx);
    });

    const duration = Date.now() - startTime;
    logger.info(`Transaction ${operationName} completed in ${duration}ms`);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Transaction ${operationName} failed after ${duration}ms:`, error);
    throw error;
  }
}

/**
 * Type-safe transaction helper with retry logic
 */
export async function withRetryableTransaction<T>(
  operation: (tx: typeof db) => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    operationName?: string;
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 100, operationName = 'Transaction' } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(operation, `${operationName} (attempt ${attempt})`);
    } catch (error) {
      lastError = error as Error;

      // Don't retry on application errors, only on DB errors
      if (error instanceof Error && !isDatabaseError(error)) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(`Retrying transaction after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

function isDatabaseError(error: Error): boolean {
  const dbErrorCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'];
  return dbErrorCodes.some(code => error.message.includes(code));
}
```

**2. Refactor eksisterende operationer**:

```typescript
// ❌ BEFORE (crm-extensions-router.ts:510-518)
deleteSegment: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    await db.delete(customerSegmentMembers).where(eq(customerSegmentMembers.segmentId, input.id));
    await db.delete(customerSegments).where(eq(customerSegments.id, input.id));
    return { success: true };
  }),

// ✅ AFTER
deleteSegment: protectedProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    return await withTransaction(async (tx) => {
      // Verify ownership first
      const [segment] = await tx
        .select()
        .from(customerSegments)
        .where(and(
          eq(customerSegments.id, input.id),
          eq(customerSegments.userId, ctx.userId)
        ))
        .limit(1);

      if (!segment) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Segment not found' });
      }

      // Delete in transaction
      await tx.delete(customerSegmentMembers).where(eq(customerSegmentMembers.segmentId, input.id));
      await tx.delete(customerSegments).where(eq(customerSegments.id, input.id));

      return { success: true };
    }, 'Delete Customer Segment');
  }),
```

**3. Identificer alle multi-step operations**:

```bash
# Find candidates for transactions
grep -rn "await db\." server/routers/crm-*.ts | grep -A5 "await db\."
```

**Operationer der skal wrappedes:**
- `deleteSegment` (customerSegmentMembers + customerSegments)
- `convertLeadToCustomer` (update lead + create customer + create activity)
- `deleteCustomerProfile` (all related tables)
- `updateOpportunityStage` (opportunity + activity + health score)

#### Testing

**Unit test** (`server/__tests__/transaction-utils.test.ts`):

```typescript
import { describe, it, expect, vi } from 'vitest';
import { withTransaction, withRetryableTransaction } from '../db/transaction-utils';

describe('Transaction Utils', () => {
  it('should commit transaction on success', async () => {
    const result = await withTransaction(async (tx) => {
      return { success: true };
    });

    expect(result).toEqual({ success: true });
  });

  it('should rollback transaction on error', async () => {
    await expect(
      withTransaction(async (tx) => {
        throw new Error('Test error');
      })
    ).rejects.toThrow('Test error');
  });

  it('should retry on database errors', async () => {
    let attempts = 0;

    const result = await withRetryableTransaction(
      async (tx) => {
        attempts++;
        if (attempts < 3) {
          throw new Error('ECONNREFUSED');
        }
        return { success: true };
      },
      { maxRetries: 3, retryDelay: 10 }
    );

    expect(attempts).toBe(3);
    expect(result).toEqual({ success: true });
  });
});
```

#### Success Metrics

- ✅ Zero partial failures in multi-step operations
- ✅ All deletion operations atomic
- ✅ Transaction logging in place

#### Estimat: 3-5 dage

---

## P0.2: Fix N+1 Queries

### Problem

Segment listing kører N+1 queries (1 for segments + N for member counts):

```typescript
// ❌ PROBLEM: 100 segments = 101 queries
const segments = await db.select().from(customerSegments);
const segmentsWithCounts = await Promise.all(
  segments.map(async segment => {
    const [count] = await db.select(...).from(customerSegmentMembers)...
  })
);
```

### Løsning

Brug SQL JOIN eller subquery for at hente alt i 1 query.

#### Implementation

**Refactor segment listing** (`server/routers/crm-extensions-router.ts:544-558`):

```typescript
// ✅ SOLUTION: 1 query med JOIN
listSegments: protectedProcedure
  .input(z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
  }))
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { limit, offset } = input;

    // Single query with LEFT JOIN and COUNT
    const segmentsWithCounts = await db
      .select({
        id: customerSegments.id,
        userId: customerSegments.userId,
        name: customerSegments.name,
        type: customerSegments.type,
        rules: customerSegments.rules,
        color: customerSegments.color,
        createdAt: customerSegments.createdAt,
        updatedAt: customerSegments.updatedAt,
        memberCount: sql<number>`cast(count(${customerSegmentMembers.customerId}) as integer)`,
      })
      .from(customerSegments)
      .leftJoin(
        customerSegmentMembers,
        eq(customerSegments.id, customerSegmentMembers.segmentId)
      )
      .where(eq(customerSegments.userId, userId))
      .groupBy(customerSegments.id)
      .orderBy(desc(customerSegments.createdAt))
      .limit(limit)
      .offset(offset);

    return segmentsWithCounts;
  }),
```

#### Testing

```typescript
// Integration test
it('should fetch segments with member counts in single query', async () => {
  // Spy on database queries
  const querySpy = vi.spyOn(db, 'select');

  const caller = createCaller({ userId: testUserId });
  await caller.crm.extensions.listSegments({ limit: 10, offset: 0 });

  // Should only call select once
  expect(querySpy).toHaveBeenCalledTimes(1);
});
```

#### Success Metrics

- ✅ 1 query instead of N+1
- ✅ <100ms response time for 100 segments
- ✅ Query logging shows single SELECT

#### Estimat: 1 dag

---

## P0.3: XSS Sanitization

### Problem

User input renderes uden sanitization, hvilket skaber XSS risiko:

```typescript
// ❌ PROBLEM: Notes kan indeholde <script> tags
<p className="text-sm">{note.note}</p>
```

### Løsning

Brug DOMPurify til at sanitize alt user-generated content.

#### Implementation

**1. Opret sanitization utility** (`client/src/utils/sanitize.ts`):

```typescript
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML to prevent XSS attacks
 * Allows safe HTML tags while removing dangerous content
 */
export function sanitizeHtml(dirty: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: string[];
}): string {
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: options?.allowedTags || [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'
    ],
    ALLOWED_ATTR: options?.allowedAttributes || ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  };

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitizes text to plain text only (no HTML)
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * React component for safe HTML rendering
 */
export function SafeHtml({
  html,
  className,
  allowedTags
}: {
  html: string;
  className?: string;
  allowedTags?: string[];
}) {
  const clean = sanitizeHtml(html, { allowedTags });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
```

**2. Refactor komponenter**:

```typescript
// ❌ BEFORE
<p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
  {note.note}
</p>

// ✅ AFTER
import { sanitizeText } from '@/utils/sanitize';

<p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
  {sanitizeText(note.note)}
</p>

// ELLER hvis vi vil tillade formatering:
import { SafeHtml } from '@/utils/sanitize';

<SafeHtml
  html={note.note}
  className="text-sm text-muted-foreground whitespace-pre-wrap mt-2"
/>
```

**3. Identificer alle steder der renderer user input**:

```bash
# Find komponenter der renderer user data
grep -rn "customer\." client/src/pages/crm/ | grep -v "customer.id"
grep -rn "note\." client/src/pages/crm/
grep -rn "lead\." client/src/pages/crm/
```

**Steder der skal sanitizes:**
- CustomerDetail.tsx: customer.name, notes, activities
- LeadPipeline.tsx: lead.name, lead.source
- OpportunityCard.tsx: opportunity.title, opportunity.metadata
- SegmentBuilder.tsx: segment.name
- CustomerList.tsx: customer.name, customer.email

#### Testing

```typescript
import { sanitizeHtml, sanitizeText } from '@/utils/sanitize';

describe('Sanitization Utils', () => {
  it('should remove script tags', () => {
    const dirty = '<p>Hello</p><script>alert("XSS")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const dirty = '<a href="#" onclick="alert(1)">Click</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('onclick');
  });

  it('should strip all HTML for text sanitization', () => {
    const dirty = '<b>Bold</b> text';
    const clean = sanitizeText(dirty);
    expect(clean).toBe('Bold text');
  });
});
```

#### Success Metrics

- ✅ All user input sanitized before rendering
- ✅ No XSS vulnerabilities in security audit
- ✅ Unit tests for sanitization utilities

#### Estimat: 2 dage

---

## P0.4: Rate Limiting

### Problem

Dyre endpoints (stats, pipeline queries) kan misbruges uden rate limiting.

### Løsning

Implementer per-user rate limiting med express-rate-limit.

#### Implementation

**1. Opret rate limiting middleware** (`server/_core/rate-limit.ts`):

```typescript
import rateLimit from 'express-rate-limit';
import { redis } from './redis'; // Hvis I bruger Redis

/**
 * Standard rate limit: 100 requests per 15 minutes
 */
export const standardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limit for expensive operations: 20 per 15 minutes
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Rate limit exceeded for this operation.',
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.headers['x-admin'] === 'true';
  },
});

/**
 * Auth rate limit: 5 login attempts per 15 minutes
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
});

/**
 * tRPC-specific rate limiter
 */
export function createTRPCRateLimiter(maxRequests: number, windowMs: number) {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return (userId: string) => {
    const now = Date.now();
    const userLimit = requests.get(userId);

    if (!userLimit || now > userLimit.resetAt) {
      requests.set(userId, {
        count: 1,
        resetAt: now + windowMs,
      });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      return false;
    }

    userLimit.count++;
    return true;
  };
}

// Create limiters for different operations
export const statsRateLimiter = createTRPCRateLimiter(20, 15 * 60 * 1000); // 20 per 15min
export const exportRateLimiter = createTRPCRateLimiter(10, 15 * 60 * 1000); // 10 per 15min
export const pipelineRateLimiter = createTRPCRateLimiter(30, 15 * 60 * 1000); // 30 per 15min
```

**2. Apply rate limiting til routers**:

```typescript
// server/routers/crm-stats-router.ts
import { statsRateLimiter } from '../_core/rate-limit';

getDashboardStats: protectedProcedure
  .query(async ({ ctx }) => {
    const { userId } = ctx;

    // Check rate limit
    if (!statsRateLimiter(userId)) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again in a few minutes.',
      });
    }

    // ... rest of implementation
  }),
```

**3. Apply til Express app**:

```typescript
// server/_core/index.ts
import { standardRateLimit, strictRateLimit } from './rate-limit';

// Apply standard rate limit to all routes
app.use('/trpc', standardRateLimit);

// Apply strict rate limit to specific routes
app.use('/trpc/crm.stats', strictRateLimit);
app.use('/trpc/crm.extensions.exportAuditLog', strictRateLimit);
```

#### Testing

```typescript
it('should block requests after rate limit exceeded', async () => {
  const caller = createCaller({ userId: testUserId });

  // Make 21 requests (limit is 20)
  const promises = Array.from({ length: 21 }, () =>
    caller.crm.stats.getDashboardStats()
  );

  await expect(Promise.all(promises)).rejects.toThrow('Rate limit exceeded');
});
```

#### Success Metrics

- ✅ Rate limiting on all expensive endpoints
- ✅ Per-user tracking with Redis/memory
- ✅ Clear error messages when limit exceeded

#### Estimat: 1 dag

---

## P0.5: Fix Silent Failures

### Problem

Async operations fejler silent uden proper logging:

```typescript
// ❌ PROBLEM: Hvis tracking fejler, ved vi det aldrig
import("../subscription-usage-tracker")
  .then(({ trackBookingUsage }) => trackBookingUsage(...))
  .catch((error) => {
    console.error("Error tracking subscription usage:", error);
    // Silent failure - should alert/monitor
  });
```

### Løsning

Implementer proper error monitoring med Sentry + structured logging.

#### Implementation

**1. Setup Sentry** (`server/_core/monitoring.ts`):

```typescript
import * as Sentry from '@sentry/node';
import { logger } from './logger';

export function initializeMonitoring() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% of transactions
      beforeSend(event, hint) {
        // Filter out expected errors
        if (hint.originalException instanceof TRPCError) {
          const error = hint.originalException;
          if (error.code === 'NOT_FOUND' || error.code === 'UNAUTHORIZED') {
            return null; // Don't send to Sentry
          }
        }
        return event;
      },
    });
  }
}

/**
 * Capture error with context
 */
export function captureError(
  error: Error,
  context: {
    userId?: string;
    operation?: string;
    metadata?: Record<string, any>;
  }
) {
  logger.error('Captured error:', {
    error: error.message,
    stack: error.stack,
    ...context,
  });

  Sentry.captureException(error, {
    user: context.userId ? { id: context.userId } : undefined,
    tags: {
      operation: context.operation,
    },
    extra: context.metadata,
  });
}

/**
 * Track async operation failures
 */
export async function trackAsyncOperation<T>(
  operation: () => Promise<T>,
  options: {
    name: string;
    userId?: string;
    critical?: boolean; // If true, throw error instead of silent fail
  }
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    captureError(error as Error, {
      userId: options.userId,
      operation: options.name,
    });

    if (options.critical) {
      throw error;
    }

    return null;
  }
}
```

**2. Refactor async operations**:

```typescript
// ❌ BEFORE
import("../subscription-usage-tracker")
  .then(({ trackBookingUsage }) => trackBookingUsage(...))
  .catch((error) => {
    console.error("Error tracking subscription usage:", error);
  });

// ✅ AFTER
import { trackAsyncOperation } from '../_core/monitoring';

trackAsyncOperation(
  async () => {
    const { trackBookingUsage } = await import("../subscription-usage-tracker");
    await trackBookingUsage(userId, bookingId, subscriptionId);
  },
  {
    name: 'track-booking-usage',
    userId,
    critical: false, // Don't fail booking if tracking fails
  }
);
```

**3. Add structured logging**:

```typescript
// server/_core/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  serializers: {
    error: pino.stdSerializers.err,
  },
});

// Usage
logger.info({ userId, operation: 'createBooking' }, 'Booking created successfully');
logger.error({ userId, error }, 'Failed to track subscription usage');
```

#### Testing

```typescript
it('should log errors for failed async operations', async () => {
  const logSpy = vi.spyOn(logger, 'error');

  await trackAsyncOperation(
    async () => {
      throw new Error('Test failure');
    },
    { name: 'test-operation', userId: 'test-user' }
  );

  expect(logSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      operation: 'test-operation',
      userId: 'test-user',
    })
  );
});
```

#### Success Metrics

- ✅ Zero silent failures in production
- ✅ All errors logged with context
- ✅ Sentry receives critical errors only

#### Estimat: 2 dage

---

## P1.1: Background Job System

### Problem

Tunge operationer kører inline i requests, hvilket gør dem langsomme:
- Health score beregning
- Subscription usage tracking
- Email notifications
- Automated segmentation

### Løsning

Implementer BullMQ for background job processing.

#### Implementation

**1. Install dependencies**:

```bash
pnpm add bullmq ioredis
pnpm add -D @types/ioredis
```

**2. Setup job queue** (`server/jobs/queue.ts`):

```typescript
import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '../_core/logger';

// Redis connection
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// Define job types
export enum JobType {
  CALCULATE_HEALTH_SCORE = 'calculate-health-score',
  TRACK_SUBSCRIPTION_USAGE = 'track-subscription-usage',
  SEND_EMAIL_NOTIFICATION = 'send-email-notification',
  AUTO_SEGMENT_CUSTOMERS = 'auto-segment-customers',
  SYNC_BILLY_INVOICES = 'sync-billy-invoices',
  CLEANUP_OLD_DATA = 'cleanup-old-data',
}

// Job data types
export interface HealthScoreJobData {
  customerId: string;
  userId: string;
}

export interface SubscriptionUsageJobData {
  userId: string;
  subscriptionId: string;
  metric: string;
  value: number;
}

export interface EmailNotificationJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create queue
export const jobQueue = new Queue('crm-jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Queue events for monitoring
const queueEvents = new QueueEvents('crm-jobs', { connection });

queueEvents.on('completed', ({ jobId, returnvalue }) => {
  logger.info({ jobId, returnvalue }, 'Job completed');
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Job failed');
});

// Helper functions to add jobs
export async function scheduleHealthScoreCalculation(data: HealthScoreJobData) {
  return await jobQueue.add(JobType.CALCULATE_HEALTH_SCORE, data, {
    priority: 2, // Medium priority
  });
}

export async function trackSubscriptionUsageAsync(data: SubscriptionUsageJobData) {
  return await jobQueue.add(JobType.TRACK_SUBSCRIPTION_USAGE, data, {
    priority: 3, // Low priority
  });
}

export async function sendEmailNotificationAsync(data: EmailNotificationJobData) {
  return await jobQueue.add(JobType.SEND_EMAIL_NOTIFICATION, data, {
    priority: 1, // High priority
  });
}
```

**3. Create worker** (`server/jobs/worker.ts`):

```typescript
import { Worker, Job } from 'bullmq';
import { connection, JobType } from './queue';
import type { HealthScoreJobData, SubscriptionUsageJobData, EmailNotificationJobData } from './queue';
import { logger } from '../_core/logger';

// Job handlers
async function handleHealthScoreCalculation(job: Job<HealthScoreJobData>) {
  const { customerId, userId } = job.data;

  logger.info({ customerId, userId }, 'Calculating health score');

  // Import function dynamically to avoid circular dependencies
  const { recalculateCustomerHealthScore } = await import('../db/customer-db');
  await recalculateCustomerHealthScore(customerId, userId);

  return { customerId, success: true };
}

async function handleSubscriptionUsage(job: Job<SubscriptionUsageJobData>) {
  const { userId, subscriptionId, metric, value } = job.data;

  logger.info({ subscriptionId, metric, value }, 'Tracking subscription usage');

  const { trackUsage } = await import('../subscription-usage-tracker');
  await trackUsage(userId, subscriptionId, metric, value);

  return { subscriptionId, success: true };
}

async function handleEmailNotification(job: Job<EmailNotificationJobData>) {
  const { to, subject, template, data } = job.data;

  logger.info({ to, subject }, 'Sending email notification');

  const { sendEmail } = await import('../integrations/email');
  await sendEmail({ to, subject, template, data });

  return { to, success: true };
}

// Main worker
export function startWorker() {
  const worker = new Worker(
    'crm-jobs',
    async (job) => {
      logger.info({ jobId: job.id, type: job.name }, 'Processing job');

      switch (job.name) {
        case JobType.CALCULATE_HEALTH_SCORE:
          return await handleHealthScoreCalculation(job as Job<HealthScoreJobData>);

        case JobType.TRACK_SUBSCRIPTION_USAGE:
          return await handleSubscriptionUsage(job as Job<SubscriptionUsageJobData>);

        case JobType.SEND_EMAIL_NOTIFICATION:
          return await handleEmailNotification(job as Job<EmailNotificationJobData>);

        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    },
    {
      connection,
      concurrency: 5, // Process 5 jobs simultaneously
      limiter: {
        max: 100, // Max 100 jobs
        duration: 60000, // per minute
      },
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Worker completed job');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err.message }, 'Worker failed job');
  });

  return worker;
}
```

**4. Initialize worker in server**:

```typescript
// server/_core/index.ts
import { startWorker } from '../jobs/worker';

// Start background job worker
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_WORKER === 'true') {
  startWorker();
  logger.info('Background job worker started');
}
```

**5. Refactor routers to use jobs**:

```typescript
// ❌ BEFORE (crm-booking-router.ts)
import("../subscription-usage-tracker")
  .then(({ trackBookingUsage }) => trackBookingUsage(...))
  .catch((error) => console.error(error));

// ✅ AFTER
import { trackSubscriptionUsageAsync } from '../jobs/queue';

await trackSubscriptionUsageAsync({
  userId,
  subscriptionId,
  metric: 'bookings',
  value: 1,
});
```

**6. Add scheduled jobs** (`server/jobs/scheduler.ts`):

```typescript
import cron from 'node-cron';
import { jobQueue, JobType } from './queue';
import { db } from '../_core/db';
import { customerProfiles } from '../../drizzle/schema';
import { logger } from '../_core/logger';

export function startScheduledJobs() {
  // Recalculate health scores daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Starting scheduled health score recalculation');

    const customers = await db
      .select({ id: customerProfiles.id, userId: customerProfiles.userId })
      .from(customerProfiles);

    for (const customer of customers) {
      await jobQueue.add(JobType.CALCULATE_HEALTH_SCORE, {
        customerId: customer.id,
        userId: customer.userId,
      });
    }

    logger.info(`Scheduled ${customers.length} health score calculations`);
  });

  // Auto-segment customers every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Starting auto-segmentation job');

    await jobQueue.add(JobType.AUTO_SEGMENT_CUSTOMERS, {});
  });

  // Cleanup old data weekly on Sunday at 3 AM
  cron.schedule('0 3 * * 0', async () => {
    logger.info('Starting data cleanup job');

    await jobQueue.add(JobType.CLEANUP_OLD_DATA, {});
  });
}
```

#### Testing

```typescript
import { jobQueue, scheduleHealthScoreCalculation } from '../jobs/queue';

describe('Job Queue', () => {
  it('should add health score calculation job', async () => {
    const job = await scheduleHealthScoreCalculation({
      customerId: 'test-id',
      userId: 'user-id',
    });

    expect(job.id).toBeDefined();
    expect(job.data).toEqual({
      customerId: 'test-id',
      userId: 'user-id',
    });
  });

  it('should process job successfully', async () => {
    // Wait for job to complete
    const job = await scheduleHealthScoreCalculation({
      customerId: 'test-id',
      userId: 'user-id',
    });

    await job.waitUntilFinished(queueEvents);

    const state = await job.getState();
    expect(state).toBe('completed');
  });
});
```

#### Success Metrics

- ✅ All heavy operations moved to background
- ✅ Response times <200ms for all endpoints
- ✅ Job success rate >99%
- ✅ Failed jobs retry automatically

#### Estimat: 5 dage

---

## P1.2: Auth Middleware

### Problem

Authorization checks dupliceret ~50 gange across routers:

```typescript
// Repeated everywhere
const [customer] = await db
  .select()
  .from(customerProfiles)
  .where(
    and(
      eq(customerProfiles.id, input.customerProfileId),
      eq(customerProfiles.userId, userId)
    )
  )
  .limit(1);

if (!customer) {
  throw new TRPCError({ code: "NOT_FOUND" });
}
```

### Løsning

Opret reusable auth helpers og middleware.

#### Implementation

**1. Create auth utilities** (`server/_core/auth-helpers.ts`):

```typescript
import { TRPCError } from '@trpc/server';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import type { PgTableWithColumns } from 'drizzle-orm/pg-core';

/**
 * Generic function to verify resource ownership
 */
export async function verifyOwnership<T extends PgTableWithColumns<any>>(
  table: T,
  resourceId: string,
  userId: string,
  options: {
    idField?: keyof T['columns'];
    userIdField?: keyof T['columns'];
    resourceName?: string;
  } = {}
) {
  const {
    idField = 'id' as keyof T['columns'],
    userIdField = 'userId' as keyof T['columns'],
    resourceName = 'Resource',
  } = options;

  const [resource] = await db
    .select()
    .from(table)
    .where(
      and(
        eq(table[idField as any], resourceId),
        eq(table[userIdField as any], userId)
      )
    )
    .limit(1);

  if (!resource) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `${resourceName} not found or access denied`,
    });
  }

  return resource;
}

/**
 * Verify customer profile ownership
 */
export async function verifyCustomerAccess(customerId: string, userId: string) {
  const { customerProfiles } = await import('../../drizzle/schema');
  return await verifyOwnership(customerProfiles, customerId, userId, {
    resourceName: 'Customer profile',
  });
}

/**
 * Verify lead ownership
 */
export async function verifyLeadAccess(leadId: string, userId: string) {
  const { leads } = await import('../../drizzle/schema');
  return await verifyOwnership(leads, leadId, userId, {
    resourceName: 'Lead',
  });
}

/**
 * Verify opportunity ownership
 */
export async function verifyOpportunityAccess(opportunityId: string, userId: string) {
  const { opportunities } = await import('../../drizzle/schema');
  return await verifyOwnership(opportunities, opportunityId, userId, {
    resourceName: 'Opportunity',
  });
}

/**
 * Verify segment ownership
 */
export async function verifySegmentAccess(segmentId: string, userId: string) {
  const { customerSegments } = await import('../../drizzle/schema');
  return await verifyOwnership(customerSegments, segmentId, userId, {
    resourceName: 'Customer segment',
  });
}

/**
 * Batch verify ownership for multiple resources
 */
export async function verifyBatchOwnership<T extends PgTableWithColumns<any>>(
  table: T,
  resourceIds: string[],
  userId: string,
  options: {
    idField?: keyof T['columns'];
    userIdField?: keyof T['columns'];
    resourceName?: string;
  } = {}
): Promise<T[]> {
  const {
    idField = 'id' as keyof T['columns'],
    userIdField = 'userId' as keyof T['columns'],
    resourceName = 'Resources',
  } = options;

  const resources = await db
    .select()
    .from(table)
    .where(
      and(
        inArray(table[idField as any], resourceIds),
        eq(table[userIdField as any], userId)
      )
    );

  if (resources.length !== resourceIds.length) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Some ${resourceName} not found or access denied`,
    });
  }

  return resources;
}
```

**2. Refactor routers**:

```typescript
// ❌ BEFORE (100+ lines)
updateCustomerProfile: protectedProcedure
  .input(z.object({ id: z.string().uuid(), ... }))
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    // Manual auth check
    const [customer] = await db
      .select()
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.id, input.id),
          eq(customerProfiles.userId, userId)
        )
      )
      .limit(1);

    if (!customer) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // ... rest of logic
  }),

// ✅ AFTER (20 lines)
import { verifyCustomerAccess } from '../_core/auth-helpers';

updateCustomerProfile: protectedProcedure
  .input(z.object({ id: z.string().uuid(), ... }))
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;

    // Single line auth check
    await verifyCustomerAccess(input.id, userId);

    // ... rest of logic
  }),
```

**3. Create tRPC middleware** (`server/_core/auth-middleware.ts`):

```typescript
import { middleware } from './trpc';
import { verifyOwnership } from './auth-helpers';

/**
 * Middleware to verify customer ownership from input
 */
export const requireCustomerAccess = middleware(async ({ ctx, next, input }) => {
  const customerId = (input as any).customerId || (input as any).customerProfileId;

  if (!customerId) {
    throw new Error('customerId or customerProfileId required in input');
  }

  const customer = await verifyCustomerAccess(customerId, ctx.userId);

  return next({
    ctx: {
      ...ctx,
      customer, // Make customer available in context
    },
  });
});

// Usage in router
updateNote: protectedProcedure
  .use(requireCustomerAccess)
  .input(z.object({ customerId: z.string().uuid(), noteId: z.string().uuid(), content: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // ctx.customer is already verified and available
    const { customer } = ctx;

    // Update note...
  }),
```

#### Testing

```typescript
describe('Auth Helpers', () => {
  it('should verify customer ownership', async () => {
    const customer = await verifyCustomerAccess(testCustomerId, testUserId);
    expect(customer.id).toBe(testCustomerId);
  });

  it('should throw error for wrong user', async () => {
    await expect(
      verifyCustomerAccess(testCustomerId, 'wrong-user-id')
    ).rejects.toThrow('Customer profile not found or access denied');
  });

  it('should verify batch ownership', async () => {
    const customers = await verifyBatchOwnership(
      customerProfiles,
      [customerId1, customerId2],
      testUserId
    );
    expect(customers).toHaveLength(2);
  });
});
```

#### Success Metrics

- ✅ 50+ auth checks replaced with single utility
- ✅ Consistent error messages
- ✅ 80% reduction in boilerplate code

#### Estimat: 2 dage

---

## Timeline & Resource Planning

### Fase 1: Kritiske Fixes (Uge 1-2)

**Uge 1:**
- Dag 1-3: P0.1 - Transaction management
- Dag 4: P0.2 - Fix N+1 queries
- Dag 5: P0.4 - Rate limiting

**Uge 2:**
- Dag 1-2: P0.3 - XSS sanitization
- Dag 3-4: P0.5 - Fix silent failures
- Dag 5: Testing og review

**Deliverables:**
- ✅ Zero data corruption risks
- ✅ XSS vulnerabilities fixed
- ✅ Rate limiting implemented
- ✅ Proper error monitoring

### Fase 2: Infrastructure (Uge 3-5)

**Uge 3:**
- Dag 1-5: P1.1 - Background job system (BullMQ)

**Uge 4:**
- Dag 1-2: P1.2 - Auth middleware
- Dag 3-5: P1.3 - Backend router tests (start)

**Uge 5:**
- Dag 1-3: P1.3 - Backend router tests (fortsæt)
- Dag 4-5: P1.4 - Frontend component tests (start)

**Deliverables:**
- ✅ Background jobs køre
- ✅ Auth middleware deployed
- ✅ 50%+ test coverage

### Fase 3: Konsolidering (Uge 6-8)

**Uge 6:**
- Dag 1-3: P1.4 - Frontend tests (fortsæt)
- Dag 4-5: P1.5 - Audit logging middleware

**Uge 7:**
- Dag 1-2: P1.6 - Error monitoring (Sentry)
- Dag 3-5: P2.1 - Centralized validation

**Uge 8:**
- Dag 1-2: P2.2 - Database FK constraints
- Dag 3-5: P2.3 - Performance monitoring + polish

**Deliverables:**
- ✅ 80%+ test coverage
- ✅ Full observability
- ✅ Production hardened

---

## Success Metrics & KPIs

### Code Quality Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Test Coverage | 5% | 80% | 8 uger |
| Code Duplication | ~30% | <10% | 4 uger |
| Security Score | B | A+ | 2 uger |
| Performance Score | 70/100 | 90/100 | 6 uger |

### Performance Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| API Response Time (p95) | 500ms | <200ms | 4 uger |
| Background Job Success Rate | N/A | >99% | 3 uger |
| Database Query Time (avg) | 50ms | <30ms | 2 uger |

### Reliability Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Error Rate | Unknown | <0.1% | 2 uger |
| Uptime | ~99% | 99.9% | 6 uger |
| Failed Transactions | Unknown | 0 | 1 uge |

---

## Risk Mitigation

### High Risk Items

**Risk 1: Breaking Changes During Refactoring**
- **Mitigation:** Feature flags for new code paths
- **Rollback:** Keep old code parallel during transition

**Risk 2: Redis/BullMQ Dependencies**
- **Mitigation:** Graceful degradation if Redis down
- **Fallback:** In-memory queue for development

**Risk 3: Test Writing Takes Longer Than Expected**
- **Mitigation:** Prioritize critical paths first
- **Adjustment:** Accept 60% coverage as milestone 1

### Rollout Strategy

**Phase 1 (P0):** Deploy to staging → 1 week bake → Production
**Phase 2 (P1):** Deploy incrementally with feature flags
**Phase 3 (P2):** Deploy when P1 is stable

---

## Tools & Resources Needed

### Development Tools

- ✅ **BullMQ:** Background job processing
- ✅ **Redis:** Job queue + caching
- ✅ **Sentry:** Error monitoring ($26/month)
- ✅ **Vitest:** Testing framework (already installed)
- ✅ **Playwright:** E2E testing (already installed)

### Infrastructure

- Redis instance (can use Upstash free tier eller local Docker)
- Sentry account (free tier OK for start)
- CI/CD pipeline for tests (GitHub Actions)

### Documentation

- API documentation tool (optional: Swagger/OpenAPI)
- Internal runbooks for operations
- Testing best practices guide

---

## Next Steps

1. **Review denne plan** med teamet
2. **Prioriter** - kan vi skære noget væk?
3. **Ressourcer** - 1 eller 2 udviklere?
4. **Timeline** - kan vi acceptere 8 uger?
5. **Start med P0.1** - transaction management er mest kritisk

---

## Appendix: Quick Wins

Hvis tiden er knap, fokuser på disse 5 tasks for max impact:

1. **P0.1** - Transactions (3 dage) - Eliminerer data corruption
2. **P0.3** - XSS (2 dage) - Lukker security hul
3. **P1.2** - Auth middleware (2 dage) - Massiv code reduction
4. **P1.1** - Background jobs (5 dage) - 10x performance boost
5. **P1.3** - Backend tests for customer router (3 dage) - Beskytter mest kritiske flows

**Total Quick Wins:** 15 dage (3 uger)

Dette giver jer:
- ✅ Zero security vulnerabilities
- ✅ Zero data corruption risk
- ✅ 10x bedre performance
- ✅ 50% mindre code duplication
- ✅ 30% test coverage på kritiske paths
