"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui';

export default function LiveTestsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTest, setEditingTest] = useState(null);

    useEffect(() => {
        if (user) {
            fetchLiveTests();
        }
    }, [user]);

    const fetchLiveTests = async () => {
        try {
            const res = await fetch(`/api/live-tests?userId=${user.id}`);
            const data = await res.json();

            if (data.success) {
                setTests(data.tests || []);
            }
        } catch (error) {
            console.error('Error fetching live tests:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTest = async (testId, updates) => {
        try {
            const res = await fetch('/api/live-tests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testId,
                    userId: user.id,
                    ...updates
                })
            });

            if (res.ok) {
                showToast('Test updated', 'success');
                fetchLiveTests();
                setEditingTest(null);
            }
        } catch (error) {
            showToast('Error updating test', 'error');
        }
    };

    const killTest = async (testId) => {
        if (!confirm('Kill this test? This will mark it as failed and update your stats.')) return;
        await updateTest(testId, { status: 'killed' });
    };

    const pauseTest = async (testId) => {
        await updateTest(testId, { status: 'paused' });
    };

    const scaleTest = async (testId) => {
        if (!confirm('Mark this test as scaled? This indicates a successful product.')) return;
        await updateTest(testId, { status: 'scaled' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const activeTests = tests.filter(t => t.status === 'active');
    const pausedTests = tests.filter(t => t.status === 'paused');
    const completedTests = tests.filter(t => ['killed', 'scaled'].includes(t.status));

    return (
        <div className="space-y-8 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                    Live Tests
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Track active tests and get scale/kill recommendations
                </p>
            </div>

            {/* Active Tests */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-indigo-500" />
                    Active Tests ({activeTests.length})
                </h2>
                {activeTests.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-forest-900/20 rounded-2xl border border-gray-200 dark:border-forest-800">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No active tests</p>
                        <p className="text-sm text-gray-500">Move products from Shortlist to start testing</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeTests.map(test => (
                            <LiveTestCard
                                key={test.id}
                                test={test}
                                onKill={() => killTest(test.id)}
                                onPause={() => pauseTest(test.id)}
                                onScale={() => scaleTest(test.id)}
                                onUpdate={(updates) => updateTest(test.id, updates)}
                                isEditing={editingTest === test.id}
                                setEditing={setEditingTest}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Paused Tests */}
            {pausedTests.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Paused Tests ({pausedTests.length})
                    </h2>
                    <div className="space-y-4">
                        {pausedTests.map(test => (
                            <div key={test.id} className="bg-gray-100 dark:bg-forest-900/20 rounded-xl p-4 opacity-60">
                                <p className="font-bold text-gray-900 dark:text-white">{test.product_name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Paused on day {test.days_live}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Tests */}
            {completedTests.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Completed Tests ({completedTests.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completedTests.map(test => (
                            <div
                                key={test.id}
                                className={`rounded-xl p-4 ${test.status === 'scaled'
                                        ? 'bg-green-100 dark:bg-green-900/20 border-2 border-green-500'
                                        : 'bg-red-100 dark:bg-red-900/20 border-2 border-red-500'
                                    }`}
                            >
                                <p className="font-bold text-gray-900 dark:text-white mb-1">{test.product_name}</p>
                                <p className={`text-sm font-bold ${test.status === 'scaled' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {test.status === 'scaled' ? '✅ SCALED' : '❌ KILLED'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function LiveTestCard({ test, onKill, onPause, onScale, onUpdate, isEditing, setEditing }) {
    const [moneySpent, setMoneySpent] = useState(test.money_spent);
    const [salesCount, setSalesCount] = useState(test.sales_count);

    const getRecommendationColor = (rec) => {
        if (rec === 'kill') return 'text-red-600 dark:text-red-400';
        if (rec === 'scale') return 'text-green-600 dark:text-green-400';
        if (rec === 'pause') return 'text-amber-600 dark:text-amber-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const getRecommendationBg = (rec) => {
        if (rec === 'kill') return 'bg-red-50 dark:bg-red-900/20 border-red-500';
        if (rec === 'scale') return 'bg-green-50 dark:bg-green-900/20 border-green-500';
        if (rec === 'pause') return 'bg-amber-50 dark:bg-amber-900/20 border-amber-500';
        return 'bg-gray-50 dark:bg-forest-900/20 border-gray-500';
    };

    return (
        <div className={`border-2 ${getRecommendationBg(test.recommendation)} rounded-2xl p-6`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                        {test.product_name}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Days Live</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {test.days_live}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Money Spent</p>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={moneySpent}
                                    onChange={(e) => setMoneySpent(parseFloat(e.target.value))}
                                    className="w-full px-2 py-1 border rounded text-lg font-bold"
                                />
                            ) : (
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    {test.money_spent}
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sales Made</p>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={salesCount}
                                    onChange={(e) => setSalesCount(parseInt(e.target.value))}
                                    className="w-full px-2 py-1 border rounded text-lg font-bold"
                                />
                            ) : (
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {test.sales_count}
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Break-even</p>
                            <p className={`text-2xl font-bold ${test.break_even ? 'text-green-600' : 'text-red-600'}`}>
                                {test.break_even ? '✅' : '❌'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendation */}
            <div className={`p-4 rounded-xl mb-6 ${getRecommendationBg(test.recommendation)}`}>
                <p className={`text-lg font-black uppercase ${getRecommendationColor(test.recommendation)} mb-1`}>
                    {test.recommendation === 'kill' && '🔴 RECOMMENDATION: KILL'}
                    {test.recommendation === 'scale' && '🟢 RECOMMENDATION: SCALE'}
                    {test.recommendation === 'pause' && '🟡 RECOMMENDATION: PAUSE'}
                    {test.recommendation === 'continue' && '⚪ CONTINUE MONITORING'}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    {test.recommendation_reason}
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                {isEditing ? (
                    <>
                        <Button
                            onClick={() => {
                                onUpdate({ moneySpent, salesCount });
                            }}
                            className="flex-1 h-12"
                        >
                            Save Changes
                        </Button>
                        <Button
                            onClick={() => setEditing(null)}
                            variant="outline"
                            className="flex-1 h-12"
                        >
                            Cancel
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            onClick={() => setEditing(test.id)}
                            variant="outline"
                            className="flex-1 h-12"
                        >
                            Update Stats
                        </Button>
                        <Button
                            onClick={onKill}
                            className="flex-1 h-12 bg-red-500 hover:bg-red-600"
                        >
                            Kill Test
                        </Button>
                        <Button
                            onClick={onPause}
                            variant="outline"
                            className="flex-1 h-12 border-amber-500 text-amber-600"
                        >
                            Pause
                        </Button>
                        <Button
                            onClick={onScale}
                            className="flex-1 h-12 bg-green-500 hover:bg-green-600"
                        >
                            Mark as Scaled
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
