/**
 * EmailSplits - Shortwave-Inspired Smart Inbox Organization
 *
 * Smart splits that auto-filter emails based on AI intelligence:
 * - Hot Leads: Urgent/high priority emails that need immediate attention
 * - Venter på Svar: Sent offers awaiting response
 * - Finance: Finance-related emails (invoices, payments)
 * - Afsluttet: Archived/completed emails
 *
 * Integrates with Email Intelligence System (categories + priorities)
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { EnhancedEmailMessage } from "@/types/enhanced-email";
import {
  Flame,
  Clock,
  DollarSign,
  CheckCircle2,
  Mail,
  Inbox,
} from "lucide-react";

// Split ID type
export type SplitId = "all" | "hot-leads" | "waiting" | "finance" | "done";

export interface EmailSplit {
  id: SplitId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  count: number;
  unreadCount: number;
}

export interface EmailSplitsProps {
  emails: EnhancedEmailMessage[];
  intelligence: Record<
    string,
    {
      category?: {
        category: string;
        subcategory: string | null;
        confidence: number;
      };
      priority?: { level: string; score: number; reasoning: string | null };
    }
  >;
  activeSplit: SplitId;
  onSplitChange: (splitId: SplitId) => void;
}

export default function EmailSplits({
  emails,
  intelligence,
  activeSplit,
  onSplitChange,
}: EmailSplitsProps) {
  // Calculate splits based on email intelligence
  const splits = useMemo<EmailSplit[]>(() => {
    // All emails
    const allEmails = emails;

    // Hot Leads: High/urgent priority + not replied
    const hotLeads = emails.filter(email => {
      const intel = intelligence[email.threadId];
      const isHighPriority =
        intel?.priority?.level === "urgent" ||
        intel?.priority?.level === "high" ||
        (intel?.priority?.score && intel.priority.score >= 70);
      const notReplied =
        !email.labels?.includes("replied") &&
        !email.labels?.includes("sent-offer");
      return isHighPriority && notReplied && email.unread;
    });

    // Venter på Svar: Sent offers awaiting response
    const waiting = emails.filter(email => {
      const hasSentOffer =
        email.labels?.includes("sent-offer") ||
        email.labels?.includes("pending");
      const notReplied = !email.labels?.includes("replied");
      return hasSentOffer && notReplied;
    });

    // Finance: Finance category emails
    const finance = emails.filter(email => {
      const intel = intelligence[email.threadId];
      return intel?.category?.category === "finance";
    });

    // Afsluttet: Archived/done emails
    const done = emails.filter(email => {
      return (
        email.labels?.includes("archived") ||
        email.labels?.includes("done") ||
        email.labels?.includes("completed")
      );
    });

    return [
      {
        id: "all",
        name: "Alle Emails",
        icon: Inbox,
        description: "Alle emails i indbakken",
        color: "text-blue-600",
        count: allEmails.length,
        unreadCount: allEmails.filter(e => e.unread).length,
      },
      {
        id: "hot-leads",
        name: "Hot Leads",
        icon: Flame,
        description: "Urgent leads der kræver handling nu",
        color: "text-red-600",
        count: hotLeads.length,
        unreadCount: hotLeads.filter(e => e.unread).length,
      },
      {
        id: "waiting",
        name: "Venter på Svar",
        icon: Clock,
        description: "Tilbud sendt, afventer svar",
        color: "text-yellow-600",
        count: waiting.length,
        unreadCount: waiting.filter(e => e.unread).length,
      },
      {
        id: "finance",
        name: "Finance",
        icon: DollarSign,
        description: "Fakturaer og betalinger",
        color: "text-green-600",
        count: finance.length,
        unreadCount: finance.filter(e => e.unread).length,
      },
      {
        id: "done",
        name: "Afsluttet",
        icon: CheckCircle2,
        description: "Færdigbehandlede emails",
        color: "text-gray-500",
        count: done.length,
        unreadCount: 0,
      },
    ];
  }, [emails, intelligence]);

  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Smart Splits
        </h3>
      </div>

      {splits.map(split => {
        const isActive = activeSplit === split.id;
        const Icon = split.icon;

        return (
          <button
            key={split.id}
            onClick={() => onSplitChange(split.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted/50 text-foreground"
            )}
            title={split.description}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-primary-foreground" : split.color
                )}
              />
              <span className="font-medium truncate">{split.name}</span>
              <span
                className={cn(
                  "text-xs shrink-0",
                  isActive
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                ({split.count})
              </span>
            </div>

            {split.unreadCount > 0 && (
              <Badge
                variant={isActive ? "secondary" : "default"}
                className={cn(
                  "ml-2 h-5 px-2 text-xs shrink-0",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-blue-500 text-white"
                )}
              >
                {split.unreadCount}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
