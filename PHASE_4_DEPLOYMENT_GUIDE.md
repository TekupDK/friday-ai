# 🚀 Phase 4 - Production Deployment Guide

**Status:** Ready for Deployment  
**Date:** November 8, 2025  
**Version:** 1.0.0

---

## 📋 Overview

This guide covers the gradual rollout of OpenRouter AI models (GLM-4.5 Air & GPT-OSS 20B) to production.

**Rollout Strategy:** 0% → 10% → 50% → 100%

---

## ✅ Pre-Deployment Checklist

### 1. **Phase 3 Complete** ✅
- [x] All tests passed (98% success rate)
- [x] Performance benchmarked (0.9s avg response time)
- [x] Documentation complete (3500+ lines)
- [x] Models validated (GLM-4.5 Air + GPT-OSS 20B)

### 2. **Infrastructure Ready**
- [x] Feature flag system implemented
- [x] Metrics tracking system deployed
- [x] Monitoring API endpoints created
- [x] Gradual rollout logic tested
- [x] Fallback to Gemma 3 27B configured

### 3. **Environment Configuration**
- [ ] Production `.env` file updated
- [ ] `OPENROUTER_ROLLOUT_PERCENTAGE` set to `0`
- [ ] `OPENROUTER_API_KEY` configured
- [ ] All secrets verified

---

## 🎯 Deployment Steps

### **Step 1: Staging Deployment** (Day 0)

**Duration:** 2-4 hours

#### 1.1 Prepare Code

```bash
# Ensure all changes are committed
git status

# Commit if needed
git add .
git commit -m "feat(phase-4): OpenRouter rollout system with metrics"

# Push to staging branch
git push origin staging
```

#### 1.2 Configure Staging Environment

```bash
# Update staging .env file
OPENROUTER_ROLLOUT_PERCENTAGE=100  # Full rollout in staging
FORCE_OPENROUTER=false
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
```

#### 1.3 Deploy to Staging

```bash
# Build application
npm run build

# Deploy to staging server (adjust based on your setup)
# Example with Docker:
docker build -t friday-ai-staging .
docker push friday-ai-staging

# Or manual deployment:
npm run deploy:staging
```

#### 1.4 Verify Staging Deployment

```bash
# Check server is running
curl https://staging.your-domain.com/health

# Test AI endpoints
curl -X POST https://staging.your-domain.com/api/trpc/aiMetrics.getRolloutStatus \
  -H "Authorization: Bearer $YOUR_TOKEN"

# Expected response:
# {
#   "currentPercentage": 100,
#   "enabled": true,
#   "totalRequests": 0,
#   "avgResponseTime": 0
# }
```

#### 1.5 Run Smoke Tests

**Test 1: Chat Functionality**
```bash
# Open staging app
# Navigate to chat
# Send message: "Hej, hvordan kan du hjælpe mig?"
# Verify: Fast response (< 2s), excellent Danish
```

**Test 2: Email Drafting**
```bash
# Navigate to email section
# Try drafting an email
# Verify: Professional tone, correct Danish grammar
```

**Test 3: Check Metrics**
```bash
# API call to check metrics
curl https://staging.your-domain.com/api/trpc/aiMetrics.getSummary?lastMinutes=60
```

**Success Criteria:**
- ✅ All features working
- ✅ Response time < 3s
- ✅ No errors in logs
- ✅ Metrics tracking working

---

### **Step 2: 10% Production Rollout** (Day 1-2)

**Duration:** 48 hours monitoring

#### 2.1 Update Production Environment

```bash
# SSH into production server
ssh production-server

# Edit .env file
nano .env
```

Update these variables:
```bash
OPENROUTER_ROLLOUT_PERCENTAGE=10  # 10% of users
FORCE_OPENROUTER=false
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
```

#### 2.2 Deploy to Production

```bash
# Build and deploy
npm run build
npm run deploy:production

# Or with Docker
docker build -t friday-ai-production .
docker push friday-ai-production
docker-compose up -d
```

#### 2.3 Verify Deployment

```bash
# Check rollout status
curl https://your-domain.com/api/trpc/aiMetrics.getRolloutStatus

# Expected response:
# {
#   "currentPercentage": 10,
#   "enabled": true  # (for 10% of users)
# }
```

#### 2.4 Monitor Metrics (48 hours)

