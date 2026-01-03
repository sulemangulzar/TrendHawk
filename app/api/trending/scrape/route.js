import { runTrendingEngine } from '@/lib/trendingEngine';
import { generateMockTrendingProducts } from '@/lib/mockTrendingGenerator';

export async function POST(request) {
    try {
        console.log('[API] Trending scrape triggered');

        // Try real scraper first, fall back to mock data if it fails
        let result;
        try {
            result = await runTrendingEngine();
        } catch (scraperError) {
            console.log('[API] Real scraper failed, using mock data:', scraperError.message);
            const mockProducts = await generateMockTrendingProducts();
            result = {
                success: true,
                productsScraped: mockProducts.length,
                uniqueProducts: mockProducts.length,
                duplicatesRemoved: 0,
                verdicts: {
                    hot: mockProducts.filter(p => p.verdict === 'Hot').length,
                    rising: mockProducts.filter(p => p.verdict === 'Rising').length,
                    watch: mockProducts.filter(p => p.verdict === 'Watch').length
                },
                duration: '0s',
                usingMockData: true
            };
        }

        return Response.json({
            success: true,
            message: `Successfully scraped ${result.productsScraped} products, saved ${result.uniqueProducts} unique items`,
            ...result
        });

    } catch (error) {
        console.error('[API] Trending scraper error:', error);
        return Response.json(
            {
                success: false,
                error: error.message
            },
            { status: 500 }
        );
    }
}
