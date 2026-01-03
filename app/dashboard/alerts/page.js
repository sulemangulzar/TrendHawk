"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Plus, Zap, DollarSign, Package, X, Check, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';

export default function AlertsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [formData, setFormData] = useState({
        keyword: '',
        platform: 'any',
        maxPrice: '',
        minReviews: '',
        minRating: '',
        notificationEmail: true,
        notificationApp: true
    });

    const alertTypes = [
        { id: 'price_drop', label: 'Price Drop', icon: DollarSign, color: 'text-green-600 dark:text-green-400' },
        { id: 'demand_spike', label: 'Demand Spike', icon: Zap, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'new_trending', label: 'New Trending', icon: Package, color: 'text-purple-600 dark:text-purple-400' }
    ];

    useEffect(() => {
        if (user) {
            fetchAlerts();
        }
    }, [user]);

    const fetchAlerts = async () => {
        try {
            const res = await fetch(`/api/alerts?userId=${user.id}`);
            const data = await res.json();
            if (res.ok) {
                setAlerts(data.alerts || []);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAlert = async (alertId, currentStatus) => {
        try {
            const res = await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alertId,
                    userId: user.id,
                    isActive: !currentStatus
                })
            });

            if (res.ok) {
                setAlerts(alerts.map(alert =>
                    alert.id === alertId
                        ? { ...alert, is_active: !currentStatus }
                        : alert
                ));
                showToast(currentStatus ? 'Alert paused' : 'Alert activated', 'success');
            }
        } catch (error) {
            showToast('Failed to update alert', 'error');
        }
    };

    const deleteAlert = async (alertId) => {
        if (!confirm('Are you sure you want to delete this alert?')) return;

        try {
            const res = await fetch(`/api/alerts?alertId=${alertId}&userId=${user.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setAlerts(alerts.filter(alert => alert.id !== alertId));
                showToast('Alert deleted successfully', 'success');
            }
        } catch (error) {
            showToast('Failed to delete alert', 'error');
        }
    };

    const createAlert = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...formData
                })
            });

            const data = await res.json();

            if (res.ok) {
                setAlerts([data.alert, ...alerts]);
                showToast('Alert created successfully!', 'success');
                setShowCreateModal(false);
                setFormData({
                    keyword: '',
                    platform: 'any',
                    maxPrice: '',
                    minReviews: '',
                    minRating: '',
                    notificationEmail: true,
                    notificationApp: true
                });
            } else {
                showToast(data.error || 'Failed to create alert', 'error');
            }
        } catch (error) {
            showToast('Failed to create alert', 'error');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

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

                <Button className="w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
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
                                    {alerts.filter(a => a.is_active).length} active
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
                        <div className="flex justify-center">
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Alert
                            </Button>
                        </div>
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={clsx(
                                "bg-white dark:bg-forest-900/40 border rounded-xl p-6 transition-all",
                                alert.is_active
                                    ? "border-gray-200 dark:border-forest-800"
                                    : "border-gray-200 dark:border-forest-800 opacity-60"
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                        alert.is_active ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-gray-100 dark:bg-forest-800"
                                    )}>
                                        <Bell className={clsx(
                                            "w-6 h-6",
                                            alert.is_active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"
                                        )} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white capitalize">{alert.keyword}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Platform: {alert.platform === 'any' ? 'All' : alert.platform}
                                            {alert.max_price && ` • Max Price: $${alert.max_price}`}
                                            {alert.min_reviews && ` • Min Reviews: ${alert.min_reviews}`}
                                            {alert.min_rating && ` • Min Rating: ${alert.min_rating}★`}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "px-2 py-1 text-xs font-medium rounded-lg",
                                                alert.is_active
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                    : "bg-gray-100 dark:bg-forest-800 text-gray-600 dark:text-gray-400"
                                            )}>
                                                {alert.is_active ? 'Active' : 'Paused'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleAlert(alert.id, alert.is_active)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-forest-800 rounded-lg transition-colors"
                                        title={alert.is_active ? 'Pause' : 'Activate'}
                                    >
                                        {alert.is_active ? (
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
                    ))
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

            {/* Create Alert Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-forest-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Alert</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-forest-800 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={createAlert} className="space-y-4">
                            <Input
                                label="Keyword"
                                placeholder="e.g., wireless headphones"
                                value={formData.keyword}
                                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Platform
                                </label>
                                <select
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-forest-700 bg-white dark:bg-forest-800 text-gray-900 dark:text-white"
                                >
                                    <option value="any">All Platforms</option>
                                    <option value="amazon">Amazon</option>
                                    <option value="ebay">eBay</option>
                                </select>
                            </div>

                            <Input
                                label="Max Price (Optional)"
                                type="number"
                                placeholder="e.g., 50"
                                value={formData.maxPrice}
                                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                            />

                            <Input
                                label="Min Reviews (Optional)"
                                type="number"
                                placeholder="e.g., 100"
                                value={formData.minReviews}
                                onChange={(e) => setFormData({ ...formData, minReviews: e.target.value })}
                            />

                            <Input
                                label="Min Rating (Optional)"
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                placeholder="e.g., 4.5"
                                value={formData.minRating}
                                onChange={(e) => setFormData({ ...formData, minRating: e.target.value })}
                            />

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating} className="flex-1">
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Alert'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
