/**
 * AppleButton Component
 *
 * Apple-inspired button with spring animations and variants
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";
import { animations } from "../../../styles/apple-design-system";
import styles from "./AppleButton.module.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "sm" | "md" | "lg";

export interface AppleButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const AppleButton = React.forwardRef<
  HTMLButtonElement,
  AppleButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${
          fullWidth ? styles.fullWidth : ""
        } ${disabled || loading ? styles.disabled : ""} ${className}`}
        whileTap={!disabled && !loading ? { scale: 0.95 } : undefined}
        transition={animations.springs.snappy}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {/* Ripple effect container */}
        <span className={styles.rippleContainer} />

        {/* Button content */}
        <span className={styles.content}>
          {loading ? (
            <Loader2
              className={styles.spinner}
              size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
            />
          ) : leftIcon ? (
            <span className={styles.icon}>{leftIcon}</span>
          ) : null}

          <span className={styles.label}>{children}</span>

          {rightIcon && !loading && (
            <span className={styles.icon}>{rightIcon}</span>
          )}
        </span>
      </motion.button>
    );
  }
);

AppleButton.displayName = "AppleButton";
