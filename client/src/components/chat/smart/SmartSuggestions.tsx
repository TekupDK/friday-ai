/**
 * SMART SUGGESTIONS - AI-drevne forslag
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lightbulb, Zap, Clock, TrendingUp, Star, MessageSquare, Calendar, Mail, FileText } from "lucide-react";
import { useState } from "react";

export interface SmartSuggestion {
  id: string;
  type: 'action' | 'question' | 'template' | 'insight';
  title: string;
  description: string;
  icon: any;
  category: 'productivity' | 'communication' | 'analytics' | 'automation';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  context?: string;
  usage?: number;
}

interface SmartSuggestionsProps {
  suggestions?: SmartSuggestion[];
  onApplySuggestion?: (suggestion: SmartSuggestion) => void;
  onDismissSuggestion?: (suggestionId: string) => void;
  onRefresh?: () => void;
}

export function SmartSuggestions({ 
  suggestions = [],
  onApplySuggestion,
  onDismissSuggestion,
  onRefresh 
}: SmartSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  // Default smart suggestions
  const defaultSuggestions: SmartSuggestion[] = [
    {
      id: '1',
      type: 'action',
      title: 'Opret opfølgende email',
      description: 'Send en påmindelse til kunder med forfaldne fakturaer',
      icon: Mail,
      category: 'communication',
      priority: 'high',
      confidence: 92,
      context: '3 forfaldne fakturaer',
      usage: 156
    },
    {
      id: '2',
      type: 'template',
      title: 'Ugentlig rapport template',
      description: 'Brug denne template til ugentlige kundrapporter',
      icon: FileText,
      category: 'productivity',
      priority: 'medium',
      confidence: 87,
      usage: 89
    },
    {
      id: '3',
      type: 'insight',
      title: 'Salg stigning detekteret',
      description: 'Salget er steget 23% i denne uge sammenlignet med sidste uge',
      icon: TrendingUp,
      category: 'analytics',
      priority: 'medium',
      confidence: 95,
      context: 'Baseret på ugentlige data'
    },
    {
      id: '4',
      type: 'action',
      title: 'Planlæg team møde',
      description: 'Book et møde med salgsteamet for at gennemgå Q1 resultater',
      icon: Calendar,
      category: 'productivity',
      priority: 'high',
      confidence: 88,
      usage: 45
    },
    {
      id: '5',
      type: 'question',
      title: 'Kunde tilfredshed check',
      description: 'Spørg kunder om deres erfaringer med den nye service',
      icon: MessageSquare,
      category: 'communication',
      priority: 'medium',
      confidence: 76,
      usage: 23
    },
    {
      id: '6',
      type: 'template',
      title: 'Faktura follow-up skabelon',
      description: 'Standard skabelon for betalingspåmindelser',
      icon: FileText,
      category: 'automation',
      priority: 'low',
      confidence: 82,
      usage: 201
    },
    {
      id: '7',
      type: 'insight',
      title: 'Optimer rengøringsplan',
      description: 'Kunde A booker ofte fredage - overvej fast aftale',
      icon: Zap,
      category: 'analytics',
      priority: 'medium',
      confidence: 79,
      context: 'Baseret på booking mønstre'
    },
    {
      id: '8',
      type: 'action',
      title: 'Opdater prislister',
      description: 'Priserne for REN-003 er sidst opdateret for 6 måneder siden',
      icon: FileText,
      category: 'automation',
      priority: 'low',
      confidence: 71,
      usage: 12
    }
  ];

  const smartSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  const filteredSuggestions = smartSuggestions.filter(suggestion => {
    if (dismissedSuggestions.includes(suggestion.id)) return false;
    if (selectedCategory === 'all') return true;
    return suggestion.category === selectedCategory;
  });

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
    onDismissSuggestion?.(suggestionId);
  };

  const getCategoryColor = (category: SmartSuggestion['category']) => {
    switch (category) {
      case 'productivity': return 'bg-blue-500';
      case 'communication': return 'bg-green-500';
      case 'analytics': return 'bg-purple-500';
      case 'automation': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: SmartSuggestion['category']) => {
    switch (category) {
      case 'productivity': return 'Produktivitet';
      case 'communication': return 'Kommunikation';
      case 'analytics': return 'Analytik';
      case 'automation': return 'Automatisering';
      default: return category;
    }
  };

  const getTypeIcon = (type: SmartSuggestion['type']) => {
    switch (type) {
      case 'action': return '⚡';
      case 'question': return '❓';
      case 'template': return '📋';
      case 'insight': return '💡';
      default: return '💡';
    }
  };

  const getPriorityColor = (priority: SmartSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const categories = [
    { id: 'all', label: 'Alle', count: smartSuggestions.length },
    { id: 'productivity', label: 'Produktivitet', count: smartSuggestions.filter(s => s.category === 'productivity').length },
    { id: 'communication', label: 'Kommunikation', count: smartSuggestions.filter(s => s.category === 'communication').length },
    { id: 'analytics', label: 'Analytik', count: smartSuggestions.filter(s => s.category === 'analytics').length },
    { id: 'automation', label: 'Automatisering', count: smartSuggestions.filter(s => s.category === 'automation').length }
  ];

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-md">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Smart Suggestions</h4>
              <p className="text-xs text-muted-foreground">AI-drevne forslag</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500">{filteredSuggestions.length} forslag</Badge>
            <Button size="sm" variant="ghost" onClick={onRefresh}>
              <Zap className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Kategorier:</label>
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs transition-colors",
                  selectedCategory === category.id
                    ? "bg-yellow-500 text-white"
                    : "bg-muted hover:bg-muted/70"
                )}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-semibold">AI Forslag:</h5>
            {dismissedSuggestions.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissedSuggestions([])}
              >
                Gendan ({dismissedSuggestions.length})
              </Button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <div key={suggestion.id} className="p-3 rounded-lg bg-linear-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-yellow-400 to-orange-600 flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{getTypeIcon(suggestion.type)}</span>
                              <span className="font-medium text-sm">{suggestion.title}</span>
                              <Badge className={getPriorityColor(suggestion.priority)}>
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                            
                            {/* Metadata */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Badge className={getCategoryColor(suggestion.category)}>
                                  {getCategoryLabel(suggestion.category)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Confidence:</span>
                                <span className={cn("font-medium", getConfidenceColor(suggestion.confidence))}>
                                  {suggestion.confidence}%
                                </span>
                              </div>
                              {suggestion.usage && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  <span>{suggestion.usage} brugt</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Context */}
                            {suggestion.context && (
                              <div className="mt-2 p-2 rounded bg-white/50 dark:bg-black/20 text-xs">
                                <span className="font-medium">Kontekst:</span> {suggestion.context}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => onApplySuggestion?.(suggestion)}
                            className="flex-1 bg-linear-to-r from-yellow-600 to-orange-600"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Anvend
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDismiss(suggestion.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ingen forslag tilgængelige</p>
                <p className="text-xs">Prøv at skifte kategori eller refresh</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-center">
            <p className="font-bold text-yellow-700 dark:text-yellow-300">
              {smartSuggestions.filter(s => s.priority === 'high').length}
            </p>
            <p className="text-yellow-600 dark:text-yellow-400">Høj prioritet</p>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-center">
            <p className="font-bold text-orange-700 dark:text-orange-300">
              {Math.round(smartSuggestions.reduce((sum, s) => sum + s.confidence, 0) / smartSuggestions.length)}%
            </p>
            <p className="text-orange-600 dark:text-orange-400">Gns. confidence</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-center">
            <p className="font-bold text-amber-700 dark:text-amber-300">
              {smartSuggestions.filter(s => s.type === 'action').length}
            </p>
            <p className="text-amber-600 dark:text-amber-400">Handlinger</p>
          </div>
          <div className="p-2 rounded-lg bg-lime-50 dark:bg-lime-950/20 text-center">
            <p className="font-bold text-lime-700 dark:text-lime-300">
              {smartSuggestions.reduce((sum, s) => sum + (s.usage || 0), 0)}
            </p>
            <p className="text-lime-600 dark:text-lime-400">Total brug</p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="p-3 rounded-lg bg-linear-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-300 dark:border-yellow-700">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-700 dark:text-yellow-400">
              <p className="font-semibold mb-1">AI Insights:</p>
              <p>Baseret på din aktivitet er der {smartSuggestions.filter(s => s.priority === 'high').length} høj-prioritets handlinger, der kan forbedre din workflow med op til 40%.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={onRefresh} className="flex-1 bg-linear-to-r from-yellow-600 to-orange-600">
            <Zap className="w-4 h-4 mr-2" />
            Generer nye forslag
          </Button>
          <Button variant="outline" className="flex-1">
            <Clock className="w-4 h-4 mr-2" />
            Historik
          </Button>
        </div>
      </div>
    </Card>
  );
}
