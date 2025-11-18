---
name: deploy-to-staging
description: "[development] Deploy to Staging - You are deploying the application to the staging environment."
argument-hint: Optional input or selection
---

# Deploy to Staging

You are deploying the application to the staging environment.

## TASK

Safely deploy code changes to staging for testing.

## STEPS

1) Pre-deployment checks:
   - Run typecheck: `pnpm check`
   - Run tests: `pnpm test`
   - Run linting: `pnpm lint`
   - Review changes

2) Database migration:
   - Check for migrations needed
   - Run `pnpm db:migrate:staging` if needed
   - Verify migration success
   - Backup database

3) Build the application:
   - Run `pnpm build`
   - Verify build succeeds
   - Check for build warnings
   - Review bundle size

4) Deploy to staging:
   - Follow deployment process
   - Update environment variables
   - Restart services
   - Verify deployment

5) Post-deployment verification:
   - Health check endpoints
   - Test critical features
   - Check logs for errors
   - Verify database connectivity
   - Test API endpoints

6) Monitor:
   - Watch error logs
   - Monitor performance
   - Check for regressions
   - Verify integrations work

## OUTPUT

Provide:
- Pre-deployment checks passed
- Migration status
- Build results
- Deployment status
- Verification results
- Any issues found

