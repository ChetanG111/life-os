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

    const handleTabChange = (newTab: TabId) => {
        vibrate('light'); // Haptic feedback on tab switch
        setActiveTab(newTab);
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
        <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
            {/* Main Application Shell */}
            <div className="relative h-full w-full overflow-hidden bg-background">
                <main className="absolute inset-0 h-full w-full bg-background overflow-y-auto overflow-x-hidden">
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
                </main>
            </div>

            {/* Global FAB - Hidden on clean screens */}
            {['tasks', 'notes', 'overview'].includes(activeTab) && !isModalOpen && (
                <div className="fixed bottom-10 right-6 flex flex-col gap-3 z-40">
                    {/* Memory Review FAB - Only on Overview */}
                    {activeTab === 'overview' && (
                        <button
                            onClick={() => {
                                vibrate('medium');
                                setIsMemoryReviewOpen(true);
                            }}
                            className="relative w-12 h-12 bg-neutral-800 text-white rounded-2xl shadow-2xl flex items-center justify-center border border-white/10 active:scale-95 "
                        >
                            <Brain size={20} />
                            {expiringNotesCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-neutral-900 shadow-lg">
                                    {expiringNotesCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Main Add FAB */}
                    <button
                        onClick={() => {
                            vibrate('medium');
                            const defaultType = activeTab === 'notes' ? 'note' : 'task';
                            setQuickAddType(defaultType);
                            setIsQuickAddOpen(true);
                        }}
                        className="w-12 h-12 bg-white text-black rounded-2xl shadow-2xl flex items-center justify-center active:scale-95 "
                    >
                        <Plus size={24} strokeWidth={2.5} />
                    </button>
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
            {isMemoryReviewOpen && (
                <MemoryReviewCards
                    isOpen={isMemoryReviewOpen}
                    onClose={() => setIsMemoryReviewOpen(false)}
                />
            )}
        </div>
    );
}