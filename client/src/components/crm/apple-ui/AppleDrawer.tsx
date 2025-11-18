/**
 * AppleDrawer Component
 *
 * Side drawer with frosted glass backdrop and spring slide-in animation
 */

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect } from "react";

import { animations } from "../../../styles/apple-design-system";

import styles from "./AppleDrawer.module.css";

export interface AppleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  width?: number;
  showCloseButton?: boolean;
}

export const AppleDrawer: React.FC<AppleDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  width = 840,
  showCloseButton = true,
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const drawerVariants = {
    hidden: { x: side === "right" ? "100%" : "-100%" },
    visible: {
      x: 0,
      transition: animations.springs.smooth,
    },
    exit: {
      x: side === "right" ? "100%" : "-100%",
      transition: animations.springs.snappy,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            variants={animations.backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className={`${styles.drawer} ${styles[side]}`}
            style={{ width: `${width}px`, maxWidth: "100vw" }}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "drawer-title" : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={styles.header}>
                {title && (
                  <h2 id="drawer-title" className={styles.title}>
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <motion.button
                    className={styles.closeButton}
                    onClick={onClose}
                    whileTap={{ scale: 0.9 }}
                    transition={animations.springs.snappy}
                    aria-label="Close drawer"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={styles.content}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
