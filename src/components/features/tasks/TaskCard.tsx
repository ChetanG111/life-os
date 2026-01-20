'use client';

import { Task } from '@/types';
import { useState } from 'react';
import clsx from 'clsx';
import { Check, Clock } from 'lucide-react';
import { vibrate } from '@/utils/haptics';

interface TaskCardProps {
    task: Task;
    onComplete: () => void;
    onDelete: () => void;
    onTap?: () => void;
}

export const TaskCard = ({ task, onComplete, onDelete, onTap }: TaskCardProps) => {
    const [isCompleting, setIsCompleting] = useState(false);

    const priorityColors = {
        high: 'bg-[#EF4444]',
        medium: 'bg-[#F59E0B]',
        low: 'bg-[#3B82F6]'
    };

    return (
        <div className="relative w-full h-[72px]">
            {/* The Main Interactive Card */}
            <div
                onClick={() => {
                    if (onTap) {
                        vibrate('light');
                        onTap();
                    }
                }}
                className={clsx(
                    "absolute inset-0 bg-neutral-900 md:bg-neutral-800/40 rounded-2xl flex items-center px-6 z-10",
                    "border border-white/5 md:border-white/10 shadow-md shadow-black/20 active:bg-neutral-800  cursor-pointer",
                    isCompleting && "border-green-500/30"
                )}
            >
                {/* Checkbox (Visible on all screens now) */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        vibrate('success');
                        setIsCompleting(true);
                        // Small delay to show state change if needed, or just instant
                        onComplete();
                    }}
                    className="flex w-6 h-6 rounded-full border-2 border-neutral-600 hover:border-green-500 hover:bg-green-500/10  mr-6 items-center justify-center flex-shrink-0 cursor-pointer"
                >
                    <Check size={12} className="text-green-500 opacity-0 group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                        {/* Priority Dot */}
                        <div className={clsx("w-2.5 h-2.5 rounded-full flex-shrink-0", priorityColors[task.priority])} />
                        <h3 className={clsx(
                            "text-white text-[15px] md:text-lg font-bold md:font-semibold truncate leading-tight   tracking-wide",
                            isCompleting && "text-green-400"
                        )}>
                            {task.title}
                        </h3>
                    </div>
                    {(task.dueTime || task.dueDate) && (
                        <div className="flex items-center mt-1 space-x-1.5 text-neutral-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm font-medium md:font-normal opacity-70 uppercase tracking-tight">
                                {task.dueDate ? new Date(task.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : task.dueTime}
                            </span>
                        </div>
                    )}
                </div>

                {/* Tag / Category Badge (Image 1) */}
                {task.tags.length > 0 && (
                    <div className="bg-white/5 px-2.5 py-1 md:py-0.5 rounded-full md:rounded-lg border border-white/5 flex-shrink-0">
                        <span className="text-[10px] md:text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 md:text-blue-300/60">
                            {task.tags[0]}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};