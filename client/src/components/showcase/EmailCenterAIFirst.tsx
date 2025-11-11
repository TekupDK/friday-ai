import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Sparkles, Brain, Zap, TrendingUp, CheckCircle2, 
  AlertCircle, Clock, Mail, ChevronRight, Star, Lightbulb
} from "lucide-react";

/**
 * DESIGN 7: AI-First Smart Inbox (Friday AI Optimized)
 * - AI-generated summaries prominent
 * - Smart auto-labeling suggestions
 * - Suggested actions per email
 * - Confidence scores visible
 * - Learning from user actions
 * - Priority scoring
 */

interface AIEmail {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  aiSummary: string;
  aiScore: number; // 0-100
  suggestedLabels: Array<{ label: string; confidence: number }>;
  suggestedActions: Array<{ action: string; reason: string }>;
  keyPoints: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  source: 'rengoring_nu' | 'adhelp' | 'direct' | 'website';
}

const aiEmails: AIEmail[] = [
  {
    id: '1',
    from: 'Matilde Skinneholm',
    subject: 'Tilbud på rengøring',
    preview: 'Hej – vi vil gerne have et tilbud...',
    time: '22:08',
    aiSummary: 'Ny kunde anmoder om tilbud på kontorrengøring, 250m², ugentlig service. Høj konverteringssandsynlighed.',
    aiScore: 95,
    suggestedLabels: [
      { label: 'Leads', confidence: 0.98 },
      { label: 'Fast Rengøring', confidence: 0.87 }
    ],
    suggestedActions: [
      { action: 'Send tilbud (Template: Kontorrengøring)', reason: 'Standard lead inquiry' },
      { action: 'Opret lead i CRM', reason: 'Ny potentiel kunde' }
    ],
    keyPoints: [
      '250 m² kontor i København',
      'Ønsker ugentlig rengøring',
      'Anmoder om tilbud'
    ],
    urgency: 'high',
    actionRequired: true,
    source: 'rengoring_nu'
  },
  {
    id: '2',
    from: 'Lars Nielsen (Existing)',
    subject: 'Betaling faktura #1234',
    preview: 'Bekræftelse på betaling...',
    time: '17:20',
    aiSummary: 'Eksisterende kunde bekræfter betaling af faktura. Ingen action påkrævet.',
    aiScore: 65,
    suggestedLabels: [
      { label: 'Finance', confidence: 0.95 },
      { label: 'Afsluttet', confidence: 0.82 }
    ],
    suggestedActions: [
      { action: 'Marker faktura som betalt', reason: 'Betalingsbekræftelse modtaget' },
      { action: 'Send kvittering', reason: 'Standard procedure' }
    ],
    keyPoints: [
      'Faktura #1234 betalt',
      'Bank reference: 123456',
      'Eksisterende kunde'
    ],
    urgency: 'low',
    actionRequired: false,
    source: 'direct'
  },
  {
    id: '3',
    from: 'info@adhelp.dk',
    subject: 'Ny lead: Flytterengøring',
    preview: 'Vi har en ny lead til jer...',
    time: '15:45',
    aiSummary: 'AdHelp lead for flytterengøring. VIGTIGT: Send tilbud direkte til kundens email (sp@adhelp.dk), IKKE reply til denne email.',
    aiScore: 88,
    suggestedLabels: [
      { label: 'Leads', confidence: 0.96 },
      { label: 'Flytterengøring', confidence: 0.91 }
    ],
    suggestedActions: [
      { action: 'Opret ny email til kundens adresse', reason: 'AdHelp workflow rule' },
      { action: 'Brug template: Flytterengøring tilbud', reason: 'Standard AdHelp lead' }
    ],
    keyPoints: [
      '⚠️ AdHelp lead - IKKE reply direkte',
      'Kunde email: kunde@example.dk',
      'Flytterengøring 3-værelses'
    ],
    urgency: 'high',
    actionRequired: true,
    source: 'adhelp'
  }
];

