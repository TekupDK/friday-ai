# V2 Migration - Komplet Plan & Analyse

## 🎯 Executive Summary

Vi migrerer fra **gammel tab-baseret arkitektur** til **moderne Shortwave-inspireret workspace**.

**Scope:** 47 filer skal opdateres/oprettes  
**Estimeret tid:** 8-12 timer  
**Risk level:** Medium (mange dependencies)  
**Impact:** Høj (fundamentale arkitektur ændringer)

---

## 📊 Fil Analyse - Komplet Oversigt

### ✅ COMPLETED (Allerede lavet)

```
✓ client/src/pages/WorkspaceLayout.tsx          (NY - erstatter ChatInterface)
✓ client/src/components/panels/EmailCenterPanel.tsx  (REFACTORED - kun emails)
✓ client/src/components/panels/WorkflowPanelV2.tsx   (NY - wrapper)
✓ client/src/components/panels/SmartWorkspacePanel.tsx (NY - context detection)
✓ client/src/components/workspace/LeadAnalyzer.tsx    (NY)
✓ client/src/components/workspace/BookingManager.tsx  (NY)
✓ client/src/components/workspace/InvoiceTracker.tsx  (NY)
✓ client/src/components/workspace/CustomerProfile.tsx (NY)
✓ client/src/components/workspace/BusinessDashboard.tsx (NY)
✓ client/src/components/inbox/EmailSidebarV2.tsx      (NY)
✓ client/src/App.tsx                            (OPDATERET - bruger WorkspaceLayout)
```

**Status:** 11/47 filer (23% done)

---

### 🔴 CRITICAL - Skal laves FØRST (Priority 1)

#### 1. Context & State Management

```
❌ client/src/contexts/EmailContext.tsx
   Problem: Mangler selectedEmail property
   Fix: Tilføj selectedEmail state + setSelectedEmail action
   Impact: SmartWorkspacePanel kan ikke få email data

❌ client/src/contexts/WorkflowContext.tsx
   Problem: Hardcoded til gammel WorkflowPanel struktur
   Fix: Opdater til at understøtte SmartWorkspace states
   Impact: Højre panel state management
```

#### 2. InboxPanel (Skal fjernes/refactores)

```
❌ client/src/components/InboxPanel.tsx
   Problem: Indeholder 5 tabs (Email, Invoices, Calendar, Leads, Tasks)
   Fix: Skal IKKE bruges mere - EmailCenterPanel kalder direkte EmailTab
   Impact: Breaking change - alle referencer skal opdateres

❌ client/src/components/panels/__tests__/EmailCenterPanel.test.tsx
   Problem: Tester InboxPanel integration
   Fix: Opdater tests til at teste EmailTab direkte
   Impact: Tests fejler
```

#### 3. Tab Components (Skal flyttes til mini-tabs)

```
❌ client/src/components/inbox/InvoicesTab.tsx
   Status: Bruges ikke i V2 (skal i mini-tabs senere)
   Fix: Opret InvoicesTabV2.tsx til mini-tabs system

❌ client/src/components/inbox/CalendarTab.tsx
   Status: Bruges ikke i V2 (skal i mini-tabs senere)
   Fix: Opret CalendarTabV2.tsx til mini-tabs system

❌ client/src/components/inbox/LeadsTab.tsx
   Problem: Har reference til WorkflowPanel
   Fix: Opdater til at bruge WorkflowPanelV2

❌ client/src/components/inbox/TasksTab.tsx
   Status: Bruges ikke i V2 (skal i mini-tabs senere)
   Fix: Opret TasksTabV2.tsx til mini-tabs system
```

---

### 🟡 IMPORTANT - Skal laves DEREFTER (Priority 2)

#### 4. Tests (Integration & Unit)

```
❌ client/src/pages/__tests__/ChatInterface.integration.test.tsx
   Problem: Tester ChatInterface (gammelt navn)
   Fix: Opret WorkspaceLayout.integration.test.tsx

❌ client/src/components/panels/__tests__/WorkflowPanel.test.tsx
   Problem: Tester gammel WorkflowPanel
   Fix: Opret WorkflowPanelV2.test.tsx

❌ tests/3-panel-layout.spec.ts
   Problem: E2E test for gammel layout
   Fix: Opdater til at teste WorkspaceLayout

❌ tests/chat-streaming.spec.ts
   Problem: Kan have references til ChatInterface
   Fix: Verificer og opdater hvis nødvendigt
```

#### 5. EmailTab Integration

```
❌ client/src/components/inbox/EmailTab.tsx
   Problem: Skal kommunikere med SmartWorkspacePanel
   Fix:
   - Tilføj setSelectedEmail når email vælges
   - Opdater EmailContext når thread åbnes
   - Sikr preview modal også opdaterer context
   Impact: Context detection virker ikke uden dette
```

