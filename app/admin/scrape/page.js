"use client";
import { useState } from 'react';
import { Button } from '@/components/ui';
import { Loader2, PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminScrapePage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [productUrl, setProductUrl] = useState('');

    const scrapeSingleProduct = async () => {
        if (!productUrl.trim()) {
            alert('Please enter a product URL');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'product',
                    productUrl: productUrl.trim()
                })
            });

            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const scrapeTrendingProducts = async () => {
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'trending',
                    category: 'all',
                    limit: 10
                })
            });

            const data = await res.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-8 font-poppins">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                    Scraping Test Admin
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Test Amazon scraping functionality
                </p>

                {/* Single Product Scraper */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Scrape Single Product
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amazon Product URL
                        </label>
                        <input
                            type="text"
                            value={productUrl}
                            onChange={(e) => setProductUrl(e.target.value)}
                            placeholder="https://www.amazon.com/dp/B08..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            disabled={loading}
                        />
                    </div>

                    <Button
                        onClick={scrapeSingleProduct}
                        disabled={loading}
                        className="w-full h-12 font-bold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Scraping...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-5 h-5 mr-2" />
                                Scrape Product
                            </>
                        )}
                    </Button>
                </div>

                {/* Trending Products Scraper */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Scrape Trending Products
                    </h2>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        This will scrape the top 10 products from Amazon Best Sellers. Takes ~2-3 minutes.
                    </p>

                    <Button
                        onClick={scrapeTrendingProducts}
                        disabled={loading}
                        variant="outline"
                        className="w-full h-12 font-bold border-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Scraping Trending...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-5 h-5 mr-2" />
                                Scrape Trending (10 products)
                            </>
                        )}
                    </Button>
                </div>

                {/* Results */}
                {result && (
                    <div className={`rounded-2xl p-6 border-2 ${result.success
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        }`}>
                        <div className="flex items-center gap-3 mb-4">
                            {result.success ? (
                                <>
                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                                        Scraping Successful!
                                    </h3>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100">
                                        Scraping Failed
                                    </h3>
                                </>
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 overflow-auto max-h-96">
                            <pre className="text-xs text-gray-900 dark:text-white">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>

                        {result.success && result.data && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    Extracted Data:
                                </p>
                                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-2">
                                    {result.data.title && (
                                        <p className="text-sm"><span className="font-bold">Title:</span> {result.data.title}</p>
                                    )}
                                    {result.data.price && (
                                        <p className="text-sm"><span className="font-bold">Price:</span> ${result.data.price}</p>
                                    )}
                                    {result.data.rating && (
                                        <p className="text-sm"><span className="font-bold">Rating:</span> {result.data.rating} ⭐</p>
                                    )}
                                    {result.data.review_count && (
                                        <p className="text-sm"><span className="font-bold">Reviews:</span> {result.data.review_count}</p>
                                    )}
                                    {result.data.seller_count && (
                                        <p className="text-sm"><span className="font-bold">Sellers:</span> {result.data.seller_count}</p>
                                    )}
                                    {result.data.rank && (
                                        <p className="text-sm"><span className="font-bold">BSR:</span> #{result.data.rank}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {result.success && result.count && (
                            <div className="mt-4">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                    Scraped {result.count} products successfully!
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                    Check the Market Proof page to see them.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
                        ℹ️ How to Use
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <li><strong>Single Product:</strong> Paste any Amazon product URL (e.g., https://amazon.com/dp/B08...)</li>
                        <li><strong>Trending:</strong> Scrapes Best Sellers - takes 2-3 minutes for 10 products</li>
                        <li><strong>Data Storage:</strong> Products are saved to database automatically</li>
                        <li><strong>Rate Limiting:</strong> 2-5 second delays between products to avoid blocks</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
