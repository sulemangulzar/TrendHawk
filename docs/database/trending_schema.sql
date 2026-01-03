-- Updated Trending Products Schema (No Images)
-- Production-ready with trend scoring, favorites, and 48-hour expiry

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Updated Trending Products Table (NO image_url)
DROP TABLE IF EXISTS trending_products CASCADE;

CREATE TABLE trending_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL, -- for deduplication
    product_url TEXT NOT NULL,
    category TEXT NOT NULL,
    normalized_category TEXT, -- e.g., "Home & Kitchen" → "Home"
    price DECIMAL(10, 2),
    source TEXT NOT NULL, -- 'Amazon' or 'TikTok'
    rank INTEGER, -- position in trending list
    trend_score INTEGER DEFAULT 50, -- 1-100
    verdict TEXT DEFAULT 'Watch', -- 'Hot', 'Rising', 'Watch'
    scraped_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '48 hours'
);

-- Indexes for performance and deduplication
CREATE INDEX idx_normalized_name ON trending_products(normalized_name);
CREATE INDEX idx_product_url ON trending_products(product_url);
CREATE INDEX idx_expires_at ON trending_products(expires_at);
CREATE INDEX idx_trend_score ON trending_products(trend_score DESC);
CREATE INDEX idx_verdict ON trending_products(verdict);
CREATE INDEX idx_source ON trending_products(source);

-- Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(original_name)
);

-- Scraper Schedule Table (updated)
DROP TABLE IF EXISTS scraper_schedule CASCADE;

CREATE TABLE scraper_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scraper_type TEXT NOT NULL, -- 'trending'
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    error_message TEXT,
    products_scraped INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial scraper schedule
INSERT INTO scraper_schedule (scraper_type, next_run, status)
VALUES ('trending', NOW(), 'pending')
ON CONFLICT DO NOTHING;

-- Function to clean expired products (older than 48 hours)
CREATE OR REPLACE FUNCTION clean_expired_trending_products()
RETURNS void AS $$
BEGIN
    DELETE FROM trending_products
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE trending_products IS 'Stores trending products from Amazon and TikTok with trend scoring';
COMMENT ON COLUMN trending_products.normalized_name IS 'Lowercase name without symbols for deduplication';
COMMENT ON COLUMN trending_products.trend_score IS 'Score from 1-100 based on rank and multi-source appearances';
COMMENT ON COLUMN trending_products.verdict IS 'Hot (80+), Rising (60+), or Watch (<60)';
COMMENT ON COLUMN trending_products.expires_at IS 'Products auto-delete after 48 hours';
