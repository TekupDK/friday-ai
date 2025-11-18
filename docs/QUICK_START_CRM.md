# Quick Start - CRM System

**Date:** 2025-11-17  
**Status:** ✅ READY

## Starting the CRM System

### 1. Start Development Servers

**Terminal 1 - Backend Server:**

```bash
pnpm dev
```

- Starts backend server on `http://localhost:3000`
- Handles API requests and tRPC endpoints

**Terminal 2 - Frontend Server:**

```bash
pnpm dev:vite
```

- Starts Vite dev server on `http://localhost:5173`
- Serves React frontend with hot-reload

### 2. Access CRM System

Once both servers are running, access the CRM system at:

**Main Application:**

- URL: `http://localhost:3000`
- The frontend will automatically proxy to Vite dev server

**Direct Vite Access (if needed):**

- URL: `http://localhost:5173`

### 3. CRM Routes

Navigate to CRM sections:

- **Dashboard:** `http://localhost:3000/crm/dashboard`
- **Customers:** `http://localhost:3000/crm/customers`
- **Leads:** `http://localhost:3000/crm/leads`
- **Opportunities:** `http://localhost:3000/crm/opportunities`
- **Segments:** `http://localhost:3000/crm/segments`
- **Segment Detail:** `http://localhost:3000/crm/segments/:id`

### 4. Features to Test

#### Document Management

- Upload documents to customers
- View upload progress
- Delete documents (removes from Supabase Storage)
- Search and filter documents

#### Constants System

- All pricing calculations use centralized constants
- File validation uses centralized storage constants

#### Upload Progress

- Visual progress bar during upload
- Progress percentage in button text

### 5. Troubleshooting

**Backend not starting:**

- Check `.env.dev` file exists
- Verify `DATABASE_URL` is set
- Run `pnpm check:env` to verify configuration

**Frontend not starting:**

- Check port 5173 is available
- Verify `node_modules` are installed (`pnpm install`)
- Check for TypeScript errors (`pnpm check`)

**Cannot access CRM routes:**

- Ensure you're logged in
- Check browser console for errors
- Verify both servers are running

## Server Status

Check if servers are running:

```bash
# Check backend
netstat -ano | findstr ":3000"

# Check frontend
netstat -ano | findstr ":5173"
```

## Next Steps

1. Navigate to `http://localhost:3000/crm/dashboard`
2. Explore customer list
3. Test document upload
4. Review opportunities pipeline
5. Check segments functionality
