import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ children, className, variant = 'primary', ...props }) {
    const baseStyles = "px-6 py-3 rounded-xl font-poppins font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";

    const variants = {
        primary: "bg-lime-500 text-white hover:bg-lime-600 shadow-lg shadow-lime-500/20 active:shadow-none",
        secondary: "bg-white dark:bg-forest-900 border border-gray-200 dark:border-forest-700 text-forest-700 dark:text-forest-200 hover:bg-gray-50 dark:hover:bg-forest-800",
        outline: "border-2 border-lime-500 text-lime-600 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/10",
        ghost: "text-gray-500 dark:text-forest-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-lime-50 dark:hover:bg-forest-800/50"
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
                    "w-full px-4 py-3 bg-white dark:bg-forest-900/50 border border-gray-200 dark:border-forest-700 rounded-xl text-forest-900 dark:text-white outline-none focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 transition-all placeholder:text-gray-400 dark:placeholder:text-forest-600 font-poppins",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500 font-poppins">{error}</p>}
        </div>
    );
}
