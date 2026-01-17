'use client';

import { useState, useEffect } from 'react';
import { SwipeFeed } from './SwipeFeed';
import { QuickAddModal } from './QuickAddModal';
import { SettingsModal } from '../settings/SettingsModal';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { vibrate } from '@/utils/haptics';

// Future expansion: Toggle between Switch and List views
type FeedMode = 'stack' | 'list';

interface FeedProps {
    onModalToggle?: (isOpen: boolean) => void;
    settings?: {
        showBottomNav: boolean;
        setShowBottomNav: (show: boolean) => void;
    };
}

export function Feed({ onModalToggle, settings }: FeedProps) {
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Notify parent when modal state changes to disable/enable main swipes
    useEffect(() => {
        if (onModalToggle) {
            onModalToggle(isQuickAddOpen || isSettingsOpen);
        }
    }, [isQuickAddOpen, isSettingsOpen, onModalToggle]);

    return (
        <div className="relative h-full w-full py-safe-top px-4 overflow-hidden">
            {/* Header */}
            <header className="relative flex justify-center items-center py-4 px-2 mb-2">
                <motion.button 
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                        vibrate('light');
                        setIsSettingsOpen(true);
                    }}
                    className="group flex items-center gap-1.5 focus:outline-none"
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                        Focus
                    </h1>
                </motion.button>
            </header>

            {/* Main Feed Content - Shifted up slightly with pb-16/mb-16 logic to accommodate FAB visually if needed, 
                but user asked to "move cards slightly up". We'll use a wrapper with padding-bottom. */}
            <div className="h-[calc(100%-80px)] pb-16">
                <SwipeFeed />
            </div>

            {/* Quick Add FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    vibrate('medium');
                    setIsQuickAddOpen(true);
                }}
                className="absolute bottom-10 right-6 w-14 h-14 bg-white text-black rounded-full shadow-sm flex items-center justify-center z-30"
            >
                <Plus size={24} strokeWidth={2.5} />
            </motion.button>

            {/* Quick Add Modal Overlay */}
            <QuickAddModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
            
            {/* Settings Modal */}
            {settings && (
                <SettingsModal 
                    isOpen={isSettingsOpen} 
                    onClose={() => setIsSettingsOpen(false)}
                    showBottomNav={settings.showBottomNav}
                    onToggleBottomNav={settings.setShowBottomNav}
                />
            )}
        </div>
    );
}
