/**
 * STREAMING MESSAGE - ChatGPT-style streaming response med typing animation
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Copy,
  RotateCcw,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Sparkles,
  User,
  CheckCheck,
} from "lucide-react";
import { useState, useEffect } from "react";

export interface StreamingMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  showTools?: boolean;
  sources?: Array<{ title: string; url: string }>;
  model?: string;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onShare?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
}

export function StreamingMessage({
  role,
  content,
  isStreaming = false,
  showTools = true,
  sources = [],
  model,
  onCopy,
  onRegenerate,
  onShare,
  onLike,
  onDislike,
}: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    if (isStreaming) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < content.length) {
          setDisplayedContent(content.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(content);
    }
  }, [content, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    setLiked(liked === "like" ? null : "like");
    onLike?.();
  };

  const handleDislike = () => {
    setLiked(liked === "dislike" ? null : "dislike");
    onDislike?.();
  };

  if (role === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <Card className="p-4 max-w-[80%] bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 space-y-2">
        <Card className="p-4">
          {model && (
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <Badge variant="outline" className="text-xs">
                {model}
              </Badge>
              {isStreaming && (
                <Badge className="bg-blue-600 text-xs animate-pulse">
                  Generating...
                </Badge>
              )}
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {displayedContent}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
              )}
            </p>
          </div>

          {sources.length > 0 && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Sources:
              </p>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {i + 1}. {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        {showTools && !isStreaming && (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <CheckCheck className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLike}
              className={cn("h-8 px-2", liked === "like" && "text-emerald-600")}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDislike}
              className={cn("h-8 px-2", liked === "dislike" && "text-red-600")}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onRegenerate}
              className="h-8 px-2"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onShare}
              className="h-8 px-2"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 px-2">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
