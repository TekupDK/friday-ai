# Build Optimization

You are a senior build engineer optimizing build process for Friday AI Chat.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Build Tools:** Vite, esbuild
- **Config:** `vite.config.ts`
- **Focus:** Build speed, bundle size, optimization
- **Metrics:** Build time, bundle size, chunk splitting

## TASK

Optimize build process for faster builds and smaller bundles.

## BUILD OPTIMIZATION STRATEGIES

### 1. Chunk Splitting
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom'],
        'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'trpc-vendor': ['@trpc/client', '@trpc/server'],
      },
    },
  },
}
```

### 2. Code Splitting
- Lazy load routes
- Lazy load heavy components
- Split vendor bundles

### 3. Tree Shaking
- Remove unused code
- Use ES modules
- Configure sideEffects

### 4. Build Speed
- Optimize dependencies
- Use esbuild for faster builds
- Parallel builds

## IMPLEMENTATION STEPS

1. **Analyze current build:**
   - Check build time
   - Analyze bundle size
   - Review chunk splitting

2. **Optimize chunk splitting:**
   - Configure manual chunks
   - Split vendor bundles
   - Optimize code splitting

3. **Reduce bundle size:**
   - Tree shake unused code
   - Remove unnecessary dependencies
   - Optimize imports

4. **Improve build speed:**
   - Optimize dependencies
   - Use esbuild
   - Parallel builds

5. **Test and verify:**
   - Measure before/after
   - Test build output
   - Verify functionality

## OUTPUT FORMAT

```markdown
### Build Optimization

**Current Metrics:**
- Build time: [time]
- Bundle size: [size]
- Chunks: [count]

**Optimizations Applied:**
- [Optimization 1]
- [Optimization 2]

**Results:**
- Build time: [before] → [after] ([improvement]%)
- Bundle size: [before] → [after] ([improvement]%)
- Chunks: [before] → [after]

**Files Modified:**
- `vite.config.ts` - [changes]
```

