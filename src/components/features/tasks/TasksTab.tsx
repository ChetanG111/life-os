'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Task } from '@/types';
import { mockTasks } from '@/data/mock';
import { TaskCard } from './TaskCard';
import { CardDetailModal } from '../cards/CardDetailModal';
import { useSlimySpring } from '@/hooks/use-slimy-spring';

/**
 * TasksTab - Clean, high-performance task list.
 * Implements premium staggered entrance wave from top-to-bottom.
 */

// Container variant controls the stagger timing
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    enter: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
            when: "beforeChildren"
        }
    }
};

import { useData } from '@/context/DataContext';

export const TasksTab = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
    const { tasks, removeTask } = useData();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const springConfig = useSlimySpring();

    const handleRemove = (id: string) => {
        removeTask(id);
    };

    // Sort by priority (High -> Medium -> Low)
    const sortedTasks = useMemo(() => {
        const priorityScore = { high: 0, medium: 1, low: 2 };
        return [...tasks].sort((a, b) => priorityScore[a.priority] - priorityScore[b.priority]);
    }, [tasks]);

    // Item variant controls individual card entrance (Fade + Slide + Overshoot)
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        enter: { opacity: 0, y: 30, scale: 0.9 },
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
                        Tasks
                    </h1>
                </motion.button>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col space-y-3"
            >
                <AnimatePresence mode="popLayout">
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
            </motion.div>

            {/* Empty state handles */}
            {tasks.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center pt-20 text-neutral-600"
                >
                    <p className="text-sm font-medium uppercase tracking-widest">Completed everything</p>
                </motion.div>
            )}

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
        </div>
    );
};
