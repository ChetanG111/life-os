'use client';

import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useMemo, useState, useEffect } from 'react';
import { Archive, Trash2, Bookmark, Layers, List as ListIcon, CheckCircle2 } from 'lucide-react';
import { Note } from '@/types';
import clsx from 'clsx';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { SLIMY_CONFIG } from '@/utils/animations';
import { MotionCard } from '@/components/ui/Card';
import { ModalShell } from '@/components/ui/ModalShell';
import { vibrate } from '@/utils/haptics';

interface MemoryReviewProps {
    isOpen: boolean;
    onClose: () => void;
}

type ViewMode = 'stack' | 'list';

export function MemoryReviewCards({ isOpen, onClose }: MemoryReviewProps) {
    const { notes, removeNote } = useData();
    const { showToast } = useToast();
    const [viewMode, setViewMode] = useState<ViewMode>('stack');
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

    // Filter to "expiring" notes
    const expiringNotes = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return notes.filter(note => {
            const noteDate = new Date(note.date);
            return noteDate < sevenDaysAgo && !processedIds.has(note.id);
        });
    }, [notes, processedIds]);

    const handleSavePermanently = (noteId: string) => {
        vibrate('success');
        showToast('Note saved permanently', 'success');
        setProcessedIds(prev => new Set([...prev, noteId]));
    };

    const handleArchive = (noteId: string) => {
        vibrate('medium');
        showToast('Note archived', 'info');
        setProcessedIds(prev => new Set([...prev, noteId]));
    };

    const handleDelete = (noteId: string) => {
        vibrate('warning');
        removeNote(noteId);
        showToast('Note deleted', 'info');
    };

    const toggleViewMode = () => {
        vibrate('medium');
        setViewMode(prev => prev === 'stack' ? 'list' : 'stack');
    };

    const isEmpty = expiringNotes.length === 0;

    // We can't auto-close inside the render of ModalShell easily without prop drilling close logic
    // But we can check empty state and show "All Caught Up"
    useEffect(() => {
        if (isEmpty && processedIds.size > 0 && isOpen) {
             showToast('Memory review complete! ✨', 'success');
        }
    }, [isEmpty, processedIds.size, isOpen, showToast]);

    return (
        <ModalShell 
            isOpen={isOpen} 
            onClose={onClose}
            heightClass={isEmpty ? "h-[60vh]" : "h-[75vh]"}
        >
            {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full pb-12">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }}
                        transition={SLIMY_CONFIG}
                        className="flex flex-col items-center"
                    >
                        <CheckCircle2 size={48} className="text-neutral-600 mb-4" />
                        <p className="text-neutral-500 text-sm font-medium">No notes to review</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-6 py-3 bg-white/10 rounded-full text-white text-sm font-medium active:scale-95 transition-transform"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            ) : (
                <div className="flex flex-col h-full pt-12"> {/* pt-12 clears drag handle */}
                    {/* Header */}
                    <div className="flex-none px-6 pb-6 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">Memory Review</h2>
                                <p className="text-sm text-neutral-500">
                                    {expiringNotes.length} notes due
                                </p>
                            </div>
                            <button
                                onClick={toggleViewMode}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                {viewMode === 'stack' ? <ListIcon size={18} /> : <Layers size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 relative overflow-hidden pt-6">
                        <div className="h-full w-full overscroll-contain touch-pan-y">
                            {viewMode === 'stack' ? (
                                <StackView
                                    notes={expiringNotes}
                                    onSave={handleSavePermanently}
                                    onArchive={handleArchive}
                                    onDelete={handleDelete}
                                />
                            ) : (
                                <ListView
                                    notes={expiringNotes}
                                    onSave={handleSavePermanently}
                                    onArchive={handleArchive}
                                    onDelete={handleDelete}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ModalShell>
    );
}

// Stack View with Physics
function StackView({
    notes,
    onSave,
    onArchive,
    onDelete
}: {
    notes: Note[];
    onSave: (id: string) => void;
    onArchive: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const displayNotes = notes.slice(0, 3).reverse();

    return (
        <div className="relative h-full w-full max-w-sm mx-auto flex flex-col justify-start items-center p-4">
            <div className="relative w-full aspect-[4/5] max-h-[380px]">
                <AnimatePresence>
                    {displayNotes.map((note, index) => {
                        const isTop = note.id === notes[0].id;
                        const stackIndex = displayNotes.length - 1 - index;

                        return (
                            <StackCard 
                                key={note.id} 
                                note={note}
                                isTop={isTop}
                                stackIndex={stackIndex}
                                onSave={() => onSave(note.id)}
                                onArchive={() => onArchive(note.id)}
                                onDelete={() => onDelete(note.id)}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Individual Stack Card
function StackCard({
    note,
    isTop,
    stackIndex,
    onSave,
    onArchive,
    onDelete
}: {
    note: Note;
    isTop: boolean;
    stackIndex: number;
    onSave: () => void;
    onArchive: () => void;
    onDelete: () => void;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-12, 12]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 120;
        const { x: offsetX, y: offsetY } = info.offset;

        if (Math.abs(offsetX) > Math.abs(offsetY)) {
            if (offsetX > threshold) {
                vibrate('success');
                onSave();
            } else if (offsetX < -threshold) {
                vibrate('medium');
                onArchive();
            }
        } else {
            if (offsetY > threshold) {
                vibrate('warning');
                onDelete();
            }
        }
    };

    return (
        <MotionCard
            style={{
                x: isTop ? x : 0,
                y: isTop ? y : (stackIndex * 15),
                scale: isTop ? 1 : 1 - (stackIndex * 0.05),
                rotate: isTop ? rotate : 0,
                zIndex: 10 - stackIndex
            }}
            drag={isTop ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: isTop ? 1 : 1 - (stackIndex * 0.05), opacity: 1, y: isTop ? 0 : (stackIndex * 15) }}
            exit={{ 
                x: x.get() > 50 ? 500 : (x.get() < -50 ? -500 : 0),
                y: y.get() > 50 ? 500 : 0,
                opacity: 0,
                transition: { duration: 0.2 }
            }}
            transition={SLIMY_CONFIG}
            className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        >
            <div className="h-full bg-[var(--surface)] rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
                <div className="relative z-10 flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                            NOTE
                        </span>
                        <span className="text-[10px] text-neutral-600">
                            {new Date(note.date).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                        {note.title || 'Untitled Note'}
                    </h3>

                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-5">
                        {note.content}
                    </p>

                    {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {note.tags.slice(0, 3).map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-white/5 rounded-full text-xs text-neutral-500 font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MotionCard>
    );
}

// List View
function ListView({
    notes,
    onSave,
    onArchive,
    onDelete
}: {
    notes: Note[];
    onSave: (id: string) => void;
    onArchive: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <div className="h-full overflow-y-auto px-6 pb-8 space-y-3">
            {notes.map((note) => (
                <div
                    key={note.id}
                    className="bg-[var(--surface)] rounded-2xl p-4 border border-white/5"
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
                                onClick={() => onSave(note.id)}
                                className="p-2 rounded-xl text-green-400 hover:bg-green-500/10 transition-colors"
                            >
                                <Bookmark size={16} />
                            </button>
                            <button
                                onClick={() => onArchive(note.id)}
                                className="p-2 rounded-xl text-neutral-400 hover:bg-white/5 transition-colors"
                            >
                                <Archive size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(note.id)}
                                className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
