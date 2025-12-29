"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Loader2, TrendingUp, Package, Star } from 'lucide-react';
import { Button } from '@/components/ui';
import ProductCard from '@/components/ProductCard';
import ProfitCalculatorModal from '@/components/ProfitCalculatorModal';

export default function DashboardPage() {
    const { user } = useAuth();
    const [keyword, setKeyword] = useState('');
    const [platform, setPlatform] = useState('amazon');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [jobId, setJobId] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCalculator, setShowCalculator] = useState(false);
    const [error, setError] = useState('');
    const [planLimits, setPlanLimits] = useState(null);

    // Check plan limits on mount
    useEffect(() => {
        if (user) {
            checkPlanLimits();
        }
    }, [user]);

    const checkPlanLimits = async () => {
        try {
            const res = await fetch(`/api/plan-limits?userId=${user.id}`);
            const data = await res.json();
            setPlanLimits(data);
        } catch (error) {
            console.error('Plan limits error:', error);
        }
    };

    // Clear results when platform changes
    const handlePlatformChange = (newPlatform) => {
        setPlatform(newPlatform);
        setProducts([]);
        setKeyword('');
        setError('');
        setJobId(null);
    };

    // Poll for job status
    useEffect(() => {
        if (!jobId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/status/${jobId}`);
                const data = await res.json();

                if (data.status === 'completed') {
                    setProducts(data.products);
                    setLoading(false);
                    setJobId(null);
                } else if (data.status === 'failed') {
                    setError('Search failed: ' + (data.error_message || 'Unknown error'));
                    setLoading(false);
                    setJobId(null);
                }
            } catch (error) {
                console.error('Status check error:', error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [jobId]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        // Check if user can search
        if (planLimits && !planLimits.usage.canSearch) {
            setError(`You've used all ${planLimits.limits.searchesPerMonth} free searches this month. Upgrade to continue!`);
            return;
        }

        setLoading(true);
        setProducts([]);
        setError('');

        try {
            const res = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyword: keyword.trim(),
                    userId: user.id,
                    platform: platform,
                }),
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.status === 'cached') {
                // Cached results - show immediately
                setProducts(data.products);
                setLoading(false);
            } else if (data.status === 'pending') {
                // Start polling
                setJobId(data.job_id);
            }
        } catch (error) {
            console.error('Search error:', error);
            setError(error.message || 'Search failed. Please try again.');
            setLoading(false);
        }
    };

    const handleCalculateProfit = (product) => {
        setSelectedProduct(product);
        setShowCalculator(true);
    };

    // Stats
    const totalProducts = products.length;
    const avgPrice = products.length > 0
        ? (products.reduce((acc, p) => acc + (p.price || 0), 0) / products.length).toFixed(2)
        : 0;
    const highOpportunity = products.filter(p => (p.review_count || 0) < 50).length;

    return (
        <div className="space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-forest-900 dark:text-white mb-2">
                    Find Winning Products
                </h1>
                <p className="text-forest-600 dark:text-forest-400">
                    Search Amazon for trending products and analyze profit potential
                </p>
            </div>

            {/* Platform Selector */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Platform
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setPlatform('amazon')}
                        className={`p-4 rounded-xl border-2 transition-all ${platform === 'amazon'
                            ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20'
                            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-forest-900/40'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">🛒</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-900 dark:text-white">Amazon</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Global marketplace</div>
                            </div>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPlatform('ebay')}
                        className={`p-4 rounded-xl border-2 transition-all ${platform === 'ebay'
                            ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20'
                            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-forest-900/40'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">🏷️</div>
                            <div className="text-left">
                                <div className="font-bold text-gray-900 dark:text-white">eBay</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">190+ countries</div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search for products (e.g., winter boots, laptop stand...)"
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-forest-900 border border-gray-300 dark:border-forest-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-lime-500 focus:border-transparent text-lg"
                        disabled={loading}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={loading || !keyword.trim()}
                    className="px-8 py-4 text-lg shadow-lg shadow-lime-500/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Searching...
                        </>
                    ) : (
                        'Search'
                    )}
                </Button>
            </form>

            {/* Loading Message */}
            {loading && (
                <div className="text-center p-6 bg-lime-50 dark:bg-lime-900/20 rounded-xl border border-lime-200 dark:border-lime-800">
                    <Loader2 className="w-8 h-8 text-lime-600 dark:text-lime-400 mx-auto mb-3 animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        🔍 Scraping {platform === 'ebay' ? 'eBay' : 'Amazon'}... This takes about 20 seconds
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Results will be cached for 48 hours for instant access
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Stats */}
            {products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-lime-100 dark:bg-lime-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-lime-600 dark:text-lime-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">${avgPrice}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Price</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{highOpportunity}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Opportunities</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {products.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Found {products.length} Products
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onCalculateProfit={() => handleCalculateProfit(product)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && !error && (
                <div className="text-center py-20 bg-white dark:bg-forest-900/20 rounded-2xl border border-gray-200 dark:border-forest-800">
                    <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Search for products to get started
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-4">
                        Try searching for "wireless earbuds", "yoga mat", or "phone case"
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {['laptop stand', 'wireless earbuds', 'yoga mat', 'phone case'].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => setKeyword(suggestion)}
                                className="px-4 py-2 bg-gray-100 dark:bg-forest-800 hover:bg-lime-100 dark:hover:bg-lime-900/30 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Profit Calculator Modal */}
            <ProfitCalculatorModal
                isOpen={showCalculator}
                onClose={() => setShowCalculator(false)}
                product={selectedProduct}
            />
        </div>
    );
}
