import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Calendar, 
  FileText, 
  Users, 
  HelpCircle,
  Sparkles
} from "lucide-react";

interface ChatSuggestion {
  id: string;
  text: string;
  icon: typeof MessageSquare;
  category: 'quick' | 'standard' | 'advanced';
}

const suggestions: ChatSuggestion[] = [
  {
    id: '1',
    text: 'Hvad kan jeg hjælpe med?',
    icon: Sparkles,
    category: 'quick'
  },
  {
    id: '2',
    text: 'Tjek min kalender i dag',
    icon: Calendar,
    category: 'standard'
  },
  {
    id: '3',
    text: 'Vis ubetalte fakturaer',
    icon: FileText,
    category: 'standard'
  },
  {
    id: '4',
    text: 'Find nye leads',
    icon: Users,
    category: 'standard'
  },
  {
    id: '5',
    text: 'Hvad kan Friday?',
    icon: HelpCircle,
    category: 'quick'
  }
];

export function ChatSuggestionsPanel() {
  return (
    <div className="w-full max-w-[240px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Friday AI</h2>
        <p className="text-sm text-muted-foreground">
          Din intelligente assistent
        </p>
      </div>

      <Card className="bg-muted/30 border-muted">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Hvad kan jeg hjælpe med?
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Vælg handling eller skriv selv
          </p>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                
                return (
                  <button
                    key={suggestion.id}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg",
                      "border border-border/50 hover:border-primary/50",
                      "hover:bg-accent/50 transition-all",
                      "text-left group"
                    )}
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    
                    <span className="text-sm font-medium">
                      {suggestion.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </Card>

      <div className="mt-6 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-green-500" />
          <span>Modellen: Gemini 2.2.0 Free</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-blue-500" />
          <span>100% Accuracy • GMM + L.ka Free</span>
        </div>
      </div>
    </div>
  );
}
