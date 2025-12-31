-- =====================================================
-- Step 1: CREATE TABLES ONLY
-- Run this first, then run step 2
-- =====================================================

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

CREATE TABLE IF NOT EXISTS user_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products ON DELETE CASCADE,
  decision TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_decisions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_analyzed_at ON products(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_user_decisions_user_id ON user_decisions(user_id);
