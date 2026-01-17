'use client';

import { NoteCard } from './NoteCard';
import { mockNotes } from '@/data/mock';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    }
};

export const NotesTab = () => {
    return (
        <div className="w-full min-h-screen px-4 py-6 bg-background pb-32">
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
                        <NoteCard note={note} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};
