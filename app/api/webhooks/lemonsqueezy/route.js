import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-signature');
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

        if (!secret) {
            console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        // Verify webhook signature
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(rawBody).digest('hex');

        if (signature !== digest) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const { meta, data } = payload;
        const eventName = meta.event_name;

        console.log('Webhook received:', eventName);

        // Extract user ID from custom data
        const userId = data.attributes.first_order_item?.product_id
            ? data.meta?.custom_data?.user_id
            : null;

        if (!userId) {
            console.error('No user ID found in webhook payload');
            return NextResponse.json({ error: 'No user ID' }, { status: 400 });
        }

        // Handle different webhook events
        switch (eventName) {
            case 'order_created':
                await handleOrderCreated(data, userId);
                break;

            case 'subscription_created':
                await handleSubscriptionCreated(data, userId);
                break;

            case 'subscription_updated':
                await handleSubscriptionUpdated(data, userId);
                break;

            case 'subscription_cancelled':
            case 'subscription_expired':
                await handleSubscriptionCancelled(data, userId);
                break;

            default:
                console.log('Unhandled event:', eventName);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function handleOrderCreated(data, userId) {
    console.log('Processing order for user:', userId);

    const { data: user, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
        console.error('Error fetching user:', error);
        return;
    }

    // Update user metadata with order info
    await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
            ...user.user_metadata,
            last_order: {
                id: data.id,
                total: data.attributes.total,
                status: data.attributes.status,
                created_at: data.attributes.created_at,
            },
        },
    });
}

async function handleSubscriptionCreated(data, userId) {
    console.log('Activating subscription for user:', userId);

    const attributes = data.attributes;
    const variantId = attributes.variant_id;

    // Determine plan based on variant ID
    const basicVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_BASIC_VARIANT_ID;
    const proVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID;

    let plan = 'free';
    if (variantId === basicVariantId) plan = 'basic';
    if (variantId === proVariantId) plan = 'pro';

    // Update user metadata
    await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
            subscription: {
                plan,
                status: attributes.status,
                lemon_squeezy_id: data.id,
                variant_id: variantId,
                renews_at: attributes.renews_at,
                ends_at: attributes.ends_at,
            },
        },
    });
}

async function handleSubscriptionUpdated(data, userId) {
    console.log('Updating subscription for user:', userId);

    const attributes = data.attributes;

    const { data: user } = await supabase.auth.admin.getUserById(userId);

    await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
            ...user.user_metadata,
            subscription: {
                ...user.user_metadata.subscription,
                status: attributes.status,
                renews_at: attributes.renews_at,
                ends_at: attributes.ends_at,
            },
        },
    });
}

async function handleSubscriptionCancelled(data, userId) {
    console.log('Cancelling subscription for user:', userId);

    const { data: user } = await supabase.auth.admin.getUserById(userId);

    await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
            ...user.user_metadata,
            subscription: {
                ...user.user_metadata.subscription,
                status: 'cancelled',
                ends_at: data.attributes.ends_at,
            },
        },
    });
}
