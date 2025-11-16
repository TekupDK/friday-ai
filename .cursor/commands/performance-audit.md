# Performance Audit

You are performing a performance-focused review.

## TASK

Identify performance risks in the current changes.

## STEPS

1) Look for:
   - New loops over large collections
   - Nested loops
   - N+1 queries
   - Heavy computations on hot paths
   - Large data sent over network
2) Suggest:
   - Caching
   - Precomputation
   - Pagination
   - Batched operations

## OUTPUT

Provide:
- Potential performance issues
- Proposed optimizations
- Any trade-off commentary.

