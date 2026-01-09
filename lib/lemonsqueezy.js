/**
 * Lemon Squeezy Integration Library
 * Handles checkout creation and API interactions
 */

import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemon Squeezy with API key
export function initializeLemonSqueezy() {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    if (!apiKey) {
        throw new Error('LEMONSQUEEZY_API_KEY is not configured');
    }

    lemonSqueezySetup({
        apiKey,
        onError: (error) => {
            console.error('Lemon Squeezy Error:', error);
        },
    });
}

/**
 * Get variant ID for a plan
 */
export function getVariantId(plan) {
    const variants = {
        basic: process.env.LEMONSQUEEZY_BASIC_VARIANT_ID,
        pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
    };

    return variants[plan?.toLowerCase()];
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload, signature) {
    const crypto = require('crypto');
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!secret) {
        throw new Error('LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');

    return digest === signature;
}

/**
 * Get plan name from variant ID
 */
export function getPlanFromVariantId(variantId) {
    const basicVariantId = process.env.LEMONSQUEEZY_BASIC_VARIANT_ID;
    const proVariantId = process.env.LEMONSQUEEZY_PRO_VARIANT_ID;

    if (variantId === basicVariantId) return 'basic';
    if (variantId === proVariantId) return 'pro';

    return 'basic'; // Default fallback
}
