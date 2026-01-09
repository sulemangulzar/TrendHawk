import { createStealthContext, addStealthScripts, simulateHumanBehavior } from './browserManager.js';

export async function scrapeAmazon(query, limit = 10) {
    const context = await createStealthContext();
    const page = await context.newPage();

    // Add stealth scripts
    await addStealthScripts(page);

    // Block unnecessary resources for speed (but keep HTML/JS)
    await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
            route.abort();
        } else {
            route.continue();
        }
    });

    const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    const results = [];

    try {
        console.log(`[Amazon] Navigating to: ${url}`);

        // Navigate with realistic timing
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Simulate human behavior
        await simulateHumanBehavior(page);

        // Wait for search results to load
        await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 })
            .catch(() => console.log('[Amazon] Search results selector not found'));

        const items = await page.$$('[data-component-type="s-search-result"]');
        console.log(`[Amazon] Found ${items.length} items`);

        for (let i = 0; i < Math.min(items.length, limit); i++) {
            const item = items[i];

            try {
                // Extract title
                const title = await item.$eval('h2 a span', el => el.textContent.trim())
                    .catch(() => null);

                // Extract price - try multiple methods
                let price = null;

                // Method 1: Whole + Fraction
                const priceWhole = await item.$eval('.a-price-whole', el => el.textContent)
                    .catch(() => null);
                const priceFraction = await item.$eval('.a-price-fraction', el => el.textContent)
                    .catch(() => null);

                if (priceWhole) {
                    const whole = priceWhole.replace(/[^0-9]/g, '');
                    const fraction = priceFraction ? priceFraction.replace(/[^0-9]/g, '') : '00';
                    price = parseFloat(`${whole}.${fraction}`);
                }

                // Method 2: Fallback to any price element
                if (!price) {
                    const priceText = await item.$eval('.a-price .a-offscreen', el => el.textContent)
                        .catch(() => null);
                    if (priceText) {
                        price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                    }
                }

                // Extract reviews count
                let reviews = 0;
                const reviewText = await item.evaluate((el) => {
                    const ratingSpan = el.querySelector('span[aria-label*="stars"]');
                    if (ratingSpan && ratingSpan.parentElement) {
                        const nextSibling = ratingSpan.parentElement.nextElementSibling;
                        return nextSibling ? nextSibling.textContent : null;
                    }
                    return null;
                }).catch(() => null);

                if (reviewText) {
                    const match = reviewText.match(/[\d,]+/);
                    if (match) {
                        reviews = parseInt(match[0].replace(/,/g, '')) || 0;
                    }
                }

                // Extract rating
                let rating = null;
                const ratingText = await item.$eval('span[aria-label*="out of 5 stars"]',
                    el => el.getAttribute('aria-label'))
                    .catch(() => null);
                if (ratingText) {
                    const match = ratingText.match(/[\d.]+/);
                    if (match) rating = parseFloat(match[0]);
                }

                // Extract URL
                const productUrl = await item.$eval('h2 a', el => el.href)
                    .catch(() => null);

                // Only add if we have minimum required data
                if (title && price) {
                    results.push({
                        platform: 'Amazon',
                        title: title.trim(),
                        price: price,
                        reviews: reviews,
                        rating: rating,
                        url: productUrl,
                        currency: 'USD'
                    });

                    console.log(`[Amazon] ✓ ${title.substring(0, 50)}... - $${price} (${reviews} reviews)`);
                }
            } catch (itemError) {
                console.error(`[Amazon] Error processing item ${i}:`, itemError.message);
            }
        }

        console.log(`[Amazon] Successfully scraped ${results.length} products`);

    } catch (error) {
        console.error('[Amazon] Scraping error:', error.message);
    } finally {
        await page.close();
        await context.close();
    }

    return results;
}
