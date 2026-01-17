'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import { TaskCard } from '@/components/features/tasks/TaskCard';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface DayItemProps {
    dayName: string;
    dayNumber: string;
    tasks: Task[];
    summary?: string;
    isToday?: boolean;
}

export const DayItem = ({ dayName, dayNumber, tasks, summary, isToday = false }: DayItemProps) => {
    const [isOpen, setIsOpen] = useState(isToday);

    const completionCount = tasks.filter(t => t.isCompleted).length;
    const totalCount = tasks.length;
    const progress = totalCount === 0 ? 0 : (completionCount / totalCount) * 100;

    return (
        <div className="mb-2">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200",
                    isOpen ? "bg-[var(--surface)]" : "bg-transparent hover:bg-white/5"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "w-10 h-10 flex flex-col items-center justify-center rounded-xl border",
                        isToday
                            ? "bg-white text-black border-white"
                            : "bg-[var(--surface)] text-neutral-400 border-white/5"
                    )}>
                        <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{dayName.slice(0, 3)}</span>
                        <span className="text-sm font-semibold leading-none">{dayNumber}</span>
                    </div>

                    <div className="flex flex-col items-start">
                        <span className={clsx("text-sm font-medium", isToday ? "text-white" : "text-neutral-300")}>
                            {tasks.length > 0 ? `${tasks.length} Tasks` : 'No tasks'}
                        </span>
                        {summary && (
                            <span className="text-xs text-neutral-500 font-medium truncate max-w-[150px]">
                                {summary}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Progress Mini-Ring or Dot */}
                    {tasks.length > 0 && (
                        <div className="flex items-center justify-center w-6 h-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="12" cy="12" r="10"
                                    fill="transparent"
                                    stroke="translateX"
                                    className="stroke-neutral-800"
                                    strokeWidth="3"
                                />
                                <circle
                                    cx="12" cy="12" r="10"
                                    fill="transparent"
                                    stroke={isToday ? "currentColor" : "#525252"}
                                    className={isToday ? "text-black" : ""}
                                    strokeWidth="3"
                                    strokeDasharray={2 * Math.PI * 10}
                                    strokeDashoffset={2 * Math.PI * 10 * (1 - progress / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    )}

                    <ChevronDown
                        size={16}
                        className={clsx(
                            "text-neutral-500 transition-transform duration-300",
                            isOpen && "rotate-180"
                        )}
                    />
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && tasks.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 180, damping: 22 }}
                        className="overflow-hidden"
                    >
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                            className="pt-2 px-2 pb-4 space-y-2"
                        >
                            {tasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 10 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <TaskCard task={task} onRemove={() => { }} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