**Every 6 Hours:**
```bash
# Get metrics summary
curl https://your-domain.com/api/trpc/aiMetrics.getSummary?lastMinutes=360
```

**Check:**
- Error rate: Should be < 1%
- Avg response time: Should be < 3s
- User feedback: Monitor support tickets
- Model breakdown: Verify GLM & GPT-OSS usage

**Thresholds:**
| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | > 1% | > 5% |
| Avg Response Time | > 3s | > 5s |
| P95 Response Time | > 5s | > 10s |

#### 2.5 Decision Point (After 48h)

**If all metrics healthy:**
```bash
✅ Proceed to 50% rollout
```

**If warnings (but no critical issues):**
```bash
⚠️  Hold at 10%, monitor for another 24h
```

**If critical issues:**
```bash
🚨 Rollback to 0%
# Update .env
OPENROUTER_ROLLOUT_PERCENTAGE=0
# Restart server
npm run deploy:production
```

---

### **Step 3: 50% Production Rollout** (Day 3-4)

**Duration:** 48 hours monitoring

#### 3.1 Increase Rollout

```bash
# Update .env
OPENROUTER_ROLLOUT_PERCENTAGE=50  # 50% of users
```

#### 3.2 Deploy

```bash
npm run deploy:production
# Or restart Docker containers
docker-compose restart
```

#### 3.3 Monitor (48 hours)

Same monitoring as 10% rollout, but with increased traffic.

**Additional checks:**
- Compare OpenRouter vs Gemma 3 performance
- Look for patterns in errors
- Monitor user satisfaction scores

#### 3.4 Decision Point

**If healthy:** Proceed to 100%  
**If issues:** Hold or rollback to 10%

---

### **Step 4: 100% Production Rollout** (Day 5-7)

**Duration:** Ongoing monitoring

#### 4.1 Full Rollout

```bash
# Update .env
OPENROUTER_ROLLOUT_PERCENTAGE=100  # Everyone
```

#### 4.2 Deploy

```bash
npm run deploy:production
```

#### 4.3 Verify 100% Rollout

```bash
curl https://your-domain.com/api/trpc/aiMetrics.getRolloutStatus

# Expected:
# { "currentPercentage": 100, "enabled": true }
```

#### 4.4 Continuous Monitoring

**Daily for first week:**
- Check metrics dashboard
- Review error logs
- Monitor user feedback
- Track cost (should stay $0)

**Weekly after first week:**
- Review performance trends
- Optimize based on real usage
- Consider new features

---

## 📊 Monitoring & Metrics

### Access Metrics Dashboard

**Via API:**
```bash
# Get summary
curl https://your-domain.com/api/trpc/aiMetrics.getSummary

# Get rollout status
curl https://your-domain.com/api/trpc/aiMetrics.getRolloutStatus

# Get model breakdown
curl https://your-domain.com/api/trpc/aiMetrics.getModelBreakdown

# Check health
curl https://your-domain.com/api/trpc/aiMetrics.checkRolloutHealth
```

**Via Server Logs:**
```bash
# SSH into server
ssh production-server

# View logs
pm2 logs friday-ai

# Or Docker logs
docker-compose logs -f
```

### Key Metrics to Watch

1. **Error Rate**
   - Target: < 1%
   - Warning: > 1%
   - Critical: > 5%

2. **Response Time**
   - Target: < 2s average
   - Warning: > 3s average
   - Critical: > 5s average

3. **P95 Response Time**
   - Target: < 3s
   - Warning: > 5s
   - Critical: > 10s

4. **Success Rate**
   - Target: > 99%
   - Warning: < 99%
   - Critical: < 95%

5. **Model Distribution**
   - GLM-4.5 Air: ~70% (chat, email)
   - GPT-OSS 20B: ~30% (analysis, intents)
   - Gemma 3 27B: 0% (unless rollback)

---

## 🚨 Rollback Procedures

### Immediate Rollback (Critical Issues)

```bash
# SSH into production
ssh production-server

# Update .env
nano .env
# Set: OPENROUTER_ROLLOUT_PERCENTAGE=0

# Restart
pm2 restart friday-ai
# Or Docker
docker-compose restart

# Verify
curl https://your-domain.com/api/trpc/aiMetrics.getRolloutStatus
# Should show: { "currentPercentage": 0 }
```

