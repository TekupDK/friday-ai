# CRM System - Første Gang Guide

**Velkommen til CRM systemet! 🎉**

## 🚀 Hurtig Start

**CRM Dashboard er nu åbnet i din browser:**
```
http://localhost:5174/crm/dashboard
```

## 📊 Hvad Du Kan Se

### 1. CRM Dashboard
**URL:** http://localhost:5174/crm/dashboard

**Features:**
- 📈 **Statistikker** - Oversigt over kunder, leads, opportunities
- 📊 **Revenue Chart** - Graf over omsætning
- 🎯 **KPI Cards** - Vigtige metrics
- 📅 **Recent Activity** - Seneste aktiviteter

### 2. Customer List
**URL:** http://localhost:5174/crm/customers

**Features:**
- 👥 **Kunde liste** - Alle kunder i systemet
- 🔍 **Search** - Søg efter kunder
- ➕ **Create Customer** - Opret ny kunde
- 📥 **Export CSV** - Download kunder som CSV
- 📊 **Filters** - Filtrer efter status, type, osv.

### 3. Lead Pipeline
**URL:** http://localhost:5174/crm/leads

**Features:**
- 🎯 **Kanban Board** - Leads organiseret i kolonner
- 📋 **Lead Status** - New, Contacted, Qualified, Converted, Lost
- ➕ **Create Lead** - Opret ny lead
- 📥 **Export CSV** - Download leads som CSV
- 🔄 **Drag & Drop** - Flyt leads mellem status

### 4. Opportunity Pipeline
**URL:** http://localhost:5174/crm/opportunities

**Features:**
- 💼 **Sales Pipeline** - Opportunities i forskellige stadier
- 💰 **Value Tracking** - Spor værdi af hver opportunity
- 📅 **Expected Close Date** - Forventet lukkedato
- ➕ **Create Opportunity** - Opret ny opportunity
- 📥 **Export CSV** - Download opportunities som CSV

### 5. Customer Segments
**URL:** http://localhost:5174/crm/segments

**Features:**
- 🎯 **Segment Management** - Organiser kunder i segmenter
- 📊 **Segment Analytics** - Statistikker per segment
- ➕ **Create Segment** - Opret nyt segment

### 6. Booking Calendar
**URL:** http://localhost:5174/crm/bookings

**Features:**
- 📅 **Calendar View** - Kalender visning af bookinger
- ➕ **Create Booking** - Opret ny booking
- 📋 **Booking List** - Liste over alle bookinger

## ✨ Nye Features Du Kan Prøve

### CSV Export
1. Gå til **Customer List**, **Lead Pipeline**, eller **Opportunity Pipeline**
2. Klik på **"Export CSV"** knappen
3. CSV fil downloades automatisk med alle data

### Navigation
- **Top Navigation** - Gå mellem CRM sider
- **Active State** - Se hvilken side du er på
- **Responsive** - Fungerer på alle skærmstørrelser

### Search & Filter
- **Customer List** - Søg efter kunder
- **Lead Pipeline** - Filtrer leads efter status
- **Opportunities** - Filtrer efter stage

## 🎯 Prøv Disse Ting

### 1. Se Dashboard
- Gå til http://localhost:5174/crm/dashboard
- Se statistikker og metrics
- Check revenue chart

### 2. Opret Test Data
- Gå til **Customer List** → Klik **"Create Customer"**
- Gå til **Lead Pipeline** → Klik **"Create Lead"**
- Gå til **Opportunities** → Klik **"Create Opportunity"**

### 3. Test CSV Export
- Gå til **Customer List**
- Klik **"Export CSV"**
- Check downloadede CSV fil

### 4. Test Navigation
- Klik gennem alle CRM sider
- Se navigation highlight
- Test responsive design

## 🔧 Hvis Noget Ikke Virker

### Siden Loader Ikke
1. Tjek at backend kører: http://localhost:3000/health
2. Tjek browser console (F12) for fejl
3. Tjek at du er logget ind

### Ingen Data Vises
- Systemet kan være tomt første gang
- Opret test data via "Create" knapperne
- Check database connection

### CSV Export Virker Ikke
- Tjek browser console for fejl
- Verificer at der er data at eksportere
- Test med browser DevTools Network tab

## 📱 Alternative Adgangsmåder

### Standalone Mode
**URL:** http://localhost:5174/crm-standalone

Isoleret CRM modul for debugging og development.

### Via Workspace
1. Gå til http://localhost:5174
2. Log ind
3. Klik på **User Menu** (øverst til højre)
4. Vælg **"CRM Dashboard"**

## 🎨 Design Features

- **Modern UI** - Clean og professionel design
- **Responsive** - Fungerer på desktop, tablet, mobil
- **Dark Mode Ready** - Støtter dark mode
- **Accessible** - WCAG compliant
- **Fast** - Optimized performance

## 📊 System Status

✅ **Database:** Running (port 3307)  
✅ **Backend:** Running (port 3000)  
✅ **Frontend:** Running (port 5174)  
✅ **All Services:** Healthy

---

**God fornøjelse med CRM systemet! 🚀**

Hvis du har spørgsmål eller finder bugs, så sig til!

