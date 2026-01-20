'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { TabId, TABS, Note } from '@/types';
import { BottomNav } from './BottomNav';
import { vibrate } from '@/utils/haptics';
import dynamic from 'next/dynamic';
import { useData } from '@/context/DataContext';
import { SettingsModal } from '../features/settings/SettingsModal';
import { QuickAddModal } from '../features/overview/QuickAddModal';
import { CardDetailModal } from '../features/cards/CardDetailModal';
import { StatePopup } from '../features/overview/StatePopup';
import { MemoryReviewCards } from '../features/overview/MemoryReviewCards';
import { Plus, Brain } from 'lucide-react';
import { motion, AnimatePresence, Variants, useMotionValue } from 'framer-motion';
import { FAB_POP_VARIANT, IOS_SPRING } from '@/utils/animations';

// Lazy load tab components
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

const TabLoadingState = () => (
    <div className="flex items-center justify-center h-full">
        <span className="text-neutral-500 text-sm font-medium uppercase tracking-widest">Loading...</span>
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

export function NavigationShell() {
    const { settings, updateSettings, removeTask, removeNote, stateHistory, saveState, currentState, notes } = useData();
    const showBottomNav = settings.showBottomNav;
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [direction, setDirection] = useState(0);
    const x = useMotionValue(0);
    const isLocked = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [quickAddType, setQuickAddType] = useState<'task' | 'note'>('task');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isStatePopupOpen, setIsStatePopupOpen] = useState(false);
    const [isMemoryReviewOpen, setIsMemoryReviewOpen] = useState(false);

    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening' | null>(null);

    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) setTimeOfDay('morning');
            else if (hour >= 18 && hour < 23) setTimeOfDay('evening');
            else setTimeOfDay(null);
        };
        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const hasLoggedStateToday = useMemo(() => {
        if (!timeOfDay) return true;
        const today = new Date().toDateString();
        return stateHistory.some(entry => {
            const entryDate = new Date(entry.timestamp).toDateString();
            return entryDate === today && entry.timeOfDay === timeOfDay;
        });
    }, [stateHistory, timeOfDay]);

    useEffect(() => {
        if (!hasLoggedStateToday && timeOfDay) {
            const timer = setTimeout(() => setIsStatePopupOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hasLoggedStateToday, timeOfDay]);

    const isModalOpen = isQuickAddOpen || !!selectedItem || isSettingsOpen || isStatePopupOpen || isMemoryReviewOpen;

    // Background Scaling Logic
    const shellScale = isModalOpen ? 0.92 : 1;
    const shellRadius = isModalOpen ? 32 : 0;
    const shellOpacity = isModalOpen ? 0.6 : 1;

    const handleTabChange = (newTab: TabId) => {
        if (isLocked.current) return;
        
        const currentIndex = TABS.indexOf(activeTab);
        const newIndex = TABS.indexOf(newTab);
        
        if (newIndex === currentIndex) return;

        isLocked.current = true;
        setTimeout(() => { isLocked.current = false; }, 350);

        setDirection(newIndex > currentIndex ? 1 : -1);
        vibrate('light');
        setActiveTab(newTab);
    };

    const handleDragEnd = (event: any, info: any) => {
        setIsDragging(false);
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

    const expiringNotesCount = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return notes.filter((n: Note) => {
            const noteDate = new Date(n.date);
            return noteDate < sevenDaysAgo;
        }).length;
    }, [notes]);

    const slideVariants: Variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { ...IOS_SPRING, opacity: { duration: 0.2 } }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            scale: 0.95,
            transition: { ...IOS_SPRING, opacity: { duration: 0.2 } }
        })
    };

    return (
        <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
            {/* Main Application Shell - Now scaling properly */}
            <motion.div 
                animate={{ 
                    scale: shellScale, 
                    borderRadius: shellRadius,
                    opacity: shellOpacity 
                }}
                transition={IOS_SPRING}
                className="relative h-full w-full overflow-hidden bg-background origin-top hardware-accelerated"
            >
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.main
                        key={activeTab}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag={isModalOpen ? false : "x"}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={{
                            left: activeTab === 'weekly' ? 0.4 : 0.1,
                            right: activeTab === 'tasks' ? 0.4 : 0.1
                        }}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 h-full w-full bg-background overflow-y-auto overflow-x-hidden touch-pan-y"
                    >
                        <TabContent
                            activeTab={activeTab}
                            onOpenSettings={() => {
                                vibrate('light');
                                setIsSettingsOpen(true);
                            }}
                            onOpenDetails={(item) => {
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
            </motion.div>

            {/* Global FAB */}
            <AnimatePresence>
                {['tasks', 'notes', 'overview'].includes(activeTab) && !isModalOpen && (
                    <div className="fixed bottom-10 right-6 flex flex-col gap-3 z-40 pointer-events-none">
                        {/* Memory Review FAB */}
                        {activeTab === 'overview' && (
                            <motion.button
                                variants={FAB_POP_VARIANT}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    vibrate('medium');
                                    setIsMemoryReviewOpen(true);
                                }}
                                className="pointer-events-auto relative w-12 h-12 bg-neutral-800 text-white rounded-2xl shadow-2xl flex items-center justify-center border border-white/10"
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
                            variants={FAB_POP_VARIANT}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                vibrate('medium');
                                const defaultType = activeTab === 'notes' ? 'note' : 'task';
                                setQuickAddType(defaultType);
                                setIsQuickAddOpen(true);
                            }}
                            className="pointer-events-auto w-12 h-12 bg-white text-black rounded-2xl shadow-2xl flex items-center justify-center"
                        >
                            <Plus size={24} strokeWidth={2.5} />
                        </motion.button>
                    </div>
                )}
            </AnimatePresence>

            {/* Global Modals */}
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
                }}
                item={selectedItem}
            />

            <AnimatePresence>
                {showBottomNav && (
                    <BottomNav
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                )}
            </AnimatePresence>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                showBottomNav={showBottomNav}
                onToggleBottomNav={(show) => updateSettings({ showBottomNav: show })}
            />

            {/* State Popup */}
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
            <MemoryReviewCards
                isOpen={isMemoryReviewOpen}
                onClose={() => setIsMemoryReviewOpen(false)}
            />
        </div>
    );
}