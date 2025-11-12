/**
 * ChatInputField
 *
 * Pure UI component - no logic, just rendering
 * Reusable across different chat contexts
 */

import React, { forwardRef } from "react";

interface ChatInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  leftIcons: React.ReactNode;
  rightIcons: React.ReactNode;
}

const ChatInputField = forwardRef<HTMLInputElement, ChatInputFieldProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      placeholder = "Skriv en besked...",
      disabled = false,
      leftIcons,
      rightIcons,
    },
    ref
  ) => {
    return (
      <div
        data-testid="friday-chat-input-wrapper"
        className="bg-muted/50 rounded-xl px-2 py-2 flex items-center gap-1.5"
      >
        {/* Left side icons */}
        <div
          data-testid="friday-input-left-icons"
          className="flex items-center gap-1"
        >
          {leftIcons}
        </div>

        {/* Text input */}
        <input
          ref={ref}
          data-testid="friday-chat-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-sm placeholder:text-muted-foreground disabled:opacity-50"
        />

        {/* Right side icons */}
        <div
          data-testid="friday-input-right-icons"
          className="flex items-center gap-1"
        >
          {rightIcons}
        </div>
      </div>
    );
  }
);

ChatInputField.displayName = "ChatInputField";

export default ChatInputField;
