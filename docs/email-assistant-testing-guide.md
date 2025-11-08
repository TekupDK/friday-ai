/**
 * Phase 10: Email Assistant Testing Guide
 * 
 * Step-by-step guide til at teste AI Email Assistant
 */

# 🎯 **EMAIL ASSISTANT TESTING GUIDE**

## 🚀 **QUICK START - LOKAL TESTING:**

### **1. START DEVELOPMENT SERVER:**
```bash
npm run dev
```

### **2. ÅBEN WORKSPACE:**
- Gå til: http://localhost:5173 (eller 3000)
- Login med jeres credentials
- Åbn workspace view

### **3. FIND EMAIL TIL TESTING:**
- Gå til venstre panel (email list)
- Find en email der ligner:
  * Rengørings henvendelse
  * Pris forespørgsel
  * Booking request

### **4. ÅBN EMAIL I MIDTERSTE PANEL:**
- Klik på emailen
- Vent på at EmailThreadView åbner
- Se AI Assistant load under label suggestions

## 🎨 **HVAD DU SKAL SE:**

### **✨ AI EMAIL ASSISTANT VISER:**
```
┌─────────────────────────────────┐
│ ✨ AI Email Assistant (3-4)      │
├─────────────────────────────────┤
│ 👤 Kunde: [Navn]                │
│ 🏢 Job: [Type]                  │
│ 📍 [Lokation] • ⚡ [Urgency]    │
│ 💰 [Pris] • ⏰ [Tid]            │
│ 🏷️ Source: [Kilde]             │
├─────────────────────────────────┤
│ 💡 AI Forslag:                   │
│ [Prisoverslag %] [Info %]       │
│ [Booking %] [Special %]         │
├─────────────────────────────────┤
│ ✏️ Email Kladde:                 │
│ [AI-genereret content...]       │
│ [Insert Reply] [Send Email]     │
└─────────────────────────────────┘
```

## 🧪 **TESTING STEPS:**

### **1. AI ANALYSE TEST:**
- ✅ Kunde navn ekstraheres?
- ✅ Job type genkendes?
- ✅ Location detekteres?
- ✅ Prisestimering vises?
- ✅ Source detection virker?

### **2. FORSLAG TEST:**
- ✅ 3-4 forslag vises?
- ✅ Confidence scores virker?
- ✅ Reasoning er relevant?
- ✅ Kategorier er korrekte?

### **3. INTERAKTION TEST:**
- ✅ Klik på forslag virker?
- ✅ Tekst indsættes i editor?
- ✅ Redigering virker?
- ✅ Insert Reply knap virker?
- ✅ Send Email knap virker?

### **4. INTEGRATION TEST:**
- ✅ Passer i 3-panel layout?
- ✅ Loading states virker?
- ✅ Error handling virker?
- ✅ Responsive design?

## 🐛 **HVIS DER ER PROBLEMER:**

### **COMMON ISSUES:**
1. **AI Assistant vises ikke:**
   - Check browser console for errors
   - Verify tRPC endpoints virker
   - Check email data format

2. **Forslag er tomme:**
   - Check server logs
   - Verify email analysis engine
   - Check API responses

3. **Insert/Send virker ikke:**
   - Check Gmail integration
   - Verify permissions
   - Check tRPC mutations

### **DEBUGGING:**
```bash
# Check server logs
npm run dev:server

# Check browser console
F12 → Console tab

# Network requests
F12 → Network tab → tpc requests
```

## 🎯 **SUCCESS KRITERIER:**

### **✅ WORKING = SUCCESS:**
- AI Assistant vises under label suggestions
- 3-4 relevante forslag genereres
- One-click insertion virker
- Email kan sendes via AI
- Analytics logging virker

### **🏆 EXCELLENT = BONUS:**
- Forslag er super relevante
- Prisestimering er præcis
- Source detection virker perfekt
- User experience er seamless

---

## 🚀 **NÆSTE SKRIDT EFTER TESTING:**

### **1. FEEDBACK COLLECTION:**
- Noter hvad der virker
- Noter hvad der kan forbedres
- Tag screenshots af issues

### **2. DEPLOYMENT:**
- Fix eventuelle bugs
- Deploy til staging
- Test med rigtige Gmail data

### **3. PRODUCTION ROLLOUT:**
- Deploy til production
- Monitor performance
- Collect user feedback

**God testing!** 🎯
