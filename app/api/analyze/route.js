// Updated Risk Check API to use REAL data from database
// Enhanced to support URL-based analysis via Universal Scraper
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeMarket } from '@/lib/scraper';

export async function POST(request) {
    try {
        const { productName, productUrl } = await request.json();

        const input = (productUrl || productName || '').trim();
        if (!input) {
            return NextResponse.json(
                { error: 'Please provide a product name or URL' },
                { status: 400 }
            );
        }

        console.log('[Risk Check] Analyzing:', input);

        // Check if input is a URL
        const isUrl = input.startsWith('http://') || input.startsWith('https://');

        if (isUrl) {
            // Use Universal Scraper for URL inputs
            console.log('[Risk Check] Detected URL - using Universal Scraper');

            try {
                // Get market sample for competitor analysis
                let marketSample = [];
                try {
                    const { data: products } = await supabase
                        .from('trending_products')
                        .select('price')
                        .gt('price', 0)
                        .limit(50);

                    if (products && products.length > 0) {
                        marketSample = products;
                    }
                } catch (dbError) {
                    console.warn('[Risk Check] Could not fetch market sample:', dbError.message);
                }

                // Analyze using universal scraper
                const analysis = await analyzeMarket(input, marketSample);

                // Return in the format expected by frontend
                return NextResponse.json({
                    success: true,
                    product: {
                        title: analysis.product.title,
                        price: analysis.product.price,
                        price_min: analysis.product.price * 0.9, // Estimate range
                        price_max: analysis.product.price * 1.1,
                        demand_level: getDemandFromAnalysis(analysis),
                        saturation_level: getSaturationFromAnalysis(analysis),
                        common_failure_reason: analysis.recommendation,
                        source: 'universal_scraper',
                        // Include full analysis for enhanced display
                        full_analysis: {
                            competitor: analysis.competitor_analysis,
                            profit: analysis.profit_analysis,
                            risk: analysis.risk_analysis,
                            trend: analysis.market_trends,
                            recommendation: analysis.recommendation,
                            meta: analysis.meta
                        }
                    }
                });
            } catch (scraperError) {
                console.error('[Risk Check] Scraper error:', scraperError);
                // Fall back to heuristics if scraper fails
                return getFallbackAnalysis(input);
            }
        }

        // Original logic for product name search
        const searchTerm = input.toLowerCase();

        const { data: products, error } = await supabase
            .from('trending_products')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,product_url.ilike.%${searchTerm}%`)
            .limit(1);

        if (error) {
            console.error('[Risk Check] Database error:', error);
            // Fall back to heuristics if database fails
            return getFallbackAnalysis(input);
        }

        if (products && products.length > 0) {
            // Use real data from database
            const product = products[0];

            return NextResponse.json({
                success: true,
                product: {
                    title: product.name,
                    demand_level: calculateDemandLevel(product),
                    saturation_level: calculateSaturationLevel(product),
                    common_failure_reason: getFailureReason(product),
                    price: product.price,
                    price_min: product.price_min || product.price,
                    price_max: product.price_max || product.price,
                    source: 'real_data'
                }
            });
        } else {
            // No matching product found - use heuristics
            console.log('[Risk Check] No product found in DB, using heuristics');
            return getFallbackAnalysis(input);
        }

    } catch (error) {
        console.error('Risk Check API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Analysis failed. Please try again.' },
            { status: 500 }
        );
    }
}

// Helper functions to convert universal scraper analysis to demand/saturation levels
function getDemandFromAnalysis(analysis) {
    const reviews = analysis.product.reviews || 0;
    const rating = analysis.product.rating || 0;

    if (reviews > 2000 && rating >= 4.3) return 'High';
    if (reviews > 500 && rating >= 4.0) return 'Medium';
    return 'Low';
}

function getSaturationFromAnalysis(analysis) {
    const riskLevel = analysis.risk_analysis.risk_level;
    const pricingPosition = analysis.competitor_analysis.pricing_position;

    if (riskLevel === 'HIGH' || pricingPosition === 'OVERPRICED') return 'High';
    if (riskLevel === 'MEDIUM') return 'Medium';
    return 'Low';
}

// Calculate demand based on real data
function calculateDemandLevel(product) {
    const listingCount = product.active_listings_count || 0;

    // High demand: Many sellers (indicates customer interest)
    if (listingCount > 30) return 'High';
    if (listingCount > 10) return 'Medium';
    return 'Low';
}

// Calculate saturation based on seller count
function calculateSaturationLevel(product) {
    const sellerCount = product.active_listings_count || 0;

    // High saturation: Too many sellers
    if (sellerCount > 50) return 'High';
    if (sellerCount > 15) return 'Medium';
    return 'Low';
}

// Determine most likely failure reason
function getFailureReason(product) {
    const saturation = calculateSaturationLevel(product);
    const demand = calculateDemandLevel(product);

    if (saturation === 'High') {
        return 'Too many competitors - price war likely';
    }

    if (demand === 'Low') {
        return 'Limited market demand';
    }

    return 'Monitor competition and pricing';
}

// Fallback to heuristics when no database data
function getFallbackAnalysis(input) {
    const keyword = input.toLowerCase();

    let demand = 'Medium';
    let saturation = 'Medium';
    let failureReason = 'Monitor competition levels';

    // Heuristics (same as before)
    if (keyword.includes('wireless') || keyword.includes('smart') ||
        keyword.includes('portable') || keyword.includes('charger')) {
        demand = 'High';
    }

    if (keyword.includes('phone case') || keyword.includes('charger') ||
        keyword.includes('cable')) {
        saturation = 'High';
        failureReason = 'Price competition - too many sellers';
    }

    return NextResponse.json({
        success: true,
        product: {
            title: input,
            demand_level: demand,
            saturation_level: saturation,
            common_failure_reason: failureReason,
            price: 25,
            price_min: 20,
            price_max: 50,
            source: 'heuristic'
        }
    });
}
