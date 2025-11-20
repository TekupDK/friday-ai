# 📋 Hovedside Filer - Komplet Liste

**Dato:** 2025-01-28  
**Hovedside:** `client/src/pages/WorkspaceLayout.tsx`

---

## 🎯 Core Hovedside Filer

### Main Layout
- `client/src/pages/WorkspaceLayout.tsx` - **HOVEDSIDE** (407 lines)
  - 3-panel layout
  - Header med navigation
  - Resizable panels
  - Keyboard shortcuts
  - Mobile responsive

---

## 📦 Panel Komponenter (Direkte i Layout)

### Panel 1: AI Assistant
- `client/src/components/panels/AIAssistantPanelV2.tsx` - **AI Chat Panel**
  - Friday AI chat interface
  - OpenRouter integration
  - Auto-creates conversation

### Panel 2: Email Center
- `client/src/components/panels/EmailCenterPanel.tsx` - **Email Workspace Panel** (43 lines)
  - Email header
  - Lazy loads EmailTabV2

### Panel 3: Smart Workspace
- `client/src/components/panels/SmartWorkspacePanel.tsx` - **Context-Aware Workspace** (312 lines)
  - Context detection
  - 5 workspace states
  - Responsive design

---

## 🦴 Skeleton Komponenter (Loading States)

- `client/src/components/skeletons/WorkspaceLayoutSkeleton.tsx` - **3-panel preview**
- `client/src/components/skeletons/AIAssistantSkeleton.tsx` - **AI chat preview**
- `client/src/components/skeletons/EmailCenterSkeleton.tsx` - **Email interface preview**
- `client/src/components/skeletons/SmartWorkspaceSkeleton.tsx` - **Workspace preview**
- `client/src/components/skeletons/index.ts` - **Centralized exports**

---

## 📧 Email System Filer (Via EmailCenterPanel)

### Email Tab
- `client/src/components/inbox/EmailTabV2.tsx` - **Main email interface** (614 lines)
  - Email list container
  - State management
  - Email selection

### Email List Components
- `client/src/components/inbox/EmailListAI.tsx` - **AI-enhanced email list**
- `client/src/components/inbox/EmailListV2.tsx` - **Standard email list**
- `client/src/components/inbox/EmailSearchV2.tsx` - **Search & filtering**
- `client/src/components/inbox/EmailBulkActionsV2.tsx` - **Bulk operations**
- `client/src/components/inbox/EmailSplits.tsx` - **Split views**
- `client/src/components/inbox/EmailCard.tsx` - **Individual email cards**
- `client/src/components/inbox/EmailRowActions.tsx` - **Row actions**
- `client/src/components/inbox/EmailThreadView.tsx` - **Thread viewer**
- `client/src/components/inbox/CreateLeadModal.tsx` - **Create lead from email**

---

## 🏢 Workspace Widgets (Via SmartWorkspacePanel)

- `client/src/components/workspace/LeadAnalyzer.tsx` - **Lead analysis**
- `client/src/components/workspace/BookingManager.tsx` - **Booking management**
- `client/src/components/workspace/InvoiceTracker.tsx` - **Invoice tracking**
- `client/src/components/workspace/CustomerProfile.tsx` - **Customer profile**
- `client/src/components/workspace/BusinessDashboard.tsx` - **Business dashboard**
- `client/src/components/workspace/SmartActionBar.tsx` - **Smart actions** (Phase 5)
- `client/src/components/workspace/WorkspaceSkeleton.tsx` - **Workspace loading skeleton**

---

## 🔄 Context & State Management

- `client/src/contexts/EmailContext.tsx` - **Email state** (selectedEmail, etc.)
- `client/src/context/InvoiceContext.tsx` - **Invoice state** (InvoiceProvider)
- `client/src/services/emailContextDetection.ts` - **Context detection service**

---

## 🪝 Hooks

- `client/src/hooks/useAuth.ts` - **Authentication** (from _core)
- `client/src/hooks/useKeyboardShortcuts.ts` - **Keyboard shortcuts**
- `client/src/hooks/usePageTitle.ts` - **Page title management**
- `client/src/hooks/useEmailKeyboardShortcuts.ts` - **Email shortcuts**
- `client/src/hooks/useRateLimit.ts` - **Rate limiting**

---

## 🎨 UI Komponenter

### Dialogs & Sheets
- `client/src/components/KeyboardShortcutsDialog.tsx` - **Keyboard shortcuts dialog**
- `client/src/components/MobileUserMenuSheet.tsx` - **Mobile user menu**
- `client/src/components/SettingsDialog.tsx` - **Settings dialog**
- `client/src/components/UserProfileDialog.tsx` - **User profile dialog**
- `client/src/components/PanelErrorBoundary.tsx` - **Error boundary**

