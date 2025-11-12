/**
 * SpringTransition Component
 *
 * Wrapper for spring-based animations
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";
import { animations } from "../../../styles/apple-design-system";

export type SpringType = "gentle" | "bouncy" | "snappy" | "smooth" | "stiff";

export interface SpringTransitionProps extends HTMLMotionProps<"div"> {
  springType?: SpringType;
  children: React.ReactNode;
}

export const SpringTransition = React.forwardRef<
  HTMLDivElement,
  SpringTransitionProps
>(({ springType = "gentle", children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      transition={animations.springs[springType]}
      {...props}
    >
      {children}
    </motion.div>
  );
});

SpringTransition.displayName = "SpringTransition";
