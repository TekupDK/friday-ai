/**
 * LEAD TRACKING CARD - Lead pipeline tracking
 */

import {
  Users,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";


export interface LeadData {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status:
    | "new"
    | "contacted"
    | "meeting"
    | "proposal"
    | "negotiation"
    | "closed-won"
    | "closed-lost";
  value: number;
  lastActivity: string;
  nextAction?: string;
  source: "website" | "referral" | "cold-call" | "email" | "social";
  assignedTo?: string;
  tags: string[];
}

interface LeadTrackingCardProps {
  leads?: LeadData[];
  onUpdateStatus?: (leadId: string, status: LeadData["status"]) => void;
  onAddActivity?: (leadId: string, activity: string) => void;
  onExport?: () => void;
}

export function LeadTrackingCard({
  leads,
  onUpdateStatus,
  onAddActivity,
  onExport,
}: LeadTrackingCardProps) {
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  // Default leads data
  const defaultLeads: LeadData[] = [
    {
      id: "1",
      name: "John Smith",
      company: "ABC Corporation",
      email: "john@abc.com",
      phone: "+45 12345678",
      status: "meeting",
      value: 50000,
      lastActivity: "2024-01-15",
      nextAction: "Møde om rengøringsaftale",
      source: "website",
      assignedTo: "Sales Team A",
      tags: ["enterprise", "rengøring"],
    },
    {
      id: "2",
      name: "Sarah Johnson",
      company: "XYZ Services",
      email: "sarah@xyz.dk",
      status: "proposal",
      value: 25000,
      lastActivity: "2024-01-14",
      nextAction: "Følg op på tilbud",
      source: "referral",
      assignedTo: "Sales Team B",
      tags: ["medium", "service"],
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "mike@startup.io",
      status: "new",
      value: 15000,
      lastActivity: "2024-01-16",
      source: "cold-call",
      assignedTo: "Sales Team A",
      tags: ["startup", "potentiel"],
    },
  ];

  const leadsData = leads || defaultLeads;

  const getStatusColor = (status: LeadData["status"]) => {
    switch (status) {
      case "new":
        return "bg-gray-500";
      case "contacted":
        return "bg-blue-500";
      case "meeting":
        return "bg-purple-500";
      case "proposal":
        return "bg-orange-500";
      case "negotiation":
        return "bg-yellow-500";
      case "closed-won":
        return "bg-green-500";
      case "closed-lost":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: LeadData["status"]) => {
    switch (status) {
      case "new":
        return "Ny";
      case "contacted":
        return "Kontaktet";
      case "meeting":
        return "Møde";
      case "proposal":
        return "Tilbud";
      case "negotiation":
        return "Forhandling";
      case "closed-won":
        return "Vundet";
      case "closed-lost":
        return "Tabt";
      default:
        return status;
    }
  };

  const getStatusProgress = (status: LeadData["status"]) => {
    const progressMap = {
      new: 10,
      contacted: 25,
      meeting: 50,
      proposal: 75,
      negotiation: 90,
      "closed-won": 100,
      "closed-lost": 0,
    };
    return progressMap[status] || 0;
  };

  const getSourceIcon = (source: LeadData["source"]) => {
    switch (source) {
      case "website":
        return "🌐";
      case "referral":
        return "👥";
      case "cold-call":
        return "📞";
      case "email":
        return "📧";
      case "social":
        return "📱";
      default:
        return "❓";
    }
  };

  const totalValue = leadsData.reduce((sum, lead) => sum + lead.value, 0);
  const activeLeads = leadsData.filter(
    lead => !["closed-won", "closed-lost"].includes(lead.status)
  ).length;
  const wonLeads = leadsData.filter(
    lead => lead.status === "closed-won"
  ).length;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Lead Pipeline</h4>
              <p className="text-xs text-muted-foreground">CRM lead tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500">{activeLeads} aktive</Badge>
            <Badge className="bg-green-500">{wonLeads} vundet</Badge>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-center">
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {leadsData.length}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Total Leads
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {totalValue.toLocaleString("da-DK")} kr
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Pipeline Value
            </p>
          </div>
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {Math.round((wonLeads / leadsData.length) * 100)}%
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Win Rate
            </p>
          </div>
        </div>

        {/* Leads List */}
        <div className="space-y-2">
          <h5 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Aktive Leads ({activeLeads})
          </h5>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {leadsData
              .filter(
                lead => !["closed-won", "closed-lost"].includes(lead.status)
              )
              .map(lead => (
                <button
                  key={lead.id}
                  onClick={() =>
                    setSelectedLead(selectedLead === lead.id ? null : lead.id)
                  }
                  className="w-full text-left p-3 rounded-lg bg-background border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2">
                    {/* Lead Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getSourceIcon(lead.source)}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{lead.name}</p>
                          {lead.company && (
                            <p className="text-xs text-muted-foreground">
                              {lead.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>
                        {getStatusLabel(lead.status)}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Pipeline Progress
                        </span>
                        <span className="text-xs font-medium">
                          {getStatusProgress(lead.status)}%
                        </span>
                      </div>
                      <Progress
                        value={getStatusProgress(lead.status)}
                        className="h-2"
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Value and Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {lead.value.toLocaleString("da-DK")} kr
                      </span>
                      <div className="flex items-center gap-1">
                        {lead.assignedTo && (
                          <Badge variant="outline" className="text-xs">
                            {lead.assignedTo}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Next Action */}
                    {lead.nextAction && (
                      <div className="flex items-start gap-1 p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                        <Clock className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-blue-700 dark:text-blue-400">
                          Næste: {lead.nextAction}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Expanded Actions */}
                    {selectedLead === lead.id && (
                      <div className="pt-2 border-t space-y-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Ring
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Møde
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            "contacted",
                            "meeting",
                            "proposal",
                            "negotiation",
                            "closed-won",
                            "closed-lost",
                          ].map(status => (
                            <Button
                              key={status}
                              size="sm"
                              variant="ghost"
                              onClick={e => {
                                e.stopPropagation();
                                onUpdateStatus?.(
                                  lead.id,
                                  status as LeadData["status"]
                                );
                              }}
                              disabled={lead.status === status}
                              className="text-xs h-7"
                            >
                              {getStatusLabel(status as LeadData["status"])}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button onClick={onExport} variant="outline" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            Eksport
          </Button>
          <Button className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600">
            <Users className="w-4 h-4 mr-2" />
            Nyt Lead
          </Button>
        </div>
      </div>
    </Card>
  );
}
