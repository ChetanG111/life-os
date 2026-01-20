'use client';

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

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 glass-material z-50 overflow-hidden"
            >
                <div className="absolute inset-0 noise-overlay opacity-[0.015]" />
            </div>

            {/* Popup Content */}
            <div
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 liquid-glass rounded-3xl p-6 z-50 max-w-sm mx-auto shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
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
                    {STATE_OPTIONS.map(({ emoji, label }, i) => (
                        <button
                            key={emoji}
                            onClick={() => handleSelect(emoji)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl  active:scale-95 ${currentEmoji === emoji
                                ? 'bg-white/20 ring-2 ring-white/30'
                                : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-3xl">{emoji}</span>
                            <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Skip Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 text-sm text-neutral-500 font-medium uppercase tracking-wider hover:text-neutral-300 "
                >
                    Skip for now
                </button>
            </div>
        </>
    );
}