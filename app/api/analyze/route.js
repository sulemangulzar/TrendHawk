// Updated Risk Check API to use REAL data from database
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

        // Search for product in database
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
