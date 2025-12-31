import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
    try {
        // Call Supabase function
        const { data, error } = await supabase.rpc('get_market_snapshot');

        if (error) throw error;

        return NextResponse.json(data || {
            trending_demand: 'Stable',
            saturation_level: 'Stable',
            beginner_friendly: 0
        });
    } catch (error) {
        console.error('Market snapshot error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
