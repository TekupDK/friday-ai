/**
 * LEAD CARD DETAILED - Full CRM lead card
 */

import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
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
  email: string;
  phone: string;
  company?: string;
  location: string;
  service: string;
  value: number;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  source: string;
  createdAt: Date;
  lastContact?: Date;
  score: number; // 0-100
  notes?: string;
  nextAction?: string;
  tags: string[];
}

const STATUS_CONFIG = {
  new: {
    label: "Nyt Lead",
    color: "bg-blue-500",
    textColor: "text-blue-700 dark:text-blue-300",
  },
  contacted: {
    label: "Kontaktet",
    color: "bg-purple-500",
    textColor: "text-purple-700 dark:text-purple-300",
  },
  qualified: {
    label: "Kvalificeret",
    color: "bg-yellow-500",
    textColor: "text-yellow-700 dark:text-yellow-300",
  },
  proposal: {
    label: "Tilbud sendt",
    color: "bg-orange-500",
    textColor: "text-orange-700 dark:text-orange-300",
  },
  won: {
    label: "Vundet",
    color: "bg-green-500",
    textColor: "text-green-700 dark:text-green-300",
  },
  lost: {
    label: "Tabt",
    color: "bg-gray-500",
    textColor: "text-gray-700 dark:text-gray-300",
  },
};

interface LeadCardDetailedProps {
  data: LeadData;
  onSendEmail?: () => void;
  onCall?: () => void;
  onSendQuote?: () => void;
  onScheduleMeeting?: () => void;
  onUpdateStatus?: (status: LeadData["status"]) => void;
}

export function LeadCardDetailed({
  data,
  onSendEmail,
  onCall,
  onSendQuote,
  onScheduleMeeting,
  onUpdateStatus,
}: LeadCardDetailedProps) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[data.status];

  return (
    <Card className="overflow-hidden border-l-4 border-l-green-500">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{data.name}</h3>
              {data.company && (
                <p className="text-sm text-muted-foreground">{data.company}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge className={statusConfig.color}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="outline">#{data.id}</Badge>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.score}%
            </div>
            <p className="text-xs text-muted-foreground">Lead Score</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <a
              href={`mailto:${data.email}`}
              className="hover:underline truncate"
            >
              {data.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <a href={`tel:${data.phone}`} className="hover:underline">
              {data.phone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="truncate">{data.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-semibold">
              {data.value.toLocaleString("da-DK")} kr
            </span>
          </div>
        </div>

        {/* Service & Source */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Service</p>
            <p className="font-medium text-sm">{data.service}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Kilde</p>
            <p className="font-medium text-sm">{data.source}</p>
          </div>
        </div>

        {/* Score Progress */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">
              Konvertering sandsynlighed
            </span>
            <span className="font-medium">{data.score}%</span>
          </div>
          <Progress value={data.score} className="h-2" />
        </div>

        {/* Tags */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-3 pt-3 border-t animate-in slide-in-from-top-2">
            {data.notes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Noter:
                </p>
                <p className="text-sm">{data.notes}</p>
              </div>
            )}

            {data.nextAction && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    Næste handling:
                  </p>
                  <p className="text-sm">{data.nextAction}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Oprettet:</span>
                <span className="ml-2 font-medium">
                  {data.createdAt.toLocaleDateString("da-DK")}
                </span>
              </div>
              {data.lastContact && (
                <div>
                  <span className="text-muted-foreground">Sidst kontakt:</span>
                  <span className="ml-2 font-medium">
                    {data.lastContact.toLocaleDateString("da-DK")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button size="sm" onClick={onSendEmail} className="flex-1">
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            Email
          </Button>
          <Button
            size="sm"
            onClick={onCall}
            variant="outline"
            className="flex-1"
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Ring
          </Button>
          <Button
            size="sm"
            onClick={onSendQuote}
            variant="outline"
            className="flex-1"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Tilbud
          </Button>
          <Button
            size="sm"
            onClick={onScheduleMeeting}
            variant="outline"
            className="flex-1"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Møde
          </Button>
        </div>

        {/* Toggle Details */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full"
        >
          {expanded ? "▲ Skjul detaljer" : "▼ Vis flere detaljer"}
        </Button>
      </div>
    </Card>
  );
}
