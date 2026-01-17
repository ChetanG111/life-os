'use client';

import { FeedItem, SwipeFeed } from './SwipeFeed';
import { motion } from 'framer-motion';
import { vibrate } from '@/utils/haptics';
import { useData } from '@/context/DataContext';

interface FeedProps {
    onOpenSettings: () => void;
    onOpenDetails: (item: any) => void;
    onOpenQuickAdd: (type?: 'task' | 'note') => void;
}

export function Feed({ onOpenSettings, onOpenDetails, onOpenQuickAdd }: FeedProps) {
    const { tasks, notes, removeTask, removeNote } = useData();

    // Map Tasks and Notes to FeedItems
    const feedItems: FeedItem[] = [
        ...tasks.map(t => ({
            id: `task-${t.id}`,
            originalId: t.id,
            title: t.title,
            type: 'task' as const,
            content: t.description || '',
            priority: t.priority,
            tags: t.tags
        })),
        ...notes.map(n => ({
            id: `note-${n.id}`,
            originalId: n.id,
            title: n.title || 'Untitled Note',
            type: 'note' as const,
            content: n.content,
            tags: n.tags
        }))
    ];

    const handleSwipe = (id: string, action: 'done' | 'dismiss' | 'delete') => {
        const item = feedItems.find(i => i.id === id);
        if (!item) return;

        if (action === 'delete') {
            if (item.type === 'task') removeTask(item.originalId!);
            else removeNote(item.originalId!);
        } else if (action === 'done') {
            if (item.type === 'task') removeTask(item.originalId!);
        }
    };

    return (
        <div className="relative h-full w-full py-safe-top px-4 overflow-hidden">
            {/* Header */}
            <header className="relative flex justify-center items-center py-4 px-2 mb-2">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenSettings}
                    className="group flex items-center gap-1.5 focus:outline-none"
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                        Overview
                    </h1>
                </motion.button>
            </header>

            {/* Main Feed Content */}
            <div className="h-[calc(100%-80px)] pb-16">
                <SwipeFeed items={feedItems} onSwipe={handleSwipe} onDetails={(item) => onOpenDetails(item)} />
            </div>
        </div>
    );
}
