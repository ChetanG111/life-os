'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Check, Archive, Trash2, X, Info } from 'lucide-react';
import clsx from 'clsx';
import { vibrate } from '@/utils/haptics';

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
    { id: '5', title: 'Grocery List', type: 'task', content: 'Eggs, Milk, Chicken, and Avocados.', color: 'bg-green-500' },
    { id: '6', title: 'Meeting Prep', type: 'task', content: 'Review the slide deck for tomorrow.', color: 'bg-orange-500' },
    { id: '7', title: 'Reflection', type: 'note', content: 'What was the best part of today?', color: 'bg-teal-500' },
];

export function SwipeFeed() {
    const [items, setItems] = useState(MOCK_ITEMS);
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
    const [detailsId, setDetailsId] = useState<string | null>(null);

    // We only show the top 2 cards effectively for performance/visuals
    const activeItems = items.filter(i => !removedIds.has(i.id));
    const topCard = activeItems[0];

    const removeCard = (id: string, action: 'done' | 'dismiss' | 'delete') => {
        setRemovedIds(prev => new Set(prev).add(id));
        console.log(`Card ${id} action: ${action}`);
    };

    const showDetails = (id: string) => {
        console.log(`Open details for ${id}`);
        setDetailsId(id);
        // Reset after a delay for demo purposes if strictly a visual feedback
        setTimeout(() => setDetailsId(null), 2000);
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
        <div className="relative h-full w-full max-w-sm mx-auto flex flex-col justify-center items-center p-2">
            {/* Cards container */}
            <div className="relative w-full aspect-[4/5] max-h-[440px]">
                <AnimatePresence>
                    {activeItems.slice(0, 2).reverse().map((item, index) => {
                        const isTop = item.id === topCard.id;
                        return (
                            <SwipeableCard
                                key={item.id}
                                item={item}
                                isTop={isTop}
                                onSwipe={(action) => removeCard(item.id, action)}
                                onDetails={() => showDetails(item.id)}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            {detailsId && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
                    Opening details...
                </div>
            )}
        </div>
    );
}

function SwipeableCard({
    item,
    isTop,
    onSwipe,
    onDetails
}: {
    item: FeedItem,
    isTop: boolean,
    onSwipe: (action: 'done' | 'dismiss' | 'delete') => void,
    onDetails: () => void
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-10, 10]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Background color indicators
    // Right (Done): Green
    const bgRightOpacity = useTransform(x, [20, 150], [0, 1]);
    const scaleRight = useTransform(x, [20, 150], [0.8, 1.2]);

    // Left (Dismiss): Neutral/Gray
    const bgLeftOpacity = useTransform(x, [-150, -20], [1, 0]);
    const scaleLeft = useTransform(x, [-150, -20], [1.2, 0.8]);

    // Down (Delete): Red
    const bgDownOpacity = useTransform(y, [20, 150], [0, 1]);
    const scaleDown = useTransform(y, [20, 150], [0.8, 1.2]);

    // Up (Details): Blue
    const bgUpOpacity = useTransform(y, [-150, -20], [1, 0]);
    const scaleUp = useTransform(y, [-150, -20], [1.2, 0.8]);

    // Double tap logic
    const lastTap = useRef<number>(0);
    const handleTap = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        vibrate('light');

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            vibrate('medium');
            onDetails();
        }
        lastTap.current = now;
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 180; // Increased threshold for more deliberate actions
        const { x: offsetX, y: offsetY } = info.offset;
        const absX = Math.abs(offsetX);
        const absY = Math.abs(offsetY);

        if (absX > absY) {
            // Horizontal Swipe
            if (offsetX > threshold) {
                vibrate('success');
                onSwipe('done');
            } else if (offsetX < -threshold) {
                vibrate('light');
                onSwipe('dismiss');
            }
        } else {
            // Vertical Swipe
            if (offsetY > threshold) {
                vibrate('medium');
                onSwipe('delete');
            } else if (offsetY < -threshold) {
                vibrate('heavy');
                onDetails();
            }
        }
    };

    return (
        <motion.div
            style={{
                x: isTop ? x : 0,
                y: isTop ? y : (isTop ? 0 : 20), // if not top, offset slightly
                rotate: isTop ? rotate : 0,
                scale: isTop ? 1 : 0.95,
                zIndex: isTop ? 10 : 0
            }}
            drag={isTop ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={1} // 1:1 movement, no lag
            dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }} // Snappy return
            onDragEnd={handleDragEnd}
            onTap={handleTap}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isTop ? 1 : 0.95, opacity: 1, y: isTop ? 0 : 24 }}
            exit={{
                x: x.get() !== 0 ? (x.get() > 0 ? 500 : -500) : 0,
                y: y.get() > 50 ? 500 : 0,
                opacity: 0,
                transition: { duration: 0.2 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
            <Card className="h-full flex flex-col justify-between bg-neutral-900 border-neutral-800 overflow-hidden relative">

                {/* Swipe Indicators */}
                {/* Right: Done (Green) */}
                <motion.div
                    style={{ opacity: bgRightOpacity }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-green-500/20 pointer-events-none"
                >
                    <motion.div style={{ scale: scaleRight }}>
                        <Check size={48} className="text-white drop-shadow-md" />
                    </motion.div>
                </motion.div>

                {/* Left: Dismiss (Neutral/Gray) */}
                <motion.div
                    style={{ opacity: bgLeftOpacity }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-500/20 pointer-events-none"
                >
                    <motion.div style={{ scale: scaleLeft }}>
                        <X size={48} className="text-white drop-shadow-md" />
                    </motion.div>
                </motion.div>

                {/* Down: Delete (Red) */}
                <motion.div
                    style={{ opacity: bgDownOpacity }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-red-500/20 pointer-events-none"
                >
                    <motion.div style={{ scale: scaleDown }}>
                        <Trash2 size={48} className="text-white drop-shadow-md" />
                    </motion.div>
                </motion.div>

                {/* Up: Details (Blue/Info) */}
                <motion.div
                    style={{ opacity: bgUpOpacity }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500/20 pointer-events-none"
                >
                    <motion.div style={{ scale: scaleUp }}>
                        <Info size={48} className="text-white drop-shadow-md" />
                    </motion.div>
                </motion.div>


                <div className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className={clsx("text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-white/50",
                            item.type === 'task' ? 'text-blue-400' : 'text-yellow-400'
                        )}>
                            {item.type}
                        </span>
                        <div className="h-2 w-2 rounded-full bg-red-500" /> {/* Priority Dot */}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-base text-neutral-400 leading-relaxed">{item.content}</p>
                </div>

                <div className="relative z-10 mt-auto p-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2 justify-center">
                        <span className="text-xs uppercase tracking-widest opacity-50">Swipe to interact</span>
                    </div>
                    <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-white/20" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
