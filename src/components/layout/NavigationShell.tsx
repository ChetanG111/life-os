'use client';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence, Variants, useMotionValue, useTransform } from 'framer-motion';
import { TabId, TABS, Note } from '@/types';
import { BottomNav } from './BottomNav';
import { vibrate } from '@/utils/haptics';
import dynamic from 'next/dynamic';

// Lazy load tab components per performance_rules.lazy_load_tabs
const Feed = dynamic(() => import('@/components/features/overview/Feed').then(mod => ({ default: mod.Feed })), {
    loading: () => <TabLoadingState />,
});
const TasksTab = dynamic(() => import('@/components/features/tasks/TasksTab').then(mod => ({ default: mod.TasksTab })), {
    loading: () => <TabLoadingState />,
});
const NotesTab = dynamic(() => import('@/components/features/notes/NotesTab').then(mod => ({ default: mod.NotesTab })), {
    loading: () => <TabLoadingState />,
});
const WeeklyTab = dynamic(() => import('@/components/features/weekly/WeeklyTab').then(mod => ({ default: mod.WeeklyTab })), {
    loading: () => <TabLoadingState />,
});
const ChatTab = dynamic(() => import('@/components/features/chat/ChatTab').then(mod => ({ default: mod.ChatTab })), {
    loading: () => <TabLoadingState />,
});

// Loading state for lazy-loaded tabs
const TabLoadingState = () => (
    <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
);

import { SettingsModal } from '../features/settings/SettingsModal';
import { QuickAddModal } from '../features/overview/QuickAddModal';
import { CardDetailModal } from '../features/cards/CardDetailModal';
import { StatePopup } from '../features/overview/StatePopup';
import { MemoryReviewCards } from '../features/overview/MemoryReviewCards';
import { Plus, Brain } from 'lucide-react';
import { useSlimySpring } from '@/hooks/use-slimy-spring';

// Placeholder content - To be replaced by actual Feature components
const PlaceholderTab = ({ text }: { text: string }) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <h1 className="text-xl font-bold tracking-tight text-white">{text}</h1>
        <p className="text-neutral-500 text-sm">Coming soon</p>
    </div>
);

const TabContent = ({
    activeTab,
    onOpenSettings,
    onOpenDetails,
    onOpenQuickAdd
}: {
    activeTab: TabId,
    onOpenSettings: () => void,
    onOpenDetails: (item: any) => void,
    onOpenQuickAdd: (type?: 'task' | 'note') => void
}) => {
    switch (activeTab) {
        case 'tasks': return <TasksTab onOpenSettings={onOpenSettings} onOpenDetails={onOpenDetails} onOpenQuickAdd={onOpenQuickAdd} />;
        case 'notes': return <NotesTab onOpenSettings={onOpenSettings} onOpenDetails={onOpenDetails} onOpenQuickAdd={onOpenQuickAdd} />;
        case 'overview': return <Feed onOpenSettings={onOpenSettings} onOpenDetails={onOpenDetails} onOpenQuickAdd={onOpenQuickAdd} />;
        case 'chat': return <ChatTab onOpenSettings={onOpenSettings} />;
        case 'weekly': return <WeeklyTab onOpenSettings={onOpenSettings} />;
        default: return null;
    }
};

import { useData } from '@/context/DataContext';

