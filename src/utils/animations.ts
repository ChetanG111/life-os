import { Variants } from 'framer-motion';

/**
 * Universal Stagger Animation System
 * Follows iOS 18 fluid entrance patterns.
 * 
 * DESIGN TOKENS:
 * - Gap: 0.08s (Standard List) | 0.05s (Modal/Dense)
 * - Delay: 0.1s
 * - Offset: 30px Slide-up
 * - Scale: 0.9 Entrance
 */

export const STAGGER_CONFIG = {
    standard: 0.08,
    modal: 0.05,
    initialDelay: 0.1
};

export const UNIVERSAL_STAGGER_CONTAINER = (mode: 'standard' | 'modal' = 'standard'): Variants => ({
    hidden: { opacity: 0 },
    enter: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            // Removed "beforeChildren" to allow items to flow in AS the container opens
            delayChildren: 0,
            duration: 0.01 // Minimal container duration
        }
    }
});

export const UNIVERSAL_MODAL_VARIANTS = (springConfig: any): Variants => ({
    hidden: { y: '100%', opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: {
            ...springConfig,
            delayChildren: 0,
            staggerChildren: 0.05
        }
    },
    exit: {
        y: '100%',
        opacity: 0,
        transition: {
            type: 'spring',
            damping: 30,
            stiffness: 450,
            mass: 0.8
        }
    }
});

export const createStaggerItemVariants = (springConfig: any): Variants => ({
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    enter: { opacity: 0, y: 30, scale: 0.9 },
    show: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            ...springConfig,
            // Reduced base interval for faster response (0.02 instead of 0.04)
            delay: i * 0.02 + (Math.pow(i, 1.2) * 0.005)
        }
    }),
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.95,
        transition: {
            type: "spring",
            damping: 30,
            stiffness: 400,
            mass: 0.8
        }
    }
});
