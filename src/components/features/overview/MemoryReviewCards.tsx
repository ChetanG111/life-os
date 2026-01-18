'use client';

import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform, Variants, useDragControls } from 'framer-motion';
import { vibrate } from '@/utils/haptics';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useMemo, useState, useEffect } from 'react';
import { Archive, Trash2, Bookmark, Clock, Layers, List as ListIcon, CheckCircle2 } from 'lucide-react';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { Note } from '@/types';
import { UNIVERSAL_STAGGER_CONTAINER, createStaggerItemVariants, UNIVERSAL_MODAL_VARIANTS } from '@/utils/animations';
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
    const springConfig = useSlimySpring();
    const dragControls = useDragControls();
    const [viewMode, setViewMode] = useState<ViewMode>('stack');
    const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

    useLockBodyScroll(isOpen);

    // Multi-stage Haptics (Suggestion 5)
    useEffect(() => {
        if (isOpen) {
            vibrate('light');
            const timer = setTimeout(() => vibrate('soft'), 150);
            return () => clearTimeout(timer);
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

    const modalVariants = UNIVERSAL_MODAL_VARIANTS(springConfig);
    const slimyItem = createStaggerItemVariants(springConfig);

    // Check if review is complete
    useEffect(() => {
        if (expiringNotes.length === 0 && processedIds.size > 0) {
            showToast('Memory review complete! ✨', 'success');
            onClose();
        }
    }, [expiringNotes.length, processedIds.size, onClose, showToast]);

    if (expiringNotes.length === 0 && processedIds.size > 0) {
        return null;
    }

    // No expiring notes at all
    const isEmpty = expiringNotes.length === 0;

    return (
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

            {/* Modal */}
            <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                drag="y"
                dragControls={dragControls}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.05, bottom: 0.7 }}
                onDragEnd={(_, info) => {
                    if (info.offset.y > 100 || info.velocity.y > 300) {
                        vibrate('light');
                        onClose();
                    }
                }}
                className={clsx(
                    "fixed inset-x-0 bottom-0 bg-background rounded-t-[32px] z-50 flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.4)] border-t border-white/5",
                    isEmpty ? "h-[60vh] items-center justify-center" : "h-[75vh]"
                )}
            >
                {isEmpty ? (
                    <>
                        <div className="w-12 h-1.5 bg-neutral-700 rounded-full absolute top-6" />
                        <motion.div variants={slimyItem}><CheckCircle2 size={48} className="text-neutral-600 mb-4" /></motion.div>
                        <motion.p variants={slimyItem} className="text-neutral-500 text-sm font-medium">No notes to review</motion.p>
                        <motion.button
                            variants={slimyItem}
                            onClick={onClose}
                            className="mt-6 px-6 py-3 bg-white/10 rounded-full text-white text-sm font-medium"
                        >
                            Close
                        </motion.button>
                    </>
                ) : (
                    <>
                        {/* Header & Drag Handle */}
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex-none px-6 pt-3 pb-4 cursor-grab active:cursor-grabbing touch-none bg-background rounded-t-[32px] border-b border-white/5"
                        >
                            <div className="w-12 h-1.5 bg-neutral-700/50 rounded-full mx-auto mb-4" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <motion.h2 custom={0} variants={slimyItem} className="text-xl font-bold text-white leading-tight">Memory Review</motion.h2>
                                    <motion.p custom={1} variants={slimyItem} className="text-sm text-neutral-500">
                                        {expiringNotes.length} notes due
                                    </motion.p>
                                </div>
                                <motion.div custom={2} variants={slimyItem} className="flex items-center gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={toggleViewMode}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <AnimatePresence mode="wait" initial={false}>
                                            <motion.div
                                                key={viewMode}
                                                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {viewMode === 'stack' ? <ListIcon size={18} /> : <Layers size={18} />}
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <motion.div custom={3} variants={slimyItem} className="flex-1 relative overflow-hidden mb-6">
                            <div className="h-full w-full overscroll-contain touch-pan-y">
                                {viewMode === 'stack' ? (
                                    <StackView
                                        key="stack"
                                        notes={expiringNotes}
                                        onSave={handleSavePermanently}
                                        onArchive={handleArchive}
                                        onDelete={handleDelete}
                                        springConfig={springConfig}
                                    />
                                ) : (
                                    <ListView
                                        key="list"
                                        notes={expiringNotes}
                                        onSave={handleSavePermanently}
                                        onArchive={handleArchive}
                                        onDelete={handleDelete}
                                    />
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </>
    );
}

// Stack View - Cards stacked like SwipeFeed with stagger
function StackView({
    notes,
    onSave,
    onArchive,
    onDelete,
    springConfig
}: {
    notes: Note[];
    onSave: (id: string) => void;
    onArchive: (id: string) => void;
    onDelete: (id: string) => void;
    springConfig: any;
}) {
    const topNote = notes[0];

    const containerVariants = UNIVERSAL_STAGGER_CONTAINER('modal');

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative h-full w-full max-w-sm mx-auto flex flex-col justify-start items-center p-4 pt-2"
        >
            {/* Card Stack Container */}
            <div className="relative w-full aspect-[4/5] max-h-[380px]">
                <AnimatePresence>
                    {notes.slice(0, 3).reverse().map((note, index) => {
                        const isTop = note.id === topNote.id;
                        const stackIndex = notes.slice(0, 3).length - 1 - index;

                        return (
                            <StackCard
                                key={note.id}
                                note={note}
                                isTop={isTop}
                                stackIndex={stackIndex}
                                onSave={() => onSave(note.id)}
                                onArchive={() => onArchive(note.id)}
                                onDelete={() => onDelete(note.id)}
                                springConfig={springConfig}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Swipe Hints */}
            <div className="mt-4 flex justify-center gap-6 text-xs text-neutral-600 font-medium uppercase tracking-wider">
                <span>← Archive</span>
                <span>↓ Delete</span>
                <span>Save →</span>
            </div>
        </motion.div>
    );
}

// Individual Stack Card
function StackCard({
    note,
    isTop,
    stackIndex,
    onSave,
    onArchive,
    onDelete,
    springConfig
}: {
    note: Note;
    isTop: boolean;
    stackIndex: number;
    onSave: () => void;
    onArchive: () => void;
    onDelete: () => void;
    springConfig: any;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-8, 8]);

    // Visual indicators
    const bgRightOpacity = useTransform(x, [40, 120], [0, 1]);
    const bgLeftOpacity = useTransform(x, [-120, -40], [1, 0]);
    const bgDownOpacity = useTransform(y, [40, 100], [0, 1]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100;
        const { x: offsetX, y: offsetY } = info.offset;

        if (offsetX > threshold) {
            onSave();
        } else if (offsetX < -threshold) {
            onArchive();
        } else if (offsetY > 80) {
            onDelete();
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        show: (i: number) => ({
            opacity: 1,
            y: stackIndex * 12,
            scale: 1 - (stackIndex * 0.03),
            zIndex: 10 - stackIndex,
            transition: {
                ...springConfig,
                delay: i * 0.02 + (Math.pow(i, 1.2) * 0.005)
            }
        }),
        exit: {
            x: x.get() > 50 ? 400 : (x.get() < -50 ? -400 : 0),
            y: y.get() > 50 ? 400 : 0,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            custom={stackIndex}
            style={{
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
            }}
            drag={isTop}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.6}
            onDragStart={() => vibrate('light')}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing will-change-transform"
        >
            <div className="h-full bg-surface rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
                {/* Swipe Indicators */}
                <motion.div
                    style={{ opacity: bgRightOpacity }}
                    className="absolute inset-0 bg-green-500/10 flex items-center justify-center pointer-events-none z-20"
                >
                    <Bookmark size={48} className="text-green-500/30" />
                </motion.div>
                <motion.div
                    style={{ opacity: bgLeftOpacity }}
                    className="absolute inset-0 bg-white/5 flex items-center justify-center pointer-events-none z-20"
                >
                    <Archive size={48} className="text-white/20" />
                </motion.div>
                <motion.div
                    style={{ opacity: bgDownOpacity }}
                    className="absolute inset-0 bg-red-500/10 flex items-center justify-center pointer-events-none z-20"
                >
                    <Trash2 size={48} className="text-red-500/30" />
                </motion.div>

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
        </motion.div>
    );
}

// List View with stagger animation
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
    const springConfig = useSlimySpring();
    const containerVariants = UNIVERSAL_STAGGER_CONTAINER('modal');
    const itemVariants = createStaggerItemVariants(springConfig);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="h-full overflow-y-auto px-6 pb-8 space-y-3"
        >
            {notes.map((note, index) => (
                <motion.div
                    key={note.id}
                    variants={itemVariants}
                    custom={index}
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
                </motion.div>
            ))}
        </motion.div>
    );
}
