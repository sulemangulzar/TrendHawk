import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import Logo from '@/components/Logo';
import {
    LogOut, Moon, Sun, Crown
} from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navigation = [
        { name: 'Intelligence Hub', href: '/dashboard', icon: '⚡' },
        { name: 'Market Explorer', href: '/dashboard/market-proof', icon: '🌩️' },
        { name: 'Live Proof', href: '/dashboard/proof', icon: '💎' },
        { name: 'Winning Candidates', href: '/dashboard/candidates', icon: '🏆' },
    ];

    const isActive = (href) => pathname === href;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-forest-950 border-r border-gray-200 dark:border-forest-800 font-poppins">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200 dark:border-forest-800">
                <Link
                    href="/dashboard"
                    onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                            const event = new CustomEvent('closeSidebar');
                            window.dispatchEvent(event);
                        }
                    }}
                    className="group"
                >
                    <div className="flex items-center gap-2.5">
                        <Logo className="w-9 h-9" iconOnly={true} />
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                TrendHawk
                            </h1>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-bold">Loss Prevention</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-hide">
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
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                                active
                                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-forest-900/50"
                            )}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Upgrade CTA */}
            <div className="px-3 mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 dark:from-indigo-500/20 dark:to-emerald-500/20 border border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />

                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <div className="p-1.5 bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20">
                            <Crown className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Pro Plan</span>
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-3 leading-snug relative z-10">
                        Unlock 450 searches and professional market intelligence.
                    </p>

                    <Link
                        href="/pricing"
                        className="relative z-10 block"
                        onClick={() => {
                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                const event = new CustomEvent('closeSidebar');
                                window.dispatchEvent(event);
                            }
                        }}
                    >
                        <button className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-500/20">
                            Upgrade Now
                        </button>
                    </Link>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-2 border-t border-gray-200 dark:border-forest-800 space-y-1">
                {/* Secondary Nav */}
                <Link
                    href="/dashboard/settings"
                    onClick={() => {
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                            const event = new CustomEvent('closeSidebar');
                            window.dispatchEvent(event);
                        }
                    }}
                    className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
                        isActive('/dashboard/settings')
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-forest-900/50"
                    )}
                >
                    <span className="text-base">⚙️</span>
                    Settings
                </Link>

                <div className="h-px bg-gray-100 dark:bg-forest-800 my-1 mx-2" />

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-forest-900/30 transition-colors"
                >
                    <span>Theme</span>
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-gray-700" />}
                </button>

                {/* User Info */}
                <div className="px-3 py-1.5 flex items-center justify-between bg-gray-50 dark:bg-forest-900/30 rounded-xl mt-1">
                    <div className="truncate">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-tight">
                            {user?.user_metadata?.subscription_plan || 'FREE'} PLAN
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
