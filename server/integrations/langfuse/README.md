# Langfuse Integration - LLM Observability 🔍

**Status:** Production Ready  
**Cost:** $0/month (self-hosted)  
**Purpose:** Complete visibility into all AI operations

---

## 🎯 What is Langfuse?

Langfuse provides **complete observability** for Friday AI's LLM operations:

- 📊 Track every AI call (model, tokens, cost, latency)
- 🐛 Debug issues 10x faster
- 📈 Monitor performance trends
- 💰 Cost tracking (even for FREE models!)
- 👥 User feedback collection
- 🧪 A/B testing for prompts

---

## 🚀 Quick Start

### 1. Start Langfuse

```bash
# Navigate to docker folder
cd server/integrations/langfuse/docker

# Start services
docker compose -f docker-compose.langfuse.yml up -d

# Check status
docker compose -f docker-compose.langfuse.yml ps

# View logs
docker compose -f docker-compose.langfuse.yml logs -f langfuse
```

### 2. Verify Installation

Open browser: **http://localhost:3000**

You should see the Langfuse login page.

**Default credentials** (if not set in docker-compose):

- Will be created on first access via web UI

### 3. Get API Keys

1. Go to http://localhost:3000
2. Create account (first user is admin)
3. Go to Settings → API Keys
4. Copy your **Public Key** and **Secret Key**

### 4. Configure Friday AI

Add to `.env.dev`:

```bash
# Langfuse Observability
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=http://localhost:3000
LANGFUSE_ENABLED=true
```

### 5. Test Integration

```bash
# Start Friday AI
pnpm dev

# Make an AI request (via UI or API)
# Check Langfuse dashboard - you should see traces!
```

---

## 📊 Dashboard Overview

### Main Views

1. **Traces** - All AI operations
   - View request/response
   - See latency and tokens
   - Filter by user, model, task type

2. **Generations** - Individual LLM calls
   - Model used
   - Prompt and completion
   - Token usage
   - Cost (if applicable)

3. **Scores** - User feedback
   - Thumbs up/down
   - Custom metrics
   - Quality tracking

4. **Users** - Per-user analytics
   - Usage patterns
   - Cost per user
   - Performance metrics

5. **Sessions** - Conversation flows
   - Multi-turn conversations
   - Context tracking
   - User journey

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
LANGFUSE_PUBLIC_KEY=pk-lf-...        # Your public API key
LANGFUSE_SECRET_KEY=sk-lf-...        # Your secret API key

# Optional
LANGFUSE_BASE_URL=http://localhost:3000  # Langfuse server URL
LANGFUSE_ENABLED=true                    # Enable/disable tracing
LANGFUSE_SAMPLE_RATE=1.0                 # Sample rate (1.0 = 100%)
LANGFUSE_FLUSH_INTERVAL=1000             # Flush interval (ms)
```

### Docker Configuration

Edit `docker-compose.langfuse.yml` to customize:

- **Port:** Change `3000:3000` to your preferred port
- **Database:** Use external PostgreSQL if needed
- **Secrets:** Update NEXTAUTH_SECRET and SALT (important for production!)
- **Admin User:** Uncomment and set LANGFUSE*INIT_USER*\* variables

---

## 💡 Usage Examples

### Basic Tracing

```typescript
import { langfuseClient } from "./integrations/langfuse";

// Create trace
const trace = langfuseClient.trace({
  name: "lead-analysis",
  userId: "123",
  metadata: { source: "email" },
});

// Track LLM call
const generation = trace.generation({
  name: "analyze-lead",
  model: "glm-4.5-air-free",
  input: messages,
});

// ... make AI call ...

// End generation
generation.end({
  output: result,
  usage: { promptTokens: 100, completionTokens: 200 },
});
```

### Automatic Tracing (Already Implemented!)

All `invokeLLM` and `streamResponse` calls are **automatically traced**!

Just use them as normal:

```typescript
const result = await invokeLLM({ messages });
// ✅ Automatically tracked in Langfuse!
```

---

## 📈 Monitoring

### Key Metrics to Track

1. **Success Rate**
   - Target: > 99%
   - Alert if < 95%

2. **Response Time**
   - Target: < 10s (p95)
   - Alert if > 15s

3. **Error Rate**
   - Target: < 1%
   - Alert if > 5%

4. **Cost per Request**
   - Target: $0.00 (we use FREE models!)
   - Track for future paid model usage

### Setting Up Alerts

Langfuse supports webhooks for alerts:

1. Go to Settings → Webhooks
2. Add webhook URL
3. Configure triggers (error rate, latency, etc.)

---

## 🐛 Troubleshooting

### Langfuse Won't Start

```bash
# Check logs
docker compose -f docker-compose.langfuse.yml logs

