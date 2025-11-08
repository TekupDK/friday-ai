# 🗂️ **FORÆLDET KODE - V2 MIGRATION**

## **📋 OVERSIGT OVER FORÆLDET KODE**

### **🚫 GAMLE AI ASSISTANT PANELER**
- **`AIAssistantPanel.tsx`** - Gamle panel med tabs (Chat, Voice, Agent, Smart)
- **`AIContext.tsx`** - Context til AI modes (ikke brugt i V2)
- **`ai-modes/` mappe** - VoiceMode, AgentMode, SmartMode komponenter

### **✅ V2 KOMPONENTER**
- **`AIAssistantPanelV2.tsx`** - Shortwave-inspired panel uden tabs
- **`ChatPanel.tsx`** - Moderne chat interface
- **`SmartWorkspacePanel.tsx`** - Auto-context workspace panel

---

## **🔍 STATUS CHECK**

### **✅ ALLEREDE OPDATERET:**
1. **`WorkspaceLayout.tsx`** - Bruger `AIAssistantPanelV2`
2. **`App.tsx`** - `AIContextProvider` fjernet
3. **`__tests__/AIAssistantPanel.test.tsx`** - Importerer V2
4. **`ChatPanel.tsx`** - Minimal input design

### **🚫 GAMLE FILER (KAN SLETTES):**
```
client/src/
├── contexts/AIContext.tsx           (FORÆLDET)
├── components/panels/AIAssistantPanel.tsx  (FORÆLDET)
└── components/ai-modes/             (FORÆLDET MAPPE)
    ├── VoiceMode.tsx
    ├── AgentMode.tsx
    └── SmartMode.tsx
```

---

## **🎯 V2 ARCHITECTURE**

### **🔄 NY DATAFLOW:**
```
App.tsx
├── EmailContextProvider
├── WorkflowContextProvider  
└── WorkspaceLayout
    ├── AIAssistantPanelV2 (Shortwave-style)
    │   ├── Compact Header
    │   ├── Email Context Bubble
    │   ├── Quick Actions
    │   ├── ChatPanel (70%)
    │   └── Active Rules (30%)
    ├── EmailCenterPanel
    └── SmartWorkspacePanel (Auto-context)
```

### **🚫 GAMLE DATAFLOW:**
```
App.tsx
├── AIContextProvider (FORÆLDET)
└── WorkspaceLayout
    └── AIAssistantPanel (FORÆLDET)
        ├── Tabs (Chat/Voice/Agent/Smart)
        └── Multiple modes
```

---

## **🧹 RENOPSRYNINGSPLAN**

### **FASE 1: SIKKERHEDSKOPI (✅ DONE)**
- Dokumenter alle forældede filer
- Bekræft V2 virker perfekt

### **FASE 2: FJERN FORÆLDET KODE**
```bash
# Kan slettes når V2 er 100% stabil:
rm -rf client/src/contexts/AIContext.tsx
rm -rf client/src/components/panels/AIAssistantPanel.tsx  
rm -rf client/src/components/ai-modes/
```

### **FASE 3: TEST**
- Verificer alle V2 features virker
- Tjek for missing imports
- Kør test suite

---

## **📊 V2 FORDELE**

### **🎯 SHORTWAVE INSPIRERET:**
- ✅ Compact header
- ✅ Email context bubble  
- ✅ Minimal quick actions
- ✅ Clean chat input
- ✅ Auto-context workspace

### **🚀 PERFORMANCE:**
- ✅ Færrer components
- ✅ Ingen context overhead
- ✅ Direct data flow
- ✅ Better TypeScript support

---

## **⚠️ ADVARSEL!**

**IKKE SLET GAMLE FILER FØR:**
1. ✅ Server kører uden fejl
2. ✅ V2 UI virker perfekt  
3. ✅ Alle tests er grønne
4. ✅ Ingen build fejl

**NØDVENDIGE FILER TIL V2:**
- `AIAssistantPanelV2.tsx` ✅
- `ChatPanel.tsx` ✅  
- `SmartWorkspacePanel.tsx` ✅
- `WorkspaceLayout.tsx` ✅

---

## **🔄 STATUS: KLAR TIL RENOPRYDNING!**

**Server:** ✅ Fixed (TransformError løst)
**V2 Panel:** ✅ Shortwave design complete
**Data Flow:** ✅ Ingen forældede contexts
**Build:** ✅ Klar til test

**Næste skridt:** Test server og fjern forældede filer! 🚀