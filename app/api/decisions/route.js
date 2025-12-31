import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST - Save or skip decision
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, productId, decision, notes } = body;

        console.log('[POST DIAGNOSTIC] Saving Decision:', { userId, productId, decision });

        if (!userId || !productId || !decision) {
            return NextResponse.json({ error: 'Missing required fields: userId, productId, or decision' }, { status: 400 });
        }

        // Check if decision already exists to avoid unique constraint 500s
        const { data: existing } = await supabase
            .from('user_decisions')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({
                error: 'This product is already in your candidates list.',
                id: existing.id
            }, { status: 200 }); // Return 200 as it's already "done"
        }

        const { data, error } = await supabase
            .from('user_decisions')
            .insert({
                user_id: userId,
                product_id: productId,
                decision,
                notes
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase INSERT Error:', error);
            return NextResponse.json({
                error: `Database Insert Failure: ${error.message} (Code: ${error.code})`,
                details: error
            }, { status: 500 });
        }

        console.log('✅ POST Success');
        return NextResponse.json({ decision: data }, { status: 201 });
    } catch (error) {
        console.error('❌ POST Internal Error:', error);
        return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
    }
}

// GET - Fetch user decisions
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const decisionType = searchParams.get('decision');

        console.log('[GET DIAGNOSTIC] Fetching Decisions:', { userId, decisionType });

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        let query = supabase
            .from('user_decisions')
            .select(`
                id,
                user_id,
                product_id,
                decision,
                decision_status,
                notes,
                created_at,
                product:products(*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (decisionType) {
            query = query.eq('decision', decisionType);
        }

        const { data, error } = await query;

        if (error) {
            console.error('❌ Supabase SELECT Error:', error);

            // Handle missing relationship or table
            if (error.code === 'PGRST204') {
                return NextResponse.json({
                    error: 'Relationship Error: Could not link decisions to products. Check your foreign keys.',
                    details: error.message
                }, { status: 500 });
            }

            return NextResponse.json({
                error: `Database Retrieval Failure: ${error.message}`,
                details: error
            }, { status: 500 });
        }

        console.log(`✅ GET Success found ${data?.length || 0} rows`);
        return NextResponse.json({ decisions: data || [] });
    } catch (error) {
        console.error('❌ GET Internal Error:', error);
        return NextResponse.json({ error: `Server Error: ${error.message}` }, { status: 500 });
    }
}
