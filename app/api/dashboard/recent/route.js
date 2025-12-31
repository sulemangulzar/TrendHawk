import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

        // Get recently analyzed products
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', userId)
            .not('verdict', 'is', null)
            .order('analyzed_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        return NextResponse.json({ products: products || [] });
    } catch (error) {
        console.error('Recent products error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
