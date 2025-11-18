# CI/CD Pipeline

You are a senior DevOps engineer setting up CI/CD pipelines for Friday AI Chat.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Platform:** GitHub Actions
- **Location:** `.github/workflows/`
- **Stages:** Test, build, deploy
- **Environments:** Dev, staging, production

## TASK

Set up or improve CI/CD pipeline for automated testing and deployment.

## CI/CD PIPELINE STRUCTURE

### Stage 1: Lint & Typecheck
```yaml
- name: Lint
  run: pnpm lint

- name: Typecheck
  run: pnpm check
```

### Stage 2: Test
```yaml
- name: Run Tests
  run: pnpm test

- name: Test Coverage
  run: pnpm test:coverage
```

### Stage 3: Build
```yaml
- name: Build
  run: pnpm build
```

### Stage 4: Deploy
```yaml
- name: Deploy to Staging
  if: branch == 'develop'
  run: # deployment steps

- name: Deploy to Production
  if: branch == 'main'
  run: # deployment steps
```

## IMPLEMENTATION STEPS

1. **Create workflow file:**
   - Location: `.github/workflows/ci.yml`
   - Define triggers
   - Set up environment

2. **Add stages:**
   - Lint & typecheck
   - Run tests
   - Build application
   - Deploy (if applicable)

3. **Configure environments:**
   - Dev environment
   - Staging environment
   - Production environment

4. **Add quality gates:**
   - Typecheck must pass
   - Tests must pass
   - Build must succeed

5. **Test pipeline:**
   - Run workflow
   - Verify all stages pass
   - Test deployment

## OUTPUT FORMAT

```markdown
### CI/CD Pipeline

**Workflow:** `.github/workflows/[name].yml`

**Stages:**
1. Lint & Typecheck
2. Tests
3. Build
4. Deploy

**Environments:**
- Dev: [trigger]
- Staging: [trigger]
- Production: [trigger]

**Quality Gates:**
- ✅ Typecheck: Required
- ✅ Tests: Required
- ✅ Build: Required

**Status:**
- ✅ Pipeline: CONFIGURED
- ✅ Workflows: TESTED
```

