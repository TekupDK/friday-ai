import {
  Sparkles,
  Inbox,
  Star,
  Archive,
  Clock,
  Search,
  CheckCircle2,
  Mail,
  Zap,
  Filter,
  MoreHorizontal,
  Circle,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * SHORTWAVE-INSPIRED PREMIUM DESIGN
 *
 * Modern UI Features:
 * - Glassmorphism panels with backdrop blur
 * - Rich mesh gradients
 * - Soft multi-layer shadows
 * - Neumorphic elements
 * - Smooth micro-animations
 * - Professional spacing & typography
 */

interface Bundle {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: any;
  gradient: string;
}

interface Email {
  id: string;
  from: string;
  avatar: string;
  subject: string;
  summary: string;
  time: string;
  bundle?: string;
  starred: boolean;
  unread: boolean;
  aiScore: number;
}

const bundles: Bundle[] = [
  {
    id: "hot",
    name: "Hot Leads",
    count: 3,
    color: "from-red-500 to-orange-500",
    icon: Flame,
    gradient: "bg-gradient-to-br from-red-50 to-orange-50",
  },
  {
    id: "action",
    name: "Needs Action",
    count: 5,
    color: "from-blue-500 to-cyan-500",
    icon: Zap,
    gradient: "bg-gradient-to-br from-blue-50 to-cyan-50",
  },
  {
    id: "waiting",
    name: "Waiting",
    count: 2,
    color: "from-yellow-500 to-amber-500",
    icon: Clock,
    gradient: "bg-gradient-to-br from-yellow-50 to-amber-50",
  },
  {
    id: "done",
    name: "Done",
    count: 12,
    color: "from-green-500 to-emerald-500",
    icon: CheckCircle2,
    gradient: "bg-gradient-to-br from-green-50 to-emerald-50",
  },
];

const emails: Email[] = [
  {
    id: "1",
    from: "Matilde Skinneholm",
    avatar: "MS",
    subject: "Tilbud på rengøring for kontor",
    summary:
      "Ny kunde søger tilbud på 250m² kontor med ugentlig service. Estimeret værdi: 40.000 kr.",
    time: "Nu",
    bundle: "hot",
    starred: true,
    unread: true,
    aiScore: 95,
  },
  {
    id: "2",
    from: "Hanne Andersen",
    avatar: "HA",
    subject: "Follow-up på tilbud",
    summary: "Eksisterende lead følger op. Har modtaget tilbud, afventer svar.",
    time: "2t",
    bundle: "waiting",
    starred: false,
    unread: true,
    aiScore: 88,
  },
  {
    id: "3",
    from: "Lars Nielsen",
    avatar: "LN",
    subject: "Booking bekræftet",
    summary:
      "Kunde bekræfter booking til onsdag kl. 10. Ingen yderligere action.",
    time: "5t",
    bundle: "done",
    starred: false,
    unread: false,
    aiScore: 75,
  },
];

export function EmailCenterShortwavePremium() {
  const [activeBundle, setActiveBundle] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails[0]);

  const filteredEmails = activeBundle
    ? emails.filter(e => e.bundle === activeBundle)
    : emails;

  return (
    <div className="relative min-h-[750px] rounded-2xl overflow-hidden">
      {/* Beautiful Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative flex h-[750px]">
        {/* Left Sidebar - Glassmorphism */}
        <div className="w-[280px] border-r border-white/20 backdrop-blur-xl bg-white/40 shadow-2xl">
          <div className="p-6">
            {/* Logo/Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Friday AI</h2>
                  <p className="text-xs text-gray-600">Premium Email</p>
                </div>
              </div>
            </div>

            {/* Search with Glassmorphism */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search emails..."
                className="pl-10 bg-white/60 border-white/40 backdrop-blur-sm shadow-lg focus:shadow-xl transition-all"
              />
            </div>

            {/* Bundles with Rich Gradients */}
            <div className="space-y-2 mb-8">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Smart Bundles
              </div>
              {bundles.map(bundle => {
                const Icon = bundle.icon;
                const isActive = activeBundle === bundle.id;

                return (
                  <button
                    key={bundle.id}
                    onClick={() => setActiveBundle(isActive ? null : bundle.id)}
                    className={cn(
                      "w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300",
                      isActive
                        ? "shadow-xl scale-[1.02]"
                        : "shadow-md hover:shadow-lg hover:scale-[1.01]"
                    )}
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${bundle.color.split(" ")[1]} 0%, ${bundle.color.split(" ")[3]} 100%)`
                        : "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {/* Gradient Overlay on Hover */}
                    {!isActive && (
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${bundle.color.split(" ")[1]}, ${bundle.color.split(" ")[3]})`,
                        }}
                      />
                    )}

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shadow-md",
                            isActive
                              ? "bg-white/30 backdrop-blur-sm"
                              : "bg-white/80"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5",
                              isActive ? "text-white" : "text-gray-700"
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            "font-semibold text-sm",
                            isActive ? "text-white" : "text-gray-800"
                          )}
                        >
                          {bundle.name}
                        </span>
                      </div>
                      <Badge
                        className={cn(
                          "shadow-md",
                          isActive
                            ? "bg-white/30 text-white backdrop-blur-sm"
                            : "bg-white/80 text-gray-700"
                        )}
                      >
                        {bundle.count}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Quick Actions
              </div>
              {[
                { icon: Star, label: "Starred" },
                { icon: Archive, label: "Archive" },
                { icon: Filter, label: "Filters" },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Email List - Glassmorphism Cards */}
        <div className="w-[420px] border-r border-white/20">
          <div className="p-6 border-b border-white/20 backdrop-blur-xl bg-white/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {activeBundle
                    ? bundles.find(b => b.id === activeBundle)?.name
                    : "All Mail"}
                </h3>
                <p className="text-sm text-gray-600">
                  {filteredEmails.length} emails
                </p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-100px)]">
            <div className="p-4 space-y-3">
              {filteredEmails.map((email, idx) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl p-5 cursor-pointer transition-all duration-300",
                    "bg-white/70 backdrop-blur-md border border-white/40",
                    selectedEmail?.id === email.id
                      ? "shadow-2xl scale-[1.02] border-purple-200"
                      : "shadow-lg hover:shadow-xl hover:scale-[1.01]",
                    email.unread && "bg-white/90"
                  )}
                  style={{
                    animation: `slideUp 0.4s ease-out ${idx * 0.1}s both`,
                  }}
                >
                  {/* AI Score Indicator - Subtle Glow */}
                  {email.aiScore >= 90 && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-bl-full blur-2xl" />
                  )}

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-11 h-11 shadow-lg ring-2 ring-white/50">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                          {email.avatar}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "font-semibold text-sm",
                              email.unread ? "text-gray-900" : "text-gray-600"
                            )}
                          >
                            {email.from}
                          </span>
                          <div className="flex items-center gap-2">
                            {email.starred && (
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            )}
                            <span className="text-xs text-gray-500">
                              {email.time}
                            </span>
                          </div>
                        </div>
                        <h4
                          className={cn(
                            "text-sm mb-2 line-clamp-1",
                            email.unread
                              ? "font-semibold text-gray-900"
                              : "font-medium text-gray-700"
                          )}
                        >
                          {email.subject}
                        </h4>
                      </div>
                    </div>

                    {/* AI Summary with Glassmorphism */}
                    <div className="relative overflow-hidden rounded-xl p-3 bg-gradient-to-br from-purple-50/80 to-blue-50/80 backdrop-blur-sm border border-purple-100/50 shadow-sm">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                          {email.summary}
                        </p>
                      </div>
                      {/* AI Score Badge */}
                      <div className="absolute top-2 right-2">
                        <div
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm",
                            email.aiScore >= 90 &&
                              "bg-green-100 text-green-700",
                            email.aiScore >= 75 &&
                              email.aiScore < 90 &&
                              "bg-blue-100 text-blue-700"
                          )}
                        >
                          {email.aiScore}
                        </div>
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg bg-white/80 backdrop-blur-sm shadow-md"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-lg bg-white/80 backdrop-blur-sm shadow-md"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Email Preview - Rich Detail */}
        <div className="flex-1 backdrop-blur-xl bg-white/30">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              <div className="p-8 border-b border-white/20">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="w-14 h-14 shadow-xl ring-4 ring-white/50">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg font-bold">
                      {selectedEmail.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="font-medium">{selectedEmail.from}</span>
                      <Circle className="w-1 h-1 fill-current" />
                      <span>{selectedEmail.time}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons with Gradients */}
                <div className="flex gap-2">
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Mail className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/70 backdrop-blur-sm border-white/40 shadow-md hover:shadow-lg"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-8">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedEmail.summary}
                  </p>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select an email to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
