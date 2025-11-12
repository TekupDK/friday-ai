import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Mail,
  Send,
  Sparkles,
  Bot,
  User,
  Calendar,
  DollarSign,
  Phone,
  Clock,
  Building2,
  MapPin,
  FileText,
  Zap,
  Star,
  Search,
  Archive,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
} from "lucide-react";

/**
 * EMAIL CENTER SHOWCASE - UNIFIED VIEW
 * Chat Panel (20-25%) + Email Center (75-80%)
 * Complete with dialogs, modals, animations
 */

type PipelineStage =
  | "needs_action"
  | "venter"
  | "kalender"
  | "finance"
  | "done";

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  stage: PipelineStage;
  aiScore: number;
  estimatedValue?: number;
  serviceType?: string;
  unread: boolean;
}

interface ChatMessage {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: string;
}

const sampleEmails: Email[] = [
  {
    id: "1",
    from: "Matilde Skinneholm",
    subject: "Tilbud på kontorrengøring",
    preview: "Hej, vi vil gerne have et tilbud på ugentlig rengøring...",
    time: "Nu",
    stage: "needs_action",
    aiScore: 95,
    estimatedValue: 40000,
    serviceType: "Fast Rengøring",
    unread: true,
  },
  {
    id: "2",
    from: "Hanne Andersen",
    subject: "Re: Tilbud flytterengøring",
    preview: "Tak for tilbuddet. Vi vil gerne gå videre...",
    time: "2t",
    stage: "venter",
    aiScore: 88,
    estimatedValue: 25000,
    serviceType: "Flytterengøring",
    unread: true,
  },
];

const chatMessages: ChatMessage[] = [
  {
    id: "1",
    type: "ai",
    content: "👋 Hej! Du har 2 nye emails der kræver handling.",
    timestamp: "09:00",
  },
  {
    id: "2",
    type: "user",
    content: "Vis mig de vigtigste",
    timestamp: "09:01",
  },
  {
    id: "3",
    type: "ai",
    content:
      "Matilde fra TechCorp vil have et tilbud på kontorrengøring - 95% win probability, 40.000 kr potentiel værdi",
    timestamp: "09:01",
  },
];

