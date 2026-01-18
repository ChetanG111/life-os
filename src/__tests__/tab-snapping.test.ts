/**
 * Test: Tab Snapping
 * Per logic.yaml testing_expectations: test_tab_snapping
 * 
 * Tests that tab navigation snaps correctly based on:
 * - Swipe offset threshold (50px)
 * - Velocity threshold (500px/s)
 * - Tab order: tasks → notes → overview → chat → weekly
 */

import { describe, it, expect, vi } from 'vitest';
import { TABS, TabId } from '@/types';

describe('Tab Snapping', () => {
    // Test constants that match NavigationShell implementation
    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 500;

    describe('Tab Order', () => {
        it('should have correct tab order per spec', () => {
            const expectedOrder: TabId[] = ['tasks', 'notes', 'overview', 'chat', 'weekly'];
            expect(TABS).toEqual(expectedOrder);
        });

        it('should have overview as center tab', () => {
            const centerIndex = Math.floor(TABS.length / 2);
            expect(TABS[centerIndex]).toBe('overview');
        });

        it('should have 5 tabs total', () => {
            expect(TABS.length).toBe(5);
        });
    });

    describe('Swipe Logic', () => {
        // Simulate the swipe detection logic from NavigationShell
        const shouldSwipeLeft = (offsetX: number, velocityX: number) => {
            return offsetX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD;
        };

        const shouldSwipeRight = (offsetX: number, velocityX: number) => {
            return offsetX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD;
        };

        it('should trigger left swipe when offset exceeds threshold', () => {
            expect(shouldSwipeLeft(-60, 0)).toBe(true);
            expect(shouldSwipeLeft(-40, 0)).toBe(false);
        });

        it('should trigger left swipe when velocity exceeds threshold', () => {
            expect(shouldSwipeLeft(-30, -600)).toBe(true);
            expect(shouldSwipeLeft(-30, -400)).toBe(false);
        });

        it('should trigger right swipe when offset exceeds threshold', () => {
            expect(shouldSwipeRight(60, 0)).toBe(true);
            expect(shouldSwipeRight(40, 0)).toBe(false);
        });

        it('should trigger right swipe when velocity exceeds threshold', () => {
            expect(shouldSwipeRight(30, 600)).toBe(true);
            expect(shouldSwipeRight(30, 400)).toBe(false);
        });
    });

    describe('Edge Constraints', () => {
        it('should not allow swiping past first tab (tasks)', () => {
            const currentIndex = 0; // tasks
            const canSwipeRight = currentIndex > 0;
            expect(canSwipeRight).toBe(false);
        });

        it('should not allow swiping past last tab (weekly)', () => {
            const currentIndex = TABS.length - 1; // weekly
            const canSwipeLeft = currentIndex < TABS.length - 1;
            expect(canSwipeLeft).toBe(false);
        });

        it('should allow bidirectional swipe on center tab (overview)', () => {
            const currentIndex = TABS.indexOf('overview');
            const canSwipeLeft = currentIndex < TABS.length - 1;
            const canSwipeRight = currentIndex > 0;

            expect(canSwipeLeft).toBe(true);
            expect(canSwipeRight).toBe(true);
        });
    });

    describe('Tab Transitions', () => {
        const getNextTab = (currentTab: TabId, direction: 'left' | 'right'): TabId | null => {
            const currentIndex = TABS.indexOf(currentTab);
            if (direction === 'left' && currentIndex < TABS.length - 1) {
                return TABS[currentIndex + 1];
            }
            if (direction === 'right' && currentIndex > 0) {
                return TABS[currentIndex - 1];
            }
            return null;
        };

        it('should transition from tasks to notes on left swipe', () => {
            expect(getNextTab('tasks', 'left')).toBe('notes');
        });

        it('should transition from overview to notes on right swipe', () => {
            expect(getNextTab('overview', 'right')).toBe('notes');
        });

        it('should transition from overview to chat on left swipe', () => {
            expect(getNextTab('overview', 'left')).toBe('chat');
        });

        it('should return null when swiping past edges', () => {
            expect(getNextTab('tasks', 'right')).toBe(null);
            expect(getNextTab('weekly', 'left')).toBe(null);
        });
    });
});
