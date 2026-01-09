/**
 * Deep Analysis Engine - Enhanced Market Intelligence
 * Provides comprehensive insights beyond basic metrics
 */

import { getPriceRange, calculatePriceVariation } from '../utils/price.js';
import { normalizePriceToUSD } from '../utils/currency.js';

export class DeepAnalyzer {

    /**
     * Analyze Seller Reputation & Trust Signals
     */
    static analyzeSellerTrust(products) {
        const sellersWithRatings = products.filter(p => p.sellerRating);
        const avgSellerRating = sellersWithRatings.length > 0
            ? sellersWithRatings.reduce((sum, p) => sum + (p.sellerRating || 0), 0) / sellersWithRatings.length
            : 0;

        const verifiedSellers = products.filter(p => p.verifiedSeller).length;
        const totalSellers = products.length;

        return {
            averageSellerRating: avgSellerRating.toFixed(1),
            verifiedSellerPercentage: totalSellers > 0 ? Math.round((verifiedSellers / totalSellers) * 100) : 0,
            trustLevel: avgSellerRating >= 4.5 ? 'High' : avgSellerRating >= 3.5 ? 'Medium' : 'Low',
            recommendation: avgSellerRating >= 4.5
                ? 'Strong seller reputation - low fulfillment risk'
                : avgSellerRating >= 3.5
                    ? 'Moderate seller reputation - verify before bulk orders'
                    : 'Weak seller reputation - high risk, consider alternative sources'
        };
    }

    /**
     * Calculate Estimated Profit Margins
     */
    static calculateProfitMargins(targetProduct, competitorProducts) {
        const prices = competitorProducts.map(p => p.priceUSD).filter(p => p);
        if (prices.length === 0) return null;

        const avgMarketPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Estimate costs (industry averages)
        const estimatedCOGS = minPrice * 0.40; // 40% of lowest price as cost estimate
        const estimatedShipping = 5.00; // Average shipping cost
        const platformFees = avgMarketPrice * 0.15; // 15% platform fees
        const advertisingCost = avgMarketPrice * 0.10; // 10% advertising

        const totalCosts = estimatedCOGS + estimatedShipping + platformFees + advertisingCost;
        const netProfit = avgMarketPrice - totalCosts;
        const profitMargin = (netProfit / avgMarketPrice) * 100;

        return {
            avgMarketPrice: avgMarketPrice.toFixed(2),
            estimatedCOGS: estimatedCOGS.toFixed(2),
            estimatedShipping: estimatedShipping.toFixed(2),
            platformFees: platformFees.toFixed(2),
            advertisingCost: advertisingCost.toFixed(2),
            totalCosts: totalCosts.toFixed(2),
            netProfit: netProfit.toFixed(2),
            profitMargin: profitMargin.toFixed(1),
            viability: profitMargin > 25 ? 'Excellent' : profitMargin > 15 ? 'Good' : profitMargin > 5 ? 'Marginal' : 'Poor'
        };
    }

    /**
     * Analyze Customer Sentiment from Reviews
     */
    static analyzeCustomerSentiment(products) {
        const productsWithReviews = products.filter(p => p.reviews > 0 && p.rating);

        if (productsWithReviews.length === 0) {
            return {
                overallSentiment: 'Unknown',
                avgRating: 0,
                totalReviews: 0,
                positivePercentage: 0
            };
        }

        const totalReviews = productsWithReviews.reduce((sum, p) => sum + p.reviews, 0);
        const avgRating = productsWithReviews.reduce((sum, p) => sum + (p.rating || 0), 0) / productsWithReviews.length;

        // Estimate positive reviews (4+ stars)
        const positivePercentage = avgRating >= 4.5 ? 90 : avgRating >= 4.0 ? 75 : avgRating >= 3.5 ? 60 : 40;

        let sentiment = 'Neutral';
        if (avgRating >= 4.5) sentiment = 'Very Positive';
        else if (avgRating >= 4.0) sentiment = 'Positive';
        else if (avgRating >= 3.5) sentiment = 'Mixed';
        else sentiment = 'Negative';

        return {
            overallSentiment: sentiment,
            avgRating: avgRating.toFixed(1),
            totalReviews: totalReviews,
            positivePercentage: positivePercentage,
            insight: avgRating >= 4.0
                ? 'Strong customer satisfaction - product quality validated'
                : avgRating >= 3.5
                    ? 'Mixed reviews - investigate common complaints before selling'
                    : 'Poor customer satisfaction - high return risk'
        };
    }

