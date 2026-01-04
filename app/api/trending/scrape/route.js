import { NextResponse } from 'next/server';
import AmazonScraper from '@/lib/scrapers/amazonScraper';
import { supabase } from '@/lib/supabase';

const amazonScraper = new AmazonScraper();

export async function POST(request) {
    try {
        console.log('[API] Trending scrape triggered');

        const result = await amazonScraper.scrapeTrendingProducts('all', 10);

        if (result.success) {
            for (const product of result.products) {
                const record = {
                    name: product.title,
                    normalized_name: product.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
                    price: product.price,
                    product_url: product.product_url,
                    source: 'Amazon',
                    category: product.category,
                    active_listings_count: product.seller_count,
                    price_min: product.price,
                    price_max: product.price,
                    last_updated: new Date().toISOString()
                };

                await supabase.from('trending_products').upsert(record, { onConflict: 'product_url' });
            }
        }

        return NextResponse.json({
            success: true,
            productsScraped: result.products?.length || 0,
            ...result
        });

    } catch (error) {
        console.error('[API] Trending scraper error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}

