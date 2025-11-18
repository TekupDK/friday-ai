/**
 * EMAIL CARD - Email kort komponent
 */

import { Mail, Reply, Forward, Archive, Star, Paperclip } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface EmailCardProps {
  email?: {
    id: string;
    from: string;
    to: string;
    subject: string;
    preview: string;
    timestamp: string;
    read: boolean;
    starred: boolean;
    hasAttachments: boolean;
    labels?: string[];
  };
  onReply?: () => void;
  onForward?: () => void;
  onArchive?: () => void;
}

export function EmailCard({
  email = {
    id: "1",
    from: "kunde@example.com",
    to: "support@tekup.dk",
    subject: "Spørgsmål om faktura",
    preview: "Jeg har et spørgsmål angående min sidste faktura fra januar...",
    timestamp: "for 2 timer siden",
    read: false,
    starred: true,
    hasAttachments: true,
    labels: ["Vigtig", "Kunde"],
  },
  onReply,
  onForward,
  onArchive,
}: EmailCardProps) {
  const [isStarred, setIsStarred] = useState(email.starred);

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        email.read ? "border-l-gray-400" : "border-l-green-500"
      )}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{email.from}</span>
                {!email.read && <Badge className="bg-green-500">Ulæst</Badge>}
              </div>
              <span className="text-xs text-muted-foreground">
                {email.timestamp}
              </span>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsStarred(!isStarred)}
          >
            <Star
              className={cn(
                "w-4 h-4",
                isStarred ? "fill-yellow-400 text-yellow-400" : ""
              )}
            />
          </Button>
        </div>

        <div>
          <h4 className="font-medium">{email.subject}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {email.preview}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-1">
            {email.labels?.map(label => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            {email.hasAttachments && (
              <Paperclip className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onReply}>
              <Reply className="w-3 h-3 mr-1" />
              Svar
            </Button>
            <Button size="sm" variant="ghost" onClick={onForward}>
              <Forward className="w-3 h-3 mr-1" />
              Send
            </Button>
            <Button size="sm" variant="ghost" onClick={onArchive}>
              <Archive className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
