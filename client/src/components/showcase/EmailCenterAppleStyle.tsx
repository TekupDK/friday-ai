import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Inbox,
  Send,
  FileText,
  Archive,
  Star,
  Trash2,
  Reply,
  Forward,
  Flag,
  Clock,
} from "lucide-react";

/**
 * DESIGN 5: Apple Mail Classic 3-Column
 * - Left: Folder tree
 * - Middle: Email list (compact)
 * - Right: Preview pane
 * - macOS-inspired design
 * - Clean, minimal styling
 */

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  flagged: boolean;
  hasAttachment: boolean;
}

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox, count: 3 },
  { id: "sent", label: "Sent", icon: Send, count: 0 },
  { id: "drafts", label: "Drafts", icon: FileText, count: 1 },
  { id: "archive", label: "Archive", icon: Archive, count: 12 },
  { id: "trash", label: "Trash", icon: Trash2, count: 0 },
];

const emails: Email[] = [
  {
    id: "1",
    from: "Matilde Skinneholm",
    subject: "Tilbud på rengøring for kontor",
    preview:
      "Hej – vi vil gerne have et tilbud på rengøring for vores kontor i København. Vi er ca. 250 m²...",
    time: "22:08",
    unread: true,
    flagged: true,
    hasAttachment: false,
  },
  {
    id: "2",
    from: "Hanne Andersen",
    subject: "Follow-up på tidligere mail",
    preview:
      "Hej, jeg følger op på vores tidligere mail vedrørende tilbuddet. Har I haft mulighed for at se på det?",
    time: "17:39",
    unread: true,
    flagged: true,
    hasAttachment: false,
  },
  {
    id: "3",
    from: "Rendetalje.dk",
    subject: "Booking af besigtigelse",
    preview:
      "Vi kan tirsdag eller torsdag denne uge. Hvad passer jer bedst? Vi er fleksible med tidspunkter.",
    time: "20:53",
    unread: false,
    flagged: false,
    hasAttachment: true,
  },
  {
    id: "4",
    from: "Lars Nielsen",
    subject: "Møde i morgen kl. 10:00",
    preview:
      "Bekræftelse på mødet i morgen kl. 10 i vores kontor. Jeg medbringer nøgletallene fra sidste måned.",
    time: "Igår",
    unread: false,
    flagged: false,
    hasAttachment: false,
  },
];

export function EmailCenterAppleStyle() {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string>("1");

  const selected = emails.find(e => e.id === selectedEmail);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex h-[650px] bg-gradient-to-b from-muted/30 to-background">
          {/* Left Column - Folders */}
          <div className="w-[200px] border-r bg-muted/20 backdrop-blur-sm">
            <div className="p-3 border-b">
              <h3 className="text-sm font-semibold">Mailboxes</h3>
            </div>
            <ScrollArea className="h-[calc(100%-53px)]">
              <div className="p-2 space-y-0.5">
                {folders.map(folder => {
                  const Icon = folder.icon;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => setActiveFolder(folder.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        activeFolder === folder.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-accent/50 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{folder.label}</span>
                      </div>
                      {folder.count > 0 && (
                        <Badge
                          variant="secondary"
                          className="h-5 min-w-[20px] text-xs"
                        >
                          {folder.count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Middle Column - Email List */}
          <div className="w-[320px] border-r bg-background/80 backdrop-blur-sm">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">Inbox</h3>
              <Badge variant="outline" className="text-xs">
                {emails.length}
              </Badge>
            </div>
            <ScrollArea className="h-[calc(100%-57px)]">
              {emails.map(email => (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b transition-colors",
                    selectedEmail === email.id
                      ? "bg-primary/5 border-l-4 border-l-primary"
                      : "hover:bg-accent/30 border-l-4 border-l-transparent",
                    email.unread && "bg-accent/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span
                      className={cn(
                        "text-sm truncate",
                        email.unread
                          ? "font-semibold text-foreground"
                          : "font-medium text-muted-foreground"
                      )}
                    >
                      {email.from}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {email.flagged && (
                        <Flag className="h-3 w-3 fill-orange-500 text-orange-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {email.time}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-sm mb-1 truncate",
                      email.unread
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {email.subject}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {email.preview}
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Right Column - Preview */}
          <div className="flex-1 flex flex-col bg-background">
            {selected ? (
              <>
                {/* Preview Header */}
                <div className="border-b p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2">
                        {selected.subject}
                      </h2>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">From:</span>
                        <span className="text-muted-foreground">
                          {selected.from}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-muted-foreground">
                          {selected.time}
                        </span>
                      </div>
                    </div>
                    {selected.flagged && (
                      <Flag className="h-5 w-5 fill-orange-500 text-orange-500" />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Forward className="h-3.5 w-3.5" />
                      Forward
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Email Body */}
                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-2xl">
                    <p className="mb-4">Hej,</p>
                    <p className="mb-4">{selected.preview}</p>
                    <p className="mb-4">
                      Vi er ca. 250 m² og ønsker ugentlig rengøring.
                    </p>
                    <p className="mb-4">Kan I sende et tilbud?</p>
                    <p className="mt-6">
                      Venlig hilsen,
                      <br />
                      <span className="font-medium">{selected.from}</span>
                    </p>
                  </div>
                </ScrollArea>

                {/* Quick Reply Footer */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Quick reply coming soon...</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Inbox className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No email selected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
