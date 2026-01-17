'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export function ChatTab() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

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
        }, 600);
    };

    return (
        <div className="relative w-full h-full bg-background flex flex-col">
            {/* Header */}
            <header className="flex-none h-14 flex items-center px-4 border-b border-white/5 bg-background z-10">
                <h1 className="text-xl font-bold text-white tracking-tight">Chat</h1>
            </header>

            {/* Messages Area */}
            {/* pb-24 ensures content isn't hidden behind the fixed input */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 pb-32 touch-pan-y">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed rounded-3xl ${msg.isUser
                                ? 'bg-neutral-800 text-white'
                                : 'bg-transparent border border-neutral-800 text-neutral-200'
                                }`}
                        >
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
                <div ref={endOfMessagesRef} />
            </div>

            {/* Floating Input Layer */}
            {/* fixed positioning ensures it stays on top and anchors to viewport bottom */}
            {/* Floating Input Layer */}
            <div className="fixed bottom-0 left-0 w-full px-4 pb-[max(env(safe-area-inset-bottom),16px)] z-50">
                <div className="w-full max-w-screen-xl mx-auto bg-neutral-900/90 backdrop-blur-md border border-white/10 rounded-[32px] p-1.5 flex items-center gap-2 shadow-2xl">
                    {/* Add Button */}
                    <button className="flex-none w-10 h-10 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center hover:text-white hover:bg-neutral-700 transition-colors">
                        <Plus size={22} />
                    </button>

                    {/* Input Field */}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500 text-[16px] px-1"
                    />

                    {/* Action Button (Mic / Send) */}
                    <AnimatePresence mode="wait">
                        {inputValue.trim() ? (
                            <motion.button
                                key="send"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                onClick={handleSend}
                                className="flex-none w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-transform active:scale-95"
                            >
                                <Send size={18} fill="currentColor" />
                            </motion.button>
                        ) : (
                            <motion.button
                                key="mic"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="flex-none w-10 h-10 rounded-full text-neutral-400 hover:text-white flex items-center justify-center"
                            >
                                <Mic size={22} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
