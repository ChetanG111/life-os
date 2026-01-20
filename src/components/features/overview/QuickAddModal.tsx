'use client';

import { Mic, Image as ImageIcon, ArrowUp, CheckCircle2, Sparkles, Hash, ArrowLeft, Calendar, User, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { vibrate } from '@/utils/haptics';
import clsx from 'clsx';
import { FeedItem } from './SwipeFeed';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useSettings } from '@/context/SettingsContext';
import { useData } from '@/context/DataContext';
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
            // Focus input
            if (autoFocusQuickAdd) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            vibrate('light');
        }
    }, [isOpen, autoFocusQuickAdd, initialType]);

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

        // Logic processing
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

        // Close
        onClose();
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

    if (!isOpen) return null;

    return (
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
            <div
                onClick={onClose}
                className="fixed inset-0 glass-material z-50 overflow-hidden"
            >
                <div className="absolute inset-0 noise-overlay opacity-[0.015]" />
            </div>

            {/* Modal Content */}
            <div
                className={clsx(
                    "fixed z-50 bg-background overflow-hidden flex flex-col shadow-[0_-8px_32px_rgba(0,0,0,0.4)] border-t border-white/5",
                    "inset-x-0 bottom-0 h-[85vh] rounded-t-[32px] md:rounded-[32px]",
                    "md:inset-auto md:top-1/2 md:left-1/2 md:w-full md:max-w-2xl md:h-auto md:max-h-[85vh] md:shadow-2xl md:shadow-black/50 md:-translate-x-1/2 md:-translate-y-1/2"
                )}
            >
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y [web-kit-overflow-scrolling:touch] flex flex-col scrollbar-hide">
                    {/* Desktop Header */}
                    <div className="hidden md:flex flex-none pt-8 pb-4 px-8 flex-col items-center relative">
                        <div className="w-12 h-1 bg-neutral-800 rounded-full mb-6 opacity-50" />
                        <h2 className="text-2xl font-bold text-white mb-8">New Task</h2>
                        <button onClick={onClose} className="absolute right-8 top-8 text-neutral-500">
                            <X size={24} />
                        </button>

                        {/* Desktop Type Selector Grid */}
                        <div className="w-full grid grid-cols-4 gap-4 mb-8">
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
                                            "flex flex-col items-center justify-center gap-2 py-6 rounded-2xl  border",
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
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <div className="flex md:hidden flex-none pt-4 pb-2 px-6 flex-col items-center relative">
                        <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4 md:hidden" />
                        <div className="w-full flex items-center justify-center">
                            <h2 className="text-xl font-bold text-white capitalize">
                                New {selectedType}
                            </h2>
                        </div>
                        <button onClick={onClose} className="absolute right-6 top-4 text-neutral-500">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Mobile Type Selector Grid */}
                    <div className="px-6 py-2 block md:hidden">
                        <div className="grid grid-cols-5 gap-2">
                            {ITEM_TYPES.map((type, i) => {
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
                                            "flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl  relative overflow-hidden",
                                            isSelected
                                                ? "bg-white text-black"
                                                : "bg-white/5 text-neutral-500 hover:bg-white/10 hover:text-neutral-300"
                                        )}
                                    >
                                        <Icon size={24} strokeWidth={isSelected ? 2.5 : 2} />
                                        <span className="text-[11px] font-medium tracking-wide relative z-10">
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-col px-6 md:px-10 relative pb-12 md:pb-10 flex-1">
                        
                        {/* Input Layout */}
                        <div className="flex flex-col md:gap-4 mt-4 flex-1">
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
                                className="w-full h-full bg-transparent text-lg leading-tight text-white placeholder-neutral-700 resize-none outline-none font-medium p-1 "
                            />
                        </div>

                        {/* Images Preview */}
                        {images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => removeImage(i)}
                                            className="absolute top-0 right-0 bg-black/50 p-1 text-white"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between mt-auto pt-4">
                            {/* Left Group */}
                            <div className="flex items-center gap-1 bg-white/5 rounded-2xl p-1 pr-2">
                                <button
                                    className={clsx(
                                        "p-3 rounded-xl ",
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
                                        "p-3 rounded-xl  ",
                                        status === 'listening'
                                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                            : "text-neutral-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <Mic size={20} />
                                </button>
                                {(selectedType === 'note' || selectedType === 'idea') && (
                                    <button
                                        className="hidden md:flex p-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 "
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
                                        "w-12 h-12 rounded-2xl flex items-center justify-center   bg-neutral-800",
                                        priority === 'high' ? "bg-red-500/10" :
                                            priority === 'medium' ? "bg-amber-500/10" :
                                                "bg-blue-500/10"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-4 h-4 rounded-full  ",
                                        priority === 'high' ? "bg-red-500" :
                                            priority === 'medium' ? "bg-amber-500" :
                                                "bg-blue-500"
                                    )} />
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={(!text.trim() && images.length === 0) || status !== 'idle'}
                                    className={clsx(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center  ",
                                        (text.trim() || images.length > 0) && status === 'idle'
                                            ? "bg-neutral-800 hover:bg-neutral-700 text-white active:scale-95"
                                            : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                                    )}
                                >
                                    <ArrowUp size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Spacer - only mobile */}
                    <div className="flex-none h-6 pb-safe-bottom md:hidden" />
                </div>
            </div>
        </>
    );
}