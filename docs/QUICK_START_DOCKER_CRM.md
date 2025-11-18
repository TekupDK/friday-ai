# Quick Start: Docker CRM Development

**For:** CRM System Development & Debugging  
**Time:** 5 minutes setup

## Prerequisites

- ✅ Docker Desktop installed and running
- ✅ `.env.dev` file configured
- ✅ Node.js 22+ and pnpm installed

## Quick Start (3 Steps)

### 1. Start Backend + Database (Docker)

```bash
pnpm dev:docker
```

This starts:

- ✅ Backend server (port 3000)
- ✅ MySQL database (port 3307)
- ✅ Redis cache (port 6380)
- ✅ Adminer (DB admin, port 8081)

### 2. Initialize Database

```bash
# In a new terminal
pnpm dev:docker:db:push
```

### 3. Start Frontend (Native)

```bash
# In a new terminal
pnpm dev:vite
```

## Access CRM

- **CRM Dashboard:** http://localhost:5173/crm/dashboard
- **CRM Standalone:** http://localhost:5173/crm-standalone
- **CRM Debug Mode:** http://localhost:5173/crm/debug

## Useful Commands

```bash
# View logs
pnpm dev:docker:logs

# Stop Docker services
pnpm dev:docker:down

# Restart services
pnpm dev:docker:down && pnpm dev:docker
```

## Troubleshooting

**Port conflicts?**

- Backend: Check port 3000
- Database: Uses port 3307 (avoids conflicts)
- Frontend: Uses port 5173 (or next available)

**Database connection failed?**

```bash
# Check database is running
docker-compose -f docker-compose.dev.yml ps db-dev

# Restart database
docker-compose -f docker-compose.dev.yml restart db-dev
```

## Full Documentation

See [Docker Development Setup](./devops-deploy/DOCKER_DEV_SETUP.md) for complete guide.
