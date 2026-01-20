'use client';

import { NoteCard } from './NoteCard';
import clsx from 'clsx';
import { StickyNote } from 'lucide-react';
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

    return (
        <div className="w-full min-h-screen bg-background pb-32 flex flex-col items-center">
            <header className="w-full sticky top-0 z-30 flex justify-center items-center py-4 px-6 bg-background border-b border-white/5 mb-4">
                <button
                    onClick={onOpenSettings}
                    className="group flex flex-col items-center gap-1 focus:outline-none active:scale-95 "
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 ">
                        Notes
                    </h1>
                </button>
            </header>

            <div
                className={clsx(
                    "flex-1 pb-8",
                    notes.length > 0 ? "grid grid-cols-2 gap-3 auto-rows-max" : "flex flex-col"
                )}
            >
                {notes.map((note) => (
                    <div key={note.id}>
                        <NoteCard note={note} onTap={() => onOpenDetails({
                            id: note.id,
                            title: note.title || 'Untitled Note',
                            type: 'note',
                            content: note.content,
                            tags: note.tags
                        })} />
                    </div>
                ))}

                {/* Empty state handles */}
                {notes.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 pb-24 col-span-full">
                        <div>
                            <StickyNote size={48} className="mb-6 opacity-20" />
                        </div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em]">
                            No notes yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};