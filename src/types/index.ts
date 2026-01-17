export type TabId = 'tasks' | 'notes' | 'overview' | 'chat' | 'weekly';

export interface TabConfig {
    id: TabId;
    label: string;
}

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
    id: string;
    title: string;
    dueTime?: string;
    dueDate?: string;
    priority: Priority;
    tags: string[];
    isCompleted: boolean;
    description?: string;
}

export type NoteType = 'text' | 'voice' | 'image';

export interface Note {
    id: string;
    content: string;
    type: NoteType;
    tags: string[];
    date: string;
    title?: string;
    images?: string[];
}

export const TABS: TabId[] = ['tasks', 'notes', 'overview', 'chat', 'weekly'];
