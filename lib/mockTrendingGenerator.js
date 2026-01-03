// Mock Trending Products Generator
// Generates test data for development without needing Playwright

const { supabase } = require('./supabase');
const { normalizeProductName, normalizeCategory } = require('./utils/productNormalizer');
const { calculateTrendScore, assignVerdict } = require('./utils/trendScorer');

const MOCK_PRODUCTS = [
    // Electronics
    { name: 'Wireless Bluetooth Earbuds Pro', category: 'Electronics', price: 29.99, url: 'https://amazon.com/product/1', source: 'Amazon', rank: 1 },
    { name: 'Smart Watch Fitness Tracker 2024', category: 'Electronics', price: 49.99, url: 'https://amazon.com/product/2', source: 'Amazon', rank: 2 },
    { name: 'USB-C Fast Charger 65W', category: 'Electronics', price: 19.99, url: 'https://amazon.com/product/3', source: 'Amazon', rank: 3 },
    { name: 'Portable Power Bank 20000mAh', category: 'Electronics', price: 34.99, url: 'https://amazon.com/product/4', source: 'Amazon', rank: 4 },
    { name: 'Wireless Gaming Mouse RGB', category: 'Electronics', price: 39.99, url: 'https://amazon.com/product/5', source: 'Amazon', rank: 5 },

    // Fashion
    { name: 'Premium Cotton T-Shirt Pack', category: 'Fashion', price: 24.99, url: 'https://amazon.com/product/6', source: 'Amazon', rank: 6 },
    { name: 'Running Shoes for Men Lightweight', category: 'Fashion', price: 59.99, url: 'https://amazon.com/product/7', source: 'Amazon', rank: 7 },
    { name: 'Leather Wallet RFID Blocking', category: 'Fashion', price: 18.99, url: 'https://amazon.com/product/8', source: 'Amazon', rank: 8 },
    { name: 'Sunglasses Polarized UV Protection', category: 'Fashion', price: 22.99, url: 'https://amazon.com/product/9', source: 'Amazon', rank: 9 },

    // Home & Kitchen
    { name: 'Stainless Steel Cookware Set 10-Piece', category: 'Home & Kitchen', price: 89.99, url: 'https://amazon.com/product/10', source: 'Amazon', rank: 10 },
    { name: 'Coffee Maker 12-Cup Programmable', category: 'Home & Kitchen', price: 44.99, url: 'https://amazon.com/product/11', source: 'Amazon', rank: 11 },
    { name: 'Non-Stick Frying Pan Set', category: 'Home & Kitchen', price: 29.99, url: 'https://amazon.com/product/12', source: 'Amazon', rank: 12 },
    { name: 'Electric Kettle Fast Boil', category: 'Home & Kitchen', price: 25.99, url: 'https://amazon.com/product/13', source: 'Amazon', rank: 13 },

    // Sports & Outdoors
    { name: 'Yoga Mat Extra Thick Non-Slip', category: 'Sports & Outdoors', price: 22.99, url: 'https://amazon.com/product/14', source: 'Amazon', rank: 14 },
    { name: 'Resistance Bands Set of 5', category: 'Sports & Outdoors', price: 15.99, url: 'https://amazon.com/product/15', source: 'Amazon', rank: 15 },
    { name: 'Water Bottle 32oz Insulated', category: 'Sports & Outdoors', price: 12.99, url: 'https://amazon.com/product/16', source: 'Amazon', rank: 16 },
    { name: 'Camping Tent 4-Person Waterproof', category: 'Sports & Outdoors', price: 79.99, url: 'https://amazon.com/product/17', source: 'Amazon', rank: 17 },

    // TikTok Products
    { name: 'LED Strip Lights RGB Smart', category: 'Electronics', price: 16.99, url: 'https://tiktok.com/product/1', source: 'TikTok', rank: 1 },
    { name: 'Portable Blender for Smoothies', category: 'Home & Kitchen', price: 27.99, url: 'https://tiktok.com/product/2', source: 'TikTok', rank: 2 },
    { name: 'Facial Cleansing Brush Electric', category: 'Beauty & Personal Care', price: 19.99, url: 'https://tiktok.com/product/3', source: 'TikTok', rank: 3 },
];

async function generateMockTrendingProducts() {
    console.log('[Mock Generator] Creating test trending products...');

    // Normalize and score products
    const normalizedProducts = MOCK_PRODUCTS.map(p => ({
        name: p.name,
        normalized_name: normalizeProductName(p.name),
        product_url: p.url,
        category: p.category,
        normalized_category: normalizeCategory(p.category),
        price: p.price,
        source: p.source,
        rank: p.rank
    }));

    // Calculate trend scores
    const scoredProducts = normalizedProducts.map(p => {
        const trendScore = calculateTrendScore(p, normalizedProducts);
        const verdict = assignVerdict(trendScore);

        return {
            ...p,
            trend_score: trendScore,
            verdict: verdict
        };
    });

    // Save to database
    const { data, error } = await supabase
        .from('trending_products')
        .insert(scoredProducts);

    if (error) {
        console.error('[Mock Generator] Error:', error);
        throw error;
    }

    console.log(`[Mock Generator] ✓ Created ${scoredProducts.length} test products`);
    return scoredProducts;
}

module.exports = {
    generateMockTrendingProducts
};
