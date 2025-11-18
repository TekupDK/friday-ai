# Health Check Endpoints

**Author:** Cursor AI  
**Last Updated:** November 16, 2025  
**Version:** 1.0.0

## Overview

Health check endpoints provide monitoring and deployment verification capabilities for Friday AI Chat. These endpoints are essential for:

- **Load Balancer Health Checks:** Basic liveness verification
- **Kubernetes Readiness Probes:** Dependency verification before accepting traffic
- **Monitoring Systems:** Integration with external monitoring tools
- **Deployment Verification:** Ensuring services are ready after deployment

## Endpoints

### GET `/api/health`

Basic health check endpoint that always returns 200 if the server is running.

**Purpose:** Used by load balancers and basic monitoring to verify the server process is alive.

**Response:** Always returns HTTP 200

**Response Body:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T11:00:00.000Z",
  "uptime": 3600,
  "version": "2.0.0",
  "environment": "production",
  "responseTime": "2ms"
}
```

**Fields:**

- `status` (string): Always `"healthy"` if server is running
- `timestamp` (string): ISO 8601 timestamp of the check
- `uptime` (number): Server uptime in seconds
- `version` (string): Application version from package.json
- `environment` (string): Node environment (development/production)
- `responseTime` (string): Time taken to generate response (e.g., "2ms")

**Example Usage:**

```bash
# Basic health check
curl http://localhost:3000/api/health

# With jq for formatted output
curl -s http://localhost:3000/api/health | jq
```

**Use Cases:**

- Load balancer health checks (every 5-10 seconds)
- Basic uptime monitoring
- Simple "is the server running?" checks

---

### GET `/api/ready`

Readiness check endpoint that verifies all critical dependencies are available.

**Purpose:** Used by Kubernetes readiness probes to determine if the pod should receive traffic.

**Response:**

- HTTP 200 if all dependencies are ready
- HTTP 503 if any critical dependency is unavailable

**Response Body (Ready):**

```json
{
  "status": "ready",
  "timestamp": "2025-11-16T11:00:00.000Z",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 15
    },
    "redis": {
      "status": "ok",
      "responseTime": 8
    }
  }
}
```

**Response Body (Not Ready):**

```json
{
  "status": "not_ready",
  "timestamp": "2025-11-16T11:00:00.000Z",
  "checks": {
    "database": {
      "status": "error",
      "message": "Database connection not available"
    },
    "redis": {
      "status": "not_configured",
      "message": "Redis not configured (using in-memory fallback)"
    }
  }
}
```

**Check Statuses:**

**Database:**

- `ok`: Database connection successful, query executed
- `error`: Database unavailable or query failed

**Redis:**

- `ok`: Redis connection successful, ping successful
- `not_configured`: Redis not configured (acceptable, uses in-memory fallback)
- `error`: Redis configured but connection failed

**Fields:**

- `status` (string): `"ready"` or `"not_ready"`
- `timestamp` (string): ISO 8601 timestamp of the check
- `checks.database.status` (string): Database health status
- `checks.database.responseTime` (number, optional): Database query time in milliseconds
- `checks.database.message` (string, optional): Error message if status is "error"
- `checks.redis.status` (string): Redis health status
- `checks.redis.responseTime` (number, optional): Redis ping time in milliseconds
- `checks.redis.message` (string, optional): Status message

**Readiness Logic:**

- Returns `ready` if:
  - Database status is `ok`
  - Redis status is `ok` OR `not_configured` (Redis is optional)
- Returns `not_ready` if:
  - Database status is `error`
  - Redis status is `error` (when configured but failing)

**Example Usage:**

```bash
# Readiness check
curl http://localhost:3000/api/ready

# Check status only
curl -s http://localhost:3000/api/ready | jq -r '.status'

# Check specific dependency
curl -s http://localhost:3000/api/ready | jq '.checks.database'
```

**Use Cases:**

- Kubernetes readiness probes
- Deployment verification
- Dependency health monitoring
- Pre-flight checks before accepting traffic

---

## Architecture

### Implementation

**Location:** `server/routes/health.ts`

**Integration:** Registered in `server/_core/index.ts`:

```typescript
// Health check endpoints
const healthApi = (await import("../routes/health")).default;
app.use("/api", healthApi);
```

### Dependency Checks

**Database Check:**

```typescript
const db = await getDb();
if (db) {
  await db.execute(sql`SELECT 1`);
  // Status: ok
}
```

- Uses Drizzle ORM connection
- Executes simple `SELECT 1` query
- Measures response time
- Handles connection errors gracefully

**Redis Check:**

```typescript
const redis = getRedisClient();
await redis.ping();
// Status: ok
```

- Uses Upstash Redis client
- Executes `PING` command
- Measures response time
- Handles "not configured" as acceptable state
- Falls back gracefully if Redis unavailable

### Error Handling

All dependency checks use try-catch blocks to prevent health check failures from crashing the server:

```typescript
try {
  // Check dependency
  checks.dependency = { status: "ok", responseTime: ... };
} catch (error) {
  logger.error({ err: error }, "[Health] Dependency check failed");
  checks.dependency = { status: "error", message: error.message };
}
```

---

## Usage Examples

### Kubernetes Deployment

**Liveness Probe:**

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Readiness Probe:**

```yaml
readinessProbe:
  httpGet:
    path: /api/ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

