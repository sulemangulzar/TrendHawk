-- TrendHawk Dashboard Redesign - Database Migration
-- Money-Risk Control System Schema

-- 1. Create user_stats table for money protection tracking
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  products_avoided INT DEFAULT 0,
  money_saved DECIMAL(10,2) DEFAULT 0,
  products_killed INT DEFAULT 0,
  products_under_test INT DEFAULT 0,
  money_at_risk DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create live_tests table for active product testing
CREATE TABLE IF NOT EXISTS live_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_url TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  money_spent DECIMAL(10,2) DEFAULT 0,
  sales_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'killed', 'scaled')),
  recommendation VARCHAR(20) CHECK (recommendation IN ('kill', 'pause', 'scale', 'continue')),
  recommendation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modify decisions table for Shortlist functionality
ALTER TABLE decisions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'watching' 
CHECK (status IN ('watching', 'ready', 'rejected', 'testing', 'killed', 'scaled'));

ALTER TABLE decisions 
ADD COLUMN IF NOT EXISTS shortlist_reason TEXT;

ALTER TABLE decisions 
ADD COLUMN IF NOT EXISTS estimated_test_cost DECIMAL(10,2);

ALTER TABLE decisions 
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(10) 
CHECK (risk_level IN ('low', 'medium', 'high'));

-- 4. Modify trending_products for Market Proof data
ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS active_listings_count INT;

ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS review_velocity VARCHAR(20) 
CHECK (review_velocity IN ('increasing', 'flat', 'declining'));

ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS seller_repetition VARCHAR(10) 
CHECK (seller_repetition IN ('high', 'medium', 'low'));

ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS price_min DECIMAL(10,2);

ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS price_max DECIMAL(10,2);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_tests_user_status ON live_tests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_decisions_user_status ON decisions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_trending_seller_repetition ON trending_products(seller_repetition);

-- 6. Create function to update user_stats automatically
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
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

-- 7. Create triggers
DROP TRIGGER IF EXISTS trigger_update_stats_decisions ON decisions;
CREATE TRIGGER trigger_update_stats_decisions
AFTER INSERT OR UPDATE ON decisions
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

DROP TRIGGER IF EXISTS trigger_update_stats_live_tests ON live_tests;
CREATE TRIGGER trigger_update_stats_live_tests
AFTER INSERT OR UPDATE ON live_tests
FOR EACH ROW
EXECUTE FUNCTION update_user_stats();

-- 8. Create function to calculate live test recommendations
CREATE OR REPLACE FUNCTION calculate_test_recommendation(
  test_id UUID
)
RETURNS TABLE(recommendation VARCHAR(20), reason TEXT) AS $$
DECLARE
  test_record RECORD;
  days_live INT;
  break_even BOOLEAN;
BEGIN
  SELECT * INTO test_record FROM live_tests WHERE id = test_id;
  
  days_live := CURRENT_DATE - test_record.start_date;
  break_even := (test_record.sales_count * 30) > test_record.money_spent; -- Assuming $30 avg profit per sale
  
  -- Rule 1: Kill if no sales after 14 days
  IF days_live >= 14 AND test_record.sales_count = 0 THEN
    RETURN QUERY SELECT 'kill'::VARCHAR(20), 'No sales after 14 days'::TEXT;
    RETURN;
  END IF;
  
  -- Rule 2: Kill if spending too much without profit
  IF test_record.money_spent > 500 AND NOT break_even THEN
    RETURN QUERY SELECT 'kill'::VARCHAR(20), 'Cost exceeds margin threshold'::TEXT;
    RETURN;
  END IF;
  
  -- Rule 3: Scale if profitable
  IF break_even AND test_record.sales_count >= 5 THEN
    RETURN QUERY SELECT 'scale'::VARCHAR(20), 'Profitable trend detected'::TEXT;
    RETURN;
  END IF;
  
  -- Rule 4: Continue testing
  RETURN QUERY SELECT 'continue'::VARCHAR(20), 'Keep monitoring'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 9. Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_tests ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
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

-- 11. Initialize user_stats for existing users
INSERT INTO user_stats (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
