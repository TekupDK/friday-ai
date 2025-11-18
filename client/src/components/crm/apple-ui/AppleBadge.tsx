/**
 * AppleBadge Component
 *
 * Status badge with Apple system colors
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

import { animations, colors } from "../../../styles/apple-design-system";

import styles from "./AppleBadge.module.css";

export type BadgeStatus =
  | "new"
  | "active"
  | "inactive"
  | "vip"
  | "at_risk"
  | "planned"
  | "in_progress"
  | "completed"
  | "cancelled";
export type BadgeSize = "sm" | "md" | "lg";

export interface AppleBadgeProps
  extends Omit<HTMLMotionProps<"span">, "children"> {
  status: BadgeStatus;
  size?: BadgeSize;
  children?: React.ReactNode;
}

// Status color mapping
const statusColorMap = {
  new: { light: colors.systemBlue, dark: colors.dark.systemBlue },
  active: { light: colors.systemGreen, dark: colors.dark.systemGreen },
  inactive: { light: colors.systemGray, dark: colors.dark.systemGray },
  vip: { light: colors.systemYellow, dark: colors.dark.systemYellow },
  at_risk: { light: colors.systemRed, dark: colors.dark.systemRed },
  planned: { light: colors.systemBlue, dark: colors.dark.systemBlue },
  in_progress: { light: colors.systemOrange, dark: colors.dark.systemOrange },
  completed: { light: colors.systemGreen, dark: colors.dark.systemGreen },
  cancelled: { light: colors.systemGray, dark: colors.dark.systemGray },
} as const;

export const AppleBadge = React.forwardRef<HTMLSpanElement, AppleBadgeProps>(
  ({ status, size = "md", children, className = "", ...props }, ref) => {
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
      // Check current theme
      const checkTheme = () => {
        const theme = document.documentElement.getAttribute("data-theme");
        if (theme === "dark") {
          setIsDark(true);
        } else if (theme === "light") {
          setIsDark(false);
        } else {
          // Fallback to system preference
          setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
      };

      checkTheme();

      // Listen for theme changes
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      // Listen for system preference changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => {
        if (!document.documentElement.getAttribute("data-theme")) {
          setIsDark(mediaQuery.matches);
        }
      };
      mediaQuery.addEventListener("change", listener);

      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener("change", listener);
      };
    }, []);

    const statusColor = isDark
      ? statusColorMap[status].dark
      : statusColorMap[status].light;

    return (
      <motion.span
        ref={ref}
        className={`${styles.badge} ${styles[size]} ${className}`}
        style={{
          backgroundColor: `${statusColor}15`,
          color: statusColor,
          borderColor: `${statusColor}30`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={animations.springs.bouncy}
        {...props}
      >
        {children || status}
      </motion.span>
    );
  }
);

AppleBadge.displayName = "AppleBadge";
