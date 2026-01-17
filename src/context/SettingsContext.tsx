'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
    autoFocusQuickAdd: boolean;
    setAutoFocusQuickAdd: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [autoFocusQuickAdd, setAutoFocusQuickAdd] = useState(true);

    return (
        <SettingsContext.Provider value={{ autoFocusQuickAdd, setAutoFocusQuickAdd }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