export function EmailCenterAIFirst() {
  const [selectedEmail, setSelectedEmail] = useState<AIEmail | null>(aiEmails[0]);
  const [showAIPanel, setShowAIPanel] = useState(true);

  const getUrgencyColor = (urgency: string) => {
    if (urgency === 'critical') return 'text-red-600 bg-red-100';
    if (urgency === 'high') return 'text-orange-600 bg-orange-100';
    if (urgency === 'medium') return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getSourceIcon = (source: string) => {
    if (source === 'rengoring_nu') return '🧹';
    if (source === 'adhelp') return '📢';
    if (source === 'website') return '🌐';
    return '📧';
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex h-[700px]">
          {/* Left - Email List with AI Insights */}
          <div className="w-[45%] border-r flex flex-col">
            {/* Header */}
            <div className="border-b p-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="font-bold text-lg">AI Smart Inbox</h3>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Brain className="h-3 w-3" />
                  AI Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Emails sorteret efter AI priority score • Auto-labels • Suggested actions
              </p>
            </div>

            {/* Smart Filters */}
            <div className="border-b p-3 bg-muted/30">
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="default" className="gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Action Required (2)
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Star className="h-3.5 w-3.5" />
                  High Priority (3)
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  No Action (1)
                </Button>
              </div>
            </div>

            {/* Email List */}
            <ScrollArea className="flex-1">
              {aiEmails.map((email, idx) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={cn(
                    "p-4 border-b cursor-pointer transition-all",
                    selectedEmail?.id === email.id && "bg-accent/50 border-l-4 border-l-primary",
                    "hover:bg-accent/30"
                  )}
                  style={{ animation: `slideIn 0.3s ease-out ${idx * 0.05}s both` }}
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl shrink-0">{getSourceIcon(email.source)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{email.from}</div>
                        <div className="text-xs text-muted-foreground truncate">{email.subject}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">{email.time}</span>
                      <Badge className={cn("text-xs px-1.5 py-0", getUrgencyColor(email.urgency))}>
                        {email.urgency}
                      </Badge>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div className="mb-2 p-2 rounded-md bg-purple-50/50 border border-purple-200/50">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-purple-900 line-clamp-2">
                        {email.aiSummary}
                      </p>
                    </div>
                  </div>

                  {/* AI Score & Labels */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {email.suggestedLabels.slice(0, 2).map((label, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {label.label} ({Math.round(label.confidence * 100)}%)
                        </Badge>
                      ))}
                    </div>
                    {email.actionRequired && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Action
                      </Badge>
                    )}
                  </div>

                  {/* AI Score Bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">AI Score:</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all rounded-full",
                          email.aiScore >= 90 ? "bg-green-500" :
                          email.aiScore >= 75 ? "bg-blue-500" :
                          email.aiScore >= 60 ? "bg-yellow-500" : "bg-gray-400"
                        )}
                        style={{ width: `${email.aiScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold">{email.aiScore}</span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Right - AI Analysis & Actions */}
          <div className="flex-1 flex flex-col">
            {selectedEmail ? (
              <>
                {/* Email Header */}
                <div className="border-b p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{selectedEmail.subject}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{selectedEmail.from}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{selectedEmail.time}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-xl">{getSourceIcon(selectedEmail.source)}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAIPanel(!showAIPanel)}
                      className="gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      {showAIPanel ? 'Hide' : 'Show'} AI Panel
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {/* AI Analysis Panel */}
                  {showAIPanel && (
                    <div className="mb-6 space-y-4">
                      {/* AI Summary */}
                      <Card className="border-purple-200 bg-purple-50/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shrink-0">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                AI Summary
                                <Badge variant="outline" className="text-xs">
                                  Score: {selectedEmail.aiScore}
                                </Badge>
                              </h4>
                              <p className="text-sm text-muted-foreground">{selectedEmail.aiSummary}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Key Points */}
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            Key Points
                          </h4>
                          <ul className="space-y-2">
                            {selectedEmail.keyPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Suggested Actions */}
                      <Card className="border-blue-200 bg-blue-50/30">
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-600" />
                            Suggested Actions
                          </h4>
                          <div className="space-y-2">
                            {selectedEmail.suggestedActions.map((action, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start h-auto py-3"
                              >
                                <div className="text-left">
                                  <div className="font-medium text-sm mb-1">{action.action}</div>
                                  <div className="text-xs text-muted-foreground">{action.reason}</div>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Suggested Labels */}
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            Suggested Labels
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedEmail.suggestedLabels.map((label, idx) => (
                              <Button key={idx} variant="outline" size="sm" className="gap-2">
                                <span>{label.label}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(label.confidence * 100)}%
                                </Badge>
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Email Body */}
                  <div className="prose prose-sm max-w-none">
                    <p>Hej,</p>
                    <p>{selectedEmail.preview}</p>
                    <p>Venlig hilsen,<br />{selectedEmail.from}</p>
                  </div>
                </ScrollArea>

                {/* Action Bar */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Button className="gap-2">
                      <Mail className="h-4 w-4" />
                      Reply with AI
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Use Template
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Apply Labels
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select an email to see AI analysis
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
