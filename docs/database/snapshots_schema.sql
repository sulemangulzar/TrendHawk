-- Add product_snapshots table for trend detection
-- This table stores historical data to calculate review velocity, price stability, and seller growth

CREATE TABLE IF NOT EXISTS product_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  title TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  rating DECIMAL(3,2),
  review_count INT,
  seller_name TEXT,
  seller_count INT,
  category VARCHAR(100),
  rank INT,
  image_url TEXT,
  product_url TEXT NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_snapshots_product_platform ON product_snapshots(product_id, platform);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON product_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_platform ON product_snapshots(platform);

-- Add columns to trending_products for calculated metrics
ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS demand_score INT;

ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS review_velocity DECIMAL(10,2);

ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS price_stability VARCHAR(20);

ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS rank_improvement INT;

ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Function to calculate review velocity
CREATE OR REPLACE FUNCTION calculate_review_velocity(
  p_product_id TEXT,
  p_platform VARCHAR(50)
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  current_reviews INT;
  old_reviews INT;
  velocity DECIMAL(10,2);
BEGIN
  -- Get most recent review count
  SELECT review_count INTO current_reviews
  FROM product_snapshots
  WHERE product_id = p_product_id 
    AND platform = p_platform
  ORDER BY snapshot_date DESC
  LIMIT 1;
  
  -- Get review count from 7 days ago
  SELECT review_count INTO old_reviews
  FROM product_snapshots
  WHERE product_id = p_product_id 
    AND platform = p_platform
    AND snapshot_date <= NOW() - INTERVAL '7 days'
  ORDER BY snapshot_date DESC
  LIMIT 1;
  
  -- Calculate velocity (reviews per day)
  IF old_reviews IS NOT NULL THEN
    velocity := (current_reviews - old_reviews)::DECIMAL / 7.0;
  ELSE
    velocity := 0;
  END IF;
  
  RETURN COALESCE(velocity, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate demand score (0-100)
CREATE OR REPLACE FUNCTION calculate_demand_score(
  p_product_id TEXT,
  p_platform VARCHAR(50)
)
RETURNS INT AS $$
DECLARE
  rev_velocity DECIMAL(10,2);
  rank_change INT;
  price_changes INT;
  seller_growth INT;
  score INT;
BEGIN
  -- Get review velocity
  rev_velocity := calculate_review_velocity(p_product_id, p_platform);
  
  -- Get rank improvement (lower rank = better)
  SELECT 
    (LAG(rank) OVER (ORDER BY snapshot_date) - rank) INTO rank_change
  FROM product_snapshots
  WHERE product_id = p_product_id 
    AND platform = p_platform
  ORDER BY snapshot_date DESC
  LIMIT 1;
  
  -- Get price stability (fewer changes = better)
  SELECT COUNT(DISTINCT price) INTO price_changes
  FROM product_snapshots
  WHERE product_id = p_product_id 
    AND platform = p_platform
    AND snapshot_date >= NOW() - INTERVAL '30 days';
    
  -- Get seller growth
  SELECT 
    (seller_count - LAG(seller_count) OVER (ORDER BY snapshot_date)) INTO seller_growth
  FROM product_snapshots
  WHERE product_id = p_product_id 
    AND platform = p_platform
  ORDER BY snapshot_date DESC
  LIMIT 1;
  
  -- Calculate weighted score
  score := 
    (LEAST(rev_velocity * 10, 40)::INT) +  -- Max 40 points
    (LEAST(COALESCE(rank_change, 0) / 100, 30)::INT) +  -- Max 30 points
    (CASE WHEN price_changes <= 2 THEN 20 ELSE 10 END) +  -- 20 or 10 points
    (LEAST(COALESCE(seller_growth, 0) * 2, 10)::INT);  -- Max 10 points
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to determine saturation level
CREATE OR REPLACE FUNCTION get_saturation_level(seller_count INT)
RETURNS VARCHAR(20) AS $$
BEGIN
  IF seller_count > 50 THEN
    RETURN 'High';
  ELSIF seller_count >= 15 THEN
    RETURN 'Medium';
  ELSE
    RETURN 'Low';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to generate verdict
CREATE OR REPLACE FUNCTION generate_verdict(
  demand_score INT,
  saturation_level VARCHAR(20)
)
RETURNS VARCHAR(20) AS $$
BEGIN
  IF demand_score >= 70 AND saturation_level = 'Low' THEN
    RETURN 'Safe to Test';
  ELSIF demand_score >= 50 AND saturation_level IN ('Low', 'Medium') THEN
    RETURN 'Careful';
  ELSE
    RETURN 'Kill';
  END IF;
END;
$$ LANGUAGE plpgsql;
