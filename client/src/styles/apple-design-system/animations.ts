/**
 * Apple Design System - Animation System
 *
 * Spring-based animations following iOS/macOS motion design
 */

// ============================================================================
// SPRING CONFIGURATIONS - iOS/macOS Style
// ============================================================================

export const springs = {
  // Gentle spring (default iOS animations)
  gentle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },

  // Bouncy spring (playful interactions)
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 1,
  },

  // Snappy spring (quick responses)
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.8,
  },

  // Smooth spring (fluid transitions)
  smooth: {
    type: "spring" as const,
    stiffness: 200,
    damping: 25,
    mass: 1.2,
  },

  // Stiff spring (immediate feedback)
  stiff: {
    type: "spring" as const,
    stiffness: 600,
    damping: 40,
    mass: 0.6,
  },
} as const;

// ============================================================================
// EASING CURVES - Apple Standard
// ============================================================================

export const easings = {
  // Standard iOS easing
  standard: [0.4, 0.0, 0.2, 1],

  // Deceleration (ease-out)
  decelerate: [0.0, 0.0, 0.2, 1],

  // Acceleration (ease-in)
  accelerate: [0.4, 0.0, 1, 1],

  // Sharp (quick in/out)
  sharp: [0.4, 0.0, 0.6, 1],

  // Emphasized (material design inspired)
  emphasized: [0.4, 0.0, 0.2, 1],
} as const;

// ============================================================================
// DURATION SCALE
// ============================================================================

export const durations = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 700,
} as const;

// ============================================================================
// ANIMATION VARIANTS - Framer Motion
// ============================================================================

// Fade animations
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide animations
export const slideVariants = {
  fromRight: {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fromLeft: {
    hidden: { x: "-100%", opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  fromTop: {
    hidden: { y: "-100%", opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  fromBottom: {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
};

// Scale animations
export const scaleVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  tap: { scale: 0.95 },
  hover: { scale: 1.02 },
};

// Lift animations (cards)
export const liftVariants = {
  initial: { y: 0, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" },
  hover: { y: -4, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)" },
  tap: { y: 0, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)" },
};

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Stagger item animation
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
};

// ============================================================================
// GESTURE ANIMATIONS
// ============================================================================

// Button press animation
export const buttonPress = {
  whileTap: { scale: 0.95 },
  transition: springs.snappy,
};

// Card press animation
export const cardPress = {
  whileTap: { scale: 0.98 },
  transition: springs.gentle,
};

// Icon press animation
export const iconPress = {
  whileTap: { scale: 0.9 },
  transition: springs.bouncy,
};

// ============================================================================
// MODAL/DRAWER ANIMATIONS
// ============================================================================

// Modal animations (center)
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: springs.snappy,
  },
};

// Backdrop animations
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Drawer animations (side)
export const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: springs.smooth,
  },
  exit: {
    x: "100%",
    transition: springs.snappy,
  },
};

// Sheet animations (bottom)
export const sheetVariants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    y: "100%",
    transition: springs.snappy,
  },
};

// ============================================================================
// SCROLL ANIMATIONS - GSAP ScrollTrigger
// ============================================================================

export const scrollAnimations = {
  // Fade in on scroll
  fadeIn: {
    opacity: 0,
    y: 30,
    scrollTrigger: {
      trigger: "element",
      start: "top 80%",
      end: "top 50%",
      scrub: 1,
    },
  },

  // Parallax effect
  parallax: {
    y: (i: number) => i * 50,
    scrollTrigger: {
      trigger: "element",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  },

  // Scale on scroll
  scaleIn: {
    scale: 0.8,
    opacity: 0,
    scrollTrigger: {
      trigger: "element",
      start: "top 80%",
      end: "top 50%",
      scrub: 1,
    },
  },
};

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

// Spinner animation
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Pulse animation
export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Shimmer animation (loading skeleton)
export const shimmerVariants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ============================================================================
// NOTIFICATION ANIMATIONS
// ============================================================================

// Toast notification
export const toastVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: springs.bouncy,
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: springs.snappy,
  },
};

// Badge scale-in
export const badgeVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: springs.bouncy,
  },
};

// ============================================================================
// SHAKE ANIMATION (Error States)
// ============================================================================

export const shakeVariants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// EXPORT ALL ANIMATIONS
// ============================================================================

export const animations = {
  springs,
  easings,
  durations,
  fadeVariants,
  slideVariants,
  scaleVariants,
  liftVariants,
  staggerContainer,
  staggerItem,
  buttonPress,
  cardPress,
  iconPress,
  modalVariants,
  backdropVariants,
  drawerVariants,
  sheetVariants,
  scrollAnimations,
  spinnerVariants,
  pulseVariants,
  shimmerVariants,
  toastVariants,
  badgeVariants,
  shakeVariants,
} as const;

export default animations;
