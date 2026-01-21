'use client';

import { Task } from '@/types';
import { useState } from 'react';
import clsx from 'clsx';
import { Check, Trash2, Clock } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { SLIMY_CONFIG, LEFT_STAGGER_VARIANT } from '@/utils/animations';

interface TaskCardProps {
    task: Task;
    onComplete: () => void;
    onDelete: () => void;
    onTap?: () => void;
}

export const TaskCard = ({ task, onComplete, onDelete, onTap }: TaskCardProps) => {
    const x = useMotionValue(0);
    // Background opacity logic: Reveal colors as you drag
    const deleteOpacity = useTransform(x, [20, 80], [0, 1]);
    const completeOpacity = useTransform(x, [-80, -20], [1, 0]);
    const deleteScale = useTransform(x, [20, 120], [0.8, 1.2]); // Grow icon on long pull
    const completeScale = useTransform(x, [-120, -20], [1.2, 0.8]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        const threshold = 100;
        const autoTrigger = 180;

        if (offset > autoTrigger) {
            vibrate('warning');
            onDelete();
        } else if (offset < -autoTrigger) {
            vibrate('success');
            onComplete();
        } else if (offset > threshold) {
            vibrate('medium');
            onDelete();
        } else if (offset < -threshold) {
            vibrate('success');
            onComplete();
        }
    };

    const priorityColors = {
        high: 'bg-[#EF4444]',
        medium: 'bg-[#F59E0B]',
        low: 'bg-[#3B82F6]'
    };

    return (
        <motion.div
            layout // Enable layout projection for smooth list reordering
            variants={LEFT_STAGGER_VARIANT}
            // Removed manual initial/animate/exit to allow variants to work
            className="relative w-full overflow-hidden mb-3"
        >
            <div className="relative w-full h-[72px]">
                {/* Background Actions */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden flex z-0 bg-neutral-900">
                    {/* Complete (Left) */}
                    <motion.div style={{ opacity: completeOpacity }} className="absolute inset-y-0 left-0 w-full bg-green-500 flex items-center justify-start pl-6">
                        <motion.div style={{ scale: completeScale }}>
                            <Check className="text-white w-6 h-6" />
                        </motion.div>
                    </motion.div>

                    {/* Delete (Right) */}
                    <motion.div style={{ opacity: deleteOpacity }} className="absolute inset-y-0 right-0 w-full bg-red-500 flex items-center justify-end pr-6">
                        <motion.div style={{ scale: deleteScale }}>
                            <Trash2 className="text-white w-6 h-6" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Foreground Card */}
                <motion.div
                    style={{ x }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.4} // ~40% allowance as requested
                    onDragEnd={handleDragEnd}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (Math.abs(x.get()) < 5 && onTap) {
                            vibrate('light');
                            onTap();
                        }
                    }}
                    className={clsx(
                        "absolute inset-0 bg-neutral-900 md:bg-neutral-800/40 rounded-2xl flex items-center px-6 z-10",
                        "border border-white/5 md:border-white/10 shadow-md shadow-black/20 cursor-grab active:cursor-grabbing"
                    )}
                >
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <div className={clsx("w-2.5 h-2.5 rounded-full flex-shrink-0", priorityColors[task.priority])} />
                            <h3 className="text-white text-[15px] md:text-lg font-bold md:font-semibold truncate leading-tight tracking-wide">
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

                    {/* Tag Badge */}
                    {task.tags.length > 0 && (
                        <div className="bg-white/5 px-2.5 py-1 md:py-0.5 rounded-full md:rounded-lg border border-white/5 flex-shrink-0">
                            <span className="text-[10px] md:text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 md:text-blue-300/60">
                                {task.tags[0]}
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};