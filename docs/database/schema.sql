-- =====================================================
-- TrendHawk Complete Database Setup
-- COPY THIS ENTIRE FILE AND RUN IT ALL AT ONCE
-- =====================================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  price TEXT,
  image_url TEXT,
  product_url TEXT,
  platform TEXT,
  demand_score INTEGER DEFAULT 0,
  competition_level TEXT DEFAULT 'Medium',
  profit_margin TEXT DEFAULT '0%',
  cost_price NUMERIC,
  selling_price NUMERIC,
  break_even_roas NUMERIC,
  net_profit NUMERIC,
  review_count INTEGER DEFAULT 0,
  rating NUMERIC,
  keyword TEXT,
  source TEXT,
  verdict TEXT,
  risk_level TEXT,
  demand_level TEXT,
  saturation_score INTEGER,
  emotional_trigger_score INTEGER,
  confidence_score INTEGER,
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
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  daily_search_count INTEGER DEFAULT 0,
  last_search_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_decisions table
CREATE TABLE IF NOT EXISTS user_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products ON DELETE CASCADE,
  decision TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_decisions ENABLE ROW LEVEL SECURITY;

-- Create policies for products
DROP POLICY IF EXISTS "Users can view own products" ON products;
CREATE POLICY "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own products" ON products;
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own products" ON products;
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- Create policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for user_decisions
DROP POLICY IF EXISTS "Users can view own decisions" ON user_decisions;
CREATE POLICY "Users can view own decisions" ON user_decisions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own decisions" ON user_decisions;
CREATE POLICY "Users can insert own decisions" ON user_decisions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own decisions" ON user_decisions;
CREATE POLICY "Users can update own decisions" ON user_decisions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own decisions" ON user_decisions;
CREATE POLICY "Users can delete own decisions" ON user_decisions FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_analyzed_at ON products(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_user_decisions_user_id ON user_decisions(user_id);

-- Create functions
CREATE OR REPLACE FUNCTION get_decision_summary(user_uuid UUID)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'safe_to_test', 0,
    'high_risk', 0,
    'skipped', 0,
    'money_saved', 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_market_snapshot()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'trending_demand', 'Stable',
    'saturation_level', 'Stable',
    'beginner_friendly', 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE! Your database is ready.
-- =====================================================
