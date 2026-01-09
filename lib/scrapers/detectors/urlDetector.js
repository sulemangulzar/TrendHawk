/**
 * URL Detector - Intelligently identify website type
 * Supports: Amazon (all regions), eBay, Shopify, Mercari, Daraz, Generic
 */

export function detectWebsiteType(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        const pathname = urlObj.pathname.toLowerCase();

        // Amazon (all regions)
        if (hostname.includes('amazon.')) {
            const region = hostname.split('.').pop();
            return {
                type: 'amazon',
                region: region,
                platform: `Amazon ${region.toUpperCase()}`,
                confidence: 'high'
            };
        }

        // eBay (all regions)
        if (hostname.includes('ebay.')) {
            return {
                type: 'ebay',
                region: hostname.split('.').pop(),
                platform: 'eBay',
                confidence: 'high'
            };
        }

        // Shopify stores (detect by common patterns)
        if (hostname.includes('myshopify.com') || pathname.includes('/products/')) {
            return {
                type: 'shopify',
                platform: 'Shopify Store',
                confidence: 'high'
            };
        }

        // Mercari Japan
        if (hostname.includes('mercari.com') || hostname.includes('mercari.jp')) {
            return {
                type: 'mercari',
                region: 'jp',
                platform: 'Mercari Japan',
                confidence: 'high'
            };
        }

        // Daraz (Pakistan, Bangladesh, etc.)
        if (hostname.includes('daraz.')) {
            return {
                type: 'daraz',
                region: hostname.split('.').pop(),
                platform: 'Daraz',
                confidence: 'high'
            };
        }

        // AliExpress
        if (hostname.includes('aliexpress.')) {
            return {
                type: 'aliexpress',
                platform: 'AliExpress',
                confidence: 'high'
            };
        }

        // Etsy
        if (hostname.includes('etsy.')) {
            return {
                type: 'etsy',
                platform: 'Etsy',
                confidence: 'high'
            };
        }

        // Generic e-commerce (fallback)
        return {
            type: 'generic',
            platform: 'E-commerce Store',
            confidence: 'medium'
        };

    } catch (error) {
        return {
            type: 'unknown',
            platform: 'Unknown',
            confidence: 'low',
            error: error.message
        };
    }
}

export function detectRegion(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        // Extract TLD
        const tld = hostname.split('.').pop().toLowerCase();

        const regionMap = {
            'com': { country: 'US', currency: 'USD', name: 'United States' },
            'co.uk': { country: 'UK', currency: 'GBP', name: 'United Kingdom' },
            'uk': { country: 'UK', currency: 'GBP', name: 'United Kingdom' },
            'de': { country: 'DE', currency: 'EUR', name: 'Germany' },
            'fr': { country: 'FR', currency: 'EUR', name: 'France' },
            'jp': { country: 'JP', currency: 'JPY', name: 'Japan' },
            'co.jp': { country: 'JP', currency: 'JPY', name: 'Japan' },
            'in': { country: 'IN', currency: 'INR', name: 'India' },
            'pk': { country: 'PK', currency: 'PKR', name: 'Pakistan' },
            'ca': { country: 'CA', currency: 'CAD', name: 'Canada' },
            'au': { country: 'AU', currency: 'AUD', name: 'Australia' }
        };

        return regionMap[tld] || { country: 'US', currency: 'USD', name: 'United States' };

    } catch (error) {
        return { country: 'US', currency: 'USD', name: 'United States' };
    }
}
