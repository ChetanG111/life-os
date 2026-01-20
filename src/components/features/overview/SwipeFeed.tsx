'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, Trash2, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { vibrate } from '@/utils/haptics';
import { ConfirmDeleteModal } from '../cards/ConfirmDeleteModal';
import { useSettings } from '@/context/SettingsContext';

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
            <div className="flex h-full flex-col items-center justify-center text-neutral-600 pb-24">
                <div>
                    <CheckCircle2 size={48} className="mb-6 opacity-20" />
                </div>
                <p className="text-sm font-medium uppercase tracking-[0.2em]">
                    All caught up
                </p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col justify-start items-center">
            {/* Desktop Carousel Layout */}
            <div className="hidden md:flex flex-col items-center justify-center w-full max-w-5xl h-full py-10">
                <div className="relative w-full flex items-center justify-center gap-12 mb-16">
                    {/* Left Card Placeholder */}
                    <div className="w-[180px] h-[260px] opacity-20 scale-90 blur-[1px] transform -rotate-6">
                        <DesktopCard item={items[(currentIndex - 1 + items.length) % items.length]} />
                    </div>

                    {/* Active Card */}
                    <div className="w-[380px] h-[520px] z-10">
                        <div className="h-full w-full">
                            <DesktopCard item={items[currentIndex]} onSwipe={onSwipe} onDetails={onDetails} />
                        </div>
                    </div>

                    {/* Right Card Placeholder */}
                    <div className="w-[180px] h-[260px] opacity-20 scale-90 blur-[1px] transform rotate-6">
                        <DesktopCard item={items[(currentIndex + 1) % items.length]} />
                    </div>
                </div>

                {/* Desktop Controls */}
                <div className="flex flex-col items-center gap-8">
                    <div className="flex items-center gap-10">
                        <button onClick={prev} className="flex flex-col items-center gap-2 group">
                            <ChevronLeft size={20} className="text-neutral-500 group-hover:text-white " />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-white ">Prev</span>
                        </button>

                        {/* Dots */}
                        <div className="flex items-center gap-3">
                            {items.slice(0, 5).map((_, i) => (
                                <div
                                    key={i}
                                    className={clsx(
                                        "  rounded-full",
                                        i === currentIndex % 5 ? "w-8 h-1.5 bg-red-500" : "w-1.5 h-1.5 bg-neutral-800"
                                    )}
                                />
                            ))}
                        </div>

                        <button onClick={next} className="flex flex-col items-center gap-2 group">
                            <ChevronRight size={20} className="text-neutral-500 group-hover:text-white " />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover:text-white ">Next</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Horizontal Scroll Layout */}
            <div className="md:hidden w-full h-full pt-8 pb-4">
                <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory px-8 gap-4 pb-8 scrollbar-hide items-center">
                    {items.map((item) => (
                        <div key={item.id} className="w-full min-w-[300px] h-full max-h-[440px] snap-center flex-shrink-0">
                            <FeedCard
                                item={item}
                                onDone={() => onSwipe(item.id, 'done')}
                                onDelete={() => handleDeleteRequested(item.id)}
                                onDetails={() => onDetails(item)}
                            />
                        </div>
                    ))}
                    {/* Spacer for end of list scrolling */}
                    <div className="w-4 flex-shrink-0" />
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

function DesktopCard({ item, onSwipe, onDetails }: { item: FeedItem, onSwipe?: any, onDetails?: any }) {
    return (
        <Card className="h-full flex flex-col justify-between bg-neutral-900 border-white/5 overflow-hidden relative shadow-2xl rounded-[32px] p-10">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">
                        {item.type}
                    </span>
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                </div>
                <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tight leading-none">{item.title}</h3>
                <p className="text-xl text-neutral-400 leading-relaxed font-medium">{item.content}</p>
            </div>

            <div className="relative z-10 mt-auto">
                <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-neutral-700"
                        style={{ width: "60%" }}
                    />
                </div>
            </div>
        </Card>
    );
}

function FeedCard({
    item,
    onDone,
    onDelete,
    onDetails
}: {
    item: FeedItem,
    onDone: () => void,
    onDelete: () => void,
    onDetails: () => void
}) {
    return (
        <div className="h-full w-full">
            <Card className="h-full flex flex-col justify-between bg-[var(--surface)] border-white/5 overflow-hidden relative shadow-2xl rounded-[32px]">
                <div 
                    onClick={onDetails}
                    className="relative z-10 p-6 pt-8 flex-1 cursor-pointer active:bg-white/5 "
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                            {item.type}
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight uppercase tracking-wide">{item.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed font-medium line-clamp-6">{item.content}</p>
                </div>

                <div className="relative z-10 mt-auto p-4 flex gap-3 bg-black/20">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="flex-1 py-3 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 active:scale-95 "
                    >
                        <Trash2 size={20} />
                    </button>
                    <button 
                         onClick={(e) => { e.stopPropagation(); onDetails(); }}
                        className="flex-1 py-3 bg-white/5 rounded-xl flex items-center justify-center text-neutral-400 active:scale-95 "
                    >
                        <Info size={20} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDone(); }}
                        className="flex-1 py-3 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 active:scale-95 "
                    >
                        <CheckCircle2 size={20} />
                    </button>
                </div>
            </Card>
        </div>
    );
}