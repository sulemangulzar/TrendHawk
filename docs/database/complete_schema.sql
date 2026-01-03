-- TrendHawk Complete Database Schema - ZERO ERRORS VERSION
-- This script is safe to run multiple times - it checks everything before creating

-- ============================================
-- PART 1: BASE TABLES
-- ============================================

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2),
  product_url TEXT,
  source VARCHAR(50),
  category VARCHAR(100),
  demand_level VARCHAR(20),
  saturation_level VARCHAR(20),
  risk_level VARCHAR(20),
  verdict VARCHAR(20),
  common_failure_reason TEXT,
  profit_worst_case DECIMAL(10,2),
  profit_average_case DECIMAL(10,2),
  profit_best_case DECIMAL(10,2),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Decisions table
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_url TEXT,
  platform VARCHAR(50),
  decision VARCHAR(20) DEFAULT 'saved',
  decision_status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to decisions if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='decisions' AND column_name='status') THEN
    ALTER TABLE decisions ADD COLUMN status VARCHAR(20) DEFAULT 'watching';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='decisions' AND column_name='shortlist_reason') THEN
    ALTER TABLE decisions ADD COLUMN shortlist_reason TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='decisions' AND column_name='estimated_test_cost') THEN
    ALTER TABLE decisions ADD COLUMN estimated_test_cost DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='decisions' AND column_name='risk_level') THEN
    ALTER TABLE decisions ADD COLUMN risk_level VARCHAR(10);
  END IF;
END $$;

-- 3. Trending Products table
CREATE TABLE IF NOT EXISTS trending_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2),
  product_url TEXT,
  source VARCHAR(50),
  category VARCHAR(100),
  trend_score INT,
  verdict VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to trending_products if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='trending_products' AND column_name='active_listings_count') THEN
    ALTER TABLE trending_products ADD COLUMN active_listings_count INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='trending_products' AND column_name='review_velocity') THEN
    ALTER TABLE trending_products ADD COLUMN review_velocity VARCHAR(20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='trending_products' AND column_name='seller_repetition') THEN
    ALTER TABLE trending_products ADD COLUMN seller_repetition VARCHAR(10);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='trending_products' AND column_name='price_min') THEN
    ALTER TABLE trending_products ADD COLUMN price_min DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='trending_products' AND column_name='price_max') THEN
    ALTER TABLE trending_products ADD COLUMN price_max DECIMAL(10,2);
  END IF;
END $$;

-- ============================================
-- PART 2: NEW TABLES
-- ============================================

-- 4. User Stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY,
  products_avoided INT DEFAULT 0,
  money_saved DECIMAL(10,2) DEFAULT 0,
  products_killed INT DEFAULT 0,
  products_under_test INT DEFAULT 0,
  money_at_risk DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Live Tests table
CREATE TABLE IF NOT EXISTS live_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_url TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  money_spent DECIMAL(10,2) DEFAULT 0,
  sales_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  recommendation VARCHAR(20),
  recommendation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 3: INDEXES (safe to create multiple times)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_user ON decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_decisions_user_status ON decisions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_live_tests_user_status ON live_tests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trending_seller ON trending_products(seller_repetition);

-- ============================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

DROP POLICY IF EXISTS "Users can view own decisions" ON decisions;
DROP POLICY IF EXISTS "Users can insert own decisions" ON decisions;
DROP POLICY IF EXISTS "Users can update own decisions" ON decisions;
DROP POLICY IF EXISTS "Users can delete own decisions" ON decisions;

DROP POLICY IF EXISTS "Anyone can view trending products" ON trending_products;

DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;

DROP POLICY IF EXISTS "Users can view own live tests" ON live_tests;
DROP POLICY IF EXISTS "Users can insert own live tests" ON live_tests;
DROP POLICY IF EXISTS "Users can update own live tests" ON live_tests;
DROP POLICY IF EXISTS "Users can delete own live tests" ON live_tests;

-- Create policies
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own decisions" ON decisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions" ON decisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions" ON decisions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decisions" ON decisions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view trending products" ON trending_products
  FOR SELECT USING (true);

CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own live tests" ON live_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own live tests" ON live_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own live tests" ON live_tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own live tests" ON live_tests
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PART 5: FUNCTIONS & TRIGGERS
-- ============================================

-- Drop existing function and triggers
DROP TRIGGER IF EXISTS trigger_update_stats_decisions ON decisions;
DROP TRIGGER IF EXISTS trigger_update_stats_live_tests ON live_tests;
DROP FUNCTION IF EXISTS update_user_stats();

-- Create function
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user_stats row exists
  INSERT INTO user_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update stats when decision status changes
  IF TG_TABLE_NAME = 'decisions' THEN
    UPDATE user_stats
    SET 
      products_avoided = (
        SELECT COUNT(*) FROM decisions 
        WHERE user_id = NEW.user_id AND status = 'rejected'
      ),
      money_saved = (
        SELECT COALESCE(SUM(estimated_test_cost), 0) FROM decisions 
        WHERE user_id = NEW.user_id AND status = 'rejected'
      ),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  -- Update stats when live test status changes
  IF TG_TABLE_NAME = 'live_tests' THEN
    UPDATE user_stats
    SET 
      products_killed = (
        SELECT COUNT(*) FROM live_tests 
        WHERE user_id = NEW.user_id AND status = 'killed'
      ),
      products_under_test = (
        SELECT COUNT(*) FROM live_tests 
        WHERE user_id = NEW.user_id AND status = 'active'
      ),
      money_at_risk = (
        SELECT COALESCE(SUM(money_spent), 0) FROM live_tests 
        WHERE user_id = NEW.user_id AND status = 'active'
      ),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_stats_decisions
AFTER INSERT OR UPDATE ON decisions
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_stats_live_tests
AFTER INSERT OR UPDATE ON live_tests
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

-- ============================================
-- SUCCESS!
-- ============================================
-- All tables, columns, indexes, policies, and triggers created successfully
-- Your TrendHawk dashboard is now ready to use!
