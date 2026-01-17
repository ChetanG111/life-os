'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useData } from './DataContext';

interface SettingsContextType {
    autoFocusQuickAdd: boolean;
    setAutoFocusQuickAdd: (value: boolean) => void;
    confirmDelete: boolean;
    setConfirmDelete: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const { settings, updateSettings } = useData();
    const autoFocusQuickAdd = settings.autoFocusQuickAdd;

    const setAutoFocusQuickAdd = (value: boolean) => {
        updateSettings({ autoFocusQuickAdd: value });
    };

    const setConfirmDelete = (value: boolean) => {
        updateSettings({ confirmDelete: value });
    };

    return (
        <SettingsContext.Provider value={{
            autoFocusQuickAdd,
            setAutoFocusQuickAdd,
            confirmDelete: settings.confirmDelete,
            setConfirmDelete
        }}>
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
