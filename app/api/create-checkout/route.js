import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { plan, userId, userEmail } = await request.json();

        if (!plan || !userId || !userEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Define prices based on your Stripe dashboard
        const prices = {
            basic: process.env.STRIPE_BASIC_PRICE_ID,
            pro: process.env.STRIPE_PRO_PRICE_ID,
        };

        const priceId = prices[plan?.toLowerCase()];

        if (!priceId) {
            return NextResponse.json(
                { error: 'Invalid plan selected or missing Price ID in environment' },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
            metadata: {
                userId,
                plan,
            },
            customer_email: userEmail,
        });

        return NextResponse.json({
            checkoutUrl: session.url,
        });
    } catch (error) {
        console.error('Error creating Stripe checkout:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

