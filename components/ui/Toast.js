"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
};

const colors = {
    success: "border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10",
    error: "border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10",
    warning: "border-yellow-100 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10",
    info: "border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10",
};

export function Toast({ message, type = 'success', duration = 3000, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={twMerge(
                "flex items-center gap-4 px-5 py-4 min-w-[320px] max-w-md rounded-2xl border-2 shadow-xl backdrop-blur-md",
                colors[type]
            )}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white font-poppins">
                    {message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </motion.div>
    );
}

export function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
