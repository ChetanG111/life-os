import { Variants, Transition } from 'framer-motion';

// --- Physics Config ---

// "Slimy" Spring: Energetic but controlled.
export const SLIMY_CONFIG: Transition = {
    type: "spring",
    stiffness: 350,
    damping: 26,
    mass: 1.1
};

// "iOS" Spring: Firm, responsive, premium.
export const IOS_SPRING: Transition = {
    type: "spring",
    stiffness: 400,
    damping: 34,
    mass: 1.1
};

// "Rubber Band" Keyframes: For switches/toggles.
export const RUBBER_BAND_FRAMES = [1, 1.25, 0.9, 1.05, 1];

// --- Variants ---

// Stagger Container: For lists, modal content wrappers.
export const STAGGER_CHILDREN: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.08
        }
    },
    exit: {
        opacity: 0,
        transition: { staggerChildren: 0.03, staggerDirection: -1 }
    }
};

// Fast Stagger: For alerts/dialogs where interaction speed is key.
export const FAST_STAGGER: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03, // Very fast cascade
            delayChildren: 0       // Immediate start
        }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.1 }
    }
};

// Overshoot Entry: Shoots past target and settles.
export const OVERSHOOT_VARIANT: Variants = {
    hidden: { y: 25, opacity: 0, scale: 0.96 },
    show: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: SLIMY_CONFIG
    },
    exit: {
        y: 15,
        opacity: 0,
        transition: { duration: 0.15 }
    }
};

// Left Stagger: For tasks sliding in from left.
export const LEFT_STAGGER_VARIANT: Variants = {
    hidden: { x: -30, opacity: 0 },
    show: {
        x: 0,
        opacity: 1,
        transition: SLIMY_CONFIG
    },
    exit: {
        opacity: 0,
        height: 0,
        marginBottom: 0,
        transition: { 
            opacity: { duration: 0.15 }, 
            height: { duration: 0.3, delay: 0.05 },
            marginBottom: { duration: 0.3, delay: 0.05 }
        }
    }
};

// Modal Container: Slides up firmly.
export const MODAL_CONTAINER_VARIANT: Variants = {
    hidden: { y: "100%" },
    show: {
        y: 0,
        transition: IOS_SPRING
    },
    exit: {
        y: "100%",
        transition: { ...IOS_SPRING, stiffness: 400 }
    }
};

// FAB Pop: Pops in with high energy.
export const FAB_POP_VARIANT: Variants = {
    hidden: { scale: 0, opacity: 0 },
    show: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 18,
            mass: 0.8
        }
    },
    exit: {
        scale: 0,
        opacity: 0,
        transition: { duration: 0.15 }
    }
};

// Chat Bubble Pop: scale from corner.
export const CHAT_BUBBLE_VARIANT: Variants = {
    hidden: { scale: 0, opacity: 0 },
    show: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 25,
            mass: 1
        }
    }
};

// Toast Unfurl: Stretches vertically.
export const TOAST_VARIANT: Variants = {
    hidden: { opacity: 0, y: 20, scaleY: 0.3 },
    show: {
        opacity: 1,
        y: 0,
        scaleY: 1,
        transition: SLIMY_CONFIG
    },
    exit: {
        opacity: 0,
        x: 100, // Swipe right exit
        scale: 0.9,
        transition: { duration: 0.2 }
    }
};