### Partial Rollback

```bash
# Reduce percentage (e.g., 50% → 10%)
OPENROUTER_ROLLOUT_PERCENTAGE=10

# Restart server
```

### Emergency Fallback

If complete system failure:

```bash
# Force use Gemma 3 27B for everyone
OPENROUTER_ROLLOUT_PERCENTAGE=0

# Or force old behavior
FORCE_OPENROUTER=false
```

---

## 🎯 Success Criteria

### **10% Rollout Success:**
- ✅ Error rate < 1%
- ✅ Avg response time < 3s
- ✅ No critical user complaints
- ✅ Metrics stable for 48h

### **50% Rollout Success:**
- ✅ Error rate < 1%
- ✅ Performance consistent with 10%
- ✅ Positive user feedback
- ✅ Metrics stable for 48h

### **100% Rollout Success:**
- ✅ Error rate < 1%
- ✅ Avg response time < 2s
- ✅ Cost remains $0
- ✅ User satisfaction high
- ✅ System stable for 1 week

---

## 📝 Deployment Log Template

Keep track of each deployment:

```markdown
## Deployment: [DATE]

**Phase:** [10% / 50% / 100%]  
**Time:** [START TIME]  
**Engineer:** [YOUR NAME]

### Pre-Deployment
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Staging verified
- [ ] Metrics baseline captured

### Deployment
- [ ] Environment variables updated
- [ ] Code deployed
- [ ] Server restarted
- [ ] Rollout verified

### Post-Deployment (24h)
- [ ] Error rate: ____%
- [ ] Avg response time: ____ms
- [ ] Total requests: ____
- [ ] User complaints: ____

### Decision
- [ ] Proceed to next phase
- [ ] Hold current phase
- [ ] Rollback

**Notes:**
[Any observations, issues, or learnings]
```

---

## 🔧 Troubleshooting

### Issue: High Error Rate

**Symptoms:** Error rate > 5%

**Diagnosis:**
```bash
# Check recent errors
curl https://your-domain.com/api/trpc/aiMetrics.getSummary | jq '.modelBreakdown'
```

**Solutions:**
1. Check if specific model is failing
2. Verify OpenRouter API key is valid
3. Check rate limits
4. Review error logs for patterns
5. Consider rollback if persistent

### Issue: Slow Response Times

**Symptoms:** Avg response time > 5s

**Diagnosis:**
```bash
# Check P95 and P99 times
curl https://your-domain.com/api/trpc/aiMetrics.getSummary | jq '.p95ResponseTime, .p99ResponseTime'
```

**Solutions:**
1. Check network latency to OpenRouter
2. Verify not hitting rate limits
3. Check server resources (CPU, memory)
4. Consider using faster model (GPT-OSS) for more tasks

### Issue: Users Getting Wrong Model

**Symptoms:** Some users report old behavior

**Diagnosis:**
```bash
# Check rollout percentage
curl https://your-domain.com/api/trpc/aiMetrics.getRolloutStatus
```

**Solutions:**
1. Verify `OPENROUTER_ROLLOUT_PERCENTAGE` is set correctly
2. Ensure server was restarted after .env change
3. Check user ID hashing logic in feature flags

---

## 📞 Support & Escalation

**During Rollout:**
- Monitor Slack/Discord for user reports
- Check support ticket system
- Have rollback procedure ready

**Emergency Contacts:**
- DevOps: [CONTACT]
- Backend Team: [CONTACT]
- Product Owner: [CONTACT]

---

## ✅ Phase 4 Completion Checklist

- [ ] Staging deployment successful
- [ ] 10% rollout completed (48h monitoring)
- [ ] 50% rollout completed (48h monitoring)
- [ ] 100% rollout completed
- [ ] All metrics healthy for 1 week
- [ ] User feedback positive
- [ ] Cost remains $0
- [ ] Documentation updated
- [ ] Team trained on new system

---

**Next Phase:** Phase 5 - Optimization & New Features

**Estimated Timeline:**
- Staging: Day 0 (today)
- 10%: Day 1-2
- 50%: Day 3-4
- 100%: Day 5-7
- **Total: 1 week to full production**

---

**Status:** 🟢 **READY TO BEGIN DEPLOYMENT**

**Last Updated:** November 8, 2025  
**Version:** 1.0.0
