'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants, useMotionValue, useTransform } from 'framer-motion';
import { TabId, TABS } from '@/types';
import { BottomNav } from './BottomNav';

import { Feed } from '@/components/features/overview/Feed';

import { TasksTab } from '@/components/features/tasks/TasksTab';
import { NotesTab } from '@/components/features/notes/NotesTab';

// Placeholder content - To be replaced by actual Feature components
const PlaceholderTab = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter text-white">{text}</h1>
        <p className="text-neutral-500">Coming soon</p>
    </div>
);

const TabContent: Record<TabId, React.ReactNode> = {
    tasks: <TasksTab />,
    notes: <NotesTab />,
    overview: <Feed />,
    chat: <PlaceholderTab text="Chat" />,
    weekly: <PlaceholderTab text="Weekly" />,
};

export function NavigationShell() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [direction, setDirection] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Track drag physics for BottomNav
    const x = useMotionValue(0);
    // Invert the x movement for the navbar indicator so it moves towards the target tab
    // Distance between tabs is roughly 56px (w-12 + gap-2)
    // Screen width swipe (~375px) should map to ~56px
    const navX = useTransform(x, (latest) => latest * -0.15);

    const handleTabChange = (newTab: TabId) => {
        const currentIndex = TABS.indexOf(activeTab);
        const newIndex = TABS.indexOf(newTab);

        if (newIndex === currentIndex) return;

        setDirection(newIndex > currentIndex ? 1 : -1);
        setActiveTab(newTab);
    };

    // Simple swipe logic
    const handleDragEnd = (event: any, info: any) => {
        setIsDragging(false);
        x.set(0); // Reset parallax value
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
            opacity: 1, // Changed to 1 to avoid transparency stacking
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


    // Settings toggle (currently disabled)
    const showBottomNav = false;

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
                    dragConstraints={{
                        left: activeTab === TABS[TABS.length - 1] ? 0 : -50, // Block left swipe if on last tab
                        right: activeTab === TABS[0] ? 0 : 50 // Block right swipe if on first tab
                    }}
                    dragElastic={0.2}
                    // Removed style={{ x }} to avoid conflict with AnimatePresence
                    onDrag={(e, info) => {
                        // Prevent updating x if we are trying to drag past boundaries
                        const isFirstTab = activeTab === TABS[0];
                        const isLastTab = activeTab === TABS[TABS.length - 1];

                        // If on first tab (Tasks), allow only negative offset (swipe left)
                        if (isFirstTab && info.offset.x > 0) {
                            x.set(0);
                            setIsDragging(false);
                            return;
                        }
                        // If on last tab (Weekly), allow only positive offset (swipe right)
                        if (isLastTab && info.offset.x < 0) {
                            x.set(0);
                            setIsDragging(false);
                            return;
                        }

                        x.set(info.offset.x);
                        setIsDragging(true);
                    }}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 h-full w-full touch-pan-y will-change-transform bg-background" // Added bg-background
                >
                    {TabContent[activeTab]}
                </motion.main>
            </AnimatePresence>

            {showBottomNav && (
                <BottomNav
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    isVisible={isDragging}
                    offset={navX}
                />
            )}
        </div>
    );
}
