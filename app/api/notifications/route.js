import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Fetch user's notifications
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data: notifications, error } = await supabase
            .from('alert_notifications')
            .select(`
                *,
                product:products(*),
                alert:product_alerts(keyword, platform)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Get unread count
        const { count: unreadCount } = await supabase
            .from('alert_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Mark notification as read
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { notificationId, userId } = body;

        if (!notificationId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('alert_notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mark notification read error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Mark all as read
export async function POST(request) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { error } = await supabase
            .from('alert_notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete notification
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('notificationId');
        const userId = searchParams.get('userId');

        if (!notificationId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('alert_notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
