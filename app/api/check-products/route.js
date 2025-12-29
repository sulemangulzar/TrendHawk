import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
    try {
        // Get products from the completed job
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('job_id', '292b8bb1-2567-48cb-805e-f16068c5bcd6')
            .limit(5);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            found: products.length,
            products: products,
            message: products.length > 0 ? 'Products found! ✅' : 'No products saved ❌'
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
