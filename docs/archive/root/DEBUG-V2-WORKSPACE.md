# Debug V2 Workspace - Troubleshooting Guide

**Problem:** Højre panel skifter ikke når email vælges

---

## 🔍 Debug Steps

### 1. Start Dev Server

```bash
npm run dev
```

### 2. Åbn Browser DevTools

1. Åbn appen i browser: `http://localhost:5000`
2. Tryk **F12** for at åbne DevTools
3. Gå til **Console** tab

### 3. Test Email Selection

1. **Klik på en email** i listen
2. **Se console output** - Du skal se:

```javascript
[EmailTab] Setting selected email: { id: "...", subject: "...", from: "...", labels: [...] }
[SmartWorkspace] useEffect triggered, selectedEmail: { ... }
[SmartWorkspace] Email selected, starting context detection
[SmartWorkspace] Analyzing email: { subject: "...", from: "...", labels: [...] }
[SmartWorkspace] Context detected: lead (eller booking/invoice/customer/dashboard)
```

---

## ✅ Forventet Flow

```
1. User klikker email
   ↓
2. EmailTab logger: "Setting selected email"
   ↓
3. emailContext.setSelectedEmail() kaldes
   ↓
4. EmailContext state opdateres
   ↓
5. SmartWorkspacePanel useEffect triggers
   ↓
6. SmartWorkspace logger: "useEffect triggered"
   ↓
7. Context detection kører
   ↓
8. SmartWorkspace logger: "Context detected: [type]"
   ↓
9. Workspace component skifter
```

---

## 🚨 Mulige Problemer & Løsninger

### Problem 1: Ingen logs i console

**Symptom:** Ingen `[EmailTab]` eller `[SmartWorkspace]` logs

**Mulige årsager:**
1. Dev server ikke startet korrekt
2. Browser cache
3. TypeScript compile errors

**Løsning:**
```bash
# Stop server (Ctrl+C)
# Clear cache
# Restart
npm run dev
```

### Problem 2: Kun `[EmailTab]` logs, ingen `[SmartWorkspace]` logs

**Symptom:** Ser `[EmailTab] Setting selected email` men IKKE `[SmartWorkspace] useEffect triggered`

**Mulige årsager:**
1. SmartWorkspacePanel ikke mounted
2. WorkflowPanelV2 ikke brugt i WorkspaceLayout
3. EmailContext ikke delt korrekt

**Løsning:**
```typescript
// Check WorkspaceLayout.tsx bruger WorkflowPanelV2
// Check App.tsx bruger WorkspaceLayout (ikke ChatInterface)
```

### Problem 3: `[SmartWorkspace]` logger "No email selected"

**Symptom:** Ser `[SmartWorkspace] No email selected, showing dashboard`

**Mulige årsager:**
1. `emailState.selectedEmail` er null/undefined
2. EmailContext ikke opdateret korrekt
3. Timing issue

**Løsning:**
```javascript
// I console, check EmailContext state:
// (Kun for debugging - dette virker ikke i prod)
console.log('Email Context:', window.__emailContext);
```

### Problem 4: Context detected men workspace skifter ikke

**Symptom:** Ser `[SmartWorkspace] Context detected: lead` men workspace viser stadig dashboard

**Mulige årsager:**
1. `setContext()` virker ikke
2. Component render issue
3. State update timing

**Løsning:**
```typescript
// Check SmartWorkspacePanel renderWorkspaceContent()
// Verify switch statement har alle cases
```

---

## 🔧 Manual Verification

### Check 1: WorkspaceLayout bruger WorkflowPanelV2

```typescript
// File: client/src/pages/WorkspaceLayout.tsx
// Skal importere:
const WorkflowPanelV2 = lazy(() => import("@/components/panels/WorkflowPanelV2"));

// Skal bruge:
<WorkflowPanelV2 />
```

### Check 2: App.tsx bruger WorkspaceLayout

```typescript
// File: client/src/App.tsx
// Skal importere:
import WorkspaceLayout from "./pages/WorkspaceLayout";

// Skal bruge:
<Route path={"/"} component={WorkspaceLayout} />
```

