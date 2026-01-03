"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AnalysisResults } from '@/components/AnalysisResults';
import { Button } from '@/components/ui';
import { Loader2, ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ProductDetailPage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && id) {
            fetchProduct();
        }
    }, [user, id, authLoading]);

    const handleDelete = async () => {
        if (!confirm('Permanently delete this product analysis?')) return;

        try {
            const res = await fetch(`/api/products/${id}?userId=${user.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToast('Product deleted permanently', 'success');
                router.push('/dashboard/explore');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to delete', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Error deleting product', 'error');
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/products/${id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch product');
            setProduct(data.product);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Crunching market data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-100 dark:border-red-900/40">
                    <h2 className="text-2xl font-bold text-red-900 dark:text-red-400 mb-2">Error</h2>
                    <p className="text-red-600 dark:text-red-500 mb-6">{error}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 font-poppins pb-20">
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="flex items-center gap-4">
                    {product.product_url && (
                        <a
                            href={product.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                            View on {product.source === 'amazon' ? 'Amazon' : 'eBay'}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-all border border-red-100 dark:border-red-900/40"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Product Header Info */}
            <div className="bg-white dark:bg-forest-900/40 p-8 rounded-3xl border border-gray-200 dark:border-forest-800">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase">
                            {product.source}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full uppercase">
                            ID: {product.id.slice(0, 8)}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                        {product.title}
                    </h1>
                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-black mb-1">Price</p>
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${product.price}</p>
                        </div>
                        {product.rating && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-black mb-1">Rating</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">⭐ {product.rating}</p>
                            </div>
                        )}
                        {product.review_count && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-black mb-1">Reviews</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{product.review_count.toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Analysis Data */}
            <AnalysisResults product={product} />
        </div>
    );
}
