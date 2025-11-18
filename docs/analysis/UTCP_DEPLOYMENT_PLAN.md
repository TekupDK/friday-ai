# Detaljeret Deployment Plan: UTCP Integration

## Deployment Oversigt

**Hvad Deployes:**
- UTCP manifest system
- UTCP tool handler
- Migration af 18 tools til UTCP format
- Removal af MCP server dependency
- Performance monitoring

**Target Environment:**
- Staging (først)
- Production (efter validation)

**Estimated Downtime:**
- 0 minutter (gradual migration, no downtime)

**Deployment Window:**
- Staging: Anytime
- Production: Business hours (9-17 CET), low traffic period

## Pre-Deployment Checklist

### Code Quality
- [ ] TypeScript check: `pnpm check` - ⏳ TODO
- [ ] Linter: `pnpm lint` - ⏳ TODO
- [ ] Tests: `pnpm test` - ⏳ TODO
- [ ] Code review: ⏳ TODO

### Environment Verification
- [ ] Environment variabler verificeret
  - `GOOGLE_OAUTH_CLIENT_ID` - ✅ Eksisterer
  - `GOOGLE_OAUTH_CLIENT_SECRET` - ✅ Eksisterer
  - `BILLY_API_KEY` - ✅ Eksisterer
- [ ] Database migrations klar - ✅ Ingen nødvendig
- [ ] API keys verificeret - ✅ Eksisterer
- [ ] External services tilgængelige
  - Google Gmail API - ✅ Tilgængelig
  - Google Calendar API - ✅ Tilgængelig
  - Billy.dk API - ✅ Tilgængelig

### Infrastructure
- [ ] Server resources tilgængelige - ✅ Nuværende server OK
- [ ] Database backup oprettet - ⏳ TODO (before production)
- [ ] Monitoring konfigureret - ⏳ TODO
- [ ] Rollback plan klar - ✅ Se nedenfor

### Communication
- [ ] Team notificeret - ⏳ TODO
- [ ] Stakeholders informeret - ⏳ TODO
- [ ] Maintenance window planlagt - ✅ Ikke nødvendig (no downtime)

## Deployment Steps

### Step 1: Backup

```bash
# Database backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Code backup (git tag)
git tag backup-pre-utcp-$(date +%Y%m%d)
git push origin backup-pre-utcp-$(date +%Y%m%d)
```

**Verificering:**
- [ ] Backup successful
- [ ] Backup verified (test restore)

### Step 2: Pre-Deployment Checks

```bash
# Health check
curl https://api.staging.tekup.dk/health

# Dependency check
pnpm install --frozen-lockfile

# Type check
pnpm check

# Test suite
pnpm test
```

**Verificering:**
- [ ] All checks passing
- [ ] No blocking issues

### Step 3: Deployment (Staging)

```bash
# Build
pnpm build

# Deploy to staging
# (Depends on deployment method - Docker, PM2, etc.)

# Restart services
pm2 restart friday-ai-staging
# OR
docker-compose up -d --build
```

**Verificering:**
- [ ] Build successful
- [ ] Deployment successful
- [ ] Services running

### Step 4: Post-Deployment Verification (Staging)

```bash
# Health check
curl https://api.staging.tekup.dk/health

# Smoke tests
curl -X POST https://api.staging.tekup.dk/trpc/chat.sendMessage \
  -H "Content-Type: application/json" \
  -d '{"conversationId": 1, "content": "Test message"}'

# Tool execution test
# Test search_gmail via UTCP
```

**Verificering:**
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] No errors in logs
- [ ] Tool execution working

### Step 5: Monitoring (Staging)

- [ ] Monitor error rates
- [ ] Monitor performance metrics
  - Tool execution time
  - API response times
  - Error rates
- [ ] Monitor user activity
- [ ] Check alerting

**Monitoring Period:** 24-48 hours

### Step 6: Production Deployment

**After Staging Validation:**

```bash
# Same steps as staging
# 1. Backup
# 2. Pre-deployment checks
# 3. Deploy
# 4. Verify
# 5. Monitor
```

**Verificering:**
- [ ] All staging checks passed
- [ ] No critical issues in staging
- [ ] Team approval received

## Rollback Plan

### Rollback Triggers

- [ ] Error rate > 5%
- [ ] Performance degradation > 20%
- [ ] Critical bug discovered
- [ ] User complaints
- [ ] Tool execution failures > 10%

### Rollback Steps

