# Quick Start: CRM Standalone Debug Mode

**For debugging og development af CRM modulet**

## Hurtig Start

### 1. Start Servere

```bash
# Terminal 1: Backend
pnpm dev

# Terminal 2: Frontend (hvis separat)
pnpm dev:vite
```

### 2. Åbn CRM Standalone

Naviger til en af disse URLs:

- **Dashboard:** `http://localhost:3000/crm-standalone/dashboard`
- **Customers:** `http://localhost:3000/crm-standalone/customers`
- **Leads:** `http://localhost:3000/crm-standalone/leads`
- **Opportunities:** `http://localhost:3000/crm-standalone/opportunities`
- **Segments:** `http://localhost:3000/crm-standalone/segments`
- **Bookings:** `http://localhost:3000/crm-standalone/bookings`

### 3. Alternativ Entry Point

Du kan også bruge:
- `http://localhost:3000/crm-standalone` - Viser oversigt over tilgængelige routes
- `http://localhost:3000/crm/debug` - Alternativ entry point

## Features

✅ **Isoleret CRM Module** - Ingen afhængighed af hovedapplikationen  
✅ **Dedikeret Query Client** - Optimerede indstillinger for debugging  
✅ **Error Boundaries** - Bedre fejlhåndtering med stack traces  
✅ **Development Banner** - Visuel indikator i development mode  
✅ **Alle CRM Routes** - Fuld adgang til alle CRM features  

## Debugging Tips

### React DevTools
- Inspect component state
- Check props
- Monitor re-renders

### Network Tab
- Inspect tRPC calls
- Check API responses
- Monitor request/response timing

### Console
- Error messages
- Warning logs
- Debug information

## Troubleshooting

**Problem:** "Cannot access /crm-standalone"

**Løsning:**
- Tjek at backend serveren kører (`pnpm dev`)
- Verificer at route er registreret i `App.tsx`
- Tjek browser console for fejl

**Problem:** "Components not loading"

**Løsning:**
- Tjek browser console for errors
- Verificer lazy loading fungerer
- Tjek network tab for failed requests

**Problem:** "tRPC calls failing"

**Løsning:**
- Verificer backend server kører
- Tjek CORS indstillinger
- Verificer authentication (hvis påkrævet)
- Tjek network tab for request detaljer

## Se Også

- [CRM Standalone Debug Mode Documentation](../features/crm/CRM_STANDALONE_DEBUG_MODE.md)
- [CRM Module Overview](../features/crm/README.md)
- [Quick Start CRM](../QUICK_START_CRM.md)

