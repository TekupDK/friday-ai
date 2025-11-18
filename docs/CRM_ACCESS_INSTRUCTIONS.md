# CRM System - Adgangs Instruktioner

## 🔐 Login Påkrævet

CRM systemet kræver login før adgang. Hvis du ser en blank side, skal du logge ind først.

## 🚀 Hurtig Adgang

### Option 1: Log Ind (Anbefalet)

1. **Gå til:** http://localhost:5174
2. **Log ind** med dine credentials
3. **Naviger til CRM:**
   - Klik på **User Menu** (øverst til højre)
   - Vælg **"CRM Dashboard"**
   - Eller gå direkte til: http://localhost:5174/crm/dashboard

### Option 2: CRM Standalone Mode (Måske uden login)

**Prøv denne URL:**
```
http://localhost:5174/crm-standalone
```

Standalone mode kan have mindre authentication requirements.

## 🔧 Troubleshooting Blank Page

### Hvis siden er blank:

1. **Tjek Browser Console (F12)**
   - Åbn Developer Tools (F12)
   - Gå til "Console" tab
   - Se efter fejlmeddelelser
   - Del fejlmeddelelserne hvis du ser nogen

2. **Tjek Network Tab**
   - I Developer Tools, gå til "Network" tab
   - Refresh siden (F5)
   - Se om der er failed requests (røde)

3. **Verificer Services**
   - Backend: http://localhost:3000/health
   - Frontend: http://localhost:5174
   - Database: port 3307

4. **Prøv Hard Refresh**
   - Windows: Ctrl + Shift + R
   - Eller: Ctrl + F5

## 📋 Login Steps

1. **Åbn:** http://localhost:5174
2. **Login side vises** (hvis ikke logget ind)
3. **Indtast email og password**
4. **Klik "Log ind"**
5. **Efter login:** Du bliver redirected til workspace
6. **Naviger til CRM:**
   - User Menu → CRM Dashboard
   - Eller direkte: http://localhost:5174/crm/dashboard

## 🎯 Direkte CRM Links (Efter Login)

- **Dashboard:** http://localhost:5174/crm/dashboard
- **Customers:** http://localhost:5174/crm/customers
- **Leads:** http://localhost:5174/crm/leads
- **Opportunities:** http://localhost:5174/crm/opportunities
- **Segments:** http://localhost:5174/crm/segments
- **Bookings:** http://localhost:5174/crm/bookings

## ⚠️ Hvis Login Ikke Virker

1. **Tjek backend:** http://localhost:3000/health
2. **Tjek database:** Port 3307
3. **Tjek browser console** for fejl
4. **Prøv incognito/private window**

---

**Næste skridt:** Log ind på http://localhost:5174 og derefter naviger til CRM Dashboard!

