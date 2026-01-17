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
            staggerChildren: STAGGER_CONFIG[mode],
            delayChildren: STAGGER_CONFIG.initialDelay,
            when: "beforeChildren"
        }
    }
});

export const createStaggerItemVariants = (springConfig: any): Variants => ({
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    enter: { opacity: 0, y: 30, scale: 0.9 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: springConfig
    }
});
