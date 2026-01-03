"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AnalysisResults } from '@/components/AnalysisResults';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';

import { useToast } from '@/context/ToastContext';

export default function AnalyzePage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setError('');
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

            if (!res.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            setResult(data.product);
            showToast('Analysis complete!', 'success');
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCandidate = async () => {
        if (!result) return;

        try {
            const res = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    productId: result.id,
                    decision: 'saved'
                })
            });

            const data = await res.json();

            if (res.ok) {
                showToast('✅ Saved to Test Candidates!', 'success');
            } else {
                showToast(data.error || 'Failed to save to candidates', 'error');
            }
        } catch (err) {
            showToast('Failed to save: ' + err.message, 'error');
        }
    };

    return (
        <div className="space-y-8 font-poppins max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    <span className="text-5xl">⚡</span> Analyze Product
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Get a clear verdict: Should you test this product or skip it?
                </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="bg-white dark:bg-forest-900/40 border-2 border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Enter product name or URL
                    </label>

                    <div className="flex gap-3 mb-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter Product Name or Paste ANY URL (Amazon, eBay, Shopify, etc.)"
                            className="flex-1 px-4 py-4 bg-white dark:bg-forest-900 border border-gray-300 dark:border-forest-700 rounded-xl text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-indigo-500"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-center mt-6">
                        <Button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="w-full md:w-auto min-w-[300px] h-16 text-xl font-bold rounded-2xl shadow-xl shadow-indigo-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                    Analyzing Market Data...
                                </>
                            ) : (
                                <>
                                    <Search className="w-6 h-6 mr-3" />
                                    Analyze Product
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                        We'll analyze demand, risk, profit, and common failure reasons
                    </p>
                </div>
            </form>

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    <AnalysisResults product={result} />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
                        <Button
                            onClick={handleSaveCandidate}
                            className="w-full sm:flex-1 h-16 md:h-14 text-lg font-black shadow-xl shadow-indigo-500/10 rounded-2xl"
                        >
                            <span className="mr-2">⭐</span>
                            Save As Candidate
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full sm:flex-1 h-16 md:h-14 text-lg font-black border-2 border-gray-200 dark:border-forest-800 rounded-2xl"
                            disabled
                        >
                            <span className="mr-2">🔎</span>
                            Deep Scan (Pro)
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
