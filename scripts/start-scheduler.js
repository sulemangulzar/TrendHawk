// Script to start the scraping scheduler
// Run this in production to keep data fresh

import scheduler from '../lib/jobs/scrapingScheduler.js';

console.log('🚀 Starting TrendHawk Scraping Scheduler...');
console.log('📊 Jobs scheduled:');
console.log('  - Trending products: Every 12 hours');
console.log('  - Product snapshots: Every 24 hours');
console.log('  - Demand scores: Every 24 hours');
console.log('');

// Start the scheduler
scheduler.scheduleJobs();

console.log('✅ Scheduler running. Press Ctrl+C to stop.');

// Keep the process alive
process.on('SIGINT', () => {
    console.log('\n👋 Stopping scheduler...');
    process.exit(0);
});
