import { useEffect, useRef } from 'react';

/**
 * Hook to handle Android/Browser back button closing a modal.
 * 
 * Logic:
 * 1. On open: Push a dummy history state.
 * 2. On Back Button (popstate): Call onClose.
 * 3. On UI Close: The effect cleanup fires. If it wasn't a popstate event that triggered it,
 *    we manually pop the history to remove our dummy state.
 */
export function useBackToClose(isOpen: boolean, onClose: () => void) {
    const isPoppedRef = useRef(false);

    useEffect(() => {
        if (!isOpen) return;

        // Reset flag
        isPoppedRef.current = false;

        // Push state so back button has something to pop
        window.history.pushState({ modal: true }, '', window.location.href);

        const handlePopState = () => {
            // Mark that the close was triggered by the back button
            isPoppedRef.current = true;
            onClose();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            
            // If the component is unmounting (closing) and it wasn't due to the back button,
            // we need to remove the history state we added.
            if (!isPoppedRef.current) {
                window.history.back();
            }
        };
    }, [isOpen, onClose]);
}
