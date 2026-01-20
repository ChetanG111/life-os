'use client';

import { FeedItem } from './SwipeFeed';
import { CheckCircle2, Trash2, Hash, Sparkles, Clock } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useSettings } from '@/context/SettingsContext';
import clsx from 'clsx';
import { ConfirmDeleteModal } from '../cards/ConfirmDeleteModal';
import { useState } from 'react';

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
            {items.map((item, index) => (
                <ListItem
                    key={item.id}
                    item={item}
                    index={index}
                    onSwipe={onSwipe}
                    onDetails={onDetails}
                />
            ))}
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
    const { confirmDelete } = useSettings();
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const getIcon = () => {
        switch (item.type) {
            case 'task': return <CheckCircle2 size={18} />;
            case 'note': return <Hash size={18} />;
            default: return <Sparkles size={18} />;
        }
    };

    const handleDelete = () => {
        if (confirmDelete) {
            setItemToDelete(item.id);
        } else {
            onSwipe(item.id, 'delete');
        }
    };

    return (
        <>
            <div className="relative group">
                <div
                    onClick={() => onDetails(item)}
                    className={clsx(
                        "relative z-10 bg-[var(--surface)] border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:bg-white/5 ",
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

                    {/* Action Buttons (Right Side) */}
                    <div className="flex items-center gap-2 pl-2 border-l border-white/5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                vibrate('success');
                                onSwipe(item.id, 'done');
                            }}
                            className="p-2 text-neutral-500 hover:text-green-500 hover:bg-green-500/10 rounded-xl "
                        >
                            <CheckCircle2 size={20} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                vibrate('medium');
                                handleDelete();
                            }}
                            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl "
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
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
                title="Delete Item?"
            />
        </>
    );
}