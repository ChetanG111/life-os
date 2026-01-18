'use client';

import { useState, useMemo } from 'react';
import { FeedItem, SwipeFeed } from './SwipeFeed';
import { ListFeed } from './ListFeed';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate } from '@/utils/haptics';
import { useData } from '@/context/DataContext';
import { Layers, List as ListIcon } from 'lucide-react';

interface FeedProps {
    onOpenSettings: () => void;
    onOpenDetails: (item: any) => void;
    onOpenQuickAdd: (type?: 'task' | 'note') => void;
}

type ViewMode = 'stack' | 'list';

export function Feed({ onOpenSettings, onOpenDetails, onOpenQuickAdd }: FeedProps) {
    const { tasks, notes, removeTask, removeNote, completeTask } = useData();
    const [viewMode, setViewMode] = useState<ViewMode>('stack');

    // 1. Map Data to FeedItems
    // 2. Filter out completed tasks
    const rawItems: FeedItem[] = useMemo(() => {
        const activeTasks = tasks.filter(t => !t.isCompleted);
        
        return [
            ...activeTasks.map(t => ({
                id: `task-${t.id}`,
                originalId: t.id,
                title: t.title,
                type: 'task' as const,
                content: t.description || '',
                priority: t.priority,
                tags: t.tags,
                dueDate: t.dueDate,
                dueTime: t.dueDate ? new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
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
    }, [tasks, notes]);

    // 3. Sort Items: Overdue -> High Priority -> Medium -> Low -> Notes
    const sortedItems = useMemo(() => {
        return [...rawItems].sort((a, b) => {
            const now = new Date().getTime();

            // Helper to check overdue
            const isOverdue = (item: FeedItem) => item.dueDate && new Date(item.dueDate).getTime() < now;

            const aOverdue = isOverdue(a);
            const bOverdue = isOverdue(b);

            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;

            // Priority Sorting
            const priorityScore = { high: 3, medium: 2, low: 1, undefined: 0 };
            const aScore = priorityScore[a.priority || 'undefined'] || 0;
            const bScore = priorityScore[b.priority || 'undefined'] || 0;

            if (aScore > bScore) return -1;
            if (aScore < bScore) return 1;

            return 0;
        });
    }, [rawItems]);

    const handleSwipe = (id: string, action: 'done' | 'dismiss' | 'delete') => {
        const item = sortedItems.find(i => i.id === id);
        if (!item) return;

        if (action === 'delete') {
            if (item.type === 'task') removeTask(item.originalId!);
            else removeNote(item.originalId!);
        } else if (action === 'done') {
            if (item.type === 'task') completeTask(item.originalId!);
            // Notes don't have 'done' state, maybe archive? For now just ignore or delete if intention is clear.
            // In ListFeed, 'done' is swipe right. For notes, let's assume it means 'archive' or 'delete'.
            // But spec says 'mark_done_or_save'. Let's just removeNote for now if it happens for note.
            else removeNote(item.originalId!);
        }
    };

    const toggleView = () => {
        vibrate('medium');
        setViewMode(prev => prev === 'stack' ? 'list' : 'stack');
    };

    return (
        <div className="relative h-full w-full py-safe-top px-4 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="relative flex justify-between items-center py-4 px-2 mb-2 flex-none">
                <div className="w-10" /> {/* Spacer for centering */}
                
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenSettings}
                    className="group flex items-center gap-1.5 focus:outline-none"
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                        Overview
                    </h1>
                </motion.button>

                {/* View Toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleView}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <AnimatePresence mode='wait' initial={false}>
                        {viewMode === 'stack' ? (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                            >
                                <ListIcon size={20} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="stack"
                                initial={{ opacity: 0, rotate: 90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: -90 }}
                            >
                                <Layers size={20} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </header>

            {/* Main Feed Content */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode='wait'>
                    {viewMode === 'stack' ? (
                        <motion.div 
                            key="stack"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className="h-full pb-16"
                        >
                            <SwipeFeed items={sortedItems} onSwipe={handleSwipe} onDetails={(item) => onOpenDetails(item)} />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <ListFeed items={sortedItems} onSwipe={handleSwipe} onDetails={(item) => onOpenDetails(item)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}