// API endpoint for manual scraping and data refresh
import { NextResponse } from 'next/server';
import AmazonScraper from '@/lib/scrapers/amazonScraper';
import { supabase } from '@/lib/supabase';

const amazonScraper = new AmazonScraper();

// POST /api/scrape - Manually trigger scraping
export async function POST(request) {
    try {
        const body = await request.json();
        const { action, productUrl, category, limit } = body;

        if (action === 'product') {
            // Scrape single product
            if (!productUrl) {
                return NextResponse.json({ error: 'Product URL required' }, { status: 400 });
            }

            const result = await amazonScraper.scrapeProduct(productUrl);

            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 500 });
            }

            // Save snapshot
            await saveProductSnapshot({
                ...result.data,
                platform: 'Amazon'
            });

            return NextResponse.json({
                success: true,
                data: result.data
            });
        }

        if (action === 'trending') {
            const result = await amazonScraper.scrapeTrendingProducts(
                category || 'all',
                limit || 10
            );

            if (result.success) {
                for (const product of result.products) {
                    await saveProductSnapshot({
                        ...product,
                        platform: 'Amazon'
                    });
                }
            }

            return NextResponse.json(result);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Scraping API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper function to save snapshot
async function saveProductSnapshot(productData) {
    const { error } = await supabase
        .from('product_snapshots')
        .insert({
            product_id: productData.product_id,
            platform: productData.platform,
            title: productData.title,
            price: productData.price,
            currency: productData.currency || 'USD',
            rating: productData.rating,
            review_count: productData.review_count,
            seller_name: productData.seller_name,
            seller_count: productData.seller_count,
            category: productData.category,
            rank: productData.rank,
            image_url: productData.image_url,
            product_url: productData.product_url
        });

    if (error) {
        console.error('Error saving snapshot:', error);
    }

    // Also update trending_products
    const { data: existing } = await supabase
        .from('trending_products')
        .select('id')
        .eq('product_url', productData.product_url)
        .single();

    const record = {
        name: productData.title,
        normalized_name: productData.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
        price: productData.price,
        product_url: productData.product_url,
        source: productData.platform,
        category: productData.category,
        active_listings_count: productData.seller_count,
        price_min: productData.price,
        price_max: productData.price,
        last_updated: new Date().toISOString()
    };

    if (existing) {
        await supabase
            .from('trending_products')
            .update(record)
            .eq('id', existing.id);
    } else {
        await supabase
            .from('trending_products')
            .insert(record);
    }
}
