import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock framer-motion to avoid animation-related test issues
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
        motion: {
            div: 'div',
            button: 'button',
            main: 'main',
            span: 'span',
            p: 'p',
            h1: 'h1',
            h2: 'h2',
            h3: 'h3',
        },
        useAnimation: () => ({
            start: vi.fn().mockResolvedValue(undefined),
        }),
        useMotionValue: (initial: number) => ({
            get: () => initial,
            set: vi.fn(),
        }),
        useTransform: () => 0,
    };
});

// Mock haptics
vi.mock('@/utils/haptics', () => ({
    vibrate: vi.fn(),
}));

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
    __esModule: true,
    default: (fn: () => Promise<any>) => {
        const Component = vi.fn(() => null);
        Component.displayName = 'DynamicComponent';
        return Component;
    },
}));

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
