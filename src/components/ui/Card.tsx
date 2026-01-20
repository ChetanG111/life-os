'use client';

import clsx from 'clsx';
import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
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
        <div
            ref={ref}
            className={clsx(
                "relative w-full overflow-hidden rounded-3xl p-6",
                "bg-neutral-900 border border-white/5 shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = "Card";