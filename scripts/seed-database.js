// Seed script to populate database with initial Amazon data
// Run this once to get started with real data

import dotenv from 'dotenv';
import AmazonScraper from '../lib/scrapers/amazonScraper.js';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const amazonScraper = new AmazonScraper();

async function seedDatabase() {
    console.log('🌱 Starting database seed with Amazon Best Sellers...');
    console.log('This will scrape 20 trending products from Amazon\n');

    try {
        // Scrape Amazon Best Sellers
        const result = await amazonScraper.scrapeTrendingProducts('all', 20);

        if (!result.success) {
            console.error('❌ Scraping failed:', result.error);
            return;
        }

        console.log(`✅ Scraped ${result.products.length} products from Amazon`);

        // Save each product to database
        let successCount = 0;
        let errorCount = 0;

        for (const product of result.products) {
            try {
                // Save to product_snapshots
                const { error: snapshotError } = await supabase
                    .from('product_snapshots')
                    .insert({
                        product_id: product.product_id,
                        platform: 'Amazon',
                        title: product.title,
                        price: product.price,
                        currency: product.currency || 'USD',
                        rating: product.rating,
                        review_count: product.review_count,
                        seller_name: product.seller_name,
                        seller_count: product.seller_count,
                        category: product.category,
                        rank: product.rank,
                        image_url: product.image_url,
                        product_url: product.product_url
                    });

                if (snapshotError) throw snapshotError;

                // Save to trending_products
                const { error: trendingError } = await supabase
                    .from('trending_products')
                    .upsert({
                        name: product.title,
                        price: product.price,
                        product_url: product.product_url,
                        source: 'Amazon',
                        category: product.category,
                        active_listings_count: product.seller_count,
                        price_min: product.price,
                        price_max: product.price,
                        last_updated: new Date().toISOString()
                    }, {
                        onConflict: 'product_url'
                    });

                if (trendingError) throw trendingError;

                successCount++;
                console.log(`  ✓ Saved: ${product.title?.substring(0, 50)}...`);

            } catch (error) {
                errorCount++;
                console.error(`  ✗ Error saving product:`, error.message);
            }

            // Delay to avoid overwhelming database
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`\n✅ Seed complete!`);
        console.log(`   Successful: ${successCount}`);
        console.log(`   Failed: ${errorCount}`);
        console.log(`\n🎉 Your database now has real Amazon data!`);
        console.log(`   Check Market Proof tab to see products`);
        console.log(`   Try Risk Check with real product names\n`);

    } catch (error) {
        console.error('❌ Seed failed:', error);
    }
}

// Run the seed
seedDatabase().then(() => {
    console.log('Done!');
    process.exit(0);
}).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
