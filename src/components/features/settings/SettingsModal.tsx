'use client';

import { ChevronRight, Smartphone, Layout, Zap, Database, Keyboard, Trash2 } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useSettings } from '@/context/SettingsContext';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAGGER_CHILDREN, OVERSHOOT_VARIANT } from '@/utils/animations';
import { Switch } from '@/components/ui/Switch';
import { ModalShell } from '@/components/ui/ModalShell';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showBottomNav: boolean;
    onToggleBottomNav: (show: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, showBottomNav, onToggleBottomNav }: SettingsModalProps) {
    const { autoFocusQuickAdd, setAutoFocusQuickAdd, confirmDelete, setConfirmDelete } = useSettings();

    useEffect(() => {
        if (isOpen) {
            vibrate('light');
        }
    }, [isOpen]);

    useBackToClose(isOpen, onClose);
    useLockBodyScroll(isOpen);

    return (
        <ModalShell isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="flex-none flex flex-col items-center justify-center px-6 pt-3 pb-4 border-b border-white/5 z-10 relative">
                <div className="w-12 h-1.5 bg-neutral-700/50 rounded-full mb-4" />
                <h2 className="text-xl font-bold tracking-tight w-full text-center">Settings</h2>
            </div>

            {/* Scrollable Content */}
            <motion.div 
                variants={STAGGER_CHILDREN}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto overscroll-contain touch-pan-y [web-kit-overflow-scrolling:touch] p-6 space-y-8 scrollbar-hide"
            >
                {/* Section: Navigation */}
                <motion.section variants={OVERSHOOT_VARIANT}>
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
                            <Switch isOn={showBottomNav} onToggle={onToggleBottomNav} />
                        </div>
                    </div>
                </motion.section>

                {/* Section: Behavior */}
                <motion.section variants={OVERSHOOT_VARIANT}>
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
                            <Switch isOn={autoFocusQuickAdd} onToggle={setAutoFocusQuickAdd} />
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
                            <Switch isOn={confirmDelete} onToggle={setConfirmDelete} />
                        </div>
                    </div>
                </motion.section>

                {/* Placeholder Sections */}
                <motion.section variants={OVERSHOOT_VARIANT}>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                        Preferences
                    </h3>
                    <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
                        <SettingsRow icon={Zap} color="text-amber-500" label="Haptics & Motion" />
                        <SettingsRow icon={Smartphone} color="text-purple-500" label="Display" />
                    </div>
                </motion.section>

                <motion.section variants={OVERSHOOT_VARIANT}>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                        Data
                    </h3>
                    <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5">
                        <SettingsRow icon={Database} color="text-emerald-500" label="Backup & Sync" />
                    </div>
                </motion.section>

                <motion.div variants={OVERSHOOT_VARIANT} className="pt-8 pb-12 text-center">
                    <p className="text-xs text-neutral-600 font-medium">Life OS v0.1.0 (Alpha)</p>
                </motion.div>
            </motion.div>
        </ModalShell>
    );
}

function SettingsRow({ icon: Icon, color, label }: { icon: any, color: string, label: string }) {
    return (
        <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left">
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