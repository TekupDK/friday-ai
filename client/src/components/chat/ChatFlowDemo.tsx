/**
 * Chat Flow Demo - Fuld conversation flow
 * Demonstrerer alle komponenter i en realistisk chat
 */

import { useState, useEffect } from "react";

import { AIThinking } from "./AIThinking";
import { CalendarEventCard, type CalendarEventData } from "./CalendarEventCard";
import { EmailThreadCard, type EmailThreadData } from "./EmailThreadCard";
import { InvoiceCards, type InvoiceCardData } from "./InvoiceCards";
import { SearchResultsCard, type SearchResult } from "./SearchResultsCard";
import { ToolExecutionBox } from "./ToolExecutionBox";
import { WeatherCard } from "./WeatherCard";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatFlowDemoProps {
  scenario: "weather" | "email" | "calendar" | "invoices" | "search";
}

export function ChatFlowDemo({ scenario }: ChatFlowDemoProps) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (step < 4) {
        setStep(step + 1);
      } else {
        setIsPlaying(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [step, isPlaying]);

  const handlePlay = () => {
    setStep(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };

  const scenarioContent = {
    weather: {
      userMessage: "Hvad er vejret i København?",
      toolMessage: "Fetching weather data...",
      emoji: "🌤️",
    },
    email: {
      userMessage: "Vis mine vigtigste emails",
      toolMessage: "Analyzing inbox...",
      emoji: "📧",
    },
    calendar: {
      userMessage: "Book møde med teamet i morgen kl 14",
      toolMessage: "Checking calendar availability...",
      emoji: "📅",
    },
    invoices: {
      userMessage: "Vis ubetalte fakturaer",
      toolMessage: "Fetching from Billy...",
      emoji: "💰",
    },
    search: {
      userMessage: "Find information om AI trends 2024",
      toolMessage: "Searching the web...",
      emoji: "🔍",
    },
  };

  const content = scenarioContent[scenario];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2">
        <Button onClick={handlePlay} disabled={isPlaying} size="sm">
          ▶️ Play Demo
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm">
          🔄 Reset
        </Button>
      </div>

      {/* Chat Flow */}
      <ScrollArea className="h-[500px] border rounded-lg p-4 bg-background">
        <div className="space-y-4">
          {/* Step 1: User Message */}
          {step >= 1 && (
            <div className="flex justify-end animate-in fade-in slide-in-from-right duration-300">
              <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                <p className="text-sm">{content.userMessage}</p>
              </div>
            </div>
          )}

          {/* Step 2: AI Thinking */}
          {step >= 2 && step < 3 && <AIThinking message="AI Thinking..." />}

          {/* Step 3: Tool Execution */}
          {step >= 3 && step < 4 && (
            <ToolExecutionBox
              emoji={content.emoji}
              message={content.toolMessage}
              progress={60}
              status="running"
            />
          )}

          {/* Step 4: Response Card */}
          {step >= 4 && (
            <div className="animate-in fade-in slide-in-from-bottom duration-500">
              {scenario === "weather" && (
                <WeatherCard
                  city="København"
                  temperature={18}
                  condition="Partly Cloudy"
                  emoji="☁️"
                  humidity={65}
                  wind={12}
                  forecast={[
                    { day: "Man", temp: 19, emoji: "☀️" },
                    { day: "Tir", temp: 17, emoji: "☁️" },
                    { day: "Ons", temp: 16, emoji: "🌧️" },
                  ]}
                />
              )}

              {scenario === "email" && (
                <EmailThreadCard
                  data={{
                    subject: "Tilbud på website projekt",
                    from: "kunde@firma.dk",
                    messageCount: 5,
                    summary:
                      "Kunde efterspørger tilbud på nyt website med e-commerce. Budget omkring 50.000 kr.",
                    labels: ["Lead", "Høj prioritet"],
                    priority: "high",
                    hasAttachments: true,
                  }}
                />
              )}

              {scenario === "calendar" && (
                <CalendarEventCard
                  data={{
                    title: "Team Meeting",
                    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
                    location: "Google Meet",
                    attendees: ["Hans", "Peter", "Mette"],
                    isBooked: true,
                  }}
                />
              )}

              {scenario === "invoices" && (
                <InvoiceCards
                  invoices={[
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
                  ]}
                />
              )}

              {scenario === "search" && (
                <SearchResultsCard
                  query="AI trends 2024"
                  results={[
                    {
                      title: "AI Trends 2024: What to Expect",
                      url: "https://example.com",
                      snippet: "Comprehensive analysis of AI developments...",
                      source: "TechCrunch",
                    },
                  ]}
                />
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
