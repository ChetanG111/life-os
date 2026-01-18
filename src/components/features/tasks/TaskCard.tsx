import { Task } from '@/types';
import { motion, PanInfo, useAnimation, useMotionValue } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';
import { Check, Trash2, Clock } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useSlimySpring } from '@/hooks/use-slimy-spring';

interface TaskCardProps {
    task: Task;
    onComplete: () => void;
    onDelete: () => void;
    onTap?: () => void;
}

export const TaskCard = ({ task, onComplete, onDelete, onTap }: TaskCardProps) => {
    const [action, setAction] = useState<'idle' | 'completing' | 'deleting'>('idle');
    const springConfig = useSlimySpring();
    const controls = useAnimation();
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const threshold = 150;
        const yThreshold = 80; // Lower threshold for down-swipe
        const fastSpring = springConfig;

        // Down-swipe to delete (per logic.yaml card_swipe.down: delete)
        if (info.offset.y > yThreshold && Math.abs(info.offset.x) < threshold) {
            vibrate('warning');
            controls.start({ x: 0, y: 0, transition: fastSpring });
            onDelete();
        }
        // Right-swipe to complete
        else if (info.offset.x > threshold) {
            vibrate('success');
            controls.start({ x: 0, y: 0, transition: fastSpring });
            setAction('completing');
            controls.start('completing').then(() => onComplete());
        }
        // Left-swipe to dismiss/delete
        else if (info.offset.x < -threshold) {
            vibrate('medium');
            controls.start({ x: 0, y: 0, transition: fastSpring });
            onDelete();
        } else {
            controls.start({ x: 0, y: 0, transition: fastSpring });
        }
    };

    const priorityColors = {
        high: 'bg-[#EF4444]',
        medium: 'bg-[#F59E0B]',
        low: 'bg-[#3B82F6]'
    };

    const cardVariants = {
        idle: {
            scale: 1,
            opacity: 1
        },
        completing: {
            scale: [1, 1.05, 0],
            opacity: [1, 1, 0],
            transition: {
                duration: 0.35,
                times: [0, 0.4, 1],
                ease: "circOut" as const
            }
        },
        deleting: {
            scale: [1, 0.95, 0],
            opacity: [1, 1, 0],
            transition: {
                duration: 0.35,
                ease: "circIn" as const
            }
        }
    };

    return (
        <motion.div
            layout
            className="relative w-full h-[72px]"
        >
            {/* Background Actions (Indicators) */}
            {action === 'idle' && (
                <>
                    {/* Horizontal indicators */}
                    <div className="absolute inset-0 rounded-2xl flex overflow-hidden z-0">
                        <div className="w-1/2 bg-[#10B981]/5 flex items-center justify-start pl-6">
                            <Check className="text-[#10B981]/20 w-6 h-6" />
                        </div>
                        <div className="w-1/2 bg-[#EF4444]/5 flex items-center justify-end pr-6">
                            <Trash2 className="text-[#EF4444]/20 w-6 h-6" />
                        </div>
                    </div>
                    {/* Down-swipe indicator */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#EF4444]/10 to-transparent rounded-b-2xl flex items-end justify-center pb-1 z-0">
                        <Trash2 className="text-[#EF4444]/20 w-4 h-4" />
                    </div>
                </>
            )}

            {/* The Main Interactive Card */}
            <motion.div
                drag={action === 'idle'}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.4}
                onDragStart={() => vibrate('light')}
                onDragEnd={handleDragEnd}
                onTap={() => {
                    if (action === 'idle' && Math.abs(x.get()) < 5 && Math.abs(y.get()) < 5 && onTap) {
                        vibrate('light');
                        onTap();
                    }
                }}
                animate={controls}
                variants={cardVariants}
                style={{ x, y }}
                whileTap={action === 'idle' ? { scale: 0.98 } : {}}
                className={clsx(
                    "absolute inset-0 bg-neutral-900 md:bg-neutral-800/40 rounded-2xl flex items-center px-6 z-10",
                    "border border-white/5 md:border-white/10 shadow-md shadow-black/20 active:cursor-grabbing cursor-grab",
                    action === 'completing' && "border-green-500/30",
                    action === 'deleting' && "border-red-500/30"
                )}
            >
                {/* Desktop Checkbox (Image 1) */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        vibrate('success');
                        onComplete();
                    }}
                    className="hidden md:flex w-6 h-6 rounded-full border-2 border-neutral-600 hover:border-green-500 hover:bg-green-500/10 transition-all mr-6 items-center justify-center flex-shrink-0 cursor-pointer"
                >
                    <Check size={12} className="text-green-500 opacity-0 group-hover:opacity-100" />
                </div>

                {/* Mobile Priority Dot (Original) */}
                <div className={clsx("md:hidden w-2.5 h-2.5 rounded-full mr-4 flex-shrink-0 ring-2 ring-white/5", priorityColors[task.priority])} />

                {/* Content */}
                <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                        {/* Desktop Priority Dot (Image 1) */}
                        <div className={clsx("hidden md:block w-2.5 h-2.5 rounded-full flex-shrink-0", priorityColors[task.priority])} />
                        <h3 className={clsx(
                            "text-white text-[15px] md:text-lg font-bold md:font-semibold truncate leading-tight transition-colors duration-300 tracking-wide",
                            action === 'completing' && "text-green-400",
                            action === 'deleting' && "text-red-400"
                        )}>
                            {task.title}
                        </h3>
                    </div>
                    {(task.dueTime || task.dueDate) && (
                        <div className="flex items-center mt-1 space-x-1.5 text-neutral-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm font-medium md:font-normal opacity-70 uppercase tracking-tight">
                                {task.dueDate ? new Date(task.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : task.dueTime}
                            </span>
                        </div>
                    )}
                </div>

                {/* Tag / Category Badge (Image 1) */}
                {task.tags.length > 0 && (
                    <div className="bg-white/5 px-2.5 py-1 md:py-0.5 rounded-full md:rounded-lg border border-white/5 flex-shrink-0">
                        <span className="text-[10px] md:text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500 md:text-blue-300/60">
                            {task.tags[0]}
                        </span>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
