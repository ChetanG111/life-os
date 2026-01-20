'use client';

import { useMemo, useState } from 'react';
import { TaskCard } from './TaskCard';
import { CheckCircle2 } from 'lucide-react';

import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useSettings } from '@/context/SettingsContext';
import { ConfirmDeleteModal } from '../cards/ConfirmDeleteModal';

export const TasksTab = ({
    onOpenSettings,
    onOpenDetails,
    onOpenQuickAdd
}: {
    onOpenSettings: () => void,
    onOpenDetails: (item: any) => void,
    onOpenQuickAdd: (type?: 'task' | 'note') => void
}) => {
    const { tasks, removeTask, completeTask } = useData();
    const { showToast } = useToast();
    const { confirmDelete } = useSettings();
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    const handleComplete = (id: string) => {
        completeTask(id);
        showToast('Task completed! 🎉', 'success');
    };

    const handleDeleteRequested = (id: string) => {
        if (confirmDelete) {
            setTaskToDelete(id);
        } else {
            removeTask(id);
            showToast('Task deleted', 'info');
        }
    };

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            removeTask(taskToDelete);
            showToast('Task deleted', 'info');
            setTaskToDelete(null);
        }
    };

    // Filter out completed tasks and sort by priority (High -> Medium -> Low)
    const sortedTasks = useMemo(() => {
        const priorityScore = { high: 0, medium: 1, low: 2 };
        return [...tasks]
            .filter(t => !t.isCompleted)
            .sort((a, b) => priorityScore[a.priority] - priorityScore[b.priority]);
    }, [tasks]);

    return (
        <div className="w-full min-h-screen bg-background pb-32 flex flex-col items-center">
            <header className="w-full sticky top-0 z-30 flex justify-center items-center py-4 px-6 bg-background border-b border-white/5 mb-4">
                <button
                    onClick={onOpenSettings}
                    className="group flex flex-col items-center gap-1 focus:outline-none active:scale-95 "
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 ">
                        Tasks
                    </h1>
                </button>
            </header>

            <div className="w-full max-w-2xl flex-1 flex flex-col space-y-4 px-4">
                {sortedTasks.map((task) => (
                    <div key={task.id}>
                        <TaskCard
                            task={task}
                            onComplete={() => handleComplete(task.id)}
                            onDelete={() => handleDeleteRequested(task.id)}
                            onTap={() => onOpenDetails({
                                id: `task-${task.id}`,
                                originalId: task.id,
                                title: task.title,
                                type: 'task',
                                content: task.description || 'No description provided.',
                                tags: task.tags,
                                dueTime: task.dueTime,
                                priority: task.priority
                            })}
                        />
                    </div>
                ))}

                {/* Empty state handles */}
                {sortedTasks.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 pb-24">
                        <div>
                            <CheckCircle2 size={48} className="mb-6 opacity-20" />
                        </div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em]">
                            No tasks yet
                        </p>
                    </div>
                )}
            </div>

            <ConfirmDeleteModal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Task?"
            />
        </div>
    );
};