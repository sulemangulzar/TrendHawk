"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import { Search, Filter, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui';

export default function MarketProofPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [selectedRepetition, setSelectedRepetition] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMarketProof();
    }, [selectedPlatform, selectedRepetition]);

    const fetchMarketProof = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedPlatform !== 'All') params.append('source', selectedPlatform);
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/trending/products?${params}`);
            const data = await res.json();

            if (data.success) {
                // Filter by seller repetition if needed
                let filtered = data.products || [];
                if (selectedRepetition !== 'All') {
                    filtered = filtered.filter(p =>
                        p.seller_repetition?.toLowerCase() === selectedRepetition.toLowerCase()
                    );
                }
                setProducts(filtered);
            }
        } catch (error) {
            console.error('Error fetching market proof:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToShortlist = async (product) => {
        if (!user) {
            showToast('Please log in to add to shortlist', 'error');
            return;
        }

        try {
            const res = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    productName: product.name,
                    productUrl: product.product_url,
                    platform: product.source,
                    decision: 'saved',
                    status: 'watching',
                    shortlistReason: `Seller repetition: ${product.seller_repetition || 'Unknown'}`,
                    riskLevel: product.seller_repetition === 'high' ? 'low' : 'medium',
                    estimatedTestCost: 200
                })
            });

            if (res.ok) {
                showToast('Added to Shortlist (Watching)', 'success');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to add to shortlist', 'error');
            }
        } catch (error) {
            showToast('Error adding to shortlist', 'error');
        }
    };

    return (
        <div className="space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-4 pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                    🌎 Global Data Mining
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
                    Market <span className="text-indigo-500">Explorer</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg max-w-2xl">
                    Uncover real sellers and verified product opportunities across global platforms.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchMarketProof()}
                            placeholder="Search products..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-forest-900 border border-gray-300 dark:border-forest-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Platform Filter */}
                    <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="px-4 py-3 bg-gray-50 dark:bg-forest-900 border border-gray-300 dark:border-forest-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option>All</option>
                        <option>Amazon</option>
                        <option>TikTok</option>
                        <option>eBay</option>
                    </select>

                    {/* Seller Repetition Filter */}
                    <select
                        value={selectedRepetition}
                        onChange={(e) => setSelectedRepetition(e.target.value)}
                        className="px-4 py-3 bg-gray-50 dark:bg-forest-900 border border-gray-300 dark:border-forest-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                        <option>All</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-forest-900/20 rounded-2xl border border-gray-200 dark:border-forest-800">
                    <p className="text-gray-600 dark:text-gray-400">No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6 hover:shadow-xl transition-all hover:border-indigo-500/30"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-2">
                                {product.name}
                            </h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{product.source}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Active listings:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        ~{product.active_listings_count || 'Unknown'}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Review growth:</span>
                                    <span className={`font-bold ${product.review_velocity === 'increasing' ? 'text-green-600' :
                                        product.review_velocity === 'declining' ? 'text-red-600' :
                                            'text-gray-600'
                                        }`}>
                                        {product.review_velocity === 'increasing' ? '↗ Increasing' :
                                            product.review_velocity === 'declining' ? '↘ Declining' :
                                                '→ Flat'}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Seller repetition:</span>
                                    <span className={`font-bold ${product.seller_repetition === 'high' ? 'text-green-600' :
                                        product.seller_repetition === 'low' ? 'text-red-600' :
                                            'text-amber-600'
                                        }`}>
                                        {product.seller_repetition || 'Unknown'}
                                    </span>
                                </div>

                                {product.price && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Price range:</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                            ${product.price_min || product.price} - ${product.price_max || product.price}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => addToShortlist(product)}
                                    className="flex-1 h-12 font-bold"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add to Shortlist
                                </Button>
                                {product.product_url && (
                                    <a
                                        href={product.product_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gray-100 dark:bg-forest-800 hover:bg-gray-200 dark:hover:bg-forest-700 rounded-xl transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
