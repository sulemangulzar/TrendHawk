"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { TrendingUp, AlertTriangle, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function DashboardPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [marketSnapshot, setMarketSnapshot] = useState(null);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Fetch decision summary
            const summaryRes = await fetch(`/api/dashboard/summary?userId=${user.id}`);
            const summaryData = await summaryRes.json();
            setSummary(summaryData);

            // Fetch market snapshot
            const snapshotRes = await fetch('/api/dashboard/snapshot');
            const snapshotData = await snapshotRes.json();
            setMarketSnapshot(snapshotData);

            // Fetch recent analyzed products
            const productsRes = await fetch(`/api/dashboard/recent?userId=${user.id}`);
            const productsData = await productsRes.json();
            setRecentProducts(productsData.products || []);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                    Welcome back, {user?.email?.split('@')[0] || 'there'}! 👋
                </h1>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Here's how TrendHawk is protecting your money
                    </p>
                    <Link href="/dashboard/daily" className="w-full md:w-auto">
                        <Button className="w-full md:w-auto bg-gradient-to-r from-lime-500 to-emerald-600 hover:scale-105 transition-transform text-white flex items-center justify-center gap-2 h-14 px-8 shadow-xl shadow-lime-500/20 rounded-2xl">
                            <span className="text-xl">🎯</span>
                            View Daily Action Plan
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Decision Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Safe to Test */}
                <div className="bg-white dark:bg-forest-900/20 border-2 border-green-500/20 dark:border-green-500/10 rounded-3xl p-5 md:p-6 hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors" />
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-green-600 dark:text-green-400 tracking-widest">Safe to Test</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                                {summary?.safe_to_test || 0}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 relative z-10">
                        Low risk opportunities ready for testing
                    </p>
                </div>

                {/* High Risk */}
                <div className="bg-white dark:bg-forest-900/20 border-2 border-yellow-500/20 dark:border-yellow-500/10 rounded-3xl p-5 md:p-6 hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-yellow-600 dark:text-yellow-400 tracking-widest">High Risk</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                                {summary?.high_risk || 0}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 relative z-10">
                        Proceed with caution - expert mode
                    </p>
                </div>

                {/* Skipped */}
                <div className="bg-white dark:bg-forest-900/20 border-2 border-red-500/20 dark:border-red-500/10 rounded-3xl p-5 md:p-6 hover:shadow-xl transition-all group overflow-hidden relative sm:col-span-2 lg:col-span-1">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                            <XCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-red-600 dark:text-red-400 tracking-widest">Money Saved</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-sm font-black text-gray-400">$</span>
                                <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">
                                    {summary?.money_saved || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 relative z-10">
                        You've skipped <b>{summary?.skipped || 0}</b> high-risk items.
                    </p>
                </div>
            </div>

            {/* Market Snapshot */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Today's Market Snapshot
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Trending Demand</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="text-green-500">↑</span>
                            {marketSnapshot?.trending_demand || 'Stable'}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Saturation Level</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="text-yellow-500">⚠</span>
                            {marketSnapshot?.saturation_level || 'Stable'}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Beginner-Friendly Products</p>
                        <p className="text-2xl font-bold text-lime-600 dark:text-lime-400">
                            {marketSnapshot?.beginner_friendly || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recently Analyzed */}
            <div>
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        Recently Analyzed Products
                    </h2>
                    <Link href="/dashboard/explore" className="w-full md:w-auto">
                        <Button variant="outline" className="w-full md:w-auto flex items-center justify-center gap-2 h-12 px-6 border-gray-200 dark:border-forest-800 font-bold rounded-xl">
                            View All
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {recentProducts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-forest-900/20 rounded-2xl border border-gray-200 dark:border-forest-800">
                        <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            No products analyzed yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500 mb-6">
                            Start analyzing products to see your decision history
                        </p>
                        <div className="flex justify-center">
                            <Link href="/dashboard/analyze">
                                <Button className="flex items-center gap-3 py-6 px-10 text-xl font-bold hover:scale-105 transition-transform">
                                    <span className="text-2xl">⚡</span>
                                    Analyze Your First Product
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentProducts.slice(0, 5).map((product) => (
                            <Link
                                key={product.id}
                                href={`/dashboard/product/${product.id}`}
                                className="block bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl p-4 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            {product.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            ${product.price} • {product.source}
                                        </p>
                                    </div>
                                    <VerdictBadge verdict={product.verdict} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/dashboard/analyze" className="group">
                    <div className="bg-gradient-to-br from-lime-500 to-emerald-600 rounded-2xl p-8 text-white hover:shadow-2xl transition-all transform hover:scale-105">
                        <span className="text-4xl mb-3 block">⚡</span>
                        <h3 className="text-2xl font-bold mb-2">Analyze New Product</h3>
                        <p className="text-lime-50 mb-4">Get instant verdict on any product</p>
                        <div className="flex items-center gap-2 text-white font-semibold">
                            Start Analysis
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                <Link href="/dashboard/candidates" className="group">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white hover:shadow-2xl transition-all transform hover:scale-105">
                        <span className="text-4xl mb-3 block">⭐</span>
                        <h3 className="text-2xl font-bold mb-2">Test Candidates</h3>
                        <p className="text-purple-50 mb-4">Review your saved products</p>
                        <div className="flex items-center gap-2 text-white font-semibold">
                            View Candidates
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

function VerdictBadge({ verdict }) {
    const configs = {
        test: {
            label: '✅ Test',
            className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800'
        },
        careful: {
            label: '⚠ Test Carefully',
            className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800'
        },
        skip: {
            label: '❌ Skip',
            className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
        }
    };

    const config = configs[verdict] || configs.test;

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${config.className}`}>
            {config.label}
        </span>
    );
}
