/**
 * SEARCH RESULTS CARD - Opgraderet
 * Google search results med preview og actions
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, ExternalLink, Copy, Check, Star, Globe } from "lucide-react";
import { useState } from "react";

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  favicon?: string;
  relevanceScore?: number;
}

interface SearchResultsCardProps {
  query: string;
  results: SearchResult[];
  onOpenResult?: (url: string) => void;
}

export function SearchResultsCardUpgraded({
  query,
  results,
  onOpenResult,
}: SearchResultsCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "hover:shadow-xl",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm"
      )}
    >
      <div className="relative p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-md",
              "bg-linear-to-br from-green-500 to-emerald-600"
            )}
          >
            <Search className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">Søgeresultater</h4>
            <p className="text-xs text-muted-foreground truncate">
              "{query}" • {results.length} resultater
            </p>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-2">
          {results.map((result, idx) => (
            <SearchResultItem
              key={result.id}
              result={result}
              index={idx}
              onOpen={() => onOpenResult?.(result.url)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function SearchResultItem({
  result,
  index,
  onOpen,
}: {
  result: SearchResult;
  index: number;
  onOpen: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "group p-3 rounded-lg border border-border/50",
        "hover:border-primary/50 hover:bg-muted/30",
        "transition-all duration-200 cursor-pointer",
        "animate-in slide-in-from-left-2"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onOpen}
    >
      <div className="space-y-2">
        {/* Domain & Favicon */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded flex items-center justify-center bg-muted shrink-0">
            {result.favicon ? (
              <img src={result.favicon} alt="" className="w-3 h-3" />
            ) : (
              <Globe className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {result.domain}
          </span>
          {result.relevanceScore && result.relevanceScore > 0.8 && (
            <Badge variant="secondary" className="text-xs ml-auto">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              Relevant
            </Badge>
          )}
        </div>

        {/* Title */}
        <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline line-clamp-1">
          {result.title}
        </h5>

        {/* Snippet */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {result.snippet}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={e => {
              e.stopPropagation();
              onOpen();
            }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Åbn
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-green-500" />
                Kopieret
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Kopier URL
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
