'use client';

import { motion } from 'framer-motion';
import { TabId, TABS } from '@/types';
import { CheckCircle2, FileText, Layers, MessageSquare, Calendar } from 'lucide-react';
import clsx from 'clsx';

const ICONS = {
    tasks: CheckCircle2,
    notes: FileText,
    overview: Layers,
    chat: MessageSquare,
    weekly: Calendar,
};

interface BottomNavProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    return (
        <motion.div
            initial={{ y: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
            <div className="flex items-center gap-2 p-2 bg-neutral-900/90 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl ring-1 ring-white/10">
                {TABS.map((tab) => {
                    const Icon = ICONS[tab];
                    const isActive = activeTab === tab;

                    return (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={clsx(
                                "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 focus:outline-none",
                                isActive ? "text-black" : "text-neutral-500 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                            <span className="relative z-10">
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            </span>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}