```bash
# Step 1: Stop new traffic (if using load balancer)
# Update load balancer to route away from new version

# Step 2: Rollback code
git checkout backup-pre-utcp-$(date +%Y%m%d)
git push origin main

# Step 3: Restore database (if needed)
# psql -h $DB_HOST -U $DB_USER -d $DB_NAME < backup_*.sql
# NOTE: Usually not needed for this deployment

# Step 4: Restart services
pm2 restart friday-ai-production
# OR
docker-compose up -d --build

# Step 5: Verify rollback
curl https://api.tekup.dk/health
```

**Verificering:**
- [ ] Rollback successful
- [ ] Services running
- [ ] No data loss
- [ ] Error rates normalized

### Rollback Time Estimate

- **Code Rollback:** 5-10 minutes
- **Service Restart:** 2-5 minutes
- **Verification:** 5-10 minutes
- **Total:** 15-25 minutes

## Monitoring og Alerting

### Key Metrics

- **Error Rate:** Target < 1%
- **Tool Execution Time:** Target < 500ms (p95)
- **API Response Time:** Target < 200ms (p95)
- **Throughput:** Target > 100 req/min
- **Uptime:** Target > 99.9%

### Alerting Rules

- **High Error Rate:** Error rate > 5% for 5 minutes → Page on-call
- **Performance Degradation:** P95 latency > 1000ms for 10 minutes → Alert
- **Tool Failures:** Tool execution failure rate > 10% → Alert
- **API Errors:** External API error rate > 5% → Alert

### Monitoring Dashboard

- **Dashboard URL:** (To be created)
- **Key metrics to watch:**
  - Tool execution times (UTCP vs MCP)
  - Error rates by tool
  - API response times
  - User activity

## Risk Assessment

### Identified Risks

1. **Tool Execution Failures**
   - **Probability:** Medium
   - **Impact:** High
   - **Mitigation:** 
     - Gradual migration (2-3 tools at a time)
     - Keep MCP fallback during migration
     - Comprehensive testing before production

2. **Performance Regression**
   - **Probability:** Low
   - **Impact:** Medium
   - **Mitigation:**
     - Benchmark before/after
     - Monitor closely after deployment
     - Quick rollback if needed

3. **Authentication Issues**
   - **Probability:** Low
   - **Impact:** High
   - **Mitigation:**
     - Test OAuth flows thoroughly
     - Keep existing auth mechanisms
     - Monitor auth errors

4. **Data Loss**
   - **Probability:** Very Low
   - **Impact:** Critical
   - **Mitigation:**
     - No database schema changes
     - Backup before deployment
     - Read-only tools first

### Mitigation Strategies

- **Feature Flags:** Enable UTCP per tool gradually
- **Canary Deployment:** Deploy to small user subset first
- **Monitoring:** Real-time monitoring and alerting
- **Rollback:** Quick rollback procedure ready

## Post-Deployment Tasks

### Immediate (First Hour)

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify critical features
  - Gmail search
  - Calendar events
  - Invoice creation
- [ ] Review logs for errors

### Short-term (First Day)

- [ ] User feedback review
- [ ] Performance analysis
  - Compare UTCP vs MCP performance
  - Identify bottlenecks
- [ ] Error analysis
  - Review all errors
  - Fix critical issues
- [ ] Documentation update
  - Update tool documentation
  - Update architecture docs

### Long-term (First Week)

- [ ] Performance optimization
  - Cache frequently used tools
  - Optimize slow tools
- [ ] Bug fixes
  - Address any issues found
- [ ] Feature improvements
  - Add missing tools to UTCP
  - Improve error messages
- [ ] Lessons learned
  - Document what went well
  - Document improvements needed

## Success Criteria

- [ ] Zero critical errors in first 24 hours
- [ ] Performance within targets (p95 < 500ms)
- [ ] All tools working correctly
- [ ] User satisfaction maintained
- [ ] 32% performance improvement achieved
- [ ] MCP dependency removed

## Anbefalinger

1. **Best Practices:**
   - Gradual migration (2-3 tools at a time)
   - Comprehensive testing at each stage
   - Monitor closely during migration
   - Keep MCP fallback until 100% migrated

2. **Optimizations:**
   - Cache tool results where possible
   - Parallel tool execution for multi-tool requests
   - Optimize slow tools first

3. **Future Improvements:**
   - UTCP tool registry with versioning
   - Automated tool testing
   - Performance benchmarking dashboard

