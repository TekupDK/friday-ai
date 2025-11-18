/**
 * AI Email Assistant Demo
 * Viser jeres EmailAssistant3Panel features
 */

import {
  User,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Lightbulb,
  CheckCircle,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function AIEmailAssistantDemo() {
  const analysis = {
    customerName: "Hans Jensen",
    customerEmail: "hans@email.dk",
    customerPhone: "12345678",
    jobType: "Vinduespudsning",
    location: "København",
    urgency: "high" as const,
    estimatedPrice: 1500,
    estimatedHours: "2-3 timer",
    source: "rengoring_nu",
  };

  const suggestions = [
    {
      id: "1",
      title: "Tilbud med pris",
      category: "quote",
      confidence: 95,
      reasoning: "Kunde efterspørger direkte pris for vinduespudsning",
      metadata: { estimatedPrice: 1500, estimatedHours: "2-3 timer" },
    },
    {
      id: "2",
      title: "Book møde",
      category: "booking",
      confidence: 85,
      reasoning: "Kunde ønsker besøg for at vurdere omfang",
    },
    {
      id: "3",
      title: "Spørg om detaljer",
      category: "question",
      confidence: 75,
      reasoning: "Behov for flere oplysninger om vinduesmængde",
    },
  ];

  const getSourceBadgeColor = (source: string) => {
    const colors: Record<string, string> = {
      rengoring_nu: "bg-green-500",
      rengoring_aarhus: "bg-blue-500",
      adhelp: "bg-purple-500",
      website: "bg-emerald-500",
    };
    return colors[source] || "bg-gray-500";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "quote":
        return <DollarSign className="w-4 h-4" />;
      case "question":
        return <Lightbulb className="w-4 h-4" />;
      case "booking":
        return <Clock className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Email Assistant</h3>
          <Badge variant="outline" className="text-xs">
            {suggestions.length} forslag
          </Badge>
        </div>
      </div>

      {/* Email Analysis Summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Customer Info */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{analysis.customerName}</span>
            <span className="text-muted-foreground text-xs">
              ({analysis.customerEmail})
            </span>
            {analysis.customerPhone && (
              <span className="text-muted-foreground text-xs">
                • {analysis.customerPhone}
              </span>
            )}
          </div>

          {/* Job and Location */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span>{analysis.jobType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{analysis.location}</span>
            </div>
            <Badge
              variant={
                analysis.urgency === "high" ? "destructive" : "secondary"
              }
              className="text-xs"
            >
              {analysis.urgency === "high" ? "Haster" : "Normal"}
            </Badge>
          </div>

          {/* Estimates and Source */}
          <div className="flex items-center gap-4 text-sm">
            <Badge
              className={`${getSourceBadgeColor(analysis.source)} text-white`}
            >
              {analysis.source}
            </Badge>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{analysis.estimatedPrice} kr.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{analysis.estimatedHours}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-600" />
          AI Forslag
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {suggestions.map((suggestion, idx) => (
            <div
              key={suggestion.id}
              className={`shrink-0 p-4 border rounded-lg min-w-[220px] transition-all ${
                idx === 0
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(suggestion.category)}
                  <span className="font-medium text-sm">
                    {suggestion.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {suggestion.confidence}%
                  </Badge>
                  {idx === 0 && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3">
                {suggestion.reasoning}
              </p>

              {suggestion.metadata?.estimatedPrice && (
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>{suggestion.metadata.estimatedPrice} kr.</span>
                  </div>
                  {suggestion.metadata?.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{suggestion.metadata.estimatedHours}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email Draft Editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Kladde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value="Kære Hans Jensen,\n\nTak for din henvendelse omkring vinduespudsning.\n\nBaseret på din beskrivelse kan jeg tilbyde:\n\nPris: 1.500 kr.\nEstimeret tid: 2-3 timer\n\nHvornår passer det dig?\n\nMed venlig hilsen"
            rows={8}
            className="text-sm font-mono"
            readOnly
          />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Insert Draft
            </Button>
            <Button className="flex-1" size="sm">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Du kan redigere teksten før afsendelse. AI forslaget er automatisk
            genereret.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
