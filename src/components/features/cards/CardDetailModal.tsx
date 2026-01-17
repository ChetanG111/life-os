'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Tag, AlignLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useBackToClose } from '@/hooks/use-back-to-close';

interface CardDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: string;
        title: string;
        type: 'task' | 'note';
        content: string;
        tags?: string[];
        dueTime?: string;
        priority?: 'high' | 'medium' | 'low';
    } | null;
}

export function CardDetailModal({ isOpen, onClose, item }: CardDetailModalProps) {
    useBackToClose(isOpen, onClose);

    if (!item) return null;

    const priorityColors = {
        high: 'bg-red-500',
        medium: 'bg-amber-500',
        low: 'bg-blue-500'
    };

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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal Card */}
                    <motion.div
                        layoutId={`card-${item.id}`} // Setup for potential shared element transition later
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-x-4 top-[10%] bottom-[10%] z-50 flex flex-col pointer-events-none"
                    >
                         {/* Actual Card Container */}
                        <div className="w-full h-full bg-[#1A1A1A] rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-white/10 pointer-events-auto relative">
                            
                            {/* Header Image / Color Block (Optional based on type) */}
                            <div className="h-32 bg-gradient-to-b from-white/5 to-transparent relative p-6">
                                <button 
                                    onClick={() => {
                                        vibrate('light');
                                        onClose();
                                    }}
                                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/40 transition-all"
                                >
                                    <X size={20} />
                                </button>
                                
                                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-white/80 border border-white/5">
                                        {item.type}
                                    </span>
                                    {item.priority && (
                                        <span className={`w-3 h-3 rounded-full ${priorityColors[item.priority]}`} />
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-2">
                                <h2 className="text-2xl font-bold text-white mb-6 leading-tight">
                                    {item.title}
                                </h2>

                                <div className="space-y-6">
                                    {/* Meta Data Row */}
                                    <div className="flex flex-wrap gap-4 text-neutral-400">
                                        {item.dueTime && (
                                            <div className="flex items-center gap-2 text-sm bg-white/5 px-3 py-1.5 rounded-lg">
                                                <Clock size={16} />
                                                <span>{item.dueTime}</span>
                                            </div>
                                        )}
                                        {/* Date placeholder */}
                                        <div className="flex items-center gap-2 text-sm bg-white/5 px-3 py-1.5 rounded-lg">
                                            <Calendar size={16} />
                                            <span>Today</span>
                                        </div>
                                    </div>

                                    {/* Main Body */}
                                    <div className="prose prose-invert prose-p:text-neutral-300 prose-p:text-base prose-p:leading-relaxed max-w-none">
                                        <p>{item.content}</p>
                                        <p className="text-neutral-500">
                                            {/* Placeholder for longer content logic */}
                                            Additional details regarding this task would go here. The quick add modal only captures the essence, but here we can expand.
                                        </p>
                                    </div>

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="pt-4 border-t border-white/5">
                                            <div className="flex flex-wrap gap-2">
                                                {item.tags.map(tag => (
                                                    <span key={tag} className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-md">
                                                        <Tag size={12} />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 bg-[#121212] border-t border-white/5 flex gap-3">
                                <button className="flex-1 h-12 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
                                    onClick={() => {
                                        vibrate('success');
                                        onClose();
                                    }}
                                >
                                    <CheckCircle2 size={20} />
                                    <span>Complete</span>
                                </button>
                                <button className="h-12 w-14 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                    onClick={() => {
                                        vibrate('medium');
                                        onClose();
                                    }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
