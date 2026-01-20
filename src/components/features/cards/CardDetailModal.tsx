'use client';

import { Calendar, Clock, CheckCircle2, Trash2, Pencil, X } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { useState, useEffect } from 'react';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useSettings } from '@/context/SettingsContext';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { MODAL_CONTAINER_VARIANT, STAGGER_CHILDREN, OVERSHOOT_VARIANT } from '@/utils/animations';

interface CardDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete?: () => void;
    onComplete?: () => void;
    item: {
        id: string;
        title: string;
        type: 'task' | 'note';
        content: string;
        tags?: string[];
        dueTime?: string;
        dueDate?: string;
        priority?: 'high' | 'medium' | 'low';
        images?: string[];
    } | null;
}

export function CardDetailModal({ isOpen, onClose, onDelete, onComplete, item }: CardDetailModalProps) {
    const { confirmDelete } = useSettings();
    const [activeItem, setActiveItem] = useState(item);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const dragControls = useDragControls();

    useBackToClose(isOpen, onClose);
    useLockBodyScroll(isOpen);

    useEffect(() => {
        if (item) {
            setActiveItem(item);
        }
    }, [item]);

    useEffect(() => {
        if (isOpen) {
            vibrate('light');
        }
    }, [isOpen]);

    if (!activeItem) return null;

    const priorityColors = {
        high: 'bg-red-500',
        medium: 'bg-amber-500',
        low: 'bg-blue-500'
    };

    const scrollClass = "flex-1 overflow-y-auto scrollbar-hide overscroll-contain touch-pan-y [web-kit-overflow-scrolling:touch]";

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/60 z-50 overflow-hidden"
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
                            dragListener={false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0.05, bottom: 0.7 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y > 100) onClose();
                            }}
                            className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-background rounded-t-[32px] overflow-hidden flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.4)] border-t border-white/5"
                        >
                            <motion.div
                                variants={STAGGER_CHILDREN}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col h-full"
                            >
                                {/* Header */}
                                <div
                                    onPointerDown={(e) => dragControls.start(e)}
                                    className="flex-none pt-4 pb-2 px-6 flex flex-col items-center bg-background rounded-t-[32px] border-b border-white/5 relative cursor-grab active:cursor-grabbing touch-none"
                                >
                                    <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4" />
                                    <div className="w-full flex items-center justify-center relative">
                                        <motion.div variants={OVERSHOOT_VARIANT} className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 border border-white/5">
                                                {activeItem.type}
                                            </span>
                                            {activeItem.priority && (
                                                <span className={`w-2.5 h-2.5 rounded-full ${priorityColors[activeItem.priority]}`} />
                                            )}
                                        </motion.div>
                                    </div>
                                    <button onClick={onClose} className="absolute right-6 top-6 text-neutral-500">
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className={scrollClass + " px-6 py-6"}>
                                    <motion.h2 variants={OVERSHOOT_VARIANT} className="text-2xl font-bold text-white mb-6 leading-tight tracking-tight">
                                        {activeItem.title}
                                    </motion.h2>

                                    <div className="space-y-8">
                                        {/* Meta Data Grid */}
                                        <motion.div variants={OVERSHOOT_VARIANT} className="flex flex-wrap gap-3">
                                            {(activeItem.dueDate || activeItem.dueTime) && (
                                                <div className="flex items-center gap-2 text-sm bg-white/5 px-4 py-2 rounded-2xl border border-white/5 text-neutral-300">
                                                    <Clock size={16} className="text-neutral-500" />
                                                    <span className="font-medium">
                                                        {activeItem.dueDate ? new Date(activeItem.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : activeItem.dueTime}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm bg-white/5 px-4 py-2 rounded-2xl border border-white/5 text-neutral-300">
                                                <Calendar size={16} className="text-neutral-500" />
                                                <span className="font-medium">
                                                    {activeItem.dueDate ? new Date(activeItem.dueDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Today'}
                                                </span>
                                            </div>
                                        </motion.div>

                                        {/* Images Section */}
                                        {activeItem.images && activeItem.images.length > 0 && (
                                            <motion.div variants={OVERSHOOT_VARIANT} className="flex flex-col gap-3">
                                                <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Attachments</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {activeItem.images.map((img, i) => (
                                                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-neutral-800">
                                                            <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Main Body Text */}
                                        <motion.div variants={OVERSHOOT_VARIANT} className="space-y-4">
                                            <div className="text-lg text-neutral-300 leading-relaxed font-medium">
                                                {activeItem.content}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Sticky Action Footer */}
                                <div className="p-6 pb-12 bg-background border-t border-white/10 flex gap-3">
                                    <motion.button variants={OVERSHOOT_VARIANT} className="flex-1 h-14 bg-white text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                        onClick={() => {
                                            vibrate('success');
                                            if (onComplete) onComplete();
                                            onClose();
                                        }}
                                    >
                                        <CheckCircle2 size={24} strokeWidth={2.5} />
                                        <span>Complete</span>
                                    </motion.button>

                                    <motion.button variants={OVERSHOOT_VARIANT} className="h-14 w-16 bg-white/5 text-neutral-400 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
                                        onClick={() => vibrate('light')}
                                    >
                                        <Pencil size={22} />
                                    </motion.button>

                                    <motion.button variants={OVERSHOOT_VARIANT} className="h-14 w-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
                                        onClick={() => {
                                            vibrate('medium');
                                            if (confirmDelete) {
                                                setIsConfirmingDelete(true);
                                            } else {
                                                if (onDelete) onDelete();
                                                onClose();
                                            }
                                        }}
                                    >
                                        <Trash2 size={24} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ConfirmDeleteModal
                isOpen={isConfirmingDelete}
                onClose={() => setIsConfirmingDelete(false)}
                onConfirm={() => {
                    if (onDelete) onDelete();
                    onClose();
                }}
            />
        </>
    );
}
