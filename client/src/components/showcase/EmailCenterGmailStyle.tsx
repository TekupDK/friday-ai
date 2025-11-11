import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Search, Star, Archive, Trash2, Mail, Inbox, Send, File,
  Clock, Tag, MoreHorizontal, ChevronLeft, ChevronRight
} from "lucide-react";

/**
 * DESIGN 1: Gmail/Superhuman Style
 * - Ultra-compact density (10+ emails visible)
 * - Keyboard shortcuts displayed
 * - 40/60 split view
 * - Hover actions
 */

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  starred: boolean;
  unread: boolean;
  hasAttachment: boolean;
}

const demoEmails: Email[] = [
  { id: '1', sender: 'Matilde Skinneholm', subject: 'Tilbud på rengøring', preview: 'Hej – vi vil gerne have et tilbud...', time: '22:08', starred: true, unread: true, hasAttachment: false },
  { id: '2', sender: 'Hanne Andersen', subject: 'Follow-up', preview: 'Jeg følger op på tidligere mail...', time: '17:39', starred: false, unread: true, hasAttachment: false },
  { id: '3', sender: 'Rendetalje.dk', subject: 'Booking', preview: 'Vi kan tirsdag eller torsdag...', time: '20:53', starred: false, unread: false, hasAttachment: true },
  { id: '4', sender: 'Lars Nielsen', subject: 'Møde i morgen', preview: 'Bekræftelse på mødet...', time: 'Igår', starred: false, unread: false, hasAttachment: false },
  { id: '5', sender: 'Maria Hansen', subject: 'Faktura', preview: 'Vedlagt finder du faktura...', time: 'Igår', starred: true, unread: false, hasAttachment: true },
];

export function EmailCenterGmailStyle() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hoveredEmail, setHoveredEmail] = useState<string | null>(null);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>('1');

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedEmail = demoEmails.find(e => e.id === selectedEmailId);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Top Bar */}
        <div className="border-b bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-[600px]">
              <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Søg (Cmd+K)" className="pl-9 h-8 text-sm" />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>1-5 af 50</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-3 flex gap-6">
          {[{ label: 'Primary', icon: Inbox }, { label: 'Social', icon: Mail }].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.label} className="flex items-center gap-2 py-3 text-sm border-b-2 border-primary text-primary font-medium">
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="border-b bg-primary/5 px-3 py-2 flex items-center gap-2">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <Button variant="ghost" size="sm" className="h-8"><Archive className="h-3.5 w-3.5 mr-1" />Archive</Button>
            <Button variant="ghost" size="sm" className="h-8"><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
          </div>
        )}

        {/* Split View */}
        <div className="flex h-[600px]">
          {/* List */}
          <div className="w-[40%] border-r">
            <ScrollArea className="h-full">
              {demoEmails.map((email, idx) => (
                <div
                  key={email.id}
                  onMouseEnter={() => setHoveredEmail(email.id)}
                  onMouseLeave={() => setHoveredEmail(null)}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 border-b cursor-pointer",
                    selectedEmailId === email.id && "bg-accent/50",
                    email.unread && "bg-muted/20"
                  )}
                >
                  <Checkbox checked={selected.has(email.id)} onCheckedChange={() => toggleSelect(email.id)} 
                    onClick={(e) => e.stopPropagation()} className={cn(hoveredEmail === email.id || selected.has(email.id) ? "opacity-100" : "opacity-0")} />
                  <Star className={cn("h-4 w-4", email.starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-baseline gap-2">
                      <span className={cn("font-medium truncate", email.unread && "font-semibold")}>{email.sender}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{email.time}</span>
                    </div>
                    <div className={cn("truncate", email.unread ? "text-foreground" : "text-muted-foreground")}>
                      {email.subject} - {email.preview}
                    </div>
                  </div>
                  {email.hasAttachment && <File className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Preview */}
          <div className="flex-1">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                <div className="border-b p-4">
                  <div className="flex justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{selectedEmail.subject}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{selectedEmail.sender}</span>
                        <Badge variant="outline" className="text-xs">{selectedEmail.time}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Archive className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <p>Hej,</p>
                  <p>{selectedEmail.preview}</p>
                  <p>Venlig hilsen,<br />{selectedEmail.sender}</p>
                </ScrollArea>
                <div className="border-t p-4 flex gap-2">
                  <Button><Send className="h-4 w-4 mr-2" />Reply</Button>
                  <Button variant="outline"><Send className="h-4 w-4 mr-2" />Forward</Button>
                </div>
              </div>
            ) : <div className="h-full flex items-center justify-center text-muted-foreground">Select an email</div>}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground flex gap-4">
          <span><kbd className="px-1.5 py-0.5 bg-background border rounded">e</kbd> Archive</span>
          <span><kbd className="px-1.5 py-0.5 bg-background border rounded">r</kbd> Reply</span>
          <span><kbd className="px-1.5 py-0.5 bg-background border rounded">j/k</kbd> Navigate</span>
        </div>
      </CardContent>
    </Card>
  );
}
