import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Check, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  id: string;
  userId: string;
  content: string;
  resolved: boolean;
  createdAt: string;
}

interface CommentsSectionProps {
  documentId: string;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  onResolveComment: (commentId: string) => Promise<void>;
}

export function CommentsSection({
  documentId,
  comments = [],
  onAddComment,
  onResolveComment,
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsAdding(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment("");
      toast.success("Comment added!");
    } catch (error: any) {
      toast.error(`Failed to add comment: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await onResolveComment(commentId);
      toast.success("Comment resolved!");
    } catch (error: any) {
      toast.error(`Failed to resolve comment: ${error.message}`);
    }
  };

  const unresolvedComments = comments.filter(c => !c.resolved);
  const resolvedComments = comments.filter(c => c.resolved);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
          {unresolvedComments.length > 0 && (
            <Badge variant="secondary">
              {unresolvedComments.length} unresolved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="min-h-[80px]"
            disabled={isAdding}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAdding}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {isAdding ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Unresolved Comments */}
            {unresolvedComments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Active Discussions
                </h4>
                {unresolvedComments.map(comment => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onResolve={handleResolveComment}
                  />
                ))}
              </div>
            )}

            {/* Resolved Comments */}
            {resolvedComments.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Resolved
                </h4>
                {resolvedComments.map(comment => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onResolve={handleResolveComment}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CommentCardProps {
  comment: Comment;
  onResolve: (commentId: string) => void;
}

function CommentCard({ comment, onResolve }: CommentCardProps) {
  const initials = comment.userId
    .split("-")
    .slice(0, 2)
    .map(s => s[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`border rounded-lg p-3 space-y-2 ${
        comment.resolved ? "opacity-60 bg-muted/30" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.userId}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {comment.resolved && (
                <Badge variant="outline" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        </div>
        {!comment.resolved && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResolve(comment.id)}
            title="Mark as resolved"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
