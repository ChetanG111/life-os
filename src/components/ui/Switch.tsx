'use client';

import { motion } from 'framer-motion';
import { IOS_SPRING } from '@/utils/animations';
import { vibrate } from '@/utils/haptics';

interface SwitchProps {
    isOn: boolean;
    onToggle: (isOn: boolean) => void;
    className?: string;
}

export function Switch({ isOn, onToggle, className = "" }: SwitchProps) {
    const handleToggle = () => {
        vibrate('medium');
        onToggle(!isOn);
    };

    return (
        <button
            onClick={handleToggle}
            className={`relative h-7 rounded-full transition-colors duration-300 ${isOn ? 'bg-white' : 'bg-neutral-800'
                } ${className}`}
            style={{ width: 48 }}
        >
            <motion.div
                className="absolute top-1 left-1 bg-black rounded-full shadow-sm"
                style={{ width: 20, height: 20 }}
                animate={{
                    x: isOn ? 20 : 0,
                    // Rubber Band Effect: Stretch width during travel
                    width: [20, 28, 20],
                }}
                transition={{
                    x: IOS_SPRING, // Firm movement
                    width: { duration: 0.3, times: [0, 0.5, 1] } // Stretch sync
                }}
            />
        </button>
    );
}
