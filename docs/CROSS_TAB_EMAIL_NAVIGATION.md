# Cross-Tab Email Navigation - Implementeringsguide

## ✅ Komplet implementeret!

**Feature**: Automatisk tab-skift og email-åbning når du klikker email i LeadsTab Timeline.

---

## 🎯 Hvad virker nu

### Flowet

```
LeadsTab → Klik lead → CustomerProfile åbner (Timeline-tab)
                                    ↓
                      Klik email i Timeline
                                    ↓
                CustomerProfile lukker + skift til EmailTab
                                    ↓
                          Email åbner automatisk
```

### Før vs. Nu

| Før                              | Nu                           |
| -------------------------------- | ---------------------------- |
| Toast: "Skift til Emails-tabben" | ✅ Automatisk tab-skift      |
| Manual navigation                | ✅ Email åbner direkte       |
| Ingen state-deling               | ✅ EmailContext koordinering |

---

## 🛠️ Teknisk Implementation

### 1. **EmailContext** (`client/src/contexts/EmailContext.tsx`)

Tilføjet cross-tab navigation state:

```typescript
interface EmailContextState {
  // ... existing fields
  pendingThreadToOpen: string | null; // NEW: Thread to open from other tabs
}

interface EmailContextValue {
  // ... existing methods
  requestOpenThread: (threadId: string) => void; // NEW: Request to open thread
  clearPendingThread: () => void; // NEW: Clear pending state
}
```

**Funktioner**:

- `requestOpenThread(threadId)` - Sæt pending thread (fra LeadsTab)
- `clearPendingThread()` - Clear pending thread (efter åbning)

### 2. **LeadsTab** (`client/src/components/inbox/LeadsTab.tsx`)

**Nye props**:

```typescript
interface LeadsTabProps {
  onRequestTabChange?: (tab: "email") => void;
}
```

**Opdateret CustomerProfile callback**:

```typescript
onOpenEmailThread={(threadId) => {
  setSelectedLeadId(null);              // Close profile
  emailContext.requestOpenThread(threadId); // Set pending thread
  if (onRequestTabChange) {
    onRequestTabChange("email");        // Trigger tab switch
    toast.success("Åbner email i Email-tabben...");
  }
}}
```

### 3. **InboxPanel** (`client/src/components/InboxPanel.tsx`)

**Pass callback til LeadsTab**:

```tsx
<LeadsTab onRequestTabChange={onTabChange} />
```

### 4. **EmailTab** (`client/src/components/inbox/EmailTab.tsx`)

**Ny useEffect** - lyt efter pending thread:

```typescript
useEffect(() => {
  const pendingThread = emailContext.state.pendingThreadToOpen;
  if (pendingThread) {
    setSelectedThreadId(pendingThread); // Open thread
    emailContext.clearPendingThread(); // Clear pending
    console.log("[EmailTab] Opened pending thread:", pendingThread);
  }
}, [emailContext.state.pendingThreadToOpen]);
```

### 5. **ChatInterface** (`client/src/pages/ChatInterface.tsx`)

**State management** (eksisterende):

```typescript
const [activeInboxTab, setActiveInboxTab] = useState<
  "email" | "invoices" | "calendar" | "leads" | "tasks"
>("email");

const handleTabChange = useCallback((tab: ...) => {
  setActiveInboxTab(tab);
}, []);
```

---

## 📊 Dataflow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      CROSS-TAB NAVIGATION                     │
└──────────────────────────────────────────────────────────────┘

1. LeadsTab (Customer Profile)
   │
   ├─ User clicks email in Timeline
   │
   └─> onOpenEmailThread(threadId) called
       │
       ├─ emailContext.requestOpenThread(threadId)
       │  └─> Sets pendingThreadToOpen in EmailContext
       │
       └─ onRequestTabChange("email")
          └─> ChatInterface.handleTabChange("email")
              │
              └─> setActiveInboxTab("email")
                  │
                  └─> EmailTab mounts/re-renders
                      │
                      └─> useEffect detects pendingThreadToOpen
                          │
                          ├─> setSelectedThreadId(threadId)
                          │
                          ├─> emailContext.clearPendingThread()
                          │
                          └─> Email thread opens! ✅
