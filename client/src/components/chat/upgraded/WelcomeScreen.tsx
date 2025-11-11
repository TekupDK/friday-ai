/**
 * WELCOME SCREEN - Visuelt opgraderet
 * Moderne design med gradient cards og kategoriserede suggestions
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Calendar, FileText, Users, Mail, Phone, Search,
  TrendingUp, Clock, MessageSquare, Sparkles, Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Suggestion {
  text: string;
  icon: LucideIcon;
  category: 'quick' | 'business' | 'info';
  gradient: string;
}

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
  userName?: string;
}

const suggestions: Suggestion[] = [
  // Quick Actions
  { text: "Tjek min kalender i dag", icon: Calendar, category: 'quick', gradient: "from-blue-500 to-cyan-500" },
  { text: "Søg i mine emails", icon: Mail, category: 'quick', gradient: "from-purple-500 to-pink-500" },
  { text: "Find nye leads", icon: Users, category: 'quick', gradient: "from-green-500 to-emerald-500" },
  
  // Business
  { text: "Vis ubetalte fakturaer", icon: FileText, category: 'business', gradient: "from-orange-500 to-yellow-500" },
  { text: "Opret nyt tilbud", icon: TrendingUp, category: 'business', gradient: "from-red-500 to-pink-500" },
  { text: "Planlæg møde", icon: Clock, category: 'business', gradient: "from-indigo-500 to-purple-500" },
  
  // Info
  { text: "Hvad kan Friday?", icon: Sparkles, category: 'info', gradient: "from-cyan-500 to-blue-500" },
  { text: "Status på opgaver", icon: MessageSquare, category: 'info', gradient: "from-violet-500 to-purple-500" },
];

export function WelcomeScreenUpgraded({ onSuggestionClick, userName }: WelcomeScreenProps) {
  const quickActions = suggestions.filter(s => s.category === 'quick');
  const businessActions = suggestions.filter(s => s.category === 'business');
  const infoActions = suggestions.filter(s => s.category === 'info');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Godmorgen";
    if (hour < 18) return "Goddag";
    return "Godaften";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-8">
      {/* Header with gradient text */}
      <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {getGreeting()}{userName ? `, ${userName}` : ''}!
        </h1>
        
        <p className="text-base text-muted-foreground max-w-md">
          Jeg er Friday AI - din intelligente assistent til Rendetalje
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Badge variant="secondary" className="gap-1.5">
            <Zap className="w-3 h-3" />
            35 værktøjer
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Mail className="w-3 h-3" />
            Gmail
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Calendar className="w-3 h-3" />
            Google Calendar
          </Badge>
        </div>
      </div>

      {/* Quick Actions - Featured */}
      <div className="w-full max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
        <div className="flex items-center gap-2 px-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-semibold text-foreground">Hurtige Handlinger</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((suggestion, i) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={i}
                onClick={() => onSuggestionClick(suggestion.text)}
                className={cn(
                  "group relative overflow-hidden rounded-xl p-4",
                  "border border-border/50 hover:border-border",
                  "bg-card hover:bg-muted/50",
                  "transition-all duration-300",
                  "hover:shadow-xl hover:scale-105",
                  "text-left"
                )}
              >
                {/* Gradient overlay on hover */}
                <div className={cn(
                  "absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity",
                  suggestion.gradient
                )} />
                
                <div className="relative space-y-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg bg-linear-to-br flex items-center justify-center shadow-md",
                    "group-hover:scale-110 transition-transform",
                    suggestion.gradient
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {suggestion.text}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Actions */}
      <div className="w-full max-w-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-900">
        <div className="flex items-center gap-2 px-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">Business</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {businessActions.map((suggestion, i) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={i}
                onClick={() => onSuggestionClick(suggestion.text)}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all text-left"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg bg-linear-to-br flex items-center justify-center shadow-sm shrink-0",
                  "group-hover:scale-110 transition-transform",
                  suggestion.gradient
                )}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium truncate">{suggestion.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Actions - Compact */}
      <div className="w-full max-w-2xl flex flex-wrap gap-2 justify-center animate-in fade-in slide-in-from-bottom-5 duration-1000">
        {infoActions.map((suggestion, i) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={i}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all text-sm"
            >
              <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">{suggestion.text}</span>
            </button>
          );
        })}
      </div>

      {/* Model Info */}
      <div className="text-center space-y-1 text-xs text-muted-foreground animate-in fade-in duration-1000">
        <p className="font-medium">Powered by Gemma 3 27B</p>
        <p>Trænet til Rendetalje workflows</p>
      </div>
    </div>
  );
}
