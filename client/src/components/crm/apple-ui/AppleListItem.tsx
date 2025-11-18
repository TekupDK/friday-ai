/**
 * AppleListItem Component
 *
 * iOS-style list item with chevron indicator
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import { ChevronRight } from "lucide-react";
import React from "react";

import { animations } from "../../../styles/apple-design-system";

import styles from "./AppleListItem.module.css";

export interface AppleListItemProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  showSeparator?: boolean;
  onClick?: () => void;
}

export const AppleListItem = React.forwardRef<
  HTMLDivElement,
  AppleListItemProps
>(
  (
    {
      title,
      subtitle,
      leftIcon,
      rightContent,
      showChevron = false,
      showSeparator = true,
      onClick,
      className = "",
      ...props
    },
    ref
  ) => {
    const isClickable = !!onClick;

    return (
      <motion.div
        ref={ref}
        className={`${styles.listItem} ${isClickable ? styles.clickable : ""} ${
          showSeparator ? styles.separator : ""
        } ${className}`}
        onClick={onClick}
        whileTap={
          isClickable
            ? { scale: 0.98, backgroundColor: "rgba(0, 0, 0, 0.05)" }
            : undefined
        }
        transition={animations.springs.snappy}
        {...props}
      >
        {/* Left Icon */}
        {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>

        {/* Right Content */}
        {rightContent && (
          <div className={styles.rightContent}>{rightContent}</div>
        )}

        {/* Chevron */}
        {showChevron && (
          <ChevronRight
            className={styles.chevron}
            size={20}
            strokeWidth={2.5}
          />
        )}
      </motion.div>
    );
  }
);

AppleListItem.displayName = "AppleListItem";
