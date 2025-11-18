# CRM System - Quick Access Guide

**Status:** ✅ System Kører  
**Frontend:** http://localhost:5174  
**Backend:** http://localhost:3000  
**Database:** localhost:3307

## 🚀 Hurtig Adgang til CRM

### Option 1: Standard CRM (Anbefalet)

**CRM Dashboard:**

```
http://localhost:5174/crm/dashboard
```

**Alle CRM Sider:**

- **Dashboard:** http://localhost:5174/crm/dashboard
- **Customers:** http://localhost:5174/crm/customers
- **Leads:** http://localhost:5174/crm/leads
- **Opportunities:** http://localhost:5174/crm/opportunities
- **Segments:** http://localhost:5174/crm/segments
- **Bookings:** http://localhost:5174/crm/bookings

### Option 2: CRM Standalone Debug Mode

**Standalone Home:**

```
http://localhost:5174/crm-standalone
```

**Standalone Routes:**

- Dashboard: http://localhost:5174/crm-standalone/dashboard
- Customers: http://localhost:5174/crm-standalone/customers
- Leads: http://localhost:5174/crm-standalone/leads
- Opportunities: http://localhost:5174/crm-standalone/opportunities

### Option 3: Via Workspace Menu

1. Gå til: http://localhost:5174
2. Log ind (hvis nødvendigt)
3. Klik på User Menu (øverst til højre)
4. Vælg "CRM Dashboard" eller "Customers"

## ✨ Nye Features Du Kan Se

### 1. CSV Export

- **Customers:** Klik "Export CSV" knap på Customer List
- **Leads:** Klik "Export CSV" knap på Lead Pipeline
- **Opportunities:** Klik "Export CSV" knap på Opportunity Pipeline

### 2. Data-TestID Attributes

- Alle vigtige elementer har nu `data-testid` for bedre testbarhed
- Se i browser DevTools (F12) → Elements

### 3. Forbedret Navigation

- Konsistent navigation i alle CRM sider
- Active state highlighting
- Responsive design

## 🧪 Test Features

### Test CSV Export:

1. Gå til http://localhost:5174/crm/customers
2. Klik på "Export CSV" knap (hvis der er kunder)
3. CSV fil downloades automatisk

### Test Lead Pipeline:

1. Gå til http://localhost:5174/crm/leads
2. Se Kanban board med leads
3. Klik "Create Lead" for at oprette ny lead
4. Test CSV export

### Test Opportunities:

1. Gå til http://localhost:5174/crm/opportunities
2. Se pipeline med opportunities
3. Test CSV export

## 📊 System Status

✅ **Database:** Running (port 3307)  
✅ **Backend:** Running (port 3000)  
✅ **Frontend:** Running (port 5174)  
✅ **TypeScript:** No errors  
✅ **Linter:** Only import order warnings (non-critical)

## 🎯 Næste Skridt

1. **Åbn CRM Dashboard** i browseren
2. **Test CSV exports** på alle tre sider
3. **Opret test data** hvis nødvendigt
4. **Verificer alle features** virker korrekt

## 🔧 Troubleshooting

**Hvis siden ikke loader:**

- Tjek at backend kører: http://localhost:3000/health
- Tjek browser console for fejl (F12)
- Tjek at du er logget ind

**Hvis CSV export ikke virker:**

- Tjek browser console for fejl
- Verificer at der er data at eksportere
- Test med browser DevTools Network tab

---

**Klar til at se resultatet! 🎉**
