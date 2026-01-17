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

import { SettingsModal } from '../features/settings/SettingsModal';

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
    onOpenSettings
}: {
    activeTab: TabId,
    onModalToggle: (isOpen: boolean) => void,
    onOpenSettings: () => void
}) => {
    switch (activeTab) {
        case 'tasks': return <TasksTab onOpenSettings={onOpenSettings} onModalToggle={onModalToggle} />;
        case 'notes': return <NotesTab onOpenSettings={onOpenSettings} onModalToggle={onModalToggle} />;
        case 'overview': return <Feed onModalToggle={onModalToggle} onOpenSettings={onOpenSettings} />;
        case 'chat': return <ChatTab onOpenSettings={onOpenSettings} />;
        case 'weekly': return <WeeklyTab onOpenSettings={onOpenSettings} />;
        default: return null;
    }
};

import { useData } from '@/context/DataContext';

export function NavigationShell() {
    const { settings, updateSettings } = useData();
    const showBottomNav = settings.showBottomNav;
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [direction, setDirection] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
            opacity: 0,
            scale: 0.95, // Depth effect on entry
            zIndex: 0,
            pointerEvents: 'none',
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            pointerEvents: 'auto',
            transition: {
                x: { type: "spring", stiffness: 280, damping: 28 }, // Snappier spring
                opacity: { duration: 0.35, ease: "easeOut" },
                scale: { duration: 0.35, ease: "easeOut" }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.95, // Depth effect on exit
            pointerEvents: 'none',
            transition: {
                x: { type: "spring", stiffness: 280, damping: 28 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.3 }
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
                    // Drag configuration for swipe support. Disable if ANY modal is open.
                    drag={isModalOpen || isSettingsOpen ? false : "x"}
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
                        onOpenSettings={() => {
                            vibrate('light');
                            setIsSettingsOpen(true);
                        }}
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

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                showBottomNav={showBottomNav}
                onToggleBottomNav={(show) => updateSettings({ showBottomNav: show })}
            />
        </div>
    );
}
