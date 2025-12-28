"use client";
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button, Input } from '@/components/ui';
import { Moon, Sun, User, Bell, Check, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import api from '@/utils/api';

export default function SettingsPage() {
    const { user } = useAuth(); // We might need to refresh user data here
    const { theme, toggleTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Password State
    const [passData, setPassData] = useState({ old_password: '', new_password: '' });

    const statusColor = msg.type === 'success' ? 'text-lime-600' : 'text-red-500';

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMsg({ type: '', text: '' });
        try {
            await api.post('user/change-password/', passData);
            setMsg({ type: 'success', text: 'Password updated successfully!' });
            setPassData({ old_password: '', new_password: '' });
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.old_password || 'Failed to update password' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 font-poppins">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-lime-100 dark:bg-lime-900/20 rounded-full flex items-center justify-center text-lime-600 dark:text-lime-400">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                        <p className="text-gray-500 dark:text-gray-400">Your account details</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mb-6">
                    <Input label="Username" defaultValue={user?.username} disabled />
                    <div className="relative">
                        <Input label="Plan" defaultValue={user?.profile?.plan?.toUpperCase() || 'FREE'} disabled />
                        {user?.profile?.plan !== 'pro' && (
                            <a href="/pricing" className="absolute top-0 right-0 text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline mt-9 mr-3">UPGRADE</a>
                        )}
                    </div>
                </div>
            </div>

            {/* Password Change */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
                        <p className="text-gray-500 dark:text-gray-400">Change your password</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                    <Input
                        type="password"
                        label="Current Password"
                        value={passData.old_password}
                        onChange={(e) => setPassData({ ...passData, old_password: e.target.value })}
                        required
                    />
                    <Input
                        type="password"
                        label="New Password"
                        value={passData.new_password}
                        onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
                        required
                    />

                    {msg.text && (
                        <div className={`text-sm flex items-center gap-2 ${statusColor}`}>
                            {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {msg.text}
                        </div>
                    )}

                    <Button disabled={isLoading} className="mt-2">
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Update Password
                    </Button>
                </form>
            </div>

            {/* Appearance Section */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                        {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
                        <p className="text-gray-500 dark:text-gray-400">Customize your interface theme</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                    <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                    <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-lime-500' : 'bg-gray-300'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