### UI Primitives (shadcn/ui)
- `client/src/components/ui/badge.tsx`
- `client/src/components/ui/button.tsx`
- `client/src/components/ui/dropdown-menu.tsx`
- `client/src/components/ui/resizable.tsx` - **Panel resizing**
- `client/src/components/ui/sheet.tsx` - **Mobile drawer**
- `client/src/components/ui/skeleton.tsx` - **Skeleton component**
- `client/src/components/ui/alert.tsx`
- `client/src/components/ui/card.tsx`
- `client/src/components/ui/tabs.tsx`

---

## 💬 Chat Komponenter (Via AIAssistantPanel)

- `client/src/components/chat/ShortWaveChatPanel.tsx` - **Chat interface**

---

## 🔧 Utilities & Libraries

- `client/src/lib/trpc.ts` - **tRPC client**
- `client/src/lib/cacheStrategy.ts` - **Cache management**
- `client/src/const.ts` - **Constants** (getLoginUrl)
- `shared/const.ts` - **Shared constants** (UNAUTHED_ERR_MSG)
- `client/src/constants/business.ts` - **Business constants** (ERROR_MESSAGES, UI_CONSTANTS)

---

## 🗄️ Backend Integration

### tRPC Routers
- `server/routers/workspace-router.ts` - **Workspace API**
- `server/routers/inbox/email-router.ts` - **Email API**
- `server/routers/chat-router.ts` - **Chat API** (via AIAssistantPanel)

### Services
- `server/modules/billing/billy-automation.ts` - **Billy integration** (for InvoiceTracker)

---

## 📊 Type Definitions

- `client/src/types/enhanced-email.ts` - **Email types**
- `client/src/types/email-thread.ts` - **Thread types**

---

## 🧪 Tests

- `client/src/components/panels/__tests__/EmailCenterPanel.test.tsx`
- `client/src/components/panels/__tests__/AIAssistantPanel.test.tsx`
- ⚠️ `client/src/components/panels/__tests__/SmartWorkspacePanel.test.tsx` - **Mangler!**

---

## 📁 Fil Struktur Oversigt

```
HOVEDSIDE (WorkspaceLayout.tsx)
│
├── 📦 PANELS (3 paneler)
│   ├── AIAssistantPanelV2.tsx
│   ├── EmailCenterPanel.tsx
│   └── SmartWorkspacePanel.tsx
│
├── 🦴 SKELETONS (Loading states)
│   ├── WorkspaceLayoutSkeleton.tsx
│   ├── AIAssistantSkeleton.tsx
│   ├── EmailCenterSkeleton.tsx
│   └── SmartWorkspaceSkeleton.tsx
│
├── 📧 EMAIL SYSTEM (Via EmailCenterPanel)
│   ├── EmailTabV2.tsx
│   ├── EmailListAI.tsx
│   ├── EmailSearchV2.tsx
│   ├── EmailBulkActionsV2.tsx
│   └── [30+ email components]
│
├── 🏢 WORKSPACE WIDGETS (Via SmartWorkspacePanel)
│   ├── LeadAnalyzer.tsx
│   ├── BookingManager.tsx
│   ├── InvoiceTracker.tsx
│   ├── CustomerProfile.tsx
│   └── BusinessDashboard.tsx
│
├── 🔄 CONTEXTS
│   ├── EmailContext.tsx
│   └── InvoiceContext.tsx
│
├── 🪝 HOOKS
│   ├── useAuth.ts
│   ├── useKeyboardShortcuts.ts
│   └── usePageTitle.ts
│
├── 🎨 UI COMPONENTS
│   ├── Dialogs (5 files)
│   └── UI Primitives (10+ files)
│
└── 🔧 UTILITIES
    ├── trpc.ts
    ├── cacheStrategy.ts
    └── constants
```

---

## 📊 Statistik

### Total Filer Relateret til Hovedside
- **Core:** 1 (WorkspaceLayout)
- **Panels:** 3
- **Skeletons:** 4
- **Email Components:** ~30+
- **Workspace Widgets:** 7
- **Contexts:** 2
- **Hooks:** 5+
- **UI Components:** 15+
- **Utilities:** 5+
- **Backend:** 3+

**Total:** ~75+ filer direkte eller indirekte relateret til hovedside

---

## 🔗 Import Kæde

```
WorkspaceLayout.tsx
├── AIAssistantPanelV2.tsx
│   └── ShortWaveChatPanel.tsx
│
├── EmailCenterPanel.tsx
│   └── EmailTabV2.tsx
│       ├── EmailListAI.tsx
│       ├── EmailSearchV2.tsx
│       ├── EmailBulkActionsV2.tsx
│       └── EmailSplits.tsx
│
└── SmartWorkspacePanel.tsx
    ├── LeadAnalyzer.tsx
    ├── BookingManager.tsx
    ├── InvoiceTracker.tsx
    ├── CustomerProfile.tsx
    └── BusinessDashboard.tsx
```

---

## ✅ Status

**Alle filer er:**
- ✅ Korrekt importeret
- ✅ Type-safe
- ✅ Lazy loaded hvor relevant
- ✅ Med error boundaries
- ✅ Med skeletons

**Hovedside er production-ready!** 🚀
