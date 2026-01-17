import { Task } from '@/types';
import { motion, PanInfo, useAnimation, useMotionValue } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';
import { Check, Trash2, Clock } from 'lucide-react';
import { vibrate } from '@/utils/haptics';

interface TaskCardProps {
    task: Task;
    onRemove: () => void;
}

export const TaskCard = ({ task, onRemove }: TaskCardProps) => {
    const [action, setAction] = useState<'idle' | 'completing' | 'deleting'>('idle');
    const controls = useAnimation();
    const x = useMotionValue(0);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const threshold = 150;

        if (info.offset.x > threshold) {
            vibrate('success');
            // 1. Snap back to center
            await controls.start({ x: 0, transition: { type: "spring", stiffness: 600, damping: 35 } });
            // 2. Trigger completion
            setAction('completing');
            await controls.start('completing');
            onRemove();
        } else if (info.offset.x < -threshold) {
            vibrate('medium');
            // 1. Snap back to center
            await controls.start({ x: 0, transition: { type: "spring", stiffness: 600, damping: 35 } });
            // 2. Trigger deletion
            setAction('deleting');
            await controls.start('deleting');
            onRemove();
        } else {
            // Normal snap back for small drags
            controls.start({ x: 0, transition: { type: "spring", stiffness: 600, damping: 35 } });
        }
    };

    const priorityColors = {
        high: 'bg-red-500',
        medium: 'bg-amber-500',
        low: 'bg-blue-500'
    };

    const cardVariants = {
        idle: {
            scale: 1,
            rotate: 0,
            filter: 'blur(0px) brightness(1)',
            opacity: 1
        },
        completing: {
            scale: [1, 1.1, 0],
            opacity: [1, 1, 0],
            filter: ['brightness(1) blur(0px)', 'brightness(2) blur(2px)', 'brightness(4) blur(12px)'],
            transition: {
                duration: 0.45,
                times: [0, 0.4, 1],
                ease: "circOut" as const
            }
        },
        deleting: {
            rotate: [0, -8, 8, -8, 0],
            scale: [1, 1.1, 1.2],
            opacity: [1, 0.8, 0],
            filter: ['blur(0px)', 'blur(4px)', 'blur(20px) brightness(0.5) saturate(0)'],
            transition: {
                rotate: { duration: 0.2, repeat: 1 },
                scale: { duration: 0.4, ease: "circIn" as const, delay: 0.1 },
                filter: { duration: 0.4, delay: 0.1 },
                opacity: { duration: 0.3, delay: 0.2 }
            }
        }
    };

    return (
        <motion.div
            layout
            className="relative w-full h-[72px]"
        >
            {/* Background Actions (Indicators) */}
            <div className="absolute inset-0 rounded-2xl flex overflow-hidden z-0">
                <div className="w-1/2 bg-green-500/10 flex items-center justify-start pl-6">
                    <Check className="text-green-500/30 w-6 h-6" />
                </div>
                <div className="w-1/2 bg-red-500/10 flex items-center justify-end pr-6">
                    <Trash2 className="text-red-500/30 w-6 h-6" />
                </div>
            </div>

            {/* The Main Interactive Card */}
            <motion.div
                drag={action === 'idle' ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={handleDragEnd}
                animate={controls}
                variants={cardVariants}
                style={{ x }}
                whileTap={action === 'idle' ? { scale: 0.98 } : {}}
                className={clsx(
                    "absolute inset-0 bg-neutral-900 rounded-2xl flex items-center px-4 z-10",
                    "border border-white/5 shadow-2xl active:cursor-grabbing cursor-grab backdrop-blur-md",
                    action === 'completing' && "border-green-500/50 bg-green-500/10",
                    action === 'deleting' && "border-red-500/50 bg-red-500/10"
                )}
            >
                {/* Priority Dot */}
                <div className={clsx("w-3 h-3 rounded-full mr-4 flex-shrink-0", priorityColors[task.priority])} />

                {/* Content */}
                <div className="flex-1 min-w-0 mr-4">
                    <h3 className={clsx(
                        "text-white text-[15px] font-medium truncate leading-tight transition-all duration-300",
                        action === 'completing' && "text-green-400 translate-x-2",
                        action === 'deleting' && "text-red-400 opacity-50"
                    )}>
                        {task.title}
                    </h3>
                    {task.dueTime && (
                        <div className="flex items-center mt-1 space-x-1.5 text-neutral-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium tracking-tight">{task.dueTime}</span>
                        </div>
                    )}
                </div>

                {/* Tag */}
                {task.tags.length > 0 && (
                    <div className="bg-white/5 px-2.5 py-1 rounded-full border border-white/5 flex-shrink-0">
                        <span className="text-[11px] font-semibold text-neutral-400 tracking-wide uppercase">
                            {task.tags[0]}
                        </span>
                    </div>
                )}

                {/* Visual Feedback Overlays */}
                {action === 'completing' && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 2, opacity: 0.3 }}
                        className="absolute inset-0 bg-white rounded-full blur-3xl"
                    />
                )}
            </motion.div>

            {/* Global Glow Effects */}
            {action !== 'idle' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    className={clsx(
                        "absolute inset-0 blur-2xl rounded-full z-0",
                        action === 'completing' ? "bg-green-500/20" : "bg-red-500/20"
                    )}
                />
            )}
        </motion.div>
    );
};

