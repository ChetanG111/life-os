
import { Task, Note } from '@/types';

export const mockTasks: Task[] = [
    {
        id: '1',
        title: 'Review quarterly goals',
        dueTime: '10:00 AM',
        priority: 'high',
        tags: ['strategy', 'business'],
        isCompleted: false,
    },
    {
        id: '2',
        title: 'Call supplier regarding delay',
        dueTime: '11:30 AM',
        priority: 'high',
        tags: ['urgent'],
        isCompleted: false,
    },
    {
        id: '3',
        title: 'Weekly team sync',
        dueTime: '2:00 PM',
        priority: 'medium',
        tags: ['team', 'meeting'],
        isCompleted: false,
    },
    {
        id: '4',
        title: 'Update website copy',
        dueTime: '4:00 PM',
        priority: 'medium',
        tags: ['marketing'],
        isCompleted: false,
    },
    {
        id: '5',
        title: 'Read simplified SEO guide',
        priority: 'low',
        tags: ['learning'],
        isCompleted: false,
    },
    {
        id: '6',
        title: 'Organize desktop files',
        priority: 'low',
        tags: ['housekeeping'],
        isCompleted: false,
    },
];

export const mockNotes: Note[] = [
    {
        id: '1',
        title: 'App Ideas',
        content: 'Swipe interaction for everything. Tinder for productivity. Needs to be extremely fast and fluid.',
        type: 'text',
        tags: ['ideas', 'product'],
        date: '2025-01-10',
    },
    {
        id: '2',
        content: 'Meeting notes from design sync. Focus on dark mode nuances and haptic feedback.',
        type: 'voice',
        tags: ['meeting', 'design'],
        date: '2025-01-12',
    },
    {
        id: '3',
        title: 'Inspiration',
        content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        type: 'image',
        tags: ['design', 'inspo'],
        date: '2025-01-13',
    },
    {
        id: '4',
        content: 'Buy milk, eggs, and coffee beans.',
        type: 'text',
        tags: ['personal'],
        date: '2025-01-14',
    },
    {
        id: '5',
        title: 'Q1 Marketing',
        content: 'Focus on content marketing and community building. Avoid paid ads for now.',
        type: 'text',
        tags: ['marketing'],
        date: '2025-01-14',
    },
];
