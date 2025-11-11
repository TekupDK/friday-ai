import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEventCard, CalendarEventData } from "@/components/chat/CalendarEventCard";
import { Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interactive Calendar Event Card Demo
 * Shows full chat flow with animations through different stages
 */

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  showCard?: boolean;
  cardStage?: 'pending' | 'created';
}

const sampleEvent: CalendarEventData = {
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
    "Fronter og flader"
  ],
  team: "2 personer (Jonas + Rawan/FB)",
  estimatedTime: "2-2,5 timer (5 arbejdstimer)",
  estimatedPrice: "1.396-1.745 kr inkl. moms (349 kr/t)",
  leadSource: "Rengøring.nu (6. nov 2025)",
  status: "TEST - Afventer kundens tilbagemelding",
  isBooked: false
};

export function CalendarEventCardDemo() {
  const [stage, setStage] = useState<'initial' | 'analyzing' | 'suggesting' | 'confirmed' | 'created'>('initial');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isEventBooked, setIsEventBooked] = useState(false);

  // Auto-play demo on mount
  useEffect(() => {
    playDemo();
  }, []);

  const playDemo = async () => {
    // Reset
    setMessages([]);
    setStage('initial');
    setIsEventBooked(false);

    // Stage 1: User request
    await delay(500);
    setStage('analyzing');
    setMessages([{
      id: '1',
      type: 'user',
      content: 'Lav et kalender eksempel test'
    }]);

    // Stage 2: AI analyzing
    await delay(1000);
    setMessages(prev => [...prev, {
      id: '2',
      type: 'ai',
      content: 'Made a plan'
    }]);

    await delay(800);
    setMessages(prev => [...prev, {
      id: '3',
      type: 'ai',
      content: 'Jeg læser først tråden for at forstå konteksten, og derefter laver jeg et test kalender event.'
    }]);

    await delay(800);
    setMessages(prev => [...prev, {
      id: '4',
      type: 'ai',
      content: 'Made a plan'
    }]);

    await delay(800);
    setMessages(prev => [...prev, {
      id: '5',
      type: 'ai',
      content: 'Perfekt! Jeg kan se det er et lead fra Rengøring.nu hvor Matilde afventer andre tilbud. Lad mig lave et TEST kalender event som eksempel på hvordan bookingen ville se ud hvis hun bekræfter:'
    }]);

    // Stage 3: Show calendar card
    await delay(1000);
    setStage('suggesting');
    setMessages(prev => [...prev, {
      id: '6',
      type: 'ai',
      content: 'Først tjekker jeg kalenderen omkring den aftalte dato:',
      showCard: true,
      cardStage: 'pending'
    }]);

    await delay(800);
    setMessages(prev => [...prev, {
      id: '7',
      type: 'ai',
      content: 'Found 0 events (12. feb. 2026)'
    }]);

    await delay(800);
    setMessages(prev => [...prev, {
      id: '8',
      type: 'ai',
      content: 'Made a plan'
    }]);

    await delay(800);
    setMessages(prev => [...prev, {
      id: '9',
      type: 'ai',
      content: 'Perfekt - d. 12. februar er helt ledig! Nu opretter jeg et TEST kalender event som eksempel:'
    }]);
  };

  const handleCreateEvent = async () => {
    setStage('confirmed');
    
    // Add confirmation message
    setMessages(prev => [...prev, {
      id: 'confirm',
      type: 'ai',
      content: 'Opretter event...'
    }]);

    await delay(1500);
    
    setIsEventBooked(true);
    setStage('created');
    
    setMessages(prev => [...prev, {
      id: 'success',
      type: 'ai',
      content: '✓ Event oprettet! Kalenderen er nu opdateret med Matilde\'s flytterengøring.'
    }]);
  };

  const handleSkip = () => {
    setMessages(prev => [...prev, {
      id: 'skip',
      type: 'ai',
      content: 'Ok, springer over. Lad mig vide hvis du vil oprette eventet senere.'
    }]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendar Event Card - Interactive Demo</CardTitle>
            <CardDescription>
              Se hele chat-flowet med animationer gennem forskellige stadier
            </CardDescription>
          </div>
          <Button onClick={playDemo} variant="outline" size="sm">
            🔄 Replay Demo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {/* Stage Indicator */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-4">
              {[
                { stage: 'initial', label: 'Start', icon: '🎬' },
                { stage: 'analyzing', label: 'Analyzing', icon: '🔍' },
                { stage: 'suggesting', label: 'Suggesting', icon: '📅' },
                { stage: 'confirmed', label: 'Confirming', icon: '⏳' },
                { stage: 'created', label: 'Created', icon: '✅' }
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
                    stage === s.stage 
                      ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}>
                    {s.icon}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    stage === s.stage ? "text-primary" : "text-muted-foreground"
                  )}>
                    {s.label}
                  </span>
                  {i < 4 && <div className="w-6 h-0.5 bg-muted-foreground/20" />}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Demo - 25% width panel */}
          <div className="flex rounded-xl border-2 bg-background overflow-hidden shadow-lg">
            {/* Chat Panel - 25% */}
            <div className="w-1/4 border-r bg-muted/30 flex flex-col">
              <div className="h-14 border-b bg-gradient-to-r from-blue-600 to-purple-600 px-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-xs truncate">Friday AI</h3>
                  <p className="text-[10px] text-blue-100">Assistant</p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-2 min-h-[550px]">
                <div className="space-y-2">
                {messages.map((msg, idx) => (
                  <div key={msg.id}>
                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "flex gap-2 animate-in slide-in-from-bottom-2",
                        msg.type === 'user' && "flex-row-reverse"
                      )}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {msg.type === 'ai' ? (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-gray-600 flex items-center justify-center shrink-0 shadow-md">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "rounded-xl p-3 text-xs max-w-[80%] shadow-md",
                        msg.type === 'ai' 
                          ? "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700" 
                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator during stages */}
                {(stage === 'analyzing' || stage === 'confirmed') && messages.length > 0 && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 max-w-[80%] border border-gray-200 dark:border-slate-700 shadow-md">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {stage === 'confirmed' ? 'Creating event...' : 'Friday is thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </ScrollArea>
            </div>

            {/* Content Area - 75% */}
            <div className="flex-1 p-6 bg-background flex items-center justify-center">
              {stage === 'initial' || stage === 'analyzing' ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-muted-foreground">Calendar Event Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Vent på at Friday AI genererer calendar event...
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-lg animate-in zoom-in-95 fade-in duration-500">
                  <h3 className="text-lg font-semibold mb-4">Preview af Calendar Event</h3>
                  <CalendarEventCard
                    data={{
                      ...sampleEvent,
                      isBooked: isEventBooked
                    }}
                    onCreateEvent={handleCreateEvent}
                    onSkip={handleSkip}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Demo Flow Stages:
            </h4>
            <ol className="text-xs space-y-1 text-muted-foreground ml-6 list-decimal">
              <li><strong>Initial:</strong> User asks to create calendar example</li>
              <li><strong>Analyzing:</strong> AI reads email thread and plans response</li>
              <li><strong>Suggesting:</strong> AI checks calendar availability and shows event card</li>
              <li><strong>Confirmed:</strong> User clicks "Create event" button</li>
              <li><strong>Created:</strong> Event successfully created with success state</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
