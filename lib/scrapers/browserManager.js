import { chromium } from 'playwright';

let browser;

/**
 * Get or create browser instance with STEALTH configuration
 * This helps bypass bot detection without proxies
 */
export async function getBrowser() {
    if (!browser) {
        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled', // Hide automation
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
    }
    return browser;
}

/**
 * Create stealth context with randomized fingerprint
 * Makes the browser look like a real human user
 */
export async function createStealthContext() {
    const browser = await getBrowser();

    // Randomize viewport to look more human
    const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1536, height: 864 },
        { width: 1440, height: 900 }
    ];
    const viewport = viewports[Math.floor(Math.random() * viewports.length)];

    // Realistic user agents (recent Chrome versions)
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    const context = await browser.newContext({
        userAgent,
        viewport,
        locale: 'en-US',
        timezoneId: 'America/New_York',
        permissions: ['geolocation'],
        geolocation: { latitude: 40.7128, longitude: -74.0060 }, // New York
        colorScheme: 'light',
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
        javaScriptEnabled: true,
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    });

    return context;
}

/**
 * Add stealth scripts to page to hide automation
 */
export async function addStealthScripts(page) {
    // Override navigator.webdriver
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false
        });

        // Add realistic plugins
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5]
        });

        // Add realistic languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en']
        });

        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );

        // Add Chrome runtime
        window.chrome = {
            runtime: {}
        };
    });
}

/**
 * Simulate human-like behavior
 */
export async function simulateHumanBehavior(page) {
    // Random mouse movements
    await page.mouse.move(
        Math.random() * 100,
        Math.random() * 100
    );

    // Random small delay
    await page.waitForTimeout(500 + Math.random() * 1000);

    // Scroll a bit (humans scroll)
    await page.evaluate(() => {
        window.scrollBy(0, Math.random() * 300);
    });
}

export async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
