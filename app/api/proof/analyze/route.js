import { NextResponse } from 'next/server';
import { analyzeProduct } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        let { input } = await request.json();
        if (!input) {
            return NextResponse.json({ error: 'Please provide a product URL' }, { status: 400 });
        }

        console.log(`\n========================================`);
        console.log(`[Proof API] 🎯 Deep Analysis Starting: ${input}`);
        console.log(`========================================\n`);

        // Use the new Elite Analyzer
        const analysis = await analyzeProduct(input);

        console.log(`[Proof API] ✅ Analysis complete for: ${analysis.product_title}`);

        return NextResponse.json(analysis);

    } catch (error) {
        console.error('\n[Proof API] ❌ ERROR:', error);

        // Handle specific error types
        if (error.message.includes('NOT_A_PRODUCT')) {
            return NextResponse.json({
                error: 'The URL provided does not seem to be a valid product page or access was blocked.',
                details: error.message
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Analysis failed due to technical error',
            details: error.message,
            verdict: 'KILL'
        }, { status: 500 });
    }
}
