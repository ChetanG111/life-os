'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useData } from './DataContext';

interface MotionContextType {
    intensity: number; // 0 to 100
    setIntensity: (value: number) => void;
    getSpring: () => { type: "spring"; stiffness: number; damping: number };
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
    const { settings, updateSettings } = useData();
    const intensity = settings.motionIntensity;

    const setIntensity = (value: number) => {
        updateSettings({ motionIntensity: value });
    };

    const getSpring = () => {
        // Map 0-100 to stiffness/damping
        // Low intensity (0): Snappy, rigid, no bounce (Overdamped)
        // High intensity (100): Slow, heavy, viscous 'slimy' feel with controlled bounce

        const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;
        const t = intensity / 100;

        return {
            type: "spring" as const,
            // Minimal (0) -> Rigid (800) | Slimy (100) -> Viscous/Slow (90)
            stiffness: lerp(800, 90, t),
            // Minimal (0) -> Stable (80) | Slimy (100) -> Deliberate/Controlled (22)
            damping: lerp(80, 22, t),
            // Minimal (0) -> Light (1) | Slimy (100) -> Heavy/Sluggish (3)
            mass: lerp(1, 3, t),
            // Higher rest values to stop the simulation decisively and prevent micro-jitter
            restDelta: 0.001,
            restSpeed: 0.001
        };
    };

    return (
        <MotionContext.Provider value={{ intensity, setIntensity, getSpring }}>
            {children}
        </MotionContext.Provider>
    );
}

export function useMotion() {
    const context = useContext(MotionContext);
    if (context === undefined) {
        throw new Error('useMotion must be used within a MotionProvider');
    }
    return context;
}
