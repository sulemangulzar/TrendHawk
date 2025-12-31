import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapeProducts } from '@/lib/scraper';
import { calculateVerdict } from '@/lib/verdictEngine';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        const { productName, productUrl, userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const input = (productUrl || productName || '').trim();
        if (!input) {
            return NextResponse.json(
                { error: 'Please provide a product name or URL' },
                { status: 400 }
            );
        }

        console.log(`🔍 Analyzing: ${input}`);

        // 1. Determine search keyword for caching
        const searchKeyword = productUrl ? extractProductNameFromUrl(productUrl) : input;
        const cacheKey = searchKeyword.toLowerCase().trim();

        const { data: existingProduct } = await supabase
            .from('products')
            .select('*')
            .eq('keyword', cacheKey)
            .not('verdict', 'is', null)
            .order('analyzed_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // If analyzed within 1 hour, return cached result
        if (existingProduct && existingProduct.analyzed_at) {
            const analyzedDate = new Date(existingProduct.analyzed_at);
            const hoursSinceAnalysis = (Date.now() - analyzedDate.getTime()) / (1000 * 60 * 60);

            if (hoursSinceAnalysis < 1) {
                console.log(`✅ Using cache for: ${cacheKey} (${hoursSinceAnalysis.toFixed(1)}h ago)`);
                return NextResponse.json({
                    product: existingProduct,
                    cached: true
                });
            }
        }

        // 2. Scrape product data
        console.log(`🌐 Scraping market data for: ${input}...`);
        const scrapedResults = await scrapeProducts(input);

        if (!scrapedResults || scrapedResults.length === 0) {
            return NextResponse.json(
                { error: 'Market data unavailable for this item. Try a more specific name or direct URL.' },
                { status: 404 }
            );
        }

        const productData = scrapedResults[0];

        // 3. Calculate verdict
        console.log(`🧮 Calculating verdict for: ${productData.title}`);
        const verdictData = calculateVerdict(productData);

        // 4. Save to database
        const { data: savedProduct, error: saveError } = await supabase
            .from('products')
            .insert({
                user_id: userId,
                keyword: cacheKey,
                title: productData.title,
                price: productData.price,
                image_url: productData.image_url,
                product_url: productData.product_url,
                review_count: productData.review_count || 0,
                rating: productData.rating || 0,
                source: productData.source,

                // Verdict data
                verdict: verdictData.verdict,
                risk_level: verdictData.riskLevel,
                demand_level: verdictData.demandLevel,
                saturation_score: verdictData.saturationScore,
                emotional_trigger_score: verdictData.emotionalTriggerScore,
                confidence_score: verdictData.confidenceScore,

                // Profit data
                profit_worst_case: verdictData.profitWorstCase,
                profit_average_case: verdictData.profitAverageCase,
                profit_best_case: verdictData.profitBestCase,
                estimated_cost: verdictData.estimatedCost,
                estimated_shipping: verdictData.estimatedShipping,

                // Analysis data
                common_complaints: verdictData.commonComplaints,
                failure_reasons: verdictData.failureReasons,
                best_audience: verdictData.bestAudience,
                avoid_audience: verdictData.avoidAudience,
                money_saved: verdictData.moneySaved,

                analyzed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (saveError) {
            console.error('Database Save Error:', saveError);
            throw saveError;
        }

        return NextResponse.json({
            product: savedProduct,
            cached: false
        });

    } catch (error) {
        console.error('Analyze API Error:', error.message);
        return NextResponse.json(
            { error: error.message || 'Analysis failed. Please try again later.' },
            { status: 500 }
        );
    }
}

function extractProductNameFromUrl(url) {
    if (!url) return 'Product';
    try {
        const urlObj = new URL(url);
        // Amazon
        if (url.includes('amazon.com')) {
            const match = url.match(/\/([^\/]+)\/dp\//);
            if (match) return match[1].replace(/-/g, ' ');
        }
        // eBay
        if (url.includes('ebay.com')) {
            const match = url.match(/\/itm\/([^\/]+)/);
            if (match) return match[1].replace(/-/g, ' ');
        }
        // Fallback
        const parts = urlObj.pathname.split('/').filter(p => p.length > 3);
        return parts.length > 0 ? parts[parts.length - 1].replace(/-/g, ' ') : 'Product';
    } catch (e) {
        return 'Product';
    }
}
