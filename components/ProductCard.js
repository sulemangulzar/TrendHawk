"use client";
import { useState, useEffect } from 'react';
import { ExternalLink, Calculator, TrendingUp, TrendingDown, Minus, Star, Heart } from 'lucide-react';
import { Button } from './ui';
import { useAuth } from '@/context/AuthContext';

export default function ProductCard({ product, onCalculateProfit, userPlan = 'free' }) {
    const { user } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const canAccessSuppliers = userPlan !== 'free';

    // Check if product is favorited on mount
    useEffect(() => {
        if (user && product.id) {
            checkIfFavorited();
        }
    }, [user, product.id]);

    const checkIfFavorited = async () => {
        try {
            const res = await fetch(`/api/favorites?userId=${user.id}`);
            const data = await res.json();
            const favorites = data.favorites || [];
            const isFav = favorites.some(fav => fav.products?.id === product.id);
            setIsFavorited(isFav);
        } catch (error) {
            console.error('Check favorite error:', error);
        }
    };

    // Determine saturation level based on review count
    const getSaturationBadge = (reviewCount) => {
        if (reviewCount > 500) {
            return {
                label: 'High Competition',
                color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800',
                icon: TrendingDown,
            };
        } else if (reviewCount < 50) {
            return {
                label: 'Opportunity',
                color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800',
                icon: Zap,
            };
        } else {
            return {
                label: 'Moderate',
                color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800',
                icon: Minus,
            };
        }
    };

    const saturation = getSaturationBadge(product.review_count || 0);
    const SaturationIcon = saturation.icon;

    const toggleFavorite = async () => {
        if (!user) return;

        setFavoriteLoading(true);
        try {
            if (isFavorited) {
                // Remove from favorites
                await fetch('/api/favorites', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        productId: product.id,
                    }),
                });
                setIsFavorited(false);
            } else {
                // Add to favorites
                await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        productId: product.id,
                    }),
                });
                setIsFavorited(true);
            }
        } catch (error) {
            console.error('Favorite error:', error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleFindSupplier = () => {
        const searchQuery = encodeURIComponent(product.title);
        // Search on Alibaba with filters: verified suppliers, 4+ star reviews
        const alibaba = `https://www.alibaba.com/trade/search?SearchText=${searchQuery}&spm=a2700.galleryofferlist.0.0.&CatId=&fsb=y&IndexArea=product_en&assessmentCompany=true&ta=y&minRating=4`;
        window.open(alibaba, '_blank');
    };

    return (
        <div className="bg-white dark:bg-forest-900/40 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group flex flex-col h-full ring-1 ring-gray-100 dark:ring-white/5">
            {/* Header / Badges */}
            <div className="relative pt-4 px-4 bg-gray-50/50 dark:bg-forest-800/20">
                <div className="flex items-center justify-between gap-3 min-h-[40px]">
                    {/* Favorite Button */}
                    <button
                        onClick={toggleFavorite}
                        disabled={favoriteLoading || !user}
                        className="p-2 bg-white/90 dark:bg-forest-950/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform disabled:opacity-50 border border-gray-100 dark:border-forest-700"
                        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Heart
                            className={`w-5 h-5 transition-colors ${isFavorited
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400 dark:text-forest-400'
                                }`}
                        />
                    </button>

                    {/* Saturation Badge */}
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${saturation.color}`}>
                        <SaturationIcon className="w-3 h-3" />
                        {saturation.label}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[40px]">
                    {product.title}
                </h3>

                {/* Price */}
                <div className="mb-3">
                    <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                        ${product.price ? product.price.toFixed(2) : 'N/A'}
                    </span>
                </div>

                {/* Reviews & Rating */}
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {product.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{product.rating}</span>
                        </div>
                    )}
                    {product.review_count > 0 && (
                        <span>({product.review_count.toLocaleString()} reviews)</span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mt-auto">
                    {/* View Product Button - Most Important */}
                    {product.product_url && (
                        <a
                            href={product.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <Button
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2 border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-500"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View on {product.source === 'ebay' ? 'eBay' : 'Amazon'}
                            </Button>
                        </a>
                    )}

                    {canAccessSuppliers ? (
                        <Button
                            onClick={handleFindSupplier}
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Find Supplier
                        </Button>
                    ) : (
                        <a href="/pricing" className="block">
                            <div className="w-full p-3 rounded-xl border-2 border-dashed border-indigo-500/50 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/10 dark:to-indigo-800/10 hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-900/20 dark:hover:to-indigo-800/20 transition-all cursor-pointer group">
                                <div className="flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-400">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                    </svg>
                                    <span className="font-semibold text-sm">Unlock Suppliers</span>
                                    <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold group-hover:scale-110 transition-transform">
                                        PRO
                                    </span>
                                </div>
                            </div>
                        </a>
                    )}

                    <Button
                        onClick={() => onCalculateProfit && onCalculateProfit(product)}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-4 h-4" />
                        Calculate Profit
                    </Button>
                </div>
            </div>
        </div>
    );
}
