/**
 * Search Results Card - Web/Knowledge Search
 * Viser search results med snippets
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

interface SearchResultsCardProps {
  query: string;
  results: SearchResult[];
}

export function SearchResultsCard({ query, results }: SearchResultsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3 pb-3 border-b">
            <span className="text-2xl shrink-0">🔍</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">Søgeresultater</h4>
              <p className="text-xs text-muted-foreground truncate">
                "{query}"
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {results.length} results
            </Badge>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {results.map((result, idx) => (
              <a
                key={idx}
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0 opacity-50 font-mono">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-primary group-hover:underline line-clamp-1">
                        {result.title}
                      </h5>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {result.snippet}
                      </p>
                      {result.source && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-xs">🌐</span>
                          <span className="text-xs text-muted-foreground">
                            {result.source}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
