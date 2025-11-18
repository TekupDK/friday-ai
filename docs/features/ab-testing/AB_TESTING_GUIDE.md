# A/B Testing Framework Guide

**Author:** TekupDK Development Team  
**Last Updated:** January 28, 2025  
**Version:** 1.0.0

---

## Overview

The A/B Testing Framework enables controlled rollout and comparison of different features, flows, and configurations in Friday AI Chat. It provides database-backed metrics storage, statistical analysis, and consistent user assignment.

---

## Architecture

### Components

1. **Test Configuration** (`server/_core/ab-testing.ts`)
   - Test definitions and traffic splitting
   - User group assignment
   - Metrics recording

2. **Database Schema** (`drizzle/schema.ts`)
   - `ab_test_metrics` table for metrics storage
   - Indexed for efficient querying
   - Supports multiple concurrent tests

3. **Metrics Analysis**
   - Statistical significance calculation
   - Test result recommendations
   - Historical data retrieval

---

## Database Schema

```typescript
export const abTestMetricsInFridayAi = fridayAi.table(
  "ab_test_metrics",
  {
    id: serial().primaryKey().notNull(),
    testName: varchar({ length: 100 }).notNull(),
    userId: integer().notNull(),
    testGroup: varchar({ length: 20 }).notNull(), // "control" | "variant"
    responseTime: integer().notNull(), // milliseconds
    userSatisfaction: integer(), // 1-5 rating, optional
    errorCount: integer().default(0).notNull(),
    messageCount: integer().default(0).notNull(),
    completionRate: numeric({ precision: 5, scale: 2 }).notNull(), // 0-100 percentage
    metadata: jsonb(), // Additional test-specific data
    timestamp: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  table => [
    // Indexes for efficient querying
    index("idx_ab_test_metrics_test_name"),
    index("idx_ab_test_metrics_user_id"),
    index("idx_ab_test_metrics_timestamp"),
    index("idx_ab_test_metrics_test_group"), // Composite index
  ]
);
```

---

## API Reference

### `getTestGroup(userId: number, testName: string): "control" | "variant" | "excluded"`

Determines which test group a user belongs to based on consistent hashing.

**Parameters:**
- `userId` - User ID for assignment
- `testName` - Name of the test

**Returns:**
- `"control"` - User in control group
- `"variant"` - User in variant group
- `"excluded"` - User not in test

**Example:**
```typescript
const group = getTestGroup(userId, "chat_flow_migration");
if (group === "variant") {
  // Use new flow
} else {
  // Use old flow
}
```

---

### `recordTestMetrics(metrics: TestMetrics, db?: Database): Promise<void>`

Records A/B test metrics to the database.

**Parameters:**
- `metrics` - Test metrics object
- `db` - Optional database connection

**Metrics Object:**
```typescript
interface TestMetrics {
  userId: number;
  testGroup: "control" | "variant";
  responseTime: number; // milliseconds
  userSatisfaction?: number; // 1-5 rating
  errorCount: number;
  messageCount: number;
  completionRate: number; // 0-100
  timestamp: Date;
}
```

**Example:**
```typescript
await recordTestMetrics({
  userId: 1,
  testGroup: "variant",
  responseTime: 250,
  userSatisfaction: 5,
  errorCount: 0,
  messageCount: 1,
  completionRate: 100,
  timestamp: new Date()
}, db);
```

---

### `calculateTestResults(testName: string, db?: Database): Promise<ABTestResult | null>`

Calculates test results and provides recommendations.

**Parameters:**
- `testName` - Name of the test
- `db` - Optional database connection

**Returns:**
```typescript
interface ABTestResult {
  testName: string;
  controlMetrics: TestMetrics[];
  variantMetrics: TestMetrics[];
  statisticalSignificance: number;
  recommendation: "keep_control" | "deploy_variant" | "continue_test";
}
```

