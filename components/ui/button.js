import * as React from "react"
import { twMerge } from "tailwind-merge"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-poppins"

    const variants = {
        default: "bg-lime-500 text-white hover:bg-lime-600 shadow-lg shadow-lime-500/20 dark:bg-lime-600 dark:hover:bg-lime-700",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
        outline: "border-2 border-lime-500 dark:border-lime-600 bg-transparent text-lime-600 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/20",
        secondary: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600",
        ghost: "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
        link: "text-lime-600 dark:text-lime-400 underline-offset-4 hover:underline",
    }

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
    }

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
