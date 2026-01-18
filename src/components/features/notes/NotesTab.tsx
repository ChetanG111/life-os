import { NoteCard } from './NoteCard';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Note } from '@/types';
import clsx from 'clsx';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { StickyNote } from 'lucide-react';

import { UNIVERSAL_STAGGER_CONTAINER, createStaggerItemVariants } from '@/utils/animations';

import { useData } from '@/context/DataContext';

export const NotesTab = ({
    onOpenSettings,
    onOpenDetails,
    onOpenQuickAdd
}: {
    onOpenSettings: () => void,
    onOpenDetails: (item: any) => void,
    onOpenQuickAdd: (type?: 'task' | 'note') => void
}) => {
    const { notes } = useData();
    const springConfig = useSlimySpring();

    const containerVariants = UNIVERSAL_STAGGER_CONTAINER('standard');
    const itemVariants = createStaggerItemVariants(springConfig);

    return (
        <div className="w-full min-h-screen bg-background pb-32 flex flex-col items-center">
            <header className="w-full sticky top-0 z-30 flex justify-center items-center py-4 px-6 liquid-glass mb-4">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenSettings}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                        Notes
                    </h1>
                </motion.button>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className={clsx(
                    "flex-1 pb-8",
                    notes.length > 0 ? "grid grid-cols-2 gap-3 auto-rows-max" : "flex flex-col"
                )}
            >
                {notes.map((note, index) => (
                    <motion.div
                        key={note.id}
                        variants={itemVariants}
                        custom={index}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    >
                        <NoteCard note={note} onTap={() => onOpenDetails({
                            id: note.id,
                            title: note.title || 'Untitled Note',
                            type: 'note',
                            content: note.content,
                            tags: note.tags
                        })} />
                    </motion.div>
                ))}

                {/* Empty state handles - Integrated into stagger */}
                {notes.length === 0 && (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.1
                                }
                            }
                        }}
                        className="flex-1 flex flex-col items-center justify-center text-neutral-600 pb-24 col-span-full"
                    >
                        <motion.div variants={itemVariants}>
                            <StickyNote size={48} className="mb-6 opacity-20" />
                        </motion.div>
                        <motion.p
                            variants={itemVariants}
                            className="text-sm font-medium uppercase tracking-[0.2em]"
                        >
                            No notes yet
                        </motion.p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
