/**
 * CHAT PANEL UI - UPGRADED SHOWCASE
 * Viser alle nye opgraderede chat komponenter
 */

import {
  UserPlus,
  CheckCircle2,
  Calendar,
  FileText,
  Mail,
  Phone,
  MapPin,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

import { ActionCard } from "@/components/chat/upgraded/ActionCard";
import { ChatMessage } from "@/components/chat/upgraded/ChatMessage";
import { EmailThreadCardUpgraded } from "@/components/chat/upgraded/EmailThreadCard";
import { FileUpload } from "@/components/chat/upgraded/FileUpload";
import { InvoiceCardUpgraded } from "@/components/chat/upgraded/InvoiceCard";
import { SearchResultsCardUpgraded } from "@/components/chat/upgraded/SearchResultsCard";
import {
  ToastProvider,
  useToast,
} from "@/components/chat/upgraded/ToastNotification";
import {
  QuickActions,
  presetActions,
} from "@/components/chat/upgraded/QuickActions";
import { ThinkingIndicator } from "@/components/chat/upgraded/ThinkingIndicator";
import { VoiceInput } from "@/components/chat/upgraded/VoiceInput";
import { WeatherCardUpgraded } from "@/components/chat/upgraded/WeatherCard";
import { WelcomeScreenUpgraded } from "@/components/chat/upgraded/WelcomeScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";


export function ChatPanelUIUpgradedShowcase() {
  const [copiedAction, setCopiedAction] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ✨ Chat Panel UI - Opgraderet
        </h2>
        <p className="text-muted-foreground">
          Moderne komponenter med glassmorphism, gradients og animations
        </p>
      </div>

      {/* 1. Welcome Screen */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Welcome Screen - Oppgraderet</CardTitle>
          <CardDescription>
            Moderne velkommen skærm med kategoriserede suggestions, gradient
            cards, og stats
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 min-h-[600px]">
            <WelcomeScreenUpgraded
              userName="Anders"
              onSuggestionClick={s => console.log("Clicked:", s)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Chat Messages */}
      <Card>
        <CardHeader>
          <CardTitle>💬 Chat Messages - Opgraderet</CardTitle>
          <CardDescription>
            Moderne chat bubbles med avatars, reactions, copy button, og status
            indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <ChatMessage
              type="user"
              content="Hvad er status på mine opgaver i dag?"
              timestamp={new Date()}
              showAvatar
            />

            <ChatMessage
              type="ai"
              content="Lad mig tjekke dine opgaver... Du har 3 opgaver i dag: Lead opfølgning for Matilde, Tilbud til Frederiksberg projekt, og faktura til Jonas."
              timestamp={new Date()}
              showAvatar
              showReactions
              model="Gemma 3 27B"
            />

            <ChatMessage
              type="user"
              content="Send tilbud til Matilde"
              timestamp={new Date()}
              status="sending"
              showAvatar
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Thinking Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Thinking Indicators - 5 Varianter</CardTitle>
          <CardDescription>
            Forskellige loading indicators: dots, wave, pulse, progress, sparkle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div>
              <Badge className="mb-2">Dots (Classic)</Badge>
              <ThinkingIndicator variant="dots" message="Friday tænker..." />
            </div>

            <Separator />

            <div>
              <Badge className="mb-2">Wave</Badge>
              <ThinkingIndicator
                variant="wave"
                message="Analyserer emails..."
              />
            </div>

            <Separator />

            <div>
              <Badge className="mb-2">Pulse</Badge>
              <ThinkingIndicator variant="pulse" message="Opretter tilbud..." />
            </div>

            <Separator />

            <div>
              <Badge className="mb-2">Progress</Badge>
              <ThinkingIndicator variant="progress" message="Booker møde..." />
            </div>

            <Separator />

            <div>
              <Badge className="mb-2">Sparkle</Badge>
              <ThinkingIndicator
                variant="sparkle"
                message="AI magic happening..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Action Cards */}
      <Card>
        <CardHeader>
          <CardTitle>🎴 Action Cards - Universal Design</CardTitle>
          <CardDescription>
            Glassmorphism cards for leads, tasks, meetings, invoices med
            metadata og actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Lead Card */}
            <ActionCard
              title="Matilde Skinneholm"
              description="Flytterengøring - Hinnerup"
              icon={UserPlus}
              iconColor="from-green-500 to-emerald-600"
              badge="Lead #1247"
              status="success"
              metadata={[
                { label: "Email", value: "matilde@gmail.com", icon: Mail },
                { label: "Phone", value: "50 65 75 40", icon: Phone },
                { label: "Location", value: "Hinnerup", icon: MapPin },
                { label: "Value", value: "1.500 kr", icon: DollarSign },
              ]}
              actions={[
                {
                  label: "Send tilbud",
                  onClick: () => alert("Sending tilbud..."),
                  variant: "default",
                },
                {
                  label: "Book møde",
                  onClick: () => alert("Booking..."),
                  variant: "outline",
                },
              ]}
              copyableId="#1247"
              timestamp={new Date()}
            />

            {/* Task Card */}
            <ActionCard
              title="Følg op med Jonas"
              description="Tjek status på faktura #4521"
              icon={CheckCircle2}
              iconColor="from-blue-500 to-cyan-600"
              badge="Høj prioritet"
              status="pending"
              metadata={[
                { label: "Due", value: "I dag kl. 15:00", icon: Calendar },
                { label: "Status", value: "Afventer", icon: CheckCircle2 },
              ]}
              actions={[
                { label: "Marker færdig", onClick: () => alert("Done!") },
              ]}
              timestamp={new Date()}
            />

            {/* Meeting Card */}
            <ActionCard
              title="Møde med Frederiksberg Team"
              description="Gennemgang af nyt projekt"
              icon={Calendar}
              iconColor="from-purple-500 to-pink-600"
              badge="14. Feb 2026"
              status="success"
              metadata={[
                { label: "Tid", value: "10:00 - 11:30", icon: Calendar },
                { label: "Sted", value: "Kontoret", icon: MapPin },
              ]}
              actions={[
                { label: "Åbn kalender", onClick: () => alert("Opening...") },
              ]}
              timestamp={new Date()}
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions - Inline Buttons</CardTitle>
          <CardDescription>
            Hurtige handlinger med gradient styling og icons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div>
              <Badge className="mb-3">Horizontal Layout</Badge>
              <QuickActions
                actions={[
                  presetActions.calendar(() => alert("Booking...")),
                  presetActions.invoice(() => alert("Creating invoice...")),
                  presetActions.email(() => alert("Sending email...")),
                  presetActions.call(() => alert("Calling...")),
                ]}
                layout="horizontal"
              />
            </div>

            <Separator />

            <div>
              <Badge className="mb-3">Grid Layout</Badge>
              <QuickActions
                actions={[
                  presetActions.copy(() => {
                    setCopiedAction(true);
                    setTimeout(() => setCopiedAction(false), 2000);
                  }, copiedAction),
                  presetActions.download(() => alert("Downloading...")),
                  presetActions.share(() => alert("Sharing...")),
                  presetActions.open(() => alert("Opening...")),
                ]}
                layout="grid"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Opgraderede Cards */}
      <Card>
        <CardHeader>
          <CardTitle>📧 Email Thread Card - Opgraderet</CardTitle>
          <CardDescription>
            Gmail integration med AI insights, star, archive, og expandable view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailThreadCardUpgraded
            data={{
              id: "1",
              subject: "Flytterengøring tilbud - Matilde Skinneholm",
              from: { name: "Matilde Skinneholm", email: "matilde@gmail.com" },
              messageCount: 3,
              summary:
                "Matilde spørger om tilbud på flytterengøring af 15m² i Hinnerup. Hun sammenligner med andre tilbud.",
              aiInsights:
                "💡 Lead med høj prioritet - hun har modtaget andre tilbud. Send konkurrencedygtigt tilbud hurtigt!",
              labels: [
                { name: "Lead", color: "#10b981" },
                { name: "Flytterengøring", color: "#3b82f6" },
              ],
              priority: "high",
              hasAttachments: false,
              timestamp: new Date(),
              isUnread: true,
              isStarred: false,
            }}
            onOpen={() => console.log("Open")}
            onReply={() => console.log("Reply")}
            onArchive={() => console.log("Archive")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🌤️ Weather Card - Opgraderet</CardTitle>
          <CardDescription>
            Vejr data med forecast, stats, sunrise/sunset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeatherCardUpgraded
            data={{
              location: "Aarhus, Danmark",
              temperature: 12,
              feelsLike: 9,
              condition: "rainy",
              description: "Let regn",
              humidity: 78,
              windSpeed: 15,
              visibility: 8,
              pressure: 1013,
              sunrise: "07:42",
              sunset: "16:18",
              forecast: [
                { day: "I morgen", temp: 14, condition: "Overskyet" },
                { day: "Torsdag", temp: 11, condition: "Regn" },
                { day: "Fredag", temp: 13, condition: "Delvist overskyet" },
              ],
            }}
            onRefresh={() => console.log("Refresh")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧾 Invoice Card - Opgraderet</CardTitle>
          <CardDescription>
            Billy faktura med status, betalingsprogress, og actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <InvoiceCardUpgraded
              data={{
                id: "1",
                invoiceNumber: "2024-1247",
                customerName: "Matilde Skinneholm",
                amount: 1500,
                currency: "DKK",
                status: "sent",
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                createdDate: new Date(),
                items: [
                  {
                    description: "Flytterengøring 15m²",
                    quantity: 1,
                    price: 1200,
                  },
                  { description: "Ovnrens", quantity: 1, price: 300 },
                ],
                paymentProgress: 0,
              }}
              onView={() => console.log("View")}
              onSend={() => console.log("Send")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔍 Search Results Card - Opgraderet</CardTitle>
          <CardDescription>
            Google search results med relevance score og actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchResultsCardUpgraded
            query="flytterengøring priser"
            results={[
              {
                id: "1",
                title: "Priser på flytterengøring 2024 - Komplet guide",
                url: "https://example.com/flytterengoering-priser",
                domain: "example.com",
                snippet:
                  "Se hvad flytterengøring koster i 2024. Gennemsnitspriser, tilbud, og sammenligning af firmaer.",
                relevanceScore: 0.92,
              },
              {
                id: "2",
                title: "Flytterengøring - Book online | Rendetalje",
                url: "https://rendetalje.dk/flytterengoering",
                domain: "rendetalje.dk",
                snippet:
                  "Professionel flytterengøring fra 349 kr/time. Book direkte online.",
                relevanceScore: 0.88,
              },
            ]}
            onOpenResult={url => console.log("Open:", url)}
          />
        </CardContent>
      </Card>

      {/* 7. NYE Features */}
      <Card>
        <CardHeader>
          <CardTitle>🔔 Toast Notifications - FULL-FEATURED</CardTitle>
          <CardDescription>
            Toast system med auto-dismiss, actions, og progress bar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToastProvider>
            <ToastDemo />
          </ToastProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📎 File Upload - Drag & Drop</CardTitle>
          <CardDescription>
            File upload med drag & drop, preview, og progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onUpload={async files => {
              console.log("Uploading files:", files);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎤 Voice Input - Med Waveform</CardTitle>
          <CardDescription>
            Voice recording med live waveform visualization og transcription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceInput
            onTranscript={text => console.log("Transcript:", text)}
            onAudioBlob={blob => console.log("Audio:", blob)}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle>📦 Komponent Oversigt - ALLE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>WelcomeScreen (opgraderet)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>ChatMessage (ny)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>ThinkingIndicator (5 varianter)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>ActionCard (universal)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>QuickActions (inline)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>EmailThreadCard (opgraderet)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>WeatherCard (opgraderet)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>InvoiceCard (opgraderet)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">✅</Badge>
              <span>SearchResultsCard (opgraderet)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🆕</Badge>
              <span>Toast Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🆕</Badge>
              <span>File Upload (Drag & Drop)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🆕</Badge>
              <span>Voice Input (Waveform)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToastDemo() {
  const { addToast } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          addToast({
            type: "success",
            title: "Success!",
            description: "Operation completed successfully",
          })
        }
        variant="outline"
      >
        Success Toast
      </Button>
      <Button
        onClick={() =>
          addToast({
            type: "error",
            title: "Error!",
            description: "Something went wrong",
          })
        }
        variant="outline"
      >
        Error Toast
      </Button>
      <Button
        onClick={() =>
          addToast({
            type: "warning",
            title: "Warning!",
            description: "Please check this",
          })
        }
        variant="outline"
      >
        Warning Toast
      </Button>
      <Button
        onClick={() =>
          addToast({
            type: "loading",
            title: "Processing...",
            description: "Please wait",
            duration: 0,
          })
        }
        variant="outline"
      >
        Loading Toast
      </Button>
    </div>
  );
}
