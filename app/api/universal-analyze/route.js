import { NextResponse } from 'next/server';
import { analyzeMarket } from '@/lib/scraper';
import { supabase } from '@/lib/supabase';

/**
 * Universal Product Analysis API
 * Uses the universal scraper to analyze any e-commerce product URL
 * Returns comprehensive market intelligence with 15+ metrics
 */
export async function POST(request) {
    try {
        const { productUrl, userId } = await request.json();

        // Validate URL
        if (!productUrl || !productUrl.trim()) {
            return NextResponse.json(
                { error: 'Product URL is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(productUrl);
        } catch (e) {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        console.log('[Universal Analyze] Analyzing:', productUrl);

        // Optional: Get market sample data from database for competitor analysis
        let marketSample = [];
        try {
            const { data: products } = await supabase
                .from('trending_products')
                .select('price')
                .gt('price', 0)
                .limit(50);

            if (products && products.length > 0) {
                marketSample = products;
                console.log(`[Universal Analyze] Using ${products.length} products for market comparison`);
            }
        } catch (dbError) {
            console.warn('[Universal Analyze] Could not fetch market sample:', dbError.message);
            // Continue without market sample
        }

        // Call the universal scraper
        const analysis = await analyzeMarket(productUrl, marketSample);

        // Optional: Save to database for caching (if userId provided)
        if (userId) {
            try {
                await supabase
                    .from('product_snapshots')
                    .insert({
                        user_id: userId,
                        product_url: productUrl,
                        title: analysis.product.title,
                        price: analysis.product.price,
                        rating: analysis.product.rating,
                        review_count: analysis.product.reviews,
                        platform: 'Universal',
                        analysis_data: analysis, // Store full analysis as JSON
                        created_at: new Date().toISOString()
                    });
                console.log('[Universal Analyze] Saved analysis to database');
            } catch (dbError) {
                console.warn('[Universal Analyze] Could not save to database:', dbError.message);
                // Continue even if save fails
            }
        }

        // Return comprehensive analysis
        return NextResponse.json({
            success: true,
            analysis: {
                // Product basics
                product: {
                    title: analysis.product.title,
                    price: analysis.product.price,
                    rating: analysis.product.rating,
                    reviews: analysis.product.reviews,
                    images: analysis.product.images,
                    url: analysis.product.url
                },

                // Competitor analysis
                competitor: {
                    avg_price: analysis.competitor_analysis.avg_price,
                    pricing_position: analysis.competitor_analysis.pricing_position
                },

                // Profit breakdown
                profit: {
                    estimated_cost: analysis.profit_analysis.estimated_cost,
                    ad_cost: analysis.profit_analysis.ad_cost,
                    platform_fee: analysis.profit_analysis.platform_fee,
                    net_profit: analysis.profit_analysis.net_profit,
                    margin_percent: analysis.profit_analysis.margin_percent
                },

                // Risk assessment
                risk: {
                    risk_score: analysis.risk_analysis.risk_score,
                    risk_level: analysis.risk_analysis.risk_level
                },

                // Market trends
                trend: {
                    direction: analysis.market_trends.trend,
                    confidence: analysis.market_trends.confidence
                },

                // Smart recommendation
                recommendation: analysis.recommendation,

                // Metadata
                meta: analysis.meta
            }
        });

    } catch (error) {
        console.error('[Universal Analyze] Error:', error);

        // Handle specific error types
        if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            return NextResponse.json(
                { error: 'Could not reach the product URL. Please check the URL and try again.' },
                { status: 400 }
            );
        }

        if (error.response?.status === 404) {
            return NextResponse.json(
                { error: 'Product not found at the provided URL.' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                error: 'Analysis failed. Please try again or contact support.',
                details: error.message
            },
            { status: 500 }
        );
    }
}
