/**
 * AppleInput Component
 *
 * iOS-style input with floating label and animations
 */

import { motion } from "framer-motion";
import React, { useState } from "react";
import { animations } from "../../../styles/apple-design-system";
import styles from "./AppleInput.module.css";

export interface AppleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const AppleInput = React.forwardRef<HTMLInputElement, AppleInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(
      !!props.value || !!props.defaultValue
    );

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      onBlur?.(e);
    };

    const showFloatingLabel = isFocused || hasValue;

    return (
      <div
        className={`${styles.container} ${fullWidth ? styles.fullWidth : ""} ${className}`}
      >
        <div
          className={`${styles.inputWrapper} ${isFocused ? styles.focused : ""} ${
            error ? styles.error : ""
          }`}
        >
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}

          <div className={styles.inputContainer}>
            {label && (
              <motion.label
                className={styles.label}
                animate={{
                  y: showFloatingLabel ? -20 : 0,
                  scale: showFloatingLabel ? 0.85 : 1,
                  color: error
                    ? "#FF3B30"
                    : isFocused
                      ? "#007AFF"
                      : "rgba(60, 60, 67, 0.6)",
                }}
                transition={animations.springs.gentle}
              >
                {label}
              </motion.label>
            )}

            <input
              ref={ref}
              className={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...props}
            />
          </div>

          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>

        {/* Error or helper text */}
        {(error || helperText) && (
          <motion.p
            className={error ? styles.errorText : styles.helperText}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={animations.springs.gentle}
          >
            {error || helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

AppleInput.displayName = "AppleInput";
