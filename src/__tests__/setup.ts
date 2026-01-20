import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
