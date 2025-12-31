/**
 * Hardened Unified Product Scraper using Playwright
 */

import { chromium } from 'playwright';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Main entry point for scraping
 */
export async function scrapeProducts(input) {
    const isUrl = input.startsWith('http');
    console.log(`🚀 Starting scraping for: ${input} (isUrl: ${isUrl})`);

    if (isUrl) {
        let results = await scrapeSpecificUrl(input);

        // If specific URL fails (e.g., blocked), try search using a keyword extracted from the URL
        if (results.length === 0) {
            console.log("⚠️ Specific URL scraping yielded no results. Trying search fallback...");
            const keyword = extractKeywordFromUrl(input);
            return await scrapeAmazonSearch(keyword);
        }
        return results;
    } else {
        return await scrapeAmazonSearch(input);
    }
}

function extractKeywordFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(p => p.length > 3);
        if (parts.length > 0) {
            return parts[parts.length - 1].replace(/-/g, ' ');
        }
        return "product";
    } catch (e) {
        return "product";
    }
}

/**
 * Scrape a specific product page URL
 */
export async function scrapeSpecificUrl(url) {
    let browser;
    try {
        console.log(`🌐 ScrapeSpecificUrl: ${url}`);
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const context = await browser.newContext({
            userAgent: USER_AGENT,
            viewport: { width: 1280, height: 800 }
        });

        // Block heavy resources
        await context.route('**/*', (route) => {
            const type = route.request().resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        const page = await context.newPage();
        await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });

        // Wait a bit for dynamic prices
        await page.waitForTimeout(2000);

        let productData = null;

        if (url.includes('amazon.com')) {
            productData = await extractAmazonDetailPage(page, url);
        } else if (url.includes('ebay.com')) {
            productData = await extractEbayDetailPage(page, url);
        } else {
            productData = await extractGenericPage(page, url);
        }

        if (productData && productData.title !== 'Unknown Product') {
            console.log(`✅ Extracted: ${productData.title} | Price: ${productData.price}`);
            return [productData];
        }

        return [];

    } catch (error) {
        console.error('Scraping error:', error.message);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * Scrape Amazon search results
 */
export async function scrapeAmazonSearch(keyword) {
    console.log(`🔍 ScrapeAmazonSearch: ${keyword}`);
    const products = [];
    let browser;

    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const context = await browser.newContext({ userAgent: USER_AGENT });
        const page = await context.newPage();

        const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
        await page.goto(searchUrl, { timeout: 45000, waitUntil: 'domcontentloaded' });

        const content = await page.content();
        if (content.includes('To discuss automated access to Amazon data')) {
            console.log("❌ Amazon robot detection triggered.");
            return [];
        }

        await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 15000 }).catch(() => null);
        const productElements = await page.$$('[data-component-type="s-search-result"]');

        for (const element of productElements.slice(0, 5)) {
            const product = await extractAmazonSearchResult(element, keyword);
            if (product && product.price > 0) {
                products.push(product);
            }
        }
    } catch (error) {
        console.error('Search error:', error.message);
    } finally {
        if (browser) await browser.close();
    }

    return products;
}

/**
 * Robust Price Extraction
 */
function cleanPrice(priceStr) {
    if (!priceStr || typeof priceStr !== 'string') return 0;
    try {
        // Remove currency symbols, commas
        const cleaned = priceStr.replace(/[^\d.,]/g, '');
        // Handle comma as thousand separator (US) vs decimal separator (EU)
        // If there's a dot and a comma, comma is likely thousands
        if (cleaned.includes(',') && cleaned.includes('.')) {
            return parseFloat(cleaned.replace(/,/g, ''));
        }
        // If only comma and it's near the end (2 digits), it's likely decimal
        if (cleaned.includes(',') && cleaned.split(',')[1].length === 2) {
            return parseFloat(cleaned.replace(',', '.'));
        }
        return parseFloat(cleaned.replace(/,/g, '')) || 0;
    } catch (e) {
        return 0;
    }
}

/**
 * Extraction Helpers
 */
async function extractAmazonSearchResult(element, keyword) {
    try {
        const titleEl = await element.$('h2 a span');
        const title = titleEl ? await titleEl.innerText() : 'N/A';

        const priceEl = await element.$('.a-price .a-offscreen');
        const priceText = priceEl ? await priceEl.innerText() : null;
        const price = cleanPrice(priceText);

        const linkEl = await element.$('h2 a');
        let productUrl = linkEl ? await linkEl.getAttribute('href') : null;
        if (productUrl && !productUrl.startsWith('http')) {
            productUrl = `https://www.amazon.com${productUrl.split('?')[0]}`;
        }

        const imgEl = await element.$('img.s-image');
        const imageUrl = imgEl ? await imgEl.getAttribute('src') : null;

        return {
            title: title.trim(),
            price: price || 0,
            image_url: imageUrl,
            product_url: productUrl,
            source: 'amazon',
            keyword
        };
    } catch (e) {
        return null;
    }
}

async function extractAmazonDetailPage(page, url) {
    try {
        const title = await page.innerText('#productTitle').catch(() => 'Unknown Product');

        const priceSelectors = [
            '#priceblock_ourprice',
            '#priceblock_dealprice',
            '.a-price .a-offscreen',
            '#corePrice_feature_div .a-offscreen',
            '#price_inside_buybox',
            '#priceblock_saleprice'
        ];

        let price = 0;
        for (const selector of priceSelectors) {
            const el = await page.$(selector);
            if (el) {
                const text = await el.innerText();
                const cleaned = cleanPrice(text);
                if (cleaned > 0) {
                    price = cleaned;
                    break;
                }
            }
        }

        const imgEl = await page.$('#landingImage') || await page.$('#imgBlkFront');
        const imageUrl = imgEl ? await imgEl.getAttribute('src') : null;

        return {
            title: title.trim(),
            price,
            image_url: imageUrl,
            product_url: url,
            source: 'amazon'
        };
    } catch (e) {
        return null;
    }
}

async function extractEbayDetailPage(page, url) {
    try {
        const title = await page.innerText('.x-item-title__mainTitle').catch(() => 'Unknown Product');
        const priceEl = await page.$('.x-price-primary');
        const price = priceEl ? cleanPrice(await priceEl.innerText()) : 0;

        const imgEl = await page.$('.ux-image-magnify__image--read-only');
        const imageUrl = imgEl ? await imgEl.getAttribute('src') : null;

        return {
            title: title.trim(),
            price,
            image_url: imageUrl,
            product_url: url,
            source: 'ebay'
        };
    } catch (e) {
        return null;
    }
}

async function extractGenericPage(page, url) {
    try {
        const title = await page.title() || await page.$eval('h1', el => el.innerText).catch(() => 'Unknown Product');
        const imageUrl = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);
        const priceText = await page.$$eval('.price, .product-price, [class*="price"]', els => {
            const found = els.find(e => /\d/.test(e.innerText) && e.innerText.length < 20);
            return found ? found.innerText : null;
        });

        return {
            title: title.trim(),
            price: cleanPrice(priceText),
            image_url: imageUrl,
            product_url: url,
            source: 'web'
        };
    } catch (e) {
        return null;
    }
}
