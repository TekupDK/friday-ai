/**
 * AppleSearchField Component
 *
 * iOS-style search field with clear button
 */

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import React, { useState } from "react";

import { animations } from "../../../styles/apple-design-system";

import styles from "./AppleSearchField.module.css";

export interface AppleSearchFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  onClear?: () => void;
  fullWidth?: boolean;
}

export const AppleSearchField = React.forwardRef<
  HTMLInputElement,
  AppleSearchFieldProps
>(
  (
    {
      value,
      onChange,
      onClear,
      fullWidth = false,
      className = "",
      placeholder = "Search",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(value || "");

    const currentValue = value !== undefined ? value : internalValue;
    const showClearButton = !!currentValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue("");
      }
      onClear?.();

      // Create synthetic event for onChange
      if (onChange && ref && "current" in ref && ref.current) {
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: ref.current,
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div
        className={`${styles.container} ${fullWidth ? styles.fullWidth : ""} ${className}`}
      >
        <div
          className={`${styles.searchWrapper} ${isFocused ? styles.focused : ""}`}
        >
          <Search className={styles.searchIcon} size={16} strokeWidth={2.5} />

          <input
            ref={ref}
            className={styles.input}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            {...props}
          />

          <AnimatePresence>
            {showClearButton && (
              <motion.button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={animations.springs.bouncy}
                whileTap={{ scale: 0.9 }}
                aria-label="Clear search"
              >
                <X size={14} strokeWidth={2.5} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
);

AppleSearchField.displayName = "AppleSearchField";
