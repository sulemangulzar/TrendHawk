/**
 * Multi-Platform Product Scraper using Playwright
 * Supports: Amazon, eBay
 * Includes resource blocking to save bandwidth
 */

import { chromium } from 'playwright';

// Main scraper router
export async function scrapeProducts(keyword, platform = 'amazon') {
    if (platform === 'ebay') {
        return await scrapeEbayProducts(keyword);
    }
    return await scrapeAmazonProducts(keyword);
}

export async function scrapeAmazonProducts(keyword) {
    const products = [];
    let browser;

    try {
        // Launch browser
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        // Create context with resource blocking
        const context = await browser.newContext();

        // CRITICAL: Block images, fonts, CSS to save bandwidth (80-90% savings!)
        await context.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        const page = await context.newPage();

        // Navigate to Amazon search
        const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
        await page.goto(searchUrl, { timeout: 30000, waitUntil: 'domcontentloaded' });

        // Wait for results
        await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });

        // Extract product data
        const productElements = await page.$$('[data-component-type="s-search-result"]');

        for (const element of productElements.slice(0, 20)) {
            try {
                const product = await extractProductData(element, keyword);
                if (product) {
                    products.push(product);
                }
            } catch (error) {
                console.error('Error extracting product:', error);
            }
        }

    } catch (error) {
        console.error('Scraping error:', error);
        throw new Error(`Failed to scrape products: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return products;
}

async function extractProductData(element, keyword) {
    try {
        // Title - try multiple selectors
        let title = 'N/A';
        const titleSelectors = [
            'h2 a span',
            'h2 span',
            'h2 a',
            '.a-size-medium',
            '.a-size-base-plus'
        ];

        for (const selector of titleSelectors) {
            const titleEl = await element.$(selector);
            if (titleEl) {
                const text = await titleEl.innerText();
                if (text && text.trim() && text !== 'N/A') {
                    title = text.trim();
                    break;
                }
            }
        }

        // Price
        const priceWholeEl = await element.$('.a-price-whole');
        const priceFractionEl = await element.$('.a-price-fraction');

        let price = null;
        if (priceWholeEl) {
            let priceText = await priceWholeEl.innerText();
            if (priceFractionEl) {
                const fractionText = await priceFractionEl.innerText();
                priceText = `${priceText}.${fractionText}`;
            }
            price = parseFloat(priceText.replace(/[^\d.]/g, ''));
        }

        // Product URL
        let productUrl = null;
        const linkEl = await element.$('h2 a');
        if (linkEl) {
            productUrl = await linkEl.getAttribute('href');
            if (productUrl) {
                // Clean up the URL - remove ref and other tracking params
                if (!productUrl.startsWith('http')) {
                    productUrl = `https://www.amazon.com${productUrl}`;
                }
                // Extract just the product path
                try {
                    const url = new URL(productUrl);
                    productUrl = `https://www.amazon.com${url.pathname}`;
                } catch (e) {
                    // Keep original if URL parsing fails
                }
            }
        }

        // Image URL
        const imgEl = await element.$('img.s-image');
        const imageUrl = imgEl ? await imgEl.getAttribute('src') : null;

        // Reviews count
        const reviewsEl = await element.$('span[aria-label*="stars"] + span');
        let reviewCount = 0;
        if (reviewsEl) {
            const reviewsText = await reviewsEl.innerText();
            const match = reviewsText.match(/([\d,]+)/);
            if (match) {
                reviewCount = parseInt(match[1].replace(/,/g, ''));
            }
        }

        // Rating
        const ratingEl = await element.$('span[aria-label*="stars"]');
        let rating = null;
        if (ratingEl) {
            const ratingText = await ratingEl.getAttribute('aria-label');
            const match = ratingText.match(/([\d.]+)/);
            if (match) {
                rating = parseFloat(match[1]);
            }
        }

        return {
            title: title.trim(),
            price,
            image_url: imageUrl,
            product_url: productUrl,
            review_count: reviewCount,
            rating,
            keyword,
            source: 'amazon',
        };
    } catch (error) {
        console.error('Error extracting product data:', error);
        return null;
    }
}

