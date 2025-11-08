/**
 * useDebounce Hook
 * 
 * Debounces a value to avoid excessive updates.
 * Perfect for search inputs, API calls, and performance optimization.
 */

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Debounce value with setTimeout cleanup

  return debouncedValue;
}
