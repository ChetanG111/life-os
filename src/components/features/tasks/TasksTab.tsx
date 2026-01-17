'use client';

import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { mockTasks } from '@/data/mock';
import { useMemo } from 'react';

export const TasksTab = () => {
    // Sort logic: High -> Medium -> Low
    const sortedTasks = useMemo(() => {
        const high = mockTasks.filter(t => t.priority === 'high');
        const medium = mockTasks.filter(t => t.priority === 'medium');
        const low = mockTasks.filter(t => t.priority === 'low');
        return { high, medium, low };
    }, []);

    const Section = ({ title, tasks, color }: { title: string, tasks: Task[], color: string }) => {
        if (tasks.length === 0) return null;
        return (
            <div className="mb-8">
                <h2 className={`text-[13px] font-semibold tracking-wide uppercase mb-4 pl-1 ${color}`}>
                    {title}
                </h2>
                <div className="flex flex-col">
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen px-4 py-6 bg-background pb-32">
            <header className="mb-8 px-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
                <p className="text-neutral-500 text-sm font-medium mt-1">
                    {mockTasks.length} pending tasks for today
                </p>
            </header>

            <Section title="High Priority" tasks={sortedTasks.high} color="text-red-500" />
            <Section title="Medium Priority" tasks={sortedTasks.medium} color="text-amber-500" />
            <Section title="Low Priority" tasks={sortedTasks.low} color="text-blue-500" />
        </div>
    );
};
