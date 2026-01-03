// Product Normalization Utilities
// Used for deduplication and category mapping

/**
 * Normalize product name for deduplication
 * Converts to lowercase and removes special characters
 */
function normalizeProductName(name) {
    if (!name) return '';

    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove all special characters
        .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
        .trim();
}

/**
 * Normalize category names
 * Maps various category formats to standardized names
 */
function normalizeCategory(category) {
    if (!category) return 'Other';

    const normalizedInput = category.toLowerCase().trim();

    // Map to MVP buckets
    if (normalizedInput.includes('kitchen') || normalizedInput.includes('home')) return 'Home & Kitchen';
    if (normalizedInput.includes('beauty') || normalizedInput.includes('personal care')) return 'Beauty & Personal Care';
    if (normalizedInput.includes('electronics') || normalizedInput.includes('gadget')) return 'Electronics';
    if (normalizedInput.includes('fitness') || normalizedInput.includes('sport') || normalizedInput.includes('outdoor')) return 'Fitness';
    if (normalizedInput.includes('fashion') || normalizedInput.includes('clothing') || normalizedInput.includes('apparel')) return 'Fashion';
    if (normalizedInput.includes('pet')) return 'Pets';
    if (normalizedInput.includes('kid') || normalizedInput.includes('baby') || normalizedInput.includes('toy')) return 'Kids';

    return 'Other';
}

/**
 * Extract price from text
 * Handles various price formats
 */
function extractPrice(priceText) {
    if (!priceText) return null;

    // Remove currency symbols and extract number
    const match = priceText.match(/[\d,]+\.?\d*/);
    if (!match) return null;

    const price = parseFloat(match[0].replace(/,/g, ''));
    return isNaN(price) ? null : price;
}

module.exports = {
    normalizeProductName,
    normalizeCategory,
    extractPrice
};
