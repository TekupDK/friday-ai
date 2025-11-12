/**
 * AppleModal Component
 *
 * Center modal with frosted glass backdrop and spring animations
 */

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect } from "react";
import { animations } from "../../../styles/apple-design-system";
import styles from "./AppleModal.module.css";

export interface AppleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
}

export const AppleModal: React.FC<AppleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) => {
  // Lock body scroll when modal is open
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

          {/* Modal */}
          <div className={styles.modalContainer}>
            <motion.div
              className={`${styles.modal} ${styles[size]}`}
              variants={animations.modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className={styles.header}>
                  {title && (
                    <h2 id="modal-title" className={styles.title}>
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <motion.button
                      className={styles.closeButton}
                      onClick={onClose}
                      whileTap={{ scale: 0.9 }}
                      transition={animations.springs.snappy}
                      aria-label="Close modal"
                    >
                      <X size={20} strokeWidth={2.5} />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className={styles.content}>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