### Load Balancer Configuration

**AWS Application Load Balancer:**

```json
{
  "HealthCheckPath": "/api/health",
  "HealthCheckIntervalSeconds": 30,
  "HealthCheckTimeoutSeconds": 5,
  "HealthyThresholdCount": 2,
  "UnhealthyThresholdCount": 3
}
```

### Monitoring Integration

**Prometheus Alert:**

```yaml
groups:
  - name: health_checks
    rules:
      - alert: ServiceDown
        expr: up{job="friday-ai"} == 0
        for: 1m
        annotations:
          summary: "Friday AI service is down"
```

**Custom Monitoring Script:**

```bash
#!/bin/bash
HEALTH_URL="http://localhost:3000/api/health"
READY_URL="http://localhost:3000/api/ready"

# Check basic health
if curl -f -s "$HEALTH_URL" > /dev/null; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# Check readiness
READY_STATUS=$(curl -s "$READY_URL" | jq -r '.status')
if [ "$READY_STATUS" = "ready" ]; then
  echo "✅ Readiness check passed"
else
  echo "❌ Readiness check failed: $READY_STATUS"
  exit 1
fi
```

---

## Testing

### Unit Tests

**Location:** `server/routes/__tests__/health.test.ts`

**Test Coverage:**

- ✅ Health endpoint returns 200
- ✅ Health endpoint includes all required fields
- ✅ Readiness endpoint returns 200 or 503
- ✅ Readiness endpoint includes dependency checks
- ✅ Response times are included when checks pass

**Run Tests:**

```bash
pnpm test server/routes/__tests__/health.test.ts
```

### Manual Testing

**Test Health Endpoint:**

```bash
# Should return 200
curl -v http://localhost:3000/api/health
```

**Test Readiness Endpoint:**

```bash
# Should return 200 if dependencies available
curl -v http://localhost:3000/api/ready

# Check specific dependency
curl -s http://localhost:3000/api/ready | jq '.checks.database'
```

---

## Troubleshooting

### Health Endpoint Returns 500

**Problem:** Server is crashing or endpoint has errors.

**Solution:**

1. Check server logs for errors
2. Verify Express app is properly initialized
3. Check if health route is registered correctly

### Readiness Endpoint Returns 503

**Problem:** Critical dependencies are unavailable.

**Diagnosis:**

```bash
curl -s http://localhost:3000/api/ready | jq '.checks'
```

**Common Issues:**

**Database Error:**

- Check `DATABASE_URL` environment variable
- Verify database server is running
- Check network connectivity
- Review database connection logs

**Redis Error (when configured):**

- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Verify Redis service is accessible
- Check network connectivity
- Note: `not_configured` is acceptable (uses in-memory fallback)

### Slow Response Times

**Problem:** Health checks are taking too long.

**Investigation:**

```bash
# Check response times
curl -s http://localhost:3000/api/ready | jq '.checks | to_entries | map({key, value: .value.responseTime})'
```

**Solutions:**

- Database: Check connection pool, query performance
- Redis: Check network latency, Redis server performance
- Consider increasing timeout in monitoring systems

### Monitoring False Positives

**Problem:** Health checks pass but service is actually down.

**Solution:**

- Use `/api/ready` instead of `/api/health` for critical checks
- Implement additional application-level checks
- Monitor application logs, not just health endpoints
- Set appropriate failure thresholds

---

## Best Practices

### 1. Use Appropriate Endpoint

- **Liveness:** Use `/api/health` (always returns 200 if server running)
- **Readiness:** Use `/api/ready` (checks dependencies)

### 2. Set Reasonable Timeouts

- Health checks should complete in < 100ms
- Set monitoring timeouts to 5-10 seconds
- Don't block health checks on slow operations

### 3. Monitor Both Endpoints

- Track `/api/health` for basic uptime
- Track `/api/ready` for dependency health
- Alert on readiness failures, not just health failures

### 4. Don't Overload

- Health checks should be lightweight
- Don't perform expensive operations
- Cache results if needed (not implemented currently)

### 5. Log Appropriately

- Health checks are logged at info level
- Dependency failures are logged at error level
- Don't log every health check (too verbose)

---

## Future Enhancements

### Potential Improvements

1. **Additional Checks:**
   - External API availability (Gmail, Billy)
   - Disk space monitoring
   - Memory usage checks

2. **Caching:**
   - Cache dependency check results (1-5 seconds)
   - Reduce database/Redis load from frequent checks

3. **Metrics:**
   - Export Prometheus metrics
   - Track health check response times
   - Monitor dependency availability

4. **Detailed Status:**
   - Include version information
   - Include build timestamp
   - Include git commit hash

---

## Related Documentation

- [Architecture Overview](../../ARCHITECTURE.md) - System architecture
- [API Reference](../../API_REFERENCE.md) - Complete API documentation
- [Development Guide](../../DEVELOPMENT_GUIDE.md) - Development setup
- [Error Handling](../../development-notes/fixes/ERROR_HANDLING_GUIDE.md) - Error handling patterns

---

**Last Updated:** November 16, 2025  
**Maintained by:** TekupDK Development Team
