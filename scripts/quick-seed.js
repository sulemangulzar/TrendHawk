// Quick test seed script - manually adds some sample products
// Use this if the Amazon scraper times out

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Sample products data (real products, fake but realistic data)
const sampleProducts = [
    {
        product_id: 'B0CHXH4HRN',
        title: 'Apple AirPods Pro (2nd Generation)',
        price: 189.99,
        rating: 4.7,
        review_count: 45230,
        seller_count: 3,
        category: 'Electronics',
        rank: 42,
        product_url: 'https://amazon.com/dp/B0CHXH4HRN'
    },
    {
        product_id: 'B09B8RRHL8',
        title: 'Amazon Echo Dot (5th Gen)',
        price: 49.99,
        rating: 4.6,
        review_count: 23450,
        seller_count: 1,
        category: 'Smart Home',
        rank: 156,
        product_url: 'https://amazon.com/dp/B09B8RRHL8'
    },
    {
        product_id: 'B0BSHF7WHW',
        title: 'Fire TV Stick 4K Max',
        price: 59.99,
        rating: 4.5,
        review_count: 18920,
        seller_count: 2,
        category: 'Electronics',
        rank: 234,
        product_url: 'https://amazon.com/dp/B0BSHF7WHW'
    },
    {
        product_id: 'B08J5F3G18',
        title: 'Ring Video Doorbell',
        price: 99.99,
        rating: 4.4,
        review_count: 12340,
        seller_count: 4,
        category: 'Home Security',
        rank: 567,
        product_url: 'https://amazon.com/dp/B08J5F3G18'
    },
    {
        product_id: 'B0BYMWDMZH',
        title: 'Wireless Charger 3-in-1',
        price: 39.99,
        rating: 4.3,
        review_count: 8920,
        seller_count: 45,
        category: 'Phone Accessories',
        rank: 1234,
        product_url: 'https://amazon.com/dp/B0BYMWDMZH'
    },
    {
        product_id: 'B09JQL7NWT',
        title: 'Apple Watch Series 9',
        price: 399.00,
        rating: 4.8,
        review_count: 34560,
        seller_count: 7,
        category: 'Wearables',
        rank: 89,
        product_url: 'https://amazon.com/dp/B09JQL7NWT'
    },
    {
        product_id: 'B0CX23V2ZK',
        title: 'USB-C Cable 6ft (3-Pack)',
        price: 12.99,
        rating: 4.2,
        review_count: 5670,
        seller_count: 89,
        category: 'Phone Accessories',
        rank: 2345,
        product_url: 'https://amazon.com/dp/B0CX23V2ZK'
    },
    {
        product_id: 'B0C39QMZNF',
        title: 'Bluetooth Speaker Waterproof',
        price: 29.99,
        rating: 4.5,
        review_count: 7650,
        seller_count: 23,
        category: 'Audio',
        rank: 876,
        product_url: 'https://amazon.com/dp/B0C39QMZNF'
    },
    {
        product_id: 'B0BX7PZ8GH',
        title: 'Phone Mount for Car',
        price: 19.99,
        rating: 4.4,
        review_count: 4560,
        seller_count: 56,
        category: 'Car Accessories',
        rank: 1567,
        product_url: 'https://amazon.com/dp/B0BX7PZ8GH'
    },
    {
        product_id: 'B0CFPMVZZM',
        title: 'Portable Power Bank 20000mAh',
        price: 34.99,
        rating: 4.6,
        review_count: 9870,
        seller_count: 34,
        category: 'Phone Accessories',
        rank: 678,
        product_url: 'https://amazon.com/dp/B0CFPMVZZM'
    }
];

async function quickSeed() {
    console.log('🚀 Quick seeding database with sample products...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const product of sampleProducts) {
        try {
            // Save to product_snapshots
            const { error: snapshotError } = await supabase
                .from('product_snapshots')
                .insert({
                    product_id: product.product_id,
                    platform: 'Amazon',
                    title: product.title,
                    price: product.price,
                    currency: 'USD',
                    rating: product.rating,
                    review_count: product.review_count,
                    seller_name: 'Amazon',
                    seller_count: product.seller_count,
                    category: product.category,
                    rank: product.rank,
                    image_url: null,
                    product_url: product.product_url
                });

            if (snapshotError) throw snapshotError;

            // Save to trending_products
            const { error: trendingError } = await supabase
                .from('trending_products')
                .insert({
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
                });

            if (trendingError && !trendingError.message.includes('unique constraint')) {
                throw trendingError;
            } else if (trendingError) {
                console.log(`  - Already exists: ${product.title?.substring(0, 30)}...`);
            } else {
                successCount++;
                console.log(`  ✓ ${product.title}`);
            }

        } catch (error) {
            errorCount++;
            console.error(`  ✗ Error saving product:`, JSON.stringify(error, null, 2));
        }
    }

    console.log(`\n✅ Quick seed complete!`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log(`\n🎉 Database now has sample products for testing!`);
}

quickSeed().then(() => {
    console.log('Done!');
    process.exit(0);
}).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
