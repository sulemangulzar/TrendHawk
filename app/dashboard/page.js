"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Shield, AlertTriangle, Target, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';

export default function CommandPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [todaysAction, setTodaysAction] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchCommandData();
        }
    }, [user]);

    const fetchCommandData = async () => {
        try {
            const res = await fetch(`/api/user-stats?userId=${user.id}`);
            const data = await res.json();

            if (data.success) {
                setStats(data.stats);
                setTodaysAction(data.todaysAction);
            }
        } catch (error) {
            console.error('Error fetching command data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                    Command Center
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Your money protection status and daily action
                </p>
            </div>

            {/* Money Protection Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            💰 Money Protection Summary
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Loss prevention in action
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                        <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                            Bad Products Avoided
                        </p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                            {stats?.products_avoided || 0}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                        <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                            Loss Avoided
                        </p>
                        <p className="text-4xl font-black text-green-600 dark:text-green-400">
                            ${stats?.money_saved?.toFixed(0) || 0}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                        <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                            Products Killed Early
                        </p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                            {stats?.products_killed || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Risk Exposure */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            ⚠️ Current Risk Exposure
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Active tests and money at stake
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                            Products Under Test
                        </p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">
                            {stats?.products_under_test || 0}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                            Money at Risk
                        </p>
                        <p className="text-4xl font-black text-amber-600 dark:text-amber-400">
                            ${stats?.money_at_risk?.toFixed(0) || 0}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                            Tests Close to Failure
                        </p>
                        <p className="text-4xl font-black text-red-600 dark:text-red-400">
                            {/* This will be calculated from live tests */}
                            0
                        </p>
                    </div>
                </div>
            </div>

            {/* Today's Action */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/30">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">
                            🎯 Today's Action
                        </h2>
                        <p className="text-indigo-100">
                            Your single most important task
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-2xl font-bold mb-6">
                        {todaysAction?.action || 'Check Market Proof for new opportunities'}
                    </p>
                    <Link href={todaysAction?.link || '/dashboard/market-proof'}>
                        <Button className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 text-lg font-black shadow-lg">
                            Take Action
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/live-tests" className="group">
                    <div className="bg-white dark:bg-forest-900/40 border-2 border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-indigo-500" />
                            View Live Tests
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Track active tests and get scale/kill recommendations
                        </p>
                    </div>
                </Link>

                <Link href="/dashboard/market-proof" className="group">
                    <div className="bg-white dark:bg-forest-900/40 border-2 border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-green-500" />
                            Browse Market Proof
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Find products with real seller evidence
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
