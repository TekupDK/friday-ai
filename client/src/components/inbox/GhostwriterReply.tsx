/**
 * Ghostwriter Reply Component
 * Generates AI replies in user's writing style
 */

import { Loader2, Sparkles, Edit2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface GhostwriterReplyProps {
  threadId: string;
  subject: string;
  from: string;
  body: string;
  previousMessages?: string[];
  onReplyGenerated?: (reply: string) => void;
  onSend?: (reply: string) => void;
}

export default function GhostwriterReply({
  threadId,
  subject,
  from,
  body,
  previousMessages,
  onReplyGenerated,
  onSend,
}: GhostwriterReplyProps) {
  const [generatedReply, setGeneratedReply] = useState<string>("");
  const [editedReply, setEditedReply] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const generateMutation = trpc.email.generateGhostwriterReply.useMutation({
    onSuccess: (reply) => {
      setGeneratedReply(reply);
      setEditedReply(reply);
      setIsEditing(false);
      onReplyGenerated?.(reply);
      toast.success("Svar genereret i din skrivestil");
    },
    onError: (error) => {
      toast.error(`Fejl ved generering: ${error.message}`);
    },
  });

  const feedbackMutation = trpc.email.updateWritingStyleFromFeedback.useMutation({
    onSuccess: () => {
      toast.success("Tak! Din skrivestil bliver opdateret");
    },
    onError: (error) => {
      toast.error(`Fejl ved opdatering: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      threadId,
      subject,
      from,
      body,
      previousMessages,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedReply !== generatedReply) {
      // Learn from the edit
      feedbackMutation.mutate({
        originalSuggestion: generatedReply,
        editedResponse: editedReply,
        threadId,
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedReply(generatedReply);
    setIsEditing(false);
  };

  const handleSend = () => {
    const replyToSend = isEditing ? editedReply : generatedReply;
    if (replyToSend !== generatedReply) {
      // Learn from the edit before sending
      feedbackMutation.mutate({
        originalSuggestion: generatedReply,
        editedResponse: replyToSend,
        threadId,
      });
    }
    onSend?.(replyToSend);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Ghostwriter - Svar i din stil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedReply && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Generer et svar der matcher din personlige skrivestil
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Genererer...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generer Svar
                </>
              )}
            </Button>
          </div>
        )}

        {generatedReply && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {isEditing ? "Rediger svar" : "Genereret svar"}
                </label>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Rediger
                  </Button>
                )}
              </div>
              <Textarea
                value={editedReply}
                onChange={(e) => setEditedReply(e.target.value)}
                disabled={!isEditing}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Svar vil blive genereret her..."
              />
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} size="sm">
                  Gem Ændringer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Annuller
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSend}
                disabled={!editedReply.trim()}
                className="flex-1"
              >
                Send Svar
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Regenerer"
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              💡 Tip: Når du redigerer AI-forslaget, lærer systemet din
              skrivestil bedre
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
