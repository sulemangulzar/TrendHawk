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

        // Call Supabase function
        const { data, error } = await supabase.rpc('get_decision_summary', {
            user_uuid: userId
        });

        if (error) throw error;

        return NextResponse.json(data || {
            safe_to_test: 0,
            high_risk: 0,
            skipped: 0,
            money_saved: 0
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
