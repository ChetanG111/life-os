'use client';

import { TabId, TABS } from '@/types';
import { CheckCircle2, FileText, Layers, MessageSquare, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { IOS_SPRING } from '@/utils/animations';

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
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={IOS_SPRING}
            className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
        >
            <div className="pointer-events-auto flex items-center gap-2 p-2 liquid-glass rounded-full shadow-2xl ring-1 ring-white/10 overflow-hidden">
                {TABS.map((tab) => {
                    const Icon = ICONS[tab];
                    const isActive = activeTab === tab;

                    return (
                        <button
                            key={tab}
                            onClick={() => {
                                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                                    navigator.vibrate(10);
                                }
                                onTabChange(tab);
                            }}
                            className={clsx(
                                "relative flex items-center justify-center w-12 h-12 rounded-full transition-none focus:outline-none",
                                isActive ? "text-black" : "text-neutral-500 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white rounded-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
