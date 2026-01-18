'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { vibrate } from '@/utils/haptics';
import { useSlimySpring } from '@/hooks/use-slimy-spring';

// Mock Messages
type Message = {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        text: 'Review the latest designs for the weekly view.',
        isUser: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
        id: '2',
        text: 'I have updated the layout logic. The swimlanes now respect the sprint backlog appropriately.',
        isUser: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
];

export function ChatTab({ onOpenSettings }: { onOpenSettings: () => void }) {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const springConfig = useSlimySpring();

    // Auto-scroll to bottom
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        vibrate('light');

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Simulate AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Input received. Processing next steps...',
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
            vibrate('medium');
        }, 800);
    };

    return (
        <div className="relative w-full h-full bg-background flex flex-col">
            <header className="w-full sticky top-0 z-30 flex justify-center items-center py-4 px-6 liquid-glass mb-4 flex-none">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenSettings}
                    className="group flex flex-col items-center gap-1 focus:outline-none"
                >
                    <h1 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-neutral-200 transition-colors">
                        Chat
                    </h1>
                </motion.button>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-4 pb-32 pt-2 touch-pan-y">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={springConfig}
                        className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`max-w-[85%] px-5 py-3 text-[17px] leading-snug rounded-[20px] ${msg.isUser
                                    ? 'bg-[#0A84FF] text-white rounded-br-sm shadow-lg shadow-blue-500/20'
                                    : 'bg-[#262626] text-neutral-100 rounded-bl-sm'
                                }`}
                        >
                            {msg.text}
                        </div>
                        <span className="text-[11px] text-neutral-600 mt-1 px-1 font-medium italic">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </motion.div>
                ))}
                <div ref={endOfMessagesRef} />
            </div>

            {/* Floating Input Layer */}
            <div className="fixed bottom-0 left-0 w-full px-4 pb-[max(env(safe-area-inset-bottom),16px)] z-50">
                <div className="w-full max-w-screen-xl mx-auto liquid-glass rounded-[26px] p-2 pr-2 flex items-end gap-2 shadow-2xl">
                    {/* Add Button */}
                    <button
                        onClick={() => vibrate('light')}
                        className="flex-none w-9 h-9 mb-0.5 rounded-full bg-neutral-700/50 text-neutral-400 flex items-center justify-center hover:text-white hover:bg-neutral-600 transition-colors"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                    </button>

                    {/* Input Field */}
                    <div className="flex-1 py-2 px-1">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Message..."
                            rows={1}
                            className="w-full bg-transparent border-none outline-none text-white placeholder-neutral-500 text-[17px] resize-none max-h-32"
                            style={{ minHeight: '24px' }}
                        />
                    </div>

                    {/* Action Button (Mic / Send) */}
                    <div className="flex-none mb-0.5">
                        <AnimatePresence mode="wait">
                            {inputValue.trim() ? (
                                <motion.button
                                    key="send"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    onClick={handleSend}
                                    className="w-9 h-9 rounded-full bg-[#0A84FF] text-white flex items-center justify-center transition-transform active:scale-90 shadow-lg shadow-blue-500/20"
                                >
                                    <Send size={18} fill="currentColor" className="-ml-0.5" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    key="mic"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    onClick={() => vibrate('light')}
                                    className="w-9 h-9 rounded-full text-neutral-400 hover:text-white flex items-center justify-center"
                                >
                                    <Mic size={22} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
