/**
 * ChatInput Types
 * 
 * Clean type definitions - no UI, no logic
 */

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
  onStop: () => void;
  placeholder?: string;
}

export interface ChatInputAction {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}

export interface ChatInputConfig {
  placeholder: string;
  model: {
    mode: string;
    name: string;
  };
}