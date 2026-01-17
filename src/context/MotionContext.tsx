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
        // Low intensity (0): stiff=600, damp=60 (Minimal, fast, no bounce)
        // High intensity (100): stiff=220, damp=7 (Ultra-slimy, chaotic bounce, high oscillation)

        // Linear interpolation helper
        const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

        const t = intensity / 100;

        return {
            type: "spring" as const,
            // Minimal (0) -> Fast/Rigid (600) | Slimy (100) -> Fluid/Active (220)
            stiffness: lerp(600, 220, t),
            // Minimal (0) -> Stable (60) | Slimy (100) -> Chaotic (7)
            damping: lerp(60, 7, t),
            mass: lerp(1, 1.2, t) // Add slight mass for momentum at high levels
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