**Example:**
```typescript
const results = await calculateTestResults("chat_flow_migration", db);
if (results?.recommendation === "deploy_variant") {
  // Deploy new flow to all users
}
```

---

## Current Tests

### 1. Chat Flow Migration

**Test Name:** `chat_flow_migration`  
**Status:** ✅ Active  
**Traffic Split:** 10% variant  
**Purpose:** Rollout server-side chat flow

**Metrics Tracked:**
- Response time
- Error rate
- User satisfaction
- Completion rate

---

### 2. Streaming Enabled

**Test Name:** `streaming_enabled`  
**Status:** ⏸️ Disabled  
**Traffic Split:** 5% variant (when enabled)  
**Purpose:** Test streaming response performance

**Metrics Tracked:**
- Perceived response time
- User satisfaction
- Engagement

---

### 3. Model Routing

**Test Name:** `model_routing`  
**Status:** ⏸️ Disabled  
**Traffic Split:** 20% variant (when enabled)  
**Purpose:** Optimize model selection

**Metrics Tracked:**
- Response quality
- Cost efficiency
- Task completion rate

---

## Usage Examples

### Basic Usage

```typescript
import { getTestGroup, recordTestMetrics } from "./_core/ab-testing";

// Get user's test group
const group = getTestGroup(userId, "chat_flow_migration");

// Use test group to determine behavior
if (group === "variant") {
  // New implementation
  const result = await newChatFlow(message);
} else {
  // Old implementation
  const result = await oldChatFlow(message);
}

// Record metrics
await recordTestMetrics({
  userId,
  testGroup: group,
  responseTime: result.responseTime,
  errorCount: result.errors,
  messageCount: 1,
  completionRate: result.success ? 100 : 0,
  timestamp: new Date()
}, db);
```

### Feature Flags Integration

```typescript
import { getFeatureFlagsWithABTest } from "./_core/ab-testing";

const flags = getFeatureFlagsWithABTest(userId);

if (flags.useServerSideChat) {
  // Use server-side chat (variant)
} else {
  // Use client-side chat (control)
}
```

---

## Best Practices

1. **Consistent Assignment:** Users are consistently assigned to the same group using hashing
2. **Metrics Recording:** Always record metrics after test interactions
3. **Error Handling:** Metrics recording failures should not break the flow
4. **Statistical Significance:** Wait for sufficient sample size before making decisions
5. **Gradual Rollout:** Start with small traffic splits and increase gradually

---

## Troubleshooting

### Metrics Not Recording

**Problem:** Metrics not appearing in database

**Solutions:**
- Check database connection is passed to `recordTestMetrics`
- Verify test name matches configuration
- Check error logs for database errors

### Inconsistent Group Assignment

**Problem:** User assigned to different groups on different requests

**Solutions:**
- Ensure `userId` is consistent
- Verify test name is spelled correctly
- Check test configuration is not changing

### Low Statistical Significance

**Problem:** Test results show low significance

**Solutions:**
- Wait for more data
- Increase traffic split
- Check for data quality issues

---

## Migration Guide

### Adding a New Test

1. **Add test configuration:**
```typescript
const AB_TESTS: Record<string, ABTestConfig> = {
  my_new_test: {
    testName: "my_new_test",
    enabled: true,
    trafficSplit: 0.1, // 10%
    startDate: new Date(),
    metrics: ["response_time", "error_rate"],
  },
};
```

2. **Use test group in code:**
```typescript
const group = getTestGroup(userId, "my_new_test");
if (group === "variant") {
  // New behavior
}
```

3. **Record metrics:**
```typescript
await recordTestMetrics({
  userId,
  testGroup: group,
  // ... metrics
}, db);
```

---

## References

- `server/_core/ab-testing.ts` - Implementation
- `drizzle/schema.ts` - Database schema
- `docs/CODE_REVIEW_2025-01-28_SPRINT.md` - Code review

---

**Last Updated:** January 28, 2025  
**Maintained by:** TekupDK Development Team

