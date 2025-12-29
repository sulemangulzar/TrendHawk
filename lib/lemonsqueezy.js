import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// Configure Lemon Squeezy
export function configureLemonSqueezy() {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    if (!apiKey) {
        throw new Error('LEMONSQUEEZY_API_KEY is not set');
    }

    lemonSqueezySetup({ apiKey });
}

// Get variant ID based on plan
export function getVariantId(plan) {
    const variantIds = {
        basic: process.env.NEXT_PUBLIC_LEMONSQUEEZY_BASIC_VARIANT_ID,
        pro: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID,
    };

    return variantIds[plan?.toLowerCase()] || variantIds.pro;
}

// Plan configuration
export const plans = {
    basic: {
        name: 'Basic',
        price: 10,
        variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_BASIC_VARIANT_ID,
    },
    pro: {
        name: 'Pro',
        price: 30,
        variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID,
    },
};
