'use client';

import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { ChevronRight, Smartphone, Layout, Zap, Database } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useBackToClose } from '@/hooks/use-back-to-close';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showBottomNav: boolean;
    onToggleBottomNav: (show: boolean) => void;
}

export function SettingsModal({ isOpen, onClose, showBottomNav, onToggleBottomNav }: SettingsModalProps) {
    const dragControls = useDragControls();
    
    // Handle back button behavior
    useBackToClose(isOpen, onClose);

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 200
                        }}
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
                        className="fixed inset-x-0 bottom-0 top-12 bg-[var(--background)] rounded-t-[32px] overflow-hidden z-50 flex flex-col border-t border-white/10"
                    >
                        {/* Header & Drag Area */}
                        <div 
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex flex-col items-center justify-center px-6 pt-3 pb-4 bg-[var(--background)] cursor-grab active:cursor-grabbing touch-none border-b border-white/5"
                        >
                            {/* Drag Handle Pill */}
                            <div className="w-12 h-1.5 bg-neutral-700 rounded-full mb-4" />
                            
                            <h2 className="text-xl font-bold tracking-tight w-full text-center">Settings</h2>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
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
                                            className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                                                showBottomNav ? 'bg-white' : 'bg-neutral-800'
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
