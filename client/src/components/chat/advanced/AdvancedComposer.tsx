/**
 * ADVANCED COMPOSER - ChatGPT-style input med uploads, slash commands, voice
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Send,
  Paperclip,
  Mic,
  Image as ImageIcon,
  FileText,
  Code,
  Search,
  Sparkles,
  StopCircle,
  MoreHorizontal,
} from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: "search" | "code" | "file" | "image" | "sparkles";
}

interface AdvancedComposerProps {
  onSend?: (message: string, attachments?: File[]) => void;
  onStop?: () => void;
  isGenerating?: boolean;
  placeholder?: string;
  showSlashCommands?: boolean;
}

const DEFAULT_COMMANDS: SlashCommand[] = [
  {
    id: "search",
    label: "/search",
    description: "Søg på nettet",
    icon: "search",
  },
  {
    id: "analyze",
    label: "/analyze",
    description: "Analyser data",
    icon: "code",
  },
  { id: "file", label: "/file", description: "Upload fil", icon: "file" },
  {
    id: "image",
    label: "/image",
    description: "Generer billede",
    icon: "image",
  },
  { id: "ai", label: "/ai", description: "AI assistance", icon: "sparkles" },
];

export function AdvancedComposer({
  onSend,
  onStop,
  isGenerating = false,
  placeholder = "Send en besked til Friday AI...",
  showSlashCommands = true,
}: AdvancedComposerProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCommands, setShowCommands] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    if (e.key === "/" && message === "") {
      setShowCommands(true);
    }

    if (e.key === "Escape") {
      setShowCommands(false);
    }
  };

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend?.(message, attachments);
      setMessage("");
      setAttachments([]);
      setShowCommands(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCommandSelect = (command: SlashCommand) => {
    setMessage(command.label + " ");
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  const getCommandIcon = (icon: SlashCommand["icon"]) => {
    switch (icon) {
      case "search":
        return Search;
      case "code":
        return Code;
      case "file":
        return FileText;
      case "image":
        return ImageIcon;
      case "sparkles":
        return Sparkles;
      default:
        return Sparkles;
    }
  };

  return (
    <Card className="p-4 space-y-3">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <FileText className="w-3 h-3" />
              <span className="text-xs">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Slash Commands Dropdown */}
      {showCommands && showSlashCommands && (
        <Card className="absolute bottom-full mb-2 w-full max-w-md p-2 shadow-lg">
          <div className="space-y-1">
            {DEFAULT_COMMANDS.map(cmd => {
              const Icon = getCommandIcon(cmd.icon);
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleCommandSelect(cmd)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cmd.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {cmd.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="min-h-[44px] max-h-[200px] resize-none pr-12"
            disabled={isGenerating}
          />
          {message && (
            <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
              {message.length}
            </div>
          )}
        </div>

        {isGenerating ? (
          <Button
            size="icon"
            variant="destructive"
            onClick={onStop}
            className="shrink-0"
          >
            <StopCircle className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() && attachments.length === 0}
            className="shrink-0 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
          >
            <Paperclip className="w-4 h-4 mr-1" />
            Vedhæft
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsRecording(!isRecording)}
            disabled={isGenerating}
            className={cn(isRecording && "text-red-600")}
          >
            <Mic className="w-4 h-4 mr-1" />
            {isRecording ? "Stop" : "Voice"}
          </Button>
          <Button size="sm" variant="ghost" disabled={isGenerating}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Friday AI 4.0
          </Badge>
        </div>
      </div>
    </Card>
  );
}
