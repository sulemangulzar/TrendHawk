"use client";
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button, Input } from '@/components/ui';
import { Moon, Sun, User, Lock, Mail, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
    const { user, updateUsername, updatePassword, updateEmail } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useToast();

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [passData, setPassData] = useState({ new_password: '', confirm_password: '' });

    useEffect(() => {
        if (user) {
            setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const results = [];

            // Update Username if changed
            if (username !== (user.user_metadata?.username || '')) {
                const res = await updateUsername(username);
                results.push(res);
            }

            // Update Email if changed
            if (email !== user.email) {
                const res = await updateEmail(email);
                results.push(res);
            }

            const failed = results.find(r => !r.success);
            if (failed) {
                showToast(failed.error, 'error');
            } else if (results.length > 0) {
                showToast('Profile updated successfully!', 'success');
            }
        } catch (error) {
            showToast('Update failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.new_password !== passData.confirm_password) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const res = await updatePassword(passData.new_password);
            if (res.success) {
                showToast('Password updated successfully!', 'success');
                setPassData({ new_password: '', confirm_password: '' });
            } else {
                showToast(res.error, 'error');
            }
        } catch (error) {
            showToast('Update failed', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 font-poppins pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your profile and security preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Security */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Profile Section */}
                    <div className="bg-white dark:bg-forest-900/40 border-2 border-gray-100 dark:border-forest-800 rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2>
                                <p className="text-sm text-gray-500">Public profile information</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="your_name"
                                />
                                <Input
                                    label="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="pt-2">
                                <Button disabled={isLoading} className="w-full md:w-auto px-8 h-12">
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    Save Profile Changes
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Password Section */}
                    <div className="bg-white dark:bg-forest-900/40 border-2 border-gray-100 dark:border-forest-800 rounded-3xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
                                <p className="text-sm text-gray-500">Keep your account secure</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                            <Input
                                type="password"
                                label="New Password"
                                value={passData.new_password}
                                onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                            <Input
                                type="password"
                                label="Confirm New Password"
                                value={passData.confirm_password}
                                onChange={(e) => setPassData({ ...passData, confirm_password: e.target.value })}
                                placeholder="••••••••"
                                required
                            />

                            <Button variant="secondary" disabled={isLoading} className="w-full md:w-auto px-8 h-12">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                                Update Password
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Preferences & Info */}
                <div className="space-y-8">
                    {/* Appearance */}
                    <div className="bg-white dark:bg-forest-900/40 border-2 border-gray-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            Appearance
                        </h3>

                        <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-forest-900/30 rounded-2xl border border-gray-100 dark:border-forest-800">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${theme === 'dark' ? 'bg-indigo-500' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-200" />
                            Current Plan
                        </h3>
                        <div className="mb-6">
                            <p className="text-3xl font-black mb-1">
                                {user?.user_metadata?.subscription_plan?.toUpperCase() || 'FREE'}
                            </p>
                            <p className="text-indigo-100 text-sm opacity-80">
                                {user?.user_metadata?.subscription_plan === 'pro' ? 'Enjoying all pro features' : 'Basic exploration limits'}
                            </p>
                        </div>
                        {user?.user_metadata?.subscription_plan !== 'pro' && (
                            <a href="/pricing">
                                <Button variant="premium" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none h-12">
                                    Upgrade to Pro
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
