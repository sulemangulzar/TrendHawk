"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
    TrendingUp, Home, Heart, Settings, LogOut,
    BarChart3, Bell, Moon, Sun, Crown, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Saved Products', href: '/dashboard/saved', icon: Heart },
        { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
        { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const isActive = (href) => pathname === href;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-forest-950 border-r border-gray-200 dark:border-forest-800 font-poppins">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 dark:border-forest-800">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center shadow-lg shadow-lime-500/20 group-hover:scale-105 transition-transform">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            TrendHawk
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Research Tool</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                                // Close sidebar on mobile when clicking a link
                                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                    const event = new CustomEvent('closeSidebar');
                                    window.dispatchEvent(event);
                                }
                            }}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium",
                                active
                                    ? "bg-lime-500 text-white shadow-lg shadow-lime-500/20"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-forest-900/50"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Upgrade CTA */}
            <div className="px-3 mb-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-50 dark:from-lime-900/20 dark:to-emerald-900/20 border-2 border-lime-500/30 dark:border-lime-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-lime-600 dark:text-lime-400" />
                        <span className="text-sm font-bold text-lime-700 dark:text-lime-300">Upgrade to Pro</span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-3 font-medium">
                        3,000 searches/month + API access
                    </p>
                    <Link href="/pricing">
                        <button className="w-full py-2.5 bg-lime-500 hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700 text-white text-sm font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-lime-500/25">
                            View Plans →
                        </button>
                    </Link>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-3 border-t border-gray-200 dark:border-forest-800 space-y-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-forest-900/50 transition-colors"
                >
                    <span>Theme</span>
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-700 dark:text-gray-400" />}
                </button>

                {/* User Info */}
                <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.email?.split('@')[0] || user?.user_metadata?.name || 'User'}
                    </p>
                    <p className="text-xs text-lime-600 dark:text-lime-400 font-medium truncate">
                        {user?.user_metadata?.subscription_plan?.toUpperCase() || 'FREE'} Plan
                    </p>
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
