# 🐛 Server Start Problem - Debug Guide

**Problem:** Serveren starter ikke korrekt efter Langfuse config blev tilføjet.

---

## 🔍 Hvad Vi Ved

````bash
✅ .env.dev:  Langfuse config tilføjet korrekt
✅ Node processer: Starter men crashes/hænger
❌ Porte 3000/5173: Lytter IKKE
⚠️  Sidst set: "Validating configuration..." ved calendar

```powershell

---

## 🚀 Løsningsforslag

### Option 1: Start Med Min Terminal (Recommended)

1. **Åbn PowerShell eller CMD i projektmappen**
1. **Kør:**

   ```bash
   pnpm dev

```text

1. **Se output - find fejlen**

1. **Send mig fejlmeddelelsen**

### Option 2: Disable Langfuse Midlertidigt

Hvis det er Langfuse der crasher:

```bash

# I .env.dev - ændre denne linje

LANGFUSE_ENABLED=false

```text

Derefter:

```bash
pnpm dev

```text

### Option 3: Check Calendar Config

Hvis serveren hænger ved calendar validation:

```bash

# I .env.dev - check disse linjer er OK

GOOGLE_SERVICE_ACCOUNT_KEY=...
GOOGLE_IMPERSONATED_USER=<info@rendetalje.dk>
GOOGLE_CALENDAR_ID=<c_39570a852bf141658572fa37bb229c7246564a6cca47560bc66a4f9e4fec67ff@group.calendar.google.com>

```text

### Option 4: Clean Restart

```bash

# Stop alle node processer

Get-Process -Name node | Stop-Process -Force

# Clear cache

pnpm store prune

# Reinstall

pnpm install

# Start fresh

pnpm dev

```text

---

## 🔍 Hvad At Kigge Efter

### I Terminal Output

```text
❌ BAD:

   - "Error: ..."

   - "Cannot find module..."

   - "Connection refused..."

   - "Timeout..."

✅ GOOD:

   - "[Langfuse] ✅ Client initialized"

   - "Server running on port 5173"

   - "Client running on port 3000"

```bash

---

## 🎯 Quick Test

**Kan du:**

1. Åbn terminal i projekt folder
1. Kør: `pnpm dev`
1. Vent 30 sekunder
1. Kopier hele output til mig?

**Så kan jeg se præcis hvad fejlen er!** 😊

---

## 💡 Mulige Fejl

### 1. Langfuse Connection Timeout

```typescript
// Hvis det hænger her:
[Langfuse] Connecting to <http://localhost:3001...>
[Langfuse] ❌ Connection timeout

// Løsning: Disable Langfuse midlertidigt

```text

### 2. Calendar API Hanging

```typescript
// Hvis det hænger her:
[Calendar] 🔍 Validating configuration...
(nothing after this)

// Løsning: Check Google credentials

```text

### 3. Port Already In Use

```typescript
// Error: listen EADDRINUSE: address already in use :::3000
// Løsning: Kill process using port
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Stop-Process -Id <PID>

```text

### 4. Missing Dependencies

```typescript
// Error: Cannot find module 'langfuse'
// Løsning:
pnpm install

```text

---

## 🆘 Hvad Nu

**Kør dette i din terminal og send mig output:**

```bash
cd C:\Users\empir\Tekup\services\tekup-ai-v2
pnpm dev

```text

**Eller test Langfuse status:**

```bash
curl <http://localhost:3001/api/public/health>

````

---

**Vent på output og send til mig!** 📋
