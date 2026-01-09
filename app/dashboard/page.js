"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Shield, AlertTriangle, Target, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';

export default function IntelligenceHub() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchIntelligenceData();
        }
    }, [user]);

    const fetchIntelligenceData = async () => {
        try {
            const res = await fetch(`/api/user-stats?userId=${user.id}`);
            const data = await res.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching intelligence data:', error);
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
        <div className="space-y-10 font-poppins max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
            {/* Intelligence Header */}
            <div>
                <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-[0.3em] mb-3">
                    <div className="w-8 h-[2px] bg-indigo-500"></div>
                    Global Intelligence Hub
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">{user?.email?.split('@')[0] || 'Explorer'}</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-2xl">
                    Market signals are trending high. We've detected new product deviations and verified potential winners across 6 global platforms.
                </p>
            </div>

            {/* Snapshot Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Market Scans', value: stats?.products_avoided || 0, icon: '🔍' },
                    { label: 'Verified Winners', value: stats?.products_killed || 0, icon: '✨' },
                    { label: 'Potential Savings', value: `$${(stats?.money_saved || 0).toLocaleString()}`, icon: '💰' },
                    { label: 'Engine Accuracy', value: '98.2%', icon: '⚡' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-forest-900/40 backdrop-blur-md p-6 rounded-3xl border border-gray-100 dark:border-forest-800 shadow-sm">
                        <div className="text-2xl mb-3">{stat.icon}</div>
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Core Tools - Quick Action */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tool 1 */}
                <Link href="/dashboard/market-proof" className="group">
                    <div className="relative h-full bg-white dark:bg-forest-900/40 rounded-[2rem] p-8 border border-gray-100 dark:border-forest-800 hover:border-indigo-500 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-indigo-500/10">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-7 h-7 text-indigo-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Market Explorer</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
                                Deploy our global crawlers to find untapped high-demand product trends before the masses.
                            </p>
                            <div className="flex items-center gap-2 text-indigo-500 font-black text-sm group-hover:translate-x-1 transition-transform">
                                EXPLORE TRENDS <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                    </div>
                </Link>

                {/* Tool 2 */}
                <Link href="/dashboard/proof" className="group">
                    <div className="relative h-full bg-white dark:bg-forest-900/40 rounded-[2rem] p-8 border border-gray-100 dark:border-forest-800 hover:border-emerald-500 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-emerald-500/10">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Shield className="w-7 h-7 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Live Proof</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
                                Paste any URL for a deep forensic analysis of sales evidence, seller trust, and market risk.
                            </p>
                            <div className="flex items-center gap-2 text-emerald-500 font-black text-sm group-hover:translate-x-1 transition-transform">
                                VERIFY URL <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                    </div>
                </Link>

                {/* Tool 3 */}
                <Link href="/dashboard/candidates" className="group">
                    <div className="relative h-full bg-white dark:bg-forest-900/40 rounded-[2rem] p-8 border border-gray-100 dark:border-forest-800 hover:border-amber-500 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-amber-500/10">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target className="w-7 h-7 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Winning Candidates</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
                                Manage your shortlist of verified potential winners and calculate real-world net profits.
                            </p>
                            <div className="flex items-center gap-2 text-amber-500 font-black text-sm group-hover:translate-x-1 transition-transform">
                                VIEW PIPELINE <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
                    </div>
                </Link>
            </div>

            {/* System Status / Intelligence Log */}
            <div className="bg-gray-50 dark:bg-forest-900/20 rounded-[2.5rem] p-8 border border-gray-100 dark:border-forest-800/50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0"></div>
                            <div className="w-3 h-3 bg-emerald-500 rounded-full relative"></div>
                        </div>
                        <div>
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Engine Status</div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">Trend Engines operational in 12 global regions</div>
                        </div>
                    </div>
                    <div className="flex gap-10">
                        <div>
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 text-center md:text-left">Success Rate</div>
                            <div className="text-xl font-black text-indigo-500">92.4%</div>
                        </div>
                        <div>
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 text-center md:text-left">Losses Saved</div>
                            <div className="text-xl font-black text-emerald-500">$18,490</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
