'use client';

import { useState, useEffect } from 'react';
import { SwipeFeed, MOCK_ITEMS, FeedItem } from './SwipeFeed';
import { QuickAddModal } from './QuickAddModal';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useData } from '@/context/DataContext';

// Future expansion: Toggle between Switch and List views
type FeedMode = 'stack' | 'list';

interface FeedProps {
    onModalToggle?: (isOpen: boolean) => void;
    onOpenSettings: () => void;
}

export function Feed({ onModalToggle, onOpenSettings }: FeedProps) {
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const { tasks, notes, removeTask, removeNote, addTask } = useData();

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

    // Notify parent when modal state changes to disable/enable main swipes
    useEffect(() => {
        if (onModalToggle) {
            onModalToggle(isQuickAddOpen);
        }
    }, [isQuickAddOpen, onModalToggle]);

    const handleSwipe = (id: string, action: 'done' | 'dismiss' | 'delete') => {
        const item = feedItems.find(i => i.id === id);
        if (!item) return;

        if (action === 'delete') {
            if (item.type === 'task') removeTask(item.originalId!);
            else removeNote(item.originalId!);
        } else if (action === 'done') {
            if (item.type === 'task') removeTask(item.originalId!);
            // Notes don't have a 'done' state usually, but dismissing it from feed
        }
    };

    const handleAdd = (newItem: FeedItem) => {
        // Handled by QuickAddModal directly calling addNote/addTask now, 
        // but keeping it for secondary logic if needed.
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

            {/* Main Feed Content - Shifted up slightly with pb-16/mb-16 logic to accommodate FAB visually if needed, 
                but user asked to "move cards slightly up". We'll use a wrapper with padding-bottom. */}
            <div className="h-[calc(100%-80px)] pb-16">
                <SwipeFeed items={feedItems} onSwipe={handleSwipe} />
            </div>

            {/* Quick Add FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    vibrate('medium');
                    setIsQuickAddOpen(true);
                }}
                className="fixed bottom-10 right-6 w-12 h-12 bg-white text-black rounded-2xl shadow-2xl flex items-center justify-center z-30"
            >
                <Plus size={24} strokeWidth={2.5} />
            </motion.button>

            {/* Quick Add Modal Overlay */}
            <QuickAddModal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                initialType="task"
            />
        </div>
    );
}
