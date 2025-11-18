/**
 * ResponseSuggestions - Display AI-generated email response suggestions
 */

import { Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface ResponseSuggestionsProps {
  threadId: string;
  onSelectSuggestion?: (text: string) => void;
  className?: string;
}

const TONE_LABELS = {
  professional: "Professionel",
  friendly: "Venlig",
  formal: "Formel",
};

const TYPE_LABELS = {
  quick_reply: "Hurtig svar",
  detailed: "Detaljeret",
  forward: "Videresendt",
  schedule: "Planlæg",
};

export function ResponseSuggestions({
  threadId,
  onSelectSuggestion,
  className = "",
}: ResponseSuggestionsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch suggestions from backend
  const { data: suggestions, isLoading } =
    trpc.emailIntelligence.getResponses.useQuery(
      { threadId },
      { enabled: !!threadId }
    );

  const markAsUsed = trpc.emailIntelligence.markSuggestionUsed.useMutation();

  const handleCopy = async (suggestion: any) => {
    await navigator.clipboard.writeText(suggestion.text);
    setCopiedId(suggestion.id);

    // Mark as used
    if (typeof suggestion.id === "string") {
      markAsUsed.mutate({ suggestionId: parseInt(suggestion.id) });
    }

    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion.text);
    }

    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            Genererer svar-forslag...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-purple-500" />
          AI Svar-forslag
        </CardTitle>
        <CardDescription className="text-xs">
          Klik for at kopiere til udklipsholder
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion: any) => (
          <div
            key={suggestion.id}
            className="relative p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => handleCopy(suggestion)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {TYPE_LABELS[suggestion.type as keyof typeof TYPE_LABELS] ||
                    suggestion.type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {TONE_LABELS[suggestion.tone as keyof typeof TONE_LABELS] ||
                    suggestion.tone}
                </Badge>
                {suggestion.confidence && (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(suggestion.confidence * 100)}% tillid
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => {
                  e.stopPropagation();
                  handleCopy(suggestion);
                }}
              >
                {copiedId === suggestion.id ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>

            <p className="text-sm whitespace-pre-wrap text-foreground">
              {suggestion.text}
            </p>

            {suggestion.reasoning && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {suggestion.reasoning}
              </p>
            )}

            {suggestion.used && (
              <Badge
                variant="outline"
                className="absolute top-2 right-2 text-xs"
              >
                Brugt
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
