/**
 * useFeatureDetection Hook
 *
 * Detect browser feature support
 */

import { useEffect, useState } from "react";

export interface FeatureSupport {
  backdropFilter: boolean;
  webGL: boolean;
  touchEvents: boolean;
  reducedMotion: boolean;
  darkMode: boolean;
}

export const useFeatureDetection = (): FeatureSupport => {
  const [features, setFeatures] = useState<FeatureSupport>({
    backdropFilter: false,
    webGL: false,
    touchEvents: false,
    reducedMotion: false,
    darkMode: false,
  });

  useEffect(() => {
    // Detect backdrop-filter support
    const supportsBackdropFilter =
      CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)");

    // Detect WebGL support
    const canvas = document.createElement("canvas");
    const supportsWebGL = !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );

    // Detect touch events
    const supportsTouchEvents =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Detect dark mode preference
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    setFeatures({
      backdropFilter: supportsBackdropFilter,
      webGL: supportsWebGL,
      touchEvents: supportsTouchEvents,
      reducedMotion: prefersReducedMotion,
      darkMode: prefersDarkMode,
    });
  }, []);

  return features;
};
