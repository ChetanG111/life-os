'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { vibrate } from '@/utils/haptics';

// Toast Types
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = Date.now().toString();
        const newToast: Toast = { id, message, type, duration };

        // Haptic feedback based on type
        if (type === 'success') vibrate('success');
        else if (type === 'error') vibrate('error');
        else if (type === 'warning') vibrate('warning');
        else vibrate('light');

        setToasts(prev => [...prev, newToast]);

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        // Console log per spec (error_handling.rules: log_to_console)
        console.log(`[Toast ${type.toUpperCase()}]: ${message}`);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Container Component
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[], onDismiss: (id: string) => void }) {
    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} className="text-green-400" />;
            case 'error': return <AlertCircle size={20} className="text-red-400" />;
            case 'warning': return <AlertTriangle size={20} className="text-amber-400" />;
            case 'info': return <Info size={20} className="text-blue-400" />;
        }
    };

    const getBorderColor = (type: ToastType) => {
        switch (type) {
            case 'success': return 'border-green-500/30';
            case 'error': return 'border-red-500/30';
            case 'warning': return 'border-amber-500/30';
            case 'info': return 'border-blue-500/30';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`
                            bg-[var(--surface)] backdrop-blur-xl rounded-2xl p-4 
                            border ${getBorderColor(toast.type)} 
                            shadow-2xl pointer-events-auto
                            flex items-start gap-3
                        `}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon(toast.type)}
                        </div>
                        <p className="flex-1 text-sm text-white font-medium leading-snug">
                            {toast.message}
                        </p>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="flex-shrink-0 text-neutral-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
