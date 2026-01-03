// Amazon Product Scraper using Playwright
// Scrapes product data for trend detection and market proof

import { chromium } from 'playwright';

export class AmazonScraper {
    constructor() {
        this.baseUrl = 'https://www.amazon.com';
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async scrapeProduct(productUrl) {
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const context = await browser.newContext({
                userAgent: this.getRandomUserAgent(),
                viewport: { width: 1920, height: 1080 }
            });

            const page = await context.newPage();

            // Navigate to product page
            await page.goto(productUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // Wait for product details to load
            await page.waitForSelector('#productTitle', { timeout: 10000 });

            // Extract product data
            const productData = await page.evaluate(() => {
                // Helper function to safely get text
                const getText = (selector) => {
                    const element = document.querySelector(selector);
                    return element ? element.textContent.trim() : null;
                };

                // Helper function to safely get attribute
                const getAttr = (selector, attr) => {
                    const element = document.querySelector(selector);
                    return element ? element.getAttribute(attr) : null;
                };

                // Extract ASIN from URL or page
                const asin = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ||
                    document.querySelector('[data-asin]')?.getAttribute('data-asin');

                // Extract title
                const title = getText('#productTitle');

                // Extract price
                const priceWhole = getText('.a-price-whole');
                const priceFraction = getText('.a-price-fraction');
                const price = priceWhole && priceFraction ?
                    parseFloat(`${priceWhole.replace(/,/g, '')}.${priceFraction}`) : null;

                // Extract rating
                const ratingText = getText('.a-icon-alt');
                const rating = ratingText ? parseFloat(ratingText.match(/(\d+\.?\d*)/)?.[1]) : null;

                // Extract review count
                const reviewCountText = getText('#acrCustomerReviewText');
                const reviewCount = reviewCountText ?
                    parseInt(reviewCountText.replace(/[^\d]/g, '')) : null;

                // Extract seller info
                const sellerName = getText('#sellerProfileTriggerId') ||
                    getText('#bylineInfo') ||
                    'Amazon';

                // Extract seller count (from "X sellers" text)
                const sellerCountText = getText('#merchant-info') || '';
                const sellerCount = sellerCountText.match(/(\d+)\s+sellers?/i)?.[1] ?
                    parseInt(sellerCountText.match(/(\d+)\s+sellers?/i)[1]) : 1;

                // Extract category
                const category = getText('#wayfinding-breadcrumbs_feature_div li:last-child a') ||
                    getText('[data-feature-name="breadcrumbs"] a:last-child');

                // Extract BSR (Best Sellers Rank)
                const bsrText = getText('#SalesRank') ||
                    getText('#productDetails_detailBullets_sections1 tr:has-text("Best Sellers Rank") td') ||
                    Array.from(document.querySelectorAll('#detailBullets_feature_div li'))
                        .find(li => li.textContent.includes('Best Sellers Rank'))?.textContent;
                const rank = bsrText ? parseInt(bsrText.match(/#([\d,]+)/)?.[1]?.replace(/,/g, '') || '0') : null;

                // Extract image
                const imageUrl = getAttr('#landingImage', 'src') ||
                    getAttr('#imgBlkFront', 'src');

                return {
                    product_id: asin,
                    title,
                    price,
                    currency: 'USD',
                    rating,
                    review_count: reviewCount,
                    seller_name: sellerName,
                    seller_count: sellerCount,
                    category,
                    rank,
                    image_url: imageUrl,
                    product_url: window.location.href
                };
            });

            await browser.close();

            return {
                success: true,
                platform: 'Amazon',
                data: productData
            };

        } catch (error) {
            await browser.close();
            console.error('Scraping error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Scrape trending products from Best Sellers page
    async scrapeTrendingProducts(category = 'all', limit = 20) {
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const products = [];
        try {
            const context = await browser.newContext({
                userAgent: this.getRandomUserAgent(),
                viewport: { width: 1920, height: 1080 }
            });

            const page = await context.newPage();

            // Navigate to Best Sellers page
            const url = category === 'all'
                ? `${this.baseUrl}/Best-Sellers/zgbs`
                : `${this.baseUrl}/Best-Sellers-${category}/zgbs/${category}`;

            console.log(`[AmazonScraper] Navigating to: ${url}`);
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            // Wait for products to load
            await page.waitForSelector('.zg-item-immersion', { timeout: 10000 });

            // Extract product links
            const productLinks = await page.evaluate((limit) => {
                const items = document.querySelectorAll('.zg-item-immersion');
                const links = [];

                for (let i = 0; i < Math.min(items.length, limit); i++) {
                    const link = items[i].querySelector('a.a-link-normal');
                    if (link) {
                        links.push(link.href);
                    }
                }

                return links;
            }, limit);

            console.log(`[AmazonScraper] Found ${productLinks.length} products to scrape. Reusing browser...`);

            // REUSE BROWSER: Scrape each product link using the SAME browser instance
            for (const link of productLinks) {
                try {
                    const productPage = await context.newPage();
                    await productPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await productPage.waitForSelector('#productTitle', { timeout: 10000 });

                    const productData = await productPage.evaluate(() => {
                        const getText = (selector) => {
                            const element = document.querySelector(selector);
                            return element ? element.textContent.trim() : null;
                        };
                        const getAttr = (selector, attr) => {
                            const element = document.querySelector(selector);
                            return element ? element.getAttribute(attr) : null;
                        };

                        const asin = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ||
                            document.querySelector('[data-asin]')?.getAttribute('data-asin');

                        // Price extraction
                        const priceWhole = getText('.a-price-whole');
                        const priceFraction = getText('.a-price-fraction');
                        const price = priceWhole && priceFraction ?
                            parseFloat(`${priceWhole.replace(/,/g, '')}.${priceFraction}`) : null;

                        return {
                            product_id: asin,
                            title: getText('#productTitle'),
                            price,
                            currency: 'USD',
                            rating: parseFloat(getText('.a-icon-alt')?.match(/(\d+\.?\d*)/)?.[1]) || null,
                            review_count: parseInt(getText('#acrCustomerReviewText')?.replace(/[^\d]/g, '')) || null,
                            seller_name: getText('#sellerProfileTriggerId') || getText('#bylineInfo') || 'Amazon',
                            seller_count: parseInt(getText('#merchant-info')?.match(/(\d+)\s+sellers?/i)?.[1]) || 1,
                            category: getText('#wayfinding-breadcrumbs_feature_div li:last-child a'),
                            rank: parseInt(getText('#SalesRank')?.match(/#([\d,]+)/)?.[1]?.replace(/,/g, '') || '0') || null,
                            image_url: getAttr('#landingImage', 'src') || getAttr('#imgBlkFront', 'src'),
                            product_url: window.location.href
                        };
                    });

                    products.push(productData);
                    await productPage.close(); // Close only the page, keep browser/context open
                    console.log(`  ✓ Scraped: ${productData.title?.substring(0, 30)}...`);
                } catch (err) {
                    console.error(`  ✗ Failed to scrape product: ${link}`, err.message);
                }

                // Small delay to be respectful, but much faster than restarting browser
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return {
                success: true,
                platform: 'Amazon',
                category,
                products
            };

        } catch (error) {
            console.error('[AmazonScraper] Trending scraping error:', error);
            return { success: false, error: error.message };
        } finally {
            await browser.close();
        }
    }
}

// Export for use in API routes
export default AmazonScraper;
