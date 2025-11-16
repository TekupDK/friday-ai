/**
 * useSmoothScroll Hook
 *
 * Setup Lenis smooth scrolling
 */

import Lenis from "lenis";
import { useEffect, useRef } from "react";

export interface SmoothScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  smooth?: boolean;
  smoothTouch?: boolean;
}

export const useSmoothScroll = (options: SmoothScrollOptions = {}) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: options.duration || 1.2,
      easing:
        options.easing || (t => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      smooth: options.smooth !== false,
      smoothTouch: options.smoothTouch || false,
      touchMultiplier: 2,
    } as any);

    lenisRef.current = lenis;

    // Animation loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, [options.duration, options.easing, options.smooth, options.smoothTouch]);

  const scrollTo = (target: string | number | HTMLElement, options?: any) => {
    lenisRef.current?.scrollTo(target, options);
  };

  const scrollToTop = () => {
    lenisRef.current?.scrollTo(0, { duration: 1 });
  };

  return {
    lenis: lenisRef.current,
    scrollTo,
    scrollToTop,
  };
};
