import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Mail,
  Search,
  Command,
  Sparkles,
  Send,
  Calendar,
  FileText,
  Phone,
  User,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Archive,
  Star,
  Filter,
  ChevronDown,
  Zap,
  Building2,
  MapPin,
  History,
  MoreHorizontal,
  X,
} from "lucide-react";

/**
 * EMAIL CENTER PRO V2 - RENDETALJE PERSONALIZED
 *
 * Ultimate email management for cleaning business with:
 * - Split inbox tabs (pipeline stages)
 * - AI-powered quick actions
 * - Command palette (Cmd+K)
 * - Smart customer preview with history
 * - Billy & Calendar integration
 * - Real-time stats dashboard
 * - Lead source tracking
 */

type PipelineStage =
  | "needs_action"
  | "venter"
  | "kalender"
  | "finance"
  | "done";
type LeadSource = "rengoring_nu" | "adhelp" | "website" | "direct";

interface Email {
  id: string;
  from: string;
  email: string;
  subject: string;
  preview: string;
  time: string;
  stage: PipelineStage;
  source: LeadSource;
  aiScore: number;
  estimatedValue?: number;
  serviceType?: string;
  propertySize?: number;
  address?: string;
  starred: boolean;
  unread: boolean;
  hasCalendarEvent?: boolean;
  hasInvoice?: boolean;
  quickActions: string[];
}

const emails: Email[] = [
  {
    id: "1",
    from: "Matilde Skinneholm",
    email: "matilde@techcorp.dk",
    subject: "Tilbud på kontorrengøring",
    preview:
      "Hej Rendetalje, vi vil gerne have et tilbud på ugentlig rengøring af vores kontor...",
    time: "Nu",
    stage: "needs_action",
    source: "rengoring_nu",
    aiScore: 95,
    estimatedValue: 40000,
    serviceType: "Fast Rengøring",
    propertySize: 250,
    address: "Nørrebrogade 123, København",
    starred: true,
    unread: true,
    quickActions: [
      "Send Tilbud Kontorrengøring",
      "Opret Lead i CRM",
      "Ring Kunde",
    ],
  },
  {
    id: "2",
    from: "Hanne Andersen",
    email: "hanne@example.dk",
    subject: "Re: Tilbud flytterengøring",
    preview: "Tak for tilbuddet. Vi vil gerne gå videre...",
    time: "2t",
    stage: "venter",
    source: "direct",
    aiScore: 88,
    estimatedValue: 25000,
    serviceType: "Flytterengøring",
    propertySize: 120,
    starred: false,
    unread: true,
    quickActions: ["Book Besigtigelse", "Send Follow-up", "Bekræft Booking"],
  },
  {
    id: "3",
    from: "Lars Nielsen",
    email: "lars@nielsen.dk",
    subject: "Booking bekræftet - Hovedrengøring",
    preview: "Perfect! Vi ses onsdag kl. 10...",
    time: "5t",
    stage: "kalender",
    source: "website",
    aiScore: 92,
    estimatedValue: 15000,
    serviceType: "Hovedrengøring",
    propertySize: 180,
    hasCalendarEvent: true,
    starred: false,
    unread: false,
    quickActions: ["Se Kalender Event", "Send Påmindelse", "Flyt Booking"],
  },
  {
    id: "4",
    from: "Maria Hansen",
    email: "maria@example.dk",
    subject: "Job completed - Send faktura",
    preview: "Tak for god service!",
    time: "Igår",
    stage: "finance",
    source: "adhelp",
    aiScore: 75,
    estimatedValue: 8500,
    serviceType: "Byggepladsrengøring",
    hasInvoice: false,
    starred: false,
    unread: false,
    quickActions: ["Send Faktura via Billy", "Mark as Paid", "Send Kvittering"],
  },
];

const stages = [
  {
    id: "needs_action",
    label: "Needs Action",
    icon: Zap,
    color: "red",
    count: 1,
  },
  {
    id: "venter",
    label: "Venter på svar",
    icon: Clock,
    color: "yellow",
    count: 1,
  },
  {
    id: "kalender",
    label: "I Kalender",
    icon: Calendar,
    color: "blue",
    count: 1,
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "green",
    count: 1,
  },
  {
    id: "done",
    label: "Afsluttet",
    icon: CheckCircle2,
    color: "gray",
    count: 0,
  },
] as const;