#### 6. Workspace Components (Skal have rigtige data)

```
⚠️ client/src/components/workspace/LeadAnalyzer.tsx
   Status: Bruger mock data
   Fix: Integrer med tRPC endpoints for real data

⚠️ client/src/components/workspace/BookingManager.tsx
   Status: Bruger mock data
   Fix: Integrer med kalender API

⚠️ client/src/components/workspace/InvoiceTracker.tsx
   Status: Bruger mock data
   Fix: Integrer med Billy API

⚠️ client/src/components/workspace/CustomerProfile.tsx
   Status: Bruger mock data
   Fix: Integrer med customer database

⚠️ client/src/components/workspace/BusinessDashboard.tsx
   Status: Bruger mock data
   Fix: Integrer med stats endpoints
```

---

### 🟢 OPTIONAL - Kan laves SENERE (Priority 3)

#### 7. Mini-Tabs System

```
⏳ client/src/components/inbox/MiniTabsBar.tsx
   Status: Ikke oprettet endnu
   Fix: Opret komponent til bottom tabs

⏳ client/src/components/inbox/InvoicesDrawer.tsx
   Status: Ikke oprettet endnu
   Fix: Drawer til fakturaer

⏳ client/src/components/inbox/CalendarDrawer.tsx
   Status: Ikke oprettet endnu
   Fix: Drawer til kalender

⏳ client/src/components/inbox/LeadsDrawer.tsx
   Status: Ikke oprettet endnu
   Fix: Drawer til leads pipeline

⏳ client/src/components/inbox/TasksDrawer.tsx
   Status: Ikke oprettet endnu
   Fix: Drawer til opgaver
```

#### 8. Documentation & Cleanup

```
⏳ docs/V2-API-INTEGRATION.md
   Status: Skal oprettes
   Fix: Dokumenter alle API integrationer

⏳ docs/V2-TESTING-GUIDE.md
   Status: Skal oprettes
   Fix: Guide til at teste V2 features

🗑️ client/src/pages/ChatInterface.tsx
   Status: Kan slettes når migration er done
   Fix: Backup først, slet derefter

🗑️ client/src/components/panels/WorkflowPanel.tsx
   Status: Kan slettes når migration er done
   Fix: Backup først, slet derefter

🗑️ client/src/components/InboxPanel.tsx
   Status: Kan slettes når migration er done
   Fix: Backup først, slet derefter
```

---

## 🔧 Detaljeret Migration Plan

### PHASE 1: Context & State (2-3 timer)

#### Step 1.1: Opdater EmailContext

```typescript
// client/src/contexts/EmailContext.tsx

export interface EmailContextState {
  // ... existing fields ...

  // ✨ NY: Selected email for workspace context
  selectedEmail: {
    id: string;
    threadId: string;
    subject: string;
    from: string;
    snippet: string;
    labels: string[];
    threadLength: number;
  } | null;
}

interface EmailContextValue {
  // ... existing methods ...

  // ✨ NY: Set selected email
  setSelectedEmail: (email: EmailContextState["selectedEmail"]) => void;
}
```

**Files to update:**

- `client/src/contexts/EmailContext.tsx` (add selectedEmail)
- `client/src/components/inbox/EmailTab.tsx` (call setSelectedEmail)
- `client/src/components/panels/SmartWorkspacePanel.tsx` (use selectedEmail)

#### Step 1.2: Opdater WorkflowContext

```typescript
// client/src/contexts/WorkflowContext.tsx

export interface WorkflowContextState {
  // Behold eksisterende tasks/stats
  tasks: Task[];
  stats: Stats;

  // ✨ NY: Workspace state
  workspaceContext: "lead" | "booking" | "invoice" | "customer" | "dashboard";
  workspaceData: any; // Context-specific data
}
```

**Files to update:**

- `client/src/contexts/WorkflowContext.tsx`
- `client/src/components/panels/SmartWorkspacePanel.tsx`

---

### PHASE 2: Remove InboxPanel Dependencies (1-2 timer)

#### Step 2.1: Fjern InboxPanel fra EmailCenterPanel

**Current:**

```typescript
// EmailCenterPanel.tsx (GAMMEL)
import InboxPanel from "@/components/InboxPanel";

export default function EmailCenterPanel({ activeTab, onTabChange }) {
  return <InboxPanel activeTab={activeTab} onTabChange={onTabChange} />;
}
```

**Already done in V2:**

