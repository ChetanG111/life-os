'use client';

import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { mockTasks } from '@/data/mock';
import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

export const TasksTab = () => {
    const [tasks, setTasks] = useState<Task[]>(mockTasks);

    const handleRemove = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // Sort logic: High -> Medium -> Low
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }, [tasks]);

    return (
        <div className="w-full min-h-screen px-4 py-6 bg-background pb-32">
            <header className="mb-8 px-1 text-center">
                <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
            </header>

            <div className="flex flex-col space-y-2">
                <AnimatePresence mode="popLayout" initial={false}>
                    {sortedTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onRemove={() => handleRemove(task.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
