import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Mail,
  Clock,
  DollarSign,
  User,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * JACE.AI MODERN DESIGN
 *
 * Features:
 * - AI chat interface for email management
 * - Beautiful gradient cards with depth
 * - Conversational AI suggestions
 * - Rich animations & shadows
 * - Modern color palette
 */

interface Message {
  id: string;
  type: "ai" | "user" | "action";
  content: string;
  timestamp?: string;
  actions?: Array<{ label: string; icon: any }>;
}

interface EmailSuggestion {
  id: string;
  from: string;
  subject: string;
  aiAction: string;
  priority: "high" | "medium" | "low";
  estimatedValue?: number;
  quickActions: string[];
}

const suggestions: EmailSuggestion[] = [
  {
    id: "1",
    from: "Matilde Skinneholm",
    subject: "Tilbud på rengøring",
    aiAction: 'Send personalized quote using template "Kontorrengøring"',
    priority: "high",
    estimatedValue: 40000,
    quickActions: ["Send Tilbud", "Opret Lead", "Book Møde"],
  },
  {
    id: "2",
    from: "Hanne Andersen",
    subject: "Follow-up påmindelse",
    aiAction: "Send gentle follow-up reminder about pending quote",
    priority: "medium",
    quickActions: ["Send Follow-up", "Schedule Call"],
  },
  {
    id: "3",
    from: "Lars Nielsen",
    subject: "Betaling modtaget",
    aiAction: "Mark invoice as paid and send receipt",
    priority: "low",
    quickActions: ["Mark Paid", "Send Receipt", "Archive"],
  },
];

const chatHistory: Message[] = [
  {
    id: "1",
    type: "ai",
    content:
      "👋 God morgen! Du har 3 nye emails der kræver handling. Skal jeg hjælpe dig med at prioritere dem?",
    timestamp: "09:00",
  },
  {
    id: "2",
    type: "user",
    content: "Ja tak, vis mig de vigtigste",
    timestamp: "09:01",
  },
  {
    id: "3",
    type: "ai",
    content: "Perfekt! Her er mine anbefalinger baseret på AI analyse:",
    timestamp: "09:01",
  },
];

