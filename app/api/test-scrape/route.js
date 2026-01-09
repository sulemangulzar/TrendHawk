import { NextResponse } from 'next/server';
import AmazonScraper from '@/lib/scrapers/amazonScraper';

export const dynamic = 'force-dynamic';


const amazonScraper = new AmazonScraper();

export async function GET() {
    console.log('[API] Triggering manual test scrape...');
    try {
        const result = await amazonScraper.scrapeTrendingProducts('all', 5);
        return NextResponse.json({ success: true, count: result.products?.length || 0, result });
    } catch (error) {
        console.error('[API] Scrape failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

