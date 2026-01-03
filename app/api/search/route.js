import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapeProducts } from '@/lib/scraper';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables!');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    try {
        // Check environment variables first
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('❌ Missing environment variables!');
            return NextResponse.json(
                {
                    error: 'Server configuration error: Missing Supabase credentials',
                    details: {
                        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
                        key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
                    }
                },
                { status: 500 }
            );
        }

        const { keyword, userId, platform = 'amazon' } = await request.json();

        if (!keyword || !userId) {
            return NextResponse.json(
                { error: 'Missing keyword or userId' },
                { status: 400 }
            );
        }

        // Validate platform
        if (!['amazon', 'ebay'].includes(platform)) {
            return NextResponse.json(
                { error: 'Invalid platform. Must be amazon or ebay' },
                { status: 400 }
            );
        }

        console.log(`🔍 Search request: "${keyword}" on ${platform} for user ${userId}`);

        // Check for cached results (within 48 hours)
        const { data: cachedProducts, error: cacheError } = await supabase
            .rpc('get_cached_products', {
                search_keyword: keyword,
                user_uuid: userId,
            });

        if (!cacheError && cachedProducts && cachedProducts.length > 0) {
            console.log(`✅ Cache hit for "${keyword}" - ${cachedProducts.length} products`);
            return NextResponse.json({
                status: 'cached',
                products: cachedProducts,
            });
        }

        // No cache - create new search job
        const { data: job, error: jobError } = await supabase
            .from('search_jobs')
            .insert({
                user_id: userId,
                keyword: `${platform}:${keyword}`, // Include platform in keyword
                status: 'pending',
            })
            .select()
            .single();

        if (jobError) {
            throw new Error(`Failed to create job: ${jobError.message}`);
        }

        // Start scraping in background (don't await)
        runScrapeJob(job.id, keyword, platform).catch((error) => {
            console.error('Background scrape error:', error);
        });

        return NextResponse.json({
            status: 'pending',
            job_id: job.id,
            message: 'Scraping started',
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

async function runScrapeJob(jobId, keyword, platform = 'amazon') {
    try {
        console.log(`🔍 Starting scrape for job ${jobId}: "${keyword}" on ${platform}`);

        // Run scraper with platform
        const products = await scrapeProducts(keyword, platform);

        if (!products || products.length === 0) {
            await supabase
                .from('search_jobs')
                .update({
                    status: 'failed',
                    error_message: 'No products found',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', jobId);
            return;
        }

        // Insert products
        const productsData = products.map((p) => ({
            job_id: jobId,
            keyword,
            title: p.title,
            price: p.price,
            product_url: p.product_url,
            review_count: p.review_count,
            rating: p.rating,
            source: p.source,
        }));

        await supabase.from('products').insert(productsData);

        // Update job status
        await supabase
            .from('search_jobs')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', jobId);

        console.log(`✅ Job ${jobId} completed: ${products.length} products`);
    } catch (error) {
        console.error(`❌ Job ${jobId} failed:`, error);
        await supabase
            .from('search_jobs')
            .update({
                status: 'failed',
                error_message: error.message,
                completed_at: new Date().toISOString(),
            })
            .eq('id', jobId);
    }
}