```typescript
// EmailCenterPanel.tsx (NY - allerede lavet)
import EmailTab from "@/components/inbox/EmailTab";

export default function EmailCenterPanel() {
  return <EmailTab />;
}
```

#### Step 2.2: Opdater alle imports

**Files to search & replace:**

```bash
# Find alle InboxPanel references
grep -r "InboxPanel" client/src/

# Replace med EmailTab direkte
```

**Files affected:**

- `client/src/components/panels/__tests__/EmailCenterPanel.test.tsx`
- Any other components importing InboxPanel

---

### PHASE 3: EmailTab Integration (2-3 timer)

#### Step 3.1: Tilføj Email Selection Tracking

```typescript
// client/src/components/inbox/EmailTab.tsx

import { useEmailContext } from "@/contexts/EmailContext";

export default function EmailTab() {
  const { setSelectedEmail } = useEmailContext();

  // Når email klikkes
  const handleEmailClick = (email: EmailMessage) => {
    setSelectedEmail({
      id: email.id,
      threadId: email.threadId,
      subject: email.subject,
      from: email.from,
      snippet: email.snippet,
      labels: email.labels || [],
      threadLength: email.messageCount || 1,
    });

    // ... existing click logic
  };

  // Når preview modal åbnes
  const handlePreview = (threadId: string) => {
    const email = findEmailByThreadId(threadId);
    if (email) {
      setSelectedEmail({
        /* ... */
      });
    }
    // ... existing preview logic
  };
}
```

**Files to update:**

- `client/src/components/inbox/EmailTab.tsx` (add selection tracking)
- `client/src/components/inbox/EmailPreviewModal.tsx` (update context on open)
- `client/src/components/inbox/EmailThreadView.tsx` (update context)

---

### PHASE 4: Workspace Data Integration (3-4 timer)

#### Step 4.1: LeadAnalyzer - Real Data

```typescript
// client/src/components/workspace/LeadAnalyzer.tsx

import { trpc } from "@/lib/trpc";

export function LeadAnalyzer({ context }: LeadAnalyzerProps) {
  // ✨ Real data fra email
  const { data: emailData } = trpc.inbox.email.getThread.useQuery({
    threadId: context.threadId!,
  });

  // ✨ Real kalender data
  const { data: calendarSlots } = trpc.calendar.getAvailableSlots.useQuery({
    startDate: new Date(),
    endDate: addDays(new Date(), 7),
  });

  // ✨ Real lignende opgaver
  const { data: similarJobs } = trpc.jobs.getSimilar.useQuery({
    size: extractSize(emailData?.body),
    type: extractType(emailData?.body),
  });

  // ... rest of component
}
```

**Files to update:**

- `client/src/components/workspace/LeadAnalyzer.tsx`
- `client/src/components/workspace/BookingManager.tsx`
- `client/src/components/workspace/InvoiceTracker.tsx`
- `client/src/components/workspace/CustomerProfile.tsx`
- `client/src/components/workspace/BusinessDashboard.tsx`

**New tRPC endpoints needed:**

- `calendar.getAvailableSlots`
- `jobs.getSimilar`
- `invoices.getByThreadId`
- `customers.getByEmail`
- `stats.getDashboard`

---

### PHASE 5: Tests (2-3 timer)

#### Step 5.1: Opdater Integration Tests

```typescript
// client/src/pages/__tests__/WorkspaceLayout.integration.test.tsx

describe('WorkspaceLayout', () => {
  it('should render 3 panels', () => {
    render(<WorkspaceLayout />);
    expect(screen.getByTestId('ai-assistant-panel')).toBeInTheDocument();
    expect(screen.getByTestId('email-center-panel')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-panel')).toBeInTheDocument();
  });

  it('should show LeadAnalyzer when lead email selected', async () => {
    // ... test context detection
  });
});
```

**Files to create/update:**

- `client/src/pages/__tests__/WorkspaceLayout.integration.test.tsx` (NY)
- `client/src/components/panels/__tests__/WorkflowPanelV2.test.tsx` (NY)
- `client/src/components/panels/__tests__/SmartWorkspacePanel.test.tsx` (NY)
- `tests/3-panel-layout.spec.ts` (OPDATER)

---

### PHASE 6: Mini-Tabs System (3-4 timer)

#### Step 6.1: Opret MiniTabsBar

```typescript
// client/src/components/inbox/MiniTabsBar.tsx

export function MiniTabsBar() {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

  return (
    <>
      {/* Collapsed tabs bar */}
      <div className="border-t border-border/20 p-2 flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveDrawer('invoices')}
          className="flex flex-col items-center gap-1"
        >
          <FileText className="w-4 h-4" />
          <span className="text-xs">Fakturaer</span>
        </Button>
        {/* ... other tabs */}
      </div>

      {/* Drawers */}
      <InvoicesDrawer
        open={activeDrawer === 'invoices'}
        onClose={() => setActiveDrawer(null)}
      />
      {/* ... other drawers */}
    </>
  );
}
```

