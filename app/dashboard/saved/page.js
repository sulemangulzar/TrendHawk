"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bookmark, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProfitCalculatorModal from '@/components/ProfitCalculatorModal';

export default function SavedProductsPage() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCalculator, setShowCalculator] = useState(false);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    const fetchFavorites = async () => {
        try {
            const res = await fetch(`/api/favorites?userId=${user.id}`);
            const data = await res.json();
            setFavorites(data.favorites || []);
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateProfit = (product) => {
        setSelectedProduct(product);
        setShowCalculator(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black p-6 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Favorite Products
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Products you've saved for later
                    </p>
                </div>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((fav) => (
                            <ProductCard
                                key={fav.id}
                                product={fav.products}
                                onCalculateProfit={() => handleCalculateProfit(fav.products)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-forest-900/20 rounded-2xl border border-gray-200 dark:border-forest-800">
                        <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            No Favorites Yet
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Click the heart icon on products to save them here
                        </p>
                    </div>
                )}
            </div>

            <ProfitCalculatorModal
                isOpen={showCalculator}
                onClose={() => setShowCalculator(false)}
                product={selectedProduct}
            />
        </div>
    );
}
