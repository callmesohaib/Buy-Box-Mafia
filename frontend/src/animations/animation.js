// Page Transitions
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
}

export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
}

// Fade In Animations
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const fadeInDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

// Scale Animations
export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

export const scaleInBounce = {
  initial: { scale: 0 },
  animate: { scale: 1 },
  transition: { 
    type: "spring", 
    stiffness: 200, 
    damping: 15,
    duration: 0.6
  }
}

// Stagger Animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
}

// Card Animations
export const cardHover = {
  initial: { scale: 1 },
  whileHover: { 
    scale: 1.02, 
    y: -5,
    transition: { duration: 0.2 }
  },
  whileTap: { scale: 0.98 }
}

export const cardHoverSubtle = {
  initial: { scale: 1 },
  whileHover: { 
    scale: 1.01, 
    y: -2,
    transition: { duration: 0.2 }
  },
  whileTap: { scale: 0.99 }
}

// Button Animations
export const buttonHover = {
  whileHover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
}

export const buttonHoverLift = {
  whileHover: { 
    scale: 1.02, 
    y: -2,
    transition: { duration: 0.2 }
  },
  whileTap: { 
    scale: 0.98,
    y: 0,
    transition: { duration: 0.1 }
  }
}

// List Item Animations
export const listItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

export const listContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

// Loading Animations
export const loadingSpin = {
  animate: {
    rotate: 360
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }
}

export const loadingPulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1]
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }
}

// Modal Animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

export const modalContent = {
  initial: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    y: 0
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  transition: { 
    type: "spring",
    stiffness: 300,
    damping: 30
  }
}

// Tab Animations
export const tabIndicator = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 0.3, ease: "easeInOut" }
}

// Progress Bar Animations
export const progressBar = {
  initial: { width: 0 },
  animate: { width: "100%" },
  transition: { duration: 1, ease: "easeOut" }
}

// Icon Animations
export const iconSpin = {
  whileHover: {
    rotate: 360,
    transition: { duration: 0.6, ease: "easeInOut" }
  }
}

export const iconBounce = {
  whileHover: {
    y: [-2, 0, -2],
    transition: { duration: 0.6, ease: "easeInOut" }
  }
}

// Text Animations
export const textReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
}

export const textSlideIn = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

// Grid Animations
export const gridContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const gridItem = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
}

// Slide Animations
export const slideInUp = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export const slideInDown = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.6, ease: "easeOut" }
}

// Bounce Animations
export const bounceIn = {
  initial: { scale: 0.3, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10
    }
  }
}

// Fade Animations with Delay
export const fadeInWithDelay = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, delay, ease: "easeOut" }
})

export const fadeInUpWithDelay = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" }
})

// Complex Animations
export const heroAnimation = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.8, 
    ease: "easeOut",
    staggerChildren: 0.2
  }
}

export const statsAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { 
    duration: 0.6, 
    ease: "easeOut",
    staggerChildren: 0.1
  }
}

// Auth Page Specific Animations
export const authPageContainer = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, ease: "easeOut" }
}

export const authHeaderVariants = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut", delay: 0.2 }
}

export const authFormVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { 
    duration: 0.7, 
    ease: "easeOut", 
    delay: 0.4,
    type: "spring",
    stiffness: 100,
    damping: 15
  }
}

export const formFieldVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
}

export const formFieldStagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.6
    }
  }
}

export const authButtonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { 
    duration: 0.5, 
    ease: "easeOut", 
    delay: 1.2,
    type: "spring",
    stiffness: 200,
    damping: 20
  }
}

export const socialButtonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
}

export const socialButtonStagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 1.4
    }
  }
}

export const authLinkVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut", delay: 1.6 }
}

export const logoVariants = {
  initial: { opacity: 0, scale: 0.8, rotate: -10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      type: "spring",
      stiffness: 150,
      damping: 15
    }
  },
  hover: {
    scale: 1.05,
    rotate: 2,
    transition: { duration: 0.3 }
  }
}

export const inputFocusVariants = {
  initial: { scale: 1 },
  focus: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  }
}

export const errorMessageVariants = {
  initial: { opacity: 0, x: -10, height: 0 },
  animate: { opacity: 1, x: 0, height: "auto" },
  exit: { opacity: 0, x: -10, height: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
}

export const loadingSpinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

export const successCheckVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

// Export all animations as a single object for easy importing
export const animations = {
  pageVariants,
  pageTransition,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInBounce,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonHover,
  buttonHoverLift,
  listItemVariants,
  listContainerVariants,
  loadingSpin,
  loadingPulse,
  modalBackdrop,
  modalContent,
  tabIndicator,
  progressBar,
  textReveal,
  textSlideIn,
  gridContainer,
  gridItem,
  slideInUp,
  slideInDown,
  bounceIn,
  fadeInWithDelay,
  fadeInUpWithDelay,
  heroAnimation,
  authPageContainer,
  authHeaderVariants,
  authFormVariants,
  formFieldVariants,
  formFieldStagger,
  authButtonVariants,
  socialButtonVariants,
  socialButtonStagger,
  authLinkVariants,
  logoVariants,
  inputFocusVariants,
  errorMessageVariants,
  loadingSpinnerVariants
} 