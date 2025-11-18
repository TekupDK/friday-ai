# Docker Development Setup for CRM Debugging

**Author:** Development Team  
**Last Updated:** 2025-11-17  
**Version:** 1.0.0

## Overview

Docker development setup provides an isolated environment for CRM debugging and development. This hybrid approach runs backend and database in Docker while keeping frontend native for optimal performance.

## Architecture

**Hybrid Approach:**

- ✅ **Backend + Database in Docker** - Isolation, consistency, port management
- ✅ **Frontend Native** - Performance, hot-reload, debugging tools

**Benefits:**

- Port isolation (no conflicts)
- Consistent environment across team
- Easy database reset and migration
- Isolated CRM debugging environment
- Native frontend performance

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2
- `.env.dev` file configured
- Node.js 22+ and pnpm installed (for frontend)

## Quick Start

### 1. Start Backend + Database

```bash
# Start Docker services (backend + database)
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend-dev
```

### 2. Start Frontend (Native)

```bash
# In a separate terminal
pnpm dev:vite
```

### 3. Access Services

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Database:** localhost:3307 (MySQL)
- **Adminer (DB Admin):** http://localhost:8081
- **Redis:** localhost:6380

### 4. Access CRM

- **CRM Dashboard:** http://localhost:5173/crm/dashboard
- **CRM Standalone:** http://localhost:5173/crm-standalone
- **CRM Debug Mode:** http://localhost:5173/crm/debug

## Configuration

### Environment Variables

Ensure `.env.dev` contains:

```env
# Database (will use Docker MySQL)
DATABASE_URL=mysql://friday_user:friday_password@db-dev:3306/friday_ai

# Or use external database
# DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?schema=friday_ai&sslmode=require

# JWT Secret
JWT_SECRET=your-secret-minimum-32-chars

# Owner
OWNER_OPEN_ID=owner-friday-ai-dev

# API Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
BILLY_API_KEY=...
BILLY_ORGANIZATION_ID=...

# Google Integration
GOOGLE_SERVICE_ACCOUNT_KEY=./google-service-account.json
GOOGLE_IMPERSONATED_USER=info@rendetalje.dk
```

### Port Configuration

**Default Ports:**

- Backend: `3000`
- Frontend: `5173` (native)
- MySQL: `3307` (to avoid conflicts)
- Redis: `6380` (to avoid conflicts)
- Adminer: `8081` (to avoid conflicts)

**To change ports**, edit `docker-compose.dev.yml`:

```yaml
services:
  backend-dev:
    ports:
      - "3001:3000" # Change host port
```

## Database Setup

### Initialize Database

```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec backend-dev pnpm db:push

# Or from host (if drizzle-kit is installed)
pnpm db:push
```

### Reset Database

```bash
# Stop and remove database volume
docker-compose -f docker-compose.dev.yml down -v

# Start fresh
docker-compose -f docker-compose.dev.yml up -d db-dev

# Run migrations
docker-compose -f docker-compose.dev.yml exec backend-dev pnpm db:push
```

### Access Database

**Using Adminer:**

1. Open http://localhost:8081
2. Server: `db-dev`
3. Username: `friday_user`
4. Password: `friday_password`
5. Database: `friday_ai`

**Using MySQL CLI:**

```bash
docker-compose -f docker-compose.dev.yml exec db-dev mysql -u friday_user -pfriday_password friday_ai
```

## Development Workflow

### 1. Start Development Environment

```bash
# Terminal 1: Docker services
docker-compose -f docker-compose.dev.yml up

# Terminal 2: Frontend
pnpm dev:vite
```

### 2. Make Code Changes (Live Editing)

**Backend Changes:**

- Edit files in `server/` directory directly
- Backend auto-reloads (tsx watch detects changes)
- Changes are reflected immediately
- Check logs: `docker-compose -f docker-compose.dev.yml logs -f backend-dev`

**Frontend Changes:**

- Edit files in `client/` directory directly
- Vite HMR (Hot Module Replacement) updates browser automatically
- No page refresh needed for most changes
- Check browser console for errors

**Live Fixing:**