### Check 3: EmailContext har selectedEmail

```typescript
// File: client/src/contexts/EmailContext.tsx
// Skal have:
selectedEmail: {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  labels: string[];
  threadLength: number;
} | null;

// Skal have method:
setSelectedEmail: (email: EmailContextState['selectedEmail']) => void;
```

---

## 📊 Debug Checklist

- [ ] Dev server kører (`npm run dev`)
- [ ] Browser DevTools åben (F12)
- [ ] Console tab valgt
- [ ] Klikket på email
- [ ] Ser `[EmailTab]` logs
- [ ] Ser `[SmartWorkspace]` logs
- [ ] Ser "Context detected: [type]"
- [ ] Workspace component skifter

---

## 🎯 Test Scenarios

### Test 1: Lead Email

**Setup:** Find email med "rengoring.nu" i from eller "Leads" label

**Expected logs:**
```javascript
[EmailTab] Setting selected email: { ..., from: "...@rengoring.nu", labels: ["Leads"] }
[SmartWorkspace] useEffect triggered
[SmartWorkspace] Email selected, starting context detection
[SmartWorkspace] Analyzing email: { ..., from: "...@rengoring.nu" }
[SmartWorkspace] Context detected: lead
```

**Expected UI:** Højre panel viser 🎯 Lead Analyzer

### Test 2: Booking Email

**Setup:** Find email med "I kalender" label

**Expected logs:**
```javascript
[EmailTab] Setting selected email: { ..., labels: ["I kalender"] }
[SmartWorkspace] Context detected: booking
```

**Expected UI:** Højre panel viser 📅 Booking Manager

### Test 3: Invoice Email

**Setup:** Find email med "Finance" label eller "faktura" i subject

**Expected logs:**
```javascript
[EmailTab] Setting selected email: { ..., labels: ["Finance"] }
[SmartWorkspace] Context detected: invoice
```

**Expected UI:** Højre panel viser 💰 Invoice Tracker

---

## 🔍 Advanced Debugging

### React DevTools

1. Install React DevTools extension
2. Åbn DevTools → Components tab
3. Find `SmartWorkspacePanel` component
4. Check `emailState.selectedEmail` prop
5. Check `context` state

### Network Tab

1. Åbn DevTools → Network tab
2. Check for API errors
3. Verify email data loads correctly

### Console Commands

```javascript
// Check if EmailContext is available
console.log('EmailContext:', window.__emailContext);

// Check current route
console.log('Current route:', window.location.pathname);

// Check if WorkspaceLayout is mounted
console.log('WorkspaceLayout:', document.querySelector('[data-workspace-layout]'));
```

---

## 💡 Quick Fixes

### Fix 1: Clear Browser Cache

```
Ctrl + Shift + Delete
→ Clear cache
→ Reload page (Ctrl + R)
```

### Fix 2: Restart Dev Server

```bash
# Terminal
Ctrl + C  (stop server)
npm run dev  (restart)
```

### Fix 3: Hard Refresh

```
Ctrl + Shift + R  (hard refresh)
```

### Fix 4: Check TypeScript Errors

```bash
npm run check
```

---

## 📞 Hvis Intet Virker

### Rollback til V1

```typescript
// I App.tsx
import ChatInterface from "./pages/ChatInterface";
<Route path={"/"} component={ChatInterface} />
```

### Verify Files Exist

```bash
# Check files exist:
ls client/src/pages/WorkspaceLayout.tsx
ls client/src/components/panels/WorkflowPanelV2.tsx
ls client/src/components/panels/SmartWorkspacePanel.tsx
```

### Check Git Status

```bash
git status
git diff
```

---

## ✅ Success Criteria

Du ved det virker når:

1. ✅ Ser alle console logs
2. ✅ Context detected korrekt
3. ✅ Workspace component skifter
4. ✅ Ingen errors i console
5. ✅ UI opdateres real-time

---

## 🎊 Næste Skridt

Når debugging virker:
1. Test alle 5 workspace states
2. Test forskellige email typer
3. Verify context detection logic
4. Remove debug logs (eller behold for prod debugging)

---

**God debugging! 🔍**
