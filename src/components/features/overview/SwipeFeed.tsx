'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Check, Archive, Trash2, X, Info } from 'lucide-react';
import clsx from 'clsx';
import { vibrate } from '@/utils/haptics';
import { CardDetailModal } from '../cards/CardDetailModal';

export interface FeedItem {
    id: string;
    originalId?: string;
    title: string;
    type: 'task' | 'note';
    content: string;
    color?: string;
    tags?: string[];
    priority?: 'high' | 'medium' | 'low';
    dueTime?: string;
}

// Mock Data
export const MOCK_ITEMS: FeedItem[] = [
    { id: '1', title: 'Review Annual Goals', type: 'task', content: 'Check alignment with Q1 objectives.', color: 'bg-blue-500', priority: 'high', tags: ['Planning'], dueTime: '2:00 PM' },
    { id: '2', title: 'Gym Session', type: 'task', content: 'Leg day - focus on squats.', color: 'bg-red-500', priority: 'medium', tags: ['Health'] },
    { id: '3', title: 'Quick Idea', type: 'note', content: 'App concept: Life OS wrapper.', color: 'bg-yellow-500', tags: ['Idea'] },
    { id: '4', title: 'Read Book', type: 'task', content: '30 mins of Deep Work.', color: 'bg-purple-500', priority: 'low', tags: ['Learning'] },
    { id: '5', title: 'Grocery List', type: 'task', content: 'Eggs, Milk, Chicken, and Avocados.', color: 'bg-green-500', priority: 'medium' },
    { id: '6', title: 'Meeting Prep', type: 'task', content: 'Review the slide deck for tomorrow.', color: 'bg-orange-500', priority: 'high', dueTime: '9:00 AM' },
    { id: '7', title: 'Reflection', type: 'note', content: 'What was the best part of today?', color: 'bg-teal-500', tags: ['Journal'] },
];

interface SwipeFeedProps {
    items: FeedItem[];
    onSwipe: (id: string, action: 'done' | 'dismiss' | 'delete') => void;
}

export function SwipeFeed({ items, onSwipe }: SwipeFeedProps) {
    const [detailsId, setDetailsId] = useState<string | null>(null);

    // We only show the top 2 cards effectively for performance/visuals
    // Parent manages the list, so 'items' are all active items.
    const activeItems = items;
    const topCard = activeItems[0];

    const showDetails = (id: string) => {
        setDetailsId(id);
    };

    const activeDetailItem = items.find(i => i.id === detailsId) || null;

    if (!topCard) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-neutral-500">
                <Check size={48} className="mb-4 opacity-20" />
                <p>All caught up!</p>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full max-w-sm mx-auto flex flex-col justify-start items-center p-2 pt-8">
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
                                onSwipe={(action) => onSwipe(item.id, action)}
                                onDetails={() => showDetails(item.id)}
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            <CardDetailModal
                isOpen={!!detailsId}
                onClose={() => setDetailsId(null)}
                onDelete={() => onSwipe(detailsId!, 'delete')}
                onComplete={() => onSwipe(detailsId!, 'done')}
                item={activeDetailItem}
            />
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
    const rotate = useTransform(x, [-200, 200], [-8, 8]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    // Spring configuration from design.yaml (Updated for snappier feel)
    const springConfig = { type: "spring", stiffness: 280, damping: 28 } as const;

    // Background color indicators (Physical feel)
    const bgRightOpacity = useTransform(x, [40, 150], [0, 1]);
    const scaleRight = useTransform(x, [40, 150], [0.9, 1.1]);

    const bgLeftOpacity = useTransform(x, [-150, -40], [1, 0]);
    const scaleLeft = useTransform(x, [-150, -40], [1.1, 0.9]);

    const bgDownOpacity = useTransform(y, [40, 150], [0, 1]);
    const scaleDown = useTransform(y, [40, 150], [0.9, 1.1]);

    const bgUpOpacity = useTransform(y, [-150, -40], [1, 0]);
    const scaleUp = useTransform(y, [-150, -40], [1.1, 0.9]);

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
        const threshold = 140;
        const { x: offsetX, y: offsetY } = info.offset;
        const absX = Math.abs(offsetX);
        const absY = Math.abs(offsetY);

        if (absX > absY) {
            if (offsetX > threshold) {
                vibrate('success');
                onSwipe('done');
            } else if (offsetX < -threshold) {
                vibrate('light');
                onSwipe('dismiss');
            }
        } else {
            if (offsetY > threshold) {
                vibrate('medium');
                onSwipe('delete');
            } else if (offsetY < -threshold) {
                vibrate('medium');
                onDetails();
            }
        }
    };

    return (
        <motion.div
            style={{
                x: isTop ? x : 0,
                y: isTop ? y : (isTop ? 0 : 24),
                rotate: isTop ? rotate : 0,
                scale: isTop ? 1 : 0.95,
                opacity: isTop ? opacity : 0.4,
                zIndex: isTop ? 10 : 0
            }}
            drag={isTop ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragStart={() => vibrate('light')}
            onDragEnd={handleDragEnd}
            onTap={handleTap}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isTop ? 1 : 0.95, opacity: 1, y: isTop ? 0 : 20 }}
            exit={{
                x: x.get() > 50 ? 500 : (x.get() < -50 ? -500 : 0),
                y: y.get() > 50 ? 500 : (y.get() < -50 ? -500 : 0),
                opacity: 0,
                transition: { duration: 0.3 }
            }}
            transition={springConfig}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
            <Card className="h-full flex flex-col justify-between bg-[var(--surface)] border-white/5 overflow-hidden relative shadow-2xl rounded-[32px]">

                {/* Swipe Indicators - Minimal and Physical */}
                <motion.div style={{ opacity: bgRightOpacity }} className="absolute inset-0 z-20 flex items-center justify-center bg-[#10B981]/5 pointer-events-none">
                    <motion.div style={{ scale: scaleRight }}><Check size={48} className="text-[#10B981]/20" /></motion.div>
                </motion.div>

                <motion.div style={{ opacity: bgLeftOpacity }} className="absolute inset-0 z-20 flex items-center justify-center bg-white/5 pointer-events-none">
                    <motion.div style={{ scale: scaleLeft }}><X size={48} className="text-white/10" /></motion.div>
                </motion.div>

                <motion.div style={{ opacity: bgDownOpacity }} className="absolute inset-0 z-20 flex items-center justify-center bg-[#EF4444]/5 pointer-events-none">
                    <motion.div style={{ scale: scaleDown }}><Trash2 size={48} className="text-[#EF4444]/20" /></motion.div>
                </motion.div>

                <motion.div style={{ opacity: bgUpOpacity }} className="absolute inset-0 z-20 flex items-center justify-center bg-white/5 pointer-events-none">
                    <motion.div style={{ scale: scaleUp }}><Info size={48} className="text-white/10" /></motion.div>
                </motion.div>

                <div className="relative z-10 p-6 pt-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                            {item.type}
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight uppercase tracking-wide">{item.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed font-medium">{item.content}</p>
                </div>

                <div className="relative z-10 mt-auto p-6 pb-8">
                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white/10"
                            initial={{ width: "30%" }}
                            animate={{ width: "60%" }}
                        />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
