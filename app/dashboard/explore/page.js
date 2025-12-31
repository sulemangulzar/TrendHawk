"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

export default function ExplorePage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, test, careful, skip
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/dashboard/recent?userId=${user.id}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Fetch products error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesFilter = filter === 'all' || product.verdict === filter;
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    🔍 Explore Products
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Browse pre-analyzed products and learn from the data
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-forest-900 border border-gray-300 dark:border-forest-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'test', 'careful', 'skip'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-3 rounded-xl font-medium transition-all ${filter === f
                                    ? 'bg-lime-500 text-white shadow-lg'
                                    : 'bg-gray-100 dark:bg-forest-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-forest-700'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === 'test' ? '✅ Test' : f === 'careful' ? '⚠ Careful' : '❌ Skip'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-forest-900/20 rounded-2xl border border-gray-200 dark:border-forest-800">
                    <p className="text-gray-600 dark:text-gray-400">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                        <ProductExploreCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ProductExploreCard({ product }) {
    const verdictConfig = {
        test: { badge: '✅ Test', color: 'border-green-500 bg-green-50 dark:bg-green-900/20' },
        careful: { badge: '⚠ Careful', color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
        skip: { badge: '❌ Skip', color: 'border-red-500 bg-red-50 dark:bg-red-900/20' }
    };

    const config = verdictConfig[product.verdict] || verdictConfig.test;

    return (
        <Link href={`/dashboard/product/${product.id}`}>
            <div className={`border-2 ${config.color} rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer`}>
                {product.image_url && (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-48 object-contain mb-4 rounded-lg"
                    />
                )}
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {product.title}
                </h3>
                <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-lime-600 dark:text-lime-400">
                        ${product.price}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {product.source}
                    </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.demand_level === 'high' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            product.demand_level === 'medium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        Demand: {product.demand_level}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.risk_level === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            product.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        Risk: {product.risk_level}
                    </span>
                </div>
                <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-gray-900 dark:text-white">{config.badge}</span>
                </div>
            </div>
        </Link>
    );
}
