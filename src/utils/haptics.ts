'use client';

type VibrationPattern = 'light' | 'medium' | 'heavy' | 'soft' | 'success' | 'warning' | 'error';

export const vibrate = (pattern: VibrationPattern = 'light') => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;

    switch (pattern) {
        case 'light':
            navigator.vibrate(10); // Standard tap
            break;
        case 'soft':
            navigator.vibrate(5); // Ultra-light settle pulse
            break;
        case 'medium':
            navigator.vibrate(35); // More noticeable interaction (was 20)
            break;
        case 'heavy':
            navigator.vibrate(60); // Significant action (was 40)
            break;
        case 'success':
            navigator.vibrate([20, 40, 20]); // double tap-ish (boosted)
            break;
        case 'warning':
            navigator.vibrate([40, 60, 20]);
            break;
        case 'error':
            navigator.vibrate([60, 60, 60, 60]);
            break;
    }
};
