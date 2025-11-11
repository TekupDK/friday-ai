import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Reply, 
  MoreHorizontal, 
  ThumbsUp, 
  ThumbsDown,
  Share2,
  Bookmark,
  Flag,
  FileText
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { da } from "date-fns/locale"

export interface ThreadMessage {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
    role?: 'user' | 'assistant' | 'system'
  }
  timestamp: Date
  isCurrentUser?: boolean
  reactions?: {
    [key: string]: string[] // userIds who reacted with this emoji
  }
  replies?: ThreadMessage[]
  isPinned?: boolean
  isEdited?: boolean
  attachments?: Array<{
    id: string
    name: string
    type: 'image' | 'document' | 'link' | 'file'
    url: string
    size?: string
    thumbnail?: string
  }>
}

interface MessageThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: ThreadMessage[]
  currentUserId?: string
  onReply?: (messageId: string, content: string) => void
  onReact?: (messageId: string, emoji: string) => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, content: string) => void
  onPin?: (messageId: string, pinned: boolean) => void
  onReport?: (messageId: string, reason: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
  showThreadLines?: boolean
  maxRepliesToShow?: number
}

export function MessageThread({
  messages,
  currentUserId,
  onReply,
  onReact,
  onDelete,
  onEdit,
  onPin,
  onReport,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  className,
  variant = 'default',
  showThreadLines = true,
  maxRepliesToShow = 3,
  ...props
}: MessageThreadProps) {
  const [expandedReplies, setExpandedReplies] = React.useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null)
  const [editingMessage, setEditingMessage] = React.useState<{id: string, content: string} | null>(null)
  const [showReactions, setShowReactions] = React.useState<string | null>(null)
  const replyInputRef = React.useRef<HTMLTextAreaElement>(null)
  const editInputRef = React.useRef<HTMLTextAreaElement>(null)

  const toggleReplies = (messageId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const handleReply = (messageId: string, content: string) => {
    onReply?.(messageId, content)
    setReplyingTo(null)
  }

  const handleEdit = (messageId: string, content: string) => {
    onEdit?.(messageId, content)
    setEditingMessage(null)
  }

  const renderMessage = (message: ThreadMessage, isReply = false, level = 0) => {
    const isExpanded = expandedReplies.has(message.id)
    const hasReplies = message.replies && message.replies.length > 0
    const showExpandButton = hasReplies && !isExpanded
    const repliesToShow = message.replies ? 
      (isExpanded ? message.replies : message.replies.slice(0, maxRepliesToShow)) : []
    const hiddenRepliesCount = message.replies ? 
      Math.max(0, message.replies.length - maxRepliesToShow) : 0

    return (
      <div 
        key={message.id}
        className={cn(
          "group relative py-3 px-4 rounded-lg transition-colors",
          "hover:bg-accent/50",
          message.isPinned && "border-l-4 border-amber-500 pl-3",
          isReply ? "ml-8 mt-2" : "mb-2",
          variant === 'compact' && "py-2 px-3",
          variant === 'detailed' && "py-4 px-5"
        )}
      >
        {showThreadLines && level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border -ml-4" />
        )}
        
        <div className="flex items-start gap-3">
          <Avatar className={cn(
            "h-8 w-8 mt-1 shrink-0",
            variant === 'compact' && "h-6 w-6 mt-0.5"
          )}>
            <AvatarImage src={message.author.avatar} alt={message.author.name} />
            <AvatarFallback>
              {message.author.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {message.author.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.timestamp), { 
                  addSuffix: true, 
                  locale: da 
                })}
              </span>
              {message.isPinned && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">
                  Fastgjort
                </Badge>
              )}
              {message.isEdited && (
                <span className="text-xs text-muted-foreground italic">redigeret</span>
              )}
            </div>
            
            {editingMessage?.id === message.id ? (
              <div className="mt-1">
                <textarea
                  ref={editInputRef}
                  className="w-full p-2 border rounded-md text-sm"
                  defaultValue={editingMessage.content}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleEdit(message.id, editInputRef.current?.value || '')
                    } else if (e.key === 'Escape') {
                      setEditingMessage(null)
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleEdit(message.id, editInputRef.current?.value || '')}
                  >
                    Gem
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingMessage(null)}
                  >
                    Annuller
                  </Button>
                </div>
              </div>
            ) : (
              <p className={cn(
                "text-sm mt-1 whitespace-pre-wrap wrap-break-word",
                variant === 'compact' && "text-sm",
                variant === 'detailed' && "text-base"
              )}>
                {message.content}
              </p>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map(attachment => (
                  <div 
                    key={attachment.id}
                    className={cn(
                      "border rounded-md p-2 text-sm max-w-xs",
                      "flex items-center gap-2 bg-accent/30"
                    )}
                  >
                    {attachment.type === 'image' && attachment.thumbnail ? (
                      <img 
                        src={attachment.thumbnail} 
                        alt={attachment.name} 
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{attachment.name}</p>
                      {attachment.size && (
                        <p className="text-xs text-muted-foreground">{attachment.size}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Message Actions */}
            <div className="flex items-center gap-1 mt-2 text-muted-foreground text-xs">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
              >
                <Reply className="w-3.5 h-3.5 mr-1" />
                Svar
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs"
                onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
              >
                <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                Reaktion
              </Button>
              
              {onPin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => onPin(message.id, !message.isPinned)}
                >
                  <Bookmark className={cn(
                    "w-3.5 h-3.5 mr-1",
                    message.isPinned ? "fill-amber-500 text-amber-500" : ""
                  )} />
                  {message.isPinned ? 'Fjern' : 'Fastgør'}
                </Button>
              )}
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => {}}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
                
                {/* More options dropdown */}
                <div className="absolute left-0 bottom-full mb-1 w-48 bg-popover rounded-md shadow-lg z-10 hidden group-hover:block hover:block">
                  <div className="py-1">
                    {onEdit && message.author.role === 'user' && (
                      <button 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => setEditingMessage({ id: message.id, content: message.content })}
                      >
                        Rediger besked
                      </button>
                    )}
                    <button 
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        navigator.clipboard.writeText(message.content)
                        // Show copied tooltip
                      }}
                    >
                      Kopier tekst
                    </button>
                    {onReport && (
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-accent"
                        onClick={() => onReport(message.id, 'report')}
                      >
                        <Flag className="w-3.5 h-3.5 mr-1 inline" />
                        Anmeld
                      </button>
                    )}
                    {onDelete && message.author.role === 'user' && (
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-accent"
                        onClick={() => onDelete(message.id)}
                      >
                        Slet besked
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reactions */}
              {message.reactions && Object.entries(message.reactions).map(([emoji, users]) => (
                <Button 
                  key={emoji} 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-xs rounded-full"
                  onClick={() => onReact?.(message.id, emoji)}
                >
                  <span className="mr-1">{emoji}</span>
                  <span>{users.length}</span>
                </Button>
              ))}
            </div>

            {/* Reply input */}
            {replyingTo === message.id && (
              <div className="mt-2">
                <textarea
                  ref={replyInputRef}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Skriv dit svar..."
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleReply(message.id, replyInputRef.current?.value || '')
                    }
                  }}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Annuller
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleReply(message.id, replyInputRef.current?.value || '')}
                  >
                    Send
                  </Button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {hasReplies && (
              <div className="mt-2">
                {repliesToShow.map(reply => renderMessage(reply, true, level + 1))}
                
                {!isExpanded && hiddenRepliesCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-muted-foreground h-6 px-2"
                    onClick={() => toggleReplies(message.id)}
                  >
                    <ChevronDown className="w-3.5 h-3.5 mr-1" />
                    Vis {hiddenRepliesCount} flere svar
                  </Button>
                )}
                
                {isExpanded && message.replies && message.replies.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-muted-foreground h-6 px-2"
                    onClick={() => toggleReplies(message.id)}
                  >
                    <ChevronUp className="w-3.5 h-3.5 mr-1" />
                    Skjul svar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={cn("space-y-1", className)} 
      {...props}
    >
      {messages.map(message => renderMessage(message, false, 0))}
      
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Indlæser...' : 'Indlæs flere beskeder'}
          </Button>
        </div>
      )}
    </div>
  )
}
