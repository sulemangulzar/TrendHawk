import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PATCH - Update decision status (winner/failure)
export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();
        const { status, userId } = body;

        console.log(`[PATCH DIAGNOSTIC] Params: ${JSON.stringify(resolvedParams)} | ID: ${id} | Status: ${status} | UserID: ${userId}`);

        if (!id || id === 'undefined') {
            return NextResponse.json({ error: `Invalid ID: ${id}` }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId in request' }, { status: 400 });
        }

        // 1. Attempt the update
        const { data, error } = await supabase
            .from('user_decisions')
            .update({ decision_status: status })
            .eq('id', id)
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('❌ Supabase PATCH Error:', error);

            // Check for missing column
            if (error.code === '42703') {
                return NextResponse.json({
                    error: 'DATABASE ERROR: The "decision_status" column is missing. Have you run the SQL fix yet?',
                    details: error.message
                }, { status: 500 });
            }

            // Check for invalid UUID
            if (error.code === '22P02') {
                return NextResponse.json({
                    error: `DATABASE ERROR: Invalid ID format (${id}). Expected a UUID.`,
                    details: error.message
                }, { status: 500 });
            }

            return NextResponse.json({
                error: `Database Failure: ${error.message}`,
                details: error
            }, { status: 500 });
        }

        // 2. Check if update hit any rows
        if (!data || data.length === 0) {
            console.log('⚠️ No rows updated. Checking if ID exists at all...');

            const { count, error: countError } = await supabase
                .from('user_decisions')
                .select('*', { count: 'exact', head: true })
                .eq('id', id);

            if (countError) {
                return NextResponse.json({ error: 'Failed to verify record existence' }, { status: 500 });
            }

            if (count === 0) {
                return NextResponse.json({ error: `Not Found: No decision exists with ID ${id}` }, { status: 404 });
            } else {
                return NextResponse.json({ error: 'Access Denied: You do not own this candidate record' }, { status: 403 });
            }
        }

        console.log('✅ PATCH Success');
        return NextResponse.json({ decision: data[0] });

    } catch (error) {
        console.error('❌ PATCH Internal Error:', error);
        return NextResponse.json({ error: `Server Crash: ${error.message}` }, { status: 500 });
    }
}

// DELETE - Remove decision
export async function DELETE(request, { params }) {
    console.log('>>> [BINGO] DELETE START');
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        console.log(`>>> [BINGO] ID: ${id} | UserID: ${userId}`);

        // STRICT UUID REGEX
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!id || !uuidRegex.test(id)) {
            console.error('>>> [BINGO] REJECTED INVALID ID:', id);
            return NextResponse.json({
                error: `[BINGO] Invalid ID format: "${id}". This record cannot be deleted.`
            }, { status: 400 });
        }

        if (!userId || userId === 'undefined') {
            console.error('>>> [BINGO] REJECTED MISSING USERID');
            return NextResponse.json({ error: '[BINGO] Missing userId' }, { status: 400 });
        }

        console.log('>>> [BINGO] CALLING SUPABASE DELETE');
        const { error } = await supabase
            .from('user_decisions')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error('❌ [BINGO] Supabase Error:', error);
            return NextResponse.json({
                error: `[SIG_RED] Database Error: ${error.message} (ID: ${id})`,
                details: error
            }, { status: 500 });
        }

        console.log('>>> [BINGO] DELETE SUCCESS');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('❌ [BINGO] Crash:', error);
        return NextResponse.json({ error: `[BINGO_CRASH] ${error.message}` }, { status: 500 });
    }
}
