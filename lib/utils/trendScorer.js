// Trend Scoring and Verdict Assignment
// Calculates trend scores and assigns verdicts (Hot/Rising/Watch)

/**
 * Calculate trend score for a product (1-100)
 * Based on:
 * - Appears on multiple sources (+30)
 * - High rank jump (+40) - Simplified: rank 1-5 gets +40
 * - Recent appearance (+30) - All newly scraped products get +30 in this context
 */
function calculateTrendScore(product, allProducts) {
    let score = 0;

    // 1. Multi-source bonus (+30)
    const appearances = allProducts.filter(p =>
        p.normalized_name === product.normalized_name
    );
    if (appearances.length > 1) score += 30;

    // 2. High rank jump / High rank bonus (+40)
    // In an MVP, we bonus the highest ranked items
    if (product.rank <= 5) {
        score += 40;
    } else if (product.rank <= 10) {
        score += 20;
    }

    // 3. Recent appearance (+30)
    // Since we are scraping "now", these are all technically recent
    score += 30;

    return Math.min(score, 100);
}

/**
 * Assign verdict based on trend score
 * 🔥 Hot: Score ≥ 75
 * 📈 Rising: Score 40–74
 * 👀 Watch: Score < 40
 */
function assignVerdict(trendScore) {
    if (trendScore >= 75) return 'Hot';
    if (trendScore >= 40) return 'Rising';
    return 'Watch';
}

/**
 * Get verdict emoji
 */
function getVerdictEmoji(verdict) {
    const emojis = {
        'Hot': '🔥',
        'Rising': '📈',
        'Watch': '👀'
    };
    return emojis[verdict] || '👀';
}

/**
 * Get verdict color class
 */
function getVerdictColor(verdict) {
    const colors = {
        'Hot': 'text-red-600 bg-red-50 dark:bg-red-950/30',
        'Rising': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
        'Watch': 'text-gray-600 bg-gray-50 dark:bg-gray-950/30'
    };
    return colors[verdict] || colors['Watch'];
}

module.exports = {
    calculateTrendScore,
    assignVerdict,
    getVerdictEmoji,
    getVerdictColor
};
