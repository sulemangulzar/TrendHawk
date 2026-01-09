import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Plan limits
const PLAN_LIMITS = {
    basic: {
        searchesPerMonth: 100,
        supplierAccess: true,
        dataType: 'realtime',
        exportCSV: true,
        apiAccess: false,
    },
    pro: {
        searchesPerMonth: 450,
        supplierAccess: true,
        dataType: 'realtime',
        exportCSV: true,
        apiAccess: true,
        apiLimit: 50, // per day
    },
};

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

        // Get user's plan from Supabase user metadata
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError) throw userError;

        const userPlan = userData.user?.user_metadata?.subscription_plan || 'basic';
        const planLimits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.basic;

        // Get current month's search count
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: searchCount, error: countError } = await supabase
            .from('search_jobs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString());

        if (countError) throw countError;

        const searchesUsed = searchCount || 0;
        const searchesRemaining = planLimits.searchesPerMonth === -1
            ? -1
            : Math.max(0, planLimits.searchesPerMonth - searchesUsed);

        const canSearch = planLimits.searchesPerMonth === -1 || searchesUsed < planLimits.searchesPerMonth;

        return NextResponse.json({
            plan: userPlan,
            limits: planLimits,
            usage: {
                searchesUsed,
                searchesRemaining,
                canSearch,
            },
        });
    } catch (error) {
        console.error('Plan check error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
