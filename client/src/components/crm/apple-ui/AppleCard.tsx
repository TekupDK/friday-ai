/**
 * AppleCard Component
 *
 * Apple-inspired card with variants and hover animations
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

import { animations } from "../../../styles/apple-design-system";

import styles from "./AppleCard.module.css";

export type CardVariant = "elevated" | "filled" | "glass" | "outlined";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface AppleCardProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  pressable?: boolean;
  children: React.ReactNode;
}

export const AppleCard = React.forwardRef<HTMLDivElement, AppleCardProps>(
  (
    {
      variant = "elevated",
      padding = "md",
      hoverable = false,
      pressable = false,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const hoverAnimation = hoverable
      ? {
          y: -4,
          boxShadow:
            variant === "elevated"
              ? "0 8px 24px rgba(0, 0, 0, 0.15)"
              : undefined,
        }
      : undefined;

    const tapAnimation = pressable ? { scale: 0.98 } : undefined;

    return (
      <motion.div
        ref={ref}
        className={`${styles.card} ${styles[variant]} ${styles[`padding-${padding}`]} ${className}`}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        transition={animations.springs.gentle}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AppleCard.displayName = "AppleCard";