// eBay Product Scraper
export async function scrapeEbayProducts(keyword) {
    const products = [];
    let browser;

    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const context = await browser.newContext();

        // Resource blocking for eBay
        await context.route('**/*', (route) => {
            const resourceType = route.request().resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        const page = await context.newPage();

        // Navigate to eBay search
        const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keyword)}`;
        console.log('eBay URL:', searchUrl);
        await page.goto(searchUrl, { timeout: 30000, waitUntil: 'networkidle' });

        // Wait a bit for dynamic content
        await page.waitForTimeout(2000);

        // Try multiple selectors for eBay results
        let productElements = [];
        try {
            await page.waitForSelector('.s-item', { timeout: 15000 });
            productElements = await page.$$('.s-item');
        } catch (e) {
            console.log('Trying alternative selector...');
            try {
                await page.waitForSelector('[class*="s-item"]', { timeout: 10000 });
                productElements = await page.$$('[class*="s-item"]');
            } catch (e2) {
                console.log('Trying ul li selector...');
                productElements = await page.$$('ul.srp-results li.s-item');
            }
        }

        console.log(`Found ${productElements.length} eBay products`);

        for (const element of productElements.slice(0, 20)) {
            try {
                const product = await extractEbayProductData(element, keyword);
                if (product) {
                    products.push(product);
                }
            } catch (error) {
                console.error('Error extracting eBay product:', error);
            }
        }

    } catch (error) {
        console.error('eBay scraping error:', error);
        throw new Error(`Failed to scrape eBay products: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return products;
}

async function extractEbayProductData(element, keyword) {
    try {
        // Title
        let title = 'N/A';
        const titleSelectors = ['.s-item__title', 'h3'];

        for (const selector of titleSelectors) {
            const titleEl = await element.$(selector);
            if (titleEl) {
                const text = await titleEl.textContent();
                if (text && text.trim() && !text.includes('Shop on eBay')) {
                    title = text.trim();
                    break;
                }
            }
        }

        // Price
        let price = null;
        const priceEl = await element.$('.s-item__price');
        if (priceEl) {
            const priceText = await priceEl.textContent();
            const match = priceText.match(/[\d,]+\.?\d*/);
            if (match) {
                price = parseFloat(match[0].replace(/,/g, ''));
            }
        }

        // Product URL
        let productUrl = null;
        const linkEl = await element.$('.s-item__link');
        if (linkEl) {
            productUrl = await linkEl.getAttribute('href');
            // Clean URL
            if (productUrl) {
                try {
                    const url = new URL(productUrl);
                    productUrl = `${url.origin}${url.pathname}`;
                } catch (e) {
                    // Keep original
                }
            }
        }

        // Image URL
        const imgEl = await element.$('.s-item__image-img');
        const imageUrl = imgEl ? await imgEl.getAttribute('src') : null;

        // Reviews/Sold count (eBay shows "X sold" instead of reviews)
        let reviewCount = 0;
        const soldEl = await element.$('.s-item__hotness');
        if (soldEl) {
            const soldText = await soldEl.innerText();
            const match = soldText.match(/(\d+[\d,]*)\s*sold/i);
            if (match) {
                reviewCount = parseInt(match[1].replace(/,/g, ''));
            }
        }

        // Rating (eBay doesn't always show ratings in search)
        let rating = null;
        const ratingEl = await element.$('.x-star-rating');
        if (ratingEl) {
            const ratingText = await ratingEl.innerText();
            const match = ratingText.match(/(\d+\.?\d*)/);
            if (match) {
                rating = parseFloat(match[1]);
            }
        }

        return {
            title: title.trim(),
            price,
            image_url: imageUrl,
            product_url: productUrl,
            review_count: reviewCount,
            rating,
            keyword,
            source: 'ebay',
        };
    } catch (error) {
        console.error('Error extracting eBay product data:', error);
        return null;
    }
}

