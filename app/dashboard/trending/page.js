"use client";
import { useState, useEffect } from 'react';
import { Search, TrendingUp, Sparkles, Filter, ExternalLink, Heart, Calculator, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ProfitCalculatorModal from '@/components/ProfitCalculatorModal';

export default function TrendingPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['All', 'Home & Kitchen', 'Beauty & Personal Care', 'Electronics', 'Fitness', 'Fashion', 'Pets', 'Kids', 'Other']);
    const [verdicts, setVerdicts] = useState(['All', 'Hot', 'Rising', 'Watch']);
    const [sources, setSources] = useState(['All', 'Amazon', 'TikTok']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedVerdict, setSelectedVerdict] = useState('All');
    const [selectedSource, setSelectedSource] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, selectedVerdict, selectedSource, searchQuery]);

    const fetchCategories = async () => {
        // Categories are now defined in state based on specified MVP buckets
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'All') params.append('category', selectedCategory);
            if (selectedVerdict !== 'All') params.append('verdict', selectedVerdict);
            if (selectedSource !== 'All') params.append('source', selectedSource);
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/trending/products?${params}`);
            const data = await res.json();

            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearching(true);
        fetchProducts();
        setTimeout(() => setSearching(false), 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-black dark:to-indigo-950/10">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Trending Products
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Discover what's hot • Updated twice daily at 8 AM & 8 PM
                            </p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search trending products..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                />
                                {searching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Category Filter */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full sm:w-48 pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Source Filter */}
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none">🌐</span>
                            <select
                                value={selectedSource}
                                onChange={(e) => setSelectedSource(e.target.value)}
                                className="w-full sm:w-48 pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
                            >
                                {sources.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading trending products...</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No products found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchQuery ? 'Try a different search term' : 'Check back soon for trending products'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {products.length} trending {products.length === 1 ? 'product' : 'products'}
                                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                                {selectedVerdict !== 'All' && ` • ${selectedVerdict}`}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} onUpdate={fetchProducts} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ProductCard({ product, onUpdate }) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isFavorite, setIsFavorite] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if product is favorited
    useEffect(() => {
        checkFavoriteStatus();
    }, [product.id, user]);

    const checkFavoriteStatus = async () => {
        if (!user) return;

        try {
            const res = await fetch(`/api/decisions?userId=${user.id}&productUrl=${encodeURIComponent(product.product_url)}`);
            const data = await res.json();
            setIsFavorite(data.decisions && data.decisions.length > 0);
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            showToast('Please log in to save to candidates', 'error');
            return;
        }

        setLoading(true);

        try {
            if (isFavorite) {
                // Remove from favorites
                await fetch(`/api/decisions`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, productUrl: product.product_url })
                });
                setIsFavorite(false);
                showToast('Removed from candidates');
            } else {
                // Add to favorites
                const res = await fetch('/api/decisions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        productName: product.name,
                        productUrl: product.product_url,
                        platform: product.source,
                        decision: 'saved',
                        price: product.price
                    })
                });

                if (res.ok) {
                    setIsFavorite(true);
                    showToast('Added to candidates! ✓', 'success');
                } else {
                    const error = await res.json();
                    showToast(`Error: ${error.error || 'Failed to add to candidates'}`, 'error');
                }
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showToast('Failed to update candidates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getVerdictStyle = (verdict) => {
        const styles = {
            'Hot': 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400',
            'Rising': 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400',
            'Watch': 'bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400'
        };
        return styles[verdict] || styles['Watch'];
    };

    const getVerdictEmoji = (verdict) => {
        const emojis = { 'Hot': '🔥', 'Rising': '📈', 'Watch': '👀' };
        return emojis[verdict] || '👀';
    };

    const getSourceIcon = (source) => {
        if (source === 'Amazon') return '🛒';
        if (source === 'TikTok') return '🎵';
        return '🌐';
    };

    return (
        <>
            <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 ring-1 ring-gray-100 dark:ring-white/5">
                {/* Product Content */}
                <div className="p-6">
                    {/* Header: Verdict Badge + Favorite Button */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${getVerdictStyle(product.verdict)}`}>
                                <span className="text-base">{getVerdictEmoji(product.verdict)}</span>
                                {product.verdict}
                            </span>
                            <span className="text-xl">{getSourceIcon(product.source)}</span>
                        </div>

                        <button
                            onClick={toggleFavorite}
                            disabled={loading}
                            className="p-2.5 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110"
                        >
                            <Heart
                                className={`w-5 h-5 transition-all ${isFavorite ? 'fill-red-500 text-red-500 stroke-red-500' : 'fill-none text-white dark:text-gray-200 stroke-current stroke-2'}`}
                            />
                        </button>
                    </div>

                    {/* Trend Score */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Trend Score</span>
                            <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">{product.trend_score}/100</span>
                        </div>
                        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-600 rounded-full transition-all duration-500 shadow-lg shadow-indigo-500/50"
                                style={{ width: `${product.trend_score}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                            </div>
                        </div>
                    </div>

                    {/* Product Name */}
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem] leading-tight">
                            {product.name}
                        </h3>
                        <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"></div>
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            {product.category}
                        </span>
                    </div>

                    {/* Price */}
                    {product.price && (
                        <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-950/20 dark:to-emerald-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-900/30">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Retail Price</div>
                            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                                ${product.price.toFixed(2)}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2.5">
                            <a
                                href={product.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View
                            </a>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowCalculator(true);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105"
                                title="Profit Calculator"
                            >
                                <Calculator className="w-4 h-4" />
                                Profit
                            </button>
                        </div>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                window.open(`https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(product.name)}`, '_blank');
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
                        >
                            <span className="text-base">🏭</span>
                            Find Supplier
                        </button>
                    </div>
                </div>
            </div>

            {/* Profit Calculator Modal */}
            {showCalculator && (
                <ProfitCalculatorModal
                    isOpen={showCalculator}
                    onClose={() => setShowCalculator(false)}
                    product={{
                        title: product.name,
                        name: product.name,
                        url: product.product_url,
                        price: product.price,
                        platform: product.source
                    }}
                />
            )}
        </>
    );
}