export function NavigationShell() {
    const { settings, updateSettings, removeTask, removeNote, addTask, addNote, stateHistory, saveState, currentState, tasks, notes } = useData();
    const springConfig = useSlimySpring();
    const showBottomNav = settings.showBottomNav;
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [direction, setDirection] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddType, setQuickAddType] = useState<'task' | 'note'>('task');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isStatePopupOpen, setIsStatePopupOpen] = useState(false);
    const [isMemoryReviewOpen, setIsMemoryReviewOpen] = useState(false);

    // Determine time of day for state popup
    const timeOfDay = useMemo(() => {
        const hour = new Date().getHours();
        // Morning: 5am - 12pm, Evening: 6pm - 11pm
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 18 && hour < 23) return 'evening';
        return null; // Outside check-in windows
    }, []);

    // Check if user already logged state today for this time of day
    const hasLoggedStateToday = useMemo(() => {
        if (!timeOfDay) return true; // Don't show if outside windows
        const today = new Date().toDateString();
        return stateHistory.some(entry => {
            const entryDate = new Date(entry.timestamp).toDateString();
            return entryDate === today && entry.timeOfDay === timeOfDay;
        });
    }, [stateHistory, timeOfDay]);

    // Auto-trigger state popup on first load if not logged
    useEffect(() => {
        if (!hasLoggedStateToday && timeOfDay) {
            // Small delay to let the UI settle
            const timer = setTimeout(() => setIsStatePopupOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hasLoggedStateToday, timeOfDay]);

    const isModalOpen = isQuickAddOpen || !!selectedItem || isSettingsOpen || isStatePopupOpen || isMemoryReviewOpen;

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

    // Memory Review attention indicator logic - notes older than 7 days
    const expiringNotesCount = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return notes.filter((n: Note) => {
            const noteDate = new Date(n.date);
            return noteDate < sevenDaysAgo;
        }).length;
    }, [notes]);

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
                        onOpenSettings={() => {
                            vibrate('light');
                            setIsSettingsOpen(true);
                        }}
                        onOpenDetails={(item) => {
                            // Ensure all relevant fields are mapped for the modal
                            const modalItem = {
                                ...item,
                                type: item.type || (activeTab === 'tasks' ? 'task' : 'note'),
                                content: item.content || item.description || ''
                            };
                            setSelectedItem(modalItem);
                        }}
                        onOpenQuickAdd={(type) => {
                            if (type) setQuickAddType(type);
                            setIsQuickAddOpen(true);
                        }}
                    />
                </motion.main>
            </AnimatePresence>

            {/* Global FAB - Hidden on clean screens */}
            {['tasks', 'notes', 'overview'].includes(activeTab) && !isModalOpen && (
                <div className="fixed bottom-10 right-6 flex flex-col gap-3 z-40">
                    {/* Memory Review FAB - Only on Overview */}
                    {activeTab === 'overview' && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                vibrate('medium');
                                setIsMemoryReviewOpen(true);
                            }}
                            className="relative w-12 h-12 bg-neutral-800 text-white rounded-2xl shadow-2xl flex items-center justify-center border border-white/10"
                        >
                            <Brain size={20} />
                            {expiringNotesCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-neutral-900 shadow-lg">
                                    {expiringNotesCount}
                                </span>
                            )}
                        </motion.button>
                    )}

                    {/* Main Add FAB */}
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            vibrate('medium');
                            const defaultType = activeTab === 'notes' ? 'note' : 'task';
                            setQuickAddType(defaultType);
                            setIsQuickAddOpen(true);
                        }}
                        className="w-12 h-12 bg-white text-black rounded-2xl shadow-2xl flex items-center justify-center"
                    >
                        <Plus size={24} strokeWidth={2.5} />
                    </motion.button>
                </div>
            )}

            {/* Global Modals - Reached from any Tab */}
            <QuickAddModal
                isOpen={isQuickAddOpen}
                onClose={() => setIsQuickAddOpen(false)}
                initialType={quickAddType}
            />

            <CardDetailModal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                onDelete={() => {
                    if (selectedItem?.type === 'task') removeTask(selectedItem.originalId || selectedItem.id);
                    else removeNote(selectedItem?.originalId || selectedItem?.id);
                }}
                onComplete={() => {
                    if (selectedItem?.type === 'task') removeTask(selectedItem.originalId || selectedItem.id);
                    // Notes don't have complete logic yet
                }}
                item={selectedItem}
            />

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

            {/* State Popup - Morning/Evening check-in */}
            {timeOfDay && (
                <StatePopup
                    isOpen={isStatePopupOpen}
                    onClose={() => setIsStatePopupOpen(false)}
                    onSelect={(emoji) => saveState(emoji, timeOfDay)}
                    currentEmoji={currentState?.emoji}
                    timeOfDay={timeOfDay}
                />
            )}

            {/* Memory Review Modal */}
            <AnimatePresence>
                {isMemoryReviewOpen && (
                    <MemoryReviewCards
                        isOpen={isMemoryReviewOpen}
                        onClose={() => setIsMemoryReviewOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
