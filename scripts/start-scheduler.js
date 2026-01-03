// Self-contained TrendHawk Scraping Scheduler
// No local file imports to avoid ESM resolution issues
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('🚀 Starting TrendHawk Daily Scheduler (Unified)...');

async function runDailyScrape() {
    console.log(`[${new Date().toISOString()}] Starting daily trending scan...`);
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

    try {
        const context = await browser.newContext();
        const page = await context.newPage();

        // 1. Scrape Best Sellers
        await page.goto('https://www.amazon.com/Best-Sellers/zgbs', { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.zg-item-immersion', { timeout: 10000 });

        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.zg-item-immersion a.a-link-normal'))
                .slice(0, 5) // Small batch for test
                .map(a => a.href);
        });

        console.log(`[Scheduler] Found ${links.length} products. Processing...`);

        for (const link of links) {
            const pPage = await context.newPage();
            try {
                await pPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
                const data = await pPage.evaluate(() => {
                    const getText = (s) => document.querySelector(s)?.textContent.trim() || null;
                    const asin = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/)?.[1];
                    const price = document.querySelector('.a-price-whole')?.textContent.replace(/[^0-9.]/g, '');

                    return {
                        id: asin,
                        title: document.querySelector('#productTitle')?.textContent.trim(),
                        price: parseFloat(price) || 0,
                        url: window.location.href,
                        category: document.querySelector('#wayfinding-breadcrumbs_feature_div li:last-child a')?.textContent.trim()
                    };
                });

                if (data.id) {
                    // Sync to DB
                    const normalized = data.title.toLowerCase().replace(/[^a-z0-9]/g, '');

                    await supabase.from('product_snapshots').insert({
                        product_id: data.id,
                        platform: 'Amazon',
                        title: data.title,
                        price: data.price,
                        category: data.category,
                        product_url: data.url
                    });

                    await supabase.from('trending_products').upsert({
                        name: data.title,
                        normalized_name: normalized,
                        price: data.price,
                        product_url: data.url,
                        source: 'Amazon',
                        category: data.category
                    }, { onConflict: 'product_url' });

                    console.log(`  ✓ Synced: ${data.title.substring(0, 30)}`);
                }
            } catch (e) { console.error(`  ✗ Error: ${e.message}`); }
            await pPage.close();
            await new Promise(r => setTimeout(r, 1000));
        }

    } catch (error) {
        console.error('Fatal Scrape Error:', error);
    } finally {
        await browser.close();
        console.log(`[${new Date().toISOString()}] Daily sync complete.`);
    }
}

// Initial Run
runDailyScrape();

// Interval (24h)
setInterval(runDailyScrape, 24 * 60 * 60 * 1000);

// Keep alive
process.on('SIGINT', () => process.exit(0));
