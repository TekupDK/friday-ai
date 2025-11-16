/**
 * usePerformanceTier Hook
 *
 * Detect device performance tier for adaptive rendering
 */

import { useEffect, useState } from "react";

export type PerformanceTier = "high" | "medium" | "low";

export interface PerformanceInfo {
  tier: PerformanceTier;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connectionType?: string;
}

export const usePerformanceTier = (): PerformanceInfo => {
  const [performanceInfo, setPerformanceInfo] = useState<PerformanceInfo>({
    tier: "medium",
  });

  useEffect(() => {
    const navAny =
      typeof navigator !== "undefined" ? (navigator as any) : undefined;
    const deviceMemory: number | undefined = navAny?.deviceMemory;
    const hardwareConcurrency: number | undefined = (
      typeof navigator !== "undefined"
        ? navigator.hardwareConcurrency
        : undefined
    ) as number | undefined;
    const connection =
      navAny?.connection || navAny?.mozConnection || navAny?.webkitConnection;
    const connectionType = connection?.effectiveType;

    let tier: PerformanceTier = "medium";

    // High-end device detection
    if (
      (deviceMemory && deviceMemory >= 8) ||
      (hardwareConcurrency && hardwareConcurrency >= 8)
    ) {
      tier = "high";
    }
    // Low-end device detection
    else if (
      (deviceMemory && deviceMemory < 4) ||
      (hardwareConcurrency && hardwareConcurrency < 4) ||
      connectionType === "slow-2g" ||
      connectionType === "2g"
    ) {
      tier = "low";
    }

    setPerformanceInfo({
      tier,
      deviceMemory,
      hardwareConcurrency,
      connectionType,
    });
  }, []);

  return performanceInfo;
};
