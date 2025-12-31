"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Star, Trash2, ExternalLink, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function TestCandidatesPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

    useEffect(() => {
        if (user) {
            fetchCandidates();
        }
    }, [user]);

    const fetchCandidates = async () => {
        try {
            const res = await fetch(`/api/decisions?userId=${user.id}&decision=saved`);
            const data = await res.json();
            console.log('[DEBUG] Fetched Decisions:', data.decisions?.map(d => ({ id: d.id, title: d.product?.title })));
            setCandidates(data.decisions || []);
        } catch (error) {
            console.error('Fetch candidates error:', error);
            showToast('Failed to load candidates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (decisionId, status) => {
        if (!decisionId || decisionId === 'undefined') {
            console.error('[DEBUG] handleStatusUpdate failed: invalid decisionId', decisionId);
            showToast('Invalid ID for status update', 'error');
            return;
        }

        try {
            const res = await fetch(`/api/decisions/${decisionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, userId: user.id })
            });
            const data = await res.json();

            if (res.ok) {
                // Optimistic update
                setCandidates(prev => prev.map(c =>
                    c.id === decisionId ? { ...c, decision_status: status } : c
                ));
                showToast(`Marked as ${status === 'winner' ? '🏆 Winner' : status === 'failure' ? '💀 Failure' : 'Saved'}`, 'success');
            } else {
                showToast(data.error || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Update status error:', error);
            showToast('Error updating status', 'error');
        }
    };

    const removeCandidate = async () => {
        const decisionId = confirmDelete.id;
        console.log('[DEBUG] CONFIRM DELETE ID:', decisionId);

        if (!decisionId || decisionId === 'undefined') {
            console.error('[DEBUG] CRITICAL: Attempted to delete with invalid ID:', decisionId);
            showToast('Invalid Decision ID', 'error');
            setConfirmDelete({ isOpen: false, id: null });
            return;
        }

        setConfirmDelete({ isOpen: false, id: null });

        try {
            console.log(`[DEBUG] DELETE Request: /api/decisions/${decisionId}?userId=${user.id}`);
            const res = await fetch(`/api/decisions/${decisionId}?userId=${user.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (res.ok) {
                setCandidates(prev => prev.filter(c => c.id !== decisionId));
                showToast('Removed from candidates', 'success');
            } else {
                console.error('[DEBUG] DELETE Failed:', data);
                showToast(data.error || 'Failed to remove candidate', 'error');
            }
        } catch (error) {
            console.error('Remove candidate error:', error);
            showToast('Error removing candidate', 'error');
        }
    };

    return (
        <div className="space-y-6 font-poppins max-w-7xl mx-auto pb-20">
            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                title="Remove Candidate?"
                message="This will permanently remove this product from your test list. You can always re-analyze and save it again."
                confirmText="Remove"
                onConfirm={removeCandidate}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3 justify-center md:justify-start">
                        <span className="text-4xl">⭐</span>
                        Test Candidates
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Your high-potential products - time to start testing!
                    </p>
                </div>
                <Link href="/dashboard/analyze" className="w-full md:w-auto flex justify-center md:justify-end">
                    <Button variant="premium" className="h-14 w-full md:w-auto md:px-8 shadow-xl shadow-lime-500/20 text-lg">
                        <Search className="w-5 h-5 mr-2" />
                        Analyze More
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Candidates', value: candidates.length, color: 'text-gray-900 dark:text-white' },
                    { label: 'Winners Tracked', value: candidates.filter(c => c.decision_status === 'winner').length, color: 'text-green-600 dark:text-green-400' },
                    {
                        label: 'Avg Profit Potential',
                        value: `$${candidates.length > 0 ? Math.round(candidates.reduce((sum, c) => sum + (c.product?.profit_average_case || 0), 0) / candidates.length) : 0}`,
                        color: 'text-lime-600 dark:text-lime-400'
                    }
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-forest-900/40 border border-gray-100 dark:border-forest-800 rounded-3xl p-6 shadow-sm text-center">
                        <p className="text-xs uppercase font-black text-gray-400 tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Candidates List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full"></div>
                </div>
            ) : candidates.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-forest-900/20 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-forest-800">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-forest-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
                        Your list is empty
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-sm mx-auto font-medium">
                        Found a great product? Analyze it and save it here to track your testing process.
                    </p>
                    <div className="flex justify-center mt-10">
                        <Link href="/dashboard/analyze">
                            <Button variant="premium" className="px-12 h-16 text-xl rounded-2xl shadow-xl shadow-lime-500/20 hover:scale-105 transition-transform">
                                <span className="text-3xl mr-3">⚡</span>
                                Start Researching
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {candidates.map((candidate) => (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            onRemove={(id) => setConfirmDelete({ isOpen: true, id })}
                            handleStatusUpdate={handleStatusUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CandidateCard({ candidate, onRemove, handleStatusUpdate }) {
    const product = candidate.product;
    if (!product) return null;

    const isWinner = candidate.decision_status === 'winner';
    const isFailure = candidate.decision_status === 'failure';

    return (
        <div className={`bg-white dark:bg-forest-900/40 border rounded-3xl overflow-hidden transition-all duration-300 ${isWinner ? 'border-green-500 shadow-xl shadow-green-500/10 ring-2 ring-green-500/20' :
            isFailure ? 'border-red-500/50 shadow-lg shadow-red-500/5 opacity-60' :
                'border-gray-200 dark:border-forest-800 hover:shadow-2xl hover:border-lime-500/30 shadow-md'
            }`}>

            {/* Header Section */}
            <div className="p-6 md:p-8 pb-0">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Product Image */}
                    {product.image_url && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-forest-800 dark:to-forest-900 rounded-2xl p-4 w-full md:w-32 h-32 flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-forest-700 overflow-hidden group">
                            <img
                                src={product.image_url}
                                alt={product.title}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    )}

                    {/* Title and Badges */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3 line-clamp-2" title={product.title}>
                            {product.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <VerdictBadge verdict={product.verdict} />
                            <RiskBadge risk={product.risk_level} />
                            {isWinner && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-lg shadow-green-500/30 animate-pulse">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> WINNER
                                </span>
                            )}
                            {isFailure && (
                                <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/30">
                                    <XCircle className="w-3.5 h-3.5" /> FAILED
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profit Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-forest-800/50 dark:to-forest-900/30 rounded-xl p-4 border border-gray-200/50 dark:border-forest-700/50">
                        <p className="text-[10px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider mb-1.5">Price</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">${product.price}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-900/10 rounded-xl p-4 border border-red-200/50 dark:border-red-800/50">
                        <p className="text-[10px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider mb-1.5">Worst</p>
                        <p className={`text-2xl font-black ${product.profit_worst_case < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            ${product.profit_worst_case}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-lime-50 to-lime-100/50 dark:from-lime-900/20 dark:to-lime-900/10 rounded-xl p-4 border border-lime-200/50 dark:border-lime-800/50">
                        <p className="text-[10px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider mb-1.5">Average</p>
                        <p className="text-2xl font-black text-lime-600 dark:text-lime-400">${product.profit_average_case}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
                        <p className="text-[10px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-wider mb-1.5">Best</p>
                        <p className="text-2xl font-black text-green-600 dark:text-green-400">${product.profit_best_case}</p>
                    </div>
                </div>
            </div>

            {/* Footer Action Bar */}
            <div className="bg-gray-50/80 dark:bg-forest-800/30 border-t border-gray-200 dark:border-forest-700 p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch justify-center">
                    {/* Primary Actions Group */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-1">
                        <Link href={`/dashboard/product/${product.id}`} className="flex-1">
                            <button className="w-full h-12 px-6 bg-white dark:bg-forest-900 border-2 border-gray-300 dark:border-forest-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:border-lime-500 hover:bg-lime-50 dark:hover:bg-lime-900/10 transition-all flex items-center justify-center gap-2 group">
                                <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
                                Full Analysis
                            </button>
                        </Link>

                        {product.product_url && (
                            <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <button className="w-full h-12 px-6 bg-white dark:bg-forest-900 border-2 border-gray-300 dark:border-forest-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-2 group">
                                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    View on {product.source === 'amazon' ? 'Amazon' : product.source === 'ebay' ? 'eBay' : 'Store'}
                                </button>
                            </a>
                        )}
                    </div>

                    {/* Status Actions Group */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleStatusUpdate(candidate.id, isWinner ? null : 'winner')}
                            className={`flex-1 lg:w-32 h-12 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isWinner
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/40 scale-105'
                                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105'
                                }`}
                        >
                            <CheckCircle2 className={`w-4 h-4 ${isWinner ? 'animate-bounce' : ''}`} />
                            {isWinner ? 'Winner!' : 'Winner'}
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(candidate.id, isFailure ? null : 'failure')}
                            className={`flex-1 lg:w-32 h-12 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isFailure
                                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/40 scale-105'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-2 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105'
                                }`}
                        >
                            <XCircle className="w-4 h-4" />
                            {isFailure ? 'Failed' : 'Failure'}
                        </button>
                        <button
                            onClick={() => {
                                console.log('[DEBUG] CLICK REMOVE - Candidate ID:', candidate.id);
                                onRemove(candidate.id);
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-forest-900 border-2 border-gray-300 dark:border-forest-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 rounded-xl transition-all group"
                            title="Remove from Candidates"
                        >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VerdictBadge({ verdict }) {
    const configs = {
        test: { label: 'TEST', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
        careful: { label: 'CAREFUL', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
        skip: { label: 'SKIP', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
    };
    const config = configs[verdict] || configs.test;
    return <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border border-current opacity-80 ${config.className}`}>{config.label}</span>;
}

function RiskBadge({ risk }) {
    const configs = {
        low: { label: 'LOW RISK', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
        medium: { label: 'MED RISK', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
        high: { label: 'HIGH RISK', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
    };
    const config = configs[risk] || configs.medium;
    return <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border border-current opacity-80 ${config.className}`}>{config.label}</span>;
}
