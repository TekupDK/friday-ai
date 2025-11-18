/**
 * EMAIL SEARCH CARD - Avanceret søgning i email-historik
 */

import { Search, Filter, Mail, Calendar, User, Star } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface EmailSearchResult {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  relevance: number;
}

interface EmailSearchCardProps {
  query?: string;
  results?: EmailSearchResult[];
  onSearch?: (query: string, filters: any) => void;
  onSelectResult?: (result: EmailSearchResult) => void;
}

export function EmailSearchCard({
  query = "",
  results = [],
  onSearch,
  onSelectResult,
}: EmailSearchCardProps) {
  const [searchQuery, setSearchQuery] = useState(query);
  const [filters, setFilters] = useState({
    dateRange: "any",
    sender: "",
    hasAttachment: false,
    isStarred: false,
  });

  const handleSearch = () => {
    onSearch?.(searchQuery, filters);
  };

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold">Email Søgning</h4>
            <p className="text-xs text-muted-foreground">
              Avanceret søgning i emails
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Søg i emner, afsendere, indhold..."
              className="pl-9 h-10"
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="text-xs bg-transparent outline-none"
              value={filters.dateRange}
              onChange={e =>
                setFilters({ ...filters, dateRange: e.target.value })
              }
            >
              <option value="any">Enhver dato</option>
              <option value="today">I dag</option>
              <option value="week">Denne uge</option>
              <option value="month">Denne måned</option>
            </select>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={filters.hasAttachment}
                onChange={e =>
                  setFilters({ ...filters, hasAttachment: e.target.checked })
                }
              />
              Vedhæftet
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={filters.isStarred}
                onChange={e =>
                  setFilters({ ...filters, isStarred: e.target.checked })
                }
              />
              Stjernet
            </label>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-xs text-muted-foreground font-medium">
              {results.length} resultater fundet
            </p>
            {results.map(result => (
              <button
                key={result.id}
                onClick={() => onSelectResult?.(result)}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {result.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.from}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.snippet}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {result.date}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(result.relevance * 100)}%
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleSearch}
            className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600"
          >
            <Search className="w-4 h-4 mr-2" />
            Søg
          </Button>
          <Button variant="outline" className="flex-1">
            <Filter className="w-4 h-4 mr-2" />
            Flere filtre
          </Button>
        </div>
      </div>
    </Card>
  );
}
