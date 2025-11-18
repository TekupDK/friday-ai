/**
 * EMAIL DRAFT CARD - Shortwave-inspireret
 * Skrive, forbedre og korrekturlæse emails
 */

import { Mail, Send, Edit2, X, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface EmailDraftData {
  to: string;
  cc?: string;
  subject: string;
  body: string;
  aiSuggestions?: string[];
}

interface EmailDraftCardProps {
  data: EmailDraftData;
  onSend?: (draft: EmailDraftData) => void;
  onEdit?: (draft: EmailDraftData) => void;
  onCancel?: () => void;
  onImprove?: () => void;
}

export function EmailDraftCard({
  data: initialData,
  onSend,
  onEdit,
  onCancel,
  onImprove,
}: EmailDraftCardProps) {
  const [data, setData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleEdit = (field: keyof EmailDraftData, value: string) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    onEdit?.(updated);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold">Draft Email</h4>
              <p className="text-xs text-muted-foreground">AI-genereret</p>
            </div>
          </div>
          <Badge variant="secondary">Kladde</Badge>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Til:</label>
            {isEditing ? (
              <Input
                value={data.to}
                onChange={e => handleEdit("to", e.target.value)}
                className="h-9 mt-1"
              />
            ) : (
              <p className="font-medium text-sm mt-1">{data.to}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Emne:</label>
            {isEditing ? (
              <Input
                value={data.subject}
                onChange={e => handleEdit("subject", e.target.value)}
                className="h-9 mt-1"
              />
            ) : (
              <p className="font-semibold text-sm mt-1">{data.subject}</p>
            )}
          </div>

          <div className="border-t pt-3">
            <label className="text-xs text-muted-foreground">Besked:</label>
            {isEditing ? (
              <Textarea
                value={data.body}
                onChange={e => handleEdit("body", e.target.value)}
                className="min-h-[120px] mt-1"
              />
            ) : (
              <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap mt-1">
                {data.body}
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions */}
        {data.aiSuggestions && showSuggestions && (
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold">AI Forslag:</span>
            </div>
            {data.aiSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleEdit("body", s)}
                className="w-full text-left p-2 rounded bg-white dark:bg-slate-900 hover:bg-purple-100 text-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {!isEditing ? (
            <>
              <Button
                onClick={() => onSend?.(data)}
                className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Rediger
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(false)} className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Gem
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Annuller
              </Button>
            </>
          )}
          <Button
            onClick={() => {
              onImprove?.();
              setShowSuggestions(true);
            }}
            variant="ghost"
            size="icon"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
