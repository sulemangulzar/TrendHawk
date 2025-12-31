import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return NextResponse.json({ product: data });
    } catch (error) {
        console.error('Get product error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
