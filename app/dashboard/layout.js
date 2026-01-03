"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Listen for sidebar close event from navigation links
    useEffect(() => {
        const handleCloseSidebar = () => setSidebarOpen(false);
        window.addEventListener('closeSidebar', handleCloseSidebar);
        return () => window.removeEventListener('closeSidebar', handleCloseSidebar);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="text-indigo-500 font-poppins">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-black">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <Sidebar />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white/80 dark:bg-forest-950/80 backdrop-blur-md border-b border-gray-200 dark:border-forest-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-forest-900 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {sidebarOpen ? (
                                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                        <div className="flex items-center gap-2">
                            <Logo className="w-8 h-8" iconOnly={true} />
                            <span className="font-bold text-gray-900 dark:text-white tracking-tight">TrendHawk</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* User Initials/Avatar for mobile header */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-400 to-indigo-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
