import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIThinking } from "@/components/chat/AIThinking";
import { ToolExecutionBox } from "@/components/chat/ToolExecutionBox";
import { WeatherCard } from "@/components/chat/WeatherCard";
import {
  InvoiceCards,
  type InvoiceCardData,
} from "@/components/chat/InvoiceCards";
import {
  AIMemoryPanel,
  type AIMemoryItem,
} from "@/components/chat/AIMemoryPanel";
import {
  EmailThreadCard,
  type EmailThreadData,
} from "@/components/chat/EmailThreadCard";
import {
  CalendarEventCard,
  type CalendarEventData,
} from "@/components/chat/CalendarEventCard";
import {
  SearchResultsCard,
  type SearchResult,
} from "@/components/chat/SearchResultsCard";

export function ChatPanelUIShowcase() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"running" | "completed" | "failed">(
    "running"
  );

  useEffect(() => {
    let mounted = true;
    let p = 0;
    const id = setInterval(() => {
      if (!mounted) return;
      p += Math.random() * 18 + 6;
      if (p >= 100) {
        p = 100;
        setStatus("completed");
        clearInterval(id);
      }
      setProgress(Math.min(100, Math.round(p)));
    }, 350);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const weatherData = {
    city: "København",
    temperature: 18,
    condition: "Partly Cloudy",
    emoji: "☁️",
    humidity: 65,
    wind: 12,
    forecast: [
      { day: "Man", temp: 19, emoji: "☀️" },
      { day: "Tir", temp: 17, emoji: "☁️" },
      { day: "Ons", temp: 16, emoji: "🌧️" },
    ],
  };

  const invoices: InvoiceCardData[] = [
    {
      id: "#1234",
      company: "Acme Corp",
      amount: 12500,
      currency: "kr",
      dueInDays: 5,
      status: "pending",
    },
    {
      id: "#1236",
      company: "Nordic Ltd",
      amount: 15800,
      currency: "kr",
      dueInDays: -3,
      status: "overdue",
    },
  ];

  const memoryItems: AIMemoryItem[] = [
    {
      id: "1",
      type: "lead",
      title: "Oprettet lead:",
      subtitle: "Hans Jensen, 12345678",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "task",
      title: "Oprettet opgave:",
      subtitle: "Ring kunde i morgen",
      timestamp: new Date(),
    },
  ];

  const emailThreadData: EmailThreadData = {
    subject: "Tilbud på website projekt",
    from: "kunde@firma.dk",
    messageCount: 5,
    summary:
      "Kunde efterspørger tilbud på nyt website med e-commerce. Budget 50.000 kr.",
    labels: ["Lead", "Høj prioritet", "Website"],
    priority: "high",
    hasAttachments: true,
  };

  const calendarEventData: CalendarEventData = {
    title: "Kundemøde – Website redesign",
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    location: "København",
    attendees: ["camilla@firma.dk", "info@rendetalje.dk"],
    description: "Intro møde og behovsafklaring",
    isBooked: true,
  };

  const searchResultsData: SearchResult[] = [
    {
      title: "AI trends 2024 – Rapport",
      url: "https://example.com/ai-trends",
      snippet: "De vigtigste AI tendenser for 2024...",
    },
    {
      title: "Notion AI Features",
      url: "https://example.com/notion-ai",
      snippet: "Notion AI kan hjælpe med...",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              AI Thinking + Tool Execution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AIThinking />
            <ToolExecutionBox
              emoji="🛠️"
              message="Henter data fra Billy API og genererer faktura oversigt..."
              progress={progress}
              status={status}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weather + Invoices</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <WeatherCard {...weatherData} />
            <InvoiceCards invoices={invoices} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Thread Card</CardTitle>
          </CardHeader>
          <CardContent className="max-w-xl">
            <EmailThreadCard data={emailThreadData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calendar Event Card</CardTitle>
          </CardHeader>
          <CardContent className="max-w-md">
            <CalendarEventCard data={calendarEventData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Results Card</CardTitle>
          </CardHeader>
          <CardContent className="max-w-2xl">
            <SearchResultsCard
              query="AI trends 2024"
              results={searchResultsData}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Memory Timeline</CardTitle>
          </CardHeader>
          <CardContent className="max-w-md">
            <AIMemoryPanel items={memoryItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
