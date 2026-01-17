'use client';

import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Mic, Image, Link, ArrowUp, CheckCircle2, Sparkles, Hash, Flag } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { vibrate } from '@/utils/haptics';
import clsx from 'clsx';
import { FeedItem } from './SwipeFeed';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useSettings } from '@/context/SettingsContext';
import { useData } from '@/context/DataContext';

type InputState = 'idle' | 'listening' | 'processing' | 'success';
type ItemType = 'task' | 'note' | 'idea' | 'goal';

const ITEM_TYPES: { id: ItemType; label: string; icon: any }[] = [
    { id: 'task', label: 'Task', icon: CheckCircle2 },
    { id: 'note', label: 'Note', icon: Hash },
    { id: 'idea', label: 'Idea', icon: Sparkles },
    { id: 'goal', label: 'Goal', icon: ArrowUp },
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
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const dragControls = useDragControls();
    const { autoFocusQuickAdd } = useSettings();
    const { addTask, addNote } = useData();

    useBackToClose(isOpen, onClose);
    useLockBodyScroll(isOpen);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setText('');
            setTitle('');
            if (initialType) setSelectedType(initialType);
            setPriority(initialType === 'goal' ? 'high' : 'medium');
            // Focus input after animation
            if (autoFocusQuickAdd) {
                setTimeout(() => inputRef.current?.focus(), 400);
            }
        }
    }, [isOpen, autoFocusQuickAdd]);

    const handleSubmit = () => {
        if (!text.trim()) return;

        vibrate('medium');
        setStatus('processing');

        // Simulate AI Processing
        setTimeout(() => {
            if (selectedType === 'task' || selectedType === 'goal') {
                addTask({
                    title: title.trim() || (selectedType === 'task' ? 'New Task' : 'New Goal'),
                    priority: priority,
                    tags: [selectedType],
                    description: text,
                });
            } else {
                addNote({
                    title: title.trim() || (selectedType === 'note' ? 'New Note' : 'New Idea'),
                    content: text,
                    type: 'text',
                    tags: [selectedType],
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

            // Close after success
            setTimeout(() => {
                onClose();
            }, 800);
        }, 1500);
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

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const slimyItem = {
        hidden: { y: 30, opacity: 0, scale: 0.9 },
        show: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 350,
                damping: 18
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag="y"
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
                        className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-[var(--surface)] rounded-t-[32px] overflow-hidden flex flex-col border-t border-white/10"
                    >
                        {/* Header & Drag Handle */}
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex-none pt-4 pb-2 px-6 flex flex-col items-center cursor-grab active:cursor-grabbing touch-none"
                        >
                            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4" />
                            <div className="w-full flex items-center justify-center">
                                <h2 className="text-xl font-bold text-white capitalize">
                                    New {selectedType}
                                </h2>
                            </div>
                        </div>

                        {/* Scrollable Content with Stagger */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="flex-1 overflow-y-auto"
                        >
                            {/* Type Selector Grid - Integrated into main stagger */}
                            <div className="px-6 py-2">
                                <div className="grid grid-cols-4 gap-2">
                                    {ITEM_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = selectedType === type.id;
                                        return (
                                            <motion.button
                                                key={type.id}
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

                            {/* Main Content */}
                            <div className="flex flex-col px-6 relative pb-12">
                                {/* State: Success */}
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

                                {/* State: Processing */}
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

                                {/* Input Area */}
                                <motion.div variants={slimyItem} className="flex flex-col mt-4">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Title (Optional)"
                                        className="w-full bg-transparent text-xl font-bold text-white placeholder-neutral-700 outline-none mb-2 px-6"
                                    />
                                    <textarea
                                        ref={inputRef}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        placeholder={status === 'listening' ? "Listening..." : "What's on your mind?"}
                                        className="w-full h-40 bg-transparent text-lg leading-tight text-white placeholder-neutral-700 resize-none outline-none font-medium p-6 transition-colors"
                                    />
                                </motion.div>

                                {/* Action Bar & Tools */}
                                <motion.div
                                    variants={slimyItem}
                                    className="flex items-center justify-between mt-6"
                                >
                                    {/* Left Side: Tools Group */}
                                    <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1 pr-2">
                                        <button
                                            className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                            onClick={() => vibrate('light')}
                                        >
                                            <Image size={20} />
                                        </button>
                                        <button
                                            className="p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                            onClick={() => vibrate('light')}
                                        >
                                            <Link size={20} />
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
                                    </div>

                                    {/* Right Side: Priority & Submit */}
                                    <div className="flex items-center gap-3">
                                        {/* Priority Selector */}
                                        <button
                                            onClick={cyclePriority}
                                            className={clsx(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                                priority === 'high' ? "bg-red-500/10 text-red-500" :
                                                    priority === 'medium' ? "bg-amber-500/10 text-amber-500" :
                                                        "bg-blue-500/10 text-blue-500"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full transition-all duration-300 shadow-sm",
                                                priority === 'high' ? "bg-red-500 shadow-red-500/40" :
                                                    priority === 'medium' ? "bg-amber-500 shadow-amber-500/40" :
                                                        "bg-blue-500 shadow-blue-500/40"
                                            )} />
                                        </button>

                                        {/* Submit Button (Icon Only) */}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!text.trim() || status !== 'idle'}
                                            className={clsx(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg",
                                                text.trim() && status === 'idle'
                                                    ? "bg-white text-black shadow-white/10 active:scale-90"
                                                    : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                                            )}
                                        >
                                            <ArrowUp size={20} strokeWidth={3} className={text.trim() ? "rotate-45" : ""} />
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Listening Visualizer Overlay */}
                                {status === 'listening' && (
                                    <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-1.5 items-end h-16 pointer-events-none">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: [10, 40, 15, 50, 20] }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1.5,
                                                    ease: "easeInOut",
                                                    delay: i * 0.1
                                                }}
                                                className="w-1.5 bg-red-500 rounded-full"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Bottom Spacer */}
                        <div className="flex-none h-24 pb-safe-bottom" />

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}