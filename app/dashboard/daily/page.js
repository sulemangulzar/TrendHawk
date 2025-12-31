"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Zap,
    Search,
    Clock,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';

export default function DailyActionPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        scanned: 0,
        candidates: 0,
        moneySaved: 0
    });

    useEffect(() => {
        if (user) {
            fetchDailyStats();
        }
    }, [user]);

    const fetchDailyStats = async () => {
        try {
            // Simplified fetch for demo purposes, in production this would be a real API
            const res = await fetch(`/api/dashboard/summary?userId=${user.id}`);
            const data = await res.json();
            setStats({
                scanned: data.scanned || 0,
                candidates: data.safe_to_test || 0,
                moneySaved: data.money_saved || 0
            });
        } catch (error) {
            console.error('Fetch stats error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 font-poppins max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    <span className="text-5xl md:text-6xl block md:inline mb-2 md:mb-0">🎯</span> Today's Action Plan
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto md:mx-0">
                    Your personalized guide to smart e-commerce decisions.
                </p>
            </div>

            {/* Quick Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                    <p className="text-sm text-gray-500 mb-1">Protection Active</p>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-lime-500" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">Financial Shield ON</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                    <p className="text-sm text-gray-500 mb-1">Capital Preserved</p>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-xl font-bold text-green-600">${stats.moneySaved} Saved</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                    <p className="text-sm text-gray-500 mb-1">Opportunities</p>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{stats.candidates} Verified</span>
                    </div>
                </div>
            </div>

            {/* Action Sections */}
            <div className="space-y-6">
                {/* 1. Immediate: High Priority */}
                <section className="bg-lime-50 dark:bg-lime-900/10 border-2 border-lime-500/30 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-lime-500 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Priority Actions</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Do these first to maximize ROI</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ActionItem
                            icon={<Search className="w-5 h-5 text-lime-600" />}
                            title="Analyze 3 New Products"
                            description="Maintain your momentum. Focus on 'Home & Garden' or 'Tech Gadgets' today - demand is spiking."
                            link="/dashboard/analyze"
                            cta="Start Analysis"
                        />
                        {stats.candidates > 0 ? (
                            <ActionItem
                                icon={<CheckCircle className="w-5 h-5 text-lime-600" />}
                                title={`Review ${stats.candidates} Candidates`}
                                description="You have verified products waiting. Run the Case Simulator to finalize your testing budget."
                                link="/dashboard/candidates"
                                cta="Review Now"
                            />
                        ) : (
                            <div className="bg-white/50 dark:bg-forest-900/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-forest-700">
                                <p className="text-sm text-gray-500 italic">No candidates ready yet. Discovery is your primary goal.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Strategy & Learning */}
                <section className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Strategy Update</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sharpen your merchant instincts</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-forest-800/50 rounded-xl border border-gray-100 dark:border-forest-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                Market Shift Warning
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Saturation in 'Winter Wear' has increased by 15% this week. We recommend pausing new analysis in this niche.
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-forest-800/50 rounded-xl border border-gray-100 dark:border-forest-700">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                New Opportunity
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                'Self-Care' products are showing low entry barriers. 12 out of 15 top listings have less than 200 reviews.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Maintenance */}
                <section className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Routine Check</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Keep your workspace clean</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/dashboard/settings" className="flex-1">
                            <Button variant="outline" className="w-full">Update Search Filters</Button>
                        </Link>
                        <Link href="/dashboard/explore" className="flex-1">
                            <Button variant="outline" className="w-full">Clear Old Search History</Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

function ActionItem({ icon, title, description, link, cta }) {
    return (
        <div className="bg-white dark:bg-forest-950 p-6 md:p-8 rounded-[32px] border border-gray-100 dark:border-forest-800 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-14 h-14 bg-lime-50 dark:bg-lime-900/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-xl mb-1">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg font-medium">{description}</p>
                </div>
            </div>
            <Link href={link} className="w-full md:w-auto">
                <Button className="w-full md:w-auto flex items-center justify-center gap-2 h-14 px-10 text-lg font-black shadow-xl shadow-lime-500/10 rounded-2xl group-hover:translate-x-1 transition-transform">
                    {cta}
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </Link>
        </div>
    );
}
