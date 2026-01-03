import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const testId = params.id;

        if (!userId || !testId) {
            return NextResponse.json({ error: 'User ID and Test ID required' }, { status: 400 });
        }

        const { data: test, error } = await supabase
            .from('live_tests')
            .select('*')
            .eq('id', testId)
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            test
        });
    } catch (error) {
        console.error('Error fetching live test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const testId = params.id;

        if (!userId || !testId) {
            return NextResponse.json({ error: 'User ID and Test ID required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('live_tests')
            .delete()
            .eq('id', testId)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Live test deleted'
        });
    } catch (error) {
        console.error('Error deleting live test:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
