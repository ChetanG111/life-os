'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { TabId, TABS } from '@/types';
import { BottomNav } from './BottomNav';

import { Feed } from '@/components/features/overview/Feed';

// Placeholder content - To be replaced by actual Feature components
const PlaceholderTab = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter text-white">{text}</h1>
        <p className="text-neutral-500">Coming soon</p>
    </div>
);

const TabContent: Record<TabId, React.ReactNode> = {
    tasks: <PlaceholderTab text="Tasks" />,
    notes: <PlaceholderTab text="Notes" />,
    overview: <Feed />,
    chat: <PlaceholderTab text="Chat" />,
    weekly: <PlaceholderTab text="Weekly" />,
};

export function NavigationShell() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [direction, setDirection] = useState(0);

    const handleTabChange = (newTab: TabId) => {
        const currentIndex = TABS.indexOf(activeTab);
        const newIndex = TABS.indexOf(newTab);

        if (newIndex === currentIndex) return;

        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(newTab);
    };

    // Simple swipe logic
    const handleDragEnd = (event: any, info: any) => {
        const swipeThreshold = 50;
        const velocityThreshold = 500;
        const currentIndex = TABS.indexOf(activeTab);

        const isSwipeLeft = info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold;
        const isSwipeRight = info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold;

        if (isSwipeLeft && currentIndex < TABS.length - 1) {
            handleTabChange(TABS[currentIndex + 1]);
        } else if (isSwipeRight && currentIndex > 0) {
            handleTabChange(TABS[currentIndex - 1]);
        }
    };

    const variants: Variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0.5,
            scale: 0.95,
            filter: "blur(4px)"
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                x: { type: "spring", stiffness: 350, damping: 30 },
                opacity: { duration: 0.2 }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0.5,
            scale: 0.95,
            filter: "blur(4px)",
            transition: {
                x: { type: "spring", stiffness: 350, damping: 30 },
                opacity: { duration: 0.2 }
            }
        })
    };

    return (
        <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.main
                    key={activeTab}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    // Drag configuration for swipe support
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 h-full w-full touch-pan-y will-change-transform"
                >
                    {TabContent[activeTab]}
                </motion.main>
            </AnimatePresence>

            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
    );
}
