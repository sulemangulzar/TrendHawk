/**
 * Text normalization utilities
 */

export function normalizeTitle(title) {
    if (!title) return '';

    return title
        .trim()
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
        .toLowerCase();
}

export function extractKeywords(title) {
    if (!title) return [];

    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const normalized = normalizeTitle(title);

    return normalized
        .split(' ')
        .filter(word => word.length > 2 && !stopWords.includes(word))
        .slice(0, 5); // Top 5 keywords
}

export function cleanProductName(name) {
    if (!name) return '';

    // Remove common noise patterns
    return name
        .replace(/\[.*?\]/g, '') // Remove bracketed text
        .replace(/\(.*?\)/g, '') // Remove parenthetical text
        .replace(/\b(new|used|refurbished|certified|renewed)\b/gi, '')
        .replace(/\b(free shipping|fast delivery)\b/gi, '')
        .trim();
}
