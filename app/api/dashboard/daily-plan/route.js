import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // 1. Fetch products analyzed in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentProducts, error: productsError } = await supabase
            .from('products')
            .select('title, verdict, demand_level, risk_level, saturation_score')
            .eq('user_id', userId)
            .gte('analyzed_at', twentyFourHoursAgo);

        if (productsError) throw productsError;

        // 2. Fetch all candidates (to determine discovery goals)
        const { count: candidateCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('verdict', 'test');

        // 3. Logic-based Insights
        const scannedToday = recentProducts.length;
        const riskyToday = recentProducts.filter(p => p.verdict === 'skip' || p.risk_level === 'high').length;

        // Simple niche detection from titles
        const categories = {
            'Electronics': 0,
            'Apparel': 0,
            'Home Goods': 0,
            'Other': 0
        };

        recentProducts.forEach(p => {
            const title = p.title.toLowerCase();
            if (/phone|smart|led|charger|battery/.test(title)) categories['Electronics']++;
            else if (/shirt|shoes|dress|wear/.test(title)) categories['Apparel']++;
            else if (/kitchen|home|decor/.test(title)) categories['Home Goods']++;
            else categories['Other']++;
        });

        const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0];

        // 4. Generate dynamic warnings and tips
        let marketWarning = "Market conditions are stable. Continue your research.";
        let saturationTrend = "Stable";

        if (riskyToday > scannedToday * 0.6 && scannedToday > 2) {
            marketWarning = `Warning: High volatility detected in your recent ${topCategory} scans. 60%+ are high risk. Consider switching niches.`;
            saturationTrend = "Increasing";
        } else if (scannedToday > 0) {
            marketWarning = `Your current focus on ${topCategory} shows productive results. Keep pushing.`;
        }

        const beginnerFriendlyCount = recentProducts.filter(p => p.risk_level === 'low').length;

        return NextResponse.json({
            scannedToday,
            candidateCount: candidateCount || 0,
            topCategory,
            marketWarning,
            saturationTrend,
            beginnerFriendlyCount,
            recommendation: scannedToday < 3
                ? "Your discovery phase is just starting. Aim for 3-5 high-quality scans today."
                : "Great momentum! Run the Simulator on your top candidate to finalize your testing budget."
        });

    } catch (error) {
        console.error('Daily Plan API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
