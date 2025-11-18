/**
 * MESSAGE CARD - Grundlæggende besked kort
 */

import {
  MessageSquare,
  Reply,
  Forward,
  Trash2,
  Star,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MessageCardProps {
  message?: {
    id: string;
    from: string;
    to: string;
    subject: string;
    content: string;
    timestamp: string;
    read: boolean;
    starred: boolean;
    attachments?: number;
  };
  onReply?: () => void;
  onForward?: () => void;
  onDelete?: () => void;
  onStar?: () => void;
}

export function MessageCard({
  message = {
    id: "1",
    from: "John Smith",
    to: "Sarah Johnson",
    subject: "Møde om projekt status",
    content:
      "Hej Sarah, jeg vil gerne diskutere status på vores projekt. Kan vi mødes i morgen kl. 10?",
    timestamp: "for 5 minutter siden",
    read: false,
    starred: false,
    attachments: 2,
  },
  onReply,
  onForward,
  onDelete,
  onStar,
}: MessageCardProps) {
  const [isStarred, setIsStarred] = useState(message.starred);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStar = () => {
    setIsStarred(!isStarred);
    onStar?.();
  };

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-200",
        message.read ? "border-l-gray-400" : "border-l-blue-500",
        "hover:shadow-lg"
      )}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{message.from}</span>
                {!message.read && <Badge className="bg-blue-500">Ny</Badge>}
              </div>
              <span className="text-xs text-muted-foreground">
                til {message.to}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleStar}
              className="h-8 w-8"
            >
              <Star
                className={cn(
                  "w-4 h-4",
                  isStarred ? "fill-yellow-400 text-yellow-400" : ""
                )}
              />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Subject */}
        <div>
          <h4 className="font-medium">{message.subject}</h4>
        </div>

        {/* Content */}
        <div
          className={cn(
            "text-sm text-muted-foreground",
            !isExpanded && "line-clamp-2"
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {message.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{message.timestamp}</span>
            {message.attachments && message.attachments > 0 && (
              <Badge variant="outline">
                📎 {message.attachments} fil
                {message.attachments > 1 ? "er" : ""}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onReply}>
              <Reply className="w-3 h-3 mr-1" />
              Svar
            </Button>
            <Button size="sm" variant="ghost" onClick={onForward}>
              <Forward className="w-3 h-3 mr-1" />
              Videresend
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
