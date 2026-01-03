import { runTrendingEngine } from '@/lib/trendingEngine';
import { NextResponse } from 'next/server';

export async function GET() {
    console.log('[API] Triggering manual scrape...');
    try {
        const result = await runTrendingEngine();
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('[API] Scrape failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