- ✅ All volumes are mounted read-write
- ✅ Changes are detected automatically
- ✅ No need to restart containers
- ✅ Edit → Save → See result immediately

### 3. Debug CRM

**Access CRM Standalone:**

```
http://localhost:5173/crm-standalone/dashboard
```

**Debug Features:**

- Error boundaries catch React errors
- Network tab shows all tRPC calls
- React DevTools for component inspection
- TanStack Query DevTools for cache inspection

### 4. Stop Development Environment

```bash
# Stop Docker services
docker-compose -f docker-compose.dev.yml down

# Stop frontend (Ctrl+C in terminal)
```

## Troubleshooting

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Or change port in docker-compose.dev.yml
```

### Database Connection Failed

**Error:** `Cannot connect to database`

**Solution:**

```bash
# Check database is running
docker-compose -f docker-compose.dev.yml ps db-dev

# Check database logs
docker-compose -f docker-compose.dev.yml logs db-dev

# Restart database
docker-compose -f docker-compose.dev.yml restart db-dev
```

### Backend Not Reloading

**Issue:** Code changes not reflected

**Solution:**

```bash
# Check volume mounts
docker-compose -f docker-compose.dev.yml config

# Restart backend
docker-compose -f docker-compose.dev.yml restart backend-dev

# Check logs for errors
docker-compose -f docker-compose.dev.yml logs backend-dev
```

### Frontend Can't Connect to Backend

**Error:** `ERR_CONNECTION_REFUSED` or CORS errors

**Solution:**

1. Verify backend is running: `docker-compose -f docker-compose.dev.yml ps`
2. Check backend logs: `docker-compose -f docker-compose.dev.yml logs backend-dev`
3. Verify CORS settings in backend code
4. Check network connectivity: `curl http://localhost:3000/health`

## Advanced Usage

### Run Commands in Container

```bash
# Run database migrations
docker-compose -f docker-compose.dev.yml exec backend-dev pnpm db:push

# Run tests
docker-compose -f docker-compose.dev.yml exec backend-dev pnpm test

# Access shell
docker-compose -f docker-compose.dev.yml exec backend-dev sh
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend-dev

# Last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 backend-dev
```

### Clean Up

```bash
# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (deletes database data)
docker-compose -f docker-compose.dev.yml down -v

# Remove images
docker-compose -f docker-compose.dev.yml down --rmi all
```

## Comparison: Docker vs Native

### Docker Development (Backend)

**Pros:**

- ✅ Port isolation
- ✅ Consistent environment
- ✅ Easy database reset
- ✅ No local MySQL/PostgreSQL needed
- ✅ Team consistency

**Cons:**

- ⚠️ Slower file watching
- ⚠️ Higher memory usage
- ⚠️ Docker knowledge required

### Native Development (Frontend)

**Pros:**

- ✅ Fast hot-reload
- ✅ Better performance
- ✅ Native debugging tools
- ✅ Lower memory usage

**Cons:**

- ⚠️ Port conflicts possible
- ⚠️ Environment differences

## Best Practices

1. **Use Docker for Backend:**
   - Consistent database setup
   - Isolated dependencies
   - Easy reset and migration

2. **Use Native for Frontend:**
   - Optimal performance
   - Fast hot-reload
   - Better debugging

3. **Keep `.env.dev` Updated:**
   - Document all variables
   - Use `.env.dev.template` as reference
   - Never commit secrets

4. **Regular Database Backups:**

   ```bash
   # Export database
   docker-compose -f docker-compose.dev.yml exec db-dev mysqldump -u friday_user -pfriday_password friday_ai > backup.sql
   ```

5. **Monitor Resource Usage:**
   ```bash
   docker stats
   ```

## Related Documentation

- [CRM Standalone Debug Mode](../features/crm/CRM_STANDALONE_DEBUG_MODE.md)
- [Development Guide](../DEVELOPMENT_GUIDE.md)
- [Docker Production Setup](./DOCKER_PRODUCTION.md)

## Support

For issues or questions:

1. Check logs: `docker-compose -f docker-compose.dev.yml logs`
2. Review troubleshooting section
3. Check GitHub issues
4. Contact development team
