'use client';

import { motion, AnimatePresence, useDragControls, Variants } from 'framer-motion';
import { Mic, Image as ImageIcon, Link, ArrowUp, CheckCircle2, Sparkles, Hash, Calendar, X, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { vibrate } from '@/utils/haptics';
import clsx from 'clsx';
import { FeedItem } from './SwipeFeed';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useSettings } from '@/context/SettingsContext';
import { useData } from '@/context/DataContext';
import { UNIVERSAL_STAGGER_CONTAINER, createStaggerItemVariants, UNIVERSAL_MODAL_VARIANTS } from '@/utils/animations';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { useToast } from '@/context/ToastContext';

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
    initialType
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd?: (item: FeedItem) => void;
    initialType?: ItemType;
}) {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [status, setStatus] = useState<InputState>('idle');
    const [selectedType, setSelectedType] = useState<ItemType>(initialType || 'task');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    // New Fields
    const [dueDate, setDueDate] = useState<string>('');
    const [images, setImages] = useState<string[]>([]);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const dragControls = useDragControls();
    const { autoFocusQuickAdd } = useSettings();
    const { addTask, addNote } = useData();
    const { showToast } = useToast();

    useBackToClose(isOpen, onClose);
    useLockBodyScroll(isOpen);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setText('');
            setTitle('');
            setDueDate('');
            setImages([]);
            if (initialType) setSelectedType(initialType);
            setPriority(initialType === 'goal' ? 'high' : 'medium');
            // Focus input after animation
            if (autoFocusQuickAdd) {
                setTimeout(() => inputRef.current?.focus(), 400);
            }
        }
    }, [isOpen, autoFocusQuickAdd]);

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
        if (!text.trim() && images.length === 0) return;

        vibrate('medium');
        setStatus('processing');

        // Fast Simulation for Instant Feedback
        setTimeout(() => {
            if (selectedType === 'task' || selectedType === 'goal') {
                addTask({
                    title: title.trim() || (selectedType === 'task' ? 'New Task' : 'New Goal'),
                    priority: priority,
                    tags: [selectedType],
                    description: text,
                    dueDate: dueDate || undefined
                });
            } else {
                // note, idea, identity all stored as notes
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
                    images: images
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

            setStatus('success');
            vibrate('success');

            // Show toast notification
            const typeLabel = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
            showToast(`${typeLabel} added successfully`, 'success');

            // Close faster
            setTimeout(() => {
                onClose();
            }, 500);
        }, 300);
    };

    const toggleListening = () => {
        if (status === 'listening') {
            setStatus('idle');
            vibrate('light');
        } else {
            setStatus('listening');
            vibrate('medium');
            // Mock voice input simulation
            setTimeout(() => {
                setText(prev => prev + (prev ? ' ' : '') + "Review the quarterly roadmap with the design team.");
                setStatus('idle');
                vibrate('success');
            }, 2000);
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

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const springConfig = useSlimySpring();
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

    // Multi-stage Haptics (Suggestion 5)
    useEffect(() => {
        if (isOpen) {
            vibrate('light');
            const timer = setTimeout(() => vibrate('soft'), 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const containerVariants = UNIVERSAL_MODAL_VARIANTS(springConfig);
    const slimyItem = createStaggerItemVariants(springConfig);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Hidden Inputs */}
                    <input
                        type="datetime-local"
                        ref={dateInputRef}
                        className="hidden"
                        onChange={(e) => {
                            setDueDate(e.target.value);
                            vibrate('success');
                        }}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 glass-material z-50 overflow-hidden"
                    >
                        <div className="absolute inset-0 noise-overlay opacity-[0.015]" />
                    </motion.div>

                    {/* Modal Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        drag={isDesktop ? false : "y"}
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.05, bottom: 0.7 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 300) {
                                vibrate('light');
                                onClose();
                            }
                        }}
                        className={clsx(
                            "fixed z-50 bg-background overflow-hidden flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.4)] border-t border-white/5",
                            "inset-x-0 bottom-0 h-[85vh] rounded-t-[32px] md:rounded-[32px]",
                            "md:inset-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-2xl md:h-auto md:max-h-[85vh] md:shadow-2xl md:shadow-black/50"
                        )}
                    >
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y [web-kit-overflow-scrolling:touch] flex flex-col scrollbar-hide">
                            {/* Desktop Header (Image 0) */}
                            <div className="hidden md:flex flex-none pt-8 pb-4 px-8 flex-col items-center">
                                <div className="w-12 h-1 bg-neutral-800 rounded-full mb-6 opacity-50" />
                                <motion.h2 custom={0} variants={slimyItem} className="text-2xl font-bold text-white mb-8">New Task</motion.h2>

                                {/* Desktop Type Selector Grid */}
                                <motion.div custom={1} variants={slimyItem} className="w-full grid grid-cols-4 gap-4 mb-8">
                                    {ITEM_TYPES.filter(t => t.id !== 'identity').map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = selectedType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => {
                                                    vibrate('light');
                                                    setSelectedType(type.id);
                                                }}
                                                className={clsx(
                                                    "flex flex-col items-center justify-center gap-2 py-6 rounded-2xl transition-all border",
                                                    isSelected
                                                        ? "bg-white text-black border-white"
                                                        : "bg-white/5 text-neutral-500 border-transparent hover:bg-white/10 hover:text-neutral-300"
                                                )}
                                            >
                                                <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} />
                                                <span className="text-xs font-bold uppercase tracking-widest">{type.label}</span>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            </div>

                            {/* Mobile Header & Drag Handle */}
                            <motion.div
                                custom={2}
                                variants={slimyItem}
                                onPointerDown={(e) => dragControls.start(e)}
                                className="flex md:hidden flex-none pt-4 pb-2 px-6 flex-col items-center cursor-grab active:cursor-grabbing touch-none"
                            >
                                <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4 md:hidden" />
                                <div className="w-full flex items-center justify-center">
                                    <h2 className="text-xl font-bold text-white capitalize">
                                        New {selectedType}
                                    </h2>
                                </div>
                            </motion.div>

                            {/* Mobile Type Selector Grid */}
                            <div className="px-6 py-2 block md:hidden">
                                <div className="grid grid-cols-5 gap-2">
                                    {ITEM_TYPES.map((type, i) => {
                                        const Icon = type.icon;
                                        const isSelected = selectedType === type.id;
                                        return (
                                            <motion.button
                                                key={type.id}
                                                custom={3 + i}
                                                variants={slimyItem}
                                                onClick={() => {
                                                    vibrate('light');
                                                    setSelectedType(type.id);
                                                }}
                                                className={clsx(
                                                    "flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all relative overflow-hidden",
                                                    isSelected
                                                        ? "bg-white text-black"
                                                        : "bg-white/5 text-neutral-500 hover:bg-white/10 hover:text-neutral-300"
                                                )}
                                            >
                                                <span className="relative z-10">
                                                    <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} />
                                                </span>
                                                <span className="text-[11px] font-medium tracking-wide relative z-10">
                                                    {type.label}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex flex-col px-6 md:px-10 relative pb-12 md:pb-10">
                                {/* Success/Processing Overlays */}
                                {status === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--surface)]"
                                    >
                                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                                            <CheckCircle2 size={40} className="text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Captured</h3>
                                        <p className="text-neutral-400">Processed by Life OS</p>
                                    </motion.div>
                                )}
                                {status === 'processing' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--surface)]/80 backdrop-blur-sm"
                                    >
                                        <Sparkles size={48} className="text-blue-500 animate-pulse mb-6" />
                                        <h3 className="text-xl font-bold text-white mb-2">Thinking...</h3>
                                        <p className="text-neutral-400">Categorizing and tagging</p>
                                    </motion.div>
                                )}

                                {/* Input Layout */}
                                <motion.div custom={4} variants={slimyItem} className="flex flex-col md:gap-4">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Title (Optional)"
                                        className="w-full bg-transparent text-xl font-bold text-white placeholder-neutral-700 outline-none mb-2 md:mb-0 px-1"
                                    />
                                    <textarea
                                        ref={inputRef}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder={status === 'listening' ? "Listening..." : "What's on your mind?"}
                                        className="w-full h-40 md:h-32 bg-transparent text-lg leading-tight text-white placeholder-neutral-700 resize-none outline-none font-medium p-1 transition-colors"
                                    />
                                </motion.div>

                                {/* Action Bar */}
                                <motion.div
                                    custom={5}
                                    variants={slimyItem}
                                    className="flex items-center justify-between mt-6 md:mt-8"
                                >
                                    {/* Left Group */}
                                    <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1 pr-2">
                                        <button
                                            className={clsx(
                                                "p-3 rounded-xl transition-colors",
                                                dueDate ? "text-blue-400 bg-blue-500/10" : "text-neutral-400 hover:text-white hover:bg-white/10"
                                            )}
                                            onClick={() => {
                                                vibrate('light');
                                                dateInputRef.current?.showPicker();
                                            }}
                                        >
                                            <Calendar size={20} />
                                        </button>
                                        <button
                                            onClick={toggleListening}
                                            className={clsx(
                                                "p-3 rounded-xl transition-all duration-300",
                                                status === 'listening'
                                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                                    : "text-neutral-400 hover:text-white hover:bg-white/10"
                                            )}
                                        >
                                            <Mic size={20} />
                                        </button>
                                        {(selectedType === 'note' || selectedType === 'idea') && (
                                            <button
                                                className="hidden md:flex p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                                onClick={() => {
                                                    vibrate('light');
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                <ImageIcon size={20} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Right Group */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={cyclePriority}
                                            className={clsx(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-neutral-800",
                                                priority === 'high' ? "bg-red-500/10" :
                                                    priority === 'medium' ? "bg-amber-500/10" :
                                                        "bg-blue-500/10"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-4 h-4 rounded-full transition-all duration-300",
                                                priority === 'high' ? "bg-red-500" :
                                                    priority === 'medium' ? "bg-amber-500" :
                                                        "bg-blue-500"
                                            )} />
                                        </button>

                                        <button
                                            onClick={handleSubmit}
                                            disabled={(!text.trim() && images.length === 0) || status !== 'idle'}
                                            className={clsx(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                                (text.trim() || images.length > 0) && status === 'idle'
                                                    ? "bg-neutral-800 hover:bg-neutral-700 text-white active:scale-95"
                                                    : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                                            )}
                                        >
                                            <ArrowUp size={20} strokeWidth={3} />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Bottom Spacer - only mobile */}
                            <div className="flex-none h-24 pb-safe-bottom md:hidden" />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
