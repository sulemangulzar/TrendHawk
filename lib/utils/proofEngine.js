/**
 * ProofEngine - Analysis layer (separate from scraping)
 * Handles scoring, confidence, and verdict logic based on normalized data
 */

import { calculatePriceVariation, getPriceRange } from './price.js';

export class ProofEngine {
    /**
     * Calculate Proof Score (0-100) based on multi-platform signals
     */
    static calculateScore(normalizedProducts) {
        let score = 0;

        if (!normalizedProducts || normalizedProducts.length === 0) return 0;

        const platforms = [...new Set(normalizedProducts.map(p => p.platform))];
        const prices = normalizedProducts.map(p => p.price).filter(p => p !== null);
        const reviews = normalizedProducts.map(p => p.reviews).filter(r => r > 0);

        // 1. Multi-platform presence (+30 points)
        if (platforms.length >= 2) score += 30;
        else if (platforms.length === 1) score += 15;

        // 2. Demand signal - High review counts (+25 points)
        const hasHighDemand = reviews.some(r => r > 100);
        const avgReviews = reviews.length > 0 ? reviews.reduce((a, b) => a + b, 0) / reviews.length : 0;

        if (hasHighDemand || avgReviews > 500) score += 25;
        else if (avgReviews > 50) score += 15;

        // 3. Price consistency (+15 points)
        if (prices.length > 1) {
            const variation = calculatePriceVariation(prices);
            if (variation < 20) score += 15; // Very stable
            else if (variation < 40) score += 10; // Moderately stable
        }

        // 4. Data quality (+20 points)
        const hasCompleteData = normalizedProducts.every(p => p.title && p.price);
        if (hasCompleteData) score += 20;
        else if (normalizedProducts.some(p => p.title && p.price)) score += 10;

        // 5. Review engagement (+10 points)
        if (reviews.length >= 2) score += 10;

        return Math.min(score, 100);
    }

    /**
     * Determine Confidence Level based on data quality and quantity
     */
    static getConfidenceLevel(normalizedProducts) {
        if (!normalizedProducts || normalizedProducts.length === 0) return 'LOW';

        const platforms = [...new Set(normalizedProducts.map(p => p.platform))];
        const hasReviews = normalizedProducts.some(p => p.reviews > 0);
        const hasPrices = normalizedProducts.every(p => p.price !== null);

        if (platforms.length >= 2 && hasReviews && hasPrices) return 'HIGH';
        if (platforms.length >= 1 && hasPrices) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Determine Verdict based on score
     */
    static getVerdict(score) {
        if (score >= 70) return 'SCALE';
        if (score >= 40) return 'TEST';
        return 'KILL';
    }

    /**
     * Generate market insights
     */
    static generateInsights(normalizedProducts) {
        if (!normalizedProducts || normalizedProducts.length === 0) {
            return {
                priceRange: null,
                avgReviews: 0,
                platforms: [],
                recommendation: 'Insufficient data for analysis'
            };
        }

        const prices = normalizedProducts.map(p => p.price).filter(p => p !== null);
        const reviews = normalizedProducts.map(p => p.reviews);
        const platforms = [...new Set(normalizedProducts.map(p => p.platform))];

        const priceRange = getPriceRange(prices);
        const avgReviews = reviews.length > 0 ? Math.floor(reviews.reduce((a, b) => a + b, 0) / reviews.length) : 0;

        let recommendation = '';
        if (platforms.length >= 2 && avgReviews > 500) {
            recommendation = 'Strong market validation across multiple platforms. Consider scaling.';
        } else if (platforms.length >= 1 && avgReviews > 100) {
            recommendation = 'Moderate market presence. Test with small budget before scaling.';
        } else {
            recommendation = 'Limited market validation. High risk - proceed with caution.';
        }

        return {
            priceRange,
            avgReviews,
            platforms,
            recommendation
        };
    }
}

export default ProofEngine;
