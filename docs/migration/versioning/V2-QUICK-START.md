# V2 Quick Start Guide

**Hurtig guide til at teste den nye V2 arkitektur** 🚀

---

## 🎯 Hvad er V2

V2 er den nye **Shortwave-inspirerede workspace** med:

- ✅ Dedikeret email center (60% af skærmen)
- ✅ Context-aware højre panel (Smart Workspace)
- ✅ Auto-detection af email type (Lead/Booking/Invoice/Customer)
- ✅ Real-time workspace updates

---

## 🚀 Start Appen

### 1. Start Development Server

````bash
npm run dev

```text

Appen starter på: `http://localhost:5000`

### 2. Log Ind

Brug dine normale login credentials.

---

## 🧪 Test V2 Features

### Test 1: Email Selection → Workspace Update

**Forventet adfærd:**

1. Klik på en email i listen
1. Højre panel skifter automatisk baseret på email type
1. Relevant information vises (Lead analyzer, Booking manager, etc.)

**Hvad skal du se:**

```text
Email Type          →  Workspace Shows
─────────────────────────────────────────
Lead email          →  🎯 Lead Analyzer
  (fra rengoring.nu)     - AI estimat

                         - Kalender check
                         - Quick actions

Booking email       →  📅 Booking Manager
  (label: I kalender)    - Booking detaljer

                         - Team info
                         - Timeline

Invoice email       →  💰 Invoice Tracker
  (label: Finance)       - Payment status

                         - Risk analysis
                         - Actions

Customer email      →  👤 Customer Profile
  (multiple threads)     - Historik

                         - Stats
                         - Preferences

No email selected   →  📊 Business Dashboard

                         - Today's bookings
                         - Urgent actions
                         - Week stats

```text

### Test 2: Context Detection

**Test forskellige email typer:**

1. **Lead Email:**
   - Klik på email fra `rengoring.nu` eller `leadpoint.dk`
   - Eller email med label "Leads"
   - Højre panel viser: Lead Analyzer

1. **Booking Email:**
   - Klik på email med label "I kalender"
   - Eller email med "bekræft" i subject
   - Højre panel viser: Booking Manager

1. **Invoice Email:**
   - Klik på email med label "Finance"
   - Eller email med "faktura" i subject
   - Højre panel viser: Invoice Tracker

1. **Customer Email:**
   - Klik på email med mange messages i thread
   - Eller email med label "Afsluttet"
   - Højre panel viser: Customer Profile

### Test 3: No Email Selected

1. Klik tilbage til email liste (uden at vælge email)
1. Højre panel viser: Business Dashboard
1. Se today's bookings, urgent actions, week stats

---

## 🔍 Debug & Troubleshooting

### Check Console Logs

Åbn browser DevTools (F12) og se console:

```javascript
// Du skal se disse logs når du klikker på email:
[EmailTab] setSelectedEmail called
[SmartWorkspace] Context detection started
[SmartWorkspace] Detected context: lead
[SmartWorkspace] Showing LeadAnalyzer

```text

### Verify Context Updates

```javascript
// I browser console, check EmailContext:
// (Dette er kun for debugging)
console.log("Email Context:", window.__emailContext);

```text

### Common Issues

**Issue 1: Højre panel skifter ikke**

- Check: Er email clicked?
- Check: Console errors?
- Fix: Refresh page (Ctrl+R)

**Issue 2: TypeScript errors**

```bash
npm run check

```bash

**Issue 3: Workspace viser forkert component**

- Check: Email labels korrekte?
- Check: Context detection logic i SmartWorkspacePanel.tsx

---

## 📊 Architecture Overview

### File Structure

```bash
V2 Architecture:
├── WorkspaceLayout.tsx          (Main layout - replaces ChatInterface)
├── EmailCenterPanel.tsx         (Middle - only emails)
│   └── EmailTab.tsx             (Calls setSelectedEmail)
├── WorkflowPanelV2.tsx          (Right panel wrapper)
│   └── SmartWorkspacePanel.tsx  (Context detection)
│       ├── LeadAnalyzer.tsx
│       ├── BookingManager.tsx
│       ├── InvoiceTracker.tsx
│       ├── CustomerProfile.tsx
│       └── BusinessDashboard.tsx
└── EmailContext.tsx             (State management)

```text

### Data Flow

