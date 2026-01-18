'use client';

import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ChevronRight, Smartphone, Layout, Zap, Database, Activity, Keyboard, Trash2 } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useBackToClose } from '@/hooks/use-back-to-close';
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll';
import { useMotion } from '@/context/MotionContext';
import { useSettings } from '@/context/SettingsContext';
import { useSlimySpring } from '@/hooks/use-slimy-spring';
import { createStaggerItemVariants, UNIVERSAL_MODAL_VARIANTS, UNIVERSAL_STAGGER_CONTAINER } from '@/utils/animations';
import { useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showBottomNav: boolean;
    onToggleBottomNav: (show: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, showBottomNav, onToggleBottomNav }: SettingsModalProps) {
    const dragControls = useDragControls();
    const { intensity, setIntensity } = useMotion();
    const { autoFocusQuickAdd, setAutoFocusQuickAdd, confirmDelete, setConfirmDelete } = useSettings();
    const springConfig = useSlimySpring();
    const slimyItem = createStaggerItemVariants(springConfig);

    // Multi-stage Haptics (Suggestion 5)
    useEffect(() => {
        if (isOpen) {
            vibrate('light');
            const timer = setTimeout(() => vibrate('soft'), 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle back button behavior
    useBackToClose(isOpen, onClose);
    // Lock body scroll to prevent pull-to-refresh
    useLockBodyScroll(isOpen);

    const staggerContainer = UNIVERSAL_STAGGER_CONTAINER('modal');
    const modalVariants = UNIVERSAL_MODAL_VARIANTS(springConfig);

    // Use the functional variants for non-linear stagger from animations.ts
    // This allows custom={i} to work correctly
    // const slimyItem = createStaggerItemVariants(springConfig); -> moved to top

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
                        variants={modalVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
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
                        className="fixed inset-x-0 bottom-0 top-12 bg-background rounded-t-[32px] overflow-hidden z-50 flex flex-col border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]"
                    >
                        {/* Header & Drag Area */}
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex-none flex flex-col items-center justify-center px-6 pt-3 pb-4 bg-background border-b border-white/5 cursor-grab active:cursor-grabbing touch-none z-10"
                        >
                            {/* Drag Handle Pill */}
                            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4" />

                            <h2 className="text-xl font-bold tracking-tight w-full text-center">Settings</h2>
                        </div>

                        {/* Scrollable Content */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="flex-1 overflow-y-auto overscroll-contain touch-pan-y [web-kit-overflow-scrolling:touch] p-6 space-y-8 scrollbar-hide"
                        >
                            {/* Section: Animation Control */}
                            <motion.section custom={1} variants={slimyItem}>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                                    Experience
                                </h3>
                                <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5 p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Motion Intensity</p>
                                            <p className="text-xs text-neutral-500">Adjust the bounce & overshoot</p>
                                        </div>
                                    </div>

                                    <div className="px-1">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={intensity}
                                            onChange={(e) => setIntensity(Number(e.target.value))}
                                            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                            <span>Minimal</span>
                                            <span>Bouncy</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Section: Navigation */}
                            <motion.section custom={2} variants={slimyItem}>
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
                                            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${showBottomNav ? 'bg-white' : 'bg-neutral-800'
                                                }`}
                                        >
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    x: showBottomNav ? 22 : 2
                                                }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className="absolute top-1 left-0 w-5 h-5 bg-black rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Section: Behavior */}
                            <motion.section custom={3} variants={slimyItem}>
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
                                            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${autoFocusQuickAdd ? 'bg-white' : 'bg-neutral-800'
                                                }`}
                                        >
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    x: autoFocusQuickAdd ? 22 : 2
                                                }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className="absolute top-1 left-0 w-5 h-5 bg-black rounded-full shadow-sm"
                                            />
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
                                            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${confirmDelete ? 'bg-white' : 'bg-neutral-800'
                                                }`}
                                        >
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    x: confirmDelete ? 22 : 2
                                                }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className="absolute top-1 left-0 w-5 h-5 bg-black rounded-full shadow-sm"
                                            />
                                        </button>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Placeholder Sections */}
                            <motion.section custom={4} variants={slimyItem}>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                                    Preferences
                                </h3>
                                <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
                                    <SettingsRow icon={Zap} color="text-amber-500" label="Haptics & Motion" />
                                    <SettingsRow icon={Smartphone} color="text-purple-500" label="Display" />
                                </div>
                            </motion.section>

                            <motion.section custom={5} variants={slimyItem}>
                                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 px-1">
                                    Data
                                </h3>
                                <div className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5">
                                    <SettingsRow icon={Database} color="text-emerald-500" label="Backup & Sync" />
                                </div>
                            </motion.section>

                            <motion.div custom={6} variants={slimyItem} className="pt-8 pb-12 text-center">
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
