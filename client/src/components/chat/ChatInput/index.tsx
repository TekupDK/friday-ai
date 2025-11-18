/**
 * ChatInput - Main Component
 *
 * Clean, modular, 30 lines max
 * Composition over inheritance
 */

import type { ChatInputProps } from "./ChatInput.types";
import ChatInputActions from "./ChatInputActions";
import ChatInputField from "./ChatInputField";

import { AI_CONFIG } from "@/config/ai-config";
import { useChatInput } from "@/hooks/useChatInput";

export default function ChatInput(props: ChatInputProps) {
  const { inputRef, handleKeyDown } = useChatInput({
    value: props.value,
    onChange: props.onChange,
    onSend: props.onSend,
  });

  const { left, right } = ChatInputActions({
    isStreaming: props.isStreaming,
    onSend: props.onSend,
    onStop: props.onStop,
    hasContent: props.value.trim().length > 0, // Enable send only with content
  });

  return (
    <div
      data-testid="friday-chat-input-container"
      className="border-t border-border/20 p-3"
    >
      <div className="w-full">
        <ChatInputField
          ref={inputRef}
          value={props.value}
          onChange={props.onChange}
          onKeyDown={handleKeyDown}
          placeholder={props.placeholder}
          disabled={props.isStreaming}
          leftIcons={left}
          rightIcons={right}
        />

        <div
          data-testid="friday-model-info"
          className="mt-2 text-[10px] text-muted-foreground text-center truncate"
        >
          {AI_CONFIG.getModelDisplay()}
        </div>
      </div>
    </div>
  );
}
