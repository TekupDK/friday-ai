# EmailTab i 3-Panel Layout

## 📋 EmailTab Integration med 3-Panel Layout

EmailTab er blevet fuldt tilpasset til at fungere optimalt i vores nye 3-panel layout. Denne dokumentation beskriver de tilpasninger, der er lavet for at sikre optimal funktionalitet.

### 🔍 Oversigt over 3-Panel Integration

````text
┌─────────────────┬─────────────────────────┬─────────────────┐
│                 │                         │                 │
│                 │                         │                 │
│  AI Assistant   │      Email Center       │    Workflow     │
│     (25%)       │         (50%)           │     (25%)       │
│                 │                         │                 │
│                 │                         │                 │
└─────────────────┴─────────────────────────┴─────────────────┘

```text

## ✅ Implementerede Tilpasninger

### 1. **EmailCenterPanel Integration**

- EmailTab er korrekt indpakket i EmailCenterPanel wrapper
- EmailCenterPanel er placeret i midterpanelet i 3-panel layout med 50% bredde
- InboxPanel har `overflow-hidden` for at undgå nested scrollbars

### 2. **Responsive Design**

- **Sidebar Bredde**: `w-48 sm:w-56 lg:w-64` (tilpasser sig forskellige skærmstørrelser)
- **Border Separation**: Tilføjet `border-r border-border/30` til sidebar for visuel adskillelse
- **Kompakt UI**: Tilføjet density-toggle for tættere layout i smallere midterpanel
- **Responsive Toolbar**:

  ```tsx
  <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 items-stretch lg:items-center p-2 lg:p-3">

```text

- **Overflow Control**: Sikret korrekt scroll-containment:

  ```tsx
  <div className="overflow-y-auto border-r border-border/30">

```text

### 3. **Cross-Panel Navigation**

- **WorkflowContext Integration**: Tilføjet til EmailTab for deling af data mellem paneler

  ```tsx
  const { openCustomerProfile } = useWorkflowContext();

```text

- **Email-to-Workflow Navigation**: Support for cross-panel aktioner:

  ```tsx
  <Button onClick={() => openCustomerProfile(customerId)}>
    Vis kunde profil
  </Button>

```text

### 4. **Performance Optimering**

- **IntersectionObserver Tuning**: Øget rootMargin til 400px for bedre prefetch i smallere panel

  ```tsx
  { root: parentRef.current, rootMargin: "400px" }

```text

- **TabsContent Configuration**: Fjernet nested scrollbars ved korrekt overflow indstilling

  ```tsx
  <TabsContent className="overflow-hidden">

````

- **Compact Layout**: Tilføjet density toggle for mere effektiv pladsudnyttelse i 3-panel

## 🚀 Keyboard Shortcuts for 3-Panel Layout

Vi har tilføjet nye keyboard shortcuts specifikt designet til at forbedre navigation i 3-panel layout:

- **Alt+1**: Fokus AI Assistant panel
- **Alt+2**: Fokus Email Center panel
- **Alt+3**: Fokus Workflow panel
- **Ctrl+Tab**: Skift til næste panel
- **Shift+Tab**: Skift til forrige panel
- **Escape**: Ryd valg og fokuser email liste

## 📊 Density Modes for 3-Panel Layout

Da midterpanelet er smallere i 3-panel layout, har vi implementeret to density modes for at optimere pladsen:

### 1. **Comfortable Mode (Default)**

- Standard spacing mellem emails
- Fuld visning af sender, emne og indhold
- AI features synlige på hover
- Bedst til store skærme

### 2. **Compact Mode (Shortwave-Style)**

- Tæt spacing mellem emails
- Sender + Subject på samme linje
- Skjulte AI features og labels
- Mere effektiv plads udnyttelse for 3-panel layout
- Ideel til small/medium skærme

## 📱 Mobile & Responsive Handling

EmailTab er også optimeret til mobile visning:

- **Mobile Sheet**: EmailCenterPanel kan vises som en sheet på mobile
- **Responsive Breakpoints**: Alle komponenter bruger sm/md/lg breakpoints
- **Single Panel Fallback**: På meget små skærme vises kun AI Assistant panel

## 🛠 Anbefalet Fremtidige Forbedringer

1. **Dynamic Panel Save/Restore**: Gem seneste email view state når man skifter panel
1. **Context-aware Actions**: Tilpas actions based på hvilket panel der har fokus
1. **Panel Communication API**: Formaliseret kommunikation mellem panels
1. **Panel Memory**: Gendan scroll position når man kommer tilbage til EmailTab
1. **Shared Context Hooks**: Centralisér cross-panel state management

## 📝 Udviklernoter

For at sikre optimal integration med 3-panel layout, følg disse guidelines når du udvider eller vedligeholder EmailTab:

1. Brug responsive breakpoints (sm, md, lg) for alle spacing og container størrelser
1. Undgå nested scrollbars ved at holde scrolling containment korrekt
1. Implementér density toggling for komponenter med meget indhold
1. Sørg for at IntersectionObserver har korrekt rootMargin for 3-panel
1. Brug WorkflowContext for cross-panel kommunikation
