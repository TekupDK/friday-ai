import { Calendar, FileText, Users, HelpCircle } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

export default function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  const suggestions = [
    { text: "Tjek min kalender i dag", icon: Calendar },
    { text: "Vis ubetalte fakturaer", icon: FileText },
    { text: "Find nye leads", icon: Users },
    { text: "Hvad kan Friday?", icon: HelpCircle },
  ];

  return (
    <div 
      data-testid="welcome-screen"
      className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4"
    >
      {/* Centered header with more breathing room */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-medium text-foreground">
          Hvad kan jeg hjælpe med i dag?
        </h1>
        <p className="text-sm text-muted-foreground">
          Vælg en handling eller skriv din egen besked
        </p>
      </div>
      
      {/* Suggestion pills with icons - Shortwave style */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {suggestions.map((suggestion, i) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={i}
              data-testid={`suggestion-${i}`}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all text-sm text-muted-foreground hover:text-foreground text-left"
            >
              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>{suggestion.text}</span>
            </button>
          );
        })}
      </div>
      
      {/* Model info - Shortwave style */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Standard • Gemma 3 27B Free</p>
        <p>Gmail, Kalender, Billy • 35 værktøjer</p>
      </div>
    </div>
  );
}