# ✅ Port Conflict Fixed

**Issue:** Langfuse was configured for port 3000, which conflicts with Friday AI dev server.

**Solution:**Changed Langfuse to port**3001**

---

## 🔧 What Was Changed

### Files Updated (5)

1. **docker-compose.langfuse.yml**
   - Port mapping: `3000:3000` → `3001:3000`

   - NEXTAUTH_URL: `<http://localhost:3000`> → `<http://localhost:3001`>

1. **server/\_core/env.ts**
   - Default: `<http://localhost:3000`> → `<http://localhost:3001`>

1. **server/integrations/langfuse/client.ts**
   - Default: `<http://localhost:3000`> → `<http://localhost:3001`>

   - Console log updated

1. **server/integrations/langfuse/.env.example**
   - URL: `<http://localhost:3000`> → `<http://localhost:3001`>

   - Added comment about port conflict

---

## ✅ Langfuse Now Running

````bash
✅ Docker Status:

   - friday-langfuse-db: Healthy

   - friday-langfuse: Running on port 3001

✅ Access at: <http://localhost:3001>

✅ Friday AI unchanged: <http://localhost:3000>

```text

---

## 🎯 Correct URLs

```text
Friday AI Frontend:     <http://localhost:3000>  (unchanged)
Friday AI Backend:      <http://localhost:5173>  (Vite dev server)
Langfuse Dashboard:     <http://localhost:3001>  (NEW!)
LiteLLM Proxy:          <http://localhost:4000>  (existing)
PostgreSQL (Langfuse):  localhost:5433        (doesn't conflict)

```text

---

## 📝 Setup Steps (Updated)

### 1. Access Langfuse

```text
Open: <http://localhost:3001>  (NOT 3000!)

```text

### 2. Create Account

- First user = admin

- Create project: "Friday AI"

- Get API keys from Settings

### 3. Add to .env.dev

```bash
LANGFUSE_ENABLED=true
LANGFUSE_PUBLIC_KEY=pk-lf-XXXXXXXXXXXXXXXX
LANGFUSE_SECRET_KEY=sk-lf-XXXXXXXXXXXXXXXX
LANGFUSE_BASE_URL=<http://localhost:3001>  # Port 3001!

```text

### 4. Restart Friday AI

```bash
pnpm dev

```text

---

## ✅ Verification

```bash

# Test Langfuse is running

curl <http://localhost:3001/api/public/health>

# Should return: {"status":"ok"}

# Test Friday AI still works

curl <http://localhost:3000>

# Should return: Friday AI frontend

````

---

**Status:** ✅ Fixed and Running!
**Langfuse:** <http://localhost:3001>
**Friday AI:** <http://localhost:3000>

**Last Updated:** November 9, 2025 12:25 PM
