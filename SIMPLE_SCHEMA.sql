-- =====================================================
-- TrendHawk Schema WITHOUT Authentication
-- Use this if auth.users doesn't exist yet
-- =====================================================

-- Create products table (no user_id foreign key)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  price TEXT,
  image_url TEXT,
  product_url TEXT,
  platform TEXT,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC,
  keyword TEXT,
  source TEXT,
  verdict TEXT,
  risk_level TEXT,
  demand_level TEXT,
  saturation_score INTEGER,
  profit_worst_case NUMERIC,
  profit_average_case NUMERIC,
  profit_best_case NUMERIC,
  estimated_cost NUMERIC,
  estimated_shipping NUMERIC,
  common_complaints JSONB DEFAULT '[]'::jsonb,
  failure_reasons JSONB DEFAULT '[]'::jsonb,
  best_audience TEXT,
  avoid_audience TEXT,
  money_saved NUMERIC DEFAULT 0,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_profiles table (no foreign key)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_decisions table
CREATE TABLE IF NOT EXISTS user_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id UUID REFERENCES products ON DELETE CASCADE,
  decision TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_analyzed_at ON products(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_user_decisions_user_id ON user_decisions(user_id);

-- Create functions
CREATE OR REPLACE FUNCTION get_decision_summary(user_uuid TEXT)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'safe_to_test', 0,
    'high_risk', 0,
    'skipped', 0,
    'money_saved', 0
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_market_snapshot()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'trending_demand', 'Stable',
    'saturation_level', 'Stable',
    'beginner_friendly', 0
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DONE! Tables created without auth dependency
-- =====================================================
