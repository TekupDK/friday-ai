/**
 * useAdaptiveRendering Hook
 *
 * Adaptive rendering based on device performance
 */

import { useFeatureDetection } from "./useFeatureDetection";
import { usePerformanceTier } from "./usePerformanceTier";

export interface AdaptiveSettings {
  enableAnimations: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  enableParallax: boolean;
  imageQuality: "high" | "medium" | "low";
  maxListItems: number;
}

export const useAdaptiveRendering = (): AdaptiveSettings => {
  const { tier } = usePerformanceTier();
  const { backdropFilter, reducedMotion } = useFeatureDetection();

  // High-end devices: all features enabled
  if (tier === "high" && !reducedMotion) {
    return {
      enableAnimations: true,
      enableBlur: backdropFilter,
      enableShadows: true,
      enableParallax: true,
      imageQuality: "high",
      maxListItems: 100,
    };
  }

  // Low-end devices: minimal features
  if (tier === "low" || reducedMotion) {
    return {
      enableAnimations: false,
      enableBlur: false,
      enableShadows: false,
      enableParallax: false,
      imageQuality: "low",
      maxListItems: 20,
    };
  }

  // Medium-tier devices: balanced features
  return {
    enableAnimations: !reducedMotion,
    enableBlur: backdropFilter && !reducedMotion,
    enableShadows: true,
    enableParallax: false,
    imageQuality: "medium",
    maxListItems: 50,
  };
};
