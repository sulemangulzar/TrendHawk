// Simplified Trending Products Scraper with Mock Data
// This version provides immediate test data while the real scraper can be enhanced later

const CATEGORIES = [
    'Electronics',
    'Fashion',
    'Home & Kitchen',
    'Sports & Outdoors',
    'Toys & Games',
    'Books',
    'Beauty & Personal Care',
    'Health & Household',
    'Automotive',
    'Tools & Home Improvement'
];

// Mock trending products for testing
const MOCK_PRODUCTS = [
    // Electronics
    { title: 'Wireless Bluetooth Earbuds', category: 'Electronics', price: 29.99, platform: 'Amazon' },
    { title: 'Smart Watch Fitness Tracker', category: 'Electronics', price: 49.99, platform: 'Amazon' },
    { title: 'USB-C Fast Charger', category: 'Electronics', price: 19.99, platform: 'eBay' },
    { title: 'Portable Power Bank 20000mAh', category: 'Electronics', price: 34.99, platform: 'Amazon' },

    // Fashion
    { title: 'Cotton T-Shirt Pack of 3', category: 'Fashion', price: 24.99, platform: 'Amazon' },
    { title: 'Running Shoes for Men', category: 'Fashion', price: 59.99, platform: 'eBay' },
    { title: 'Leather Wallet RFID Blocking', category: 'Fashion', price: 18.99, platform: 'Amazon' },

    // Home & Kitchen
    { title: 'Stainless Steel Cookware Set', category: 'Home & Kitchen', price: 89.99, platform: 'Amazon' },
    { title: 'Coffee Maker 12-Cup', category: 'Home & Kitchen', price: 44.99, platform: 'eBay' },
    { title: 'Non-Stick Frying Pan', category: 'Home & Kitchen', price: 29.99, platform: 'Amazon' },

    // Sports & Outdoors
    { title: 'Yoga Mat Extra Thick', category: 'Sports & Outdoors', price: 22.99, platform: 'Amazon' },
    { title: 'Resistance Bands Set', category: 'Sports & Outdoors', price: 15.99, platform: 'eBay' },
    { title: 'Water Bottle 32oz', category: 'Sports & Outdoors', price: 12.99, platform: 'Amazon' },

    // Toys & Games
    { title: 'Building Blocks Set 500 Pieces', category: 'Toys & Games', price: 34.99, platform: 'Amazon' },
    { title: 'Board Game Family Night', category: 'Toys & Games', price: 24.99, platform: 'eBay' },

    // Books
    { title: 'Bestselling Fiction Novel', category: 'Books', price: 14.99, platform: 'Amazon' },
    { title: 'Self-Help Success Guide', category: 'Books', price: 16.99, platform: 'Amazon' },

    // Beauty & Personal Care
    { title: 'Facial Cleanser Set', category: 'Beauty & Personal Care', price: 19.99, platform: 'Amazon' },
    { title: 'Hair Dryer Professional', category: 'Beauty & Personal Care', price: 39.99, platform: 'eBay' },

    // Health & Household
    { title: 'Vitamin D3 Supplements', category: 'Health & Household', price: 12.99, platform: 'Amazon' },
    { title: 'First Aid Kit Complete', category: 'Health & Household', price: 24.99, platform: 'Amazon' },
];

/**
 * Generate mock trending products
 */
async function scrapeTrendingProducts() {
    console.log('Generating mock trending products...');

    const products = MOCK_PRODUCTS.map((product, index) => ({
        title: product.title,
        category: product.category,
        price: product.price,
        image_url: `https://via.placeholder.com/300x300/84cc16/ffffff?text=${encodeURIComponent(product.title.substring(0, 20))}`,
        product_url: `https://example.com/product/${index + 1}`,
        platform: product.platform,
        rank: (index % 20) + 1
    }));

    console.log(`Generated ${products.length} mock trending products`);
    return products;
}

module.exports = {
    scrapeTrendingProducts,
    CATEGORIES
};
