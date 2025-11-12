/**
 * BlurView Component
 *
 * Frosted glass effect container
 */

import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";
import { materials } from "../../../styles/apple-design-system";
import styles from "./BlurView.module.css";

export type BlurIntensity = "light" | "medium" | "heavy" | "dark" | "tinted";

export interface BlurViewProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  intensity?: BlurIntensity;
  children: React.ReactNode;
}

export const BlurView = React.forwardRef<HTMLDivElement, BlurViewProps>(
  ({ intensity = "light", children, className = "", style, ...props }, ref) => {
    const glassEffect = materials.getGlassEffect(intensity);

    return (
      <motion.div
        ref={ref}
        className={`${styles.blurView} ${className}`}
        style={{
          ...glassEffect,
          ...style,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

BlurView.displayName = "BlurView";
