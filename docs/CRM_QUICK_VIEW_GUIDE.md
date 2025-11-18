# CRM System - Quick View Guide

**Status:** ✅ System Kører  
**Date:** 2025-11-17

## 🚀 Hurtig Adgang

### System Status
- ✅ **Database:** Running (port 3307)
- ✅ **Backend:** Running (port 3000)
- ✅ **Frontend:** Running (port 5174)

### Direkte Links

**CRM Dashboard:**
```
http://localhost:5174/crm/dashboard
```

**Alle CRM Sider:**
- Dashboard: http://localhost:5174/crm/dashboard
- Customers: http://localhost:5174/crm/customers
- Leads: http://localhost:5174/crm/leads
- Opportunities: http://localhost:5174/crm/opportunities
- Segments: http://localhost:5174/crm/segments
- Bookings: http://localhost:5174/crm/bookings

## 🔐 Login

Hvis du ser en blank side eller login side:

1. **Log ind** med dine credentials
2. **Efter login:** Du bliver redirected til workspace
3. **Naviger til CRM:**
   - User Menu (øverst til højre) → "CRM Dashboard"
   - Eller direkte: http://localhost:5174/crm/dashboard

## ✨ Features Du Kan Se

### 1. CRM Dashboard
- 📊 Statistics cards
- 📈 Revenue chart
- 📅 Recent activity
- 🎯 KPI metrics

### 2. Customer List
- 👥 Customer table
- 🔍 Search functionality
- ➕ Create customer button
- 📥 Export CSV button

### 3. Lead Pipeline
- 🎯 Kanban board
- 📋 Lead status columns
- ➕ Create lead button
- 📥 Export CSV button

### 4. Opportunity Pipeline
- 💼 Sales pipeline
- 💰 Value tracking
- 📅 Expected close dates
- ➕ Create opportunity button
- 📥 Export CSV button

## 🎯 Prøv Disse Ting

1. **Se Dashboard** - Oversigt med statistikker
2. **Opret Test Data** - Brug "Create" knapperne
3. **Test CSV Export** - Klik "Export CSV" på hver side
4. **Naviger Mellem Sider** - Brug top navigation

## 🔧 Hvis Noget Ikke Virker

### Blank Page
- Tjek at du er logget ind
- Tjek browser console (F12) for fejl
- Verificer backend: http://localhost:3000/health

### Login Issues
- Tjek backend kører: http://localhost:3000/health
- Tjek database kører: port 3307
- Tjek browser console for fejl

### CSV Export Issues
- Tjek browser console for fejl
- Verificer at der er data at eksportere
- Test med browser DevTools Network tab

---

**Klar til at se CRM systemet! 🎉**

