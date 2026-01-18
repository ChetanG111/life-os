'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { UNIVERSAL_STAGGER_CONTAINER, createStaggerItemVariants } from '@/utils/animations';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title = "Delete Item?" }: ConfirmDeleteModalProps) {
    const springConfig = useSlimySpring();
    useLockBodyScroll(isOpen);

    const baseContainer = UNIVERSAL_STAGGER_CONTAINER('modal');
    // Override initial delay for this modal to make it feel more instant during pop-up
    const containerVariants = {
        ...baseContainer,
        show: {
            ...baseContainer.show,
            transition: {
                ...(baseContainer.show as any)?.transition,
                delayChildren: 0.05 // Even faster for small modals
            }
        }
    };
    const itemVariants = createStaggerItemVariants(springConfig);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
                    />

                    {/* Modal */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit={{
                            scale: 0.9,
                            opacity: 0,
                            transition: { duration: 0.15, ease: "easeIn" }
                        }}
                        className="relative w-full max-w-sm bg-[#1A1A1A] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl pointer-events-auto"
                    >
                        <div className="p-8 flex flex-col items-center text-center">
                            <motion.div
                                variants={itemVariants}
                                className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500"
                            >
                                <AlertTriangle size={32} />
                            </motion.div>

                            <motion.h3 variants={itemVariants} className="text-xl font-bold text-white mb-2">{title}</motion.h3>
                            <motion.p variants={itemVariants} className="text-neutral-400 text-sm leading-relaxed mb-8">
                                This action cannot be undone. The item will be permanently removed from your Life OS.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col w-full gap-3">
                                <button
                                    onClick={() => {
                                        vibrate('medium');
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="h-14 w-full bg-red-500 text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => {
                                        vibrate('light');
                                        onClose();
                                    }}
                                    className="h-14 w-full bg-white/5 text-white rounded-2xl font-medium text-lg active:scale-95 transition-transform"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
