require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const dummyProducts = [
    // Hot Products (Score >= 75)
    {
        name: 'Wireless Noise Cancelling Headphones',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE1',
        category: 'Electronics',
        source: 'Amazon',
        trend_score: 90,
        verdict: 'Hot',
        price: 149.99,
        current_rank_or_position: 1
    },
    {
        name: 'Smart Home Security Camera System',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE2',
        category: 'Electronics',
        source: 'Amazon',
        trend_score: 85,
        verdict: 'Hot',
        price: 199.99,
        current_rank_or_position: 2
    },
    {
        name: 'LED Desk Lamp with USB Charging',
        product_url: 'https://www.tiktok.com/@shop/product/12345',
        category: 'Home & Kitchen',
        source: 'TikTok',
        trend_score: 80,
        verdict: 'Hot',
        price: 39.99,
        current_rank_or_position: 1
    },
    {
        name: 'Organic Face Serum with Vitamin C',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE3',
        category: 'Beauty & Personal Care',
        source: 'Amazon',
        trend_score: 78,
        verdict: 'Hot',
        price: 24.99,
        current_rank_or_position: 3
    },

    // Rising Products (Score 40-74)
    {
        name: 'Resistance Bands Set for Home Workout',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE4',
        category: 'Fitness',
        source: 'Amazon',
        trend_score: 65,
        verdict: 'Rising',
        price: 29.99,
        current_rank_or_position: 5
    },
    {
        name: 'Stainless Steel Water Bottle',
        product_url: 'https://www.tiktok.com/@shop/product/67890',
        category: 'Fitness',
        source: 'TikTok',
        trend_score: 60,
        verdict: 'Rising',
        price: 19.99,
        current_rank_or_position: 3
    },
    {
        name: 'Minimalist Leather Wallet',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE5',
        category: 'Fashion',
        source: 'Amazon',
        trend_score: 55,
        verdict: 'Rising',
        price: 34.99,
        current_rank_or_position: 8
    },
    {
        name: 'Automatic Pet Feeder',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE6',
        category: 'Pets',
        source: 'Amazon',
        trend_score: 50,
        verdict: 'Rising',
        price: 79.99,
        current_rank_or_position: 12
    },
    {
        name: 'Silicone Baking Mat Set',
        product_url: 'https://www.tiktok.com/@shop/product/11223',
        category: 'Home & Kitchen',
        source: 'TikTok',
        trend_score: 48,
        verdict: 'Rising',
        price: 15.99,
        current_rank_or_position: 6
    },
    {
        name: 'Kids Educational Tablet',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE7',
        category: 'Kids',
        source: 'Amazon',
        trend_score: 45,
        verdict: 'Rising',
        price: 89.99,
        current_rank_or_position: 15
    },

    // Watch Products (Score < 40)
    {
        name: 'Portable Phone Charger 10000mAh',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE8',
        category: 'Electronics',
        source: 'Amazon',
        trend_score: 35,
        verdict: 'Watch',
        price: 25.99,
        current_rank_or_position: 18
    },
    {
        name: 'Yoga Mat with Carrying Strap',
        product_url: 'https://www.tiktok.com/@shop/product/44556',
        category: 'Fitness',
        source: 'TikTok',
        trend_score: 30,
        verdict: 'Watch',
        price: 22.99,
        current_rank_or_position: 10
    },
    {
        name: 'Ceramic Coffee Mug Set',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE9',
        category: 'Home & Kitchen',
        source: 'Amazon',
        trend_score: 28,
        verdict: 'Watch',
        price: 18.99,
        current_rank_or_position: 20
    },
    {
        name: 'Natural Lip Balm 3-Pack',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE10',
        category: 'Beauty & Personal Care',
        source: 'Amazon',
        trend_score: 25,
        verdict: 'Watch',
        price: 12.99,
        current_rank_or_position: 25
    },
    {
        name: 'Denim Jacket Vintage Style',
        product_url: 'https://www.tiktok.com/@shop/product/77889',
        category: 'Fashion',
        source: 'TikTok',
        trend_score: 22,
        verdict: 'Watch',
        price: 45.99,
        current_rank_or_position: 14
    },
    {
        name: 'Interactive Cat Toy',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE11',
        category: 'Pets',
        source: 'Amazon',
        trend_score: 20,
        verdict: 'Watch',
        price: 16.99,
        current_rank_or_position: 28
    },
    {
        name: 'Building Blocks Set 500 Pieces',
        product_url: 'https://www.amazon.com/dp/B08EXAMPLE12',
        category: 'Kids',
        source: 'Amazon',
        trend_score: 18,
        verdict: 'Watch',
        price: 32.99,
        current_rank_or_position: 30
    },
    {
        name: 'Bluetooth Speaker Waterproof',
        product_url: 'https://www.tiktok.com/@shop/product/99001',
        category: 'Electronics',
        source: 'TikTok',
        trend_score: 15,
        verdict: 'Watch',
        price: 35.99,
        current_rank_or_position: 18
    }
];

async function seedTrendingProducts() {
    console.log('🌱 Starting to seed trending products...');

    try {
        // First, clear existing trending products
        const { error: deleteError } = await supabase
            .from('trending_products')
            .delete()
            .neq('id', 0); // Delete all rows

        if (deleteError) {
            console.error('Error clearing existing products:', deleteError);
        } else {
            console.log('✅ Cleared existing trending products');
        }

        // Add normalized_name and expires_at to each product
        const productsToInsert = dummyProducts.map(product => ({
            ...product,
            normalized_name: product.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours from now
        }));

        // Insert dummy products
        const { data, error } = await supabase
            .from('trending_products')
            .insert(productsToInsert)
            .select();

        if (error) {
            console.error('❌ Error inserting products:', error);
            process.exit(1);
        }

        console.log(`✅ Successfully inserted ${data.length} trending products!`);
        console.log('\n📊 Summary:');
        console.log(`   🔥 Hot: ${dummyProducts.filter(p => p.verdict === 'Hot').length}`);
        console.log(`   📈 Rising: ${dummyProducts.filter(p => p.verdict === 'Rising').length}`);
        console.log(`   👀 Watch: ${dummyProducts.filter(p => p.verdict === 'Watch').length}`);
        console.log('\n🎉 Seeding complete! Visit /dashboard/trending to see the products.');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

seedTrendingProducts();
