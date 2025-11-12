import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight, Paperclip } from "lucide-react";

interface EmailItemProps {
  sender: string;
  source: string;
  subject: string;
  preview?: string;
  time: string;
  hasAttachments?: boolean;
  badges?: Array<{
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }>;
  metrics?: {
    leads?: number;
    value?: number;
    avgValue?: number;
  };
  selected?: boolean;
  onClick?: () => void;
}

export function EmailListItem({
  sender,
  source,
  subject,
  preview,
  time,
  hasAttachments,
  badges = [],
  metrics,
  selected,
  onClick,
}: EmailItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 border-b hover:bg-accent/50 transition-colors text-left group",
        selected && "bg-accent/30 border-l-4 border-l-primary"
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm truncate">{sender}</span>
            {source && (
              <Badge variant="outline" className="text-xs">
                {source}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">Re: {subject}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground">{time}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Preview Text */}
      {preview && (
        <div className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {preview}
        </div>
      )}

      {/* Badges & Metrics Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {badges.map((badge, idx) => (
            <Badge key={idx} variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
          ))}
          {hasAttachments && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="w-3 h-3" />
              <span>10 bilaoder</span>
            </div>
          )}
        </div>

        {metrics && (
          <div className="flex items-center gap-3 text-xs">
            {metrics.leads !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-red-500">🔥</span>
                <span className="font-semibold">{metrics.leads}</span>
                <span className="text-muted-foreground">Hot Leads</span>
              </div>
            )}
            {metrics.value !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-green-500">💰</span>
                <span className="font-semibold">
                  {metrics.value.toLocaleString("da-DK")} kr.
                </span>
                <span className="text-muted-foreground">Est. Value</span>
              </div>
            )}
            {metrics.avgValue !== undefined && (
              <div className="flex items-center gap-1">
                <span className="text-blue-500">📊</span>
                <span className="font-semibold">
                  {metrics.avgValue.toLocaleString("da-DK")}
                </span>
                <span className="text-muted-foreground">Avg Value</span>
              </div>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

// Demo component with examples
export function EmailListDemo() {
  const demoEmails = [
    {
      sender: "Matilde Skinneholm",
      source: "Rengøring.nu",
      subject: "Matilde Skinneholm fra Rengøring.nu - Nettbureau AS",
      time: "22:02",
      badges: [{ label: "🔥 HOT", variant: "destructive" as const }],
      metrics: {
        leads: 3,
        value: 40000,
        avgValue: 13333,
      },
    },
    {
      sender: "Hanne Andersen",
      source: "Rengøring.nu",
      subject: "Hanne andersen fra Rengøring.nu - Nettbureau AS",
      time: "17:39",
      badges: [{ label: "🔥 HOT", variant: "destructive" as const }],
    },
    {
      sender: "Rendetajle.dk",
      source: "Website",
      subject: "Camilla Nehuus fra Rengøring.nu - Nettbureau AS",
      time: "20:53",
      hasAttachments: true,
      badges: [{ label: "🔥 HOT", variant: "destructive" as const }],
    },
  ];

  return (
    <div className="w-full max-w-3xl border rounded-lg overflow-hidden">
      <div className="border-b p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Email Inbox - Rengøring.nu</h4>
            <p className="text-xs text-muted-foreground">
              AI-sorted med metrics og lead tracking
            </p>
          </div>
          <Badge>3 Hot Leads</Badge>
        </div>
      </div>

      <div className="divide-y">
        {demoEmails.map((email, idx) => (
          <EmailListItem key={idx} {...email} selected={idx === 0} />
        ))}
      </div>
    </div>
  );
}
