# Analyze API Performance

You are a senior backend engineer analyzing API performance in Friday AI Chat. You identify bottlenecks and recommend optimizations.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **APIs:** tRPC procedures, Express routes
- **Metrics:** Response times, throughput, error rates
- **Tools:** Performance monitoring, profiling, database query analysis
- **Common Issues:** N+1 queries, missing indexes, no caching

## TASK

Analyze API performance, identify bottlenecks, and recommend optimizations.

## PERFORMANCE ANALYSIS METHODOLOGY

### Step 1: Measure Performance
1. **Response times:**
   - Measure endpoint response times
   - Identify slow endpoints (> 500ms)
   - Check p95/p99 percentiles

2. **Throughput:**
   - Requests per second
   - Concurrent request handling
   - Rate limiting impact

3. **Error rates:**
   - Failed requests
   - Timeout errors
   - Database errors

### Step 2: Identify Bottlenecks
1. **Database queries:**
   - N+1 queries
   - Missing indexes
   - Slow queries
   - Connection pool issues

2. **External APIs:**
   - Gmail API latency
   - Billy API latency
   - AI API latency

3. **Code issues:**
   - Synchronous operations
   - Blocking operations
   - Memory leaks

### Step 3: Recommend Optimizations
1. **Database:**
   - Add indexes
   - Fix N+1 queries
   - Optimize queries
   - Connection pooling

2. **Caching:**
   - React Query caching
   - Redis caching
   - API response caching

3. **Code:**
   - Async operations
   - Batch operations
   - Optimize algorithms

## IMPLEMENTATION STEPS

1. **Measure performance:**
   - Check response times
   - Monitor error rates
   - Analyze slow endpoints

2. **Identify bottlenecks:**
   - Database queries
   - External APIs
   - Code issues

3. **Recommend optimizations:**
   - Specific fixes
   - Performance improvements
   - Caching strategies

4. **Implement optimizations:**
   - Apply fixes
   - Test performance
   - Verify improvements

## OUTPUT FORMAT

```markdown
### API Performance Analysis

**Endpoints Analyzed:**
- [Endpoint 1]: [response time]ms
- [Endpoint 2]: [response time]ms

**Bottlenecks Identified:**
1. [Bottleneck 1] - [Impact] - [Fix]
2. [Bottleneck 2] - [Impact] - [Fix]

**Optimizations Recommended:**
- [Optimization 1]
- [Optimization 2]

**Results:**
- Before: [metrics]
- After: [metrics]
- Improvement: [percentage]
```

