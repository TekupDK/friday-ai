/**
 * useChatInput Hook
 * 
 * Extract ALL logic from UI component
 * Reusable, testable, pure logic
 */

import { useRef, useCallback } from "react";

export function useChatInput(props: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      props.onSend();
    }
  }, [props.onSend]);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return {
    inputRef,
    handleKeyDown,
    focus,
  };
}