```bash

1. User clicks email

   ↓

2. EmailTab.tsx (line ~1872)

   emailContext.setSelectedEmail({ id, subject, from, ... })
   ↓

3. EmailContext.tsx

   setState({ selectedEmail: email })
   ↓

4. SmartWorkspacePanel.tsx (useEffect)

   Detects context based on email
   ↓

5. Renders correct component

   LeadAnalyzer | BookingManager | InvoiceTracker | etc.

```text

---

## 🎨 UI Features

### Email Center (Middle Panel)

- **Full width email list** (60% of screen)
- **No tabs** - dedicated to emails only
- **Collapsible sidebar** (EmailSidebarV2)
- **Density toggle** (comfortable/compact)

### Smart Workspace (Right Panel)

- **Context-aware** - changes based on selected email
- **5 different states** - Lead/Booking/Invoice/Customer/Dashboard
- **Real-time updates** - instant response to email selection
- **Mock data** - Currently shows example data (Phase 4 will add real data)

---

## 🔧 Developer Commands

### Start Development

```bash
npm run dev

```text

### Type Check

```bash
npm run check

```text

### Run Tests

```bash
npm test

```text

### Build Production

```bash
npm run build

````

---

## 📝 What's Working

✅ **Core Functionality:**

- Email selection tracking
- Context detection
- Workspace component switching
- TypeScript compilation
- All tests passing

✅ **UI Components:**

- WorkspaceLayout renders
- EmailCenterPanel shows emails
- SmartWorkspacePanel detects context
- All 5 workspace states render

✅ **Integration:**

- EmailContext updated on click
- SmartWorkspacePanel receives updates
- Correct component shown based on email type

---

## ⏳ What's Pending

⏳ **Phase 4: Real Data Integration**

- Connect to tRPC endpoints
- Real calendar data
- Real invoice data
- Real customer data

⏳ **Phase 5: Mini-Tabs**

- Bottom tabs for Fakturaer, Kalender, Leads, Opgaver
- Drawer system

⏳ **Phase 6: Tests**

- Integration tests
- E2E tests
- Performance tests

---

## 🎯 Success Criteria

### ✅ Must Work (Currently Working)

- [x] Click email → workspace updates
- [x] Different email types → different workspace views
- [x] No TypeScript errors
- [x] App compiles and runs

### ⏳ Should Work (Phase 4)

- [ ] Real data in workspace components
- [ ] API calls to backend
- [ ] Loading states
- [ ] Error handling

### 🎨 Nice to Have (Phase 5+)

- [ ] Mini-tabs functional
- [ ] Animations smooth
- [ ] Mobile responsive
- [ ] Performance optimized

---

## 💡 Tips

### For Testing

1. **Use different email types** - Test all 5 workspace states
1. **Check console logs** - Verify context detection
1. **Try edge cases** - No email selected, multiple clicks, etc.

### For Development

1. **Hot reload works** - Changes reflect immediately
1. **TypeScript strict** - Fix errors as they appear
1. **Component isolation** - Each workspace component is independent

### For Debugging

1. **React DevTools** - Inspect component state
1. **Console logs** - Added throughout for debugging
1. **Network tab** - Check API calls (Phase 4)

---

## 📞 Need Help

### Documentation

- `docs/V2-ARCHITECTURE-COMPLETE.md` - Full architecture
- `docs/V2-MIGRATION-COMPLETE-PLAN.md` - Migration details
- `docs/V2-IMPLEMENTATION-SUMMARY.md` - What was built

### Key Files

- `client/src/pages/WorkspaceLayout.tsx` - Main layout
- `client/src/components/panels/SmartWorkspacePanel.tsx` - Context detection
- `client/src/contexts/EmailContext.tsx` - State management

### Common Questions

**Q: Why is workspace showing mock data?**
A: Phase 4 (real data integration) is pending. Mock data proves the concept works.

**Q: Where are Fakturaer/Kalender/Leads/Opgaver tabs?**
A: Phase 5 (mini-tabs) will add these as bottom tabs with drawer system.

**Q: Can I rollback to V1?**
A: Yes! In `App.tsx`, change import to `ChatInterface` instead of `WorkspaceLayout`.

---

## 🎉 Enjoy Testing V2

**Core functionality is working - test it and see the magic!** ✨

**Next:** Phase 4 will add real data integration for production-ready features.