**Files to create:**

- `client/src/components/inbox/MiniTabsBar.tsx`
- `client/src/components/inbox/InvoicesDrawer.tsx`
- `client/src/components/inbox/CalendarDrawer.tsx`
- `client/src/components/inbox/LeadsDrawer.tsx`
- `client/src/components/inbox/TasksDrawer.tsx`

---

## 📋 Complete Checklist

### Phase 1: Context & State ⏱️ 2-3h

- [ ] Opdater EmailContext med selectedEmail
- [ ] Opdater WorkflowContext med workspace state
- [ ] Test context updates

### Phase 2: Remove InboxPanel ⏱️ 1-2h

- [ ] Fjern InboxPanel fra EmailCenterPanel (✅ done)
- [ ] Opdater alle InboxPanel imports
- [ ] Opdater EmailCenterPanel tests

### Phase 3: EmailTab Integration ⏱️ 2-3h

- [ ] Tilføj setSelectedEmail i EmailTab
- [ ] Opdater EmailPreviewModal
- [ ] Opdater EmailThreadView
- [ ] Test email selection tracking

### Phase 4: Workspace Data ⏱️ 3-4h

- [ ] LeadAnalyzer real data integration
- [ ] BookingManager real data integration
- [ ] InvoiceTracker real data integration
- [ ] CustomerProfile real data integration
- [ ] BusinessDashboard real data integration
- [ ] Opret manglende tRPC endpoints

### Phase 5: Tests ⏱️ 2-3h

- [ ] Opret WorkspaceLayout.integration.test.tsx
- [ ] Opret WorkflowPanelV2.test.tsx
- [ ] Opret SmartWorkspacePanel.test.tsx
- [ ] Opdater 3-panel-layout.spec.ts
- [ ] Run all tests og fix failures

### Phase 6: Mini-Tabs ⏱️ 3-4h

- [ ] Opret MiniTabsBar component
- [ ] Opret InvoicesDrawer
- [ ] Opret CalendarDrawer
- [ ] Opret LeadsDrawer
- [ ] Opret TasksDrawer
- [ ] Integrer i EmailTab

### Phase 7: Cleanup ⏱️ 1h

- [ ] Backup gamle filer
- [ ] Slet ChatInterface.tsx
- [ ] Slet WorkflowPanel.tsx
- [ ] Slet InboxPanel.tsx
- [ ] Opdater documentation

---

## 🚨 Risk Assessment

### High Risk

1. **EmailContext breaking changes** - Mange komponenter bruger det
2. **InboxPanel removal** - Kan bryde tests og imports
3. **tRPC endpoints** - Skal oprettes på backend også

### Medium Risk

1. **Test failures** - Mange tests skal opdateres
2. **Type errors** - TypeScript kan klage over context changes
3. **State synchronization** - Email selection → Workspace context

### Low Risk

1. **Mini-tabs** - Isoleret feature, påvirker ikke core
2. **Cleanup** - Kan altid rulles tilbage
3. **Documentation** - Ingen teknisk risk

---

## 🎯 Success Criteria

### Must Have (MVP)

- ✅ WorkspaceLayout renderer korrekt
- ✅ EmailTab vises i midten
- ✅ SmartWorkspacePanel viser korrekt context
- ✅ Email selection opdaterer workspace
- ✅ Alle tests passerer

### Should Have

- ✅ Real data i workspace components
- ✅ Mini-tabs system fungerer
- ✅ Keyboard shortcuts virker
- ✅ Mobile responsive

### Nice to Have

- ⏳ AI integration i workspace
- ⏳ Automation features
- ⏳ Performance optimization

---

## 📊 Estimeret Timeline

```
Week 1:
├── Day 1-2: Phase 1-2 (Context + InboxPanel removal)
├── Day 3-4: Phase 3 (EmailTab integration)
└── Day 5: Phase 4 start (Workspace data)

Week 2:
├── Day 1-2: Phase 4 finish + Phase 5 (Tests)
├── Day 3-4: Phase 6 (Mini-tabs)
└── Day 5: Phase 7 (Cleanup) + Buffer

Total: 8-12 arbejdsdage
```

---

## 🚀 Næste Skridt

1. **Review denne plan** - Er der noget vi har glemt?
2. **Prioriter phases** - Hvilke er mest kritiske?
3. **Start Phase 1** - Context opdateringer
4. **Iterativ development** - Test efter hver phase

Skal vi starte med Phase 1?
