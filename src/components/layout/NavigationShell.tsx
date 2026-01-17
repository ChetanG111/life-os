'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, Variants, useMotionValue, useTransform } from 'framer-motion';
import { TabId, TABS } from '@/types';
import { BottomNav } from './BottomNav';
import { vibrate } from '@/utils/haptics';

import { Feed } from '@/components/features/overview/Feed';

import { TasksTab } from '@/components/features/tasks/TasksTab';
import { NotesTab } from '@/components/features/notes/NotesTab';

import { WeeklyTab } from '@/components/features/weekly/WeeklyTab';
import { ChatTab } from '@/components/features/chat/ChatTab';

// Placeholder content - To be replaced by actual Feature components
const PlaceholderTab = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <h1 className="text-xl font-bold tracking-tight text-white">{text}</h1>
        <p className="text-neutral-500 text-sm">Coming soon</p>
    </div>
);

const TabContent = ({ 
    activeTab, 
    onModalToggle,
    settings
}: { 
    activeTab: TabId, 
    onModalToggle: (isOpen: boolean) => void,
    settings: {
        showBottomNav: boolean;
        setShowBottomNav: (show: boolean) => void;
    }
}) => {
    switch (activeTab) {
        case 'tasks': return <TasksTab />;
        case 'notes': return <NotesTab />;
        case 'overview': return <Feed onModalToggle={onModalToggle} settings={settings} />;
        case 'chat': return <ChatTab />;
        case 'weekly': return <WeeklyTab />;
        default: return null;
    }
};

export function NavigationShell() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [direction, setDirection] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showBottomNav, setShowBottomNav] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Track drag physics for BottomNav
    const x = useMotionValue(0);
    // Invert the x movement for the navbar indicator so it moves towards the target tab
    // Distance between tabs is roughly 56px (w-12 + gap-2)
    // Screen width swipe (~375px) should map to ~56px
    const navX = useTransform(x, (latest) => latest * -0.15);

    // Lockout to prevent rapid double-swipes skipping tabs
    const isLocked = useRef(false);

    const handleTabChange = (newTab: TabId) => {
        if (isLocked.current) return;

        const currentIndex = TABS.indexOf(activeTab);
        const newIndex = TABS.indexOf(newTab);

        if (newIndex === currentIndex) return;

        isLocked.current = true;
        // Unlock after transition approx time (300ms + buffer)
        setTimeout(() => {
            isLocked.current = false;
        }, 350);

        vibrate('light'); // Haptic feedback on tab switch
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
            opacity: 1,
            zIndex: 0,
            pointerEvents: 'none', // Prevent interaction during entry
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            pointerEvents: 'auto', // Enable interaction when centered
            transition: {
                x: { type: "spring", stiffness: 180, damping: 22 },
                opacity: { duration: 0.2 }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 1,
            pointerEvents: 'none',
            transition: {
                x: { type: "spring", stiffness: 180, damping: 22 },
                opacity: { duration: 0.2 }
            }
        })
    };

    return (
        <div className="relative h-[100dvh] w-full overflow-hidden bg-background" >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.main
                    key={activeTab}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    // Drag configuration for swipe support
                    drag={isModalOpen ? false : "x"}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{
                        left: activeTab === 'weekly' ? 0.4 : 0.1, // Stronger resistance at the very end
                        right: activeTab === 'tasks' ? 0.4 : 0.1, // Stronger resistance at the very start
                        top: 0,
                        bottom: 0
                    }}
                    onDragStart={() => {
                        vibrate('light');
                        setIsDragging(true);
                    }}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 h-full w-full touch-pan-y will-change-transform bg-background overflow-y-auto overflow-x-hidden"
                >
                    <TabContent 
                        activeTab={activeTab} 
                        onModalToggle={setIsModalOpen} 
                        settings={{ showBottomNav, setShowBottomNav }}
                    />
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
