-- TrendHawk Product Research Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Search Jobs Table
CREATE TABLE IF NOT EXISTS search_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES search_jobs(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10, 2),
  image_url TEXT,
  product_url TEXT,
  review_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2),
  source TEXT DEFAULT 'amazon',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_jobs_user_id ON search_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_jobs_keyword ON search_jobs(keyword);
CREATE INDEX IF NOT EXISTS idx_search_jobs_created_at ON search_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_jobs_status ON search_jobs(status);

CREATE INDEX IF NOT EXISTS idx_products_keyword ON products(keyword);
CREATE INDEX IF NOT EXISTS idx_products_job_id ON products(job_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE search_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Search Jobs Policies
-- Users can view their own search jobs
CREATE POLICY "Users can view own search jobs"
  ON search_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own search jobs
CREATE POLICY "Users can insert own search jobs"
  ON search_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for scraper service)
CREATE POLICY "Service role full access to search jobs"
  ON search_jobs FOR ALL
  USING (auth.role() = 'service_role');

-- Products Policies
-- Users can view products from their search jobs
CREATE POLICY "Users can view products from own jobs"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM search_jobs
      WHERE search_jobs.id = products.job_id
      AND search_jobs.user_id = auth.uid()
    )
  );

-- Service role can do everything (for scraper service)
CREATE POLICY "Service role full access to products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

-- Function to check for cached results (within 48 hours)
CREATE OR REPLACE FUNCTION get_cached_products(search_keyword TEXT, user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price DECIMAL,
  image_url TEXT,
  product_url TEXT,
  review_count INTEGER,
  rating DECIMAL,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price,
    p.image_url,
    p.product_url,
    p.review_count,
    p.rating,
    p.source
  FROM products p
  INNER JOIN search_jobs sj ON p.job_id = sj.id
  WHERE 
    LOWER(p.keyword) = LOWER(search_keyword)
    AND sj.user_id = user_uuid
    AND sj.status = 'completed'
    AND sj.created_at > NOW() - INTERVAL '48 hours'
  ORDER BY p.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_cached_products TO authenticated;
GRANT EXECUTE ON FUNCTION get_cached_products TO service_role;
