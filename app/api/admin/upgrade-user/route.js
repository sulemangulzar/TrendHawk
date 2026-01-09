import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create Supabase client with service role
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Admin endpoint to manually upgrade a user's plan
 * Used for: Testing, manual upgrades, or promotional access
 */
export async function POST(request) {
    try {
        const { userId, plan } = await request.json();

        if (!userId || !plan) {
            return NextResponse.json(
                { error: 'Missing userId or plan' },
                { status: 400 }
            );
        }

        // Validate plan
        if (!['basic', 'pro'].includes(plan.toLowerCase())) {
            return NextResponse.json(
                { error: 'Invalid plan. Must be "basic" or "pro"' },
                { status: 400 }
            );
        }

        const planName = plan.toLowerCase();

        // Update user metadata
        const { data: userData, error: metaError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
                subscription_plan: planName,
                subscription_status: 'active',
                upgraded_manually: true,
                upgraded_at: new Date().toISOString(),
            },
        });

        if (metaError) {
            console.error('[Admin Upgrade] Failed to update user metadata:', metaError);
            return NextResponse.json(
                { error: 'Failed to update user plan', details: metaError.message },
                { status: 500 }
            );
        }

        // Create a subscription record (manual upgrade)
        const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                lemon_squeezy_id: `manual_${userId}_${Date.now()}`,
                plan_name: planName,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
            });

        if (subError) {
            console.error('[Admin Upgrade] Failed to create subscription:', subError);
            // Don't fail the request if subscription creation fails
        }

        console.log('[Admin Upgrade] Success', {
            userId,
            plan: planName,
        });

        return NextResponse.json({
            success: true,
            message: `User upgraded to ${planName} plan`,
            user: {
                id: userId,
                plan: planName,
                email: userData.user?.email,
            },
        });
    } catch (error) {
        console.error('[Admin Upgrade] Error:', error);
        return NextResponse.json(
            { error: 'Failed to upgrade user', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint to check a user's current plan
 */
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

        const { data: userData, error } = await supabase.auth.admin.getUserById(userId);

        if (error) {
            return NextResponse.json(
                { error: 'User not found', details: error.message },
                { status: 404 }
            );
        }

        const plan = userData.user?.user_metadata?.subscription_plan || 'basic';
        const status = userData.user?.user_metadata?.subscription_status || 'active';

        return NextResponse.json({
            userId,
            email: userData.user?.email,
            plan,
            status,
        });
    } catch (error) {
        console.error('[Admin Upgrade] GET Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user plan', details: error.message },
            { status: 500 }
        );
    }
}
