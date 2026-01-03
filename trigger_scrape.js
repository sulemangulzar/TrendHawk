const { runTrendingEngine } = require('./lib/trendingEngine');

async function test() {
    console.log('Starting manual trending engine test...');
    try {
        const result = await runTrendingEngine();
        console.log('Test completed successfully:', result);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
