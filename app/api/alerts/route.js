import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Fetch user's alerts
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const { data: alerts, error } = await supabase
            .from('product_alerts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ alerts });
    } catch (error) {
        console.error('Get alerts error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new alert
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            userId,
            keyword,
            platform = 'any',
            maxPrice,
            minReviews,
            maxReviews,
            minRating,
            notificationEmail = true,
            notificationApp = true
        } = body;

        if (!userId || !keyword) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if alert already exists for this keyword
        const { data: existing } = await supabase
            .from('product_alerts')
            .select('id')
            .eq('user_id', userId)
            .eq('keyword', keyword.toLowerCase())
            .eq('platform', platform)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Alert already exists for this keyword' },
                { status: 409 }
            );
        }

        // Create alert
        const { data: alert, error } = await supabase
            .from('product_alerts')
            .insert({
                user_id: userId,
                keyword: keyword.toLowerCase(),
                platform,
                max_price: maxPrice || null,
                min_reviews: minReviews || null,
                max_reviews: maxReviews || null,
                min_rating: minRating || null,
                notification_email: notificationEmail,
                notification_app: notificationApp,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ alert }, { status: 201 });
    } catch (error) {
        console.error('Create alert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove alert
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const alertId = searchParams.get('alertId');
        const userId = searchParams.get('userId');

        if (!alertId || !userId) {
            return NextResponse.json(
                { error: 'Missing alertId or userId' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('product_alerts')
            .delete()
            .eq('id', alertId)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete alert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update alert (toggle active status)
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { alertId, userId, isActive } = body;

        if (!alertId || !userId || isActive === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { data: alert, error } = await supabase
            .from('product_alerts')
            .update({ is_active: isActive })
            .eq('id', alertId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ alert });
    } catch (error) {
        console.error('Update alert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
