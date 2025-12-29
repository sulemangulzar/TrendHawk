// QUICK FIX: Replace extractEbayProductData function in lib/scraper.js
// Lines 249-333

async function extractEbayProductData(element, keyword) {
    try {
        // Title - use textContent instead of innerText
        let title = 'N/A';
        const titleEl = await element.$('.s-item__title');
        if (titleEl) {
            const text = await titleEl.textContent();
            if (text && text.trim() && !text.includes('Shop on eBay')) {
                title = text.trim();
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
        const linkEl = await element.$('a.s-item__link');
        if (linkEl) {
            productUrl = await linkEl.getAttribute('href');
        }

        // Image
        const imgEl = await element.$('img');
        const imageUrl = imgEl ? await imgEl.getAttribute('src') : null;

        // Only return if we got a title
        if (title === 'N/A') return null;

        return {
            title,
            price,
            image_url: imageUrl,
            product_url: productUrl,
            review_count: 0,
            rating: null,
            keyword,
            source: 'ebay',
        };
    } catch (error) {
        console.error('eBay extraction error:', error);
        return null;
    }
}

// KEY CHANGE: innerText() → textContent()
// This fixes the N/A issue!
