// Scraping Job Scheduler
// Runs periodic scraping jobs to keep data fresh

import { supabase } from '../supabase.js';
import AmazonScraper from '../scrapers/amazonScraper.js';

export class ScrapingScheduler {
    constructor() {
        this.amazonScraper = new AmazonScraper();
        this.isRunning = false;
    }

    /**
     * Schedule all scraping jobs
     */
    scheduleJobs() {
        console.log('[Scheduler] Initializing Daily Trending Scrape (24h)...');

        // Run once immediately on start
        this.runDailyScrape();

        // Then every 24 hours
        // 24 hours = 24 * 60 * 60 * 1000 = 86,400,000ms
        setInterval(() => this.runDailyScrape(), 24 * 60 * 60 * 1000);

        console.log('[Scheduler] Daily job scheduled');
    }

    /**
     * Main daily job: Scrape trending products and store snapshots
     */
    async runDailyScrape() {
        if (this.isRunning) {
            console.log('[Scheduler] Already running, skipping daily scrape...');
            return;
        }

        this.isRunning = true;
        console.log(`[Scheduler] ${new Date().toISOString()} - Starting daily trending scan...`);

        try {
            // 1. Scrape Amazon Best Sellers
            const result = await this.amazonScraper.scrapeTrendingProducts('all', 15);

            if (result.success) {
                console.log(`[Scheduler] Scraped ${result.products.length} products. Syncing to DB...`);

                for (const product of result.products) {
                    // 2. Save Snapshot for historical trend tracking
                    await this.saveProductSnapshot({
                        ...product,
                        platform: 'Amazon'
                    });

                    // 3. Update Trending Table (Market Proof)
                    await this.updateTrendingProduct(product);
                }

                // 4. Recalculate Demand Scores once batch is done
                console.log('[Scheduler] Recalculating market scores...');
                await this.scheduleScoreUpdate();

                console.log('[Scheduler] Daily sync complete.');
            }
        } catch (error) {
            console.error('[Scheduler] Daily scrape failed:', error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Scrape product snapshots for existing products
     */
    async scheduleSnapshotScrape() {
        console.log('[Scheduler] Starting snapshot scrape...');

        try {
            // Get all products that need updates
            const { data: products } = await supabase
                .from('trending_products')
                .select('product_url, source')
                .limit(50);

            if (products) {
                for (const product of products) {
                    const result = await this.amazonScraper.scrapeProduct(product.product_url);

                    if (result.success) {
                        await this.saveProductSnapshot({
                            ...result.data,
                            platform: product.source
                        });
                    }

                    // Delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

                console.log(`[Scheduler] Updated ${products.length} product snapshots`);
            }
        } catch (error) {
            console.error('[Scheduler] Snapshot scrape error:', error);
        }
    }

    /**
     * Update demand scores for all products
     */
    async scheduleScoreUpdate() {
        console.log('[Scheduler] Starting score update...');

        try {
            // This would call the database function to recalculate scores
            const { error } = await supabase.rpc('update_all_demand_scores');

            if (error) throw error;

            console.log('[Scheduler] Demand scores updated');
        } catch (error) {
            console.error('[Scheduler] Score update error:', error);
        }
    }

    /**
     * Save product snapshot to database
     */
    async saveProductSnapshot(productData) {
        const { error } = await supabase
            .from('product_snapshots')
            .insert({
                product_id: productData.product_id,
                platform: productData.platform,
                title: productData.title,
                price: productData.price,
                currency: productData.currency || 'USD',
                rating: productData.rating,
                review_count: productData.review_count,
                seller_name: productData.seller_name,
                seller_count: productData.seller_count,
                category: productData.category,
                rank: productData.rank,
                image_url: productData.image_url,
                product_url: productData.product_url
            });

        if (error) {
            console.error('[Scheduler] Error saving snapshot:', error);
        }
    }

    /**
     * Update trending_products table
     */
    async updateTrendingProduct(productData) {
        // Check if product exists
        const { data: existing } = await supabase
            .from('trending_products')
            .select('id')
            .eq('product_url', productData.product_url)
            .single();

        const productRecord = {
            name: productData.title,
            normalized_name: productData.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
            price: productData.price,
            product_url: productData.product_url,
            source: 'Amazon',
            category: productData.category,
            active_listings_count: productData.seller_count,
            price_min: productData.price,
            price_max: productData.price,
            last_updated: new Date().toISOString()
        };

        if (existing) {
            // Update existing
            await supabase
                .from('trending_products')
                .update(productRecord)
                .eq('id', existing.id);
        } else {
            // Insert new
            await supabase
                .from('trending_products')
                .insert(productRecord);
        }
    }
}

// Create singleton instance
const scheduler = new ScrapingScheduler();

export default scheduler;
