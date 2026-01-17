'use client';

type VibrationPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export const vibrate = (pattern: VibrationPattern = 'light') => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    switch (pattern) {
        case 'light':
            navigator.vibrate(10); // Standard tap
            break;
        case 'medium':
            navigator.vibrate(20); // More noticeable interaction
            break;
        case 'heavy':
            navigator.vibrate(40); // Significant action
            break;
        case 'success':
            navigator.vibrate([10, 30, 10]); // double tap-ish
            break;
        case 'warning':
            navigator.vibrate([30, 50, 10]);
            break;
        case 'error':
            navigator.vibrate([50, 50, 50, 50]);
            break;
    }
};
