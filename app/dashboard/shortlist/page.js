"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import { Eye, CheckCircle2, XCircle, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ShortlistPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [shortlist, setShortlist] = useState({ watching: [], ready: [], rejected: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchShortlist();
        }
    }, [user]);

    const fetchShortlist = async () => {
        try {
            const res = await fetch(`/api/shortlist?userId=${user.id}`);
            const data = await res.json();

            if (data.success) {
                const grouped = {
                    watching: data.shortlist.filter(item => item.status === 'watching'),
                    ready: data.shortlist.filter(item => item.status === 'ready'),
                    rejected: data.shortlist.filter(item => item.status === 'rejected')
                };
                setShortlist(grouped);
            }
        } catch (error) {
            console.error('Error fetching shortlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const moveToLiveTests = async (item) => {
        try {
            // Create live test
            const testRes = await fetch('/api/live-tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    productName: item.product_name,
                    productUrl: item.product_url,
                    productId: item.product_id
                })
            });

            if (testRes.ok) {
                // Update decision status
                await fetch('/api/shortlist', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        decisionId: item.id,
                        userId: user.id,
                        status: 'testing'
                    })
                });

                showToast('Moved to Live Tests!', 'success');
                fetchShortlist();
            }
        } catch (error) {
            showToast('Error moving to live tests', 'error');
        }
    };

    const rejectProduct = async (item) => {
        try {
            await fetch('/api/shortlist', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    decisionId: item.id,
                    userId: user.id,
                    status: 'rejected'
                })
            });

            showToast('Product rejected - money saved!', 'success');
            fetchShortlist();
        } catch (error) {
            showToast('Error rejecting product', 'error');
        }
    };

    const markAsReady = async (item) => {
        try {
            await fetch('/api/shortlist', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    decisionId: item.id,
                    userId: user.id,
                    status: 'ready'
                })
            });

            showToast('Marked as ready to test!', 'success');
            fetchShortlist();
        } catch (error) {
            showToast('Error updating status', 'error');
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
                    Shortlist
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Decision buffer before risking money
                </p>
            </div>

            {/* Three Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Watching */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Watching ({shortlist.watching.length})
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {shortlist.watching.map(item => (
                            <ShortlistCard
                                key={item.id}
                                item={item}
                                onMarkReady={() => markAsReady(item)}
                                onReject={() => rejectProduct(item)}
                                status="watching"
                            />
                        ))}
                        {shortlist.watching.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 dark:bg-forest-900/20 rounded-xl border border-gray-200 dark:border-forest-800">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    No products watching
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ready to Test */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Ready to Test ({shortlist.ready.length})
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {shortlist.ready.map(item => (
                            <ShortlistCard
                                key={item.id}
                                item={item}
                                onMoveToTests={() => moveToLiveTests(item)}
                                onReject={() => rejectProduct(item)}
                                status="ready"
                            />
                        ))}
                        {shortlist.ready.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 dark:bg-forest-900/20 rounded-xl border border-gray-200 dark:border-forest-800">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    No products ready
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Rejected */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Rejected ({shortlist.rejected.length})
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {shortlist.rejected.map(item => (
                            <ShortlistCard
                                key={item.id}
                                item={item}
                                status="rejected"
                            />
                        ))}
                        {shortlist.rejected.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 dark:bg-forest-900/20 rounded-xl border border-gray-200 dark:border-forest-800">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    No rejected products
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShortlistCard({ item, onMarkReady, onMoveToTests, onReject, status }) {
    const borderColor = status === 'ready' ? 'border-green-500' :
        status === 'rejected' ? 'border-red-500' :
            'border-blue-500';

    return (
        <div className={`bg-white dark:bg-forest-900/40 border-2 ${borderColor} rounded-xl p-4`}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {item.product_name}
            </h3>

            {item.shortlist_reason && (
                <div className="mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Why shortlisted:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{item.shortlist_reason}</p>
                </div>
            )}

            {item.estimated_test_cost && (
                <div className="mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Estimated test cost:</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        ${item.estimated_test_cost}
                    </p>
                </div>
            )}

            {item.risk_level && (
                <div className="mb-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.risk_level === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            item.risk_level === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                        Risk: {item.risk_level}
                    </span>
                </div>
            )}

            {status === 'watching' && (
                <div className="flex gap-2">
                    <Button
                        onClick={onMarkReady}
                        variant="outline"
                        className="flex-1 h-10 text-sm"
                    >
                        Mark Ready
                    </Button>
                    <Button
                        onClick={onReject}
                        variant="outline"
                        className="h-10 px-3 border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {status === 'ready' && (
                <div className="flex gap-2">
                    <Button
                        onClick={onMoveToTests}
                        className="flex-1 h-10 text-sm bg-green-500 hover:bg-green-600"
                    >
                        Start Testing
                    </Button>
                    <Button
                        onClick={onReject}
                        variant="outline"
                        className="h-10 px-3 border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {status === 'rejected' && (
                <div className="text-center py-2">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">
                        Money saved: ${item.estimated_test_cost || 0}
                    </p>
                </div>
            )}
        </div>
    );
}
