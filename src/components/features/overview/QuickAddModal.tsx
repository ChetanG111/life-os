'use client';

import { Mic, Image as ImageIcon, ArrowUp, CheckCircle2, Sparkles, Hash, Calendar, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { vibrate } from '@/utils/haptics';
import clsx from 'clsx';
import { FeedItem } from './SwipeFeed';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useSettings } from '@/context/SettingsContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { STAGGER_CHILDREN, OVERSHOOT_VARIANT } from '@/utils/animations';
import { ModalShell } from '@/components/ui/ModalShell';

type InputState = 'idle' | 'listening' | 'processing' | 'success';
type ItemType = 'task' | 'note' | 'idea' | 'goal' | 'identity';

const ITEM_TYPES: { id: ItemType; label: string; icon: any }[] = [
    { id: 'task', label: 'Task', icon: CheckCircle2 },
    { id: 'note', label: 'Note', icon: Hash },
    { id: 'idea', label: 'Idea', icon: Sparkles },
    { id: 'goal', label: 'Goal', icon: ArrowUp },
    { id: 'identity', label: 'Identity', icon: User },
];

export function QuickAddModal({
    isOpen,
    onClose,
    onAdd,
    initialType,
    editItem
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (item: FeedItem) => void;
    initialType?: ItemType;
    editItem?: FeedItem;
}) {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [status, setStatus] = useState<InputState>('idle');
    const [selectedType, setSelectedType] = useState<ItemType>(initialType || 'task');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const [dueDate, setDueDate] = useState<string>('');
    const [images, setImages] = useState<string[]>([]);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { autoFocusQuickAdd } = useSettings();
    const { addTask, addNote, updateTask, updateNote } = useData();
    const { showToast } = useToast();

    useBackToClose(isOpen, onClose);
    useLockBodyScroll(isOpen);

    // Initialize from editItem
    useEffect(() => {
        if (isOpen && editItem) {
            setTitle(editItem.title || '');
            setText(editItem.content || '');
            setSelectedType(editItem.type === 'task' ? 'task' : 'note');
            setPriority(editItem.priority || 'medium');
            setDueDate(editItem.dueDate || '');
            setImages(editItem.images || []);
        } else if (isOpen) {
            // Reset for new item
            setTitle('');
            setText('');
            setSelectedType(initialType || 'task');
            setPriority(initialType === 'goal' ? 'high' : 'medium');
            setDueDate('');
            setImages([]);
        }

        if (isOpen) {
            setStatus('idle');
            if (autoFocusQuickAdd) {
                setTimeout(() => inputRef.current?.focus(), 400); // Delay for animation
            }
            vibrate('light');
        }
    }, [isOpen, editItem, initialType, autoFocusQuickAdd]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImages(prev => [...prev, base64]);
                vibrate('success');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        vibrate('medium');
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const hasContent = title.trim() || text.trim() || images.length > 0;
        if (!hasContent) return;

        vibrate('medium');
        setStatus('processing');

        if (editItem) {
            // Update mode
            if (editItem.type === 'task') {
                updateTask(editItem.originalId!, {
                    title: title.trim(),
                    description: text,
                    priority: priority,
                    dueDate: dueDate || undefined
                });
            } else {
                updateNote(editItem.originalId!, {
                    title: title.trim(),
                    content: text,
                    priority: priority,
                    images: images
                });
            }
        } else {
            // Create mode
            if (selectedType === 'task' || selectedType === 'goal') {
                addTask({
                    title: title.trim() || (selectedType === 'task' ? 'New Task' : 'New Goal'),
                    priority: priority,
                    tags: [selectedType],
                    description: text,
                    dueDate: dueDate || undefined
                });
            } else {
                const typeLabels: Record<string, string> = {
                    note: 'New Note',
                    idea: 'New Idea',
                    identity: 'Identity Update'
                };
                addNote({
                    title: title.trim() || typeLabels[selectedType] || 'New Note',
                    content: text,
                    type: images.length > 0 ? 'image' : 'text',
                    tags: [selectedType],
                    images: images,
                    priority: priority
                });
            }

            if (onAdd) {
                const newItem: FeedItem = {
                    id: Date.now().toString(),
                    title: title.trim() || (selectedType === 'task' ? 'New Task' : 'New Note'),
                    type: selectedType === 'task' || selectedType === 'goal' ? 'task' : 'note',
                    content: text,
                    color: 'bg-blue-500',
                    tags: [selectedType],
                    priority: priority
                };
                onAdd(newItem);
            }
        }

        setStatus('success');
        vibrate('success');
        const actionLabel = editItem ? 'updated' : 'added';
        const typeLabel = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
        showToast(`${typeLabel} ${actionLabel} successfully`, 'success');
        onClose();
    };

    const toggleListening = () => {
        if (status === 'listening') {
            setStatus('idle');
            vibrate('light');
        } else {
            setStatus('listening');
            vibrate('medium');
            setTimeout(() => {
                setText(prev => prev + (prev ? ' ' : '') + "Review the quarterly roadmap with the design team.");
                setStatus('idle');
                vibrate('success');
            }, 1500);
        }
    };

    const cyclePriority = () => {
        vibrate('light');
        const map: Record<string, 'low' | 'medium' | 'high'> = {
            low: 'medium',
            medium: 'high',
            high: 'low'
        };
        setPriority(map[priority]);
    };

    return (
        <ModalShell isOpen={isOpen} onClose={onClose}>
            <input type="datetime-local" ref={dateInputRef} className="hidden" onChange={(e) => { setDueDate(e.target.value); vibrate('success'); }} />
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageSelect} />

            <motion.div
                variants={STAGGER_CHILDREN}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto overscroll-contain touch-pan-y [web-kit-overflow-scrolling:touch] flex flex-col scrollbar-hide"
            >
                {!editItem && (
                    <div className="hidden md:flex flex-none pt-8 pb-4 px-8 flex-col items-center relative">
                        <div className="w-12 h-1 bg-neutral-800 rounded-full mb-6 opacity-50" />
                        <motion.h2 variants={OVERSHOOT_VARIANT} className="text-2xl font-bold text-white mb-8">New Item</motion.h2>

                        <div className="w-full grid grid-cols-4 gap-4 mb-8">
                            {ITEM_TYPES.filter(t => t.id !== 'identity').map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.id;
                                return (
                                    <motion.button
                                        variants={OVERSHOOT_VARIANT}
                                        key={type.id}
                                        onClick={() => { vibrate('light'); setSelectedType(type.id); }}
                                        className={clsx(
                                            "flex flex-col items-center justify-center gap-2 py-6 rounded-2xl",
                                            isSelected ? "bg-white text-black" : "bg-white/5 text-neutral-500 hover:bg-white/10"
                                        )}
                                    >
                                        <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} />
                                        <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div
                    className="flex md:hidden flex-none pt-4 pb-2 px-6 flex-col items-center relative"
                >
                    <div className="w-12 h-1.5 bg-neutral-700/50 rounded-full mb-4 md:hidden" />
                    <div className="w-full flex items-center justify-center">
                        <motion.h2 variants={OVERSHOOT_VARIANT} className="text-xl font-bold text-white capitalize">
                            {editItem ? `Edit ${editItem.type}` : `New ${selectedType}`}
                        </motion.h2>
                    </div>
                </div>

                {!editItem && (
                    <div className="px-4 py-2 block md:hidden w-full">
                        <div className="relative flex items-center bg-[#050505] rounded-[20px] p-1.5 ring-1 ring-white/10">
                            {ITEM_TYPES.map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.id;
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => { vibrate('light'); setSelectedType(type.id); }}
                                        className="relative flex-1 flex flex-col items-center justify-center gap-1.5 py-3 z-10 group"
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="active-indicator"
                                                className="absolute inset-0 bg-white rounded-2xl shadow-lg"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 350,
                                                    damping: 25
                                                }}
                                            />
                                        )}
                                        <span className={clsx("relative z-20 transition-colors duration-200", isSelected ? "text-black" : "text-[#666666] group-hover:text-[#AAAAAA]")}>
                                            <Icon size={22} strokeWidth={2.5} />
                                        </span>
                                        <span className={clsx("relative z-20 text-[10px] font-bold uppercase tracking-wide transition-colors duration-200", isSelected ? "text-black" : "text-[#666666] group-hover:text-[#AAAAAA]")}>
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex flex-col px-6 md:px-10 relative pb-12 md:pb-10 flex-1">
                    <div className="flex flex-col md:gap-4 mt-4 flex-1">
                        <motion.input
                            variants={OVERSHOOT_VARIANT}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full bg-transparent text-xl font-bold text-white placeholder-neutral-700 outline-none mb-2 md:mb-0 px-1"
                        />
                        <motion.textarea
                            variants={OVERSHOOT_VARIANT}
                            ref={inputRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={status === 'listening' ? "Listening..." : "What's on your mind?"}
                            className="w-full h-full bg-transparent text-lg leading-tight text-white placeholder-neutral-700 resize-none outline-none font-medium p-1"
                        />
                    </div>

                    {images.length > 0 && (
                        <motion.div variants={OVERSHOOT_VARIANT} className="flex gap-2 overflow-x-auto py-2">
                            {images.map((img, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                                    <button onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-black/50 p-1 text-white">
                                        {/* X button for image removal - this is fine to keep as it's a content action, not modal close */}
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    <motion.div variants={OVERSHOOT_VARIANT} className="flex items-center justify-between mt-auto pt-4">
                        <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1 pr-2">
                            <button className={clsx("p-3 rounded-xl", dueDate ? "text-blue-400 bg-blue-500/10" : "text-neutral-400 hover:text-white hover:bg-white/10")} onClick={() => { vibrate('light'); dateInputRef.current?.showPicker(); }}>
                                <Calendar size={20} />
                            </button>
                            <button onClick={toggleListening} className={clsx("p-3 rounded-xl", status === 'listening' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-neutral-400 hover:text-white hover:bg-white/10")}>
                                <Mic size={20} />
                            </button>
                            {(selectedType === 'note' || selectedType === 'idea') && (
                                <button className="hidden md:flex p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10" onClick={() => { vibrate('light'); fileInputRef.current?.click(); }}>
                                    <ImageIcon size={20} />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <motion.button
                                onClick={cyclePriority}
                                whileTap={{ scale: 0.9 }}
                                className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center bg-neutral-800 transition-colors duration-500",
                                    priority === 'high' ? "bg-red-500/10" :
                                        priority === 'medium' ? "bg-amber-500/10" :
                                            "bg-blue-500/10"
                                )}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={priority}
                                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        exit={{ scale: 0, opacity: 0, rotate: 45 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                            mass: 0.8
                                        }}
                                        className={clsx(
                                            "w-4 h-4 rounded-full",
                                            priority === 'high' ? "bg-red-500" :
                                                priority === 'medium' ? "bg-amber-500" :
                                                    "bg-blue-500"
                                        )}
                                    />
                                </AnimatePresence>
                            </motion.button>
                            <button
                                onClick={handleSubmit}
                                disabled={(!title.trim() && !text.trim() && images.length === 0) || status !== 'idle'}
                                className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                    (title.trim() || text.trim() || images.length > 0) && status === 'idle'
                                        ? "bg-white text-black hover:bg-neutral-200 active:scale-90 shadow-lg shadow-white/5"
                                        : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                                )}
                            >
                                <ArrowUp size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </motion.div>
                </div>
                <div className="flex-none h-6 pb-safe-bottom md:hidden" />
            </motion.div>
        </ModalShell>
    );
}