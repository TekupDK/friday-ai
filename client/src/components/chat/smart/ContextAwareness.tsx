/**
 * CONTEXT AWARENESS - Kontekst-bevidste forslag
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Brain,
  Eye,
  Clock,
  MapPin,
  User,
  FileText,
  Calendar,
  Mail,
  TrendingUp,
  Zap,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

export interface ContextData {
  currentTask?: string;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
  userPreferences: {
    workingHours: string;
    timezone: string;
    language: string;
    focusAreas: string[];
  };
  environment: {
    timeOfDay: "morning" | "afternoon" | "evening" | "night";
    dayOfWeek: string;
    location?: string;
    deviceType: string;
  };
  businessContext: {
    currentProjects: string[];
    upcomingDeadlines: string[];
    teamAvailability: Record<string, boolean>;
  };
}

interface ContextAwarenessProps {
  context?: ContextData;
  onApplyContext?: (suggestion: string) => void;
  onUpdatePreferences?: (preferences: any) => void;
  onRefresh?: () => void;
}

export function ContextAwareness({
  context,
  onApplyContext,
  onUpdatePreferences,
  onRefresh,
}: ContextAwarenessProps) {
  const [expandedSection, setExpandedSection] = useState<string>("overview");

  // Default context data
  const defaultContext: ContextData = {
    currentTask: "Oprette faktura for ABC Corporation",
    recentActivity: [
      {
        type: "email",
        description: "Sendte faktura til XYZ Company",
        timestamp: "10:30",
      },
      {
        type: "calendar",
        description: "Bookede møde med Kunde A",
        timestamp: "10:15",
      },
      { type: "file", description: "Redigerede prisliste", timestamp: "09:45" },
      {
        type: "chat",
        description: "Assisterede med email draft",
        timestamp: "09:30",
      },
    ],
    userPreferences: {
      workingHours: "09:00 - 17:00",
      timezone: "CET (GMT+1)",
      language: "Dansk",
      focusAreas: ["Fakturering", "Kundekommunikation", "Kalenderstyring"],
    },
    environment: {
      timeOfDay: "morning",
      dayOfWeek: "Mandag",
      location: "Kontor - Aarhus",
      deviceType: "Desktop",
    },
    businessContext: {
      currentProjects: ["Q1 Rapport", "Kunde onboarding", "System opgradering"],
      upcomingDeadlines: [
        "Fakturering deadline - 15. jan",
        "Møde med ABC - 20. jan",
      ],
      teamAvailability: {
        "Sales Team": true,
        Support: false,
        Development: true,
        Management: false,
      },
    },
  };

  const contextData = context || defaultContext;

  const getContextualSuggestions = () => {
    const suggestions = [];

    // Time-based suggestions
    if (contextData.environment.timeOfDay === "morning") {
      suggestions.push({
        title: "Morgen rutine",
        description: "Gennemgå dagens opgaver og prioriteter",
        icon: Clock,
        priority: "high",
      });
    }

    // Task-based suggestions
    if (contextData.currentTask?.includes("faktura")) {
      suggestions.push({
        title: "Faktura hjælp",
        description: "Skabeloner og hurtig oprettelse af fakturaer",
        icon: FileText,
        priority: "high",
      });
    }

    // Activity-based suggestions
    const recentEmails = contextData.recentActivity.filter(
      a => a.type === "email"
    ).length;
    if (recentEmails > 2) {
      suggestions.push({
        title: "Email optimering",
        description: "Automatiser gentagne email opgaver",
        icon: Mail,
        priority: "medium",
      });
    }

    // Deadline-based suggestions
    if (contextData.businessContext.upcomingDeadlines.length > 0) {
      suggestions.push({
        title: "Deadline påmindelse",
        description: `${contextData.businessContext.upcomingDeadlines.length} kommende deadlines`,
        icon: Calendar,
        priority: "high",
      });
    }

    return suggestions;
  };

  const contextualSuggestions = getContextualSuggestions();

  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case "morning":
        return "🌅";
      case "afternoon":
        return "☀️";
      case "evening":
        return "🌆";
      case "night":
        return "🌙";
      default:
        return "🕐";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "calendar":
        return Calendar;
      case "file":
        return FileText;
      case "chat":
        return MessageCircle;
      default:
        return FileText;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Context Awareness</h4>
              <p className="text-xs text-muted-foreground">
                Kontekst-bevidste forslag
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500">
              {getTimeOfDayIcon(contextData.environment.timeOfDay)}{" "}
              {contextData.environment.timeOfDay}
            </Badge>
            <Button size="sm" variant="ghost" onClick={onRefresh}>
              <Eye className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Current Context Overview */}
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-1">
                Nuværende kontekst:
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                {contextData.currentTask || "Ingen aktiv opgave"}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                <span>📍 {contextData.environment.location}</span>
                <span>🕐 {contextData.environment.dayOfWeek}</span>
                <span>💻 {contextData.environment.deviceType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {["overview", "activity", "preferences", "business"].map(section => (
            <button
              key={section}
              onClick={() => setExpandedSection(section)}
              className={cn(
                "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                expandedSection === section
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              )}
            >
              {section === "overview" && "📊 Overblik"}
              {section === "activity" && "📈 Aktivitet"}
              {section === "preferences" && "⚙️ Præferencer"}
              {section === "business" && "💼 Forretning"}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {expandedSection === "overview" && (
          <div className="space-y-3">
            {/* Contextual Suggestions */}
            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Kontekstuelle forslag:</h5>
              <div className="space-y-2">
                {contextualSuggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => onApplyContext?.(suggestion.title)}
                      className="w-full text-left p-3 rounded-lg bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {suggestion.title}
                            </span>
                            <Badge
                              className={getPriorityColor(suggestion.priority)}
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-center">
                <p className="font-bold text-indigo-700 dark:text-indigo-300">
                  {contextData.recentActivity.length}
                </p>
                <p className="text-indigo-600 dark:text-indigo-400">
                  Aktiviteter i dag
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
                <p className="font-bold text-purple-700 dark:text-purple-300">
                  {contextData.businessContext.currentProjects.length}
                </p>
                <p className="text-purple-600 dark:text-purple-400">
                  Aktive projekter
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
                <p className="font-bold text-blue-700 dark:text-blue-300">
                  {contextData.businessContext.upcomingDeadlines.length}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  Kommende deadlines
                </p>
              </div>
            </div>
          </div>
        )}

        {expandedSection === "activity" && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold">Seneste aktivitet:</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {contextData.recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {expandedSection === "preferences" && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold">Dine præferencer:</h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
                <span className="text-sm">Arbejdstid</span>
                <Badge variant="outline">
                  {contextData.userPreferences.workingHours}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
                <span className="text-sm">Tidszone</span>
                <Badge variant="outline">
                  {contextData.userPreferences.timezone}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-background border border-border">
                <span className="text-sm">Sprog</span>
                <Badge variant="outline">
                  {contextData.userPreferences.language}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium">Fokusområder:</span>
                <div className="flex flex-wrap gap-1">
                  {contextData.userPreferences.focusAreas.map((area, index) => (
                    <Badge key={index} className="bg-indigo-500">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {expandedSection === "business" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Aktive projekter:</h5>
              <div className="space-y-1">
                {contextData.businessContext.currentProjects.map(
                  (project, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm"
                    >
                      📋 {project}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Kommende deadlines:</h5>
              <div className="space-y-1">
                {contextData.businessContext.upcomingDeadlines.map(
                  (deadline, index) => (
                    <div
                      key={index}
                      className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm"
                    >
                      ⏰ {deadline}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Team tilgængelighed:</h5>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(
                  contextData.businessContext.teamAvailability
                ).map(([team, available]) => (
                  <div
                    key={team}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border"
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        available ? "bg-green-500" : "bg-red-500"
                      )}
                    />
                    <span className="text-xs">{team}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div className="p-3 rounded-lg bg-linear-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-300 dark:border-indigo-700">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              <p className="font-semibold mb-1">AI Insights:</p>
              <p>
                Baseret på din nuværende kontekst og aktivitetsmønster,
                anbefaler jeg at fokusere på{" "}
                {contextData.currentTask?.toLowerCase() || "daglige opgaver"} og
                prioritere de{" "}
                {contextData.businessContext.upcomingDeadlines.length} kommende
                deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={onRefresh}
            className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600"
          >
            <Brain className="w-4 h-4 mr-2" />
            Opdater kontekst
          </Button>
          <Button
            onClick={() => onUpdatePreferences?.(contextData.userPreferences)}
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Rediger præferencer
          </Button>
        </div>
      </div>
    </Card>
  );
}
