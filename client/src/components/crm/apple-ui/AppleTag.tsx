/**
 * AppleTag Component
 *
 * Removable tag with spring animation
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import { X } from "lucide-react";
import React from "react";
import { animations, colors } from "../../../styles/apple-design-system";
import styles from "./AppleTag.module.css";

export interface AppleTagProps
  extends Omit<HTMLMotionProps<"span">, "children"> {
  children: React.ReactNode;
  onRemove?: () => void;
  color?: string;
}

// Helper to get dark mode variant of a color
const getDarkModeColor = (lightColor: string): string => {
  const colorMap: Record<string, string> = {
    [colors.systemBlue]: colors.dark.systemBlue,
    [colors.systemGreen]: colors.dark.systemGreen,
    [colors.systemOrange]: colors.dark.systemOrange,
    [colors.systemRed]: colors.dark.systemRed,
    [colors.systemPurple]: colors.dark.systemPurple,
    [colors.systemPink]: colors.dark.systemPink,
    [colors.systemTeal]: colors.dark.systemTeal,
    [colors.systemYellow]: colors.dark.systemYellow,
    [colors.systemGray]: colors.dark.systemGray,
  };
  return colorMap[lightColor] || lightColor;
};

export const AppleTag = React.forwardRef<HTMLSpanElement, AppleTagProps>(
  (
    { children, onRemove, color = "#007AFF", className = "", ...props },
    ref
  ) => {
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

    const activeColor = isDark ? getDarkModeColor(color) : color;

    return (
      <motion.span
        ref={ref}
        className={`${styles.tag} ${className}`}
        style={{
          backgroundColor: `${activeColor}15`,
          color: activeColor,
          borderColor: `${activeColor}30`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={animations.springs.bouncy}
        {...props}
      >
        <span className={styles.label}>{children}</span>

        {onRemove && (
          <motion.button
            className={styles.removeButton}
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
            whileTap={{ scale: 0.9 }}
            transition={animations.springs.snappy}
            aria-label="Remove tag"
          >
            <X size={12} strokeWidth={2.5} />
          </motion.button>
        )}
      </motion.span>
    );
  }
);

AppleTag.displayName = "AppleTag";
