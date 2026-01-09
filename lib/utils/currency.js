/**
 * Currency Conversion Utilities
 * Supports multi-currency analysis
 */

// Exchange rates (update these periodically or use an API)
const EXCHANGE_RATES = {
    'USD': 1.00,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 149.50,
    'INR': 83.12,
    'PKR': 278.50,
    'CAD': 1.35,
    'AUD': 1.52,
    'CNY': 7.24
};

export function convertToUSD(amount, fromCurrency) {
    if (!amount || !fromCurrency) return null;

    const rate = EXCHANGE_RATES[fromCurrency.toUpperCase()];
    if (!rate) return amount; // Return original if currency not found

    return amount / rate;
}

export function formatPrice(amount, currency = 'USD') {
    if (!amount) return 'N/A';

    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹',
        'PKR': 'Rs',
        'CAD': 'C$',
        'AUD': 'A$',
        'CNY': '¥'
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
}

export function normalizePriceToUSD(product) {
    if (!product.price) return { ...product, priceUSD: null };

    const priceUSD = convertToUSD(product.price, product.currency || 'USD');

    return {
        ...product,
        priceUSD: priceUSD,
        originalPrice: product.price,
        originalCurrency: product.currency || 'USD'
    };
}