export function EmailCenterShowcase() {
  const [activeStage, setActiveStage] = useState<PipelineStage>("needs_action");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(
    sampleEmails[0]
  );
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const filteredEmails = sampleEmails.filter(e => e.stage === activeStage);

  const stages = [
    { id: "needs_action", label: "Needs Action", count: 1, color: "red" },
    { id: "venter", label: "Venter", count: 1, color: "yellow" },
    { id: "kalender", label: "Kalender", count: 0, color: "blue" },
    { id: "finance", label: "Finance", count: 0, color: "green" },
    { id: "done", label: "Done", count: 0, color: "gray" },
  ] as const;

  return (
    <div className="relative h-[850px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 border-2 shadow-2xl">
      <div className="flex h-full">
        {/* Chat Panel - 20-25% */}
        <div className="w-[23%] border-r bg-white/80 backdrop-blur-xl flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-white">Friday AI</h3>
                <p className="text-xs text-blue-100">Assistant</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2 animate-in slide-in-from-bottom-2",
                    msg.type === "user" && "flex-row-reverse"
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {msg.type === "ai" ? (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gray-600 flex items-center justify-center shrink-0 shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-xl p-3 text-xs max-w-[80%] shadow-md",
                      msg.type === "ai"
                        ? "bg-white border border-gray-200"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-3 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Chat with AI..."
                className="text-sm"
              />
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Email Center - 75-80% */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Top Bar */}
          <div className="h-14 border-b bg-gradient-to-r from-blue-600 to-blue-700 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-white">Rendetalje Email Center</h1>
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="text-sm">
                <span className="text-blue-100">Revenue: </span>
                <span className="font-bold">65.000 kr</span>
              </div>
              <Separator orientation="vertical" className="h-6 bg-white/20" />
              <div className="text-sm">
                <span className="text-blue-100">Bookings: </span>
                <span className="font-bold">3</span>
              </div>
            </div>
          </div>

          {/* Pipeline Tabs */}
          <div className="border-b bg-gray-50 px-6 py-3">
            <div className="flex gap-2">
              {stages.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id as PipelineStage)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeStage === stage.id
                      ? "bg-white shadow-md border-2 border-blue-200 text-blue-700"
                      : "hover:bg-white/50 text-gray-600"
                  )}
                >
                  {stage.label}
                  {stage.count > 0 && (
                    <Badge className="ml-2 px-1.5 py-0 text-xs">
                      {stage.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Email List - 40% */}
            <div className="w-[40%] border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Søg emails..." className="pl-10" />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {filteredEmails.map((email, idx) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={cn(
                      "p-4 border-b cursor-pointer transition-all hover:bg-gray-50",
                      selectedEmail?.id === email.id &&
                        "bg-blue-50 border-l-4 border-l-blue-600"
                    )}
                    style={{
                      animation: `fadeIn 0.3s ease-out ${idx * 0.1}s both`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                          {email.from.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm truncate">
                            {email.from}
                          </span>
                          <span className="text-xs text-gray-500">
                            {email.time}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                          {email.subject}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {email.preview}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {email.serviceType && (
                            <Badge variant="outline" className="text-xs">
                              {email.serviceType}
                            </Badge>
                          )}
                          {email.estimatedValue && (
                            <Badge className="text-xs bg-green-100 text-green-700">
                              {email.estimatedValue.toLocaleString()} kr
                            </Badge>
                          )}
                          {email.aiScore >= 90 && (
                            <Badge className="text-xs bg-purple-100 text-purple-700">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {email.aiScore}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Email Preview - 60% */}
            <div className="flex-1 flex flex-col">
              {selectedEmail ? (
                <>
                  <div className="p-6 border-b">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                          {selectedEmail.from.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-lg font-bold mb-1">
                          {selectedEmail.from}
                        </h2>
                        <h3 className="text-base font-semibold text-gray-800">
                          {selectedEmail.subject}
                        </h3>
                      </div>
                    </div>

                    {/* AI Actions */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-900">
                          AI Suggested Actions
                        </span>
                        <Badge className="bg-purple-600 text-white text-xs">
                          {selectedEmail.aiScore}%
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setShowQuoteDialog(true)}
                          className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          Send Tilbud
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setShowBookingDialog(true)}
                          className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200"
                        >
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          Book Møde
                        </Button>
                        <Button
                          size="sm"
                          className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200"
                        >
                          <Phone className="w-3.5 h-3.5 mr-1.5" />
                          Ring Kunde
                        </Button>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-6">
                    <Card className="mb-6 border-2">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                        <h4 className="font-semibold text-sm">
                          Customer Context
                        </h4>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Service Type
                          </div>
                          <div className="font-semibold">
                            {selectedEmail.serviceType}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Estimated Value
                          </div>
                          <div className="font-semibold text-green-600 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {selectedEmail.estimatedValue?.toLocaleString()} kr
                          </div>
                        </div>
                      </div>
                    </Card>

                    <div className="prose prose-sm">
                      <p>{selectedEmail.preview}</p>
                      <p className="mt-4">
                        Vi er interesseret i at høre mere om jeres tjenester...
                      </p>
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowReplyDialog(true)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="outline">
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </Button>
                      <Button variant="outline">
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <Mail className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedEmail?.from}</DialogTitle>
            <DialogDescription>Send et svar til kunden</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input defaultValue={`Re: ${selectedEmail?.subject}`} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea rows={8} placeholder="Skriv din besked..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quote Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Tilbud til {selectedEmail?.from}</DialogTitle>
            <DialogDescription>
              Generer og send tilbud automatisk
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Service Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Vælg service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kontor">Kontorrengøring</SelectItem>
                    <SelectItem value="flyt">Flytterengøring</SelectItem>
                    <SelectItem value="hoved">Hovedrengøring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pris</Label>
                <Input type="number" placeholder="40000" />
              </div>
            </div>
            <div>
              <Label>Beskrivelse</Label>
              <Textarea rows={4} placeholder="Beskrivelse af tilbuddet..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600">
              <FileText className="w-4 h-4 mr-2" />
              Send Tilbud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Møde med {selectedEmail?.from}</DialogTitle>
            <DialogDescription>
              Opret kalender event og send invitation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dato</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Tidspunkt</Label>
                <Input type="time" />
              </div>
            </div>
            <div>
              <Label>Lokation</Label>
              <Input placeholder="Adresse..." />
            </div>
            <div>
              <Label>Noter</Label>
              <Textarea rows={3} placeholder="Ekstra information..." />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-600">
              <Calendar className="w-4 h-4 mr-2" />
              Book & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
