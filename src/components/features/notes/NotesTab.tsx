'use client';

import { NoteCard } from './NoteCard';
import { mockNotes } from '@/data/mock';

export const NotesTab = () => {
    return (
        <div className="w-full min-h-screen px-4 py-6 bg-background pb-32">
            <header className="mb-6 px-1 text-center">
                <h1 className="text-3xl font-bold text-white tracking-tight">Notes</h1>
            </header>

            {/* Masonry Layout using CSS Columns */}
            <div className="columns-2 gap-3 space-y-3 pb-8">
                {mockNotes.map(note => (
                    <NoteCard key={note.id} note={note} />
                ))}
            </div>
        </div>
    );
};