# Common issues:
# 1. Port 3000 already in use
#    → Change port in docker-compose.yml
# 2. Database not ready
#    → Wait 30s and try again
# 3. Permission issues
#    → Check volume permissions
```

### No Traces Showing Up

1. **Check API keys**

   ```bash
   # Verify in .env.dev
   echo $LANGFUSE_PUBLIC_KEY
   echo $LANGFUSE_SECRET_KEY
   ```

2. **Check connection**

   ```bash
   curl http://localhost:3000/api/public/health
   # Should return: {"status":"ok"}
   ```

3. **Check Friday AI logs**

   ```bash
   # Look for Langfuse errors
   grep -i langfuse logs/friday-ai.log
   ```

4. **Verify LANGFUSE_ENABLED=true**

### Traces Are Delayed

This is **normal**! Langfuse uses async flushing:

- Default flush interval: 1 second
- Traces appear within 1-2 seconds
- No impact on response time

---

## 🔒 Security

### Production Checklist

- [ ] Change `NEXTAUTH_SECRET` to random string
- [ ] Change `SALT` to random string
- [ ] Change database password
- [ ] Use HTTPS for NEXTAUTH_URL
- [ ] Restrict database port (don't expose 5433)
- [ ] Set strong admin password
- [ ] Enable SSL for database connection
- [ ] Regular backups of PostgreSQL data

### Generate Secure Secrets

```bash
# On Linux/Mac:
openssl rand -hex 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 📊 Performance

### Resource Usage

```
Langfuse Application:
- CPU: ~100-200 MHz (idle)
- Memory: ~200-300 MB
- Disk: Minimal (logs only)

PostgreSQL Database:
- CPU: ~50-100 MHz (idle)
- Memory: ~100-200 MB
- Disk: ~100 MB + traces data
```

### Scaling

For high-volume production:

1. **Use external PostgreSQL**
   - Better performance
   - Easier backups
   - Can scale independently

2. **Increase flush interval**

   ```bash
   LANGFUSE_FLUSH_INTERVAL=5000  # 5 seconds
   ```

3. **Use sampling**
   ```bash
   LANGFUSE_SAMPLE_RATE=0.5  # Track 50% of requests
   ```

---

## 🔄 Backup & Recovery

### Backup Database

```bash
# Backup
docker exec friday-langfuse-db pg_dump -U langfuse langfuse > langfuse-backup.sql

# Restore
docker exec -i friday-langfuse-db psql -U langfuse langfuse < langfuse-backup.sql
```

### Automated Backups

Add to cron (Linux/Mac) or Task Scheduler (Windows):

```bash
# Daily backup at 2 AM
0 2 * * * docker exec friday-langfuse-db pg_dump -U langfuse langfuse > /backups/langfuse-$(date +\%Y\%m\%d).sql
```

---

## 🚀 Next Steps

1. ✅ **Deploy Langfuse** (You are here!)
2. **Integrate with Friday AI** (Day 3)
3. **Create custom dashboards**
4. **Setup alerts**
5. **Train team on usage**

---

## 📚 Resources

- [Langfuse Documentation](https://langfuse.com/docs)
- [TypeScript SDK](https://langfuse.com/docs/sdk/typescript)
- [API Reference](https://langfuse.com/docs/api)
- [Best Practices](https://langfuse.com/docs/guides/best-practices)

---

## 🆘 Support

**Issues?**

- Check troubleshooting section above
- View logs: `docker compose logs langfuse`
- Langfuse Discord: https://discord.gg/langfuse
- GitHub Issues: https://github.com/langfuse/langfuse

---

**Status:** ✅ Ready to Deploy  
**Next:** Run `docker compose up -d` and start tracking! 🚀

**Last Updated:** November 9, 2025
