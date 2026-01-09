import { createStealthContext, addStealthScripts, simulateHumanBehavior } from '../browserManager.js';

/**
 * Enhanced Generic E-commerce Scraper with Stealth
 * Works with ANY website - Shopify, WooCommerce, custom stores
 */
export async function scrapeGenericStore(url) {
    const context = await createStealthContext();
    const page = await context.newPage();

    await addStealthScripts(page);

    // Block only images for speed, keep CSS/JS for better extraction
    await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (['image', 'media'].includes(resourceType)) {
            route.abort();
        } else {
            route.continue();
        }
    });

    try {
        console.log(`[Generic] Navigating to: ${url}`);

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 20000
        });

        await simulateHumanBehavior(page);

        // Strategy 1: Try Open Graph meta tags (most reliable)
        const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content).catch(() => null);
        const ogPrice = await page.$eval('meta[property="og:price:amount"]', el => el.content).catch(() => null);
        const ogCurrency = await page.$eval('meta[property="og:price:currency"]', el => el.content).catch(() => null);
        const ogImage = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);

        // Strategy 2: Try Schema.org structured data
        let schemaData = null;
        try {
            schemaData = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
                for (const script of scripts) {
                    try {
                        const data = JSON.parse(script.textContent);
                        if (data['@type'] === 'Product') return data;
                        if (data['@graph']) {
                            const product = data['@graph'].find(item => item['@type'] === 'Product');
                            if (product) return product;
                        }
                    } catch (e) { }
                }
                return null;
            });
        } catch (e) { }

        // Strategy 3: Try common e-commerce selectors
        const h1Title = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
        const productTitle = await page.$eval('[class*="product-title"], [class*="product_title"], [class*="ProductTitle"], [itemprop="name"]',
            el => el.textContent.trim()).catch(() => null);

        // Strategy 4: Try multiple price selectors
        const priceSelectors = [
            '[itemprop="price"]',
            '[class*="price"]:not([class*="compare"])',
            '[data-price]',
            '.product-price',
            '.price-item',
            'span[class*="Price"]',
            '.money',
            '[class*="current-price"]'
        ];

        let price = null;
        for (const selector of priceSelectors) {
            try {
                const priceText = await page.$eval(selector, el => {
                    return el.textContent || el.content || el.getAttribute('data-price') || el.getAttribute('content');
                });

                if (priceText) {
                    const cleaned = priceText.replace(/[^\d.]/g, '');
                    if (cleaned && parseFloat(cleaned) > 0) {
                        price = parseFloat(cleaned);
                        break;
                    }
                }
            } catch (e) { }
        }

        // Strategy 5: Try to find reviews/ratings
        let reviews = 0;
        let rating = null;

        const reviewSelectors = [
            '[itemprop="reviewCount"]',
            '[class*="review-count"]',
            '[class*="reviews"]',
            '[class*="rating-count"]'
        ];

        for (const selector of reviewSelectors) {
            const reviewText = await page.$eval(selector, el => el.textContent || el.getAttribute('content'))
                .catch(() => null);
            if (reviewText) {
                const match = reviewText.match(/[\d,]+/);
                if (match) {
                    reviews = parseInt(match[0].replace(/,/g, '')) || 0;
                    if (reviews > 0) break;
                }
            }
        }

        const ratingSelectors = [
            '[itemprop="ratingValue"]',
            '[class*="rating"]',
            '[class*="star"]'
        ];

        for (const selector of ratingSelectors) {
            const ratingText = await page.$eval(selector, el => el.textContent || el.getAttribute('content'))
                .catch(() => null);
            if (ratingText) {
                const match = ratingText.match(/[\d.]+/);
                if (match) {
                    rating = parseFloat(match[0]);
                    if (rating > 0 && rating <= 5) break;
                }
            }
        }

        // Strategy 6: Try to detect stock status
        const inStock = await page.evaluate(() => {
            const text = document.body.textContent.toLowerCase();
            if (text.includes('out of stock') || text.includes('sold out') || text.includes('unavailable')) return false;
            if (text.includes('in stock') || text.includes('add to cart') || text.includes('buy now')) return true;
            return null;
        });

        // Compile the best data we found
        const title = ogTitle || schemaData?.name || productTitle || h1Title;
        const finalPrice = ogPrice || schemaData?.offers?.price || price;
        const currency = ogCurrency || schemaData?.offers?.priceCurrency || 'USD';

        const result = {
            platform: 'External Store',
            title: title?.trim() || null,
            price: finalPrice ? parseFloat(finalPrice) : null,
            currency: currency,
            reviews: reviews,
            rating: rating,
            inStock: inStock,
            image: ogImage || schemaData?.image || null,
            url: url,
            confidence: (title && finalPrice) ? 'high' : (title || finalPrice) ? 'medium' : 'low'
        };

        console.log(`[Generic] ✓ Extracted: ${result.title?.substring(0, 50) || 'Unknown'} - $${result.price || 'N/A'}`);

        return result;

    } catch (error) {
        console.error('[Generic] Scraping error:', error.message);
        return {
            platform: 'External Store',
            title: null,
            price: null,
            url: url,
            error: error.message,
            confidence: 'low'
        };
    } finally {
        await page.close();
        await context.close();
    }
}

/**
 * Shopify-specific scraper (optimized for Shopify stores)
 */
export async function scrapeShopify(url) {
    const context = await createStealthContext();
    const page = await context.newPage();

    await addStealthScripts(page);

    try {
        console.log(`[Shopify] Navigating to: ${url}`);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await simulateHumanBehavior(page);

        // Shopify stores expose product data via JSON
        const productJson = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
            for (const script of scripts) {
                try {
                    const data = JSON.parse(script.textContent);
                    if (data['@type'] === 'Product') return data;
                } catch (e) { }
            }
            return null;
        });

        if (productJson) {
            const result = {
                platform: 'Shopify',
                title: productJson.name,
                price: parseFloat(productJson.offers?.price || 0),
                currency: productJson.offers?.priceCurrency || 'USD',
                rating: parseFloat(productJson.aggregateRating?.ratingValue || 0),
                reviews: parseInt(productJson.aggregateRating?.reviewCount || 0),
                inStock: productJson.offers?.availability === 'https://schema.org/InStock',
                image: productJson.image,
                url: url,
                confidence: 'high'
            };

            console.log(`[Shopify] ✓ ${result.title?.substring(0, 50)} - $${result.price}`);
            return result;
        }

        // Fallback to generic scraper
        return await scrapeGenericStore(url);

    } catch (error) {
        console.error('[Shopify] Error:', error.message);
        return await scrapeGenericStore(url);
    } finally {
        await page.close();
        await context.close();
    }
}
