/**
 * Market Analyzer - Deep Intelligence Engine
 * Provides $29-worthy insights that go beyond raw data
 */

import { getPriceRange, calculatePriceVariation } from '../utils/price.js';
import { normalizePriceToUSD } from '../utils/currency.js';

export class MarketAnalyzer {

    /**
     * Calculate Market Saturation Score (0-100)
     * Higher = More saturated/competitive
     */
    static calculateSaturation(products) {
        let score = 0;

        if (!products || products.length === 0) return 0;

        const platforms = [...new Set(products.map(p => p.platform))];
        const totalListings = products.length;
        const avgReviews = products.reduce((sum, p) => sum + (p.reviews || 0), 0) / products.length;

        // Factor 1: Number of platforms (+30 points max)
        score += Math.min(platforms.length * 10, 30);

        // Factor 2: Total listings found (+25 points max)
        score += Math.min(totalListings * 2.5, 25);

        // Factor 3: Average review count (+25 points max)
        if (avgReviews > 1000) score += 25;
        else if (avgReviews > 500) score += 20;
        else if (avgReviews > 100) score += 15;
        else if (avgReviews > 50) score += 10;

        // Factor 4: Price competition (+20 points max)
        const prices = products.map(p => p.priceUSD).filter(p => p);
        if (prices.length > 1) {
            const variation = calculatePriceVariation(prices);
            if (variation < 10) score += 20; // Highly competitive pricing
            else if (variation < 20) score += 15;
            else if (variation < 30) score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * Determine Competition Level
     */
    static getCompetitionLevel(saturationScore, products) {
        const sellerCount = products.reduce((sum, p) => sum + (p.sellerCount || 1), 0);

        if (saturationScore > 70 || sellerCount > 50) {
            return {
                level: 'High',
                description: 'Highly competitive market with many established sellers',
                color: 'red',
                recommendation: 'Difficult to enter. Consider niche differentiation or skip.'
            };
        } else if (saturationScore > 40 || sellerCount > 20) {
            return {
                level: 'Medium',
                description: 'Moderate competition with room for new entrants',
                color: 'amber',
                recommendation: 'Test with small inventory. Focus on unique value proposition.'
            };
        } else {
            return {
                level: 'Low',
                description: 'Low competition with opportunity for market entry',
                color: 'emerald',
                recommendation: 'Good opportunity. Validate demand before scaling.'
            };
        }
    }

    /**
     * Analyze Demand Signals
     */
    static analyzeDemand(products) {
        const totalReviews = products.reduce((sum, p) => sum + (p.reviews || 0), 0);
        const avgReviews = totalReviews / products.length;
        const maxReviews = Math.max(...products.map(p => p.reviews || 0));

        let strength = 'Low';
        let description = '';
        let score = 0;

        if (avgReviews > 500 || maxReviews > 2000) {
            strength = 'Strong';
            description = 'High customer engagement and proven demand';
            score = 85;
        } else if (avgReviews > 100 || maxReviews > 500) {
            strength = 'Moderate';
            description = 'Decent customer interest with growth potential';
            score = 60;
        } else if (avgReviews > 20 || maxReviews > 100) {
            strength = 'Emerging';
            description = 'Early-stage demand, requires validation';
            score = 35;
        } else {
            strength = 'Weak';
            description = 'Limited proven demand, high risk';
            score = 15;
        }

        return {
            strength,
            description,
            score,
            totalReviews,
            avgReviews: Math.round(avgReviews),
            maxReviews
        };
    }

    /**
     * Analyze Price Positioning
     */
    static analyzePricing(products) {
        const prices = products.map(p => p.priceUSD).filter(p => p);

        if (prices.length === 0) {
            return {
                tier: 'Unknown',
                range: null,
                recommendation: 'Insufficient pricing data'
            };
        }

        const priceRange = getPriceRange(prices);
        const variation = calculatePriceVariation(prices);

        let tier = 'Mid-Range';
        let recommendation = '';

        if (priceRange.avg < 20) {
            tier = 'Budget';
            recommendation = 'Low-margin, high-volume strategy. Focus on efficiency.';
        } else if (priceRange.avg < 50) {
            tier = 'Mid-Range';
            recommendation = 'Balanced approach. Compete on value and quality.';
        } else if (priceRange.avg < 150) {
            tier = 'Premium';
            recommendation = 'Higher margins possible. Emphasize quality and branding.';
        } else {
            tier = 'Luxury';
            recommendation = 'Niche market. Requires strong brand and trust signals.';
        }

        return {
            tier,
            range: priceRange,
            variation: variation.toFixed(1),
            stability: variation < 20 ? 'Stable' : variation < 40 ? 'Moderate' : 'Volatile',
            recommendation
        };
    }

    /**
     * Calculate Risk Score (0-100)
     * Higher = More risky
     */
    static calculateRisk(saturationScore, demandAnalysis, pricingAnalysis) {
        let risk = 0;

        // High saturation = High risk
        risk += saturationScore * 0.4;

        // Low demand = High risk
        risk += (100 - demandAnalysis.score) * 0.3;

        // Price volatility = Risk
        if (pricingAnalysis.stability === 'Volatile') risk += 20;
        else if (pricingAnalysis.stability === 'Moderate') risk += 10;

        // Low price tier = Higher risk (thin margins)
        if (pricingAnalysis.tier === 'Budget') risk += 10;

        return Math.min(Math.round(risk), 100);
    }

    /**
     * Estimate Profit Opportunity (0-100)
     */
    static estimateProfitOpportunity(saturationScore, demandAnalysis, pricingAnalysis, riskScore) {
        let opportunity = 0;

        // Strong demand = High opportunity
        opportunity += demandAnalysis.score * 0.4;

        // Low saturation = High opportunity
        opportunity += (100 - saturationScore) * 0.3;

        // Premium pricing = Better margins
        if (pricingAnalysis.tier === 'Premium' || pricingAnalysis.tier === 'Luxury') {
            opportunity += 20;
        } else if (pricingAnalysis.tier === 'Mid-Range') {
            opportunity += 10;
        }

        // Stable pricing = Predictable profits
        if (pricingAnalysis.stability === 'Stable') opportunity += 10;

        // Adjust for risk
        opportunity -= riskScore * 0.2;

        return Math.max(0, Math.min(Math.round(opportunity), 100));
    }

    /**
     * Generate Executive Summary (1-2 sentence verdict)
     */
    static generateExecutiveSummary(analysis) {
        const { verdict, saturationScore, demand, pricing, risk, profitOpportunity } = analysis;

        if (verdict === 'SCALE') {
            return `Strong market opportunity with ${demand.strength.toLowerCase()} demand and ${analysis.competition.level.toLowerCase()} competition. Recommended action: Scale with confidence, target ${pricing.tier.toLowerCase()} price point around $${pricing.range.avg.toFixed(2)}.`;
        } else if (verdict === 'TEST') {
            return `Moderate opportunity with ${demand.strength.toLowerCase()} demand signals. Recommended action: Test with 20-50 units at $${pricing.range.avg.toFixed(2)} price point, monitor conversion rates closely.`;
        } else {
            return `High-risk market with ${demand.strength.toLowerCase()} demand and ${analysis.competition.level.toLowerCase()} competition. Recommended action: Skip or pivot to less saturated niche.`;
        }
    }

    /**
     * Generate Action Plan
     */
    static generateActionPlan(analysis) {
        const { verdict, pricing, demand, competition } = analysis;

        const plan = {
            immediate: [],
            shortTerm: [],
            pricing: null,
            inventory: null,
            marketing: null
        };

        if (verdict === 'SCALE') {
            plan.immediate.push('Source inventory from reliable supplier');
            plan.immediate.push('Set up product listings on 2-3 platforms');
            plan.shortTerm.push('Scale to 200+ units within 30 days');
            plan.shortTerm.push('Implement automated repricing');
            plan.pricing = `Target $${(pricing.range.avg * 0.95).toFixed(2)} - $${(pricing.range.avg * 1.05).toFixed(2)} to stay competitive`;
            plan.inventory = 'Start with 100-200 units, reorder at 50% threshold';
            plan.marketing = 'Focus on Amazon PPC and social proof (reviews)';
        } else if (verdict === 'TEST') {
            plan.immediate.push('Order 20-50 sample units');
            plan.immediate.push('Create test listing on primary platform');
            plan.shortTerm.push('Monitor sales for 14 days');
            plan.shortTerm.push('Analyze conversion rate and customer feedback');
            plan.pricing = `Test at $${pricing.range.avg.toFixed(2)}, adjust based on conversion`;
            plan.inventory = 'Start with 20-50 units, do not reorder until validated';
            plan.marketing = 'Minimal spend - focus on organic traffic first';
        } else {
            plan.immediate.push('Research alternative products in same category');
            plan.immediate.push('Analyze less saturated sub-niches');
            plan.shortTerm.push('Skip this product');
            plan.pricing = 'N/A - Do not proceed';
            plan.inventory = 'N/A - Do not proceed';
            plan.marketing = 'N/A - Do not proceed';
        }

        return plan;
    }

    /**
     * Master Analysis Function
     * Returns comprehensive market intelligence
     */
    static analyzeMarket(products) {
        if (!products || products.length === 0) {
            return {
                verdict: 'KILL',
                confidence: 'LOW',
                executiveSummary: 'Insufficient data for analysis',
                saturationScore: 0,
                competition: { level: 'Unknown', description: 'No data', recommendation: 'Cannot analyze' },
                demand: { strength: 'Unknown', description: 'No data', score: 0 },
                pricing: { tier: 'Unknown', range: null, recommendation: 'No data' },
                risk: 100,
                profitOpportunity: 0,
                actionPlan: null
            };
        }

        // Normalize all prices to USD for comparison
        const normalizedProducts = products.map(normalizePriceToUSD);

        // Run all analyses
        const saturationScore = this.calculateSaturation(normalizedProducts);
        const competition = this.getCompetitionLevel(saturationScore, normalizedProducts);
        const demand = this.analyzeDemand(normalizedProducts);
        const pricing = this.analyzePricing(normalizedProducts);
        const risk = this.calculateRisk(saturationScore, demand, pricing);
        const profitOpportunity = this.estimateProfitOpportunity(saturationScore, demand, pricing, risk);

        // Determine verdict
        let verdict = 'KILL';
        let confidence = 'LOW';

        if (profitOpportunity > 60 && risk < 50) {
            verdict = 'SCALE';
            confidence = 'HIGH';
        } else if (profitOpportunity > 35 && risk < 70) {
            verdict = 'TEST';
            confidence = 'MEDIUM';
        }

        const analysis = {
            verdict,
            confidence,
            saturationScore,
            competition,
            demand,
            pricing,
            risk,
            profitOpportunity
        };

        analysis.executiveSummary = this.generateExecutiveSummary(analysis);
        analysis.actionPlan = this.generateActionPlan(analysis);

        return analysis;
    }
}

export default MarketAnalyzer;
