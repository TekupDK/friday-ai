/**
 * ScrollReveal Component
 *
 * Scroll-triggered animations using Intersection Observer
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { animations } from "../../../styles/apple-design-system";

export type RevealAnimation = "fade" | "slideUp" | "slideDown" | "scale";

export interface ScrollRevealProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  animation?: RevealAnimation;
  delay?: number;
  threshold?: number;
  children: React.ReactNode;
}

const animationVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
};

export const ScrollReveal = React.forwardRef<HTMLDivElement, ScrollRevealProps>(
  (
    { animation = "fade", delay = 0, threshold = 0.1, children, ...props },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(element);
          }
        },
        { threshold }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, [threshold]);

    return (
      <motion.div
        ref={node => {
          elementRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        variants={animationVariants[animation]}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        transition={{
          ...animations.springs.gentle,
          delay,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollReveal.displayName = "ScrollReveal";
