import { Task } from '@/types';
import { motion, PanInfo, useAnimation, useMotionValue } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';
import { Check, Trash2, Clock } from 'lucide-react';
import { vibrate } from '@/utils/haptics';
import { useSettings } from '@/context/SettingsContext';
import { ConfirmDeleteModal } from '../cards/ConfirmDeleteModal';

interface TaskCardProps {
    task: Task;
    onRemove: () => void;
    onTap?: () => void;
}

export const TaskCard = ({ task, onRemove, onTap }: TaskCardProps) => {
    const [action, setAction] = useState<'idle' | 'completing' | 'deleting'>('idle');
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const { confirmDelete } = useSettings();
    const controls = useAnimation();
    const x = useMotionValue(0);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const threshold = 150;
        const fastSpring = { type: "spring", stiffness: 350, damping: 25 } as const;

        if (info.offset.x > threshold) {
            vibrate('success');
            controls.start({ x: 0, transition: fastSpring });
            setAction('completing');
            controls.start('completing').then(() => onRemove());
        } else if (info.offset.x < -threshold) {
            vibrate('medium');
            controls.start({ x: 0, transition: fastSpring });

            if (confirmDelete) {
                setIsConfirmingDelete(true);
            } else {
                setAction('deleting');
                controls.start('deleting').then(() => onRemove());
            }
        } else {
            controls.start({ x: 0, transition: fastSpring });
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
                <div className="absolute inset-0 rounded-2xl flex overflow-hidden z-0">
                    <div className="w-1/2 bg-[#10B981]/5 flex items-center justify-start pl-6">
                        <Check className="text-[#10B981]/20 w-6 h-6" />
                    </div>
                    <div className="w-1/2 bg-[#EF4444]/5 flex items-center justify-end pr-6">
                        <Trash2 className="text-[#EF4444]/20 w-6 h-6" />
                    </div>
                </div>
            )}

            {/* The Main Interactive Card */}
            <motion.div
                drag={action === 'idle' ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragStart={() => vibrate('light')}
                onDragEnd={handleDragEnd}
                onTap={() => {
                    // Only trigger tap if we haven't dragged significantly
                    if (action === 'idle' && Math.abs(x.get()) < 5 && onTap) {
                        vibrate('light');
                        onTap();
                    }
                }}
                animate={controls}
                variants={cardVariants}
                style={{ x }}
                whileTap={action === 'idle' ? { scale: 0.98 } : {}}
                className={clsx(
                    "absolute inset-0 bg-[var(--surface)] rounded-2xl flex items-center px-4 z-10",
                    "border border-white/5 shadow-md shadow-black/20 active:cursor-grabbing cursor-grab",
                    action === 'completing' && "border-green-500/30",
                    action === 'deleting' && "border-red-500/30"
                )}
            >
                {/* Priority Dot */}
                <div className={clsx("w-2.5 h-2.5 rounded-full mr-4 flex-shrink-0 ring-2 ring-white/5", priorityColors[task.priority])} />

                {/* Content */}
                <div className="flex-1 min-w-0 mr-4">
                    <h3 className={clsx(
                        "text-white text-[15px] font-semibold truncate leading-tight transition-colors duration-300 tracking-wide",
                        action === 'completing' && "text-green-400",
                        action === 'deleting' && "text-red-400"
                    )}>
                        {task.title}
                    </h3>
                    {task.dueTime && (
                        <div className="flex items-center mt-1 space-x-1.5 text-neutral-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm font-normal">{task.dueTime}</span>
                        </div>
                    )}
                </div>

                {/* Tag */}
                {task.tags.length > 0 && (
                    <div className="bg-white/5 px-2.5 py-1 rounded-full border border-white/5 flex-shrink-0">
                        <span className="text-xs font-medium text-neutral-400">
                            {task.tags[0]}
                        </span>
                    </div>
                )}
            </motion.div>

            <ConfirmDeleteModal
                isOpen={isConfirmingDelete}
                onClose={() => setIsConfirmingDelete(false)}
                onConfirm={() => {
                    setAction('deleting');
                    controls.start('deleting').then(() => onRemove());
                }}
                title="Delete Task?"
            />
        </motion.div>
    );
};
