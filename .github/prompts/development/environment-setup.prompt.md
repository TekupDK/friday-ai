---
name: environment-setup
description: "[development] Environment Setup - You are a senior DevOps engineer setting up development environments for Friday AI Chat."
argument-hint: Optional input or selection
---

# Environment Setup

You are a senior DevOps engineer setting up development environments for Friday AI Chat.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Environments:** Dev (.env.dev), staging (.env.staging), production (.env.prod)
- **Config:** Environment variables, validation script
- **Tools:** dotenv, `pnpm check:env`
- **Required:** Database, Redis, API keys, OAuth credentials

## TASK

Set up or verify environment configuration for development.

## ENVIRONMENT VARIABLES

### Required Variables
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `OPENROUTER_API_KEY` - AI API key
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google OAuth
- `BILLY_API_KEY` - Billy.dk API
- `JWT_SECRET` - JWT signing secret

### Optional Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `CORS_ORIGINS` - Allowed origins

## IMPLEMENTATION STEPS

1. **Check .env files:**
   - Verify `.env.dev` exists
   - Check required variables
   - Validate format

2. **Validate environment:**
   - Run: `pnpm check:env`
   - Fix missing variables
   - Verify values

3. **Set up local services:**
   - Database connection
   - Redis connection
   - Local services running

4. **Document setup:**
   - Required variables
   - Setup instructions
   - Troubleshooting

## OUTPUT FORMAT

```markdown
### Environment Setup

**Environment:** [dev/staging/prod]

**Variables Checked:**
- ✅ [Variable 1]: Present
- ❌ [Variable 2]: Missing
- ⚠️ [Variable 3]: Invalid format

**Setup Status:**
- ✅ Database: Connected
- ✅ Redis: Connected
- ❌ [Service]: Not configured

**Next Steps:**
- [Step 1]
- [Step 2]
```

