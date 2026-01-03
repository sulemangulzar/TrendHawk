-- =====================================================
-- TrendHawk Logic Fix: Infrastructure & Dynamic Stats
-- =====================================================

-- 1. Create missing search_jobs table (for scraper service compatibility)
CREATE TABLE IF NOT EXISTS search_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  keyword TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 2. Create missing favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 3. Update get_decision_summary with REAL dynamic logic
CREATE OR REPLACE FUNCTION get_decision_summary(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'scanned', (SELECT COUNT(*) FROM products WHERE user_id = user_uuid),
    'safe_to_test', (SELECT COUNT(*) FROM products WHERE user_id = user_uuid AND verdict = 'test'),
    'high_risk', (SELECT COUNT(*) FROM products WHERE user_id = user_uuid AND verdict = 'skip'),
    'skipped', (SELECT COUNT(*) FROM products WHERE user_id = user_uuid AND verdict = 'skip'),
    'money_saved', COALESCE((SELECT SUM(money_saved) FROM products WHERE user_id = user_uuid), 0)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update get_market_snapshot with REAL trend analysis logic
CREATE OR REPLACE FUNCTION get_market_snapshot()
RETURNS JSON AS $$
DECLARE
  result JSON;
  avg_conf INTEGER;
  high_demand_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT AVG(confidence_score), COUNT(*) INTO avg_conf, total_count FROM products WHERE analyzed_at > NOW() - INTERVAL '7 days';
  
  -- Simple heuristic for trending demand
  SELECT COUNT(*) INTO high_demand_count FROM products 
  WHERE demand_level = 'high' AND analyzed_at > NOW() - INTERVAL '7 days';

  SELECT json_build_object(
    'trending_demand', CASE 
      WHEN high_demand_count > (total_count * 0.5) THEN 'Surging'
      WHEN high_demand_count > (total_count * 0.2) THEN 'Active'
      ELSE 'Stable'
    END,
    'saturation_level', CASE 
      WHEN avg_conf < 40 THEN 'High'
      WHEN avg_conf < 70 THEN 'Medium'
      ELSE 'Low'
    END,
    'beginner_friendly', (SELECT COUNT(*) FROM products WHERE verdict = 'test' AND risk_level = 'low')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Ensure RLS for new tables
ALTER TABLE search_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own jobs" ON search_jobs;
CREATE POLICY "Users can view own jobs" ON search_jobs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own jobs" ON search_jobs;
CREATE POLICY "Users can insert own jobs" ON search_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);
