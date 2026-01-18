'use client';

import { useState, useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { DayItem } from './DayItem';
import { Task } from '@/types';
import { Calendar as CalendarIcon, Trophy, TrendingUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useSlimySpring } from '@/hooks/use-slimy-spring';

import { UNIVERSAL_STAGGER_CONTAINER, createStaggerItemVariants } from '@/utils/animations';

import { useData } from '@/context/DataContext';

export const WeeklyTab = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
    const { tasks } = useData();
    const springConfig = useSlimySpring();

    const containerVariants = UNIVERSAL_STAGGER_CONTAINER('standard');
    const itemVariants = createStaggerItemVariants(springConfig);

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
                // Distribute tasks (pseudo-randomly for demo, filtering by date would be better in real app)
                tasks: tasks.filter((_, index) => index % 7 === i)
            });
        }
        return days;
    }, [tasks]);

    // Calculate Weekly Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="w-full min-h-screen bg-background pb-32 flex justify-center">
            <div className="w-full max-w-7xl px-6 md:px-10 py-12 md:py-20 flex flex-col md:flex-row gap-12">

                {/* Desktop Sidebar (Image 3) */}
                <div className="hidden md:flex flex-col w-[320px] shrink-0 space-y-8">
                    <div className="bg-neutral-900/50 rounded-[32px] p-8 border border-white/5 shadow-xl">
                        <div className="mb-6">
                            <h2 className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em] mb-2">
                                Current Sprint
                            </h2>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                                Build Phase 1
                            </h1>
                        </div>

                        {/* Progress Ring & Stats */}
                        <div className="flex items-center gap-6 mb-10">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="34" fill="transparent" stroke="#171717" strokeWidth="8" />
                                    <circle
                                        cx="40" cy="40" r="34"
                                        fill="transparent"
                                        stroke="#FFF"
                                        strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 34}
                                        strokeDashoffset={2 * Math.PI * 34 * (1 - completionPercentage / 100)}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <span className="absolute text-xl font-black text-white">{completionPercentage}%</span>
                            </div>
                        </div>

                        {/* Metric Cards */}
                        <div className="space-y-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <Trophy size={20} />
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Focus</span>
                                    <p className="text-sm font-bold text-white">User Acquisition</p>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Velocity</span>
                                    <p className="text-sm font-bold text-white">On Track</p>
                                </div>
                            </div>
                        </div>

                        {/* Time Remaining Bar */}
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-neutral-500 uppercase">Time Remaining</span>
                                <span className="text-xs font-black text-white">12 Days</span>
                            </div>
                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '40%' }}
                                    className="h-full bg-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sprint Insights (Image 3) */}
                    <div className="bg-neutral-900/50 rounded-[32px] p-8 border border-white/5">
                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <Sparkles size={16} strokeWidth={3} />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Sprint Insights</h3>
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                            Team capacity is currently at 85%. You've completed 0 out of 24 planned story points.
                        </p>
                        <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                            View Backlog
                        </button>
                    </div>
                </div>

                {/* Main Weekly Agenda Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Weekly Agenda
                        </h2>
                        <div className="flex gap-4">
                            <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <button className="p-2 text-neutral-500 hover:text-white transition-colors">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Header (Only visible on small screens) */}
                    <div className="md:hidden flex justify-between items-start mb-8 bg-neutral-900 shadow-xl p-8 rounded-[32px] border border-white/5">
                        <div>
                            <h2 className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-1">
                                Current Sprint
                            </h2>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                                Build Phase 1
                            </h1>
                        </div>
                        <div className="relative w-14 h-14 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="28" cy="28" r="24" fill="transparent" stroke="#171717" strokeWidth="6" />
                                <circle
                                    cx="28" cy="28" r="24"
                                    fill="transparent"
                                    stroke="#FFF"
                                    strokeWidth="6"
                                    strokeDasharray={2 * Math.PI * 24}
                                    strokeDashoffset={2 * Math.PI * 24 * (1 - completionPercentage / 100)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-xs font-black text-white">{completionPercentage}%</span>
                        </div>
                    </div>

                    {/* Days List */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-4 md:space-y-3"
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

                    {/* Page Footer */}
                    <div className="mt-12 flex justify-center opacity-30">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-500">
                            End of Week
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
