import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ children, className, variant = 'primary', ...props }) {
    const baseStyles = "px-6 py-3 rounded-xl font-poppins font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:shadow-none",
        premium: "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 border-none",
        secondary: "bg-white dark:bg-forest-900 border border-gray-200 dark:border-forest-700 text-forest-700 dark:text-forest-200 hover:bg-gray-50 dark:hover:bg-forest-800",
        outline: "border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10",
        ghost: "text-gray-500 dark:text-forest-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-forest-800/50"
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
}

export function Input({ label, error, className, ...props }) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2 font-poppins">{label}</label>}
            <input
                className={twMerge(
                    "w-full px-4 py-3 bg-white dark:bg-forest-900/50 border border-gray-200 dark:border-forest-700 rounded-xl text-forest-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400 dark:placeholder:text-forest-600 font-poppins",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500 font-poppins">{error}</p>}
        </div>
    );
}
