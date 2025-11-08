# ⚡ Phase 4 - Quick Reference

**For:** Quick deployment actions  
**See also:** [PHASE_4_DEPLOYMENT_GUIDE.md](./PHASE_4_DEPLOYMENT_GUIDE.md) for details

---

## 🚀 Quick Rollout Commands

### Staging (100% rollout)

```bash
# Set environment
OPENROUTER_ROLLOUT_PERCENTAGE=100
FORCE_OPENROUTER=false

# Deploy
npm run build
npm run deploy:staging
```

### Production 10%

```bash
# Update .env on production server
OPENROUTER_ROLLOUT_PERCENTAGE=10

# Restart
pm2 restart friday-ai
# Or: docker-compose restart
```

### Production 50%

```bash
OPENROUTER_ROLLOUT_PERCENTAGE=50
pm2 restart friday-ai
```

### Production 100%

```bash
OPENROUTER_ROLLOUT_PERCENTAGE=100
pm2 restart friday-ai
```

### Emergency Rollback

```bash
OPENROUTER_ROLLOUT_PERCENTAGE=0
pm2 restart friday-ai
```

---

## 📊 Quick Metrics Check

```bash
# Get rollout status
curl https://your-domain.com/api/trpc/aiMetrics.getRolloutStatus

# Get metrics summary (last hour)
curl https://your-domain.com/api/trpc/aiMetrics.getSummary?lastMinutes=60

# Check health
curl https://your-domain.com/api/trpc/aiMetrics.checkRolloutHealth
```

---

## ✅ Quick Health Check

```bash
# Response should show:
{
  "healthy": true,
  "warnings": [],
  "critical": [],
  "metrics": {
    "errorRate": 0.5,        # Should be < 1%
    "avgResponseTime": 1200,  # Should be < 3000ms
    "p95ResponseTime": 2500   # Should be < 5000ms
  }
}
```

---

## 🎯 Decision Matrix

| Error Rate | Avg Time | Action |
|------------|----------|--------|
| < 1% | < 3s | ✅ Proceed |
| 1-5% | 3-5s | ⚠️  Hold, monitor |
| > 5% | > 5s | 🚨 Rollback |

---

## 📝 Environment Variables

```bash
# Required for rollout
OPENROUTER_ROLLOUT_PERCENTAGE=0  # 0-100
FORCE_OPENROUTER=false           # true/false
OPENROUTER_MODEL=z-ai/glm-4.5-air:free
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## 🔧 Quick Troubleshooting

**High error rate?**
```bash
# Check which model is failing
curl .../aiMetrics.getModelBreakdown
```

**Slow responses?**
```bash
# Check P95 times
curl .../aiMetrics.getSummary | jq '.p95ResponseTime'
```

**Users getting wrong experience?**
```bash
# Verify rollout percentage
curl .../aiMetrics.getRolloutStatus
```

---

## Timeline

- **Day 0:** Staging ✅
- **Day 1-2:** 10% rollout + monitor 48h
- **Day 3-4:** 50% rollout + monitor 48h  
- **Day 5-7:** 100% rollout + monitor 1 week

---

**Full guide:** [PHASE_4_DEPLOYMENT_GUIDE.md](./PHASE_4_DEPLOYMENT_GUIDE.md)
