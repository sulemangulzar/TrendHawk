import { NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { initializeLemonSqueezy, getVariantId } from '@/lib/lemonsqueezy';

export async function POST(request) {
    try {
        const { plan, userId, userEmail } = await request.json();

        if (!plan || !userId || !userEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Initialize Lemon Squeezy
        initializeLemonSqueezy();

        // Get the variant ID for the selected plan
        const variantId = getVariantId(plan);

        if (!variantId) {
            return NextResponse.json(
                { error: `Invalid plan selected or missing Variant ID for plan: ${plan}` },
                { status: 400 }
            );
        }

        const storeId = process.env.LEMONSQUEEZY_STORE_ID;

        if (!storeId) {
            return NextResponse.json(
                { error: 'Lemon Squeezy Store ID not configured' },
                { status: 500 }
            );
        }

        // Create checkout session with Lemon Squeezy
        const checkout = await createCheckout(storeId, variantId, {
            checkoutData: {
                email: userEmail,
                custom: {
                    user_id: userId,
                    plan: plan.toLowerCase(),
                },
            },
            checkoutOptions: {
                embed: false,
                media: true,
                logo: true,
            },
            expiresAt: null,
            preview: false,
            testMode: process.env.NODE_ENV === 'development',
        });

        if (checkout.error) {
            console.error('Lemon Squeezy checkout error:', checkout.error);
            return NextResponse.json(
                { error: 'Failed to create checkout session' },
                { status: 500 }
            );
        }

        console.log('[Checkout Created]', {
            plan,
            userId,
            checkoutId: checkout.data?.id,
        });

        return NextResponse.json({
            checkoutUrl: checkout.data?.data?.attributes?.url,
            checkoutId: checkout.data?.id,
        });
    } catch (error) {
        console.error('Error creating Lemon Squeezy checkout:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session', details: error.message },
            { status: 500 }
        );
    }
}

