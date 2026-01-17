'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MotionContextType {
    intensity: number; // 0 to 100
    setIntensity: (value: number) => void;
    getSpring: () => { type: "spring"; stiffness: number; damping: number };
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
    const [intensity, setIntensity] = useState(50); // Default to "middle ground" (50)

    const getSpring = () => {
        // Map 0-100 to stiffness/damping
        // Low intensity (0): stiff=500, damp=40 (Minimal, fast, no bounce)
        // High intensity (100): stiff=300, damp=10 (Very bouncy, loose)
        
        // Linear interpolation helper
        const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;
        
        const t = intensity / 100;
        
        return {
            type: "spring" as const,
            stiffness: lerp(220, 550, t),
            damping: lerp(40, 14, t)
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
