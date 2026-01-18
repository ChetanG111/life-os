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

interface DataContextType {
    tasks: Task[];
    notes: Note[];
    settings: AppSettings;
    addTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
    completeTask: (id: string) => void;
    removeTask: (id: string) => void;
    addNote: (note: Omit<Note, 'id' | 'date'>) => void;
    removeNote: (id: string) => void;
    updateSettings: (updates: Partial<AppSettings>) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
    autoFocusQuickAdd: true,
    motionIntensity: 50,
    showBottomNav: true,
    confirmDelete: true,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load
    useEffect(() => {
        const loadData = () => {
            try {
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

    // Persistence with check
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('life-os-tasks', JSON.stringify(tasks));
        }
    }, [tasks, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('life-os-notes', JSON.stringify(notes));
        }
    }, [notes, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('life-os-settings', JSON.stringify(settings));
        }
    }, [settings, isLoaded]);

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

    // Avoid hydration mismatch/flicker by only rendering children when loaded
    return (
        <DataContext.Provider value={{
            tasks,
            notes,
            settings,
            addTask,
            completeTask,
            removeTask,
            addNote,
            removeNote,
            updateSettings
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