const sourceConfig = {
  rengoring_nu: {
    label: "Rengøring.nu",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: "🧹",
  },
  adhelp: {
    label: "AdHelp",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: "📢",
  },
  website: {
    label: "Website",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: "🌐",
  },
  direct: {
    label: "Direct",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: "📧",
  },
};

export function EmailCenterProV2() {
  const [activeStage, setActiveStage] = useState<PipelineStage>("needs_action");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails[0]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  const filteredEmails = useMemo(() => {
    return emails.filter(e => e.stage === activeStage);
  }, [activeStage]);

  const todayStats = {
    revenue: 65000,
    bookings: 3,
    leads: 4,
    responseTime: "2.3h",
  };

  const toggleBulkSelect = (id: string) => {
    const newSet = new Set(bulkSelected);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setBulkSelected(newSet);
  };

  return (
    <div className="relative h-[800px] rounded-2xl overflow-hidden border-2 border-gray-200 bg-white">
      {/* Top Bar - Rendetalje Branding */}
      <div className="h-14 border-b bg-gradient-to-r from-blue-600 to-blue-700 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-blue-600">
            R
          </div>
          <div className="text-white">
            <h1 className="font-bold text-sm">Rendetalje Email Center</h1>
            <p className="text-xs text-blue-100">Pro V2</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Today's Stats */}
          <div className="flex items-center gap-4 px-4 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs text-blue-100">Revenue</div>
              <div className="text-sm font-bold text-white">
                {todayStats.revenue.toLocaleString()} kr
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-xs text-blue-100">Bookings</div>
              <div className="text-sm font-bold text-white">
                {todayStats.bookings}
              </div>
            </div>
            <Separator orientation="vertical" className="h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-xs text-blue-100">Response</div>
              <div className="text-sm font-bold text-white">
                {todayStats.responseTime}
              </div>
            </div>
          </div>

          {/* Command Palette Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommandPalette(true)}
            className="text-white hover:bg-white/10"
          >
            <Command className="w-4 h-4 mr-2" />
            <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs">⌘K</kbd>
          </Button>
        </div>
      </div>

      {/* Pipeline Tabs */}
      <div className="border-b bg-gray-50 px-6 py-3">
        <div className="flex items-center gap-2">
          {stages.map(stage => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id as PipelineStage)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-white shadow-md border-2 border-blue-200 text-blue-700"
                    : "hover:bg-white/50 text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {stage.label}
                {stage.count > 0 && (
                  <Badge
                    className={cn(
                      "ml-1 px-1.5 py-0 text-xs",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    )}
                  >
                    {stage.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex h-[calc(100%-112px)]">
        {/* Email List - 45% */}
        <div className="w-[45%] border-r flex flex-col">
          {/* Search & Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Søg emails, kunder, leads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            {/* Bulk Actions */}
            {bulkSelected.size > 0 && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-700">
                  {bulkSelected.size} selected
                </span>
                <Separator orientation="vertical" className="h-4" />
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  <Archive className="w-3 h-3 mr-1" />
                  Archive
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  <Send className="w-3 h-3 mr-1" />
                  Move to
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs ml-auto"
                  onClick={() => setBulkSelected(new Set())}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Email List */}
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredEmails.map((email, idx) => {
                const source = sourceConfig[email.source];
                const isSelected = selectedEmail?.id === email.id;
                const isBulkSelected = bulkSelected.has(email.id);

                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={cn(
                      "group relative p-4 cursor-pointer transition-all hover:bg-gray-50",
                      isSelected && "bg-blue-50 border-l-4 border-l-blue-600",
                      email.unread && "bg-blue-50/30",
                      isBulkSelected && "bg-blue-100"
                    )}
                    style={{
                      animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Bulk Select Checkbox */}
                      <input
                        type="checkbox"
                        checked={isBulkSelected}
                        onChange={() => toggleBulkSelect(email.id)}
                        onClick={e => e.stopPropagation()}
                        className="mt-1 w-4 h-4 rounded border-gray-300"
                      />

                      {/* Avatar */}
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                          {email.from.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-semibold text-sm truncate",
                                  email.unread
                                    ? "text-gray-900"
                                    : "text-gray-600"
                                )}
                              >
                                {email.from}
                              </span>
                              <span className="text-xs">{source.icon}</span>
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {email.email}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2 shrink-0">
                            {email.starred && (
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            )}
                            <span className="text-xs text-gray-500">
                              {email.time}
                            </span>
                          </div>
                        </div>

                        {/* Subject */}
                        <h4
                          className={cn(
                            "text-sm mb-1 truncate",
                            email.unread
                              ? "font-semibold text-gray-900"
                              : "text-gray-700"
                          )}
                        >
                          {email.subject}
                        </h4>

                        {/* Preview */}
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {email.preview}
                        </p>

                        {/* Meta Tags */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs px-2 py-0 border",
                              source.color
                            )}
                          >
                            {source.label}
                          </Badge>
                          {email.serviceType && (
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-0"
                            >
                              {email.serviceType}
                            </Badge>
                          )}
                          {email.estimatedValue && (
                            <Badge className="text-xs px-2 py-0 bg-green-100 text-green-700 border-green-200">
                              {email.estimatedValue.toLocaleString()} kr
                            </Badge>
                          )}
                          {email.hasCalendarEvent && (
                            <Badge className="text-xs px-2 py-0 bg-blue-100 text-blue-700">
                              <Calendar className="w-3 h-3 mr-1" />
                              Booked
                            </Badge>
                          )}
                          {email.aiScore >= 90 && (
                            <Badge className="text-xs px-2 py-0 bg-purple-100 text-purple-700">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {email.aiScore}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Email Preview - 55% */}
        <div className="flex-1 flex flex-col">
          {selectedEmail ? (
            <>
              {/* Email Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                        {selectedEmail.from.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">
                        {selectedEmail.from}
                      </h2>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedEmail.email}
                      </p>
                      <h3 className="text-base font-semibold text-gray-800">
                        {selectedEmail.subject}
                      </h3>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* AI Quick Actions Bar */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">
                      AI Suggested Actions
                    </span>
                    <Badge className="bg-purple-600 text-white text-xs">
                      {selectedEmail.aiScore}% match
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.quickActions.map((action, i) => (
                      <Button
                        key={i}
                        size="sm"
                        className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-sm"
                      >
                        {action.includes("Send") && (
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {action.includes("Ring") && (
                          <Phone className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {action.includes("Opret") && (
                          <User className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {action.includes("Book") && (
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Email Body & Customer Context */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {/* Customer Context Card */}
                  <Card className="mb-6 border-2">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                      <h4 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer Context
                      </h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                      {selectedEmail.serviceType && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Service Type
                          </div>
                          <div className="font-semibold text-gray-900">
                            {selectedEmail.serviceType}
                          </div>
                        </div>
                      )}
                      {selectedEmail.propertySize && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Property Size
                          </div>
                          <div className="font-semibold text-gray-900">
                            {selectedEmail.propertySize} m²
                          </div>
                        </div>
                      )}
                      {selectedEmail.estimatedValue && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Estimated Value
                          </div>
                          <div className="font-semibold text-green-600 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {selectedEmail.estimatedValue.toLocaleString()} kr
                          </div>
                        </div>
                      )}
                      {selectedEmail.address && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Address
                          </div>
                          <div className="font-semibold text-gray-900 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {selectedEmail.address}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Email Content */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedEmail.preview}
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Vi er interesseret i at høre nærmere om jeres priser og
                      tilgængelighed. Kan I sende et tilbud hurtigst muligt?
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Venlig hilsen,
                      <br />
                      {selectedEmail.from}
                    </p>
                  </div>
                </div>
              </ScrollArea>

              {/* Action Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
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
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Select an email to view</p>
              </div>
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
    </div>
  );
}
