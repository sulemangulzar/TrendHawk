// Duplicate Detection System
// Uses string similarity to detect duplicate products

const stringSimilarity = require('string-similarity');

/**
 * Check if a product is a duplicate of any existing product
 * @param {Object} newProduct - Product to check
 * @param {Array} existingProducts - Array of existing products
 * @returns {boolean} - True if duplicate found
 */
function isDuplicate(newProduct, existingProducts) {
    for (const existing of existingProducts) {
        // Check 1: Exact URL match
        if (newProduct.product_url && existing.product_url) {
            if (newProduct.product_url === existing.product_url) {
                console.log(`[Dedup] URL match: ${newProduct.name}`);
                return true;
            }
        }

        // Check 2: Name similarity (>85% match)
        if (newProduct.normalized_name && existing.normalized_name) {
            const similarity = stringSimilarity.compareTwoStrings(
                newProduct.normalized_name,
                existing.normalized_name
            );

            if (similarity > 0.85) {
                console.log(`[Dedup] Name similarity ${(similarity * 100).toFixed(1)}%: ${newProduct.name}`);
                return true;
            }
        }
    }

    return false;
}

/**
 * Remove duplicates from an array of products
 * Keeps the first occurrence of each unique product
 */
function removeDuplicates(products) {
    const unique = [];

    for (const product of products) {
        if (!isDuplicate(product, unique)) {
            unique.push(product);
        }
    }

    console.log(`[Dedup] ${products.length} products → ${unique.length} unique (removed ${products.length - unique.length} duplicates)`);
    return unique;
}

module.exports = {
    isDuplicate,
    removeDuplicates
};
