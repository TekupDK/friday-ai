/**
 * ScrollToTop Component
 *
 * iOS-style scroll-to-top button
 */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { animations } from "../../../styles/apple-design-system";
import styles from "./ScrollToTop.module.css";

export interface ScrollToTopProps {
  threshold?: number;
  onScrollToTop?: () => void;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 300,
  onScrollToTop,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  const handleClick = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className={styles.button}
          onClick={handleClick}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={animations.springs.bouncy}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
