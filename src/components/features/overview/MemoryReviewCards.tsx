'use client';

import { vibrate } from '@/utils/haptics';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useMemo, useState, useEffect } from 'react';
import { Archive, Trash2, Bookmark, Layers, List as ListIcon, CheckCircle2 } from 'lucide-react';
import { Note } from '@/types';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import clsx from 'clsx';

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
    const [viewMode, setViewMode] = useState<ViewMode>('stack');
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

    useLockBodyScroll(isOpen);

    // Multi-stage Haptics (Suggestion 5)
    useEffect(() => {
        if (isOpen) {
            vibrate('light');
        }
    }, [isOpen]);

    // Filter to "expiring" notes - older than 7 days per memory_review_logic
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

    // Check if review is complete (all processed)
    useEffect(() => {
        if (expiringNotes.length === 0 && processedIds.size > 0 && notes.length > 0) {
            // Only show toast if user actually processed items
            showToast('Memory review complete! ✨', 'success');
        }
    }, [expiringNotes.length, processedIds.size, showToast, notes.length]);

    // No expiring notes at all
    const isEmpty = expiringNotes.length === 0;

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 z-50 overflow-hidden"
            >
                <div className="absolute inset-0 noise-overlay opacity-[0.015]" />
            </div>

            {/* Modal */}
            <div
                className={clsx(
                    "fixed inset-x-0 bottom-0 bg-background rounded-t-[32px] z-50 flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.4)] border-t border-white/5",
                    isEmpty ? "h-[60vh] items-center justify-center" : "h-[75vh]"
                )}
            >
                {isEmpty ? (
                    <>
                        <div className="w-12 h-1.5 bg-neutral-700 rounded-full absolute top-6" />
                        <div><CheckCircle2 size={48} className="text-neutral-600 mb-4 mx-auto" /></div>
                        <p className="text-neutral-500 text-sm font-medium">No notes to review</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-6 py-3 bg-white/10 rounded-full text-white text-sm font-medium"
                        >
                            Close
                        </button>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex-none px-6 pt-3 pb-4 bg-background rounded-t-[32px] border-b border-white/5">
                            <div className="w-12 h-1.5 bg-neutral-700/50 rounded-full mx-auto mb-4" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-tight">Memory Review</h2>
                                    <p className="text-sm text-neutral-500">
                                        {expiringNotes.length} notes due
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={toggleViewMode}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 "
                                    >
                                        {viewMode === 'stack' ? <ListIcon size={18} /> : <Layers size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 relative overflow-hidden mb-6">
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
                    </>
                )}
            </div>
        </>
    );
}

// Stack View - Top card only with buttons
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
    const topNote = notes[0];

    if (!topNote) return null;

    return (
        <div className="relative h-full w-full max-w-sm mx-auto flex flex-col justify-start items-center p-4 pt-2">
            {/* Card Container */}
            <div className="relative w-full aspect-[4/5] max-h-[380px]">
                <StackCard note={topNote} />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4 w-full px-4">
                <button
                    onClick={() => onArchive(topNote.id)}
                    className="flex-1 py-3 bg-white/5 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 "
                >
                    <Archive size={20} className="text-neutral-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Archive</span>
                </button>
                <button
                    onClick={() => onDelete(topNote.id)}
                    className="flex-1 py-3 bg-red-500/10 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 "
                >
                    <Trash2 size={20} className="text-red-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Delete</span>
                </button>
                <button
                    onClick={() => onSave(topNote.id)}
                    className="flex-1 py-3 bg-green-500/10 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 "
                >
                    <Bookmark size={20} className="text-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Save</span>
                </button>
            </div>
        </div>
    );
}

// Individual Stack Card
function StackCard({
    note
}: {
    note: Note;
}) {
    return (
        <div className="absolute inset-0">
            <div className="h-full bg-surface rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden bg-[#121212]">
                {/* Content */}
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
        </div>
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
                    className="bg-surface rounded-2xl p-4 border border-white/5"
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
                                className="p-2 rounded-xl text-green-400 hover:bg-green-500/10 "
                            >
                                <Bookmark size={16} />
                            </button>
                            <button
                                onClick={() => onArchive(note.id)}
                                className="p-2 rounded-xl text-neutral-400 hover:bg-white/5 "
                            >
                                <Archive size={16} />
                            </button>
                            <button
                                onClick={() => onDelete(note.id)}
                                className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 "
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