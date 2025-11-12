import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Mail,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";

/**
 * FRIDAY AI PRO - UNIFIED WORKSPACE
 *
 * Features:
 * - Email + Calendar + Invoices integrated
 * - Mesh gradients & depth
 * - Rich card design
 * - Comprehensive dashboard
 * - Modern glassmorphism
 */

interface Activity {
  id: string;
  type: "email" | "calendar" | "invoice";
  title: string;
  description: string;
  time: string;
  priority?: "high" | "medium" | "low";
  value?: number;
  status?: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "email",
    title: "Ny lead fra Matilde",
    description: "Tilbudsanmodning på kontorrengøring 250m²",
    time: "Nu",
    priority: "high",
    value: 40000,
  },
  {
    id: "2",
    type: "calendar",
    title: "Møde med Lars Nielsen",
    description: "Besigtigelse og tilbudspræsentation",
    time: "I dag kl. 14:00",
    priority: "high",
  },
  {
    id: "3",
    type: "invoice",
    title: "Faktura #1234 betalt",
    description: "Maria Hansen - Hovedrengøring",
    time: "2t siden",
    value: 8500,
    status: "paid",
  },
];

export function EmailCenterFridayPro() {
  const [activeContext, setActiveContext] = useState("all");

  const getActivityIcon = (type: string) => {
    if (type === "email") return Mail;
    if (type === "calendar") return Calendar;
    return FileText;
  };

  const getActivityColor = (type: string) => {
    if (type === "email") return "from-blue-500 to-cyan-500";
    if (type === "calendar") return "from-purple-500 to-pink-500";
    return "from-green-500 to-emerald-500";
  };

  const getPriorityDot = (priority?: string) => {
    if (priority === "high") return "bg-red-500";
    if (priority === "medium") return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="relative min-h-[750px] rounded-2xl overflow-hidden">
      {/* Premium Mesh Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className="relative h-[750px] flex">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="backdrop-blur-2xl bg-white/60 border-b border-white/40 shadow-2xl">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Friday AI Pro
                    </h1>
                    <p className="text-sm text-gray-600">Unified Workspace</p>
                  </div>
                </div>

                {/* Context Pills */}
                <div className="flex items-center gap-2">
                  {[
                    { id: "all", label: "All", icon: Target },
                    { id: "emails", label: "Emails", icon: Mail },
                    { id: "calendar", label: "Calendar", icon: Calendar },
                    { id: "invoices", label: "Invoices", icon: FileText },
                  ].map(ctx => {
                    const Icon = ctx.icon;
                    const isActive = activeContext === ctx.id;
                    return (
                      <button
                        key={ctx.id}
                        onClick={() => setActiveContext(ctx.id)}
                        className={cn(
                          "px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-lg",
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-105 shadow-2xl"
                            : "bg-white/80 backdrop-blur-md hover:bg-white hover:scale-105"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-semibold text-sm">
                          {ctx.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full pt-24 pb-6 px-8">
          <div className="grid grid-cols-3 gap-6 h-full">
            {/* Left - Activity Feed */}
            <div className="col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Today's Activity
                </h2>
                <p className="text-sm text-gray-600">
                  Real-time updates across all channels
                </p>
              </div>

              <ScrollArea className="h-[calc(100%-80px)]">
                <div className="space-y-4">
                  {activities.map((activity, idx) => {
                    const Icon = getActivityIcon(activity.type);
                    const gradient = getActivityColor(activity.type);

                    return (
                      <div
                        key={activity.id}
                        className="relative group"
                        style={{
                          animation: `slideUp 0.5s ease-out ${idx * 0.1}s both`,
                        }}
                      >
                        {/* Glow Effect */}
                        <div
                          className={cn(
                            "absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-50 blur-2xl transition-all duration-500 bg-gradient-to-r",
                            gradient
                          )}
                        />

                        <Card className="relative overflow-hidden backdrop-blur-xl bg-white/90 border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
                          {/* Gradient Top Border */}
                          <div
                            className={cn("h-1 bg-gradient-to-r", gradient)}
                          />

                          <div className="p-6">
                            <div className="flex items-start gap-4">
                              {/* Icon with Gradient */}
                              <div
                                className={cn(
                                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br",
                                  gradient
                                )}
                              >
                                <Icon className="w-7 h-7 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                                      {activity.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {activity.description}
                                    </p>
                                  </div>
                                  {activity.priority && (
                                    <div className="flex items-center gap-2 ml-4">
                                      <div
                                        className={cn(
                                          "w-2 h-2 rounded-full",
                                          getPriorityDot(activity.priority)
                                        )}
                                      />
                                      <span className="text-xs font-semibold text-gray-500 uppercase">
                                        {activity.priority}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {activity.time}
                                  </div>

                                  {activity.value && (
                                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-bold text-green-700">
                                          {activity.value.toLocaleString(
                                            "da-DK"
                                          )}{" "}
                                          kr
                                        </span>
                                      </div>
                                    </div>
                                  )}

                                  {activity.status === "paid" && (
                                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Paid
                                    </Badge>
                                  )}
                                </div>

                                {/* Quick Actions on Hover */}
                                <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <Button
                                    size="sm"
                                    className={cn(
                                      "bg-gradient-to-r text-white shadow-md",
                                      gradient
                                    )}
                                  >
                                    Take Action
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white/80 backdrop-blur-sm"
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Right - Dashboard & Quick Stats */}
            <div className="space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: Mail,
                    label: "Unread",
                    value: "3",
                    gradient: "from-blue-500 to-cyan-500",
                  },
                  {
                    icon: Calendar,
                    label: "Today",
                    value: "2",
                    gradient: "from-purple-500 to-pink-500",
                  },
                  {
                    icon: FileText,
                    label: "Unpaid",
                    value: "1",
                    gradient: "from-orange-500 to-red-500",
                  },
                  {
                    icon: CheckCircle2,
                    label: "Done",
                    value: "12",
                    gradient: "from-green-500 to-emerald-500",
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="relative group">
                      <div
                        className={cn(
                          "absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity bg-gradient-to-r",
                          stat.gradient
                        )}
                      />
                      <Card className="relative p-5 backdrop-blur-xl bg-white/90 border-2 border-white/60 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br shadow-lg",
                            stat.gradient
                          )}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-600 font-semibold uppercase">
                          {stat.label}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Revenue Card */}
              <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl" />
                <div className="relative p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 uppercase">
                      Revenue
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-green-700 mb-1">
                    48.5k kr
                  </div>
                  <div className="text-sm text-green-600">
                    This month • +23% vs last
                  </div>
                </div>
              </Card>

              {/* AI Insights Card */}
              <Card className="backdrop-blur-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50 shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">AI Insights</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-purple-200/50">
                      <div className="flex items-start gap-2">
                        <Zap className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700 leading-relaxed">
                          3 hot leads need immediate attention. Estimated total
                          value: 65.000 kr
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 backdrop-blur-sm border border-purple-200/50">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700 leading-relaxed">
                          2 follow-ups scheduled for tomorrow
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
