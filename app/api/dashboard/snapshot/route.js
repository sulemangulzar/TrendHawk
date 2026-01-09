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

        // Call Supabase function with userId
        const { data, error } = await supabase.rpc('get_market_snapshot', { p_user_id: userId });

        if (error) {
            console.error('Supabase RPC error:', error);
            // Return default values if function fails
            return NextResponse.json({
                trending_demand: 'Stable',
                saturation_level: 'Stable',
                beginner_friendly: 0
            });
        }

        return NextResponse.json(data || {
            trending_demand: 'Stable',
            saturation_level: 'Stable',
            beginner_friendly: 0
        });
    } catch (error) {
        console.error('Market snapshot error:', error);
        return NextResponse.json({
            trending_demand: 'Stable',
            saturation_level: 'Stable',
            beginner_friendly: 0
        });
    }
}