```

---

## 🔍 State Management

### EmailContext State

```typescript
{
  selectedThreads: Set<string>(),
  openThreadId: string | null,
  folder: "inbox" | "sent" | "archive" | "starred",
  viewMode: "list" | "pipeline" | "dashboard",
  selectedLabels: string[],
  searchQuery: string,
  openDrafts: number,
  previewThreadId: string | null,
  pendingThreadToOpen: string | null,  // ← NEW for cross-tab nav
}
```

### Lifecycle

1. **Request**: LeadsTab → `requestOpenThread(threadId)`
2. **Storage**: EmailContext → `pendingThreadToOpen = threadId`
3. **Tab Switch**: ChatInterface → `setActiveInboxTab("email")`
4. **Detection**: EmailTab → `useEffect` detects pending thread
5. **Action**: EmailTab → Opens thread + clears pending
6. **Cleanup**: EmailContext → `pendingThreadToOpen = null`

---

## 🧪 Test Cases

### Test 1: Email fra LeadsTab

1. Gå til **Leads-tabben**
2. Klik på en lead
3. CustomerProfile åbner på **Timeline**-fanen
4. Klik på en email i timeline
5. ✅ Tab skifter automatisk til **Emails**
6. ✅ Email-tråd åbner direkte
7. ✅ Toast vises: "Åbner email i Email-tabben..."

### Test 2: Multiple Clicks

1. Klik email i LeadsTab → skift til Emails
2. Gå tilbage til Leads
3. Klik anden email
4. ✅ Tab skifter igen
5. ✅ Ny email åbner (ikke den gamle)

### Test 3: Fallback (uden callback)

1. Hvis `onRequestTabChange` ikke er sat
2. ✅ Toast vises: "Email åbnet - skift til Emails-tabben for at se den"
3. ✅ Ingen crash eller fejl

---

## 🎨 UI/UX Detaljer

### Toast Messages

- **Success**: "Åbner email i Email-tabben..." (når tab-skift virker)
- **Info**: "Email åbnet - skift til Emails-tabben for at se den" (fallback)

### Timing

- Tab-skift: **Øjeblikkeligt** (ingen delay)
- Email-åbning: **Øjeblikkeligt** efter tab-mount
- CustomerProfile luk: **Øjeblikkeligt** (før tab-skift)

### Performance

- **Ingen ekstra API-kald** - bruger eksisterende thread IDs
- **Minimal state** - kun 1 string (threadId) i context
- **Auto-cleanup** - pending cleared efter brug

---

## 🚀 Future Improvements

### Mulige udvidelser

1. **Deep linking** - URL params for direkte email-links
2. **History tracking** - "Back" knap til forrige view
3. **Multiple tabs** - Support for flere åbne emails samtidigt
4. **Cross-component** - Også fra CalendarTab, TasksTab, etc.
5. **Animation** - Smooth transition mellem tabs

### Eksempel: Deep Linking

```typescript
// URL: /inbox?tab=email&thread=abc123
const searchParams = new URLSearchParams(window.location.search);
const threadToOpen = searchParams.get("thread");
if (threadToOpen) {
  emailContext.requestOpenThread(threadToOpen);
}
```

---

## 📝 Kode Eksempler

### Fra LeadsTab - Request tab change

```typescript
// I CustomerProfile callback
onOpenEmailThread={(threadId) => {
  setSelectedLeadId(null);
  emailContext.requestOpenThread(threadId);

  if (onRequestTabChange) {
    onRequestTabChange("email");
    toast.success("Åbner email i Email-tabben...");
  } else {
    toast.info("Email åbnet - skift til Emails-tabben");
  }
}}
```

### Fra EmailTab - Detect and open

```typescript
// Auto-open pending thread
useEffect(() => {
  const pendingThread = emailContext.state.pendingThreadToOpen;
  if (pendingThread) {
    setSelectedThreadId(pendingThread);
    emailContext.clearPendingThread();
    console.log("[EmailTab] Opened:", pendingThread);
  }
}, [emailContext.state.pendingThreadToOpen]);
```

---

## 🐛 Troubleshooting

### Email åbner ikke

1. Tjek console for log: `[EmailTab] Opened pending thread: <id>`
2. Verificer at `pendingThreadToOpen` er sat i EmailContext
3. Tjek at EmailTab er mounted når tab skiftes

### Tab skifter ikke

1. Verificer at `onRequestTabChange` callback er sat på LeadsTab
2. Tjek at InboxPanel passer `onTabChange` videre
3. Se efter fejl i ChatInterface.handleTabChange

### Multiple emails åbner

1. Pending thread cleares ikke korrekt
2. useEffect dependency array mangler felt
3. Fix: Tilføj `emailContext.clearPendingThread()` cleanup

---

## ✨ Summary

**Implementeret**:

- ✅ EmailContext state for cross-tab navigation
- ✅ LeadsTab → EmailTab automatisk navigation
- ✅ CustomerProfile email-klik trigger
- ✅ EmailTab auto-open ved pending thread
- ✅ Toast feedback til bruger
- ✅ Cleanup og error handling

**Flow**:
LeadsTab (click email) → EmailContext (store threadId) → Tab Switch → EmailTab (open thread)

**Files Changed**:

1. `contexts/EmailContext.tsx` - State management
2. `components/inbox/LeadsTab.tsx` - Trigger navigation
3. `components/InboxPanel.tsx` - Pass callback
4. `components/inbox/EmailTab.tsx` - Open thread

---

**Sidst opdateret**: 6. november 2025
