/**
 * SEARCH EVERYWHERE - Universal søgning på tværs af systemet
 */

import {
  Search,
  Filter,
  FileText,
  Mail,
  Users,
  Calendar,
  MessageSquare,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";


export interface SearchResult {
  id: string;
  type:
    | "email"
    | "document"
    | "contact"
    | "calendar"
    | "chat"
    | "invoice"
    | "task";
  title: string;
  description: string;
  content?: string;
  url?: string;
  timestamp: string;
  relevance: number;
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  type?: string;
  dateRange?: string;
  author?: string;
  tags?: string[];
}

interface SearchEverywhereProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  onResultClick?: (result: SearchResult) => void;
  onAdvancedSearch?: () => void;
}

export function SearchEverywhere({
  onSearch,
  onResultClick,
  onAdvancedSearch,
}: SearchEverywhereProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "faktura ABC Corporation",
    "møde med salgsteam",
    "email support template",
    "kunde database",
    "prisliste REN-003",
  ]);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "email",
      title: "Faktura til ABC Corporation",
      description: "Sendt faktura for rengøringsservice",
      content:
        "Kære ABC Corporation, Vedhæftet finder I faktura for januar måned...",
      timestamp: "for 2 timer siden",
      relevance: 95,
      metadata: { sender: "john@company.com", recipient: "billing@abc.com" },
    },
    {
      id: "2",
      type: "document",
      title: "Prisliste REN-003",
      description: "Opdateret prisliste for vinduespudsning",
      content: "REN-003: Standard vinduespudsning - 150 kr. pr. time...",
      timestamp: "for 1 dag siden",
      relevance: 88,
      metadata: { category: "pricing", version: "v2.1" },
    },
    {
      id: "3",
      type: "contact",
      title: "John Smith",
      description: "Sales Manager at ABC Corporation",
      content: "john.smith@abc.com - +45 1234 5678",
      timestamp: "for 3 dage siden",
      relevance: 82,
      metadata: { company: "ABC Corporation", role: "Sales Manager" },
    },
    {
      id: "4",
      type: "calendar",
      title: "Møde med salgsteam",
      description: "Ugentligt møde for salgsteamet",
      content: "Agenda: Salgsreview, Kunder, Q1 mål",
      timestamp: "for 5 dage siden",
      relevance: 76,
      metadata: {
        date: "2024-01-20",
        time: "14:00",
        location: "Meeting Room A",
      },
    },
    {
      id: "5",
      type: "chat",
      title: "Support chat med Kunde A",
      description: "Kunde spurgte om rengøringsplan",
      content: "Kunde: Hvornår kommer I næste gang?...",
      timestamp: "for 1 uge siden",
      relevance: 71,
      metadata: { chatId: "chat-123", duration: "15 min" },
    },
  ];

  const searchTypes = [
    { id: "all", label: "Alle", icon: Search, count: mockResults.length },
    {
      id: "email",
      label: "Emails",
      icon: Mail,
      count: mockResults.filter(r => r.type === "email").length,
    },
    {
      id: "document",
      label: "Dokumenter",
      icon: FileText,
      count: mockResults.filter(r => r.type === "document").length,
    },
    {
      id: "contact",
      label: "Kontakter",
      icon: Users,
      count: mockResults.filter(r => r.type === "contact").length,
    },
    {
      id: "calendar",
      label: "Kalender",
      icon: Calendar,
      count: mockResults.filter(r => r.type === "calendar").length,
    },
    {
      id: "chat",
      label: "Chats",
      icon: MessageSquare,
      count: mockResults.filter(r => r.type === "chat").length,
    },
  ];

  const filteredResults =
    selectedFilter === "all"
      ? mockResults
      : mockResults.filter(result => result.type === selectedFilter);

  useEffect(() => {
    if (query.length > 2) {
      // Simulate search delay
      const timer = setTimeout(() => {
        setShowResults(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [query]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query, {
        type: selectedFilter === "all" ? undefined : selectedFilter,
      });

      // Add to recent searches
      setRecentSearches(prev =>
        [query, ...prev.filter(s => s !== query)].slice(0, 5)
      );

      // Add to search history
      const newSearch: SearchResult = {
        id: `search-${Date.now()}`,
        type: "email",
        title: `Søgning: "${query}"`,
        description: `${filteredResults.length} resultater fundet`,
        timestamp: "lige nu",
        relevance: 100,
      };
      setSearchHistory(prev => [newSearch, ...prev].slice(0, 10));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowResults(false);
      setQuery("");
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "email":
        return Mail;
      case "document":
        return FileText;
      case "contact":
        return Users;
      case "calendar":
        return Calendar;
      case "chat":
        return MessageSquare;
      case "invoice":
        return FileText;
      case "task":
        return FileText;
      default:
        return FileText;
    }
  };

  const getResultColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "email":
        return "bg-blue-500";
      case "document":
        return "bg-green-500";
      case "contact":
        return "bg-purple-500";
      case "calendar":
        return "bg-orange-500";
      case "chat":
        return "bg-cyan-500";
      case "invoice":
        return "bg-red-500";
      case "task":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return "text-green-600";
    if (relevance >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Search Everywhere</h4>
              <p className="text-xs text-muted-foreground">
                Universal søgning på tværs af systemet
              </p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={onAdvancedSearch}>
            <Filter className="w-3 h-3 mr-1" />
            Avanceret
          </Button>
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Søg i emails, dokumenter, kontakter, kalender..."
              className="pl-9 pr-10 h-10"
              onFocus={() => {
                if (query.length > 2) {
                  setShowResults(true);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+K</kbd>
            </div>
          </div>
        </div>

        {/* Search Type Filters */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Søg i:
          </label>
          <div className="flex flex-wrap gap-1">
            {searchTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedFilter(type.id)}
                  className={cn(
                    "px-2 py-1 rounded text-xs transition-colors flex items-center gap-1",
                    selectedFilter === type.id
                      ? "bg-indigo-500 text-white"
                      : "bg-muted hover:bg-muted/70"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span>{type.label}</span>
                  <span className="opacity-70">({type.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results */}
        {showResults && filteredResults.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h5 className="text-sm font-semibold">
                Resultater ({filteredResults.length}):
              </h5>
              <Badge className="bg-indigo-500">
                {filteredResults.filter(r => r.relevance >= 90).length} høj
                relevans
              </Badge>
            </div>

            <div className="border rounded-lg bg-background max-h-64 overflow-y-auto">
              {filteredResults.map(result => {
                const Icon = getResultIcon(result.type);
                return (
                  <button
                    key={result.id}
                    onClick={() => onResultClick?.(result)}
                    className="w-full text-left p-3 flex items-start gap-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                        getResultColor(result.type)
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {result.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            getRelevanceColor(result.relevance)
                          )}
                        >
                          {result.relevance}% match
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {result.description}
                      </p>
                      {result.content && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.content}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{result.timestamp}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {!showResults && recentSearches.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-semibold">Seneste søgninger:</h5>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full text-left p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-2"
                >
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-center">
            <p className="font-bold text-indigo-700 dark:text-indigo-300">
              {searchHistory.length}
            </p>
            <p className="text-indigo-600 dark:text-indigo-400">
              Søgninger i dag
            </p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="font-bold text-purple-700 dark:text-purple-300">
              {Math.round(
                mockResults.reduce((sum, r) => sum + r.relevance, 0) /
                  mockResults.length
              )}
              %
            </p>
            <p className="text-purple-600 dark:text-purple-400">
              Gns. relevans
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="font-bold text-blue-700 dark:text-blue-300">
              {mockResults.filter(r => r.relevance >= 90).length}
            </p>
            <p className="text-blue-600 dark:text-blue-400">Høj relevans</p>
          </div>
        </div>

        {/* Search Tips */}
        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-start gap-2">
            <Search className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-700 dark:text-indigo-400">
              <p className="font-semibold mb-1">Søgetips:</p>
              <ul className="space-y-1">
                <li>
                  • Brug{" "}
                  <kbd className="px-1 py-0.5 bg-white rounded text-xs">
                    Ctrl+K
                  </kbd>{" "}
                  for hurtig søgning
                </li>
                <li>• Filtrer results efter type for bedre præcision</li>
                <li>• Brug quotes for eksakte søgninger: "faktura ABC"</li>
                <li>• Kombiner søgeord: email + faktura + januar</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            onClick={handleSearch}
            className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600"
          >
            <Search className="w-4 h-4 mr-2" />
            Søg
          </Button>
          <Button
            onClick={onAdvancedSearch}
            variant="outline"
            className="flex-1"
          >
            <Filter className="w-4 h-4 mr-2" />
            Avanceret søgning
          </Button>
        </div>
      </div>
    </Card>
  );
}
