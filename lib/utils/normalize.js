/**
 * Data normalization utilities
 */

import { normalizeTitle, cleanProductName } from './text.js';
import { normalizePrice } from './price.js';

export function normalizeProductData(rawProduct) {
    return {
        platform: rawProduct.platform || 'Unknown',
        title: cleanProductName(rawProduct.title),
        normalizedTitle: normalizeTitle(rawProduct.title),
        price: normalizePrice(rawProduct.price),
        reviews: parseInt(rawProduct.reviews) || 0,
        rating: parseFloat(rawProduct.rating) || null,
        url: rawProduct.url || null,
        timestamp: new Date().toISOString()
    };
}

export function deduplicateProducts(products) {
    const seen = new Set();

    return products.filter(product => {
        const key = `${product.normalizedTitle}-${product.platform}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
