'use client';

import { useState } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { X, Check, Archive } from 'lucide-react';
import clsx from 'clsx';

interface FeedItem {
    id: string;
    title: string;
    type: 'task' | 'note';
    content: string;
    color?: string;
}

// Mock Data
const MOCK_ITEMS: FeedItem[] = [
    { id: '1', title: 'Review Annual Goals', type: 'task', content: 'Check alignment with Q1 objectives.', color: 'bg-blue-500' },
    { id: '2', title: 'Gym Session', type: 'task', content: 'Leg day - focus on squats.', color: 'bg-red-500' },
    { id: '3', title: 'Quick Idea', type: 'note', content: 'App concept: Life OS wrapper.', color: 'bg-yellow-500' },
    { id: '4', title: 'Read Book', type: 'task', content: '30 mins of Deep Work.', color: 'bg-purple-500' },
];

export function SwipeFeed() {
    const [items, setItems] = useState(MOCK_ITEMS);
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

    // We only show the top 2 cards effectively for performance/visuals
    const activeItems = items.filter(i => !removedIds.has(i.id));
    const topCard = activeItems[0];
    const nextCard = activeItems[1];

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, itemId: string) => {
        const swipeThreshold = 100;
        if (info.offset.x > swipeThreshold) {
            // Swipe Right (Done/Save)
            removeCard(itemId, 'right');
        } else if (info.offset.x < -swipeThreshold) {
            // Swipe Left (Dismiss/Archive)
            removeCard(itemId, 'left');
        }
    };

    const removeCard = (id: string, direction: 'left' | 'right') => {
        setRemovedIds(prev => new Set(prev).add(id));
        console.log(`Card ${id} swiped ${direction}`);
    };

    if (!topCard) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-neutral-500">
                <Check size={48} className="mb-4 opacity-20" />
                <p>All caught up!</p>
                <button
                    onClick={() => setRemovedIds(new Set())}
                    className="mt-8 px-6 py-2 rounded-full bg-white/5 text-sm font-medium hover:bg-white/10"
                >
                    Reset Demo
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full max-w-md mx-auto flex flex-col justify-center items-center p-4">
            {/* Cards container */}
            <div className="relative w-full aspect-[3/4] max-h-[600px]">
                <AnimatePresence>
                    {activeItems.slice(0, 2).reverse().map((item, index) => {
                        const isTop = item.id === topCard.id;
                        return (
                            <SwipeableCard
                                key={item.id}
                                item={item}
                                isTop={isTop}
                                onSwipe={(dir) => removeCard(item.id, dir)}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Controls / Hints */}
            <div className="mt-8 flex gap-8">
                <button className="p-4 rounded-full bg-neutral-800 text-red-400 hover:bg-neutral-700 transition-colors" onClick={() => removeCard(topCard.id, 'left')}>
                    <X size={24} />
                </button>
                <button className="p-4 rounded-full bg-neutral-800 text-green-400 hover:bg-neutral-700 transition-colors" onClick={() => removeCard(topCard.id, 'right')}>
                    <Check size={24} />
                </button>
            </div>
        </div>
    );
}

function SwipeableCard({ item, isTop, onSwipe }: { item: FeedItem, isTop: boolean, onSwipe: (dir: 'left' | 'right') => void }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Background color indicators
    const bgRight = useTransform(x, [0, 150], ["rgba(0,0,0,0)", "rgba(34, 197, 94, 0.2)"]);
    const bgLeft = useTransform(x, [-150, 0], ["rgba(239, 68, 68, 0.2)", "rgba(0,0,0,0)"]);

    const handleDragEnd = (event: any, info: any) => {
        if (Math.abs(info.offset.x) > 100) {
            onSwipe(info.offset.x > 0 ? 'right' : 'left');
        }
    };

    return (
        <motion.div
            style={{
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                scale: isTop ? 1 : 0.95,
                y: isTop ? 0 : 20,
                zIndex: isTop ? 10 : 0
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isTop ? 1 : 0.95, opacity: 1, y: isTop ? 0 : 24 }}
            exit={{ x: x.get() < 0 ? -200 : 200, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
            <Card className="h-full flex flex-col justify-between bg-neutral-900 border-neutral-800">
                <motion.div style={{ backgroundColor: bgRight }} className="absolute inset-0 z-0 pointer-events-none rounded-3xl" />
                <motion.div style={{ backgroundColor: bgLeft }} className="absolute inset-0 z-0 pointer-events-none rounded-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <span className={clsx("text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-white/50",
                            item.type === 'task' ? 'text-blue-400' : 'text-yellow-400'
                        )}>
                            {item.type}
                        </span>
                        <div className="h-2 w-2 rounded-full bg-red-500" /> {/* Priority Dot */}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-lg text-neutral-400 leading-relaxed">{item.content}</p>
                </div>

                <div className="relative z-10 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                        <Archive size={14} />
                        <span>Swipe left to archive</span>
                    </div>
                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-white/20" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
