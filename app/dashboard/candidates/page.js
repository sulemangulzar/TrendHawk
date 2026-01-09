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
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, type: 'decision' }); // type can be 'decision' or 'product'

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

    const deleteProductCompletely = async (productId) => {
        try {
            const res = await fetch(`/api/products/${productId}?userId=${user.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                // If it was in candidates, remove those too
                setCandidates(prev => prev.filter(c => c.product?.id !== productId));
                showToast('Product deleted permanently', 'success');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to delete product', 'error');
            }
        } catch (error) {
            console.error('Hard delete error:', error);
            showToast('Error deleting product', 'error');
        } finally {
            setConfirmDelete({ isOpen: false, id: null, type: 'decision' });
        }
    };

    const confirmAction = async () => {
        if (confirmDelete.type === 'product') {
            await deleteProductCompletely(confirmDelete.id);
            return;
        }

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
                title={confirmDelete.type === 'product' ? "Delete Product Forever?" : "Remove Candidate?"}
                message={confirmDelete.type === 'product'
                    ? "This will permanently delete this product and all its analysis from TrendHawk. This cannot be undone."
                    : "This will remove this product from your test list. You can always re-analyze and save it again."}
                confirmText={confirmDelete.type === 'product' ? "Delete Forever" : "Remove"}
                onConfirm={confirmAction}
                onCancel={() => setConfirmDelete({ isOpen: false, id: null, type: 'decision' })}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 flex items-center gap-4">
                        <span className="p-3 bg-amber-500/10 rounded-2xl">🏆</span>
                        Winning Candidates
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                        Final shortlist of high-potential products ready for launch.
                    </p>
                </div>
                <Link href="/dashboard/proof" className="w-full md:w-auto flex justify-center md:justify-end">
                    <Button variant="premium" className="h-14 w-full md:w-auto md:px-8 shadow-xl shadow-indigo-500/20 text-lg">
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
                        color: 'text-indigo-600 dark:text-indigo-400'
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
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
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
                        <Link href="/dashboard/proof">
                            <Button variant="premium" className="px-12 h-16 text-xl rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform">
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
                            onRemove={(id) => setConfirmDelete({ isOpen: true, id, type: 'decision' })}
                            onHardDelete={(id) => setConfirmDelete({ isOpen: true, id, type: 'product' })}
                            handleStatusUpdate={handleStatusUpdate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function CandidateCard({ candidate, onRemove, onHardDelete, handleStatusUpdate }) {
    const product = candidate.product;
    if (!product) return null;

    const isWinner = candidate.decision_status === 'winner';
    const isFailure = candidate.decision_status === 'failure';

    return (
        <div className={`bg-white dark:bg-forest-900/40 border rounded-3xl overflow-hidden transition-all duration-300 ${isWinner ? 'border-green-500 shadow-xl shadow-green-500/10 ring-2 ring-green-500/20' :
            isFailure ? 'border-red-500/50 shadow-lg shadow-red-500/5 opacity-60' :
                'border-gray-200 dark:border-forest-800 hover:shadow-2xl hover:border-indigo-500/30 shadow-md'
            }`}>

            {/* Header Section */}
            <div className="p-6 md:p-8 pb-0">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
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

                {/* Profit Calculator Section */}
                <div className="mb-8">
                    <CandidateCalculator product={product} />
                </div>

            </div>

            {/* Footer Action Bar */}
            <div className="bg-gray-50/80 dark:bg-forest-800/30 border-t border-gray-200 dark:border-forest-700 p-4 md:p-6">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch justify-center">
                    {/* Primary Actions Group */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-1">
                        <Link href={`/dashboard/product/${product.id}`} className="flex-1">
                            <button className="w-full h-12 px-6 bg-white dark:bg-forest-900 border-2 border-gray-300 dark:border-forest-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all flex items-center justify-center gap-2 group">
                                <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
                                Analysis
                            </button>
                        </Link>

                        <Link href={`/dashboard/simulator?productId=${product.id}`} className="flex-1">
                            <button className="w-full h-12 px-6 bg-white dark:bg-forest-900 border-2 border-gray-300 dark:border-forest-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all flex items-center justify-center gap-2 group">
                                <span className="text-lg group-hover:scale-110 transition-transform">🎮</span>
                                Simulate
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
                                console.log('[DEBUG] CLICK HARD DELETE - Product ID:', product.id);
                                onHardDelete(product.id);
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-forest-900 border-2 border-gray-300 dark:border-forest-700 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 rounded-xl transition-all group"
                            title="Delete Product Forever"
                        >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 group-hover:fill-red-500/10 transition-all" />
                        </button>

                        <button
                            onClick={() => {
                                console.log('[DEBUG] CLICK REMOVE - Candidate ID:', candidate.id);
                                onRemove(candidate.id);
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-white dark:bg-forest-900 border-2 border-gray-300 dark:border-forest-700 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 rounded-xl transition-all group"
                            title="Remove from Candidates"
                        >
                            <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CandidateCalculator({ product }) {
    const [expenses, setExpenses] = useState({
        sourcing: product.estimated_cost || 0,
        shipping: product.estimated_shipping || 0,
        feePercent: 15,
        marketing: 5,
        others: []
    });
    const [showNamePopup, setShowNamePopup] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');

    const addExpense = () => {
        setShowNamePopup(true);
        setNewFieldName('');
    };

    const confirmAddExpense = () => {
        if (newFieldName.trim()) {
            setExpenses(prev => ({
                ...prev,
                others: [...prev.others, { name: newFieldName.trim(), value: 0 }]
            }));
            setShowNamePopup(false);
            setNewFieldName('');
        }
    };

    const updateOther = (index, field, value) => {
        const newOthers = [...expenses.others];
        if (field === 'value') {
            newOthers[index].value = parseFloat(value) || 0;
        } else if (field === 'name') {
            newOthers[index].name = value;
        }
        setExpenses(prev => ({ ...prev, others: newOthers }));
    };

    const salePrice = product.price || 0;
    const feeValue = (salePrice * expenses.feePercent) / 100;
    const totalOthers = expenses.others.reduce((sum, e) => sum + e.value, 0);
    const totalExpenses = parseFloat(expenses.sourcing) + parseFloat(expenses.shipping) + feeValue + parseFloat(expenses.marketing) + totalOthers;
    const netProfit = salePrice - totalExpenses;
    const margin = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;

    const isWinner = netProfit > 15 && margin > 25;

    return (
        <div className="bg-gray-50 dark:bg-forest-950/40 rounded-[2rem] p-6 border border-gray-200 dark:border-forest-800">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-lg">🧮</span> Personal Profit Calculator
                </h4>
                {isWinner && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce">
                        🏆 WINNING PRODUCT DETECTED
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    <CalcInput
                        label="Sourcing Cost (COGS)"
                        value={expenses.sourcing}
                        onChange={(v) => setExpenses(prev => ({ ...prev, sourcing: v }))}
                    />
                    <CalcInput
                        label="Delivery / Logistics"
                        value={expenses.shipping}
                        onChange={(v) => setExpenses(prev => ({ ...prev, shipping: v }))}
                    />
                </div>

                <div className="space-y-4">
                    <CalcInput
                        label="Platform Fee (%)"
                        value={expenses.feePercent}
                        onChange={(v) => setExpenses(prev => ({ ...prev, feePercent: v }))}
                        suffix="%"
                    />
                    <CalcInput
                        label="Marketing / Ads"
                        value={expenses.marketing}
                        onChange={(v) => setExpenses(prev => ({ ...prev, marketing: v }))}
                    />
                </div>

                <div className="bg-white dark:bg-forest-900 border border-gray-200 dark:border-forest-700 rounded-2xl p-5 flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Net Profit</span>
                        <span className={`text-3xl font-black ${netProfit > 10 ? 'text-emerald-500' : netProfit > 0 ? 'text-indigo-500' : 'text-red-500'}`}>
                            ${netProfit.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                        <span>Profit Margin</span>
                        <span className={margin > 20 ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}>
                            {margin.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            {expenses.others.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {expenses.others.map((exp, i) => (
                        <CalcInput
                            key={i}
                            label={exp.name}
                            value={exp.value}
                            onChange={(v) => updateOther(i, 'value', v)}
                        />
                    ))}
                </div>
            )}

            <button
                onClick={addExpense}
                className="mt-6 text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
                ➕ Add extra expense bar
            </button>

            {/* Custom Field Name Popup */}
            {showNamePopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-forest-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                            Name Your Expense Field
                        </h3>
                        <input
                            type="text"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && confirmAddExpense()}
                            placeholder="e.g., Packaging, Insurance, etc."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-forest-950 border-2 border-gray-200 dark:border-forest-800 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowNamePopup(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-forest-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-forest-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAddExpense}
                                disabled={!newFieldName.trim()}
                                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Field
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CalcInput({ label, value, onChange, suffix = "$" }) {
    return (
        <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    {suffix === "$" ? "$" : ""}
                </span>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-8 pr-10 py-2.5 bg-white dark:bg-forest-900 border border-gray-200 dark:border-forest-800 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    {suffix === "%" ? "%" : ""}
                </span>
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
