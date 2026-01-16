'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';
import { forwardRef } from 'react';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'highlight' | 'warning';
    className?: string;
    children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
    variant = 'default',
    className,
    children,
    ...props
}, ref) => {
    return (
        <motion.div
            ref={ref}
            layout
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={clsx(
                "relative w-full overflow-hidden rounded-3xl p-6",
                "bg-neutral-900 border border-white/5 shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
});

Card.displayName = "Card";
