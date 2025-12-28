"use client";
import { useState } from 'react';
import { TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Package, DollarSign, Users, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7d');

    // Mock analytics data
    const stats = [
        {
            label: 'Total Searches',
            value: '1,234',
            change: '+12.5%',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            label: 'Saved Products',
            value: '89',
            change: '+8.2%',
            trend: 'up',
            icon: Package,
            color: 'text-lime-600 dark:text-lime-400',
            bgColor: 'bg-lime-100 dark:bg-lime-900/30'
        },
        {
            label: 'Avg Demand Score',
            value: '76',
            change: '-2.4%',
            trend: 'down',
            icon: BarChart3,
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30'
        },
        {
            label: 'High Potential',
            value: '34',
            change: '+15.3%',
            trend: 'up',
            icon: ShoppingCart,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/30'
        }
    ];

    const topCategories = [
        { name: 'Electronics', count: 45, percentage: 35 },
        { name: 'Fashion', count: 32, percentage: 25 },
        { name: 'Home & Garden', count: 28, percentage: 22 },
        { name: 'Sports', count: 15, percentage: 12 },
        { name: 'Others', count: 8, percentage: 6 }
    ];

    const platformActivity = [
        { platform: 'Amazon', searches: 456, color: 'bg-orange-500' },
        { platform: 'eBay', searches: 342, color: 'bg-blue-500' },
        { platform: 'AliExpress', searches: 289, color: 'bg-red-500' },
        { platform: 'Etsy', searches: 98, color: 'bg-orange-600' },
        { platform: 'Daraz', searches: 49, color: 'bg-orange-400' }
    ];

    return (
        <div className="space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        Analytics
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                        Track your product research performance
                    </p>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-2">
                    {['24h', '7d', '30d', '90d'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={clsx(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                timeRange === range
                                    ? "bg-lime-500 text-white"
                                    : "bg-white dark:bg-forest-900/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-forest-800 hover:border-lime-300"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", stat.bgColor)}>
                                <stat.icon className={clsx("w-6 h-6", stat.color)} />
                            </div>
                            <div className={clsx(
                                "flex items-center gap-1 text-sm font-semibold",
                                stat.trend === 'up' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Categories */}
                <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Categories</h2>
                    <div className="space-y-4">
                        {topCategories.map((category, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{category.count} products</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-forest-800 rounded-full h-2">
                                    <div
                                        className="bg-lime-500 h-2 rounded-full transition-all"
                                        style={{ width: `${category.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Activity */}
                <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Platform Activity</h2>
                    <div className="space-y-4">
                        {platformActivity.map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("w-3 h-3 rounded-full", item.color)} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.platform}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.searches} searches</span>
                                    <div className="w-24 bg-gray-200 dark:bg-forest-800 rounded-full h-2">
                                        <div
                                            className={clsx("h-2 rounded-full", item.color)}
                                            style={{ width: `${(item.searches / 456) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-gradient-to-r from-lime-50 to-lime-100/50 dark:from-lime-900/20 dark:to-lime-900/10 border border-lime-200 dark:border-lime-800/30 rounded-xl p-6 text-center">
                <BarChart3 className="w-12 h-12 text-lime-600 dark:text-lime-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    More Analytics Coming Soon
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Advanced charts, revenue projections, and competitor analysis will be available in the next update.
                </p>
            </div>
        </div>
    );
}
