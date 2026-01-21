'use client';

import { NoteCard } from './NoteCard';
import clsx from 'clsx';
import { StickyNote } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { STAGGER_CHILDREN, OVERSHOOT_VARIANT, SLIMY_CONFIG } from '@/utils/animations';

export const NotesTab = ({
    onOpenSettings,
    onOpenDetails,
    onOpenQuickAdd
}: {
    onOpenSettings: () => void,
    onOpenDetails: (item: any) => void,
    onOpenQuickAdd: (type?: 'task' | 'note') => void,
    onEdit: (item: any) => void
}) => {
    const { notes } = useData();

    return (
        <div className="w-full min-h-screen bg-background pb-32 flex flex-col items-center">
            <header className="w-full sticky top-0 z-30 flex justify-center items-center py-4 px-6 bg-background border-b border-white/5 mb-4">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onOpenSettings}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                        Notes
                    </h1>
                </motion.button>
            </header>

            <motion.div
                layout
                variants={STAGGER_CHILDREN}
                initial="hidden"
                animate="show"
                className={clsx(
                    "flex-1 pb-8 w-full max-w-2xl px-4",
                    notes.length > 0 ? "grid grid-cols-2 gap-3 auto-rows-max" : "flex flex-col"
                )}
            >
                <AnimatePresence mode="popLayout">
                    {notes.map((note) => (
                        <motion.div
                            key={note.id}
                            layout
                            variants={OVERSHOOT_VARIANT}
                        >
                            <NoteCard note={note} onTap={() => onOpenDetails({
                                id: note.id,
                                originalId: note.id,
                                title: note.title || 'Untitled Note',
                                type: 'note',
                                content: note.content,
                                tags: note.tags,
                                images: note.images
                            })} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty state handles */}
                {notes.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={SLIMY_CONFIG}
                        className="flex-1 flex flex-col items-center justify-center text-neutral-600 pb-24 col-span-full"
                    >
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
                            <StickyNote size={48} className="mb-6 opacity-20" />
                        </motion.div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em]">
                            No notes yet
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};