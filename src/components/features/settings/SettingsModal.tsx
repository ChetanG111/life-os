'use client';

import { ChevronRight, Smartphone, Layout, Zap, Database, Keyboard, Trash2, X } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useSettings } from '@/context/SettingsContext';
import { useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { MODAL_CONTAINER_VARIANT, STAGGER_CHILDREN, OVERSHOOT_VARIANT } from '@/utils/animations';
import { Switch } from '@/components/ui/Switch';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showBottomNav: boolean;
    onToggleBottomNav: (show: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, showBottomNav, onToggleBottomNav }: SettingsModalProps) {
    const { autoFocusQuickAdd, setAutoFocusQuickAdd, confirmDelete, setConfirmDelete } = useSettings();
    const dragControls = useDragControls();

    useEffect(() => {
        if (isOpen) {
            vibrate('light');
        }
    }, [isOpen]);

    useBackToClose(isOpen, onClose);
    useLockBodyScroll(isOpen);

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
                        className="fixed inset-0 glass-material z-50 overflow-hidden"
                    >
                        <div className="absolute inset-0 noise-overlay opacity-[0.015]" />
                    </motion.div>

                    {/* Modal Content */}
                    <motion.div
                        variants={MODAL_CONTAINER_VARIANT}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        drag="y"
                        dragControls={dragControls}
                        dragListener={false}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.05, bottom: 0.7 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className="fixed inset-x-0 bottom-0 top-12 bg-background rounded-t-[32px] overflow-hidden z-50 flex flex-col border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
                    >
                        {/* Header */}
                        <div 
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex-none flex flex-col items-center justify-center px-6 pt-3 pb-4 bg-background border-b border-white/5 z-10 relative cursor-grab active:cursor-grabbing touch-none"
                        >
                            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4" />
                            <h2 className="text-xl font-bold tracking-tight w-full text-center">Settings</h2>
                            <button onClick={onClose} className="absolute right-6 top-6 text-neutral-500">
                                <X size={24} />
                            </button>
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
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
