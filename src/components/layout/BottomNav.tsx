'use client';

import { motion, MotionValue } from 'framer-motion';
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
    isVisible: boolean;
    offset: MotionValue<number>;
}

export function BottomNav({ activeTab, onTabChange, isVisible, offset }: BottomNavProps) {
    return (
        <motion.div
            initial={{ y: 200, scale: 0.8, opacity: 0 }}
            animate={{
                y: isVisible ? 0 : 200,
                scale: isVisible ? 1 : 0.8,
                opacity: isVisible ? 1 : 0
            }}

            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8
            }}
            className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
        >
            <div className="pointer-events-auto flex items-center gap-2 p-2 bg-neutral-900/90 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl ring-1 ring-white/10 overflow-hidden">
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
                                    style={{ x: offset }} // Only the white pill moves
                                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
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