    /**
     * Detect Market Trends
     */
    static detectMarketTrends(products) {
        const reviewCounts = products.map(p => p.reviews).filter(r => r > 0);

        if (reviewCounts.length === 0) {
            return {
                trend: 'Unknown',
                momentum: 'Low',
                description: 'Insufficient data to determine trend'
            };
        }

        const avgReviews = reviewCounts.reduce((a, b) => a + b, 0) / reviewCounts.length;
        const maxReviews = Math.max(...reviewCounts);

        // High review counts indicate established/mature market
        // Low review counts indicate emerging/new market

        let trend = 'Stable';
        let momentum = 'Medium';
        let description = '';

        if (maxReviews > 5000 && avgReviews > 1000) {
            trend = 'Mature';
            momentum = 'High';
            description = 'Established market with strong demand. Competition is fierce but demand is proven.';
        } else if (maxReviews > 1000 && avgReviews > 200) {
            trend = 'Growing';
            momentum = 'High';
            description = 'Growing market with increasing demand. Good timing to enter before saturation.';
        } else if (maxReviews > 100 && avgReviews > 50) {
            trend = 'Emerging';
            momentum = 'Medium';
            description = 'Emerging market with potential. Early mover advantage possible.';
        } else {
            trend = 'New/Niche';
            momentum = 'Low';
            description = 'New or niche market. High risk but potential for first-mover advantage.';
        }

        return { trend, momentum, description };
    }

    /**
     * Analyze SEO & Keyword Opportunities
     */
    static analyzeSEO(targetProduct, competitorProducts) {
        if (!targetProduct || !targetProduct.title) {
            return {
                keywords: [],
                competitionLevel: 'Unknown',
                recommendation: 'No SEO data available'
            };
        }

        // Extract common keywords from titles
        const allTitles = [targetProduct.title, ...competitorProducts.map(p => p.title)].filter(Boolean);
        const wordFrequency = {};

        allTitles.forEach(title => {
            const words = title.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 3); // Only words longer than 3 chars

            words.forEach(word => {
                wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            });
        });

        // Get top keywords
        const keywords = Object.entries(wordFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, freq]) => ({ word, frequency: freq }));

        const competitionLevel = competitorProducts.length > 20 ? 'High' : competitorProducts.length > 10 ? 'Medium' : 'Low';

        return {
            keywords: keywords.slice(0, 5),
            competitionLevel,
            recommendation: competitionLevel === 'High'
                ? 'Use long-tail keywords and niche targeting for better visibility'
                : competitionLevel === 'Medium'
                    ? 'Moderate keyword competition - focus on unique value propositions'
                    : 'Low keyword competition - opportunity for strong SEO positioning'
        };
    }

    /**
     * Master Deep Analysis Function
     */
    static performDeepAnalysis(targetProduct, competitorProducts) {
        const normalizedCompetitors = competitorProducts.map(normalizePriceToUSD);

        return {
            sellerTrust: this.analyzeSellerTrust(normalizedCompetitors),
            profitMargins: this.calculateProfitMargins(targetProduct, normalizedCompetitors),
            customerSentiment: this.analyzeCustomerSentiment(normalizedCompetitors),
            marketTrends: this.detectMarketTrends(normalizedCompetitors),
            seoAnalysis: this.analyzeSEO(targetProduct, normalizedCompetitors)
        };
    }
}

export default DeepAnalyzer;
