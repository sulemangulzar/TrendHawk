"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Bell, Plus, TrendingUp, DollarSign, Package, X, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import clsx from 'clsx';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([
        {
            id: 1,
            type: 'price_drop',
            product: 'Wireless Headphones',
            condition: 'Price drops below $50',
            status: 'active',
            triggered: false
        },
        {
            id: 2,
            type: 'demand_spike',
            product: 'Smart Watch',
            condition: 'Demand score above 80',
            status: 'active',
            triggered: true
        },
        {
            id: 3,
            type: 'new_trending',
            product: 'Gaming Mouse',
            condition: 'Appears in trending',
            status: 'paused',
            triggered: false
        }
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const alertTypes = [
        { id: 'price_drop', label: 'Price Drop', icon: DollarSign, color: 'text-green-600 dark:text-green-400' },
        { id: 'demand_spike', label: 'Demand Spike', icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'new_trending', label: 'New Trending', icon: Package, color: 'text-purple-600 dark:text-purple-400' }
    ];

    const toggleAlert = (id) => {
        setAlerts(alerts.map(alert =>
            alert.id === id
                ? { ...alert, status: alert.status === 'active' ? 'paused' : 'active' }
                : alert
        ));
    };

    const deleteAlert = (id) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    const createAlert = () => {
        // For now, just show a message
        alert('Alert creation feature coming soon! This will allow you to set custom alerts for price drops, demand spikes, and new trending products.');
        setShowCreateModal(false);
    };

    return (
        <div className="space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        Product Alerts
                    </h1>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                        Get notified when products meet your criteria
                    </p>
                </div>

                <Button className="w-full sm:w-auto" onClick={createAlert}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Alert
                </Button>
            </div>

            {/* Alert Types Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {alertTypes.map((type) => (
                    <div
                        key={type.id}
                        className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-forest-800 rounded-lg flex items-center justify-center">
                                <type.icon className={clsx("w-5 h-5", type.color)} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">{type.label}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {alerts.filter(a => a.type === type.id && a.status === 'active').length} active
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-forest-900/20 rounded-xl border border-gray-200 dark:border-forest-800">
                        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No Alerts Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Create your first alert to get notified about product changes
                        </p>
                        <Button onClick={createAlert}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Alert
                        </Button>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const alertType = alertTypes.find(t => t.type === alert.type) || alertTypes[0];
                        return (
                            <div
                                key={alert.id}
                                className={clsx(
                                    "bg-white dark:bg-forest-900/40 border rounded-xl p-6 transition-all",
                                    alert.status === 'active'
                                        ? "border-gray-200 dark:border-forest-800"
                                        : "border-gray-200 dark:border-forest-800 opacity-60"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                            alert.status === 'active' ? "bg-lime-100 dark:bg-lime-900/30" : "bg-gray-100 dark:bg-forest-800"
                                        )}>
                                            <alertType.icon className={clsx(
                                                "w-6 h-6",
                                                alert.status === 'active' ? alertType.color : "text-gray-400"
                                            )} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white">{alert.product}</h3>
                                                {alert.triggered && (
                                                    <span className="px-2 py-0.5 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 text-xs font-semibold rounded-full">
                                                        Triggered
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {alert.condition}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className={clsx(
                                                    "px-2 py-1 text-xs font-medium rounded-lg",
                                                    alert.status === 'active'
                                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                        : "bg-gray-100 dark:bg-forest-800 text-gray-600 dark:text-gray-400"
                                                )}>
                                                    {alert.status === 'active' ? 'Active' : 'Paused'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                                    {alertType.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleAlert(alert.id)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-forest-800 rounded-lg transition-colors"
                                            title={alert.status === 'active' ? 'Pause' : 'Activate'}
                                        >
                                            {alert.status === 'active' ? (
                                                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Bell className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => deleteAlert(alert.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pro Feature Notice */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800/30 rounded-xl p-6 text-center">
                <Bell className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Upgrade to Pro for Email Alerts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Get instant email notifications when your alerts are triggered
                </p>
                <Link href="/pricing">
                    <Button variant="outline" className="border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        View Plans
                    </Button>
                </Link>
            </div>
        </div>
    );
}