export function EmailCenterJaceModern() {
  const [input, setInput] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const getPriorityGradient = (priority: string) => {
    if (priority === "high") return "from-red-500 via-orange-500 to-pink-500";
    if (priority === "medium") return "from-blue-500 via-cyan-500 to-teal-500";
    return "from-gray-400 via-gray-500 to-gray-600";
  };

  const getPriorityBg = (priority: string) => {
    if (priority === "high") return "from-red-50 via-orange-50 to-pink-50";
    if (priority === "medium") return "from-blue-50 via-cyan-50 to-teal-50";
    return "from-gray-50 via-gray-100 to-gray-50";
  };

  return (
    <div className="relative min-h-[750px] rounded-2xl overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.15),transparent_40%)]" />
      </div>

      <div className="relative flex h-[750px]">
        {/* Left - AI Chat Interface */}
        <div className="w-[45%] border-r border-white/30 backdrop-blur-xl bg-white/50 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-white/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                {/* Pulse Animation */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Friday AI Assistant
                </h2>
                <p className="text-sm text-gray-600">Smart Email Management</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {chatHistory.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 animate-in slide-in-from-bottom-4",
                    msg.type === "user" && "flex-row-reverse"
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {msg.type === "ai" && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {msg.type === "user" && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shrink-0 shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex-1 rounded-2xl p-4 shadow-lg",
                      msg.type === "ai"
                        ? "bg-white/80 backdrop-blur-md border border-white/50"
                        : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        msg.type === "ai" ? "text-gray-800" : "text-white"
                      )}
                    >
                      {msg.content}
                    </p>
                    {msg.timestamp && (
                      <p
                        className={cn(
                          "text-xs mt-2",
                          msg.type === "ai" ? "text-gray-500" : "text-white/70"
                        )}
                      >
                        {msg.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* AI Suggestions Section */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-gray-800">
                    AI Prioritized Actions
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Chat Input with Gradient Border */}
          <div className="p-4 border-t border-white/30">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-sm" />
              <div className="relative flex gap-2 bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-xl">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Chat with Friday AI..."
                  className="border-0 bg-transparent focus-visible:ring-0 shadow-none"
                />
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Email Suggestions with Rich Cards */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Smart Suggestions
            </h3>
            <p className="text-sm text-gray-600">
              AI-recommended actions for your inbox
            </p>
          </div>

          <ScrollArea className="h-[calc(100%-100px)]">
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => {
                const isExpanded = expandedCard === suggestion.id;

                return (
                  <div
                    key={suggestion.id}
                    className="relative group"
                    style={{
                      animation: `fadeIn 0.5s ease-out ${idx * 0.15}s both`,
                    }}
                  >
                    {/* Gradient Glow Effect */}
                    <div
                      className={cn(
                        "absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-60 blur-xl transition-all duration-500",
                        `bg-gradient-to-r ${getPriorityGradient(suggestion.priority)}`
                      )}
                    />

                    <Card
                      className={cn(
                        "relative overflow-hidden cursor-pointer transition-all duration-300",
                        "bg-white/90 backdrop-blur-md border-2 border-white/50 shadow-xl",
                        "hover:shadow-2xl hover:scale-[1.02]",
                        isExpanded && "scale-[1.02] shadow-2xl"
                      )}
                      onClick={() =>
                        setExpandedCard(isExpanded ? null : suggestion.id)
                      }
                    >
                      {/* Priority Bar with Gradient */}
                      <div
                        className={cn(
                          "h-1.5 bg-gradient-to-r",
                          getPriorityGradient(suggestion.priority)
                        )}
                      />

                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-10 h-10 shadow-lg">
                                <AvatarFallback
                                  className={cn(
                                    "bg-gradient-to-br text-white font-semibold",
                                    getPriorityGradient(suggestion.priority)
                                  )}
                                >
                                  {suggestion.from
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-sm text-gray-900">
                                  {suggestion.from}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {suggestion.subject}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Badge
                            className={cn(
                              "bg-gradient-to-r text-white shadow-lg",
                              getPriorityGradient(suggestion.priority)
                            )}
                          >
                            {suggestion.priority.toUpperCase()}
                          </Badge>
                        </div>

                        {/* AI Action with Glassmorphism */}
                        <div
                          className={cn(
                            "p-4 rounded-2xl mb-4 bg-gradient-to-br backdrop-blur-sm border shadow-sm",
                            `${getPriorityBg(suggestion.priority)} border-white/60`
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br",
                                getPriorityGradient(suggestion.priority)
                              )}
                            >
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-600 mb-1">
                                AI RECOMMENDATION
                              </div>
                              <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                {suggestion.aiAction}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Row */}
                        {suggestion.estimatedValue && (
                          <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="text-xs text-green-600 font-semibold">
                                ESTIMATED VALUE
                              </div>
                              <div className="text-lg font-bold text-green-700">
                                {suggestion.estimatedValue.toLocaleString(
                                  "da-DK"
                                )}{" "}
                                kr
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2">
                          {suggestion.quickActions.map((action, i) => (
                            <Button
                              key={i}
                              size="sm"
                              variant="outline"
                              className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-lg border-white/60"
                            >
                              {action === "Send Tilbud" && (
                                <Send className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              {action === "Opret Lead" && (
                                <User className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              {action === "Book Møde" && (
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              {action === "Mark Paid" && (
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Bottom Stats with Gradients */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {
                icon: Mail,
                label: "Processed",
                value: "12",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Zap,
                label: "Auto-replied",
                value: "8",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: CheckCircle2,
                label: "Completed",
                value: "5",
                color: "from-green-500 to-emerald-500",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="relative group">
                  <div
                    className={cn(
                      "absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-40 blur-lg transition-opacity bg-gradient-to-r",
                      stat.color
                    )}
                  />
                  <div className="relative p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-xl transition-all">
                    <Icon
                      className={cn(
                        "w-5 h-5 mb-2 bg-gradient-to-r bg-clip-text text-transparent",
                        stat.color
                      )}
                    />
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
