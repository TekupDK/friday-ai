/**
 * Phase 9.9: 3-Panel Email Assistant Integration
 * 
 * Integrates AI email suggestions in the middle panel
 * Below the email content, above the reply box
 */

"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  Mail, 
  Clock, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  Edit3,
  Send,
  Lightbulb,
  Target,
  Calendar,
  User,
  Building,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface EmailSuggestion {
  id: string;
  title: string;
  content: string;
  confidence: number;
  source: string;
  category: "quote" | "question" | "information" | "booking";
  metadata: {
    estimatedPrice?: number;
    estimatedHours?: string;
    proposedTime?: string;
    jobType?: string;
    location?: string;
  };
  reasoning: string;
}

interface EmailAnalysis {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  jobType: string;
  location: string;
  urgency: "high" | "medium" | "low";
  estimatedPrice: number;
  estimatedHours: string;
  specialRequirements: string[];
  sourceDetection: any;
}

interface EmailAssistant3PanelProps {
  emailData: {
    from: string;
    subject: string;
    body: string;
    threadId: string;
  };
  onInsertReply: (content: string) => void;
  onSendEmail: (content: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function EmailAssistant3Panel({ 
  emailData, 
  onInsertReply, 
  onSendEmail,
  isCollapsed = false,
  onToggleCollapse
}: EmailAssistant3PanelProps) {
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<EmailSuggestion | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isInserting, setIsInserting] = useState(false);

  // Analyze email when data changes
  useEffect(() => {
    if (!isCollapsed) {
      analyzeEmail();
    }
  }, [emailData, isCollapsed]);

  const analyzeEmail = async () => {
    setIsAnalyzing(true);
    try {
      // Call server-side analysis
      const result = await trpc.automation['analyzeEmail'].query({
        from: emailData.from,
        subject: emailData.subject,
        body: emailData.body,
      });

      setAnalysis(result.analysis);
      setSuggestions(result.suggestions);
      
      // Auto-select highest confidence suggestion
      if (result.suggestions.length > 0) {
        setSelectedSuggestion(result.suggestions[0]);
        setEditedContent(result.suggestions[0].content);
      }
    } catch (error) {
      console.error("Error analyzing email:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionClick = (suggestion: EmailSuggestion) => {
    setSelectedSuggestion(suggestion);
    setEditedContent(suggestion.content);
  };

  const handleInsertReply = async () => {
    if (!editedContent.trim()) return;
    
    setIsInserting(true);
    try {
      await onInsertReply(editedContent);
      
      // Log the chosen suggestion for analytics
      if (selectedSuggestion) {
        await trpc.automation['logSuggestionUsage'].mutate({
          suggestionId: selectedSuggestion.id,
          emailData,
          chosenContent: editedContent,
          sent: true,
        });
      }
    } catch (error) {
      console.error("Error inserting reply:", error);
    } finally {
      setIsInserting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!editedContent.trim()) return;
    
    setIsInserting(true);
    try {
      await onSendEmail(editedContent);
      
      // Log the usage
      if (selectedSuggestion) {
        await trpc.automation['logSuggestionUsage'].mutate({
          suggestionId: selectedSuggestion.id,
          emailData,
          chosenContent: selectedSuggestion.content,
          sent: false,
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsInserting(false);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    const colors = {
      "rengoring_nu": "bg-green-500",
      "rengoring_aarhus": "bg-blue-500", 
      "adhelp": "bg-purple-500",
      "website": "bg-emerald-500",
      "direct": "bg-gray-500",
      "unknown": "bg-slate-500",
    };
    return colors[source as keyof typeof colors] || "bg-gray-500";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "quote": return <DollarSign className="w-4 h-4" />;
      case "question": return <Lightbulb className="w-4 h-4" />;
      case "information": return <Target className="w-4 h-4" />;
      case "booking": return <Calendar className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // If collapsed, show minimal version
  if (isCollapsed) {
    return (
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">AI Email Assistant</span>
            {analysis && (
              <Badge className={`${getSourceBadgeColor(analysis.sourceDetection.source)} text-white text-xs`}>
                {analysis.sourceDetection.source}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-blue-600 hover:text-blue-700"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-blue-600 animate-pulse" />
          <div>
            <h3 className="font-semibold text-sm">Analyserer email...</h3>
            <p className="text-xs text-gray-600">AI analyserer indhold og genererer forslag</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold">AI Email Assistant</span>
          <Badge variant="outline" className="text-xs">
            {suggestions.length} forslag
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowRight className="w-4 h-4 rotate-90" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Email Analysis Summary - Compact */}
        {analysis && (
          <Card className="p-3">
            <CardContent className="p-0 space-y-2">
              {/* Customer Info Row */}
              <div className="flex items-center gap-2 text-sm">
                <User className="w-3 h-3 text-gray-500" />
                <span className="font-medium">{analysis.customerName}</span>
                <span className="text-gray-500 text-xs">({analysis.customerEmail})</span>
                {analysis.customerPhone && (
                  <span className="text-gray-500 text-xs">• {analysis.customerPhone}</span>
                )}
              </div>
              
              {/* Job and Location Row */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-gray-500" />
                  <span>{analysis.jobType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  <span>{analysis.location}</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getUrgencyColor(analysis.urgency)}`}>
                  {analysis.urgency === "high" ? "Haster" : analysis.urgency === "medium" ? "Medium" : "Lav"}
                </div>
              </div>

              {/* Source and Estimates Row */}
              <div className="flex items-center gap-3 text-sm">
                <Badge className={`${getSourceBadgeColor(analysis.sourceDetection.source)} text-white text-xs`}>
                  {analysis.sourceDetection.source}
                </Badge>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-gray-500" />
                  <span className="font-medium">{analysis.estimatedPrice} kr.</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span>{analysis.estimatedHours}</span>
                </div>
              </div>

              {/* Special Requirements */}
              {analysis.specialRequirements.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {analysis.specialRequirements.map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Email Suggestions - Horizontal Scroll */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-600" />
            AI Forslag
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`shrink-0 p-3 border rounded-lg cursor-pointer transition-all min-w-[200px] ${
                  selectedSuggestion?.id === suggestion.id 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(suggestion.category)}
                    <span className="font-medium text-xs">{suggestion.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {suggestion.confidence}%
                    </Badge>
                    {selectedSuggestion?.id === suggestion.id && (
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{suggestion.reasoning}</p>
                
                {suggestion.metadata.estimatedPrice && (
                  <div className="flex items-center gap-1 text-xs">
                    <DollarSign className="w-3 h-3 text-gray-500" />
                    <span>{suggestion.metadata.estimatedPrice} kr.</span>
                    {suggestion.metadata.estimatedHours && (
                      <>
                        <Clock className="w-3 h-3 text-gray-500 ml-1" />
                        <span>{suggestion.metadata.estimatedHours}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email Editor - Compact */}
        {selectedSuggestion && (
          <Card className="p-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-green-600" />
                Email Kladde
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[200px] font-mono text-xs"
                placeholder="Rediger email indhold her..."
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleInsertReply}
                  disabled={!editedContent.trim() || isInserting}
                  className="flex-1"
                  variant="outline"
                  size="sm"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  {isInserting ? "Indsætter..." : "Insert Draft Reply"}
                </Button>
                
                <Button
                  onClick={handleSendEmail}
                  disabled={!editedContent.trim() || isInserting}
                  className="flex-1"
                  size="sm"
                >
                  <Send className="w-3 h-3 mr-1" />
                  {isInserting ? "Sender..." : "Send Email"}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Du kan redigere teksten før afsendelse. AI forslaget er automatisk genereret.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
