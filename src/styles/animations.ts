// ===========================================
// ANIMATION VARIANTS
// Framer Motion animations for AI Creator Platform
// ===========================================

import { Variants, Transition } from 'framer-motion';

/**
 * Page Transitions
 * For route changes and full-page animations
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  enter: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
};

export const pageTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
};

/**
 * Fade Animations
 * Simple opacity transitions
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Scale Animations
 * For popping in/out elements
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export const scaleInCenter: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1 },
};

/**
 * Slide Animations
 * Directional slide in/out
 */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

// Alias for compatibility
export const slideUp = slideInUp;

export const slideInDown: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Card Hover
 * For interactive cards
 */
export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

/**
 * Button Animations
 * For button interactions
 */
export const buttonTap = {
  scale: 0.95,
};

export const buttonHover = {
  scale: 1.05,
  y: -2,
};

/**
 * List Items
 * Staggered animations for lists
 */
export const listContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Modal Animations
 * For dialogs and overlays
 */
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Notification Animations
 * For toast notifications
 */
export const notificationSlideIn: Variants = {
  hidden: { opacity: 0, y: -50, scale: 0.3 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Loading Animations
 * For loading states
 */
export const pulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Skeleton Shimmer
 * For loading skeletons
 */
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Stagger Effect
 * For sequential animations
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Spring Transitions
 * Bouncy animations
 */
export const springTransition: Transition = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
};

export const springBouncy: Transition = {
  type: 'spring',
  damping: 10,
  stiffness: 100,
};

export const springStiff: Transition = {
  type: 'spring',
  damping: 30,
  stiffness: 400,
};

/**
 * Scroll Reveal
 * For elements appearing on scroll
 */
export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

/**
 * Collapse/Expand
 * For collapsible content
 */
export const collapse: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.25,
        delay: 0.1,
      },
    },
  },
};

/**
 * Like/Heart Animation
 * For like buttons
 */
export const likeAnimation: Variants = {
  unlike: {
    scale: 1,
  },
  like: {
    scale: [1, 1.3, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.5, 1],
    },
  },
};

/**
 * Typing Indicator
 * For chat typing animation
 */
export const typingDot: Variants = {
  start: {
    y: 0,
  },
  end: {
    y: -10,
  },
};

export const typingContainer: Transition = {
  repeat: Infinity,
  repeatType: 'reverse',
  duration: 0.6,
};

/**
 * Pull to Refresh
 * For mobile pull-down gesture
 */
export const pullToRefresh: Variants = {
  idle: {
    y: 0,
  },
  pulling: {
    y: 80,
  },
  refreshing: {
    y: 60,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Count Up Animation
 * For animated numbers
 */
export const countUp = (_from: number, _to: number) => ({
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
});

/**
 * Confetti Particle
 * For celebration animations
 */
export const confettiParticle: Variants = {
  initial: {
    y: 0,
    x: 0,
    opacity: 1,
    rotate: 0,
  },
  animate: (custom: number) => ({
    y: [0, -150, -100],
    x: custom,
    opacity: [1, 1, 0],
    rotate: [0, 360],
    transition: {
      duration: 1.5,
      ease: 'easeOut',
    },
  }),
};

/**
 * Default Transition
 */
export const defaultTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
};

/**
 * Animation Presets
 * Commonly used animation configurations
 */
export const animationPresets = {
  // Quick interactions
  quick: {
    duration: 0.15,
    ease: 'easeOut',
  },

  // Standard animations
  standard: {
    duration: 0.3,
    ease: 'easeInOut',
  },

  // Smooth transitions
  smooth: {
    duration: 0.5,
    ease: [0.4, 0.0, 0.2, 1],
  },

  // Bouncy spring
  bouncy: {
    type: 'spring',
    damping: 15,
    stiffness: 200,
  },

  // Stiff spring
  stiff: {
    type: 'spring',
    damping: 25,
    stiffness: 400,
  },
};

/**
 * Viewport Configuration
 * For scroll-triggered animations
 */
export const viewportConfig = {
  once: true,
  margin: '-50px',
  amount: 0.3,
};

export default {
  pageVariants,
  pageTransition,
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  scaleInCenter,
  slideInLeft,
  slideInRight,
  slideInUp,
  slideInDown,
  cardHover,
  buttonTap,
  buttonHover,
  listContainer,
  listItem,
  modalBackdrop,
  modalContent,
  notificationSlideIn,
  pulse,
  spin,
  shimmer,
  staggerContainer,
  staggerItem,
  springTransition,
  springBouncy,
  springStiff,
  scrollReveal,
  collapse,
  likeAnimation,
  typingDot,
  typingContainer,
  pullToRefresh,
  countUp,
  confettiParticle,
  defaultTransition,
  animationPresets,
  viewportConfig,
};
