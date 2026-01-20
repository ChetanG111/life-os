'use client';

import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { MODAL_CONTAINER_VARIANT } from '@/utils/animations';
import clsx from 'clsx';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { useEffect } from 'react';
import { vibrate } from '@/utils/haptics';

interface ModalShellProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    // Optional: if we want to override the default height/style
    heightClass?: string; 
}

export function ModalShell({ 
    isOpen, 
    onClose, 
    children, 
    className,
    heightClass = "h-[85vh]" 
}: ModalShellProps) {
    const dragControls = useDragControls();

    // Standard hooks for all modals
    useLockBodyScroll(isOpen);
    useBackToClose(isOpen, onClose);

    useEffect(() => {
        if (isOpen) vibrate('light');
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 glass-material z-50 overflow-hidden hardware-accelerated"
                    >
                        <div className="absolute inset-0 noise-overlay opacity-[0.015]" />
                    </motion.div>

                    {/* Modal Content */}
                    <motion.div
                        variants={MODAL_CONTAINER_VARIANT}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        drag="y"
                        dragControls={dragControls}
                        dragListener={false} // Only drag from handle
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.05, bottom: 0.7 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className={clsx(
                            "fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-[32px] overflow-hidden flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.4)] border-t border-white/5 hardware-accelerated",
                            heightClass,
                            className
                        )}
                    >
                        {/* Drag Handle Area - Standardized */}
                        <div 
                            onPointerDown={(e) => dragControls.start(e)}
                            className="absolute top-0 left-0 right-0 h-12 z-50 flex justify-center pt-4 touch-none cursor-grab active:cursor-grabbing"
                        >
                            {/* Invisible hit area for easier grabbing */}
                            <div className="absolute inset-0 bg-transparent" />
                            {/* Visual Handle */}
                            <div className="w-12 h-1.5 bg-neutral-700/50 rounded-full relative z-10" />
                        </div>

                        {/* Content Container */}
                        <div className="flex-1 flex flex-col w-full h-full relative">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}