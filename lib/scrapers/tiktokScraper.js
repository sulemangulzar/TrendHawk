// TikTok Creative Center Scraper
// Scrapes trending products from TikTok using Playwright

const { chromium } = require('playwright');

/**
 * Scrape TikTok Creative Center Trending Products
 * Returns array of trending products
 */
async function scrapeTikTokTrending() {
    console.log('[TikTok Scraper] Starting...');

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    // Block unnecessary resources
    await context.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (['image', 'media', 'font', 'stylesheet'].includes(resourceType)) {
            route.abort();
        } else {
            route.continue();
        }
    });

    const page = await context.newPage();
    const products = [];

    try {
        console.log('[TikTok Scraper] Navigating to Creative Center...');

        await page.goto('https://ads.tiktok.com/business/creativecenter/inspiration/popular/product/pc/en', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait for content to load
        await page.waitForTimeout(5000);

        // Extract trending products
        const scrapedProducts = await page.evaluate(() => {
            const items = [];
            // Target containers that likely hold product information
            const cards = Array.from(document.querySelectorAll('[class*="CardContainer"], [class*="ItemCard"], .item-card'));

            cards.forEach((card, index) => {
                if (index >= 20) return;

                const titleEl = card.querySelector('[class*="Title"], [class*="ProductName"], h3, h4');
                const categoryEl = card.querySelector('[class*="Category"], [class*="Industries"]');
                const rankEl = card.querySelector('[class*="RankNumber"], .rank-index');

                const name = titleEl?.textContent?.trim();
                const category = categoryEl?.textContent?.trim() || 'Other';
                const rank = parseInt(rankEl?.textContent) || (index + 1);

                if (name) {
                    items.push({
                        name,
                        url: `https://www.google.com/search?q=${encodeURIComponent(name)}+product`,
                        category,
                        rank,
                        price: null
                    });
                }
            });
            return items;
        });

        products.push(...scrapedProducts.map(p => ({
            ...p,
            source: 'TikTok'
        })));

        console.log(`[TikTok Scraper] Found ${products.length} products`);

    } catch (error) {
        console.error('[TikTok Scraper] Error:', error.message);
    } finally {
        await browser.close();
    }

    return products;
}

module.exports = {
    scrapeTikTokTrending
};
