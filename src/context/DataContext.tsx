'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Task, Note } from '@/types';
import { mockTasks, mockNotes } from '@/data/mock';

interface AppSettings {
    autoFocusQuickAdd: boolean;
    motionIntensity: number;
    showBottomNav: boolean;
    confirmDelete: boolean;
}

// State tracking for morning/evening check-ins
export interface StateEntry {
    emoji: string;
    timestamp: string; // ISO string
    timeOfDay: 'morning' | 'evening';
}

interface DataContextType {
    tasks: Task[];
    notes: Note[];
    settings: AppSettings;
    stateHistory: StateEntry[];
    currentState: StateEntry | null;
    addTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
    completeTask: (id: string) => void;
    removeTask: (id: string) => void;
    addNote: (note: Omit<Note, 'id' | 'date'>) => void;
    removeNote: (id: string) => void;
    updateSettings: (updates: Partial<AppSettings>) => void;
    saveState: (emoji: string, timeOfDay: 'morning' | 'evening') => void;
}

const DEFAULT_SETTINGS: AppSettings = {
    autoFocusQuickAdd: false,
    motionIntensity: 50,
    showBottomNav: false,
    confirmDelete: true,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [stateHistory, setStateHistory] = useState<StateEntry[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // ⚠️ TESTING MODE: Set to true to enable localStorage persistence
    const PERSIST_DATA = false;

    // Initial Load
    useEffect(() => {
        const loadData = () => {
            try {
                if (PERSIST_DATA) {
                    const savedTasks = localStorage.getItem('life-os-tasks');
                    const savedNotes = localStorage.getItem('life-os-notes');
                    const savedSettings = localStorage.getItem('life-os-settings');

                    if (savedTasks) {
                        const parsed = JSON.parse(savedTasks);
                        if (Array.isArray(parsed)) setTasks(parsed);
                    } else {
                        setTasks(mockTasks);
                    }

                    if (savedNotes) {
                        const parsed = JSON.parse(savedNotes);
                        if (Array.isArray(parsed)) setNotes(parsed);
                    } else {
                        setNotes(mockNotes);
                    }

                    if (savedSettings) {
                        setSettings(JSON.parse(savedSettings));
                    }

                    const savedStateHistory = localStorage.getItem('life-os-state-history');
                    if (savedStateHistory) {
                        const parsed = JSON.parse(savedStateHistory);
                        if (Array.isArray(parsed)) setStateHistory(parsed);
                    }
                } else {
                    // Testing mode: always use mock data
                    setTasks(mockTasks);
                    setNotes(mockNotes);
                }
            } catch (error) {
                console.error('Failed to load data from localStorage:', error);
                setTasks(mockTasks);
                setNotes(mockNotes);
            } finally {
                setIsLoaded(true);
            }
        };

        loadData();
    }, []);

    // Persistence with check (disabled in testing mode)
    useEffect(() => {
        if (isLoaded && PERSIST_DATA) {
            localStorage.setItem('life-os-tasks', JSON.stringify(tasks));
        }
    }, [tasks, isLoaded]);

    useEffect(() => {
        if (isLoaded && PERSIST_DATA) {
            localStorage.setItem('life-os-notes', JSON.stringify(notes));
        }
    }, [notes, isLoaded]);

    useEffect(() => {
        if (isLoaded && PERSIST_DATA) {
            localStorage.setItem('life-os-settings', JSON.stringify(settings));
        }
    }, [settings, isLoaded]);

    useEffect(() => {
        if (isLoaded && PERSIST_DATA) {
            localStorage.setItem('life-os-state-history', JSON.stringify(stateHistory));
        }
    }, [stateHistory, isLoaded]);

    // Get the most recent state entry
    const currentState = stateHistory.length > 0 ? stateHistory[stateHistory.length - 1] : null;

    const addTask = (taskData: Omit<Task, 'id' | 'isCompleted'>) => {
        const newTask: Task = {
            ...taskData,
            id: Date.now().toString(),
            isCompleted: false,
        };
        setTasks(prev => [newTask, ...prev]);
    };

    const completeTask = (id: string) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, isCompleted: true } : t
        ));
    };

    const removeTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const addNote = (noteData: Omit<Note, 'id' | 'date'>) => {
        const newNote: Note = {
            ...noteData,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
        };
        setNotes(prev => [newNote, ...prev]);
    };

    const removeNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    const updateSettings = (updates: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const saveState = (emoji: string, timeOfDay: 'morning' | 'evening') => {
        const entry: StateEntry = {
            emoji,
            timestamp: new Date().toISOString(),
            timeOfDay
        };
        setStateHistory(prev => [...prev, entry]);
    };

    // Avoid hydration mismatch/flicker by only rendering children when loaded
    return (
        <DataContext.Provider value={{
            tasks,
            notes,
            settings,
            stateHistory,
            currentState,
            addTask,
            completeTask,
            removeTask,
            addNote,
            removeNote,
            updateSettings,
            saveState
        }}>
            {isLoaded ? children : <div className="fixed inset-0 bg-black" />}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
