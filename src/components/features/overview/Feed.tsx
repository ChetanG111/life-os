'use client';

import { useState } from 'react';
import { SwipeFeed } from './SwipeFeed';
import { motion } from 'framer-motion';

// Future expansion: Toggle between Switch and List views
type FeedMode = 'stack' | 'list';

export function Feed() {
    const [mode, setMode] = useState<FeedMode>('stack');

    return (
        <div className="h-full w-full py-safe-top px-4">
            {/* Header / Mode Switcher (Placeholder) */}
            <header className="flex justify-between items-center py-4 px-2 mb-2">
                <h1 className="text-2xl font-bold text-white">Focus</h1>
                <button className="text-sm text-neutral-500 hover:text-white transition-colors">
                    View All
                </button>
            </header>

            {/* Main Feed Content */}
            <div className="h-[calc(100%-80px)]">
                <SwipeFeed />
            </div>
        </div>
    );
}
