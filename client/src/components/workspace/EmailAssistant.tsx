/**
 * Phase 9.9: Email Assistant Component
 *
 * Shortwave-inspired email suggestion interface
 * Shows AI suggestions and allows one-click insertion
 */

"use client";

import {
  Bot,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit3,
  Lightbulb,
  Mail,
  MapPin,
  Send,
  Target,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { logger } from "@/lib/logger";
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

interface EmailAssistantProps {
  emailData: {
    from: string;
    subject: string;
    body: string;
    threadId: string;
  };
  onInsertReply: (content: string) => void;
  onSendEmail: (content: string) => void;
}

export function EmailAssistant({
  emailData,
  onInsertReply,
  onSendEmail,
}: EmailAssistantProps) {
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<EmailSuggestion | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isInserting, setIsInserting] = useState(false);

  // Analyze email when data changes
  useEffect(() => {
    analyzeEmail();
     
  }, [emailData]); // Analyze email when data changes

  const analyzeEmail = async () => {
    setIsAnalyzing(true);
    try {
      // Call server-side analysis
      const result = await (trpc as any).automation.analyzeEmail.query({
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
      logger.error("Error analyzing email", {}, error);
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
        await (trpc as any).automation.logSuggestionUsage.mutate({
          suggestionId: selectedSuggestion.id,
          emailData,
          chosenContent: editedContent,
        });
      }
    } catch (error) {
      logger.error("Error inserting reply", {}, error);
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
        await (trpc as any).automation.logSuggestionUsage.mutate({
          suggestionId: selectedSuggestion.id,
          emailData,
          chosenContent: editedContent,
          sent: true,
        });
      }
    } catch (error) {
      logger.error("Error sending email", {}, error);
    } finally {
      setIsInserting(false);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    const colors = {
      rengoring_nu: "bg-green-500",
      rengoring_aarhus: "bg-blue-500",
      adhelp: "bg-purple-500",
      website: "bg-emerald-500",
      direct: "bg-gray-500",
      unknown: "bg-slate-500",
    };
    return colors[source as keyof typeof colors] || "bg-gray-500";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "quote":
        return <DollarSign className="w-4 h-4" />;
      case "question":
        return <Lightbulb className="w-4 h-4" />;
      case "information":
        return <Target className="w-4 h-4" />;
      case "booking":
        return <Calendar className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Bot className="w-5 h-5 text-blue-600 animate-pulse" />
            <div>
              <h3 className="font-semibold">Analyserer email...</h3>
              <p className="text-sm text-gray-600">
                AI analyserer indhold og genererer forslag
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Email Analysis Summary */}
      {analysis && (
        <Card className="p-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              Email Analyse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Customer Info */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{analysis.customerName}</span>
              <span className="text-gray-500">({analysis.customerEmail})</span>
              {analysis.customerPhone && (
                <span className="text-gray-500">
                  • {analysis.customerPhone}
                </span>
              )}
            </div>

            {/* Job and Location */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span>{analysis.jobType}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{analysis.location}</span>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(analysis.urgency)}`}
              >
                {analysis.urgency === "high"
                  ? "Haster"
                  : analysis.urgency === "medium"
                    ? "Medium"
                    : "Lav prioritet"}
              </div>
            </div>

            {/* Source and Estimates */}
            <div className="flex items-center gap-4">
              <Badge
                className={`${getSourceBadgeColor(analysis.sourceDetection.source)} text-white text-xs`}
              >
                {analysis.sourceDetection.source}
              </Badge>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-medium">
                  {analysis.estimatedPrice} kr.
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-500" />
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

      {/* Email Suggestions */}
      <Card className="p-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            AI Forslag ({suggestions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map(suggestion => (
            <div
              key={suggestion.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedSuggestion?.id === suggestion.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(suggestion.category)}
                  <span className="font-medium">{suggestion.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {suggestion.confidence}% match
                  </Badge>
                  {selectedSuggestion?.id === suggestion.id && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {suggestion.reasoning}
              </p>

              {suggestion.metadata.estimatedPrice && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-3 h-3 text-gray-500" />
                  <span>{suggestion.metadata.estimatedPrice} kr.</span>
                  {suggestion.metadata.estimatedHours && (
                    <>
                      <Clock className="w-3 h-3 text-gray-500 ml-2" />
                      <span>{suggestion.metadata.estimatedHours}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Email Editor */}
      {selectedSuggestion && (
        <Card className="p-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-green-600" />
              Email Kladde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Rediger email indhold her..."
            />

            <div className="flex gap-2">
              <Button
                onClick={handleInsertReply}
                disabled={!editedContent.trim() || isInserting}
                className="flex-1"
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isInserting ? "Indsætter..." : "Insert Draft Reply"}
              </Button>

              <Button
                onClick={handleSendEmail}
                disabled={!editedContent.trim() || isInserting}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {isInserting ? "Sender..." : "Send Email"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Du kan redigere teksten før afsendelse. AI forslaget er automatisk
              genereret.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
