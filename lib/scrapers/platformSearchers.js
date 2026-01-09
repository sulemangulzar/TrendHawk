import { chromium } from 'playwright';

export class PlatformSearchers {
    constructor() {
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        this.browser = null;
    }

    async initBrowser() {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            });
        }
        return this.browser;
    }

    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async searchAmazon(query, limit = 3) {
        const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
        const browser = await this.initBrowser();
        const context = await browser.newContext({
            userAgent: this.userAgent,
            viewport: { width: 1280, height: 720 }
        });

        const page = await context.newPage();
        await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,css,woff,woff2,ttf,otf}', route => route.abort());

        const results = [];
        try {
            console.log(`[Amazon] Scraping: ${url}`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await page.waitForTimeout(1500);

            const items = await page.$$('[data-component-type="s-search-result"]');

            for (let i = 0; i < Math.min(items.length, limit); i++) {
                const item = items[i];

                // Extract title
                const title = await item.$eval('h2 a span', el => el.textContent.trim()).catch(() => null);

                // Extract price - try multiple selectors
                let price = null;
                const priceWhole = await item.$eval('.a-price .a-price-whole', el => el.textContent).catch(() => null);
                const priceFraction = await item.$eval('.a-price .a-price-fraction', el => el.textContent).catch(() => null);

                if (priceWhole) {
                    const whole = priceWhole.replace(/[^0-9]/g, '');
                    const fraction = priceFraction ? priceFraction.replace(/[^0-9]/g, '') : '00';
                    price = parseFloat(`${whole}.${fraction}`);
                }

                // Extract reviews count
                let reviews = 0;
                const reviewText = await item.$eval('span[aria-label*="stars"]', el => {
                    const parent = el.parentElement;
                    return parent ? parent.nextElementSibling?.textContent : null;
                }).catch(() => null);

                if (reviewText) {
                    reviews = parseInt(reviewText.replace(/[^0-9]/g, '')) || 0;
                }

                // Extract URL
                const productUrl = await item.$eval('h2 a', el => el.href).catch(() => null);

                if (title && price) {
                    results.push({
                        platform: 'Amazon',
                        title,
                        price,
                        reviews,
                        sales_signal: 0,
                        activity: 'medium',
                        url: productUrl
                    });
                }
            }
        } catch (error) {
            console.error(`[Amazon] Search failed:`, error.message);
        } finally {
            await page.close();
            await context.close();
        }
        return results;
    }

    async searchEbay(query, limit = 3) {
        const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;
        const browser = await this.initBrowser();
        const context = await browser.newContext({
            userAgent: this.userAgent,
            viewport: { width: 1280, height: 720 }
        });

        const page = await context.newPage();
        await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,css,woff,woff2,ttf,otf}', route => route.abort());

        const results = [];
        try {
            console.log(`[eBay] Scraping: ${url}`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await page.waitForTimeout(1500);

            const items = await page.$$('.s-item');

            for (let i = 0; i < Math.min(items.length, limit); i++) {
                const item = items[i];

                const title = await item.$eval('.s-item__title', el => el.textContent.trim()).catch(() => null);

                let price = null;
                const priceText = await item.$eval('.s-item__price', el => el.textContent.trim()).catch(() => null);
                if (priceText) {
                    price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                }

                let reviews = 0;
                const reviewText = await item.$eval('.s-item__reviews-count span', el => el.textContent).catch(() => null);
                if (reviewText) {
                    reviews = parseInt(reviewText.replace(/[^0-9]/g, '')) || 0;
                }

                const productUrl = await item.$eval('.s-item__link', el => el.href).catch(() => null);

                if (title && price && !title.includes('Shop on eBay')) {
                    results.push({
                        platform: 'eBay',
                        title,
                        price,
                        reviews,
                        sales_signal: 0,
                        activity: 'medium',
                        url: productUrl
                    });
                }
            }
        } catch (error) {
            console.error(`[eBay] Search failed:`, error.message);
        } finally {
            await page.close();
            await context.close();
        }
        return results;
    }

    async searchAliExpress(query, limit = 3) {
        // AliExpress has heavy anti-bot protection, skip for now
        console.log('[AliExpress] Skipped due to anti-bot protection');
        return [];
    }

}

export default PlatformSearchers;

