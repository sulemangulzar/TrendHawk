"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { motion } from 'framer-motion';
import { Heart, Trash2, Search, Filter, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import ProductAnalysisModal from '@/components/ProductAnalysisModal';
import clsx from 'clsx';

export default function SavedProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchSavedProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchTerm, selectedPlatform, products]);

    const fetchSavedProducts = async () => {
        try {
            const { data } = await api.get('saved/');
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch saved products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedPlatform !== 'All') {
            filtered = filtered.filter(p => p.platform === selectedPlatform);
        }

        setFilteredProducts(filtered);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`saved/${id}/`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const exportToCSV = () => {
        const headers = ['Title', 'Price', 'Platform', 'Demand Score', 'Competition', 'Profit Margin'];
        const rows = filteredProducts.map(p => [
            p.title,
            p.price,
            p.platform,
            p.demand_score || 'N/A',
            p.competition_level || 'N/A',
            p.profit_margin || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trendhawk-saved-products-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const platforms = ['All', ...new Set(products.map(p => p.platform))];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lime-500 font-poppins">Loading saved products...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-poppins">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-forest-900 dark:text-white">Saved Products</h1>
                    <p className="text-forest-600 dark:text-forest-400 mt-1">
                        {products.length} product{products.length !== 1 ? 's' : ''} saved
                    </p>
                </div>
                <Button onClick={exportToCSV} variant="outline" disabled={filteredProducts.length === 0}>
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-forest-900/30 border border-gray-200 dark:border-forest-800 rounded-2xl p-4">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search saved products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-forest-900 border border-gray-200 dark:border-forest-800 rounded-xl outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 transition-all text-forest-900 dark:text-white"
                        />
                    </div>

                    {/* Platform Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {platforms.map(platform => (
                            <button
                                key={platform}
                                onClick={() => setSelectedPlatform(platform)}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                                    selectedPlatform === platform
                                        ? "bg-lime-500 text-lime-950 border-lime-500"
                                        : "bg-white dark:bg-forest-900/40 text-forest-600 dark:text-forest-400 border-gray-200 dark:border-forest-800 hover:border-lime-200"
                                )}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-forest-900/20 rounded-2xl border border-gray-200 dark:border-forest-800">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-forest-700" />
                    <h3 className="text-xl font-bold text-forest-900 dark:text-white mb-2">
                        {products.length === 0 ? 'No saved products yet' : 'No products match your filters'}
                    </h3>
                    <p className="text-gray-500 dark:text-forest-400">
                        {products.length === 0
                            ? 'Start saving products from the dashboard to build your collection'
                            : 'Try adjusting your search or filters'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl overflow-hidden hover:border-lime-500 hover:shadow-xl transition-all"
                        >
                            {/* Image */}
                            <div className="aspect-[4/3] relative bg-gray-100 dark:bg-forest-950 overflow-hidden">
                                <img
                                    src={product.image_url || 'https://placehold.co/400x300?text=No+Image'}
                                    alt={product.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => e.target.src = 'https://placehold.co/400x300?text=No+Image'}
                                />

                                {/* Platform Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-3 py-1 bg-white/90 dark:bg-forest-950/90 backdrop-blur-sm text-lime-700 dark:text-lime-400 text-xs font-bold rounded-full shadow-sm">
                                        {product.platform}
                                    </span>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="absolute top-3 right-3 p-2 bg-red-500/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-600 transition-colors"
                                    title="Remove from saved"
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-medium text-sm line-clamp-2 mb-3 text-forest-900 dark:text-white h-10">
                                    {product.title}
                                </h3>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-lime-50 dark:bg-lime-900/10 p-2 rounded-lg text-center border border-lime-100 dark:border-lime-900/20">
                                        <p className="text-[10px] text-lime-700 dark:text-lime-400 font-bold uppercase">Demand</p>
                                        <p className="text-sm font-bold text-forest-900 dark:text-white">{product.demand_score || 'N/A'}</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg text-center border border-blue-100 dark:border-blue-900/20">
                                        <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">Margin</p>
                                        <p className="text-sm font-bold text-forest-900 dark:text-white">{product.profit_margin || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Price & Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-forest-800">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-forest-400">Price</p>
                                        <p className="text-lg font-bold text-lime-600 dark:text-lime-400">{product.price}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProduct(product)}
                                        className="p-2 bg-gray-100 dark:bg-forest-800 hover:bg-gray-200 dark:hover:bg-forest-700 rounded-xl transition-colors"
                                        title="View Details"
                                    >
                                        <ExternalLink className="w-4 h-4 text-forest-600 dark:text-forest-300" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedProduct && (
                <ProductAnalysisModal product={selectedProduct}>
                    <div />
                </ProductAnalysisModal>
            )}
        </div>
    );
}
