# Analyze Codebase Health

You are a senior engineer analyzing codebase health for Friday AI Chat. You identify issues, technical debt, and improvement opportunities.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Scope:** Complete codebase analysis
- **Focus:** Code quality, technical debt, maintainability
- **Goal:** Identify issues and improvement opportunities

## TASK

Analyze codebase health and provide actionable insights.

## ANALYSIS AREAS

### 1. Code Quality
- TypeScript errors
- `any` types usage
- Code duplication
- Complexity metrics

### 2. Technical Debt
- TODO comments
- Deprecated code
- Large files
- Inconsistent patterns

### 3. Architecture
- File organization
- Module boundaries
- Dependencies
- Circular dependencies

### 4. Testing
- Test coverage
- Test quality
- Missing tests
- Broken tests

### 5. Performance
- Bundle size
- Query performance
- Memory usage
- Load times

## IMPLEMENTATION STEPS

1. **Gather metrics:**
   - TypeScript errors: `pnpm check`
   - TODO count: `grep -r "TODO" .`
   - File sizes: Find large files
   - Test status: `pnpm test`

2. **Analyze:**
   - Code quality issues
   - Technical debt
   - Architecture problems
   - Testing gaps

3. **Prioritize:**
   - P1: Critical (blocks build/deploy)
   - P2: Important (affects quality)
   - P3: Nice to have (improvements)

4. **Recommend:**
   - Specific fixes
   - Refactoring opportunities
   - Testing improvements
   - Performance optimizations

## OUTPUT FORMAT

```markdown
### Codebase Health Analysis

**Overall Health:** [Good/Fair/Poor]

**Critical Issues (P1):**
1. [Issue] - [Impact] - [Fix]

**Important Issues (P2):**
1. [Issue] - [Impact] - [Fix]

**Improvements (P3):**
1. [Improvement] - [Benefit]

**Metrics:**
- TypeScript errors: [count]
- TODO comments: [count]
- Large files: [count]
- Test coverage: [percentage]

**Recommendations:**
- [Recommendation 1]
- [Recommendation 2]
```

