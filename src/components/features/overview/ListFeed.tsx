'use client';

import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { FeedItem } from './SwipeFeed';
import { CheckCircle2, Trash2, Hash, Sparkles, ArrowUp, Clock, Calendar } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useSettings } from '@/context/SettingsContext';
import clsx from 'clsx';
import { useSlimySpring } from '@/hooks/use-slimy-spring';

interface ListFeedProps {
    items: FeedItem[];
    onSwipe: (id: string, action: 'done' | 'dismiss' | 'delete') => void;
    onDetails: (item: FeedItem) => void;
}

export function ListFeed({ items, onSwipe, onDetails }: ListFeedProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-neutral-600 pb-24">
                <CheckCircle2 size={32} className="mb-4 opacity-20" />
                <p className="text-xs font-medium uppercase tracking-[0.2em]">No items</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 px-2 pb-24 overflow-y-auto h-full touch-pan-y">
            <AnimatePresence mode='popLayout'>
                {items.map((item, index) => (
                    <ListItem 
                        key={item.id} 
                        item={item} 
                        index={index}
                        onSwipe={onSwipe} 
                        onDetails={onDetails} 
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ListItem({ 
    item, 
    index,
    onSwipe, 
    onDetails 
}: { 
    item: FeedItem;
    index: number;
    onSwipe: (id: string, action: 'done' | 'dismiss' | 'delete') => void;
    onDetails: (item: FeedItem) => void;
}) {
    const x = useMotionValue(0);
    const { confirmDelete } = useSettings();
    const springConfig = useSlimySpring();
    
    // Swipe Thresholds
    const SWIPE_THRESHOLD = 80;
    
    // Visual indicators
    const bgLeftOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
    const bgRightOpacity = useTransform(x, [0, -SWIPE_THRESHOLD], [0, 1]);
    
    const handleDragEnd = (event: any, info: PanInfo) => {
        const offset = info.offset.x;
        
        if (offset > SWIPE_THRESHOLD) {
            vibrate('success');
            onSwipe(item.id, 'done');
        } else if (offset < -SWIPE_THRESHOLD) {
            vibrate('medium');
            onSwipe(item.id, 'delete');
        }
    };

    const getIcon = () => {
        switch (item.type) {
            case 'task': return <CheckCircle2 size={18} />;
            case 'note': return <Hash size={18} />;
            default: return <Sparkles size={18} />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ ...springConfig, delay: index * 0.05 }}
            className="relative group"
        >
            {/* Background Actions */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden flex z-0">
                <motion.div 
                    style={{ opacity: bgLeftOpacity }}
                    className="flex-1 bg-green-500/20 flex items-center justify-start pl-4"
                >
                    <CheckCircle2 className="text-green-500" size={24} />
                </motion.div>
                <motion.div 
                    style={{ opacity: bgRightOpacity }}
                    className="flex-1 bg-red-500/20 flex items-center justify-end pr-4"
                >
                    <Trash2 className="text-red-500" size={24} />
                </motion.div>
            </div>

            {/* Foreground Card */}
            <motion.div
                style={{ x }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1} // Stiff drag
                onDragEnd={handleDragEnd}
                // Stop propagation to prevent tab swipe
                onPointerDownCapture={(e) => e.stopPropagation()}
                onClick={() => {
                    if (Math.abs(x.get()) < 5) onDetails(item);
                }}
                className={clsx(
                    "relative z-10 bg-[var(--surface)] border border-white/5 rounded-2xl p-4 flex items-start gap-4 active:cursor-grabbing cursor-grab touch-pan-y",
                    item.priority === 'high' ? "shadow-[inset_4px_0_0_0_#EF4444]" : 
                    item.priority === 'medium' ? "shadow-[inset_4px_0_0_0_#F59E0B]" : ""
                )}
            >
                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-neutral-500">{getIcon()}</span>
                        <h4 className="text-base font-bold text-white truncate leading-tight">
                            {item.title}
                        </h4>
                        {item.dueTime && (
                            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">
                                <Clock size={10} /> {item.dueTime}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed font-medium">
                        {item.content}
                    </p>
                    
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-2 mt-3">
                            {item.tags.map(tag => (
                                <span key={tag} className="text-[10px] text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full font-medium tracking-wide">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
