/**
 * CHAT COMPONENTS SHOWCASE - Alle 78 komponenter vist
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all components
// Basic Chat Cards (12)
import { MessageCard } from "@/components/chat/cards/MessageCard";
import { EmailCard } from "@/components/chat/cards/EmailCard";
import { NotificationCard } from "@/components/chat/cards/NotificationCard";
import { TaskCard } from "@/components/chat/cards/TaskCard";
import { CalendarCard } from "@/components/chat/cards/CalendarCard";
import { DocumentCard } from "@/components/chat/cards/DocumentCard";
import { ContactCard } from "@/components/chat/cards/ContactCard";
import { FileCard } from "@/components/chat/cards/FileCard";
import { InvoiceCard } from "@/components/chat/cards/InvoiceCard";
import { AnalyticsCard } from "@/components/chat/cards/AnalyticsCard";
import { StatusCard } from "@/components/chat/cards/StatusCard";
import { QuickReplyCard } from "@/components/chat/cards/QuickReplyCard";

// Email & Shortwave Cards
import { EmailSearchCard } from "@/components/chat/cards/EmailSearchCard";
import { LabelManagementCard } from "@/components/chat/cards/LabelManagementCard";
import { TodoFromEmailCard } from "@/components/chat/cards/TodoFromEmailCard";
import { UnsubscribeCard } from "@/components/chat/cards/UnsubscribeCard";
import { CalendarEventEditCard } from "@/components/chat/cards/CalendarEventEditCard";
import { FreeBusyCard } from "@/components/chat/cards/FreeBusyCard";
import { ConflictCheckCard } from "@/components/chat/cards/ConflictCheckCard";
import { BillyCustomerCard } from "@/components/chat/cards/BillyCustomerCard";
import { BillyProductCard } from "@/components/chat/cards/BillyProductCard";
import { BillyAnalyticsCard } from "@/components/chat/cards/BillyAnalyticsCard";

// Intelligens & Analyse
import { CrossReferenceCard } from "@/components/chat/cards/CrossReferenceCard";
import { LeadTrackingCard } from "@/components/chat/cards/LeadTrackingCard";
import { CustomerHistoryCard } from "@/components/chat/cards/CustomerHistoryCard";
import { DataVerificationCard } from "@/components/chat/cards/DataVerificationCard";
import { PredictiveInsightsCard } from "@/components/chat/cards/PredictiveInsightsCard";
import { AnomalyDetectionCard } from "@/components/chat/cards/AnomalyDetectionCard";
import { SentimentAnalysisCard } from "@/components/chat/cards/SentimentAnalysisCard";
import { RecommendationEngineCard } from "@/components/chat/cards/RecommendationEngineCard";
import { PatternRecognitionCard } from "@/components/chat/cards/PatternRecognitionCard";
import { RiskAssessmentCard } from "@/components/chat/cards/RiskAssessmentCard";

// Advanced Chat (4)
import { MentionSystem } from "@/components/chat/advanced/MentionSystem";
import { CodeBlockHighlight } from "@/components/chat/advanced/CodeBlockHighlight";
import { RichTextEditor } from "@/components/chat/advanced/RichTextEditor";
import { MessageHistory } from "@/components/chat/advanced/MessageHistory";

// Input (4)
import { SlashCommandsMenu } from "@/components/chat/input/SlashCommandsMenu";
import { MentionAutocomplete } from "@/components/chat/input/MentionAutocomplete";
import { MarkdownPreview } from "@/components/chat/input/MarkdownPreview";
import { AttachmentPreview } from "@/components/chat/input/AttachmentPreview";

// Smart (5)
import { SmartSuggestions } from "@/components/chat/smart/SmartSuggestions";
import { AIAssistant } from "@/components/chat/smart/AIAssistant";
import { ContextAwareness } from "@/components/chat/smart/ContextAwareness";
import { AutoComplete } from "@/components/chat/smart/AutoComplete";
import { ContextualHelpCard } from "@/components/chat/smart/ContextualHelpCard";

// Realtime (4)
import { LiveCollaboration } from "@/components/chat/realtime/LiveCollaboration";
import { RealtimeNotifications } from "@/components/chat/realtime/RealtimeNotifications";
import { LiveTypingIndicators } from "@/components/chat/realtime/LiveTypingIndicators";
import { LiveActivityFeed } from "@/components/chat/realtime/LiveActivityFeed";

// Other (10)
import { QuickActions } from "@/components/chat/other/QuickActions";
import { SearchEverywhere } from "@/components/chat/other/SearchEverywhere";
import { CommandPalette } from "@/components/chat/other/CommandPalette";
import { SettingsPanel } from "@/components/chat/other/SettingsPanel";
import { HelpCenter } from "@/components/chat/other/HelpCenter";
import { UserProfile } from "@/components/chat/other/UserProfile";
import { AboutInfo } from "@/components/chat/other/AboutInfo";
import { KeyboardShortcutsCard } from "@/components/chat/other/KeyboardShortcutsCard";
import { ThemeCustomizerCard } from "@/components/chat/other/ThemeCustomizerCard";
import { ExportImportCard } from "@/components/chat/other/ExportImportCard";

// Dialog host to power all modals
import { DialogHost, ChatDialogType } from "@/pages/ChatDialogsHost";

// Interactive components
import { ApprovalCard } from "@/components/chat/interactive/ApprovalCard";
import { ThinkingIndicator } from "@/components/chat/interactive/ThinkingIndicator";
import { SyncStatusCard } from "@/components/chat/interactive/SyncStatusCard";
import { PhaseTracker } from "@/components/chat/interactive/PhaseTracker";
import { ActionButtonsGroup } from "@/components/chat/interactive/ActionButtonsGroup";

// ChatGPT-style Advanced components
import { StreamingMessage } from "@/components/chat/advanced/StreamingMessage";
import { AdvancedComposer } from "@/components/chat/advanced/AdvancedComposer";
import { MemoryManager } from "@/components/chat/advanced/MemoryManager";
import { SourcesPanel } from "@/components/chat/advanced/SourcesPanel";
import { ToolsPanel } from "@/components/chat/advanced/ToolsPanel";

// New Advanced Layout & Messaging components
import { SplitViewPanel } from "@/components/chat/advanced/layouts/SplitViewPanel";
import { FloatingChatWindow } from "@/components/chat/advanced/layouts/FloatingChatWindow";
import { MessageThread } from "@/components/chat/advanced/messaging/MessageThread";
import { 
  ChatSkeleton, 
  MessageSkeleton, 
  DocumentSkeleton, 
  SearchResultsSkeleton 
} from "@/components/chat/advanced/loaders/ChatSkeleton";
import { DocumentViewer } from "@/components/chat/advanced/documents/DocumentViewer";
import { MessageToolbar } from "@/components/chat/advanced/controls/MessageToolbar";
import { NotificationSystem } from "@/components/chat/advanced/controls/NotificationSystem";
import { PanelSizeVariants } from "@/components/chat/advanced/layouts/PanelSizeVariants";
import { IntegrationPanel } from "@/components/chat/advanced/integrations/IntegrationPanel";

// New Data Visualization components
import { MetricsDashboard } from "@/components/chat/data-visualization/MetricsDashboard";
import { ChartComponent } from "@/components/chat/data-visualization/ChartComponent";
import { DataTable } from "@/components/chat/data-visualization/DataTable";

export default function ChatComponentsShowcase() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dialog, setDialog] = useState<{ type: ChatDialogType; data?: any } | null>(null);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-primary">
            Chat Components Showcase
          </h1>
          <p className="text-xl text-muted-foreground">
            Alle 84 komponenter til Tekup AI v2 Chat System - komplet implementeret
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-green-500 text-lg px-4 py-2">84/84 Komponenter ✅</Badge>
            <Badge className="bg-violet-500 text-lg px-4 py-2">5 ChatGPT-Style 🤖</Badge>
            <Badge className="bg-blue-500 text-lg px-4 py-2">9 Advanced Layouts 🎨</Badge>
            <Badge className="bg-purple-500 text-lg px-4 py-2">3 Data Viz 📊</Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-blue-600">12</div>
            <div className="text-sm text-muted-foreground">Chat Cards</div>
          </Card>
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-violet-600">5</div>
            <div className="text-sm text-muted-foreground">Interactive</div>
          </Card>
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-purple-600">5</div>
            <div className="text-sm text-muted-foreground">ChatGPT</div>
          </Card>
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-cyan-600">9</div>
            <div className="text-sm text-muted-foreground">Advanced</div>
          </Card>
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-green-600">10</div>
            <div className="text-sm text-muted-foreground">Email</div>
          </Card>
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-amber-600">10</div>
            <div className="text-sm text-muted-foreground">Intelligence</div>
          </Card>
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-orange-600">18</div>
            <div className="text-sm text-muted-foreground">Advanced+</div>
          </Card>
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-pink-600">10</div>
            <div className="text-sm text-muted-foreground">Other</div>
          </Card>
          <Card className="p-6 text-center bg-card border border-border">
            <div className="text-4xl font-bold text-purple-600">3</div>
            <div className="text-sm text-muted-foreground">Data Viz</div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-12 gap-2 h-auto p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              📊 Oversigt
            </TabsTrigger>
            <TabsTrigger value="chat-cards" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              💬 Chat Cards
            </TabsTrigger>
            <TabsTrigger value="interactive" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white">
              ⚡ Interactive
            </TabsTrigger>
            <TabsTrigger value="chatgpt" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              🤖 ChatGPT
            </TabsTrigger>
            <TabsTrigger value="advanced-layouts" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              🎨 Advanced
            </TabsTrigger>
            <TabsTrigger value="data-visualization" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              📊 Data Viz
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
              📧 Email
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              🧠 Intelligens
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              ⚡ Advanced
            </TabsTrigger>
            <TabsTrigger value="input" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
              ⌨️ Input
            </TabsTrigger>
            <TabsTrigger value="smart" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
              🤖 Smart
            </TabsTrigger>
            <TabsTrigger value="realtime" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              🔴 Realtime
            </TabsTrigger>
            <TabsTrigger value="other" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">
              🔧 Andet
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-8 bg-card border border-border">
              <h2 className="text-3xl font-bold mb-6">🎉 Komplet Oversigt</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">📦 Kategorier:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">✅</Badge>
                      <span>Chat Cards (12/12)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-violet-500">🆕</Badge>
                      <span>Interactive (5/5) - NYE!</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-purple-500">🤖</Badge>
                      <span>ChatGPT-Style (5/5) - INSPIRERET!</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">✅</Badge>
                      <span>Email Center (10/10)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">✅</Badge>
                      <span>Intelligens & Analyse (10/10)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-cyan-500">🆕</Badge>
                      <span>Advanced Layouts (9/9) - NYE!</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">✅</Badge>
                      <span>Input (4/4)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">✅</Badge>
                      <span>Smart (5/5)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">✅</Badge>
                      <span>Realtime (4/4)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">✅</Badge>
                      <span>Andet (10/10)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge className="bg-green-500">✅</Badge>
                      <span>Data Visualization (3/3)</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">✨ Features:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>✅ TypeScript for type safety</li>
                    <li>✅ React hooks for state management</li>
                    <li>✅ Responsive design med Tailwind CSS</li>
                    <li>✅ Accessibility features</li>
                    <li>✅ Demo data for nem testing</li>
                    <li>✅ Consistent API med props og callbacks</li>
                    <li>🆕 Approval flows med animations</li>
                    <li>🆕 AI thinking indicators</li>
                    <li>🆕 System sync status tracking</li>
                    <li>🆕 Pipeline phase progression</li>
                    <li>🆕 Quick action buttons med badges</li>
                    <li>🤖 ChatGPT streaming messages</li>
                    <li>🤖 Advanced composer med slash commands</li>
                    <li>🤖 Memory & project scopes</li>
                    <li>🤖 Sources/citations panel</li>
                    <li>🤖 Tools execution (Search, Analyze, Code)</li>
                    <li>🆕 Metrics dashboards med KPI kort og trends</li>
                    <li>🆕 Interaktive charts (linje, søjle, cirkel diagrammer)</li>
                    <li>🆕 Avancerede data tabeller med sortering og filtrering</li>
                    <li>🆕 Draggbare, resizable panel layouts</li>
                    <li>🆕 Integration panels med health monitoring</li>
                    <li>🆕 Rich text toolbars og dokument viewers</li>
                    <li>🆕 Floating chat windows med animations</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">🚀 Kom I Gang:</h3>
                <div className="space-y-2 text-sm">
                  <p>1. <strong>Vælg en kategori</strong> fra tabs ovenfor</p>
                  <p>2. <strong>Se komponenter</strong> i aktion med demo data</p>
                  <p>3. <strong>Test funktionalitet</strong> - alle komponenter er interaktive</p>
                  <p>4. <strong>Integrer i din app</strong> - kopier og tilpas efter behov</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Chat Cards Tab */}
          <TabsContent value="chat-cards" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">💬 Chat Cards (12 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Grundlæggende chat funktioner og kort</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Message Card</h3>
                  <MessageCard
                    message={{
                      id: '19a6f3a45c72f4ae',
                      from: 'Leadmail.no',
                      to: 'info@rendetalje.dk',
                      subject: 'Anne Sofie Feldberg fra Rengøring.nu',
                      content: 'Ny lead fra Rengøring.nu. Kunde: Anne Sofie Feldberg, Email: annesofiefelberg@hotmail.com, Tlf: 40137619',
                      timestamp: 'for 2 timer siden',
                      read: false,
                      starred: false,
                      attachments: 0
                    }}
                    onReply={() => setDialog({ type: 'message-reply' })}
                    onForward={() => setDialog({ type: 'message-forward' })}
                    onDelete={() => setDialog({ type: 'confirm-delete' })}
                    onStar={() => {}}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Email Card</h3>
                  <EmailCard
                    email={{
                      id: '19a6eecfada5ff7b',
                      from: 'nadiasteiner94@gmail.com',
                      to: 'info@rendetalje.dk',
                      subject: 'Nadia Nørgård Steiner fra Rengøring.nu',
                      preview: 'Hej, jeg vil gerne have et tilbud på rengøring af mit hjem. Tlf: 42709859',
                      timestamp: 'for 6 timer siden',
                      read: false,
                      starred: true,
                      hasAttachments: false,
                      labels: ['Lead', 'Rengøring.nu']
                    }}
                    onReply={() => setDialog({ type: 'email-reply' })}
                    onForward={() => setDialog({ type: 'email-forward' })}
                    onArchive={() => setDialog({ type: 'email-archive' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Notification Card</h3>
                  <NotificationCard
                    notification={{
                      id: 'notif_001',
                      type: 'success',
                      title: 'Ny booking bekræftet',
                      message: 'Tommy Callesen - Fast rengøring #7 er booket til 11. november kl. 08:00',
                      timestamp: 'for 10 minutter siden',
                      read: false,
                      actionLabel: 'Se kalender'
                    }}
                    onAction={() => setDialog({ type: 'notification-details' })}
                    onDismiss={() => setDialog({ type: 'notification-details' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Task Card</h3>
                  <TaskCard
                    task={{
                      id: 'task_001',
                      title: 'Svar på lead - Nadia Nørgård Steiner',
                      description: 'Send tilbud på privatrengøring til nadiasteiner94@gmail.com. Tlf: 42709859',
                      dueDate: 'I dag kl. 16:00',
                      priority: 'high',
                      status: 'pending',
                      assignee: 'Dig',
                      progress: 0
                    }}
                    onView={() => setDialog({ type: 'task-details' })}
                    onStart={() => {}}
                    onComplete={() => setDialog({ type: 'task-details' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">5. Calendar Card</h3>
                  <CalendarCard
                    event={{
                      id: 'lvpolt8i3bv0ri419vbp',
                      title: '🏠 FAST RENGØRING #7 - Tommy Callesen',
                      date: '11. november 2025',
                      time: '08:00 - 11:00',
                      duration: '3 timer',
                      type: 'event',
                      location: 'Risdalsvej 7A, 8260 Viby J',
                      attendees: 2,
                      isOnline: false,
                      description: '118 m² et-planshus - fast privatrengøring hver 14. dag'
                    }}
                    onJoin={() => setDialog({ type: 'calendar-details' })}
                    onEdit={() => setDialog({ type: 'calendar-edit' })}
                    onCancel={() => setDialog({ type: 'confirm-delete' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">6. Document Card</h3>
                  <DocumentCard
                    document={{
                      id: 'doc_001',
                      name: 'Opgaveliste 3-17 nov 2025.pdf',
                      type: 'pdf',
                      size: '2.4 MB',
                      lastModified: '10. november 2025',
                      owner: 'Rendetalje',
                      shared: true,
                      status: 'approved'
                    }}
                    onView={() => setDialog({ type: 'document-preview' })}
                    onDownload={() => setDialog({ type: 'export-confirm' })}
                    onShare={() => setDialog({ type: 'document-preview' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">7. Contact Card</h3>
                  <ContactCard
                    contact={{
                      id: 'LMJEFNPDS1e2FiiBSuKBfw',
                      name: 'Tommy Callesen',
                      email: 'tommy_callesen1234@hotmail.com',
                      phone: '26365352',
                      company: 'Privatkunde',
                      role: 'Kunde',
                      location: 'Risdalsvej 7A, 8260 Viby J',
                      avatar: '',
                      status: 'online'
                    }}
                    onEmail={() => setDialog({ type: 'contact-profile' })}
                    onCall={() => setDialog({ type: 'contact-profile' })}
                    onView={() => setDialog({ type: 'contact-profile' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">8. File Card</h3>
                  <FileCard
                    file={{
                      id: 'file_001',
                      name: 'Faktura-1108-Tommy-Callesen.pdf',
                      type: 'document',
                      extension: 'pdf',
                      size: '345 KB',
                      uploadedBy: 'Billy',
                      uploadDate: '31. oktober 2025',
                      thumbnail: ''
                    }}
                    onPreview={() => setDialog({ type: 'file-preview' })}
                    onDownload={() => setDialog({ type: 'export-confirm' })}
                    onDelete={() => setDialog({ type: 'confirm-delete' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">9. Invoice Card</h3>
                  <InvoiceCard
                    invoice={{
                      id: 'yPwm0LwoQeGRz2r3nEHUrA',
                      number: '1108',
                      customer: 'Tommy Callesen',
                      amount: '2.000 kr',
                      dueDate: '7. november 2025',
                      status: 'paid',
                      items: 2,
                      currency: 'DKK'
                    }}
                    onView={() => setDialog({ type: 'invoice-details' })}
                    onSend={() => setDialog({ type: 'export-confirm' })}
                    onDownload={() => setDialog({ type: 'export-confirm' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">10. Analytics Card</h3>
                  <AnalyticsCard
                    analytics={{
                      id: 'analytics_001',
                      title: 'Total omsætning november',
                      value: '224.132 kr',
                      change: 12.5,
                      trend: 'up',
                      period: 'November 2025',
                      data: [45000, 52000, 48000, 55000, 62000, 58000, 70000]
                    }}
                    onViewDetails={() => setDialog({ type: 'analytics-details' })}
                    onExport={() => setDialog({ type: 'export-confirm' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">11. Status Card</h3>
                  <StatusCard
                    status={{
                      id: 'status_001',
                      service: 'Billy Integration',
                      status: 'operational',
                      message: 'Alle systemer kører normalt',
                      lastChecked: 'for 2 minutter siden',
                      uptime: '99.9%'
                    }}
                    onRefresh={() => {}}
                    onViewHistory={() => setDialog({ type: 'status-history' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">12. Quick Reply Card</h3>
                  <QuickReplyCard
                    onSendReply={(message) => setDialog({ type: 'message-reply', data: { message } })}
                    onEditTemplate={(id) => setDialog({ type: 'quick-reply-edit', data: { id } })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Interactive Tab */}
          <TabsContent value="interactive" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">⚡ Interactive Komponenter (5 nye)</h2>
                <p className="text-muted-foreground mb-6">Approval flows, thinking indicators, sync status, phases og action buttons</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Approval Card - Godkendelse</h3>
                  <ApprovalCard
                    item={{
                      id: 'approval_001',
                      type: 'booking',
                      title: 'Fast rengøring #7 - Tommy Callesen',
                      description: '118 m² privatrengøring hver 14. dag. Risdalsvej 7A, 8260 Viby J',
                      amount: '2.000 kr',
                      requestedBy: 'Bassima',
                      requestedAt: '10. nov 2025 kl. 19:24',
                      status: 'pending',
                      priority: 'high'
                    }}
                    onApprove={() => setDialog({ type: 'notification-details' })}
                    onReject={() => setDialog({ type: 'confirm-delete' })}
                    onView={() => setDialog({ type: 'calendar-details' })}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Thinking Indicator - AI Processing</h3>
                  <ThinkingIndicator
                    message="Analyserer lead og forbereder tilbud"
                    isActive={true}
                    variant="simple"
                  />
                  <div className="mt-2">
                    <ThinkingIndicator
                      message="Processing pipeline stages"
                      isActive={true}
                      variant="detailed"
                      steps={[
                        { id: '1', label: 'Matching kunde data', status: 'completed', duration: 142 },
                        { id: '2', label: 'Beregner pris', status: 'active' },
                        { id: '3', label: 'Genererer tilbud', status: 'pending' }
                      ]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Sync Status - System Integration</h3>
                  <SyncStatusCard
                    syncItems={[
                      {
                        id: 'gmail_sync',
                        service: 'Gmail',
                        status: 'synced',
                        lastSync: 'for 2 min siden',
                        itemCount: 231
                      },
                      {
                        id: 'calendar_sync',
                        service: 'Google Calendar',
                        status: 'synced',
                        lastSync: 'for 5 min siden',
                        itemCount: 152
                      },
                      {
                        id: 'billy_sync',
                        service: 'Billy Accounting',
                        status: 'syncing',
                        lastSync: 'for 1 time siden',
                        itemCount: 95
                      }
                    ]}
                    onSync={(id) => console.log('Sync', id)}
                    onSyncAll={() => console.log('Sync all')}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Phase Tracker - Pipeline Stages</h3>
                  <PhaseTracker
                    title="Lead Pipeline"
                    phases={[
                      {
                        id: '1',
                        label: 'Lead modtaget',
                        status: 'completed',
                        date: '10. nov',
                        note: 'Email fra Rengøring.nu'
                      },
                      {
                        id: '2',
                        label: 'Kontaktet',
                        status: 'completed',
                        date: '10. nov',
                        note: 'Tilbud sendt til kunde'
                      },
                      {
                        id: '3',
                        label: 'Booking bekræftet',
                        status: 'active',
                        note: 'Afventer kalender tildeling'
                      },
                      {
                        id: '4',
                        label: 'Faktura sendt',
                        status: 'pending'
                      },
                      {
                        id: '5',
                        label: 'Betalt',
                        status: 'pending'
                      }
                    ]}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">5. Action Buttons - Quick Actions</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <ActionButtonsGroup
                      layout="vertical"
                      actions={[
                        { id: 'send', label: 'Send tilbud', icon: 'send', primary: true },
                        { id: 'call', label: 'Ring til kunde', icon: 'phone', badge: 3 },
                        { id: 'calendar', label: 'Book møde', icon: 'calendar' },
                        { id: 'archive', label: 'Arkiver', icon: 'archive', variant: 'outline' }
                      ]}
                      onAction={(id) => setDialog({ type: 'notification-details' })}
                    />
                    <ActionButtonsGroup
                      layout="grid"
                      actions={[
                        { id: 'approve', label: 'Godkend', icon: 'check', primary: true },
                        { id: 'reject', label: 'Afvis', icon: 'trash', variant: 'destructive' },
                        { id: 'schedule', label: 'Planlæg', icon: 'clock' },
                        { id: 'invoice', label: 'Faktura', icon: 'dollar', badge: 2 }
                      ]}
                      onAction={(id) => setDialog({ type: 'notification-details' })}
                    />
                    <ActionButtonsGroup
                      layout="horizontal"
                      compact={true}
                      actions={[
                        { id: 'mail', label: '', icon: 'mail' },
                        { id: 'message', label: '', icon: 'message', badge: 5 },
                        { id: 'file', label: '', icon: 'file' },
                        { id: 'star', label: '', icon: 'star' },
                        { id: 'more', label: '', icon: 'more' }
                      ]}
                      onAction={(id) => setDialog({ type: 'notification-details' })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Layouts Tab */}
          <TabsContent value="advanced-layouts" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">🎨 Advanced Layouts & Controls (9 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Avancerede layouts, messaging, dokumenter, kontroller og integrationer</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">1. Split View Panel - Justerbare paneler</h3>
                  <div className="h-96 border border-border rounded-lg overflow-hidden">
                    <SplitViewPanel
                      orientation="horizontal"
                      defaultSize={60}
                      firstChild={
                        <div className="p-4 bg-muted/10">
                          <h4 className="font-semibold mb-2">Venstre panel</h4>
                          <p className="text-sm text-muted-foreground">
                            Dette panel kan justeres i størrelse med drag & drop
                          </p>
                        </div>
                      }
                      secondChild={
                        <div className="p-4 bg-muted/10">
                          <h4 className="font-semibold mb-2">Højre panel</h4>
                          <p className="text-sm text-muted-foreground">
                            Træk i separatoren for at ændre størrelse
                          </p>
                        </div>
                      }
                      onResize={(sizes) => console.log('Split sizes:', sizes)}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">2. Message Thread - Trådede samtaler</h3>
                  <div className="max-h-96 overflow-hidden border border-border rounded-lg">
                    <MessageThread
                      messages={[
                        {
                          id: '1',
                          content: 'Hej, kan du hjælpe mig med at analysere vores lead data?',
                          author: {
                            name: 'Bassima',
                            avatar: '',
                            role: 'user'
                          },
                          timestamp: new Date(Date.now() - 1000 * 60 * 5),
                          isCurrentUser: false,
                          reactions: { '👍': ['user1', 'user2'], '❤️': ['user3'] }
                        },
                        {
                          id: '2',
                          content: 'Ja, jeg kan se at vi har haft 231 leads i november. Lad mig analysere conversion raten.',
                          author: {
                            name: 'Friday AI',
                            avatar: '',
                            role: 'assistant'
                          },
                          timestamp: new Date(Date.now() - 1000 * 60 * 4),
                          isCurrentUser: false,
                          replies: [
                            {
                              id: '2.1',
                              content: 'Kan du specificere hvilke kilder du vil fokusere på?',
                              author: {
                                name: 'Bassima',
                                avatar: '',
                                role: 'user'
                              },
                              timestamp: new Date(Date.now() - 1000 * 60 * 3),
                              isCurrentUser: false
                            }
                          ]
                        }
                      ]}
                      onReply={(id, content) => console.log('Reply:', id, content)}
                      onReact={(id, emoji) => console.log('React:', id, emoji)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Document Viewer - PDF & dokument visning</h3>
                  <DocumentViewer
                    document={{
                      id: 'doc_001',
                      title: 'Lead Analyse Rapport.pdf',
                      type: 'pdf',
                      url: '#',
                      size: '2.4 MB',
                      lastModified: new Date(),
                      pages: 12,
                      metadata: {
                        author: 'Friday AI',
                        created: '2025-11-10'
                      }
                    }}
                    content="Dette er et eksempel på dokument indhold der ville blive vist i Document Viewer komponenten."
                    onDownload={() => console.log('Download')}
                    onPrint={() => console.log('Print')}
                    onShare={() => console.log('Share')}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Chat Skeleton - Indlæsnings tilstande</h3>
                  <div className="space-y-4">
                    <MessageSkeleton count={2} />
                    <DocumentSkeleton count={1} />
                    <SearchResultsSkeleton count={1} />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">5. Message Toolbar - Formaterings værktøjer</h3>
                  <MessageToolbar
                    onFormat={(format, value) => console.log('Format:', format, value)}
                    onInsert={(type, data) => console.log('Insert:', type, data)}
                    activeFormats={new Set(['bold'])}
                    canUndo={true}
                    canRedo={false}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">6. Floating Chat Window - Flydende chats</h3>
                  <div className="relative h-96 border border-border rounded-lg overflow-hidden bg-muted/10">
                    <div className="absolute inset-4">
                      <FloatingChatWindow
                        isOpen={true}
                        isMinimized={false}
                        isMaximized={false}
                        title="Support Chat"
                        status="online"
                        position={{ x: 50, y: 50 }}
                        onClose={() => console.log('Close')}
                        onMinimize={() => console.log('Minimize')}
                        onMaximize={() => console.log('Maximize')}
                      >
                        <div className="p-4 space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Dette er et eksempel på et flydende chat vindue
                          </div>
                          <div className="bg-primary text-primary-foreground p-2 rounded text-sm max-w-xs">
                            Hej! Hvordan kan jeg hjælpe dig i dag?
                          </div>
                        </div>
                      </FloatingChatWindow>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">7. Notification System - Notifikationer</h3>
                  <div className="border border-border rounded-lg p-4">
                    <NotificationSystem
                      notifications={[
                        {
                          id: '1',
                          type: 'success',
                          title: 'Ny booking bekræftet',
                          message: 'Tommy Callesen - Fast rengøring #7 er booket til i morgen kl. 08:00',
                          timestamp: new Date(Date.now() - 1000 * 60 * 5),
                          read: false,
                          category: 'booking',
                          actionLabel: 'Se kalender'
                        },
                        {
                          id: '2',
                          type: 'warning',
                          title: 'Høj aktivitet registreret',
                          message: 'Lead konverteringsrate er steget med 15% i dag',
                          timestamp: new Date(Date.now() - 1000 * 60 * 30),
                          read: true,
                          category: 'alert',
                          priority: 'medium'
                        }
                      ]}
                      onMarkAsRead={(id) => console.log('Mark as read:', id)}
                      onAction={(notification) => console.log('Action:', notification)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">8. Panel Size Variants - Responsive layouts</h3>
                  <PanelSizeVariants
                    size="normal"
                    deviceType="auto"
                    showDeviceSelector={true}
                    showSizeControls={true}
                    onSizeChange={(size) => console.log('Size changed:', size)}
                    onDeviceChange={(device) => console.log('Device changed:', device)}
                  >
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <h4 className="font-medium mb-2">Responsivt indhold</h4>
                      <p className="text-sm text-muted-foreground">
                        Dette indhold tilpasser sig til forskellige skærmstørrelser og enheder.
                      </p>
                    </div>
                  </PanelSizeVariants>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">9. Integration Panel - Eksterne tjenester</h3>
                  <div className="border border-border rounded-lg">
                    <IntegrationPanel
                      services={[
                        {
                          id: 'gmail',
                          name: 'Gmail',
                          description: 'Email integration og synkronisering',
                          icon: 'mail',
                          category: 'communication',
                          status: 'connected',
                          lastSync: new Date(Date.now() - 1000 * 60 * 5),
                          syncStatus: {
                            progress: 100,
                            message: 'Synkroniseret',
                            itemsProcessed: 231,
                            totalItems: 231
                          },
                          health: {
                            score: 98,
                            issues: [],
                            lastCheck: new Date()
                          },
                          metadata: {
                            version: '1.2.3',
                            plan: 'Business',
                            limits: { requests: 10000, storage: '10 GB' },
                            usage: { requests: 2341, storage: '2.4 GB' }
                          }
                        },
                        {
                          id: 'calendar',
                          name: 'Google Calendar',
                          description: 'Kalender integration og booking',
                          icon: 'calendar',
                          category: 'productivity',
                          status: 'syncing',
                          lastSync: new Date(Date.now() - 1000 * 60 * 15),
                          syncStatus: {
                            progress: 65,
                            message: 'Synkroniserer events...',
                            itemsProcessed: 98,
                            totalItems: 152
                          }
                        },
                        {
                          id: 'billy',
                          name: 'Billy Accounting',
                          description: 'Regnskabs- og faktureringssystem',
                          icon: 'credit-card',
                          category: 'finance',
                          status: 'error',
                          health: {
                            score: 45,
                            issues: ['API rate limit overskredet', 'Forbindelsesfejl'],
                            lastCheck: new Date(Date.now() - 1000 * 60 * 30)
                          }
                        }
                      ]}
                      onConnect={(id) => console.log('Connect:', id)}
                      onDisconnect={(id) => console.log('Disconnect:', id)}
                      onSync={(id) => console.log('Sync:', id)}
                      showHealth={true}
                      showUsage={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ChatGPT-Style Tab */}
          <TabsContent value="chatgpt" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">🤖 ChatGPT-Style (5 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Streaming messages, advanced composer, memory, sources og tools - inspireret af ChatGPT</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">1. Streaming Message - Token-by-Token Rendering</h3>
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <StreamingMessage
                      role="user"
                      content="Analyser vores leads fra Rengøring.nu og giv mig overblik over conversion rate og gennemsnitlig værdi"
                    />
                    <StreamingMessage
                      role="assistant"
                      content="Baseret på data fra complete-leads-v4.3.3.json kan jeg se at I har modtaget 231 leads fra Rengøring.nu og Leadpoint.dk. Her er nøgletal:

📊 Conversion Rate: 36.4% (84 won ud af 231 total leads)
💰 Gennemsnitlig værdi: 2.668 kr pr. vundet lead
📈 Total omsætning: 224.132 kr
💵 Profit margin: 96.2%

Top insights:
- 95 leads har Billy faktura (41%)
- 152 leads har kalender booking (66%)
- Bedste kilde: Rengøring.nu med 150 leads

Vil du have mere detaljeret analyse af en specifik periode eller lead-kategori?"
                      isStreaming={false}
                      model="Friday AI 4.0"
                      sources={[
                        { title: 'Lead Database Nov 2025', url: '#' },
                        { title: 'Billy Integration Data', url: '#' }
                      ]}
                      onCopy={() => {}}
                      onRegenerate={() => {}}
                      onShare={() => setDialog({ type: 'export-confirm' })}
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">2. Advanced Composer - Med Slash Commands & Uploads</h3>
                  <AdvancedComposer
                    onSend={(msg, files) => console.log('Send:', msg, files)}
                    onStop={() => console.log('Stop generation')}
                    isGenerating={false}
                    showSlashCommands={true}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Memory Manager - Project Scopes & Context</h3>
                  <MemoryManager
                    memories={[
                      {
                        id: '1',
                        key: 'Primær fokus',
                        value: 'Rengøring leads fra Aarhus område',
                        source: 'user',
                        createdAt: '10. nov 2025',
                        project: 'Rendetalje'
                      },
                      {
                        id: '2',
                        key: 'Lead kilder',
                        value: 'Rengøring.nu og Leadpoint.dk',
                        source: 'inferred',
                        createdAt: '10. nov 2025',
                        project: 'Rendetalje'
                      },
                      {
                        id: '3',
                        key: 'Conversion mål',
                        value: 'Target 40% conversion rate',
                        source: 'explicit',
                        createdAt: '9. nov 2025',
                        project: 'Rendetalje'
                      }
                    ]}
                    projects={[
                      {
                        id: 'rendetalje',
                        name: 'Rendetalje',
                        description: 'Hovedforretning - rengøringsservice',
                        memoryCount: 3,
                        isActive: true
                      }
                    ]}
                    memoryEnabled={true}
                    activeProject="rendetalje"
                    onToggleMemory={() => {}}
                    onDeleteMemory={() => {}}
                    onClearMemories={() => setDialog({ type: 'confirm-delete' })}
                    onSelectProject={() => {}}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Sources Panel - Citations & References</h3>
                  <SourcesPanel
                    sources={[
                      {
                        id: '1',
                        title: 'Complete Leads Database v4.3.3',
                        url: '#',
                        domain: 'local/chromadb',
                        snippet: '231 leads med Billy, Gmail og Calendar integration',
                        type: 'database',
                        reliability: 'high',
                        accessedAt: 'for 2 min siden'
                      },
                      {
                        id: '2',
                        title: 'Billy Accounting API - Invoice Data',
                        url: 'https://billy.dk',
                        domain: 'billy.dk',
                        snippet: '95 fakturaer, total værdi 224.132 kr',
                        type: 'web',
                        reliability: 'high',
                        accessedAt: 'for 5 min siden'
                      },
                      {
                        id: '3',
                        title: 'Google Calendar Events',
                        url: 'https://calendar.google.com',
                        domain: 'google.com',
                        snippet: '152 bookings, gennemsnitlig 2-3 timer per job',
                        type: 'web',
                        reliability: 'high',
                        accessedAt: 'for 10 min siden'
                      }
                    ]}
                    onOpenSource={(url) => window.open(url, '_blank')}
                    showReliability={true}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">5. Tools Panel - Search, Analysis & Code Execution</h3>
                  <ToolsPanel
                    executions={[
                      {
                        id: '1',
                        tool: 'search',
                        status: 'completed',
                        input: 'Find latest pricing for cleaning services Aarhus',
                        output: { count: 15 },
                        startTime: 'for 5 min siden',
                        endTime: 'for 4 min siden'
                      },
                      {
                        id: '2',
                        tool: 'analyze',
                        status: 'completed',
                        input: 'Analyser lead conversion data',
                        output: { rows: 231, columns: 15 },
                        startTime: 'for 3 min siden',
                        endTime: 'for 2 min siden',
                        steps: [
                          { label: 'Load data fra database', status: 'completed' },
                          { label: 'Beregn conversion metrics', status: 'completed' },
                          { label: 'Generer visualiseringer', status: 'completed' }
                        ]
                      },
                      {
                        id: '3',
                        tool: 'code',
                        status: 'running',
                        input: 'Python script to calculate ROI per lead source',
                        startTime: 'for 30 sek siden',
                        steps: [
                          { label: 'Parse lead data', status: 'completed' },
                          { label: 'Calculate metrics', status: 'active' },
                          { label: 'Generate report', status: 'pending' }
                        ]
                      }
                    ]}
                    onRunTool={(tool, input) => console.log('Run:', tool, input)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Data Visualization Tab */}
          <TabsContent value="data-visualization" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">📊 Data Visualisering (3 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Metrics dashboards, charts og interaktive data tabeller</p>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Metrics Dashboard - KPI Oversigt</h3>
                  <MetricsDashboard
                    title="Business Performance"
                    subtitle="Nøgle metrics for Rendetalje.dk"
                    metrics={[
                      {
                        id: 'revenue',
                        title: 'Total Omsætning',
                        value: 224132,
                        previousValue: 198450,
                        change: 12.9,
                        format: 'currency',
                        icon: 'DollarSign',
                        color: 'success',
                        trend: 'up',
                        description: 'Inkl. moms og afgifter'
                      },
                      {
                        id: 'leads',
                        title: 'Nye Leads',
                        value: 231,
                        previousValue: 198,
                        change: 16.7,
                        icon: 'Users',
                        color: 'info',
                        trend: 'up',
                        description: 'Fra alle kilder'
                      },
                      {
                        id: 'conversion',
                        title: 'Conversion Rate',
                        value: 36.4,
                        previousValue: 34.2,
                        change: 6.4,
                        format: 'percentage',
                        icon: 'Target',
                        color: 'warning',
                        trend: 'up'
                      },
                      {
                        id: 'bookings',
                        title: 'Aktive Bookings',
                        value: 152,
                        previousValue: 167,
                        change: -9.0,
                        icon: 'Calendar',
                        color: 'danger',
                        trend: 'down'
                      }
                    ]}
                    layout="grid"
                    columns={4}
                    showTrends={true}
                    showRefresh={true}
                    onRefresh={() => console.log('Refreshing metrics...')}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">2. Chart Component - Lead Kilder</h3>
                    <ChartComponent
                      title="Lead Distribution"
                      subtitle="Fordeling af leads pr. kilde"
                      config={{
                        type: 'pie',
                        data: [
                          { label: 'Rengøring.nu', value: 150, color: '#3b82f6' },
                          { label: 'Leadpoint.dk', value: 81, color: '#ef4444' },
                          { label: 'Direkte', value: 25, color: '#10b981' },
                          { label: 'Andet', value: 15, color: '#f59e0b' }
                        ],
                        showLegend: true,
                        animated: true,
                        height: 300
                      }}
                      showControls={true}
                      onExport={() => console.log('Exporting chart...')}
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">3. Chart Component - Månedlig Omsætning</h3>
                    <ChartComponent
                      title="Revenue Trend"
                      subtitle="Sidste 6 måneder"
                      config={{
                        type: 'line',
                        data: [
                          { label: 'Jun', value: 185000 },
                          { label: 'Jul', value: 192000 },
                          { label: 'Aug', value: 178000 },
                          { label: 'Sep', value: 201000 },
                          { label: 'Okt', value: 215000 },
                          { label: 'Nov', value: 224132 }
                        ],
                        xAxis: { label: 'Måned' },
                        yAxis: { label: 'DKK', format: (v) => `${(v/1000).toFixed(0)}K` },
                        showGrid: true,
                        showLegend: false,
                        animated: true,
                        height: 300
                      }}
                      showControls={true}
                      onRefresh={() => console.log('Refreshing chart...')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Data Table - Lead Oversigt</h3>
                  <DataTable
                    title="Seneste Leads"
                    data={[
                      {
                        id: '1',
                        name: 'Anne Sofie Feldberg',
                        email: 'annesofiefelberg@hotmail.com',
                        phone: '40137619',
                        source: 'Rengøring.nu',
                        status: 'converted',
                        value: 2000,
                        date: '2025-11-10'
                      },
                      {
                        id: '2',
                        name: 'Nadia Nørgård Steiner',
                        email: 'nadiasteiner94@gmail.com',
                        phone: '42709859',
                        source: 'Rengøring.nu',
                        status: 'qualified',
                        value: 0,
                        date: '2025-11-10'
                      },
                      {
                        id: '3',
                        name: 'Tommy Callesen',
                        email: 'tommy_callesen1234@hotmail.com',
                        phone: '26365352',
                        source: 'Leadpoint.dk',
                        status: 'booked',
                        value: 2000,
                        date: '2025-11-08'
                      },
                      {
                        id: '4',
                        name: 'Marie Christensen',
                        email: 'marie.christensen@email.dk',
                        phone: '28937461',
                        source: 'Direkte',
                        status: 'contacted',
                        value: 0,
                        date: '2025-11-07'
                      },
                      {
                        id: '5',
                        name: 'Lars Jensen',
                        email: 'lars.jensen85@gmail.com',
                        phone: '31549287',
                        source: 'Rengøring.nu',
                        status: 'qualified',
                        value: 0,
                        date: '2025-11-06'
                      }
                    ]}
                    columns={[
                      {
                        id: 'name',
                        label: 'Navn',
                        accessor: 'name',
                        sortable: true
                      },
                      {
                        id: 'email',
                        label: 'Email',
                        accessor: 'email',
                        sortable: true
                      },
                      {
                        id: 'source',
                        label: 'Kilde',
                        accessor: 'source',
                        sortable: true,
                        render: (value) => (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {value}
                          </span>
                        )
                      },
                      {
                        id: 'status',
                        label: 'Status',
                        accessor: 'status',
                        sortable: true,
                        render: (value) => {
                          const colors = {
                            converted: 'bg-green-100 text-green-800',
                            qualified: 'bg-yellow-100 text-yellow-800',
                            booked: 'bg-blue-100 text-blue-800',
                            contacted: 'bg-purple-100 text-purple-800'
                          }
                          return (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
                              {value}
                            </span>
                          )
                        }
                      },
                      {
                        id: 'value',
                        label: 'Værdi',
                        accessor: 'value',
                        sortable: true,
                        align: 'right',
                        format: (value) => value > 0 ? `${value.toLocaleString('da-DK')} kr` : '-'
                      },
                      {
                        id: 'date',
                        label: 'Dato',
                        accessor: 'date',
                        sortable: true,
                        render: (value) => new Date(value).toLocaleDateString('da-DK')
                      }
                    ]}
                    searchable={true}
                    sortable={true}
                    paginated={true}
                    pageSize={5}
                    selectable={true}
                    onSelectionChange={(selected) => console.log('Selected:', selected)}
                    onRowClick={(row) => console.log('Clicked:', row)}
                    showControls={true}
                    onRefresh={() => console.log('Refreshing table...')}
                    onExport={() => console.log('Exporting table...')}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">📧 Email Center (10 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Email management og Shortwave-inspirerede features</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Email Search Card</h3>
                  <EmailSearchCard />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Label Management Card</h3>
                  <LabelManagementCard threads={[]} availableLabels={[]} />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Todo From Email Card</h3>
                  <TodoFromEmailCard threads={[]} />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Unsubscribe Card</h3>
                  <UnsubscribeCard subscriptions={[]} />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">5. Calendar Event Edit Card</h3>
                  <CalendarEventEditCard event={{} as any} />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">6. Free/Busy Card</h3>
                  <FreeBusyCard />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">7. Conflict Check Card</h3>
                  <ConflictCheckCard />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">8. Billy Customer Card</h3>
                  <BillyCustomerCard />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">9. Billy Product Card</h3>
                  <BillyProductCard />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">10. Billy Analytics Card</h3>
                  <BillyAnalyticsCard />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">🧠 Intelligens & Analyse (10 komponenter)</h2>
                <p className="text-muted-foreground mb-6">AI-drevne analyse værktøjer og data intelligence</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Cross Reference Card</h3>
                  <CrossReferenceCard />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Lead Tracking Card</h3>
                  <LeadTrackingCard />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Customer History Card</h3>
                  <CustomerHistoryCard />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Data Verification Card</h3>
                  <DataVerificationCard />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">5. Predictive Insights Card</h3>
                  <PredictiveInsightsCard
                    insights={[
                      {
                        id: '1',
                        type: 'opportunity',
                        title: 'Lead Conversion Opportunity',
                        description: 'Anne Sofie Feldberg har været kvalificeret i 3 dage uden opfølgning',
                        confidence: 85,
                        impact: 'high',
                        category: 'Sales'
                      },
                      {
                        id: '2',
                        type: 'risk',
                        title: 'Customer Churn Risk',
                        description: 'Ingen aktivitet fra Tommy Callesen i 45 dage',
                        confidence: 78,
                        impact: 'medium',
                        category: 'Retention'
                      },
                      {
                        id: '3',
                        type: 'trend',
                        title: 'Revenue Trend',
                        description: 'Månedlig omsætning viser 12.9% vækst',
                        confidence: 92,
                        impact: 'high',
                        category: 'Analytics'
                      }
                    ]}
                    onInsightClick={(insight) => console.log('Insight clicked:', insight)}
                    onGenerateReport={() => console.log('Generate report')}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">6. Anomaly Detection Card</h3>
                  <AnomalyDetectionCard
                    anomalies={[
                      {
                        id: '1',
                        type: 'performance',
                        severity: 'medium',
                        title: 'Unormal lav konverteringsrate',
                        description: 'Lead konvertering er 15% under gennemsnittet denne uge',
                        detectedAt: '2 timer siden',
                        confidence: 87,
                        affected: 'Sales Pipeline',
                        status: 'new'
                      },
                      {
                        id: '2',
                        type: 'data',
                        severity: 'low',
                        title: 'Manglende email validering',
                        description: '23 leads har ugyldige email adresser',
                        detectedAt: '1 dag siden',
                        confidence: 94,
                        affected: 'Data Quality',
                        status: 'investigating'
                      }
                    ]}
                    onAnomalyClick={(anomaly) => console.log('Anomaly clicked:', anomaly)}
                    onMarkResolved={(id) => console.log('Mark resolved:', id)}
                    onInvestigate={(id) => console.log('Investigate:', id)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">7. Sentiment Analysis Card</h3>
                  <SentimentAnalysisCard
                    context="Customer feedback analysis"
                    sentiments={[
                      {
                        id: '1',
                        source: 'Email',
                        content: 'Tak for den hurtige og professionelle rengøring!',
                        sentiment: 'positive',
                        confidence: 92,
                        timestamp: '2 timer siden',
                        category: 'Service'
                      },
                      {
                        id: '2',
                        source: 'Review',
                        content: 'Prisen er lidt høj, men kvaliteten er god',
                        sentiment: 'neutral',
                        confidence: 78,
                        timestamp: '5 timer siden',
                        category: 'Pricing'
                      },
                      {
                        id: '3',
                        source: 'Chat',
                        content: 'Meget utilfreds med responstiden',
                        sentiment: 'negative',
                        confidence: 85,
                        timestamp: '1 dag siden',
                        category: 'Support'
                      }
                    ]}
                    overallSentiment={{
                      positive: 45,
                      negative: 15,
                      neutral: 40,
                      total: 100
                    }}
                    onViewDetails={(sentiment) => console.log('View sentiment:', sentiment)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">8. Recommendation Engine Card</h3>
                  <RecommendationEngineCard
                    recommendations={[
                      {
                        id: '1',
                        type: 'action',
                        priority: 'high',
                        title: 'Send follow-up til inaktive kunder',
                        description: '45 kunder har ikke haft aktivitet i 30+ dage',
                        impact: '3stars',
                        effort: 'medium',
                        category: 'Retention',
                        confidence: 88
                      },
                      {
                        id: '2',
                        type: 'improvement',
                        priority: 'medium',
                        title: 'Optimer prisstruktur',
                        description: 'Data viser potentiale for 15% højere margin på store opgaver',
                        impact: '4stars',
                        effort: 'high',
                        category: 'Pricing',
                        confidence: 76
                      }
                    ]}
                    onRecommendationClick={(rec) => console.log('Recommendation clicked:', rec)}
                    onImplement={(id) => console.log('Implement:', id)}
                    onDismiss={(id) => console.log('Dismiss:', id)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">9. Pattern Recognition Card</h3>
                  <PatternRecognitionCard
                    patterns={[
                      {
                        id: '1',
                        name: 'Weekly Booking Peak',
                        type: 'seasonal',
                        description: 'Booking aktivitet topper hver onsdag og torsdag',
                        confidence: 89,
                        strength: 78,
                        frequency: 'Weekly',
                        impact: 'medium',
                        category: 'Scheduling',
                        lastDetected: '2 dage siden'
                      },
                      {
                        id: '2',
                        name: 'Price Sensitivity Trend',
                        type: 'trend',
                        description: 'Konverteringsrate falder med 8% når priser > 2000 kr',
                        confidence: 82,
                        strength: 65,
                        frequency: 'Monthly',
                        impact: 'high',
                        category: 'Pricing',
                        lastDetected: '1 uge siden'
                      }
                    ]}
                    onPatternClick={(pattern) => console.log('Pattern clicked:', pattern)}
                    onAnalyze={(id) => console.log('Analyze pattern:', id)}
                    onExport={(id) => console.log('Export pattern:', id)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">10. Risk Assessment Card</h3>
                  <RiskAssessmentCard
                    risks={[
                      {
                        id: '1',
                        category: 'financial',
                        level: 'medium',
                        title: 'Cash Flow Risk',
                        description: '15 fakturaer på 45.000 kr udestående over 30 dage',
                        impact: 'Medium revenue impact',
                        probability: 65,
                        mitigation: 'Implementere automated reminders',
                        status: 'identified'
                      },
                      {
                        id: '2',
                        category: 'operational',
                        level: 'low',
                        title: 'Resource Strain',
                        description: 'Booking rate overstiger kapacitet med 25%',
                        impact: 'Service quality impact',
                        probability: 45,
                        mitigation: 'Hire additional staff',
                        status: 'mitigating'
                      }
                    ]}
                    overallRiskScore={42}
                    onRiskClick={(risk) => console.log('Risk clicked:', risk)}
                    onStartMitigation={(id) => console.log('Start mitigation:', id)}
                    onViewDetails={(id) => console.log('View risk details:', id)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">⚡ Advanced Chat (4 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Avancerede chat funktioner</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Mention System</h3>
                  <MentionSystem />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Code Block Highlight</h3>
                  <CodeBlockHighlight 
                    data={{
                      language: 'typescript',
                      code: 'const greeting = "Hello World!";\nconsole.log(greeting);',
                      filename: 'example.ts',
                      editable: true,
                      runnable: false
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Rich Text Editor</h3>
                  <RichTextEditor />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Message History</h3>
                  <MessageHistory />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">⌨️ Input (4 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Input og formatering komponenter</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Slash Commands Menu</h3>
                  <SlashCommandsMenu />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Mention Autocomplete</h3>
                  <MentionAutocomplete />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Markdown Preview</h3>
                  <MarkdownPreview />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Attachment Preview</h3>
                  <AttachmentPreview />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Smart Tab */}
          <TabsContent value="smart" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">🤖 Smart (5 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Intelligente auto-fuldførelse og suggestions</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Smart Suggestions</h3>
                  <SmartSuggestions />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. AI Assistant</h3>
                  <AIAssistant />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Context Awareness</h3>
                  <ContextAwareness />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Auto Complete</h3>
                  <AutoComplete />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">5. Contextual Help Card</h3>
                  <ContextualHelpCard
                    context="Lead management and customer onboarding"
                    suggestions={[
                      {
                        id: '1',
                        question: 'Hvordan opretter jeg en ny lead?',
                        answer: 'Brug "Opret lead" knappen eller skriv "@lead" efterfulgt af kundens information.',
                        category: 'Leads',
                        confidence: 95
                      },
                      {
                        id: '2',
                        question: 'Hvordan sender jeg et tilbud?',
                        answer: 'Vælg en kvalificeret lead og klik "Send tilbud" eller brug "/tilbud" kommandoen.',
                        category: 'Offers',
                        confidence: 88
                      }
                    ]}
                    onSuggestionClick={(suggestion) => console.log('Suggestion clicked:', suggestion)}
                    onSearch={(query) => console.log('Search:', query)}
                    onFeedback={(id, helpful) => console.log('Feedback:', id, helpful)}
                    onAskQuestion={(question) => console.log('Question:', question)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Realtime Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">🔴 Realtime (4 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Realtime samarbejde og notifikationer</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Live Collaboration</h3>
                  <LiveCollaboration />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Realtime Notifications</h3>
                  <RealtimeNotifications />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Live Typing Indicators</h3>
                  <LiveTypingIndicators />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Live Activity Feed</h3>
                  <LiveActivityFeed />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other Tab */}
          <TabsContent value="other" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">🔧 Andet (10 komponenter)</h2>
                <p className="text-muted-foreground mb-6">Hjælpeværktøjer og system funktioner</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Quick Actions</h3>
                  <QuickActions />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Search Everywhere</h3>
                  <SearchEverywhere />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Command Palette</h3>
                  <CommandPalette />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Settings Panel</h3>
                  <SettingsPanel />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">5. Help Center</h3>
                  <HelpCenter />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">6. User Profile</h3>
                  <UserProfile />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">7. About Info</h3>
                  <AboutInfo />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">8. Keyboard Shortcuts Card</h3>
                  <KeyboardShortcutsCard
                    shortcuts={[
                      {
                        id: 'nav-up',
                        keys: ['j'],
                        description: 'Navigate to next item',
                        category: 'Navigation',
                        enabled: true
                      },
                      {
                        id: 'nav-down',
                        keys: ['k'],
                        description: 'Navigate to previous item',
                        category: 'Navigation',
                        enabled: true
                      },
                      {
                        id: 'search',
                        keys: ['/'],
                        description: 'Focus search field',
                        category: 'Search',
                        enabled: true
                      },
                      {
                        id: 'reply',
                        keys: ['r'],
                        description: 'Reply to selected item',
                        category: 'Messages',
                        enabled: true
                      },
                      {
                        id: 'help',
                        keys: ['?'],
                        description: 'Show keyboard shortcuts',
                        category: 'Navigation',
                        enabled: true
                      }
                    ]}
                    onShortcutClick={(shortcut) => console.log('Shortcut clicked:', shortcut)}
                    onCustomize={() => console.log('Customize shortcuts')}
                    onReset={() => console.log('Reset shortcuts')}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">9. Theme Customizer Card</h3>
                  <ThemeCustomizerCard
                    currentTheme="system"
                    customColors={{
                      primary: '#3b82f6',
                      secondary: '#6b7280',
                      accent: '#10b981'
                    }}
                    onThemeChange={(theme) => console.log('Theme changed:', theme)}
                    onColorChange={(type, color) => console.log('Color changed:', type, color)}
                    onReset={() => console.log('Reset theme')}
                    onSave={() => console.log('Save theme')}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <h3 className="font-semibold">10. Export Import Card</h3>
                  <ExportImportCard
                    exports={[
                      {
                        id: 'export-1',
                        name: 'Customer Data Export',
                        type: 'data',
                        format: 'csv',
                        size: '2.4 MB',
                        createdAt: '2 timer siden',
                        status: 'ready'
                      },
                      {
                        id: 'export-2',
                        name: 'Financial Report',
                        type: 'report',
                        format: 'pdf',
                        size: '1.8 MB',
                        createdAt: '1 dag siden',
                        status: 'ready'
                      }
                    ]}
                    imports={[
                      {
                        id: 'import-1',
                        name: 'Lead Data Import',
                        type: 'data',
                        progress: 75,
                        status: 'processing',
                        createdAt: '5 min siden'
                      }
                    ]}
                    onExport={(type, format) => console.log('Export:', type, format)}
                    onImport={(file) => console.log('Import file:', file)}
                    onDownload={(id) => console.log('Download:', id)}
                    onDelete={(id) => console.log('Delete:', id)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Global Dialog Host */}
        <DialogHost active={dialog} onClose={() => setDialog(null)} />
      </div>
    </div>
  );
}
