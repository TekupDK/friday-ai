# 🎨 Friday AI Components Guide

Komplet guide til alle Friday AI chat komponenter baseret på Figma design og jeres integrations.

## 📋 Component Overview

### **Core Componenter**

| Component           | Purpose                   | Integration     |
| ------------------- | ------------------------- | --------------- |
| `AIThinking`        | Pulserende dots indicator | Core            |
| `ToolExecutionBox`  | Inline tool progress      | Core            |
| `WeatherCard`       | Vejr data display         | Weather API     |
| `InvoiceCards`      | Faktura oversigt          | Billy           |
| `EmailThreadCard`   | Email med AI summary      | Gmail           |
| `CalendarEventCard` | Møde booking              | Google Calendar |
| `SearchResultsCard` | Web search results        | Web Search      |
| `AIMemoryPanel`     | Action timeline           | Core            |
| `ChatFlowDemo`      | Interactive demos         | Demo            |

---

## 🛠️ Core Components

### **1. AIThinking**

```tsx
import { AIThinking } from "@/components/chat/AIThinking";

<AIThinking message="AI Thinking..." />;

```text

**Features:**

- 3 pulserende dots med staggered animation
- Customizable message
- Fade-in animation
- Bruger jeres theme colors (primary)

**When to use:** Vis mens AI processer request, før tool execution starter.

---

### **2. ToolExecutionBox**

```tsx
import { ToolExecutionBox } from "@/components/chat/ToolExecutionBox";

<ToolExecutionBox
  emoji="🔍"
  message="Fetching weather data..."
  progress={60}
  status="running" // 'running' | 'completed' | 'failed'
/>;

```text

**Features:**

- Inline box (ikke modal!)
- Light blue background
- Emoji icon
- Progress bar med percentage
- Status colors: blue (running), green (completed), red (failed)
- Smooth animations

**When to use:** Vis når AI udfører en tool/action (API call, database query, etc.)

---

## 📧 Integration Components

### **3. EmailThreadCard** (Gmail)

```tsx
import { EmailThreadCard } from "@/components/chat/EmailThreadCard";

<EmailThreadCard
  data={{
    subject: "Tilbud på website projekt",
    from: "<kunde@firma.dk>",
    messageCount: 5,
    summary: "AI-genereret summary af email thread",
    labels: ["Lead", "Høj prioritet"],
    priority: "high", // 'high' | 'medium' | 'low'
    hasAttachments: true,
  }}
  onClick={() => console.log("Open email")}
/>;

```text

**Features:**

- AI summary box (light blue)
- Priority color-coded left border
- Labels som badges
- Attachment indicator (📎)
- Klikbar (åbner email i Gmail)

**Use cases:**

- "Vis mine vigtigste emails"
- "Summarize this thread"
- "Prioriter inbox"

---

### **4. CalendarEventCard** (Google Calendar)

```tsx
import { CalendarEventCard } from "@/components/chat/CalendarEventCard";

<CalendarEventCard
  data={{
    title: "Team Standup",
    startTime: new Date(),
    endTime: new Date(),
    location: "Google Meet",
    attendees: ["Hans", "Peter"],
    isBooked: true,
  }}
/>;

```text

**Features:**

- Grøn border når booket
- Emoji icons (📅 🕐 📍 👥)
- Formatted tid og dato (dansk format)
- Attendee badges
- Location display

**Use cases:**

- "Book møde med teamet"
- "Hvad har jeg på kalenderen i dag?"
- "Find ledig tid til møde"

---

### **5. InvoiceCards** (Billy)

```tsx
import { InvoiceCards } from "@/components/chat/InvoiceCards";

<InvoiceCards
  invoices={[
    {
      id: "#1234",
      company: "Acme Corp",
      amount: 12500,
      currency: "kr",
      dueInDays: 5,
      status: "pending", // 'paid' | 'pending' | 'overdue'
    },
  ]}
/>;

```text

**Features:**

- 3-column grid layout
- Minimal white design
- Emoji status indicators (📄 ✅ ⏰)
- Overdue warning badge (⚠️)
- Red border for overdue

**Use cases:**

- "Vis ubetalte fakturaer"
- "Hvilke fakturaer er overdue?"
- "Opret ny faktura"

---

### **6. SearchResultsCard** (Web Search)

```tsx
import { SearchResultsCard } from "@/components/chat/SearchResultsCard";

<SearchResultsCard
  query="AI trends 2024"
  results={[
    {
      title: "Article Title",
      url: "<https://...",>
      snippet: "Preview text...",
      source: "TechCrunch",
    },
  ]}
/>;

```text

**Features:**

- Klikbare result links
- Snippet preview (truncated)
- Source attribution
- Numbered results
- Hover effects

**Use cases:**

- "Find information om..."
- "Search for..."
- "Hvad sker der med..."

---

### **7. WeatherCard**

```tsx
import { WeatherCard } from "@/components/chat/WeatherCard";

<WeatherCard
  city="København"
  temperature={18}
  condition="Partly Cloudy"
  emoji="☁️"
  humidity={65}
  wind={12}
  forecast={[{ day: "Man", temp: 19, emoji: "☀️" }]}
/>;

```text

