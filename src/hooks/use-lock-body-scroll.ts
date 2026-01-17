import { useEffect } from 'react';

export function useLockBodyScroll(isLocked: boolean) {
    useEffect(() => {
        if (isLocked) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            // Prevent scrolling on mount
            document.body.style.overflow = 'hidden';
            // Prevent touch move to disable pull-to-refresh more aggressively on iOS
            // Note: This might interfere with internal scrolling if not handled carefully, 
            // but for a full screen modal it's usually desired on the body.
            
            return () => {
                // Re-enable scrolling when component unmounts
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isLocked]);
}
