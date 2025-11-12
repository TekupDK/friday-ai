/**
 * Apple Design System - Material Effects
 *
 * Frosted glass (backdrop-filter) and vibrancy effects
 */

// ============================================================================
// FROSTED GLASS EFFECTS - iOS/macOS Style
// ============================================================================

export const glassEffects = {
  // Light glass (default)
  light: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  },

  // Medium glass
  medium: {
    background: "rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(30px) saturate(180%)",
    WebkitBackdropFilter: "blur(30px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  },

  // Heavy glass
  heavy: {
    background: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(40px) saturate(200%)",
    WebkitBackdropFilter: "blur(40px) saturate(200%)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  },

  // Dark glass
  dark: {
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(30px) saturate(180%)",
    WebkitBackdropFilter: "blur(30px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },

  // Tinted glass (blue)
  tinted: {
    background: "rgba(0, 122, 255, 0.15)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(0, 122, 255, 0.2)",
  },
} as const;

// ============================================================================
// VIBRANCY EFFECTS
// ============================================================================

export const vibrancyEffects = {
  // Light vibrancy
  light: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px) brightness(1.1)",
    WebkitBackdropFilter: "blur(10px) brightness(1.1)",
  },

  // Dark vibrancy
  dark: {
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(10px) brightness(0.9)",
    WebkitBackdropFilter: "blur(10px) brightness(0.9)",
  },

  // Ultra-thin material
  ultraThin: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(5px)",
    WebkitBackdropFilter: "blur(5px)",
  },

  // Thick material
  thick: {
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(50px) saturate(200%)",
    WebkitBackdropFilter: "blur(50px) saturate(200%)",
  },
} as const;

// ============================================================================
// BACKDROP STYLES - Component Specific
// ============================================================================

export const backdropStyles = {
  // Modal backdrop
  modal: {
    background: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  },

  // Drawer backdrop
  drawer: {
    background: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  },

  // Sheet backdrop
  sheet: {
    background: "rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  },

  // Popover backdrop
  popover: {
    background: "rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
  },
} as const;

// ============================================================================
// CARD MATERIALS
// ============================================================================

export const cardMaterials = {
  // Elevated card (shadow)
  elevated: {
    background: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: "none",
  },

  // Filled card (solid)
  filled: {
    background: "#F2F2F7",
    boxShadow: "none",
    border: "none",
  },

  // Glass card (frosted)
  glass: {
    ...glassEffects.light,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  // Outlined card
  outlined: {
    background: "transparent",
    boxShadow: "none",
    border: "1px solid rgba(0, 0, 0, 0.1)",
  },

  // Dark mode variants
  dark: {
    elevated: {
      background: "#1C1C1E",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
      border: "none",
    },
    filled: {
      background: "#2C2C2E",
      boxShadow: "none",
      border: "none",
    },
    glass: {
      ...glassEffects.dark,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    },
    outlined: {
      background: "transparent",
      boxShadow: "none",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
  },
} as const;

// ============================================================================
// BUTTON MATERIALS
// ============================================================================

export const buttonMaterials = {
  // Primary button (filled)
  primary: {
    background: "#007AFF",
    color: "#FFFFFF",
    border: "none",
    boxShadow: "0 1px 3px rgba(0, 122, 255, 0.3)",
  },

  // Secondary button (outline)
  secondary: {
    background: "transparent",
    color: "#007AFF",
    border: "1px solid #007AFF",
    boxShadow: "none",
  },

  // Tertiary button (text)
  tertiary: {
    background: "transparent",
    color: "#007AFF",
    border: "none",
    boxShadow: "none",
  },

  // Glass button
  glass: {
    ...glassEffects.light,
    color: "#000000",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },

  // Dark mode variants
  dark: {
    primary: {
      background: "#0A84FF",
      color: "#FFFFFF",
      border: "none",
      boxShadow: "0 1px 3px rgba(10, 132, 255, 0.4)",
    },
    secondary: {
      background: "transparent",
      color: "#0A84FF",
      border: "1px solid #0A84FF",
      boxShadow: "none",
    },
    tertiary: {
      background: "transparent",
      color: "#0A84FF",
      border: "none",
      boxShadow: "none",
    },
    glass: {
      ...glassEffects.dark,
      color: "#FFFFFF",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
    },
  },
} as const;

// ============================================================================
// BROWSER COMPATIBILITY FALLBACKS
// ============================================================================

/**
 * Check if backdrop-filter is supported
 */
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    CSS.supports("backdrop-filter", "blur(1px)") ||
    CSS.supports("-webkit-backdrop-filter", "blur(1px)")
  );
};

/**
 * Get glass effect with fallback
 */
export const getGlassEffect = (
  effect: keyof typeof glassEffects = "light"
): React.CSSProperties => {
  const glassStyle = glassEffects[effect];

  if (!supportsBackdropFilter()) {
    // Fallback for browsers without backdrop-filter support
    return {
      background:
        effect === "dark" ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.95)",
      border: glassStyle.border,
    };
  }

  return glassStyle as React.CSSProperties;
};

/**
 * Get backdrop style with fallback
 */
export const getBackdropStyle = (
  type: keyof typeof backdropStyles
): React.CSSProperties => {
  const backdropStyle = backdropStyles[type];

  if (!supportsBackdropFilter()) {
    // Fallback for browsers without backdrop-filter support
    return {
      background: backdropStyle.background,
    };
  }

  return backdropStyle as React.CSSProperties;
};

// ============================================================================
// GRADIENT MATERIALS
// ============================================================================

export const gradients = {
  // iOS-style gradients
  blue: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
  green: "linear-gradient(135deg, #34C759 0%, #30D158 100%)",
  purple: "linear-gradient(135deg, #AF52DE 0%, #BF5AF2 100%)",
  orange: "linear-gradient(135deg, #FF9500 0%, #FF9F0A 100%)",
  pink: "linear-gradient(135deg, #FF2D55 0%, #FF375F 100%)",

  // Subtle gradients
  subtle:
    "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.05) 100%)",
  subtleDark:
    "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)",

  // Mesh gradients (modern Apple style)
  mesh: "radial-gradient(at 40% 20%, #007AFF 0px, transparent 50%), radial-gradient(at 80% 0%, #5856D6 0px, transparent 50%), radial-gradient(at 0% 50%, #34C759 0px, transparent 50%)",
} as const;

// ============================================================================
// EXPORT ALL MATERIALS
// ============================================================================

export const materials = {
  glassEffects,
  vibrancyEffects,
  backdropStyles,
  cardMaterials,
  buttonMaterials,
  gradients,
  supportsBackdropFilter,
  getGlassEffect,
  getBackdropStyle,
} as const;

export default materials;
