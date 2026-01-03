import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/shortlist - Fetch user's shortlisted products
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const status = searchParams.get('status'); // watching, ready, rejected

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        let query = supabase
            .from('decisions')
            .select(`
                *,
                product:products(*)
            `)
            .eq('user_id', userId);

        if (status) {
            query = query.eq('status', status);
        } else {
            // Only show shortlist statuses
            query = query.in('status', ['watching', 'ready', 'rejected']);
        }

        const { data: shortlist, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.warn('Error fetching shortlist, returning empty:', error.message);
            return NextResponse.json({
                success: true,
                shortlist: []
            });
        }

        return NextResponse.json({
            success: true,
            shortlist: shortlist || []
        });
    } catch (error) {
        console.error('Error fetching shortlist:', error);
        return NextResponse.json({
            success: true,
            shortlist: []
        });
    }
}

// PATCH /api/shortlist - Update shortlist item status
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { decisionId, userId, status, shortlistReason, estimatedTestCost, riskLevel } = body;

        if (!decisionId || !userId) {
            return NextResponse.json({ error: 'Decision ID and User ID required' }, { status: 400 });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (shortlistReason) updateData.shortlist_reason = shortlistReason;
        if (estimatedTestCost !== undefined) updateData.estimated_test_cost = estimatedTestCost;
        if (riskLevel) updateData.risk_level = riskLevel;
        updateData.updated_at = new Date().toISOString();

        const { data: decision, error } = await supabase
            .from('decisions')
            .update(updateData)
            .eq('id', decisionId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            decision
        });
    } catch (error) {
        console.error('Error updating shortlist:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
