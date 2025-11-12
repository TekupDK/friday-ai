/**
 * AppleIcon Component
 *
 * Wrapper for Lucide icons with SF Symbols styling
 */

import { LucideIcon, LucideProps } from "lucide-react";
import React from "react";
import { iconConfig, iconSizes } from "../../../styles/apple-design-system";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface AppleIconProps extends Omit<LucideProps, "size"> {
  icon: LucideIcon;
  size?: IconSize;
}

export const AppleIcon: React.FC<AppleIconProps> = ({
  icon: Icon,
  size = "md",
  strokeWidth,
  ...props
}) => {
  return (
    <Icon
      size={iconSizes[size]}
      strokeWidth={strokeWidth || iconConfig.strokeWidth}
      strokeLinecap={iconConfig.strokeLinecap}
      strokeLinejoin={iconConfig.strokeLinejoin}
      {...props}
    />
  );
};

// Export commonly used icons with Apple styling
export { AppleIcon as default };
