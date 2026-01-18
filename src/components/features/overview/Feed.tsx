'use client';

import { useState, useMemo } from 'react';
import { FeedItem, SwipeFeed } from './SwipeFeed';
import { ListFeed } from './ListFeed';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate } from '@/utils/haptics';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { Layers, List as ListIcon, Settings as SettingsIcon } from 'lucide-react';

interface FeedProps {
    onOpenSettings: () => void;
    onOpenDetails: (item: any) => void;
    onOpenQuickAdd: (type?: 'task' | 'note') => void;
}

type ViewMode = 'stack' | 'list';

export function Feed({ onOpenSettings, onOpenDetails, onOpenQuickAdd }: FeedProps) {
    const { tasks, notes, removeTask, removeNote, completeTask } = useData();
    const { showToast } = useToast();
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
            if (item.type === 'task') {
                removeTask(item.originalId!);
                showToast('Task deleted', 'info');
            } else {
                removeNote(item.originalId!);
                showToast('Note deleted', 'info');
            }
        } else if (action === 'done') {
            if (item.type === 'task') {
                completeTask(item.originalId!);
                showToast('Task completed! 🎉', 'success');
            } else {
                // Notes: save/archive action
                removeNote(item.originalId!);
                showToast('Note saved', 'success');
            }
        }
    };

    const toggleView = () => {
        vibrate('medium');
        setViewMode(prev => prev === 'stack' ? 'list' : 'stack');
    };

    return (
        <div className="relative h-full w-full bg-background overflow-hidden flex flex-col">
            {/* Header */}
            <header className="w-full sticky top-0 z-30 flex justify-center items-center py-4 px-6 liquid-glass mb-4 flex-none">
                {/* Header Actions */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {/* Settings: Desktop Only */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onOpenSettings}
                        className="hidden md:flex w-10 h-10 items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <SettingsIcon size={20} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleView}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                        {viewMode === 'stack' ? <ListIcon size={18} /> : <Layers size={18} />}
                    </motion.button>
                </div>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenSettings}
                    className="group focus:outline-none"
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                        Overview
                    </h1>
                </motion.button>
            </header>

            {/* Main Feed Content */}
            <div className="flex-1 relative overflow-hidden">
                <div className="h-full w-full">
                    {viewMode === 'stack' ? (
                        <motion.div
                            key="stack"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="h-full pb-16"
                        >
                            <SwipeFeed items={sortedItems} onSwipe={handleSwipe} onDetails={(item) => onOpenDetails(item)} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="h-full"
                        >
                            <ListFeed items={sortedItems} onSwipe={handleSwipe} onDetails={(item) => onOpenDetails(item)} />
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}