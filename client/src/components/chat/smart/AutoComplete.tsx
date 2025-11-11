/**
 * AUTO COMPLETE - Intelligent auto-fuldførelse
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Zap, Type, Check, X, Clock, TrendingUp, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface AutoCompleteSuggestion {
  id: string;
  text: string;
  type: 'phrase' | 'template' | 'command' | 'contact' | 'file';
  category: string;
  confidence: number;
  usage?: number;
  context?: string;
}

interface AutoCompleteProps {
  suggestions?: AutoCompleteSuggestion[];
  onSelectSuggestion?: (suggestion: AutoCompleteSuggestion) => void;
  onAddToFavorites?: (suggestionId: string) => void;
  placeholder?: string;
  maxSuggestions?: number;
}

export function AutoComplete({ 
  suggestions = [],
  onSelectSuggestion,
  onAddToFavorites,
  placeholder = "Skriv for auto-fuldførelse...",
  maxSuggestions = 8
}: AutoCompleteProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSuggestions, setRecentSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default auto-complete suggestions
  const defaultSuggestions: AutoCompleteSuggestion[] = [
    {
      id: '1',
      text: 'Kan du hjælpe mig med at oprette en ny faktura?',
      type: 'phrase',
      category: 'faktura',
      confidence: 95,
      usage: 156,
      context: 'Ofte brugt til fakturering'
    },
    {
      id: '2',
      text: 'Send en påmindelse om betaling til',
      type: 'template',
      category: 'email',
      confidence: 88,
      usage: 89,
      context: 'Betalingspåmindelse template'
    },
    {
      id: '3',
      text: '/create invoice for',
      type: 'command',
      category: 'kommando',
      confidence: 92,
      usage: 234,
      context: 'Slash kommando til faktura'
    },
    {
      id: '4',
      text: 'Book et møde med',
      type: 'phrase',
      category: 'kalender',
      confidence: 85,
      usage: 67,
      context: 'Møde booking'
    },
    {
      id: '5',
      text: 'john@company.com',
      type: 'contact',
      category: 'kontakt',
      confidence: 90,
      usage: 145,
      context: 'Email kontakt'
    },
    {
      id: '6',
      text: 'Ugentlig rapport for',
      type: 'template',
      category: 'rapport',
      confidence: 78,
      usage: 34,
      context: 'Rapport template'
    },
    {
      id: '7',
      text: 'Opdater kundeinformation for',
      type: 'phrase',
      category: 'kunde',
      confidence: 82,
      usage: 56,
      context: 'Kunde administration'
    },
    {
      id: '8',
      text: 'Analyser salgsdata for',
      type: 'command',
      category: 'analyse',
      confidence: 75,
      usage: 23,
      context: 'Salgsanalyse'
    },
    {
      id: '9',
      text: 'F-2024-',
      type: 'template',
      category: 'faktura',
      confidence: 87,
      usage: 201,
      context: 'Faktura nummer format'
    },
    {
      id: '10',
      text: 'Mange tak for din henvendelse',
      type: 'phrase',
      category: 'email',
      confidence: 91,
      usage: 178,
      context: 'Polite email åbning'
    }
  ];

  const autoCompleteSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  useEffect(() => {
    if (input.length > 2) {
      const filtered = autoCompleteSuggestions
        .filter(suggestion => 
          suggestion.text.toLowerCase().includes(input.toLowerCase()) ||
          suggestion.category.toLowerCase().includes(input.toLowerCase())
        )
        .sort((a, b) => {
          // Sort by confidence first, then by usage
          if (a.confidence !== b.confidence) {
            return b.confidence - a.confidence;
          }
          return (b.usage || 0) - (a.usage || 0);
        })
        .slice(0, maxSuggestions);
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [input, autoCompleteSuggestions, maxSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev + 1) % filteredSuggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (filteredSuggestions[selectedSuggestionIndex]) {
          selectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const selectSuggestion = (suggestion: AutoCompleteSuggestion) => {
    setInput(suggestion.text);
    setShowSuggestions(false);
    
    // Add to recent
    setRecentSuggestions(prev => [suggestion.id, ...prev.filter(id => id !== suggestion.id)].slice(0, 5));
    
    onSelectSuggestion?.(suggestion);
  };

  const toggleFavorite = (suggestionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(suggestionId)
      ? favorites.filter(id => id !== suggestionId)
      : [...favorites, suggestionId];
    setFavorites(updated);
    onAddToFavorites?.(suggestionId);
  };

  const getTypeIcon = (type: AutoCompleteSuggestion['type']) => {
    switch (type) {
      case 'phrase': return '💬';
      case 'template': return '📋';
      case 'command': return '⚡';
      case 'contact': return '👤';
      case 'file': return '📎';
      default: return '💡';
    }
  };

  const getTypeLabel = (type: AutoCompleteSuggestion['type']) => {
    switch (type) {
      case 'phrase': return 'Frase';
      case 'template': return 'Skabelon';
      case 'command': return 'Kommando';
      case 'contact': return 'Kontakt';
      case 'file': return 'Fil';
      default: return type;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'faktura': return 'bg-orange-500';
      case 'email': return 'bg-blue-500';
      case 'kalender': return 'bg-purple-500';
      case 'kontakt': return 'bg-green-500';
      case 'rapport': return 'bg-indigo-500';
      case 'kunde': return 'bg-teal-500';
      case 'analyse': return 'bg-pink-500';
      case 'kommando': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTopSuggestions = () => {
    return autoCompleteSuggestions
      .filter(s => !favorites.includes(s.id))
      .sort((a, b) => (b.usage || 0) - (a.usage || 0))
      .slice(0, 4);
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Auto Complete</h4>
              <p className="text-xs text-muted-foreground">Intelligent auto-fuldførelse</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500">{autoCompleteSuggestions.length} forslag</Badge>
            <Button size="sm" variant="ghost">
              <Zap className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Auto Complete Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Begynd at skrive:</label>
          <div className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-10 px-3 border rounded-lg text-sm pr-10"
              onFocus={() => {
                if (input.length > 2) {
                  setShowSuggestions(true);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Type className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="border rounded-lg bg-background shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                className={cn(
                  "w-full text-left p-3 flex items-center gap-3 transition-colors border-b last:border-b-0",
                  index === selectedSuggestionIndex 
                    ? "bg-purple-50 dark:bg-purple-950/20 border-l-2 border-l-purple-500" 
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {suggestion.confidence}%
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{suggestion.text}</span>
                    <Badge className={getCategoryColor(suggestion.category)}>
                      {suggestion.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{getTypeLabel(suggestion.type)}</span>
                    {suggestion.usage && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {suggestion.usage} brugt
                      </span>
                    )}
                    {recentSuggestions.includes(suggestion.id) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Nylig
                      </span>
                    )}
                  </div>
                  {suggestion.context && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      {suggestion.context}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => toggleFavorite(suggestion.id, e)}
                    className="p-1 rounded hover:bg-muted/50"
                    title={favorites.includes(suggestion.id) ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}
                  >
                    <Star className={cn("w-4 h-4", favorites.includes(suggestion.id) ? "text-yellow-500 fill-yellow-500" : "text-gray-400")} />
                  </button>
                  {index === selectedSuggestionIndex && (
                    <Check className="w-4 h-4 text-purple-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Top Suggestions */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-muted-foreground">Populære forslag:</label>
            {favorites.length > 0 && (
              <Button size="sm" variant="ghost">
                <Star className="w-3 h-3 mr-1" />
                Favoritter ({favorites.length})
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {getTopSuggestions().map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => selectSuggestion(suggestion)}
                className="text-left p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{getTypeIcon(suggestion.type)}</span>
                  <span className="text-xs font-medium truncate">{suggestion.text}</span>
                  {suggestion.usage && (
                    <span className="text-xs text-muted-foreground">({suggestion.usage})</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="font-bold text-purple-700 dark:text-purple-300">
              {autoCompleteSuggestions.reduce((sum, s) => sum + (s.usage || 0), 0)}
            </p>
            <p className="text-purple-600 dark:text-purple-400">Total brug</p>
          </div>
          <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-950/20 text-center">
            <p className="font-bold text-pink-700 dark:text-pink-300">
              {Math.round(autoCompleteSuggestions.reduce((sum, s) => sum + s.confidence, 0) / autoCompleteSuggestions.length)}%
            </p>
            <p className="text-pink-600 dark:text-pink-400">Gns. confidence</p>
          </div>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-center">
            <p className="font-bold text-indigo-700 dark:text-indigo-300">
              {recentSuggestions.length}
            </p>
            <p className="text-indigo-600 dark:text-indigo-400">Nylige</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-700 dark:text-purple-400">
              <p className="font-semibold mb-1">Smart auto-complete features:</p>
              <ul className="space-y-1">
                <li>• Begynd at skrive for at se forslag</li>
                <li>• Brug ↑/↓ piletaster til navigation</li>
                <li>• Tryk Enter eller Tab for at vælge</li>
                <li>• Stjernemarkér favoritter</li>
                <li>• Lær af dine brugsmønstre</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={() => setInput('')} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Ryd
          </Button>
          <Button className="flex-1 bg-linear-to-r from-purple-600 to-pink-600">
            <Type className="w-4 h-4 mr-2" />
            Anvend
          </Button>
        </div>
      </div>
    </Card>
  );
}
