"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './index';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white dark:bg-forest-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-forest-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-forest-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 font-poppins">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1 h-12"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={type === 'danger' ? 'primary' : 'premium'}
                            className={`flex-1 h-12 ${type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : ''}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
