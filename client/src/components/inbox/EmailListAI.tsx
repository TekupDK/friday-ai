/**
 * EmailListAI - AI-Enhanced Email List Component
 * 
 * Enhanced email list with lead scoring, source detection, and AI-powered prioritization
 * Integrates with Email Assistant for complete workflow optimization
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import type { EnhancedEmailMessage, SortOption, FilterSource, Density } from "@/types/enhanced-email";
import {
  Archive,
  CheckCircle2,
  Circle,
  Paperclip,
  Star,
  Trash2,
  Flame,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Target,
  Building,
  Globe,
  Mail,
  Filter,
  SortAsc,
  Search,
} from "lucide-react";

// Types imported from enhanced-email.ts

interface EmailListAIProps {
  emails: EnhancedEmailMessage[];
  onEmailSelect: (email: EnhancedEmailMessage) => void;
  selectedThreadId: string | null;
  selectedEmails: Set<string>;
  onEmailSelectionChange: (threadIds: Set<string>) => void;
  density?: Density;
  isLoading?: boolean;
}

// Source badge colors and icons
const getSourceConfig = (source: string | null) => {
  switch (source) {
    case 'rengoring_nu':
      return { color: 'bg-green-100 text-green-800 border-green-200', icon: TrendingUp, label: 'Rengøring.nu' };
    case 'rengoring_aarhus':
      return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: MapPin, label: 'Aarhus' };
    case 'adhelp':
      return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Building, label: 'Adhelp' };
    case 'direct':
      return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Mail, label: 'Direct' };
    default:
      return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Mail, label: 'Unknown' };
  }
};

// Lead score badge colors
const getLeadScoreConfig = (score: number) => {
  if (score >= 80) return { color: 'bg-red-100 text-red-800 border-red-200', icon: Flame, label: 'Hot' };
  if (score >= 60) return { color: 'bg-green-100 text-green-800 border-green-200', icon: TrendingUp, label: 'High' };
  if (score >= 40) return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Target, label: 'Medium' };
  return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Circle, label: 'Low' };
};

// Urgency colors
const getUrgencyConfig = (urgency: string) => {
  switch (urgency) {
    case 'high': return { color: 'bg-red-100 text-red-800', label: 'Urgent' };
    case 'medium': return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' };
    case 'low': return { color: 'bg-gray-100 text-gray-800', label: 'Low' };
    default: return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  }
};

export default function EmailListAI({
  emails,
  onEmailSelect,
  selectedThreadId,
  selectedEmails,
  onEmailSelectionChange,
  density = 'comfortable',
  isLoading = false,
}: EmailListAIProps) {
  const [sortBy, setSortBy] = useState<SortOption>('leadScore');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const parentRef = useRef<HTMLDivElement>(null);
  
  // AI Analysis mutation for emails without analysis
  // DISABLED: Causes infinite loop - needs proper state management
  // const analyzeEmail = trpc.automation['analyzeEmail'].useMutation();

  // TODO: Re-enable AI analysis with proper state management to avoid infinite loop
  // useEffect(() => {
  //   emails.forEach(async (email) => {
  //     if (!email.aiAnalysis && email.body && email.from) {
  //       try {
  //         const result = await analyzeEmail.mutateAsync({
  //           from: email.from,
  //           subject: email.subject,
  //           body: email.body,
  //         });
  //         
  //         // Update email with AI analysis (this would typically update state)
  //         console.log('AI Analysis for', email.threadId, result);
  //       } catch (error) {
  //         console.error('Failed to analyze email:', error);
  //       }
  //     }
  //   });
  // }, [emails, analyzeEmail]);

  // Filter and sort emails
  const processedEmails = useMemo(() => {
    let filtered = emails;
    
    // Apply source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter((email: EnhancedEmailMessage) => email.aiAnalysis?.source === filterSource);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((email: EnhancedEmailMessage) => 
        email.subject.toLowerCase().includes(query) ||
        email.from.toLowerCase().includes(query) ||
        email.snippet.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    return filtered.sort((a: EnhancedEmailMessage, b: EnhancedEmailMessage) => {
      switch (sortBy) {
        case 'leadScore':
          return (b.aiAnalysis?.leadScore || 0) - (a.aiAnalysis?.leadScore || 0);
        case 'value':
          return (b.aiAnalysis?.estimatedValue || 0) - (a.aiAnalysis?.estimatedValue || 0);
        case 'date':
        default:
          return new Date(b.internalDate || b.date).getTime() - new Date(a.internalDate || a.date).getTime();
      }
    });
  }, [emails, filterSource, searchQuery, sortBy]);

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: processedEmails.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => density === 'compact' ? 60 : 80,
    overscan: 5,
  });

  // Handle email selection
  const handleEmailClick = useCallback((email: EnhancedEmailMessage, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      const newSelection = new Set(selectedEmails);
      if (newSelection.has(email.threadId)) {
        newSelection.delete(email.threadId);
      } else {
        newSelection.add(email.threadId);
      }
      onEmailSelectionChange(newSelection);
    } else {
      // Single selection
      onEmailSelect(email);
    }
  }, [selectedEmails, onEmailSelect, onEmailSelectionChange]);

  // Get display name
  const getDisplayName = useCallback((email: string) => {
    return email.split('<')[0].trim().replace(/"/g, '');
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // Intelligence summary
  const intelligenceSummary = useMemo(() => {
    const totalValue = emails.reduce((sum, email) => sum + (email.aiAnalysis?.estimatedValue || 0), 0);
    const hotLeads = emails.filter(email => (email.aiAnalysis?.leadScore || 0) >= 80).length;
    const sourceCounts = emails.reduce((acc, email) => {
      const source = email.aiAnalysis?.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalValue,
      hotLeads,
      sourceCounts,
      totalEmails: emails.length,
    };
  }, [emails]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Intelligence Header */}
      <div className="border-b border-border/20 p-4 bg-muted/30">
        <div className="space-y-3">
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Søg emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border/20 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'leadScore' ? 'date' : 'leadScore')}
              className="flex items-center gap-2"
            >
              <SortAsc className="w-4 h-4" />
              {sortBy === 'leadScore' ? 'Score' : sortBy === 'value' ? 'Value' : 'Date'}
            </Button>
          </div>

          {/* Source Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filterSource === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSource('all')}
            >
              All ({intelligenceSummary.totalEmails})
            </Button>
            <Button
              variant={filterSource === 'rengoring_nu' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSource('rengoring_nu')}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Rengøring.nu ({intelligenceSummary.sourceCounts.rengoring_nu || 0})
            </Button>
            <Button
              variant={filterSource === 'direct' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterSource('direct')}
            >
              <Mail className="w-3 h-3 mr-1" />
              Direct ({intelligenceSummary.sourceCounts.direct || 0})
            </Button>
          </div>

          {/* Intelligence Summary */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span className="font-medium">{intelligenceSummary.hotLeads}</span>
              <span className="text-muted-foreground">Hot Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium">{formatCurrency(intelligenceSummary.totalValue)}</span>
              <span className="text-muted-foreground">Est. Value</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="font-medium">
                {Math.round(intelligenceSummary.totalValue / Math.max(intelligenceSummary.totalEmails, 1))}
              </span>
              <span className="text-muted-foreground">Avg Value</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        ref={parentRef}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => {
            const email = processedEmails[virtualRow.index];
            if (!email) return null;

            const isSelected = selectedThreadId === email.threadId;
            const aiData = email.aiAnalysis;
            const leadScoreConfig = aiData ? getLeadScoreConfig(aiData.leadScore) : null;
            const sourceConfig = aiData ? getSourceConfig(aiData.source) : null;
            const urgencyConfig = aiData ? getUrgencyConfig(aiData.urgency) : null;

            return (
              <div
                key={email.threadId}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`group border-b border-border/20 transition-colors ${
                  isSelected ? "bg-primary/5 border-primary/20" : "hover:bg-muted/30"
                }`}
              >
                <div
                  className={`p-3 cursor-pointer ${
                    density === 'compact' ? 'py-2' : 'py-3'
                  }`}
                  onClick={(e) => handleEmailClick(email, e)}
                  role="button"
                  tabIndex={0}
                  aria-selected={isSelected}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedEmails.has(email.threadId)}
                        onClick={e => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {density === 'compact' ? (
                        // Compact layout
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* Lead Score Badge */}
                            {leadScoreConfig && (
                              <Badge variant="outline" className={`shrink-0 ${leadScoreConfig.color}`}>
                                <leadScoreConfig.icon className="w-3 h-3 mr-1" />
                                {aiData?.leadScore}
                              </Badge>
                            )}
                            
                            {email.unread && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            )}
                            
                            <button
                              onClick={e => e.stopPropagation()}
                              className="font-medium text-sm text-foreground shrink-0 hover:underline hover:text-primary transition-colors"
                            >
                              {getDisplayName(email.from || email.sender)}
                            </button>
                            
                            <span className="text-muted-foreground/70 text-sm">•</span>
                            
                            <h3 className="text-sm text-foreground/90 truncate">
                              {email.subject}
                            </h3>
                            
                            {email.hasAttachment && (
                              <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Source Badge */}
                            {sourceConfig && (
                              <Badge variant="outline" className={`shrink-0 ${sourceConfig.color}`}>
                                <sourceConfig.icon className="w-3 h-3 mr-1" />
                                {sourceConfig.label}
                              </Badge>
                            )}
                            
                            <span className="text-xs text-muted-foreground/70 whitespace-nowrap tabular-nums">
                              {new Date(email.internalDate || email.date).toLocaleString("da-DK", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Comfortable layout
                        <>
                          {/* First row: Name, score, source, time */}
                          <div className="flex items-baseline gap-2 mb-2">
                            {/* Lead Score Badge */}
                            {leadScoreConfig && (
                              <Badge variant="outline" className={`shrink-0 ${leadScoreConfig.color}`}>
                                <leadScoreConfig.icon className="w-3 h-3 mr-1" />
                                {aiData?.leadScore}
                              </Badge>
                            )}
                            
                            {email.unread && (
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                            )}
                            
                            <button
                              onClick={e => e.stopPropagation()}
                              className="font-medium text-sm text-foreground hover:underline hover:text-primary transition-colors"
                            >
                              {getDisplayName(email.from || email.sender)}
                            </button>
                            
                            <span className="text-muted-foreground/70 text-xs">
                              {new Date(email.internalDate || email.date).toLocaleString("da-DK", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            
                            {/* Source Badge */}
                            {sourceConfig && (
                              <Badge variant="outline" className={`shrink-0 ${sourceConfig.color}`}>
                                <sourceConfig.icon className="w-3 h-3 mr-1" />
                                {sourceConfig.label}
                              </Badge>
                            )}
                            
                            {/* Urgency Badge */}
                            {urgencyConfig && aiData?.urgency !== 'low' && (
                              <Badge variant="secondary" className={`shrink-0 ${urgencyConfig.color}`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {urgencyConfig.label}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Second row: Subject */}
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-sm truncate ${
                              email.unread ? 'font-semibold text-foreground' : 'text-foreground/90'
                            }`}>
                              {email.subject}
                            </h3>
                            {email.hasAttachment && (
                              <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
                            )}
                          </div>
                          
                          {/* Third row: AI Intelligence */}
                          {aiData && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{aiData.location}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                <span>{aiData.jobType}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>{formatCurrency(aiData.estimatedValue)}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                <span>{aiData.confidence}%</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Snippet */}
                          <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-1">
                            {email.snippet}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

