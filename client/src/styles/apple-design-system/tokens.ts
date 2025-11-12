/**
 * Apple Design System - Design Tokens
 *
 * Complete design token system following Apple's Human Interface Guidelines
 */

// ============================================================================
// COLORS - Apple System Colors
// ============================================================================

export const colors = {
  // System colors (light mode)
  systemBlue: "#007AFF",
  systemGreen: "#34C759",
  systemIndigo: "#5856D6",
  systemOrange: "#FF9500",
  systemPink: "#FF2D55",
  systemPurple: "#AF52DE",
  systemRed: "#FF3B30",
  systemTeal: "#5AC8FA",
  systemYellow: "#FFCC00",

  // Gray scale
  systemGray: "#8E8E93",
  systemGray2: "#AEAEB2",
  systemGray3: "#C7C7CC",
  systemGray4: "#D1D1D6",
  systemGray5: "#E5E5EA",
  systemGray6: "#F2F2F7",

  // Label colors
  label: "#000000",
  secondaryLabel: "rgba(60, 60, 67, 0.6)",
  tertiaryLabel: "rgba(60, 60, 67, 0.3)",
  quaternaryLabel: "rgba(60, 60, 67, 0.18)",

  // Fill colors
  systemFill: "rgba(120, 120, 128, 0.2)",
  secondarySystemFill: "rgba(120, 120, 128, 0.16)",
  tertiarySystemFill: "rgba(118, 118, 128, 0.12)",
  quaternarySystemFill: "rgba(116, 116, 128, 0.08)",

  // Background colors
  systemBackground: "#FFFFFF",
  secondarySystemBackground: "#F2F2F7",
  tertiarySystemBackground: "#FFFFFF",

  // Grouped background colors
  systemGroupedBackground: "#F2F2F7",
  secondarySystemGroupedBackground: "#FFFFFF",
  tertiarySystemGroupedBackground: "#F2F2F7",

  // Dark mode variants
  dark: {
    systemBlue: "#0A84FF",
    systemGreen: "#30D158",
    systemIndigo: "#5E5CE6",
    systemOrange: "#FF9F0A",
    systemPink: "#FF375F",
    systemPurple: "#BF5AF2",
    systemRed: "#FF453A",
    systemTeal: "#64D2FF",
    systemYellow: "#FFD60A",

    systemGray: "#8E8E93",
    systemGray2: "#636366",
    systemGray3: "#48484A",
    systemGray4: "#3A3A3C",
    systemGray5: "#2C2C2E",
    systemGray6: "#1C1C1E",

    label: "#FFFFFF",
    secondaryLabel: "rgba(235, 235, 245, 0.6)",
    tertiaryLabel: "rgba(235, 235, 245, 0.3)",
    quaternaryLabel: "rgba(235, 235, 245, 0.18)",

    systemBackground: "#000000",
    secondarySystemBackground: "#1C1C1E",
    tertiarySystemBackground: "#2C2C2E",

    systemGroupedBackground: "#000000",
    secondarySystemGroupedBackground: "#1C1C1E",
    tertiarySystemGroupedBackground: "#2C2C2E",
  },
} as const;

// CRM-specific status colors
export const statusColors = {
  new: colors.systemBlue,
  active: colors.systemGreen,
  inactive: colors.systemGray,
  vip: colors.systemYellow,
  at_risk: colors.systemRed,

  // Booking status
  planned: colors.systemBlue,
  in_progress: colors.systemOrange,
  completed: colors.systemGreen,
  cancelled: colors.systemGray,
} as const;

// ============================================================================
// TYPOGRAPHY - San Francisco Inspired
// ============================================================================

export const typography = {
  // Display styles
  largeTitle: {
    fontSize: "34px",
    lineHeight: "41px",
    fontWeight: 700,
    letterSpacing: "-0.4px",
  },
  title1: {
    fontSize: "28px",
    lineHeight: "34px",
    fontWeight: 700,
    letterSpacing: "-0.4px",
  },
  title2: {
    fontSize: "22px",
    lineHeight: "28px",
    fontWeight: 700,
    letterSpacing: "-0.4px",
  },
  title3: {
    fontSize: "20px",
    lineHeight: "25px",
    fontWeight: 600,
    letterSpacing: "-0.4px",
  },

  // Body styles
  headline: {
    fontSize: "17px",
    lineHeight: "22px",
    fontWeight: 600,
    letterSpacing: "-0.4px",
  },
  body: {
    fontSize: "17px",
    lineHeight: "22px",
    fontWeight: 400,
    letterSpacing: "-0.4px",
  },
  callout: {
    fontSize: "16px",
    lineHeight: "21px",
    fontWeight: 400,
    letterSpacing: "-0.3px",
  },
  subheadline: {
    fontSize: "15px",
    lineHeight: "20px",
    fontWeight: 400,
    letterSpacing: "-0.2px",
  },
  footnote: {
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: 400,
    letterSpacing: "-0.1px",
  },
  caption1: {
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: 400,
    letterSpacing: "0px",
  },
  caption2: {
    fontSize: "11px",
    lineHeight: "13px",
    fontWeight: 400,
    letterSpacing: "0.1px",
  },
} as const;

