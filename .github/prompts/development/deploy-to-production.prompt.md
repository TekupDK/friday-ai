---
name: deploy-to-production
description: "[development] Deploy to Production - You are deploying the application to production."
argument-hint: Optional input or selection
---

# Deploy to Production

You are deploying the application to production.

## TASK

Safely deploy code changes to production with zero downtime.

## STEPS

1) Pre-deployment checklist:
   - All tests passing
   - Code review approved
   - Security review done
   - Performance tested
   - Documentation updated

2) Database migration:
   - Review migration scripts
   - Backup production database: `pnpm backup:db`
   - Test migration on staging first
   - Run `pnpm db:migrate:prod`
   - Verify migration success

3) Build production:
   - Run `pnpm build`
   - Verify production build
   - Check bundle optimization
   - Review build output

4) Deploy:
   - Follow production deployment process
   - Use blue-green or rolling deployment
   - Update environment variables
   - Restart services gracefully

5) Post-deployment verification:
   - Health checks pass
   - Critical features work
   - No error spikes in logs
   - Performance metrics normal
   - Integrations functional

6) Monitor closely:
   - Watch error rates
   - Monitor response times
   - Check resource usage
   - Verify business metrics
   - Be ready to rollback

## OUTPUT

Provide:
- Deployment checklist completed
- Migration status
- Deployment successful
- Verification results
- Monitoring status
- Rollback plan (if needed)

