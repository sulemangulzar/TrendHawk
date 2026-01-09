import { getBrowser } from './browserManager.js';

export async function scrapeAnyProduct(url) {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const title =
            (await page.$eval('meta[property="og:title"]', el => el.content).catch(() => null)) ||
            (await page.$eval('h1', el => el.textContent).catch(() => null));

        const price =
            (await page.$eval('[itemprop="price"]', el => el.content).catch(() => null)) ||
            (await page.$eval('[class*="price"]', el => el.textContent).catch(() => null));

        return {
            platform: 'External',
            title: title?.trim() || null,
            price: price ? parseFloat(price.replace(/[^\d.]/g, '')) : null,
            url
        };
    } catch (error) {
        console.error('[Universal Scraper] Error:', error.message);
        return null;
    } finally {
        await page.close();
        await context.close();
    }
}
