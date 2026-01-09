import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature, getPlanFromVariantId } from '@/lib/lemonsqueezy';

export const dynamic = 'force-dynamic';

// Create Supabase client with service role for admin operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Lemon Squeezy Webhook Handler
 * Processes subscription events and updates database
 */
export async function POST(request) {
    try {
        // Get raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('x-signature');

        // Verify webhook signature
        if (!signature || !verifyWebhookSignature(rawBody, signature)) {
            console.error('[Webhook] Invalid signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse the webhook payload
        const payload = JSON.parse(rawBody);
        const eventName = payload.meta?.event_name;
        const data = payload.data;

        console.log('[Webhook Received]', {
            event: eventName,
            subscriptionId: data?.id,
        });

        // Handle different webhook events
        switch (eventName) {
            case 'subscription_created':
                await handleSubscriptionCreated(data);
                break;

            case 'subscription_updated':
                await handleSubscriptionUpdated(data);
                break;

            case 'subscription_cancelled':
                await handleSubscriptionCancelled(data);
                break;

            case 'subscription_payment_success':
                await handlePaymentSuccess(data, payload);
                break;

            case 'subscription_payment_failed':
                await handlePaymentFailed(data, payload);
                break;

            default:
                console.log('[Webhook] Unhandled event:', eventName);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Webhook Error]', error);
        return NextResponse.json(
            { error: 'Webhook processing failed', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * Handle subscription_created event
 */
async function handleSubscriptionCreated(data) {
    const attributes = data.attributes;
    const customData = attributes.custom_data || {};
    const userId = customData.user_id;
    const variantId = attributes.variant_id?.toString();
    const planName = customData.plan || getPlanFromVariantId(variantId);

    if (!userId) {
        console.error('[Webhook] No user_id in custom_data');
        return;
    }

    // Insert subscription record
    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            lemon_squeezy_id: data.id,
            plan_name: planName,
            status: attributes.status,
            current_period_start: attributes.renews_at,
            current_period_end: attributes.ends_at,
        });

    if (subError) {
        console.error('[Webhook] Failed to create subscription:', subError);
        return;
    }

    // Update user metadata
    const { error: metaError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
            subscription_plan: planName,
            subscription_status: attributes.status,
        },
    });

    if (metaError) {
        console.error('[Webhook] Failed to update user metadata:', metaError);
    }

    console.log('[Subscription Created]', {
        userId,
        plan: planName,
        lemonSqueezyId: data.id,
    });
}

/**
 * Handle subscription_updated event
 */
async function handleSubscriptionUpdated(data) {
    const attributes = data.attributes;
    const lemonSqueezyId = data.id;

    // Update subscription record
    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: attributes.status,
            current_period_start: attributes.renews_at,
            current_period_end: attributes.ends_at,
            cancel_at: attributes.cancelled ? attributes.ends_at : null,
            updated_at: new Date().toISOString(),
        })
        .eq('lemon_squeezy_id', lemonSqueezyId);

    if (error) {
        console.error('[Webhook] Failed to update subscription:', error);
        return;
    }

    console.log('[Subscription Updated]', {
        lemonSqueezyId,
        status: attributes.status,
    });
}

/**
 * Handle subscription_cancelled event
 */
async function handleSubscriptionCancelled(data) {
    const attributes = data.attributes;
    const lemonSqueezyId = data.id;

    // Update subscription to cancelled
    const { data: subscription, error } = await supabase
        .from('subscriptions')
        .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancel_at: attributes.ends_at,
            updated_at: new Date().toISOString(),
        })
        .eq('lemon_squeezy_id', lemonSqueezyId)
        .select()
        .single();

    if (error) {
        console.error('[Webhook] Failed to cancel subscription:', error);
        return;
    }

    // Update user metadata to reflect cancellation
    if (subscription) {
        await supabase.auth.admin.updateUserById(subscription.user_id, {
            user_metadata: {
                subscription_status: 'cancelled',
            },
        });
    }

    console.log('[Subscription Cancelled]', {
        lemonSqueezyId,
        endsAt: attributes.ends_at,
    });
}

/**
 * Handle subscription_payment_success event
 */
async function handlePaymentSuccess(data, payload) {
    const attributes = data.attributes;
    const lemonSqueezyId = data.id;

    // Get subscription to find user_id
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id, id')
        .eq('lemon_squeezy_id', lemonSqueezyId)
        .single();

    if (!subscription) {
        console.error('[Webhook] Subscription not found for payment');
        return;
    }

    // Record payment in history
    const paymentId = payload.meta?.custom_data?.payment_id || `payment_${Date.now()}`;

    const { error } = await supabase
        .from('payment_history')
        .insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            lemon_squeezy_payment_id: paymentId,
            amount: parseFloat(attributes.total || 0) / 100, // Convert cents to dollars
            currency: attributes.currency || 'USD',
            status: 'succeeded',
        });

    if (error) {
        console.error('[Webhook] Failed to record payment:', error);
    }

    console.log('[Payment Success]', {
        subscriptionId: lemonSqueezyId,
        amount: attributes.total,
    });
}

/**
 * Handle subscription_payment_failed event
 */
async function handlePaymentFailed(data, payload) {
    const lemonSqueezyId = data.id;

    // Get subscription
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('user_id, id')
        .eq('lemon_squeezy_id', lemonSqueezyId)
        .single();

    if (!subscription) {
        console.error('[Webhook] Subscription not found for failed payment');
        return;
    }

    // Update subscription status
    await supabase
        .from('subscriptions')
        .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
        })
        .eq('lemon_squeezy_id', lemonSqueezyId);

    console.log('[Payment Failed]', {
        subscriptionId: lemonSqueezyId,
    });
}
