import { createStealthContext, addStealthScripts, simulateHumanBehavior } from './browserManager.js';

export async function scrapeEbay(query, limit = 10) {
    const context = await createStealthContext();
    const page = await context.newPage();

    await addStealthScripts(page);

    // Block unnecessary resources
    await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
            route.abort();
        } else {
            route.continue();
        }
    });

    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;
    const results = [];

    try {
        console.log(`[eBay] Navigating to: ${url}`);

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        await simulateHumanBehavior(page);

        // Wait for items to load
        await page.waitForSelector('.s-item', { timeout: 10000 })
            .catch(() => console.log('[eBay] Items selector not found'));

        const items = await page.$$('.s-item');
        console.log(`[eBay] Found ${items.length} items`);

        for (let i = 0; i < Math.min(items.length, limit); i++) {
            const item = items[i];

            try {
                const title = await item.$eval('.s-item__title', el => el.textContent.trim())
                    .catch(() => null);

                // Skip sponsored/header items
                if (!title || title.includes('Shop on eBay') || title.includes('Sponsored')) {
                    continue;
                }

                // Extract price
                let price = null;
                const priceText = await item.$eval('.s-item__price', el => el.textContent.trim())
                    .catch(() => null);

                if (priceText) {
                    // Handle price ranges (take the first price)
                    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                    if (priceMatch) {
                        price = parseFloat(priceMatch[0].replace(/,/g, ''));
                    }
                }

                // Extract reviews
                let reviews = 0;
                const reviewText = await item.$eval('.s-item__reviews-count span', el => el.textContent)
                    .catch(() => null);

                if (reviewText) {
                    const match = reviewText.match(/[\d,]+/);
                    if (match) {
                        reviews = parseInt(match[0].replace(/,/g, '')) || 0;
                    }
                }

                // Extract rating
                let rating = null;
                const ratingText = await item.$eval('.x-star-rating', el => el.textContent)
                    .catch(() => null);
                if (ratingText) {
                    const match = ratingText.match(/[\d.]+/);
                    if (match) rating = parseFloat(match[0]);
                }

                // Extract URL
                const productUrl = await item.$eval('.s-item__link', el => el.href)
                    .catch(() => null);

                // Extract shipping info
                const shipping = await item.$eval('.s-item__shipping', el => el.textContent.trim())
                    .catch(() => null);
                const freeShipping = shipping && shipping.toLowerCase().includes('free');

                if (title && price) {
                    results.push({
                        platform: 'eBay',
                        title: title.trim(),
                        price: price,
                        reviews: reviews,
                        rating: rating,
                        url: productUrl,
                        currency: 'USD',
                        freeShipping: freeShipping
                    });

                    console.log(`[eBay] ✓ ${title.substring(0, 50)}... - $${price} (${reviews} reviews)`);
                }
            } catch (itemError) {
                console.error(`[eBay] Error processing item ${i}:`, itemError.message);
            }
        }

        console.log(`[eBay] Successfully scraped ${results.length} products`);

    } catch (error) {
        console.error('[eBay] Scraping error:', error.message);
    } finally {
        await page.close();
        await context.close();
    }

    return results;
}
