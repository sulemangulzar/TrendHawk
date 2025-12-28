"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, TrendingUp, ShoppingBag, ArrowUpRight, Heart, BarChart3, Download, Eye } from 'lucide-react';
import api from '@/utils/api';
import clsx from 'clsx';
import ProductAnalysisModal from './ProductAnalysisModal';

export default function ProductCard({ product }) {
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const toggleSave = async (e) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            if (isSaved) {
                // Determine ID if we had real list management, for now just toggle state mock
                // await api.delete(`/saved/${product.id}/`); 
                setIsSaved(false);
            } else {
                await api.post('/saved/', {
                    title: product.title,
                    price: product.price,
                    image_url: product.image,
                    product_url: product.url,
                    platform: product.platform,
                    demand_score: product.analysis?.demand_score || 0,
                    competition_level: product.analysis?.competition || 'Medium',
                    profit_margin: product.analysis?.profit_margin || '30%'
                });
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = (e) => {
        e.stopPropagation();
        const csvContent = "data:text/csv;charset=utf-8," +
            `Title,Price,Platform\n"${product.title}","${product.price}","${product.platform}"`;
        const encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowAnalysis(true)}
                className="group relative bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl overflow-hidden hover:border-lime-600/50 hover:shadow-xl dark:hover:shadow-lime-600/10 transition-all duration-300 flex flex-col h-full cursor-pointer"
            >
                {/* Image Section */}
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-forest-950">
                    {product.image ? (
                        <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-forest-700">
                            <ShoppingBag className="w-12 h-12 opacity-50" />
                        </div>
                    )}

                    {/* Platform Badge & Rank */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-white/90 dark:bg-forest-950/90 backdrop-blur-sm text-lime-700 dark:text-lime-400 text-xs font-bold rounded-full shadow-sm border border-gray-100 dark:border-forest-800 font-poppins">
                            {product.platform}
                        </span>
                        {product.metrics?.rank && (
                            <span className="px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded-lg shadow-sm border border-gray-800 font-poppins">
                                {product.metrics.rank}
                            </span>
                        )}
                        {product.category && (
                            <span className="px-2 py-1 bg-gray-100/90 dark:bg-forest-800/90 text-forest-600 dark:text-forest-300 text-[10px] font-bold rounded-lg shadow-sm font-poppins hidden group-hover:block transition-all">
                                {product.category}
                            </span>
                        )}
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={toggleSave}
                        disabled={isLoading}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-forest-950/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
                    >
                        <Heart className={clsx("w-5 h-5 transition-colors", isSaved ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-forest-400")} />
                    </button>

                    {/* Overlay on Hover */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-6">
                        <span className="bg-white/90 dark:bg-forest-900/90 text-forest-900 dark:text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Eye className="w-3 h-3" /> View Deep Analysis
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-forest-900 dark:text-white font-medium line-clamp-2 mb-4 h-11 font-poppins text-sm leading-relaxed" title={product.title}>
                        {product.title}
                    </h3>

                    {/* Analysis Grid */}
                    {product.analysis && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-lime-50 dark:bg-lime-900/10 p-2 rounded-lg text-center border border-lime-100 dark:border-lime-900/20">
                                <p className="text-[10px] text-lime-700 dark:text-lime-400 font-bold uppercase tracking-wider mb-0.5">Demand</p>
                                <p className="text-sm font-bold text-forest-900 dark:text-white">{product.analysis.demand_score}/100</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg text-center border border-blue-100 dark:border-blue-900/20">
                                <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider mb-0.5">Margin</p>
                                <p className="text-sm font-bold text-forest-900 dark:text-white">{product.analysis.profit_margin}%</p>
                            </div>
                        </div>
                    )}

                    {/* Bottom Stats & Actions */}
                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-100 dark:border-forest-800/50">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-forest-400 mb-0.5 font-medium">Price</p>
                            <p className="text-lg font-bold text-lime-600 dark:text-lime-400 font-poppins">{product.price}</p>
                        </div>

                        <button
                            onClick={handleExport}
                            className="p-2 bg-gray-100 dark:bg-forest-800 hover:bg-gray-200 dark:hover:bg-forest-700 rounded-xl text-forest-600 dark:text-forest-300 transition-all opacity-0 group-hover:opacity-100"
                            title="Export CSV"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Modal */}
            <ProductAnalysisModal
                isOpen={showAnalysis}
                onClose={() => setShowAnalysis(false)}
                product={product}
            />
        </>
    );
}
