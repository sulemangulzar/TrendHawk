import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/user-stats - Fetch user's money protection stats
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Fetch or create user stats
        let { data: stats, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Stats don't exist - try to create them
            const { data: newStats, error: insertError } = await supabase
                .from('user_stats')
                .insert({ user_id: userId })
                .select()
                .single();

            if (insertError) {
                // RLS is blocking - return default stats instead of failing
                console.warn('Cannot create user_stats (RLS blocking), using defaults:', insertError.message);
                stats = {
                    user_id: userId,
                    products_avoided: 0,
                    money_saved: 0,
                    products_killed: 0,
                    products_under_test: 0,
                    money_at_risk: 0
                };
            } else {
                stats = newStats;
            }
        } else if (error) {
            // Other errors - return default stats
            console.warn('Error fetching user_stats, using defaults:', error.message);
            stats = {
                user_id: userId,
                products_avoided: 0,
                money_saved: 0,
                products_killed: 0,
                products_under_test: 0,
                money_at_risk: 0
            };
        }

        // Calculate today's action
        const todaysAction = await calculateTodaysAction(userId);

        return NextResponse.json({
            success: true,
            stats: {
                products_avoided: stats.products_avoided || 0,
                money_saved: parseFloat(stats.money_saved) || 0,
                products_killed: stats.products_killed || 0,
                products_under_test: stats.products_under_test || 0,
                money_at_risk: parseFloat(stats.money_at_risk) || 0,
            },
            todaysAction
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper function to calculate today's action
async function calculateTodaysAction(userId) {
    // Check for tests close to failure
    const { data: failingTests } = await supabase
        .from('live_tests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

    if (failingTests && failingTests.length > 0) {
        const testsToKill = failingTests.filter(test => {
            const daysLive = Math.floor((new Date() - new Date(test.start_date)) / (1000 * 60 * 60 * 24));
            return daysLive >= 14 && test.sales_count === 0;
        });

        if (testsToKill.length > 0) {
            return {
                action: `Kill ${testsToKill.length} unprofitable ${testsToKill.length === 1 ? 'test' : 'tests'}`,
                link: '/dashboard/live-tests',
                priority: 'high'
            };
        }
    }

    // Check for products ready to test
    const { data: readyProducts } = await supabase
        .from('decisions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ready')
        .limit(5);

    if (readyProducts && readyProducts.length > 0) {
        return {
            action: `Shortlist ${Math.min(readyProducts.length, 2)} low-risk ${readyProducts.length === 1 ? 'product' : 'products'}`,
            link: '/dashboard/shortlist',
            priority: 'medium'
        };
    }

    // Default action
    return {
        action: 'Check Market Proof for new opportunities',
        link: '/dashboard/market-proof',
        priority: 'low'
    };
}
