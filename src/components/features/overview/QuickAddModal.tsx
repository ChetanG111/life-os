'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Image, Link, ArrowUp, CheckCircle2, Sparkles, Hash } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { vibrate } from '@/utils/haptics';
import clsx from 'clsx';
import { FeedItem } from './SwipeFeed';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';

type InputState = 'idle' | 'listening' | 'processing' | 'success';
type ItemType = 'task' | 'note' | 'idea' | 'goal';

const ITEM_TYPES: { id: ItemType; label: string; icon: any }[] = [
    { id: 'task', label: 'Task', icon: CheckCircle2 },
    { id: 'note', label: 'Note', icon: Hash },
    { id: 'idea', label: 'Idea', icon: Sparkles },
    { id: 'goal', label: 'Goal', icon: ArrowUp },
];

export function QuickAddModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd?: (item: FeedItem) => void }) {
    const [text, setText] = useState('');
    const [status, setStatus] = useState<InputState>('idle');
    const [selectedType, setSelectedType] = useState<ItemType>('task');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useBackToClose(isOpen, onClose);
    useLockBodyScroll(isOpen);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setText('');
            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 400);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!text.trim()) return;

        vibrate('medium');
        setStatus('processing');

        // Simulate AI Processing
        setTimeout(() => {
            if (onAdd) {
                const newItem: FeedItem = {
                    id: Date.now().toString(),
                    title: selectedType === 'task' ? 'New Task' : 'New Note',
                    type: selectedType === 'task' || selectedType === 'goal' ? 'task' : 'note',
                    content: text,
                    color: 'bg-blue-500',
                    tags: [selectedType],
                    priority: 'medium'
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

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
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
                        className="fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-[var(--surface)] rounded-t-[32px] overflow-hidden flex flex-col border-t border-white/10"
                    >
                        {/* Header & Drag Handle */}
                        <div className="flex-none pt-4 pb-2 px-6 flex items-start justify-between">
                            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />
                            <div /> {/* Spacer */}
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col px-6 relative">
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
                            <div className="flex-1 flex flex-col mt-4">
                                <textarea
                                    ref={inputRef}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={status === 'listening' ? "Listening..." : "What's on your mind?"}
                                    className="w-full h-full bg-transparent text-2xl leading-normal text-white placeholder-neutral-600 resize-none outline-none font-medium"
                                />
                            </div>

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

                        {/* Bottom Controls */}
                        <div className="flex-none p-6 pb-safe-bottom bg-[var(--surface)] border-t border-white/5">
                             {/* Type Selector */}
                             <motion.div 
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1"
                            >
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
                                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                                isSelected 
                                                    ? "bg-white text-black shadow-lg shadow-white/10 scale-105" 
                                                    : "bg-white/5 text-neutral-400 hover:bg-white/10"
                                            )}
                                        >
                                            <Icon size={16} />
                                            {type.label}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>

                            {/* Action Bar */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 350, damping: 18 }}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <button 
                                        className="p-3 rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                        onClick={() => vibrate('light')}
                                    >
                                        <Image size={24} />
                                    </button>
                                    <button 
                                        className="p-3 rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                                        onClick={() => vibrate('light')}
                                    >
                                        <Link size={24} />
                                    </button>
                                    <button
                                        onClick={toggleListening}
                                        className={clsx(
                                            "p-3 rounded-full transition-all duration-300",
                                            status === 'listening'
                                                ? "bg-red-500/20 text-red-500 ring-2 ring-red-500 ring-offset-2 ring-offset-[#121212]" 
                                                : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        <Mic size={24} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!text.trim() || status !== 'idle'}
                                    className={clsx(
                                        "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                                        text.trim() && status === 'idle'
                                            ? "bg-white text-black shadow-white/10 hover:scale-105 active:scale-95" 
                                            : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                                    )}
                                >
                                    <ArrowUp size={28} strokeWidth={2.5} />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}