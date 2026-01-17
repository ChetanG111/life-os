'use client';

import { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { DayItem } from './DayItem';
import { mockTasks } from '@/data/mock';
import { Task } from '@/types';
import { Calendar as CalendarIcon, Trophy, TrendingUp } from 'lucide-react';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 24
        }
    }
};

export const WeeklyTab = () => {
    // Generate current week days
    const weekData = useMemo(() => {
        const days = [];
        const today = new Date();
        // Start from Monday of current week
        const currentDay = today.getDay(); // 0 is Sunday
        const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);

        const monday = new Date(today.setDate(diff));

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            days.push({
                date: date,
                dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
                dayNumber: date.getDate().toString(),
                isToday: date.toDateString() === new Date().toDateString(),
                // Distribute mock tasks (pseudo-randomly for demo)
                tasks: mockTasks.filter((_, index) => index % 7 === i)
            });
        }
        return days;
    }, []);

    // Calculate Weekly Stats
    const totalTasks = mockTasks.length;
    const completedTasks = mockTasks.filter(t => t.isCompleted).length;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="w-full min-h-screen bg-background pb-32">
            {/* Header Section */}
            <div className="px-6 pt-12 pb-8 bg-[var(--surface)] rounded-b-[40px] border-b border-white/5 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-neutral-400 text-lg font-semibold uppercase tracking-wider mb-1">
                            Current Sprint
                        </h2>
                        <h1 className="text-xl font-bold text-white uppercase tracking-wider">
                            Build Phase 1
                        </h1>
                    </div>
                    {/* Weekly Progress Ring */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="32" cy="32" r="28"
                                fill="transparent"
                                stroke="#262626"
                                strokeWidth="6"
                            />
                            <circle
                                cx="32" cy="32" r="28"
                                fill="transparent"
                                stroke="#FFF"
                                strokeWidth="6"
                                strokeDasharray={2 * Math.PI * 28}
                                strokeDashoffset={2 * Math.PI * 28 * (1 - completionPercentage / 100)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-sm font-bold text-white">
                            {completionPercentage}%
                        </span>
                    </div>
                </div>

                {/* Impact / Summary Metrics */}
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    <div className="flex-shrink-0 bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[140px]">
                        <div className="flex items-center gap-2 mb-2 text-amber-500">
                            <Trophy size={18} />
                            <span className="text-xs font-bold uppercase">Focus</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-200">User Acquisition</p>
                    </div>

                    <div className="flex-shrink-0 bg-white/5 border border-white/5 rounded-2xl p-4 min-w-[140px]">
                        <div className="flex items-center gap-2 mb-2 text-blue-500">
                            <TrendingUp size={18} />
                            <span className="text-xs font-bold uppercase">Velocity</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-200">On Track</p>
                    </div>
                </div>
            </div>

            {/* Days List */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="px-4 space-y-1"
            >
                {weekData.map((day, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        <DayItem
                            dayName={day.dayName}
                            dayNumber={day.dayNumber}
                            tasks={day.tasks}
                            isToday={day.isToday}
                            summary={day.tasks.length > 0 ? "Product & Design" : "Rest & Review"}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Bottom visual spacer */}
            <div className="h-12 flex items-center justify-center text-neutral-700 text-xs font-medium uppercase tracking-widest mt-8">
                End of Week
            </div>
        </div>
    );
};
