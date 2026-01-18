'use client';

import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { vibrate } from '@/utils/haptics';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useMemo, useState } from 'react';
import { Archive, Trash2, Bookmark, Clock, Layers, List as ListIcon } from 'lucide-react';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { Note } from '@/types';

interface MemoryReviewProps {
    isOpen: boolean;
    onClose: () => void;
}

type ViewMode = 'stack' | 'list';

// Memory review shows notes that are "expiring" (older than 7 days)
// User can: save_permanently, archive, or delete
export function MemoryReviewCards({ isOpen, onClose }: MemoryReviewProps) {
    const { notes, removeNote } = useData();
    const { showToast } = useToast();
    const springConfig = useSlimySpring();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState<ViewMode>('stack');

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

    const handleSavePermanently = (noteId?: string) => {
        vibrate('success');
        showToast('Note saved permanently', 'success');
        if (viewMode === 'stack') {
            nextCard();
        }
        // In list mode, just show toast (would mark as permanent in real app)
    };

    const handleArchive = (noteId?: string) => {
        vibrate('medium');
        showToast('Note archived', 'info');
        if (viewMode === 'stack') {
            nextCard();
        }
        // In list mode, just show toast (would archive in real app)
    };

    const handleDelete = (noteId?: string) => {
        const idToDelete = noteId || currentNote?.id;
        if (!idToDelete) return;

        vibrate('warning');
        removeNote(idToDelete);
        showToast('Note deleted', 'info');

        if (viewMode === 'stack') {
            // Index stays same but array shrinks
            if (currentIndex >= expiringNotes.length - 1) {
                setCurrentIndex(Math.max(0, expiringNotes.length - 2));
            }
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

    const toggleViewMode = () => {
        vibrate('medium');
        setViewMode(prev => prev === 'stack' ? 'list' : 'stack');
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
                                {viewMode === 'stack'
                                    ? `${currentIndex + 1} of ${expiringNotes.length} notes`
                                    : `${expiringNotes.length} notes to review`
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* View Toggle */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleViewMode}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                {viewMode === 'stack' ? <ListIcon size={18} /> : <Layers size={18} />}
                            </motion.button>
                            <div className="flex items-center gap-2 text-neutral-500">
                                <Clock size={16} />
                                <span className="text-xs font-medium">7+ days old</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative overflow-hidden px-6">
                    <AnimatePresence mode="wait">
                        {viewMode === 'stack' ? (
                            /* Stack View */
                            currentNote && (
                                <motion.div
                                    key={`stack-${currentNote.id}`}
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
                                    <NoteCardContent note={currentNote} />
                                </motion.div>
                            )
                        ) : (
                            /* List View */
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="h-full overflow-y-auto pb-4 space-y-3"
                            >
                                {expiringNotes.map(note => (
                                    <motion.div
                                        key={note.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-neutral-900 rounded-2xl p-4 border border-white/10"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate">
                                                    {note.title || 'Untitled Note'}
                                                </h4>
                                                <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                                                    {note.content}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleSavePermanently(note.id)}
                                                    className="p-2 rounded-xl text-green-400 hover:bg-green-500/10 transition-colors"
                                                >
                                                    <Bookmark size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(note.id)}
                                                    className="p-2 rounded-xl text-neutral-400 hover:bg-white/5 transition-colors"
                                                >
                                                    <Archive size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(note.id)}
                                                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Swipe Hints - Stack view only */}
                    {viewMode === 'stack' && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 text-xs text-neutral-600 font-medium uppercase tracking-wider">
                            <span>← Archive</span>
                            <span>↓ Delete</span>
                            <span>Save →</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons - Stack view only */}
                {viewMode === 'stack' && (
                    <div className="flex-none px-6 pb-8 pt-4 flex gap-3">
                        <button
                            onClick={() => handleArchive()}
                            className="flex-1 py-4 rounded-2xl bg-neutral-800 text-white font-medium flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors"
                        >
                            <Archive size={18} />
                            Archive
                        </button>
                        <button
                            onClick={() => handleDelete()}
                            className="py-4 px-6 rounded-2xl bg-red-500/10 text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button
                            onClick={() => handleSavePermanently()}
                            className="flex-1 py-4 rounded-2xl bg-white text-black font-medium flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
                        >
                            <Bookmark size={18} />
                            Keep
                        </button>
                    </div>
                )}
            </motion.div>
        </>
    );
}

// Extracted card content component for reuse
function NoteCardContent({ note }: { note: Note }) {
    return (
        <>
            {/* Note Title */}
            <h3 className="text-lg font-bold text-white mb-2">
                {note.title || 'Untitled Note'}
            </h3>

            {/* Note Content */}
            <p className="text-neutral-400 text-sm leading-relaxed line-clamp-6">
                {note.content}
            </p>

            {/* Tags */}
            {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {note.tags.map(tag => (
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
                Created: {new Date(note.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                })}
            </p>
        </>
    );
}
