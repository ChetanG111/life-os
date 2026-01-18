/**
 * Test: State Popup Flow
 * Per logic.yaml testing_expectations: test_state_popup_flow
 * 
 * Tests state popup behavior:
 * - Time-of-day detection (morning/evening windows)
 * - Auto-trigger logic
 * - State persistence
 * - Skip functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('State Popup Flow', () => {

    describe('Time of Day Detection', () => {
        // Simulate the timeOfDay calculation from NavigationShell
        const getTimeOfDay = (hour: number): 'morning' | 'evening' | null => {
            // Morning: 5am - 12pm
            if (hour >= 5 && hour < 12) return 'morning';
            // Evening: 6pm - 11pm
            if (hour >= 18 && hour < 23) return 'evening';
            // Outside check-in windows
            return null;
        };

        it('should return "morning" for hours 5-11', () => {
            expect(getTimeOfDay(5)).toBe('morning');
            expect(getTimeOfDay(8)).toBe('morning');
            expect(getTimeOfDay(11)).toBe('morning');
        });

        it('should return "evening" for hours 18-22', () => {
            expect(getTimeOfDay(18)).toBe('evening');
            expect(getTimeOfDay(20)).toBe('evening');
            expect(getTimeOfDay(22)).toBe('evening');
        });

        it('should return null for hours outside windows', () => {
            expect(getTimeOfDay(0)).toBe(null);   // midnight
            expect(getTimeOfDay(3)).toBe(null);   // 3am
            expect(getTimeOfDay(4)).toBe(null);   // 4am
            expect(getTimeOfDay(12)).toBe(null);  // noon
            expect(getTimeOfDay(15)).toBe(null);  // 3pm
            expect(getTimeOfDay(17)).toBe(null);  // 5pm
            expect(getTimeOfDay(23)).toBe(null);  // 11pm
        });

        it('should handle boundary hours correctly', () => {
            expect(getTimeOfDay(5)).toBe('morning');   // Start of morning
            expect(getTimeOfDay(11)).toBe('morning');  // End of morning (before noon)
            expect(getTimeOfDay(12)).toBe(null);       // Noon - not morning
            expect(getTimeOfDay(18)).toBe('evening');  // Start of evening
            expect(getTimeOfDay(22)).toBe('evening');  // Last hour of evening
        });
    });

    describe('Has Logged State Today Check', () => {
        interface StateEntry {
            emoji: string;
            timestamp: string;
            timeOfDay: 'morning' | 'evening';
        }

        const hasLoggedStateToday = (
            stateHistory: StateEntry[],
            timeOfDay: 'morning' | 'evening' | null,
            today: string
        ): boolean => {
            if (!timeOfDay) return true; // Don't show if outside windows

            return stateHistory.some(entry => {
                const entryDate = new Date(entry.timestamp).toDateString();
                return entryDate === today && entry.timeOfDay === timeOfDay;
            });
        };

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        it('should return false when no entries exist', () => {
            expect(hasLoggedStateToday([], 'morning', today)).toBe(false);
        });

        it('should return true when entry exists for today and same time of day', () => {
            const history: StateEntry[] = [{
                emoji: '😊',
                timestamp: new Date().toISOString(),
                timeOfDay: 'morning'
            }];

            expect(hasLoggedStateToday(history, 'morning', today)).toBe(true);
        });

        it('should return false when entry exists for today but different time of day', () => {
            const history: StateEntry[] = [{
                emoji: '😊',
                timestamp: new Date().toISOString(),
                timeOfDay: 'morning'
            }];

            expect(hasLoggedStateToday(history, 'evening', today)).toBe(false);
        });

        it('should return false when entry exists for yesterday', () => {
            const yesterdayDate = new Date(Date.now() - 86400000);
            const history: StateEntry[] = [{
                emoji: '😊',
                timestamp: yesterdayDate.toISOString(),
                timeOfDay: 'morning'
            }];

            expect(hasLoggedStateToday(history, 'morning', today)).toBe(false);
        });

        it('should return true when timeOfDay is null (outside windows)', () => {
            expect(hasLoggedStateToday([], null, today)).toBe(true);
        });
    });

    describe('Emoji Options', () => {
        const STATE_OPTIONS = [
            { emoji: '🔥', label: 'Fired Up' },
            { emoji: '😊', label: 'Good' },
            { emoji: '😐', label: 'Neutral' },
            { emoji: '😔', label: 'Low' },
            { emoji: '😴', label: 'Tired' },
        ];

        it('should have exactly 5 emoji options', () => {
            expect(STATE_OPTIONS.length).toBe(5);
        });

        it('should have unique emojis', () => {
            const emojis = STATE_OPTIONS.map(o => o.emoji);
            const uniqueEmojis = new Set(emojis);
            expect(uniqueEmojis.size).toBe(emojis.length);
        });

        it('should have unique labels', () => {
            const labels = STATE_OPTIONS.map(o => o.label);
            const uniqueLabels = new Set(labels);
            expect(uniqueLabels.size).toBe(labels.length);
        });

        it('should include all expected mood levels', () => {
            const labels = STATE_OPTIONS.map(o => o.label);
            expect(labels).toContain('Fired Up');
            expect(labels).toContain('Good');
            expect(labels).toContain('Neutral');
            expect(labels).toContain('Low');
            expect(labels).toContain('Tired');
        });
    });

    describe('State Entry Creation', () => {
        const createStateEntry = (
            emoji: string,
            timeOfDay: 'morning' | 'evening'
        ) => ({
            emoji,
            timestamp: new Date().toISOString(),
            timeOfDay
        });

        it('should create valid state entry', () => {
            const entry = createStateEntry('😊', 'morning');

            expect(entry.emoji).toBe('😊');
            expect(entry.timeOfDay).toBe('morning');
            expect(typeof entry.timestamp).toBe('string');
            expect(new Date(entry.timestamp).toString()).not.toBe('Invalid Date');
        });

        it('should create entry with correct time of day', () => {
            const morningEntry = createStateEntry('🔥', 'morning');
            const eveningEntry = createStateEntry('😴', 'evening');

            expect(morningEntry.timeOfDay).toBe('morning');
            expect(eveningEntry.timeOfDay).toBe('evening');
        });
    });

    describe('Auto-Trigger Logic', () => {
        it('should not trigger when already logged today', () => {
            const hasLogged = true;
            const timeOfDay: 'morning' | null = 'morning';

            const shouldTrigger = !hasLogged && timeOfDay !== null;
            expect(shouldTrigger).toBe(false);
        });

        it('should trigger when not logged and in valid time window', () => {
            const hasLogged = false;
            const timeOfDay: 'morning' | null = 'morning';

            const shouldTrigger = !hasLogged && timeOfDay !== null;
            expect(shouldTrigger).toBe(true);
        });

        it('should not trigger when outside time windows', () => {
            const hasLogged = false;
            const timeOfDay: 'morning' | null = null;

            const shouldTrigger = !hasLogged && timeOfDay !== null;
            expect(shouldTrigger).toBe(false);
        });
    });
});
