'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Task } from '@/types';
import { mockTasks } from '@/data/mock';
import { TaskCard } from './TaskCard';

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
            staggerChildren: 0.12,
            delayChildren: 0.2,
            when: "beforeChildren"
        }
    }
};

// Item variant controls individual card entrance (Fade + Slide)
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    enter: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 180,
            damping: 24
        }
    }
};

export const TasksTab = () => {
    const [tasks, setTasks] = useState<Task[]>(mockTasks);

    const handleRemove = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // Sort by priority (High -> Medium -> Low)
    const sortedTasks = useMemo(() => {
        const priorityScore = { high: 0, medium: 1, low: 2 };
        return [...tasks].sort((a, b) => priorityScore[a.priority] - priorityScore[b.priority]);
    }, [tasks]);

    return (
        <div className="w-full min-h-screen px-4 py-8 bg-background pb-32">
            <header className="relative flex justify-center items-center py-4 px-2 mb-2">
                <h1 className="text-xl font-bold text-white uppercase tracking-wider">
                    Tasks
                </h1>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col space-y-3"
            >
                <AnimatePresence mode="popLayout" initial={false}>
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
        </div>
    );
};
