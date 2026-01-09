/**
 * Price normalization and analysis utilities
 */

export function normalizePrice(priceString, currency = 'USD') {
    if (!priceString) return null;

    // Extract numeric value
    const cleaned = priceString.toString().replace(/[^\d.]/g, '');
    const price = parseFloat(cleaned);

    return isNaN(price) ? null : price;
}

export function calculatePriceVariation(prices) {
    if (!prices || prices.length === 0) return 0;

    const validPrices = prices.filter(p => p !== null && p > 0);
    if (validPrices.length === 0) return 0;

    const max = Math.max(...validPrices);
    const min = Math.min(...validPrices);

    return max === 0 ? 0 : ((max - min) / max) * 100;
}

export function getPriceRange(prices) {
    const validPrices = prices.filter(p => p !== null && p > 0);

    if (validPrices.length === 0) {
        return { min: null, max: null, avg: null };
    }

    const min = Math.min(...validPrices);
    const max = Math.max(...validPrices);
    const avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;

    return { min, max, avg: Math.round(avg * 100) / 100 };
}
