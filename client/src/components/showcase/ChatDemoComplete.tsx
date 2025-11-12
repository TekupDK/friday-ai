import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarEventCard } from "@/components/chat/CalendarEventCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bot,
  User,
  Sparkles,
  Send,
  Mail,
  Calendar as CalendarIcon,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

/**
 * COMPLETE CHAT DEMO - Realistic Friday AI Chat
 * Full-width chat with inline cards, dialogs, and modals
 */

interface ChatMessage {
  id: string;
  type: "ai" | "user" | "card";
  content?: string;
  timestamp: string;
  cardType?: "calendar" | "invoice" | "email" | "lead";
  cardData?: any;
}

const calendarEventData = {
  title: "Flytterengøring TEST - Matilde Skinneholm",
  startTime: new Date("2026-02-12T09:00:00"),
  endTime: new Date("2026-02-12T11:30:00"),
  location: "Lilleåbakken 20, 8382 Hinnerup",
  customerEmail: "matildeskinneholm@gmail.com",
  customerPhone: "50 65 75 40",
  serviceType: "FLYTTERENGØRING",
  propertySize: 15,
  focusAreas: [
    "Ovn og emhætte (grundig affedtning)",
    "Over og i alle skabe/skuffer",
    "Fronter og flader",
  ],
  team: "2 personer (Jonas + Rawan/FB)",
  estimatedTime: "2-2,5 timer (5 arbejdstimer)",
  estimatedPrice: "1.396-1.745 kr inkl. moms (349 kr/t)",
  leadSource: "Rengøring.nu (6. nov 2025)",
  status: "TEST - Afventer kundens tilbagemelding",
  isBooked: false,
};

export function ChatDemoComplete() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [eventCreated, setEventCreated] = useState(false);

  useEffect(() => {
    playDemo();
  }, []);

  const playDemo = async () => {
    setMessages([]);
    setEventCreated(false);

    const delay = (ms: number) =>
      new Promise(resolve => setTimeout(resolve, ms));

    // User request
    await delay(500);
    setMessages([
      {
        id: "1",
        type: "user",
        content: "Lav et kalender eksempel test",
        timestamp: "09:00",
      },
    ]);

    // AI thinking
    await delay(1500);
    setMessages(prev => [
      ...prev,
      {
        id: "2",
        type: "ai",
        content:
          "Perfekt! Jeg kan se det er et lead fra Rengøring.nu hvor Matilde afventer andre tilbud. Lad mig lave et TEST kalender event som eksempel på hvordan bookingen ville se ud hvis hun bekræfter:",
        timestamp: "09:01",
      },
    ]);

    // Show calendar card
    await delay(1000);
    setMessages(prev => [
      ...prev,
      {
        id: "3",
        type: "card",
        cardType: "calendar",
        cardData: calendarEventData,
        timestamp: "09:01",
      },
    ]);
  };

  const handleCreateEvent = () => {
    setShowConfirmDialog(true);
  };

  const confirmCreate = async () => {
    setShowConfirmDialog(false);

    // Update card to show created state
    setMessages(prev =>
      prev.map(msg =>
        msg.cardType === "calendar"
          ? { ...msg, cardData: { ...msg.cardData, isBooked: true } }
          : msg
      )
    );

    setEventCreated(true);

    // Show success message
    await new Promise(resolve => setTimeout(resolve, 500));
    setMessages(prev => [
      ...prev,
      {
        id: "success",
        type: "ai",
        content:
          "✓ Event oprettet! Kalenderen er nu opdateret med Matilde's flytterengøring. Jeg har også sendt en bekræftelse til hendes email.",
        timestamp: "09:02",
      },
    ]);

    setShowSuccessDialog(true);
  };

  const handleSkip = () => {
    setMessages(prev => [
      ...prev,
      {
        id: "skip",
        type: "ai",
        content:
          "Ok, jeg springer over at oprette eventet. Lad mig vide hvis du vil oprette det senere!",
        timestamp: "09:02",
      },
    ]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Friday AI Chat - Komplet Demo</CardTitle>
            <CardDescription>
              Realistisk chat flow med inline cards, dialogs og modals
            </CardDescription>
          </div>
          <Button onClick={playDemo} variant="outline" size="sm">
            🔄 Replay Demo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border-2 overflow-hidden bg-slate-950">
          {/* Chat Header */}
          <div className="h-14 border-b border-slate-800 bg-gradient-to-r from-blue-600 to-purple-600 px-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Friday AI</h3>
              <p className="text-xs text-blue-100">Assistant</p>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="h-[700px] p-4 bg-slate-900">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className="animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {msg.type === "user" && (
                    <div className="flex gap-3 justify-end">
                      <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  {msg.type === "ai" && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-slate-800 border border-slate-700 shadow-lg">
                        <p className="text-sm text-gray-200">{msg.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  )}

                  {msg.type === "card" && msg.cardType === "calendar" && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 shrink-0" />{" "}
                      {/* Spacer for alignment */}
                      <div className="animate-in zoom-in-95 fade-in duration-500">
                        <CalendarEventCard
                          data={msg.cardData}
                          onCreateEvent={handleCreateEvent}
                          onSkip={handleSkip}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {messages.length > 0 &&
                messages[messages.length - 1].type !== "card" && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-slate-800 border border-slate-700">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">
                          Friday is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="border-t border-slate-800 p-4 bg-slate-900">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Skriv en besked..."
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Confirm Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                Opret Calendar Event?
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Er du sikker på at du vil oprette dette event i Google Calendar?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Event:</span>
                <span className="font-semibold">Flytterengøring TEST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Dato:</span>
                <span className="font-semibold">12. feb 2026, 09:00-11:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kunde:</span>
                <span className="font-semibold">Matilde Skinneholm</span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="border-slate-700 hover:bg-slate-800"
              >
                Annuller
              </Button>
              <Button
                onClick={confirmCreate}
                className="bg-red-600 hover:bg-red-700"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Opret Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                Event Oprettet!
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-400 mb-2">
                  ✓ Calendar event oprettet succesfuldt
                </p>
                <p className="text-xs text-gray-400">
                  Event er nu synligt i Google Calendar og bekræftelse er sendt
                  til Matilde
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Google Calendar synkroniseret
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-4 h-4 text-blue-400" />
                  Bekræftelse sendt til kunde
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Booking detaljer gemt
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowSuccessDialog(false)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Luk
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-blue-950/30 border border-blue-800">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Demo Features:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Fuld-bredde chat (realistisk)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Calendar card inline i chat</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Confirm dialog med detaljer</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Success modal med feedback</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Friday AI dark theme</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Smooth animations</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
