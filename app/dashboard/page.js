"use client";
import { useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui';
import { Search, Loader2, TrendingUp, Package, Star, Filter } from 'lucide-react';
import clsx from 'clsx';

const PLATFORMS = [
    { id: 'Amazon', label: 'Amazon', color: 'from-orange-500 to-orange-600' },
    { id: 'AliExpress', label: 'AliExpress', color: 'from-red-500 to-red-600' },
    { id: 'Ebay', label: 'eBay', color: 'from-blue-500 to-blue-600' },
    { id: 'Etsy', label: 'Etsy', color: 'from-orange-600 to-orange-700' },
    { id: 'Daraz', label: 'Daraz', color: 'from-orange-400 to-orange-500' }
];

export default function DashboardPage() {
    const [selectedPlatform, setSelectedPlatform] = useState('Amazon');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        setProducts([]);

        try {
            const { data } = await api.get(`trending/${selectedPlatform}/`);
            setProducts(data.products || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredProducts = products.filter(product =>
        selectedCategory === 'All' || product.category === selectedCategory
    );

    // Stats
    const totalProducts = filteredProducts.length;
    const avgDemand = filteredProducts.length > 0
        ? Math.round(filteredProducts.reduce((acc, p) => acc + (p.analysis?.demand_score || 0), 0) / filteredProducts.length)
        : 0;
    const highPotential = filteredProducts.filter(p => (p.analysis?.demand_score || 0) > 70).length;

    return (
        <div className="space-y-4 md:space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-forest-900 dark:text-white mb-1 md:mb-2">
                    Product Research
                </h1>
                <p className="text-sm md:text-base text-forest-600 dark:text-forest-400">
                    Discover trending products across multiple platforms
                </p>
            </div>

            {/* Platform Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                {PLATFORMS.map((platform) => (
                    <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={clsx(
                            "p-3 md:p-5 rounded-xl md:rounded-2xl border transition-all text-left group relative overflow-hidden",
                            selectedPlatform === platform.id
                                ? "bg-white dark:bg-forest-900 border-lime-500 dark:border-lime-500 shadow-xl shadow-lime-500/10"
                                : "bg-white dark:bg-forest-900/40 border-gray-200 dark:border-forest-800 hover:border-lime-200 dark:hover:border-forest-700"
                        )}
                    >
                        {selectedPlatform === platform.id && (
                            <div className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-lime-500 animate-pulse shadow-[0_0_10px_rgba(132,204,22,0.6)]" />
                        )}
                        <h3 className={clsx(
                            "font-bold text-base md:text-lg transition-colors mb-0.5 md:mb-1",
                            selectedPlatform === platform.id ? "text-forest-900 dark:text-white" : "text-forest-500 dark:text-forest-400"
                        )}>
                            {platform.label}
                        </h3>
                        <p className="text-[10px] md:text-xs text-gray-400 dark:text-forest-500 font-medium">Top Trending</p>
                    </button>
                ))}
            </div>

            {/* Fetch Button */}
            <div className="flex justify-center">
                <Button
                    onClick={fetchProducts}
                    disabled={loading}
                    className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 shadow-lg shadow-lime-500/20 text-sm md:text-base"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                            <span className="hidden sm:inline">Fetching Products...</span>
                            <span className="sm:hidden">Fetching...</span>
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                            <span className="hidden sm:inline">Fetch Trending from {selectedPlatform}</span>
                            <span className="sm:hidden">Fetch from {selectedPlatform}</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-xs md:text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Stats */}
            {products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-lime-100 dark:bg-lime-900/30 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 md:w-6 md:h-6 text-lime-600 dark:text-lime-400" />
                            </div>
                            <div>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{avgDemand}</p>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Avg Demand</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{highPotential}</p>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">High Potential</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            {products.length > 0 && categories.length > 1 && (
                <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={clsx(
                                "px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all",
                                selectedCategory === category
                                    ? "bg-lime-500 text-white shadow-lg shadow-lime-500/20"
                                    : "bg-white dark:bg-forest-900/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-forest-800 hover:border-lime-300"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product, i) => (
                        <ProductCard key={i} product={product} />
                    ))}
                </div>
            ) : !loading && products.length === 0 && (
                <div className="text-center py-12 md:py-20 bg-white dark:bg-forest-900/20 rounded-xl md:rounded-2xl border border-gray-200 dark:border-forest-800">
                    <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Ready to Discover Trends?
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 px-4">
                        Select a platform and click "Fetch Trending" to get started
                    </p>
                </div>
            )}
        </div>
    );
}
