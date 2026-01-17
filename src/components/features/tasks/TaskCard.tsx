'use client';

import { Task } from '@/types';
import { motion, PanInfo } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';
import { Check, Trash2, Clock } from 'lucide-react';
import { vibrate } from '@/utils/haptics';

interface TaskCardProps {
    task: Task;
}

export const TaskCard = ({ task }: TaskCardProps) => {
    const [offset, setOffset] = useState(0);
    const [isComplete, setIsComplete] = useState(task.isCompleted);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            // Swiped right - Complete
            vibrate('success');
            setIsComplete(true);
        } else if (info.offset.x < -100) {
            // Swiped left - Dismiss/Delete logic would go here
            vibrate('light');
            setOffset(0);
        } else {
            setOffset(0);
        }
    };

    const handleTap = () => {
        vibrate('light');
    };

    const priorityColors = {
        high: 'bg-red-500',
        medium: 'bg-amber-500',
        low: 'bg-blue-500'
    };

    if (isComplete) return null; // Simple completion logic for now

    return (
        <div className="relative w-full h-[72px] mb-1">
            {/* Background Actions */}
            <div className="absolute inset-0 rounded-2xl flex overflow-hidden">
                <div className="w-1/2 bg-green-500/20 flex items-center justify-start pl-6">
                    <Check className="text-green-500 w-6 h-6" />
                </div>
                <div className="w-1/2 bg-red-500/20 flex items-center justify-end pr-6">
                    <Trash2 className="text-red-500 w-6 h-6" />
                </div>
            </div>

            {/* Foreground Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                onTap={handleTap}
                style={{ x: offset }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                    "absolute inset-0 bg-[#1A1A1A] rounded-2xl flex items-center px-4",
                    "border border-white/5 shadow-sm active:cursor-grabbing cursor-grab"
                )}
            >
                {/* Priority Dot */}
                <div className={clsx("w-3 h-3 rounded-full mr-4 flex-shrink-0", priorityColors[task.priority])} />

                {/* Content */}
                <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-white text-[15px] font-medium truncate leading-tight">
                        {task.title}
                    </h3>
                    {task.dueTime && (
                        <div className="flex items-center mt-1 space-x-1.5 text-neutral-400">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium">{task.dueTime}</span>
                        </div>
                    )}
                </div>

                {/* Tag */}
                {task.tags.length > 0 && (
                    <div className="bg-white/5 px-2.5 py-1 rounded-full border border-white/5 flex-shrink-0">
                        <span className="text-[11px] font-medium text-neutral-400">
                            {task.tags[0]}
                        </span>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
