'use client';

import { AlertTriangle } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MODAL_CONTAINER_VARIANT, STAGGER_CHILDREN, OVERSHOOT_VARIANT } from '@/utils/animations';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title = "Delete Item?" }: ConfirmDeleteModalProps) {
    useLockBodyScroll(isOpen);

    // Custom variants for faster exit
    const modalVariants: Variants = {
        ...MODAL_CONTAINER_VARIANT,
        exit: {
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.15, ease: "easeOut" }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - dims the whole screen */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 noise-overlay opacity-[0.015]" />
                    </motion.div>

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center px-6 pointer-events-none">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="relative w-full max-w-sm bg-background rounded-[32px] overflow-hidden shadow-2xl border border-white/10 pointer-events-auto"
                        >
                            <motion.div 
                                variants={STAGGER_CHILDREN}
                                initial="hidden"
                                animate="show"
                                className="p-8 flex flex-col items-center text-center"
                            >
                                <motion.div 
                                    variants={OVERSHOOT_VARIANT}
                                    className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500"
                                >
                                    <AlertTriangle size={32} />
                                </motion.div>

                                <motion.h3 variants={OVERSHOOT_VARIANT} className="text-xl font-bold text-white mb-2">{title}</motion.h3>
                                <motion.p variants={OVERSHOOT_VARIANT} className="text-neutral-400 text-sm leading-relaxed mb-8">
                                    This action cannot be undone. The item will be permanently removed from your Life OS.
                                </motion.p>

                                <motion.div variants={OVERSHOOT_VARIANT} className="flex flex-col w-full gap-3">
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
                            </motion.div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
