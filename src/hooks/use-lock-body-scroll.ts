import { useEffect } from 'react';

export function useLockBodyScroll(isLocked: boolean) {
    useEffect(() => {
        if (isLocked) {
            const originalOverflow = window.getComputedStyle(document.body).overflow;
            const originalOverscroll = window.getComputedStyle(document.body).overscrollBehaviorY;

            // Prevent scrolling and pull-to-refresh
            document.body.style.overflow = 'hidden';
            document.body.style.overscrollBehaviorY = 'none';

            return () => {
                // Re-enable settings
                document.body.style.overflow = originalOverflow;
                document.body.style.overscrollBehaviorY = originalOverscroll;
            };
        }
    }, [isLocked]);
}
