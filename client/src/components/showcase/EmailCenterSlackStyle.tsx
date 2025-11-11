import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, Reply, MoreHorizontal, Smile, Paperclip,
  AtSign, Hash, Send, ThumbsUp, Check
} from "lucide-react";

/**
 * DESIGN 6: Slack-Inspired Thread View
 * - Conversation-focused
 * - Nested replies
 * - Reactions & mentions
 * - Thread count indicators
 * - Real-time feel
 */

interface Message {
  id: string;
  from: string;
  avatar: string;
  content: string;
  time: string;
  replies: Reply[];
  reactions: { emoji: string; count: number }[];
  hasAttachment: boolean;
  mentions: string[];
}

interface Reply {
  id: string;
  from: string;
  avatar: string;
  content: string;
  time: string;
}

const threads: Message[] = [
  {
    id: '1',
    from: 'Matilde Skinneholm',
    avatar: 'MS',
    content: 'Hej – vi vil gerne have et tilbud på rengøring for vores kontor i København. Vi er ca. 250 m² og ønsker ugentlig rengøring. Kan I sende et tilbud?',
    time: '22:08',
    replies: [
      { id: 'r1', from: 'You', avatar: 'ME', content: 'Hej Matilde! Tak for din henvendelse. Jeg sender et tilbud i løbet af dagen.', time: '22:15' },
      { id: 'r2', from: 'Matilde Skinneholm', avatar: 'MS', content: 'Perfekt, tak!', time: '22:18' }
    ],
    reactions: [{ emoji: '👍', count: 2 }, { emoji: '✅', count: 1 }],
    hasAttachment: false,
    mentions: ['@you']
  },
  {
    id: '2',
    from: 'Hanne Andersen',
    avatar: 'HA',
    content: 'Jeg følger op på vores tidligere mail vedrørende tilbuddet. Har I haft mulighed for at se på det?',
    time: '17:39',
    replies: [],
    reactions: [],
    hasAttachment: false,
    mentions: []
  },
  {
    id: '3',
    from: 'Rendetalje.dk',
    avatar: 'RD',
    content: 'Vi kan tirsdag eller torsdag denne uge. Hvad passer jer bedst? Vi er fleksible med tidspunkter.',
    time: '20:53',
    replies: [
      { id: 'r3', from: 'You', avatar: 'ME', content: 'Torsdag passer perfekt. Kl. 10?', time: '21:10' }
    ],
    reactions: [{ emoji: '📅', count: 1 }],
    hasAttachment: true,
    mentions: []
  },
];

export function EmailCenterSlackStyle() {
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex h-[700px]">
          {/* Sidebar - Channels */}
          <div className="w-[240px] border-r bg-muted/20">
            <div className="p-4 border-b">
              <h3 className="font-bold text-lg">Email Threads</h3>
              <p className="text-xs text-muted-foreground mt-1">Conversation view</p>
            </div>
            <ScrollArea className="h-[calc(100%-73px)]">
              <div className="p-2 space-y-1">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Channels
                </div>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-accent/50 text-sm">
                  <Hash className="h-4 w-4" />
                  <span>inbox</span>
                  <Badge variant="secondary" className="ml-auto text-xs">3</Badge>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-accent/50 text-sm">
                  <Hash className="h-4 w-4" />
                  <span>sent</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-accent/50 text-sm">
                  <Hash className="h-4 w-4" />
                  <span>important</span>
                  <Badge variant="secondary" className="ml-auto text-xs">2</Badge>
                </button>

                <Separator className="my-2" />

                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Direct Messages
                </div>
                {threads.map(thread => (
                  <button 
                    key={thread.id}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-accent/50 text-sm"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{thread.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="truncate flex-1 text-left">{thread.from}</span>
                    {thread.replies.length > 0 && (
                      <Badge variant="destructive" className="h-4 min-w-[16px] text-xs px-1">
                        {thread.replies.length}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Thread View */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                <h3 className="font-semibold">inbox</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{threads.length} threads</span>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {threads.map(thread => (
                  <div 
                    key={thread.id}
                    onMouseEnter={() => setHoveredMsg(thread.id)}
                    onMouseLeave={() => setHoveredMsg(null)}
                    className="group"
                  >
                    {/* Main Message */}
                    <div className="flex gap-3 hover:bg-accent/20 -mx-3 px-3 py-2 rounded transition-colors">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback>{thread.avatar}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm">{thread.from}</span>
                          <span className="text-xs text-muted-foreground">{thread.time}</span>
                        </div>

                        {/* Content */}
                        <div className="text-sm leading-relaxed">
                          {thread.content}
                          {thread.mentions.length > 0 && (
                            <span className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-xs">
                              <AtSign className="h-3 w-3" />
                              you
                            </span>
                          )}
                        </div>

                        {/* Attachment */}
                        {thread.hasAttachment && (
                          <div className="mt-2 p-2 rounded border bg-muted/30 flex items-center gap-2 text-xs w-fit">
                            <Paperclip className="h-3 w-3" />
                            <span>Plantegning.pdf</span>
                            <span className="text-muted-foreground">2.4 MB</span>
                          </div>
                        )}

                        {/* Reactions */}
                        {thread.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {thread.reactions.map((reaction, idx) => (
                              <button 
                                key={idx}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full border bg-background hover:bg-accent/50 text-xs transition-colors"
                              >
                                <span>{reaction.emoji}</span>
                                <span className="font-medium">{reaction.count}</span>
                              </button>
                            ))}
                            <button className="h-6 w-6 rounded-full border hover:bg-accent/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Smile className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Thread Replies Summary */}
                        {thread.replies.length > 0 && expandedThread !== thread.id && (
                          <button
                            onClick={() => setExpandedThread(thread.id)}
                            className="flex items-center gap-2 mt-2 px-3 py-2 rounded-md border bg-background hover:bg-accent/50 text-sm transition-colors"
                          >
                            <div className="flex -space-x-2">
                              {thread.replies.slice(0, 3).map(reply => (
                                <Avatar key={reply.id} className="h-6 w-6 border-2 border-background">
                                  <AvatarFallback className="text-xs">{reply.avatar}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span className="text-blue-600 font-medium">
                              {thread.replies.length} {thread.replies.length === 1 ? 'reply' : 'replies'}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Last reply {thread.replies[thread.replies.length - 1].time}
                            </span>
                          </button>
                        )}

                        {/* Expanded Replies */}
                        {expandedThread === thread.id && (
                          <div className="mt-3 pl-4 border-l-2 border-primary/20 space-y-3">
                            {thread.replies.map(reply => (
                              <div key={reply.id} className="flex gap-2">
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarFallback className="text-xs">{reply.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-semibold text-sm">{reply.from}</span>
                                    <span className="text-xs text-muted-foreground">{reply.time}</span>
                                  </div>
                                  <div className="text-sm">{reply.content}</div>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => setExpandedThread(null)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Collapse thread
                            </button>
                          </div>
                        )}

                        {/* Quick Actions (on hover) */}
                        {hoveredMsg === thread.id && (
                          <div className="absolute right-4 top-2 flex gap-1 bg-background border rounded-lg shadow-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Reply className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2 p-2 border rounded-lg">
                <Input 
                  placeholder="Reply to #inbox..." 
                  className="border-0 focus-visible:ring-0 shadow-none"
                />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button size="sm" className="gap-2">
                  <Send className="h-3.5 w-3.5" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
