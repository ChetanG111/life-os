'use client';

import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { vibrate } from '@/utils/haptics';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useMemo, useState } from 'react';
import { Archive, Trash2, Bookmark, Clock } from 'lucide-react';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { Note } from '@/types';

interface MemoryReviewProps {
    isOpen: boolean;
    onClose: () => void;
}

// Memory review shows notes that are "expiring" (older than 7 days)
// User can: save_permanently, archive, or delete
export function MemoryReviewCards({ isOpen, onClose }: MemoryReviewProps) {
    const { notes, removeNote } = useData();
    const { showToast } = useToast();
    const springConfig = useSlimySpring();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter to "expiring" notes - older than 7 days per memory_review_logic
    const expiringNotes = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return notes.filter(note => {
            const noteDate = new Date(note.date);
            return noteDate < sevenDaysAgo;
        });
    }, [notes]);

    const currentNote = expiringNotes[currentIndex];

    const handleSavePermanently = () => {
        vibrate('success');
        showToast('Note saved permanently', 'success');
        // In real app, would mark as permanent - for now just move to next
        nextCard();
    };

    const handleArchive = () => {
        vibrate('medium');
        showToast('Note archived', 'info');
        // In real app, would mark as archived
        nextCard();
    };

    const handleDelete = () => {
        if (!currentNote) return;
        vibrate('warning');
        removeNote(currentNote.id);
        showToast('Note deleted', 'info');
        // Index stays same but array shrinks
        if (currentIndex >= expiringNotes.length - 1) {
            setCurrentIndex(Math.max(0, expiringNotes.length - 2));
        }
    };

    const nextCard = () => {
        if (currentIndex < expiringNotes.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
            showToast('Memory review complete! ✨', 'success');
        }
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100;

        if (info.offset.x > threshold) {
            handleSavePermanently();
        } else if (info.offset.x < -threshold) {
            handleArchive();
        } else if (info.offset.y > threshold) {
            handleDelete();
        }
    };

    if (!isOpen || expiringNotes.length === 0) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-x-0 bottom-0 h-[80vh] bg-[var(--surface)] rounded-t-[32px] z-50 flex flex-col"
            >
                {/* Header */}
                <div className="flex-none px-6 pt-6 pb-4">
                    <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-4" />
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">Memory Review</h2>
                            <p className="text-sm text-neutral-500">
                                {currentIndex + 1} of {expiringNotes.length} notes to review
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-500">
                            <Clock size={16} />
                            <span className="text-xs font-medium">7+ days old</span>
                        </div>
                    </div>
                </div>

                {/* Card Area */}
                <div className="flex-1 relative overflow-hidden px-6">
                    <AnimatePresence mode="wait">
                        {currentNote && (
                            <motion.div
                                key={currentNote.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, x: -100 }}
                                transition={springConfig}
                                drag
                                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                dragElastic={0.5}
                                onDragStart={() => vibrate('light')}
                                onDragEnd={handleDragEnd}
                                className="absolute inset-x-6 top-0 bg-neutral-900 rounded-3xl p-6 border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing"
                            >
                                {/* Note Title */}
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {currentNote.title || 'Untitled Note'}
                                </h3>

                                {/* Note Content */}
                                <p className="text-neutral-400 text-sm leading-relaxed line-clamp-6">
                                    {currentNote.content}
                                </p>

                                {/* Tags */}
                                {currentNote.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {currentNote.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-white/5 rounded-full text-xs text-neutral-500 font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Date */}
                                <p className="text-xs text-neutral-600 mt-4">
                                    Created: {new Date(currentNote.date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Swipe Hints */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 text-xs text-neutral-600 font-medium uppercase tracking-wider">
                        <span>← Archive</span>
                        <span>↓ Delete</span>
                        <span>Save →</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-none px-6 pb-8 pt-4 flex gap-3">
                    <button
                        onClick={handleArchive}
                        className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-medium flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors"
                    >
                        <Archive size={18} />
                        Archive
                    </button>
                    <button
                        onClick={handleDelete}
                        className="py-4 px-6 rounded-2xl bg-red-500/10 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={handleSavePermanently}
                        className="flex-1 py-4 rounded-2xl bg-white text-black font-medium flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
                    >
                        <Bookmark size={18} />
                        Keep
                    </button>
                </div>
            </motion.div>
        </>
    );
}
