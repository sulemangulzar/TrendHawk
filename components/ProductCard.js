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
                icon: TrendingUp,
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
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
            {/* Image */}
            <div className="relative h-48 bg-gray-100 dark:bg-forest-800 overflow-hidden">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}

                {/* Saturation Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${saturation.color}`}>
                    <SaturationIcon className="w-3 h-3" />
                    {saturation.label}
                </div>

                {/* Favorite Button */}
                <button
                    onClick={toggleFavorite}
                    disabled={favoriteLoading || !user}
                    className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-forest-950/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform disabled:opacity-50"
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <Heart
                        className={`w-5 h-5 transition-colors ${isFavorited
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400 dark:text-forest-400'
                            }`}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[40px]">
                    {product.title}
                </h3>

                {/* Price */}
                <div className="mb-3">
                    <span className="text-3xl font-black text-lime-600 dark:text-lime-400">
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
                            <div className="w-full p-3 rounded-xl border-2 border-dashed border-lime-500/50 bg-gradient-to-r from-lime-50 to-lime-100 dark:from-lime-900/10 dark:to-lime-800/10 hover:from-lime-100 hover:to-lime-200 dark:hover:from-lime-900/20 dark:hover:to-lime-800/20 transition-all cursor-pointer group">
                                <div className="flex items-center justify-center gap-2 text-lime-700 dark:text-lime-400">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                    </svg>
                                    <span className="font-semibold text-sm">Unlock Suppliers</span>
                                    <span className="text-xs bg-lime-500 text-white px-2 py-0.5 rounded-full font-bold group-hover:scale-110 transition-transform">
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

                {/* View on Amazon */}
                {product.product_url && (
                    <a
                        href={product.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-3 text-center text-xs text-lime-600 dark:text-lime-400 hover:underline"
                    >
                        View on Amazon →
                    </a>
                )}
            </div>
        </div>
    );
}
