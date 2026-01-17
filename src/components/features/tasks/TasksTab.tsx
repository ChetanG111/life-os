'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { CardDetailModal } from '../cards/CardDetailModal';
import { QuickAddModal } from '../overview/QuickAddModal';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { Plus, CheckCircle2 } from 'lucide-react';
import { vibrate } from '@/utils/haptics';

/**
 * TasksTab - Clean, high-performance task list.
 * Implements premium staggered entrance wave from top-to-bottom.
 */

import { UNIVERSAL_STAGGER_CONTAINER, createStaggerItemVariants } from '@/utils/animations';

import { useData } from '@/context/DataContext';

export const TasksTab = ({
    onOpenSettings,
    onModalToggle
}: {
    onOpenSettings: () => void,
    onModalToggle?: (isOpen: boolean) => void
}) => {
    const { tasks, removeTask } = useData();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const springConfig = useSlimySpring();

    // Notify parent of modal state
    useEffect(() => {
        if (onModalToggle) onModalToggle(isQuickAddOpen || !!selectedTask);
    }, [isQuickAddOpen, selectedTask, onModalToggle]);

    const handleRemove = (id: string) => {
        removeTask(id);
    };

    // Sort by priority (High -> Medium -> Low)
    const sortedTasks = useMemo(() => {
        const priorityScore = { high: 0, medium: 1, low: 2 };
        return [...tasks].sort((a, b) => priorityScore[a.priority] - priorityScore[b.priority]);
    }, [tasks]);

    const containerVariants = UNIVERSAL_STAGGER_CONTAINER('standard');
    const itemVariants = createStaggerItemVariants(springConfig);

    return (
        <div className="w-full min-h-screen px-4 py-safe-top bg-background pb-32 flex flex-col">
            <header className="relative flex justify-center items-center py-4 px-2 mb-2">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenSettings}
                    className="group flex items-center gap-1.5 focus:outline-none"
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                        Tasks
                    </h1>
                </motion.button>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 flex flex-col space-y-3"
            >
                <AnimatePresence mode="sync">
                    {sortedTasks.map((task) => (
                        <motion.div
                            key={task.id}
                            variants={itemVariants}
                            layout
                            exit={{
                                opacity: 0,
                                x: -20,
                                transition: { duration: 0.2 }
                            }}
                        >
                            <TaskCard
                                task={task}
                                onRemove={() => handleRemove(task.id)}
                                onTap={() => setSelectedTask(task)}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty state handles - Integrated into stagger */}
                {tasks.length === 0 && (
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
                        className="flex-1 flex flex-col items-center justify-center text-neutral-600 pb-24"
                    >
                        <motion.div variants={itemVariants}>
                            <CheckCircle2 size={48} className="mb-6 opacity-20" />
                        </motion.div>
                        <motion.p
                            variants={itemVariants}
                            className="text-sm font-medium uppercase tracking-[0.2em]"
                        >
                            All caught up
                        </motion.p>
                    </motion.div>
                )}
            </motion.div>

            <CardDetailModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onDelete={() => selectedTask && removeTask(selectedTask.id)}
                onComplete={() => selectedTask && removeTask(selectedTask.id)}
                item={selectedTask ? {
                    id: selectedTask.id,
                    title: selectedTask.title,
                    type: 'task',
                    content: selectedTask.description || 'No description provided.',
                    tags: selectedTask.tags,
                    dueTime: selectedTask.dueTime,
                    priority: selectedTask.priority
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
                className="fixed bottom-10 right-6 w-12 h-12 bg-white text-black rounded-2xl shadow-2xl flex items-center justify-center z-30"
            >
                <Plus size={24} strokeWidth={2.5} />
            </motion.button>

            <QuickAddModal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                initialType="task"
            />
        </div>
    );
};
