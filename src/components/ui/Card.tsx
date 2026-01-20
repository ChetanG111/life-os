'use client';

import clsx from 'clsx';
import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// Standard Card Props
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'highlight' | 'warning';
    className?: string;
    children: React.ReactNode;
}

// Motion Card Props (extends framer-motion props)
interface MotionCardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'highlight' | 'warning';
    className?: string;
    children: React.ReactNode;
}

// 1. Standard Static Card
export const Card = forwardRef<HTMLDivElement, CardProps>(({
    variant = 'default',
    className,
    children,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={clsx(
                "w-full overflow-hidden rounded-3xl p-6",
                "bg-neutral-900 shadow-xl", 
                !className?.includes('absolute') && !className?.includes('fixed') && "relative",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = "Card";

// 2. Motion Card (For SwipeFeed, Tasks, etc.)
export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(({
    variant = 'default',
    className,
    children,
    ...props
}, ref) => {
    return (
        <motion.div
            ref={ref}
            className={clsx(
                "overflow-hidden rounded-3xl p-6",
                "bg-neutral-900 shadow-xl hardware-accelerated", // Added Optimization
                !className?.includes('absolute') && !className?.includes('fixed') && "relative w-full",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
});

MotionCard.displayName = "MotionCard";