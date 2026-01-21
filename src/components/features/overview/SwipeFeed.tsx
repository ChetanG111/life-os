'use client';

import { useState } from 'react';
import { MotionCard } from '@/components/ui/Card';
import { CheckCircle2, Trash2, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { vibrate } from '@/utils/haptics';
import { ConfirmDeleteModal } from '../cards/ConfirmDeleteModal';
import { useSettings } from '@/context/SettingsContext';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'framer-motion';
import { SLIMY_CONFIG } from '@/utils/animations';

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
    dueDate?: string;
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
    onDetails: (item: FeedItem) => void;
}

export function SwipeFeed({ items, onSwipe, onDetails }: SwipeFeedProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const { confirmDelete } = useSettings();

    const next = () => {
        vibrate('light');
        setCurrentIndex(prev => (prev + 1) % items.length);
    };

    const prev = () => {
        vibrate('light');
        setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
    };

    const handleDeleteRequested = (id: string) => {
        if (confirmDelete) {
            setItemToDelete(id);
        } else {
            onSwipe(id, 'delete');
        }
    };

    if (items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SLIMY_CONFIG}
                className="flex h-full flex-col items-center justify-center text-neutral-600 pb-24"
            >
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ delay: 0.5, duration: 0.5 }}>
                    <CheckCircle2 size={48} className="mb-6 opacity-20" />
                </motion.div>
                <p className="text-sm font-medium uppercase tracking-[0.2em]">
                    All caught up
                </p>
            </motion.div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col justify-start items-center">
            {/* Desktop Carousel Layout */}
            <div className="hidden md:flex flex-col items-center justify-center w-full max-w-5xl h-full py-10">
                {/* ... (Desktop layout can remain static for now, focusing on Mobile Deck) ... */}
                <div className="relative w-full flex items-center justify-center gap-12 mb-16">
                    <div className="w-[180px] h-[260px] opacity-20 scale-90 blur-[1px] transform -rotate-6">
                        <DesktopCard item={items[(currentIndex - 1 + items.length) % items.length]} />
                    </div>
                    <div className="w-[380px] h-[520px] z-10">
                        <div className="h-full w-full">
                            <DesktopCard item={items[currentIndex]} onSwipe={onSwipe} onDetails={onDetails} />
                        </div>
                    </div>
                    <div className="w-[180px] h-[260px] opacity-20 scale-90 blur-[1px] transform rotate-6">
                        <DesktopCard item={items[(currentIndex + 1) % items.length]} />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-8">
                    <div className="flex items-center gap-10">
                        <button onClick={prev} className="flex flex-col items-center gap-2 group">
                            <ChevronLeft size={20} className="text-neutral-500 group-hover:text-white " />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-white ">Prev</span>
                        </button>
                        <div className="flex items-center gap-3">
                            {items.slice(0, 5).map((_, i) => (
                                <div key={i} className={clsx("rounded-full", i === currentIndex % 5 ? "w-8 h-1.5 bg-red-500" : "w-1.5 h-1.5 bg-neutral-800")} />
                            ))}
                        </div>
                        <button onClick={next} className="flex flex-col items-center gap-2 group">
                            <ChevronRight size={20} className="text-neutral-500 group-hover:text-white " />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-white ">Next</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Deck Stack Layout */}
            <div className="md:hidden relative w-full h-full max-w-sm mx-auto pt-8 pb-4 flex flex-col justify-start items-center">
                <div className="relative w-full aspect-[4/5] max-h-[440px] px-6">
                    <AnimatePresence>
                        {items.slice(0, 2).reverse().map((item, index) => {
                            const isTop = item.id === items[0].id;
                            // Reverse index: Top is 1 (length-1), Back is 0
                            const stackIndex = items.slice(0, 2).length - 1 - index;

                            return (
                                <DeckCard
                                    key={item.id}
                                    item={item}
                                    isTop={isTop}
                                    stackIndex={stackIndex}
                                    onSwipe={(action) => action === 'delete' ? handleDeleteRequested(item.id) : onSwipe(item.id, action)}
                                    onDetails={() => onDetails(item)}
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => {
                    if (itemToDelete) {
                        onSwipe(itemToDelete, 'delete');
                        setItemToDelete(null);
                    }
                }}
                title="Delete from Feed?"
            />
        </div>
    );
}

function DeckCard({
    item,
    isTop,
    stackIndex,
    onSwipe,
    onDetails
}: {
    item: FeedItem,
    isTop: boolean,
    stackIndex: number,
    onSwipe: (action: 'done' | 'dismiss' | 'delete') => void,
    onDetails: () => void
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-12, 12]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 120;
        const { x: offsetX, y: offsetY } = info.offset;

        if (Math.abs(offsetX) > Math.abs(offsetY)) {
            // Horizontal
            if (offsetX > threshold) {
                vibrate('success');
                onSwipe('done');
            } else if (offsetX < -threshold) {
                vibrate('light');
                onSwipe('dismiss');
            }
        } else {
            // Vertical
            if (offsetY > threshold) {
                // Pull Down = Delete
                vibrate('medium');
                onSwipe('delete');
            } else if (offsetY < -threshold) {
                // Pull Up = Details
                vibrate('light');
                onDetails();
            }
        }
    };

    return (
        <MotionCard
            style={{
                x: isTop ? x : 0,
                y: isTop ? y : (stackIndex * 15), // Offset back cards
                scale: isTop ? 1 : 1 - (stackIndex * 0.05), // Scale down back cards
                rotate: isTop ? rotate : 0,
                zIndex: 10 - stackIndex,
            }}
            drag={isTop ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7} // Rubber band feel
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing" }}
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: isTop ? 1 : 1 - (stackIndex * 0.05), y: isTop ? 0 : (stackIndex * 15), opacity: 1 }}
            exit={{
                x: x.get() > 50 ? 500 : (x.get() < -50 ? -500 : 0),
                y: y.get() > 50 ? 500 : 0,
                opacity: 0,
                transition: { duration: 0.2 }
            }}
            transition={SLIMY_CONFIG}
            className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing bg-[var(--surface)] squircle shadow-2xl"
        >
            {/* Inner Content */}
            <div className="h-full flex flex-col justify-between relative">
                <div
                    onClick={() => {
                        if (Math.abs(x.get()) < 5) onDetails();
                    }}
                    className="relative z-10 p-10 pt-12 flex-1 cursor-pointer active:bg-white/5 transition-colors"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                            {item.type}
                        </span>
                        <div className={clsx(
                            "h-2 w-2 rounded-full",
                            item.priority === 'high' ? 'bg-red-500' :
                                item.priority === 'medium' ? 'bg-amber-500' :
                                    item.priority === 'low' ? 'bg-blue-500' : 'bg-neutral-800'
                        )} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight uppercase tracking-wide">{item.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed font-medium line-clamp-6">{item.content}</p>
                </div>

                {/* Visual Indicator (Optional) */}
                <div className="relative z-10 mt-auto p-10 pb-12">
                    <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white/10"
                            initial={{ width: "30%" }}
                            animate={{ width: "60%" }}
                        />
                    </div>
                </div>
            </div>
        </MotionCard>
    );
}

function DesktopCard({ item, onSwipe, onDetails }: { item: FeedItem, onSwipe?: any, onDetails?: any }) {
    return (
        <div className="h-full flex flex-col justify-between bg-[var(--surface)] squircle relative shadow-2xl p-10">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">
                        {item.type}
                    </span>
                    <div className={clsx(
                        "h-3 w-3 rounded-full",
                        item.priority === 'high' ? 'bg-red-500' :
                            item.priority === 'medium' ? 'bg-amber-500' :
                                item.priority === 'low' ? 'bg-blue-500' : 'bg-neutral-800'
                    )} />
                </div>
                <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tight leading-none">{item.title}</h3>
                <p className="text-xl text-neutral-400 leading-relaxed font-medium">{item.content}</p>
            </div>
            <div className="relative z-10 mt-auto">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-white/10" style={{ width: "60%" }} />
                </div>
            </div>
        </div>
    );
}
