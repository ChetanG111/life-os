import { NoteCard } from './NoteCard';
import { mockNotes } from '@/data/mock';
import { motion, Variants } from 'framer-motion';
import { useState } from 'react';
import { Note } from '@/types';
import { CardDetailModal } from '../cards/CardDetailModal';

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

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 350,
            damping: 18
        }
    }
};

export const NotesTab = () => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

    return (
        <div className="w-full min-h-screen px-4 py-safe-top bg-background pb-32">
            <header className="relative flex justify-center items-center py-4 px-2 mb-2">
                <h1 className="text-xl font-bold text-white uppercase tracking-wider">Notes</h1>
            </header>

            {/* Masonry Layout using CSS Columns */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="columns-2 gap-3 space-y-3 pb-8"
            >
                {mockNotes.map(note => (
                    <motion.div key={note.id} variants={itemVariants} className="break-inside-avoid">
                        <NoteCard note={note} onTap={() => setSelectedNote(note)} />
                    </motion.div>
                ))}
            </motion.div>

            <CardDetailModal 
                isOpen={!!selectedNote}
                onClose={() => setSelectedNote(null)}
                item={selectedNote ? {
                    id: selectedNote.id,
                    title: selectedNote.title || 'Untitled Note',
                    type: 'note',
                    content: selectedNote.content,
                    tags: selectedNote.tags
                } : null}
            />
        </div>
    );
};
