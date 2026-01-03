"use client";
import { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RiskCheckPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const checkRisk = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const isUrl = input.startsWith('http');
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [isUrl ? 'productUrl' : 'productName']: input.trim(),
                    userId: user.id
                })
            });

            const data = await res.json();

            if (res.ok && data.product) {
                // Simplify the response for Risk Check
                setResult({
                    demand: data.product.demand_level || 'Medium',
                    saturation: data.product.saturation_level || 'Medium',
                    failureReason: data.product.common_failure_reason || 'Price competition',
                    priceRange: `$${data.product.price_min || data.product.price || 20} - $${data.product.price_max || data.product.price || 40}`,
                    productName: data.product.title || input
                });
            } else {
                showToast(data.error || 'Risk check failed', 'error');
            }
        } catch (error) {
            showToast('Error checking risk', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addToShortlist = async () => {
        try {
            const res = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    productName: result.productName,
                    productUrl: input.startsWith('http') ? input : null,
                    platform: 'unknown',
                    decision: 'saved',
                    status: 'watching',
                    shortlistReason: `Demand: ${result.demand}, Saturation: ${result.saturation}`,
                    riskLevel: result.saturation === 'High' ? 'high' : result.saturation === 'Low' ? 'low' : 'medium',
                    estimatedTestCost: 200
                })
            });

            if (res.ok) {
                showToast('Added to Shortlist!', 'success');
            }
        } catch (error) {
            showToast('Error adding to shortlist', 'error');
        }
    };

    return (
        <div className="space-y-8 font-poppins max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                    Risk Check
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Last-line defense before risking money
                </p>
            </div>

            {/* Input Form */}
            <form onSubmit={checkRisk} className="bg-white dark:bg-forest-900/40 border-2 border-gray-200 dark:border-forest-800 rounded-3xl p-8 shadow-lg">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                        Enter product name or URL
                    </label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Product name or paste ANY URL"
                            className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-forest-900 border-2 border-gray-300 dark:border-forest-700 rounded-xl text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            disabled={loading}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-full h-16 text-xl font-black shadow-xl shadow-indigo-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                            Checking Risk...
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-6 h-6 mr-3" />
                            Check Risk
                        </>
                    )}
                </Button>
            </form>

            {/* Results */}
            {result && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-forest-900/40 dark:to-forest-900/20 border-2 border-gray-200 dark:border-forest-800 rounded-3xl p-8 shadow-lg">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                        Risk Assessment
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-gray-200 dark:border-forest-800">
                            <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                                Demand
                            </p>
                            <p className={`text-3xl font-black ${result.demand === 'High' ? 'text-green-600' :
                                    result.demand === 'Low' ? 'text-red-600' :
                                        'text-amber-600'
                                }`}>
                                {result.demand}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-gray-200 dark:border-forest-800">
                            <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                                Saturation
                            </p>
                            <p className={`text-3xl font-black ${result.saturation === 'Low' ? 'text-green-600' :
                                    result.saturation === 'High' ? 'text-red-600' :
                                        'text-amber-600'
                                }`}>
                                {result.saturation}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-gray-200 dark:border-forest-800">
                            <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                                Common Failure Reason
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {result.failureReason}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-forest-900/40 rounded-2xl p-6 border border-gray-200 dark:border-forest-800">
                            <p className="text-xs uppercase font-black text-gray-500 dark:text-gray-400 tracking-widest mb-2">
                                Typical Price Range
                            </p>
                            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {result.priceRange}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={addToShortlist}
                            className="flex-1 h-14 text-lg font-black"
                        >
                            Add to Shortlist
                        </Button>
                        <Button
                            onClick={() => {
                                setInput('');
                                setResult(null);
                            }}
                            variant="outline"
                            className="flex-1 h-14 text-lg font-black"
                        >
                            Run Another Check
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
