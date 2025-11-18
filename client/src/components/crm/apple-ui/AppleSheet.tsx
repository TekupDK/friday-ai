/**
 * AppleSheet Component
 *
 * Bottom sheet (iOS style) with swipe-to-close gesture support
 */

import {
  AnimatePresence,
  PanInfo,
  motion,
  useDragControls,
} from "framer-motion";
import React, { useEffect } from "react";

import { animations } from "../../../styles/apple-design-system";

import styles from "./AppleSheet.module.css";

export interface AppleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
  showHandle?: boolean;
}

export const AppleSheet: React.FC<AppleSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.5, 0.9],
  showHandle = true,
}) => {
  const dragControls = useDragControls();

  // Lock body scroll when sheet is open
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

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Close if dragged down more than 100px or velocity is high
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
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

          {/* Sheet */}
          <motion.div
            className={styles.sheet}
            variants={animations.sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "sheet-title" : undefined}
          >
            {/* Handle */}
            {showHandle && (
              <div className={styles.handleContainer}>
                <div className={styles.handle} />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className={styles.header}>
                <h2 id="sheet-title" className={styles.title}>
                  {title}
                </h2>
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
