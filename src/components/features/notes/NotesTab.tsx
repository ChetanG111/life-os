import { NoteCard } from './NoteCard';
import { mockNotes } from '@/data/mock';
import { motion, Variants } from 'framer-motion';
import { useState } from 'react';
import { Note } from '@/types';
import { CardDetailModal } from '../cards/CardDetailModal';
import { QuickAddModal } from '../overview/QuickAddModal';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { Plus } from 'lucide-react';
import { vibrate } from '@/utils/haptics';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

import { useData } from '@/context/DataContext';

export const NotesTab = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
    const { notes, removeNote } = useData();
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const springConfig = useSlimySpring();

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: springConfig
        }
    };

    return (
        <div className="w-full min-h-screen px-4 py-safe-top bg-background pb-32">
            <header className="relative flex justify-center items-center py-4 px-2 mb-2">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenSettings}
                    className="group flex items-center gap-1.5 focus:outline-none"
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
                className="columns-2 gap-3 space-y-3 pb-8"
            >
                {notes.map(note => (
                    <motion.div key={note.id} variants={itemVariants} className="break-inside-avoid">
                        <NoteCard note={note} onTap={() => setSelectedNote(note)} />
                    </motion.div>
                ))}
            </motion.div>

            <CardDetailModal
                isOpen={!!selectedNote}
                onClose={() => setSelectedNote(null)}
                onDelete={() => selectedNote && removeNote(selectedNote.id)}
                onComplete={() => selectedNote && removeNote(selectedNote.id)}
                item={selectedNote ? {
                    id: selectedNote.id,
                    title: selectedNote.title || 'Untitled Note',
                    type: 'note',
                    content: selectedNote.content,
                    tags: selectedNote.tags
                } : null}
            />
            {/* Quick Add FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    vibrate('medium');
                    setIsQuickAddOpen(true);
                }}
                className="absolute bottom-10 right-6 w-12 h-12 bg-white text-black rounded-2xl shadow-2xl flex items-center justify-center z-30"
            >
                <Plus size={24} strokeWidth={2.5} />
            </motion.button>

            <QuickAddModal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                initialType="note"
            />
        </div>
    );
};
