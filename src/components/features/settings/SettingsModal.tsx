'use client';

import { ChevronRight, Smartphone, Layout, Zap, Database, Keyboard, Trash2, X } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useSettings } from '@/context/SettingsContext';
import { useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showBottomNav: boolean;
    onToggleBottomNav: (show: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, showBottomNav, onToggleBottomNav }: SettingsModalProps) {
    const { autoFocusQuickAdd, setAutoFocusQuickAdd, confirmDelete, setConfirmDelete } = useSettings();

    // Multi-stage Haptics (Suggestion 5)
    useEffect(() => {
        if (isOpen) {
            vibrate('light');
        }
    }, [isOpen]);

    // Handle back button behavior
    useBackToClose(isOpen, onClose);
    // Lock body scroll to prevent pull-to-refresh
    useLockBodyScroll(isOpen);

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

            {/* Modal Content */}
            <div className="fixed inset-x-0 bottom-0 top-12 bg-background rounded-t-[32px] overflow-hidden z-50 flex flex-col border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
                {/* Header */}
                <div className="flex-none flex flex-col items-center justify-center px-6 pt-3 pb-4 bg-background border-b border-white/5 z-10 relative">
                    <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4" />
                    <h2 className="text-xl font-bold tracking-tight w-full text-center">Settings</h2>
                    <button onClick={onClose} className="absolute right-6 top-6 text-neutral-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y [web-kit-overflow-scrolling:touch] p-6 space-y-8 scrollbar-hide">
                    
                    {/* Section: Navigation */}
                    <section>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                            Navigation
                        </h3>
                        <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Layout size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Bottom Navigation</p>
                                        <p className="text-xs text-neutral-500">Show pill navigation bar</p>
                                    </div>
                                </div>

                                {/* Toggle Switch */}
                                <button
                                    onClick={() => {
                                        vibrate('medium');
                                        onToggleBottomNav(!showBottomNav);
                                    }}
                                    className={`relative w-12 h-7 rounded-full   ${showBottomNav ? 'bg-white' : 'bg-neutral-800'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-0 w-5 h-5 bg-black rounded-full shadow-sm   ${showBottomNav ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Section: Behavior */}
                    <section>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                            Behavior
                        </h3>
                        <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                                        <Keyboard size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Auto-focus Keyboard</p>
                                        <p className="text-xs text-neutral-500">Open keyboard on Quick Add</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        vibrate('medium');
                                        setAutoFocusQuickAdd(!autoFocusQuickAdd);
                                    }}
                                    className={`relative w-12 h-7 rounded-full   ${autoFocusQuickAdd ? 'bg-white' : 'bg-neutral-800'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-0 w-5 h-5 bg-black rounded-full shadow-sm   ${autoFocusQuickAdd ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                        <Trash2 size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Confirm Deletion</p>
                                        <p className="text-xs text-neutral-500">Ask before removing items</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        vibrate('medium');
                                        setConfirmDelete(!confirmDelete);
                                    }}
                                    className={`relative w-12 h-7 rounded-full   ${confirmDelete ? 'bg-white' : 'bg-neutral-800'
                                        }`}
                                >
                                    <div className={`absolute top-1 left-0 w-5 h-5 bg-black rounded-full shadow-sm   ${confirmDelete ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Placeholder Sections */}
                    <section>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                            Preferences
                        </h3>
                        <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
                            <SettingsRow icon={Zap} color="text-amber-500" label="Haptics & Motion" />
                            <SettingsRow icon={Smartphone} color="text-purple-500" label="Display" />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                            Data
                        </h3>
                        <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5">
                            <SettingsRow icon={Database} color="text-emerald-500" label="Backup & Sync" />
                        </div>
                    </section>

                    <div className="pt-8 pb-12 text-center">
                        <p className="text-xs text-neutral-600 font-medium">Life OS v0.1.0 (Alpha)</p>
                    </div>
                </div>
            </div>
        </>
    );
}

function SettingsRow({ icon: Icon, color, label }: { icon: any, color: string, label: string }) {
    return (
        <button className="w-full flex items-center justify-between p-4 hover:bg-white/5  text-left">
            <div className="flex items-center gap-3">
                <div className={`p-2 bg-white/5 rounded-lg ${color}`}>
                    <Icon size={20} />
                </div>
                <span className="font-medium text-white">{label}</span>
            </div>
            <ChevronRight size={18} className="text-neutral-600" />
        </button>
    );
}