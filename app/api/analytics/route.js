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
            return NextResponse.json(
                { error: 'Missing userId' },
                { status: 400 }
            );
        }

        // Get search jobs stats
        const { data: jobs, error: jobsError } = await supabase
            .from('search_jobs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        // Get favorites count
        const { count: favoritesCount, error: favError } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (favError) throw favError;

        // Get total products found
        const jobIds = jobs.map(j => j.id);
        const { count: productsCount, error: prodError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId); // Changed from in('job_id', jobIds) to simple user_id for robustness

        if (prodError) throw prodError;

        // Calculate stats
        const totalSearches = jobs.length;
        const completedSearches = jobs.filter(j => j.status === 'completed').length;
        const failedSearches = jobs.filter(j => j.status === 'failed').length;
        const avgProductsPerSearch = completedSearches > 0 ? Math.round(productsCount / completedSearches) : 0;

        // Get recent searches
        const recentSearches = jobs.slice(0, 10).map(job => ({
            id: job.id,
            keyword: job.keyword,
            status: job.status,
            created_at: job.created_at,
            completed_at: job.completed_at,
        }));

        // Get top keywords
        const keywordCounts = {};
        jobs.forEach(job => {
            keywordCounts[job.keyword] = (keywordCounts[job.keyword] || 0) + 1;
        });
        const topKeywords = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([keyword, count]) => ({ keyword, count }));

        return NextResponse.json({
            stats: {
                totalSearches,
                completedSearches,
                failedSearches,
                productsFound: productsCount,
                favoritesCount,
                avgProductsPerSearch,
            },
            recentSearches,
            topKeywords,
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
