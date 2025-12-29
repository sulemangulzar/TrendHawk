"use client";
import { useState } from 'react';
import { X, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from './ui';

export default function ProfitCalculatorModal({ isOpen, onClose, product }) {
    const [sellingPrice, setSellingPrice] = useState(product?.price ? (product.price * 3).toFixed(2) : '');

    if (!isOpen || !product) return null;

    // Calculate profit breakdown
    const selling = parseFloat(sellingPrice) || 0;
    const cost = product.price || 0;
    const costPercentage = cost > 0 ? ((cost / selling) * 100).toFixed(0) : 25;
    const adSpend = 10; // Fixed $10 ad spend
    const profit = selling - cost - adSpend;
    const profitMargin = selling > 0 ? ((profit / selling) * 100).toFixed(1) : 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-forest-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-forest-800">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-forest-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-lime-600" />
                        Profit Calculator
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-forest-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Product Info */}
                    <div className="bg-gray-50 dark:bg-forest-950 p-4 rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Product</p>
                        <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {product.title}
                        </p>
                        <p className="text-lg font-bold text-lime-600 dark:text-lime-400 mt-2">
                            Cost: ${cost.toFixed(2)}
                        </p>
                    </div>

                    {/* Selling Price Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Your Selling Price
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                                $
                            </span>
                            <input
                                type="number"
                                value={sellingPrice}
                                onChange={(e) => setSellingPrice(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-white dark:bg-forest-950 border border-gray-300 dark:border-forest-700 rounded-xl text-lg font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Breakdown</h3>

                        {/* Cost */}
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Product Cost ({costPercentage}%)
                            </span>
                            <span className="font-bold text-red-700 dark:text-red-400">
                                -${cost.toFixed(2)}
                            </span>
                        </div>

                        {/* Ad Spend */}
                        <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Ad Spend
                            </span>
                            <span className="font-bold text-orange-700 dark:text-orange-400">
                                -${adSpend.toFixed(2)}
                            </span>
                        </div>

                        {/* Profit */}
                        <div className={`flex justify-between items-center p-4 rounded-lg border-2 ${profit > 0
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
                                : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
                            }`}>
                            <div>
                                <span className="text-sm text-gray-700 dark:text-gray-300 block">
                                    Your Profit
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {profitMargin}% margin
                                </span>
                            </div>
                            <span className={`text-2xl font-black ${profit > 0
                                    ? 'text-green-700 dark:text-green-400'
                                    : 'text-gray-700 dark:text-gray-400'
                                }`}>
                                ${profit.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Recommendation */}
                    {profit > 0 && profitMargin >= 30 && (
                        <div className="flex items-start gap-2 p-3 bg-lime-50 dark:bg-lime-900/20 rounded-lg border border-lime-200 dark:border-lime-800">
                            <TrendingUp className="w-5 h-5 text-lime-600 dark:text-lime-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-lime-900 dark:text-lime-300">
                                    Great Margin!
                                </p>
                                <p className="text-xs text-lime-700 dark:text-lime-400">
                                    This product has a healthy profit margin. Consider testing it!
                                </p>
                            </div>
                        </div>
                    )}

                    {profit <= 0 && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-red-900 dark:text-red-300">
                                    Low Profit
                                </p>
                                <p className="text-xs text-red-700 dark:text-red-400">
                                    Increase your selling price or find a cheaper supplier.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-forest-800">
                    <Button onClick={onClose} className="w-full">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
