'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Image, Link, Check, ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { useBackToClose } from '@/hooks/use-back-to-close';

export function QuickAddModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [text, setText] = useState('');
    
    useBackToClose(isOpen, onClose);

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
                        onPointerDown={(e) => e.stopPropagation()} // Prevent parent horizontal swipes
                        className="absolute inset-0 z-40 bg-black/80"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={(e, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) {
                                onClose();
                            }
                        }}
                        onPointerDown={(e) => e.stopPropagation()} // Prevent parent horizontal swipes
                        className="absolute inset-x-0 bottom-0 z-50 p-4 h-[85vh] bg-[var(--surface)] rounded-t-[32px] border-t border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 opacity-50" />


                        <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4 pb-20">
                            <h2 className="text-xl font-medium text-white">New Item</h2>
                            <p>Quick Add inputs will go here</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
