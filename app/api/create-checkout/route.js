import { NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { configureLemonSqueezy, getVariantId } from '@/lib/lemonsqueezy';

export async function POST(request) {
    try {
        const { plan, userId, userEmail } = await request.json();

        if (!plan || !userId || !userEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Configure Lemon Squeezy
        configureLemonSqueezy();

        // Get variant ID for the plan
        const variantId = getVariantId(plan);

        if (!variantId) {
            return NextResponse.json(
                { error: 'Invalid plan selected' },
                { status: 400 }
            );
        }

        // Create checkout session
        const storeId = process.env.LEMONSQUEEZY_STORE_ID;

        const checkout = await createCheckout(storeId, variantId, {
            checkoutData: {
                email: userEmail,
                custom: {
                    user_id: userId,
                },
            },
            productOptions: {
                redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
            },
        });

        if (checkout.error) {
            throw new Error(checkout.error.message);
        }

        return NextResponse.json({
            checkoutUrl: checkout.data.data.attributes.url,
        });
    } catch (error) {
        console.error('Error creating checkout:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
