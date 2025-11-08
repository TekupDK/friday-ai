/**
 * ChatInputActions
 * 
 * Reusable action buttons for chat inputs
 * Can be used in different contexts
 */

import { Button } from "@/components/ui/button";
import { 
  Send, 
  Paperclip, 
  Grid3X3,
  Mic,
  StopCircle 
} from "lucide-react";

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  variant?: "button" | "icon";
}

function ActionButton({ 
  icon: Icon, 
  onClick, 
  title, 
  disabled = false,
  variant = "icon"
}: ActionButtonProps) {
  if (variant === "button") {
    return (
      <Button
        data-testid={title === "Send" ? "friday-send-button" : undefined}
        size="sm"
        variant="ghost"
        className="h-7 w-7 rounded-full p-0"
        onClick={onClick}
        disabled={disabled}
      >
        <Icon className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <button 
      data-testid={title === "Stop" ? "friday-stop-button" : undefined}
      className="p-1 hover:bg-muted rounded-md transition-colors disabled:opacity-50" 
      title={title}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  );
}

interface ChatInputActionsProps {
  isStreaming: boolean;
  onSend: () => void;
  onStop: () => void;
  onAttach?: () => void;
  onApps?: () => void;
  onVoice?: () => void;
  hasContent?: boolean; // Add content check for send button
}

export default function ChatInputActions({
  isStreaming,
  onSend,
  onStop,
  onAttach = () => {},
  onApps = () => {},
  onVoice = () => {},
  hasContent = false,
}: ChatInputActionsProps) {
  const leftActions = [
    { icon: Paperclip, onClick: onAttach, title: "Vedhæft fil" },
    { icon: Grid3X3, onClick: onApps, title: "Apps" },
  ];

  const rightActions = [
    { icon: Mic, onClick: onVoice, title: "Stemme input" },
  ];

  return {
    left: leftActions.map((action, i) => (
      <ActionButton key={`left-${i}`} {...action} />
    )),
    right: (
      <>
        {rightActions.map((action, i) => (
          <ActionButton key={`right-${i}`} {...action} />
        ))}
        {isStreaming ? (
          <ActionButton 
            icon={StopCircle} 
            onClick={onStop} 
            title="Stop" 
            variant="button"
          />
        ) : (
          <ActionButton 
            icon={Send} 
            onClick={onSend} 
            title="Send" 
            variant="button"
            disabled={!hasContent} // Only enable if there's content
          />
        )}
      </>
    ),
  };
}