// Font family stack (San Francisco fallback)
export const fontFamily = {
  system: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif`,
  mono: `'SF Mono', 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace`,
} as const;

// ============================================================================
// SPACING - 8pt Grid System
// ============================================================================

export const spacing = {
  0: "0px",
  1: "4px", // 0.25rem
  2: "8px", // 0.5rem
  3: "12px", // 0.75rem
  4: "16px", // 1rem
  5: "20px", // 1.25rem
  6: "24px", // 1.5rem
  8: "32px", // 2rem
  10: "40px", // 2.5rem
  12: "48px", // 3rem
  16: "64px", // 4rem
  20: "80px", // 5rem
  24: "96px", // 6rem
} as const;

// Component-specific spacing
export const componentSpacing = {
  cardPadding: spacing[5], // 20px
  cardGap: spacing[4], // 16px
  sectionGap: spacing[6], // 24px
  listItemPadding: spacing[4], // 16px
  buttonPadding: "12px 20px",
  inputPadding: "10px 16px",
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "18px",
  "2xl": "22px",
  full: "9999px",

  // Component-specific
  card: "16px",
  button: "12px",
  input: "10px",
  badge: "12px",
  modal: "20px",
  sheet: "16px",
} as const;

// ============================================================================
// SHADOWS - Apple Elevation System
// ============================================================================

export const shadows = {
  // Light mode
  sm: "0 1px 3px rgba(0, 0, 0, 0.08)",
  md: "0 2px 8px rgba(0, 0, 0, 0.08)",
  lg: "0 4px 16px rgba(0, 0, 0, 0.12)",
  xl: "0 8px 24px rgba(0, 0, 0, 0.15)",
  "2xl": "0 16px 48px rgba(0, 0, 0, 0.18)",

  // Dark mode
  dark: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.3)",
    md: "0 2px 8px rgba(0, 0, 0, 0.4)",
    lg: "0 4px 16px rgba(0, 0, 0, 0.5)",
    xl: "0 8px 24px rgba(0, 0, 0, 0.6)",
    "2xl": "0 16px 48px rgba(0, 0, 0, 0.7)",
  },

  // Inset shadows (for pressed states)
  inset: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
} as const;

// ============================================================================
// BREAKPOINTS - Responsive Design
// ============================================================================

export const breakpoints = {
  // Mobile
  mobile: 375,
  mobileLarge: 428,

  // Tablet
  tablet: 768,
  tabletLarge: 1024,

  // Desktop
  desktop: 1280,
  desktopLarge: 1440,
  desktopXL: 1920,
} as const;

// Media queries
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.tablet - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,

  // Hover capability
  hover: "@media (hover: hover) and (pointer: fine)",

  // Dark mode
  dark: "@media (prefers-color-scheme: dark)",

  // Reduced motion
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================

export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  "2xl": 32,
} as const;

// Icon configuration (SF Symbols style)
export const iconConfig = {
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const a11y = {
  // Minimum touch target size (iOS standard)
  minTouchTarget: "44px",

  // Minimum contrast ratios (WCAG 2.1 AA)
  contrastRatios: {
    normalText: 4.5,
    largeText: 3,
    uiComponents: 3,
  },

  // Focus ring
  focusRing: {
    outline: `2px solid ${colors.systemBlue}`,
    outlineOffset: "2px",
    borderRadius: borderRadius.sm,
  },
} as const;

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================

export const tokens = {
  colors,
  statusColors,
  typography,
  fontFamily,
  spacing,
  componentSpacing,
  borderRadius,
  shadows,
  breakpoints,
  mediaQueries,
  zIndex,
  iconSizes,
  iconConfig,
  a11y,
} as const;

export default tokens;
