export type TabId = 'tasks' | 'notes' | 'overview' | 'chat' | 'weekly';

export interface TabConfig {
    id: TabId;
    label: string;
}

export const TABS: TabId[] = ['tasks', 'notes', 'overview', 'chat', 'weekly'];
