'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { vibrate } from '@/utils/haptics';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';

// Hardcoded emoji options per spec (state_popup.input.type: emoji_only, hardcoded: true)
const STATE_OPTIONS = [
    { emoji: '🔥', label: 'Fired Up' },
    { emoji: '😊', label: 'Good' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😔', label: 'Low' },
    { emoji: '😴', label: 'Tired' },
];

interface StatePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (emoji: string) => void;
    currentEmoji?: string;
    timeOfDay: 'morning' | 'evening';
}

export function StatePopup({ isOpen, onClose, onSelect, currentEmoji, timeOfDay }: StatePopupProps) {
    useBackToClose(isOpen, onClose);
    useLockBodyScroll(isOpen);

    const handleSelect = (emoji: string) => {
        vibrate('success');
        onSelect(emoji);
        onClose();
    };

    const greeting = timeOfDay === 'morning'
        ? "How are you feeling this morning?"
        : "How was your day?";

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
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
                    />

                    {/* Popup Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-[var(--surface)] rounded-3xl p-6 z-50 border border-white/10 max-w-sm mx-auto"
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="text-4xl mb-3">
                                {timeOfDay === 'morning' ? '🌅' : '🌙'}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">
                                {timeOfDay === 'morning' ? 'Good Morning' : 'Good Evening'}
                            </h2>
                            <p className="text-sm text-neutral-400">
                                {greeting}
                            </p>
                        </div>

                        {/* Emoji Options */}
                        <div className="grid grid-cols-5 gap-2 mb-6">
                            {STATE_OPTIONS.map(({ emoji, label }) => (
                                <motion.button
                                    key={emoji}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => handleSelect(emoji)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${currentEmoji === emoji
                                            ? 'bg-white/20 ring-2 ring-white/30'
                                            : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-3xl">{emoji}</span>
                                    <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Skip Button */}
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-sm text-neutral-500 font-medium uppercase tracking-wider hover:text-neutral-300 transition-colors"
                        >
                            Skip for now
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