**Features:**

- Brilliant blue background (#007AFF) - som Figma!
- White text
- 3-column details grid
- Forecast row
- Emoji weather icons

---

## 💬 ChatFlowDemo

Interaktiv demo der viser hele conversation flow:

```tsx
import { ChatFlowDemo } from "@/components/chat/ChatFlowDemo";

<ChatFlowDemo scenario="weather" />;
// Scenarios: 'weather' | 'email' | 'calendar' | 'invoices' | 'search'

```text

**Flow steps:**

1. User message (slide-in from right)
1. AI Thinking (pulserende dots)
1. Tool Execution (progress bar)
1. Response Card (result)

**Features:**

- Play/Reset controls
- Auto-progression
- Smooth animations
- Realistic timing

---

## 🎯 Integration Plan

### **Phase 1: Message Type Extension**

```typescript
// shared/types.ts
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;

  // NYE FELTER
  toolExecution?: {
    emoji: string;
    message: string;
    progress: number;
    status: "running" | "completed" | "failed";
  };

  cardData?: {
    type: "weather" | "invoice" | "email" | "calendar" | "search";
    data: any;
  };
}

```text

### **Phase 2: Opdater ShortWaveChatPanel**

```tsx
// client/src/components/chat/ShortWaveChatPanel.tsx

{
  chatMessages.map(message => (
    <div key={message.id}>
      {/*Tool execution*/}
      {message.toolExecution && <ToolExecutionBox {...message.toolExecution} />}

      {/*Regular message*/}
      <MessageBubble>{message.content}</MessageBubble>

      {/*Response cards*/}
      {message.cardData?.type === "weather" && (
        <WeatherCard {...message.cardData.data} />
      )}
      {message.cardData?.type === "invoices" && (
        <InvoiceCards invoices={message.cardData.data} />
      )}
      {/*... etc*/}
    </div>
  ));
}

```text

### **Phase 3: Backend Integration**

```typescript
// server/routers.ts

// Efter AI response
if (toolUsed === "get_weather") {
  await createMessage({
    conversationId,
    role: "assistant",
    content: "Her er vejret i København:",
    cardData: {
      type: "weather",
      data: weatherData,
    },
  });
}

```text

---

## 🎨 Theme Compatibility

Alle komponenter bruger jeres eksisterende theme system:

### **Colors Used:**

- `bg-background` - Main background
- `text-foreground` - Main text
- `text-muted-foreground` - Secondary text
- `bg-primary` - User messages
- `text-primary-foreground` - User message text
- `bg-muted` - AI messages
- `border` - Standard borders
- `bg-blue-50/80` - Tool execution boxes
- `bg-[#007AFF]` - Weather card (Figma specific)

### **Animations:**

- `animate-in` - Smooth entrance
- `fade-in` - Opacity animation
- `slide-in-from-bottom` - Bottom slide
- `animate-pulse` - Pulserende dots
- `transition-all` - Smooth transitions

---

## 📍 File Locations

```bash
client/src/components/chat/
├── AIThinking.tsx              # Pulserende dots
├── ToolExecutionBox.tsx        # Inline tool progress
├── WeatherCard.tsx             # Weather display
├── InvoiceCards.tsx            # Billy invoices
├── EmailThreadCard.tsx         # Gmail threads
├── CalendarEventCard.tsx       # Calendar events
├── SearchResultsCard.tsx       # Search results
├── AIMemoryPanel.tsx           # Action timeline
└── ChatFlowDemo.tsx            # Interactive demo

client/src/pages/
└── ComponentShowcase.tsx       # Showcase page

server/
├── routers.ts                  # Message creation
└── tool-execution-tracker.ts   # Tool tracking

```

---

## 🚀 Next Steps

1. ✅ **Komponenter oprettet** - Alle komponenter er klar
1. ⏳ **Database schema** - Tilføj `cardData` og `toolExecution` felter
1. ⏳ **ShortWaveChatPanel** - Integrer komponenter i chat panel
1. ⏳ **Backend** - Return cardData fra AI responses
1. ⏳ **Testing** - Test alle flows end-to-end

---

## 📸 Screenshots

Alle komponenter kan testes på:
**<http://localhost:3000/showcase**>

Scroll til "Friday AI" sections for at se:

- Tool Execution (Figma Style)
- Weather Card (Brilliant Blue)
- Invoice Cards (Minimal White)
- Gmail Integration
- Calendar Integration
- Search Integration
- Interactive Chat Flow Demos

---

## 💡 Tips

**Performance:**

- Komponenter bruger `animate-in` - disable hvis performance issues
- Staggered animations på multiple cards (se InvoiceCards)
- Lazy load cards hvis mange i samme view

**Accessibility:**

- Alle emojis har semantic HTML around them
- Color contrast tested på både light/dark
- Keyboard navigation på klikbare cards

**Customization:**

- Alle komponenter accepter `className` prop
- Colors kan overrides med Tailwind
- Animations kan disables med `prefersReducedMotion`
