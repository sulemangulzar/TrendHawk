/**
 * 🔥 ELITE PRODUCT ANALYZER ENGINE
 * Integrated into TrendHawk with Ultra-Stealth
 */
import axios from "axios";
import * as cheerio from "cheerio";
import { chromium } from "playwright-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

const stealth = stealthPlugin();

// Apply stealth logic globally for this instance
chromium.use(stealth);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

// ============================================
// 🎯 MAIN ENTRY POINT
// ============================================
export async function analyzeProduct(url) {
  console.log('[Elite Analyzer] 🚀 Engine Started...');

  // Auto-prefix URL
  if (!url.match(/^[a-zA-Z]+:\/\//)) {
    url = 'https://' + url;
  }

  // STEP 2: Detect platform
  const platformInfo = detectPlatformAdvanced(url);
  console.log(`[Elite Analyzer] 🏪 Platform: ${platformInfo.platform} (${platformInfo.country})`);

  // STEP 3: Scrape raw data with Ultra-Stealth
  const rawData = await scrapeProductUniversal(url, platformInfo);

  if (!rawData || !rawData.title) {
    throw new Error("NOT_A_PRODUCT: Unable to extract product data. Site may be blocking or is not a product page.");
  }

  // STEP 4: Deep Analysis Pipeline
  const analysis = {
    // Top-level fields for UI compatibility
    product_title: rawData.title,
    detected_platform: platformInfo.platform.toUpperCase(),
    detected_region: platformInfo.country,
    analyzed_at: new Date().toISOString(),
    verdict: (rawData.reviews_count > 1000) ? 'SCALE' : 'TEST', // Simple logic for now

    product: rawData,
    market: analyzeMarket(rawData),
    competition: analyzeCompetition(rawData),
    profit: calculateProfitMetrics(rawData, platformInfo),
    risk: assessRisk(rawData),
    pricing: analyzePricingStrategy(rawData),
    demand: analyzeDemand(rawData),
    saturation: analyzeSaturation(rawData),
    quality: analyzeQuality(rawData),
    scores: calculateOverallScores(rawData),
    recommendations: generateRecommendations(rawData),

    // UI needs proof_sources
    proof_sources: [
      {
        platform: platformInfo.platform,
        title: rawData.title,
        price: rawData.price,
        priceUSD: rawData.price, // Simulating
        currency: platformInfo.currency,
        originalPrice: rawData.price,
        reviews: rawData.reviews_count,
        url: url
      }
    ]
  };

  return analysis;
}

// ============================================
// 🌐 UNIVERSAL SCRAPER (With Ultra-Stealth)
// ============================================
async function scrapeProductUniversal(url, platformInfo) {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1920 + Math.floor(Math.random() * 100), height: 1080 + Math.floor(Math.random() * 100) },
      locale: platformInfo.locale
    });

    const page = await context.newPage();

    // Professional Navigation
    console.log(`[Elite Analyzer] 🛡️ Stealth Navigation...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Human simulation
    await page.mouse.move(100 + Math.random() * 500, 100 + Math.random() * 500);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(4000);

    let rawData;
    switch (platformInfo.platform) {
      case 'amazon':
        rawData = await extractAmazonAdvanced(page, url);
        break;
      case 'ebay':
        rawData = await extractEbayAdvanced(page, url);
        break;
      case 'shopify':
        rawData = await extractShopifyAdvanced(page, url);
        break;
      default:
        rawData = await extractGenericAdvanced(page, url);
    }

    return rawData;
  } catch (error) {
    console.error('[Elite Analyzer] Critical Scrape Fail:', error.message);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

// --- Platform Detection Logic ---
function detectPlatformAdvanced(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();

    let platform = 'generic';
    if (hostname.includes('amazon')) platform = 'amazon';
    else if (hostname.includes('ebay')) platform = 'ebay';
    else if (hostname.includes('shopify') || path.includes('/products/')) platform = 'shopify';

    let country = 'US', currency = 'USD', locale = 'en-US';
    if (hostname.includes('.co.uk')) { country = 'UK'; currency = 'GBP'; locale = 'en-GB'; }
    else if (hostname.includes('.de')) { country = 'DE'; currency = 'EUR'; locale = 'de-DE'; }
    else if (hostname.includes('.it')) { country = 'IT'; currency = 'EUR'; locale = 'it-IT'; }
    else if (hostname.includes('.fr')) { country = 'FR'; currency = 'EUR'; locale = 'fr-FR'; }
    else if (hostname.includes('.es')) { country = 'ES'; currency = 'EUR'; locale = 'es-ES'; }

    return { platform, country, currency, locale };
  } catch (e) {
    return { platform: 'generic', country: 'US', currency: 'USD', locale: 'en-US' };
  }
}

// --- Advanced Extractors ---
async function extractAmazonAdvanced(page, url) {
  const data = {
    title: await page.$eval('#productTitle', el => el.innerText.trim()).catch(() => null),
    price: await page.evaluate(() => {
      const el = document.querySelector('.a-price .a-offscreen');
      return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) : null;
    }),
    rating: await page.evaluate(() => {
      const el = document.querySelector('span[data-hook="rating-out-of-text"]');
      return el ? parseFloat(el.textContent) : null;
    }),
    reviews_count: await page.evaluate(() => {
      const el = document.querySelector('#acrCustomerReviewText');
      return el ? parseInt(el.textContent.replace(/[^0-9]/g, '')) : 0;
    }),
    seller_count: await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/([\d]+)\s+sellers/i);
      return match ? parseInt(match[1]) : 1;
    }),
    images_count: await page.evaluate(() => document.querySelectorAll('#altImages img').length),
    in_stock: await page.evaluate(() => document.body.innerText.toLowerCase().includes('in stock'))
  };
  return data;
}

// eBay Extractor
async function extractEbayAdvanced(page, url) {
  const data = {
    title: await page.$eval('h1.x-item-title__mainTitle', el => el.innerText.trim()).catch(() => null),
    price: await page.evaluate(() => {
      const el = document.querySelector('.x-price-primary .ux-textspans');
      return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) : null;
    }),
    rating: await page.evaluate(() => {
      const el = document.querySelector('.x-star-rating .ux-textspans');
      return el ? parseFloat(el.textContent) : null;
    }),
    reviews_count: await page.evaluate(() => {
      const el = document.querySelector('.x-review-count');
      return el ? parseInt(el.textContent.replace(/[^0-9]/g, '')) : 0;
    }),
    seller_count: await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/([\\d,]+)\\s+sold/i);
      return match ? parseInt(match[1].replace(/,/g, '')) : 1;
    }),
    images_count: await page.evaluate(() => document.querySelectorAll('.ux-image-carousel-item img').length),
    in_stock: await page.evaluate(() => !document.body.innerText.toLowerCase().includes('out of stock'))
  };
  return data;
}

// Shopify Extractor
async function extractShopifyAdvanced(page, url) {
  const data = {
    title: await page.$eval('h1.product-title, h1.product__title, [class*="product-title"]', el => el.innerText.trim()).catch(() =>
      page.evaluate(() => document.title)
    ),
    price: await page.evaluate(() => {
      // Try multiple Shopify price selectors
      const selectors = [
        '.price__current .money',
        '.product-price .money',
        '[class*="price"] .money',
        '.price-item--regular',
        '[data-product-price]'
      ];
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) {
          const text = el.textContent || el.getAttribute('data-product-price') || '';
          const price = parseFloat(text.replace(/[^0-9.]/g, ''));
          if (price) return price;
        }
      }
      return null;
    }),
    rating: await page.evaluate(() => {
      const el = document.querySelector('.spr-badge-starrating, [class*="rating"]');
      if (!el) return null;
      const style = window.getComputedStyle(el);
      const width = style.width;
      if (width && width.includes('%')) {
        return (parseFloat(width) / 100) * 5;
      }
      return 4.0; // Default
    }),
    reviews_count: await page.evaluate(() => {
      const el = document.querySelector('.spr-badge-caption, [class*="review-count"]');
      return el ? parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0 : 0;
    }),
    seller_count: 1, // Shopify stores typically have one seller
    images_count: await page.evaluate(() => {
      return document.querySelectorAll('.product__media img, [class*="product-image"]').length;
    }),
    in_stock: await page.evaluate(() => {
      const addToCart = document.querySelector('[name="add"], .product-form__submit, [class*="add-to-cart"]');
      if (!addToCart) return false;
      const text = addToCart.textContent.toLowerCase();
      return !text.includes('sold out') && !text.includes('unavailable') && !addToCart.disabled;
    })
  };
  return data;
}

// Generic Extractor
async function extractGenericAdvanced(page, url) {
  return {
    title: await page.evaluate(() => document.title),
    price: await page.evaluate(() => {
      const p = document.querySelector('[class*="price"], .amount');
      return p ? parseFloat(p.innerText.replace(/[^0-9.]/g, "")) : null;
    }),
    reviews_count: 50, // Default for generic estimation
    rating: 4.0
  };
}

// --- Analysis Engine ---

/**
 * Compatibility wrapper for legacy routes
 * Supports both new product object and old URL-based analysis
 */
export async function analyzeMarket(input, marketSample = []) {
  // If it's a URL (old signature), use analyzeProduct
  if (typeof input === 'string') {
    return await analyzeProduct(input);
  }

  // If it's already a product object (new signature), run the specific analyzer
  const product = input;
  const reviews = product.reviews_count || 0;
  return {
    market_size: reviews > 5000 ? 'large' : reviews > 1000 ? 'medium' : 'small',
    trend: reviews > 1000 ? 'stable' : 'emerging',
    seasonality: 'year_round',
    maturity: reviews > 5000 ? 'saturated' : 'growing'
  };
}

export function analyzeCompetition(product) {
  const sellers = product.seller_count || 1;
  return {
    level: sellers > 10 ? 'high' : sellers > 3 ? 'medium' : 'low',
    seller_count: sellers,
    barrier_to_entry: sellers > 10 ? 'high' : 'low',
    recommendation: sellers > 10 ? 'Requires strong differentiation' : 'Good entry point'
  };
}

export function calculateProfitMetrics(product, pi) {
  const price = product.price || 50; // Fallback
  const cogs = price * 0.3;
  const fees = price * 0.15;
  const ads = price * 0.1;
  const net = price - cogs - fees - ads;

  return {
    selling_price: price,
    estimated_cogs: parseFloat(cogs.toFixed(2)),
    net_profit_per_unit: parseFloat(net.toFixed(2)),
    profit_margin_percent: parseFloat(((net / price) * 100).toFixed(1)),
    roi_percent: Math.round((net / cogs) * 100),
    monthly_revenue_potential: {
      estimated_monthly_sales: Math.round((product.reviews_count || 50) * 0.5),
      estimated_monthly_profit: parseFloat((Math.round((product.reviews_count || 50) * 0.5) * net).toFixed(2))
    }
  };
}

export function assessRisk(product) {
  const riskScore = (product.rating && product.rating < 4) ? 50 : 20;
  return {
    level: riskScore > 40 ? 'high' : 'low',
    score: riskScore,
    risks: riskScore > 40 ? [{ message: 'Quality concerns based on rating' }] : []
  };
}

export function calculateOverallScores(product) {
  const r = product.reviews_count || 0;
  return {
    overall: r > 1000 ? 85 : 60,
    profit_potential: 75,
    risk_score: 20,
    demand_score: r > 500 ? 90 : 40
  };
}

export function generateRecommendations(product) {
  const isGood = product.reviews_count > 100;
  return {
    verdict: isGood ? 'EXCELLENT OPPORTUNITY' : 'WATCHLIST',
    action: isGood ? 'Consider for scaling' : 'Monitor market trends',
    pros: ['Proven demand', 'Healthy margins', 'Low competition'],
    cons: ['Requires initial stock'],
    next_steps: ['1. Contact suppliers', '2. Order samples', '3. Launch test ads']
  };
}

export function analyzePricingStrategy(p) { return { positioning: 'mid-market' }; }
export function analyzeDemand(p) { return { level: 'high' }; }
export function analyzeSaturation(p) { return { level: 'low' }; }
export function analyzeQuality(p) { return { trust_score: 85 }; }
