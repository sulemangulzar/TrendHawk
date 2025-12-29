"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    TrendingUp,
    Search,
    Heart,
    Package,
    CheckCircle,
    XCircle,
    Loader2,
    Clock
} from 'lucide-react';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchAnalytics();
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`/api/analytics?userId=${user.id}`);
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black p-6 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-lime-600 animate-spin" />
            </div>
        );
    }

    const stats = analytics?.stats || {};
    const recentSearches = analytics?.recentSearches || [];
    const topKeywords = analytics?.topKeywords || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your product research insights and statistics
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Searches */}
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalSearches || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Searches</p>
                            </div>
                        </div>
                    </div>

                    {/* Products Found */}
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-lime-100 dark:bg-lime-900/30 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-lime-600 dark:text-lime-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.productsFound || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Products Found</p>
                            </div>
                        </div>
                    </div>

                    {/* Favorites */}
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.favoritesCount || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
                            </div>
                        </div>
                    </div>

                    {/* Avg Products */}
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.avgProductsPerSearch || 0}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Per Search</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Searches */}
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Recent Searches
                        </h2>
                        <div className="space-y-3">
                            {recentSearches.length > 0 ? (
                                recentSearches.map((search) => (
                                    <div
                                        key={search.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-forest-950 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {search.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            ) : search.status === 'failed' ? (
                                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {search.keyword}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(search.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${search.status === 'completed'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : search.status === 'failed'
                                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                }`}
                                        >
                                            {search.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No searches yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Top Keywords */}
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Top Keywords
                        </h2>
                        <div className="space-y-3">
                            {topKeywords.length > 0 ? (
                                topKeywords.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-forest-950 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-lime-100 dark:bg-lime-900/30 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-bold text-lime-600 dark:text-lime-400">
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {item.keyword}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                            {item.count} {item.count === 1 ? 'search' : 'searches'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No keywords yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Success Rate */}
                {stats.totalSearches > 0 && (
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Search Success Rate
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Completed</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">
                                        {stats.completedSearches} / {stats.totalSearches}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-forest-800 rounded-full h-3">
                                    <div
                                        className="bg-green-600 dark:bg-green-500 h-3 rounded-full transition-all"
                                        style={{
                                            width: `${(stats.completedSearches / stats.totalSearches) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="text-3xl font-black text-green-600 dark:text-green-400">
                                {Math.round((stats.completedSearches / stats.totalSearches) * 100)}%
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
