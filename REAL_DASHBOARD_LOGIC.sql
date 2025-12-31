-- =====================================================
-- REPAIR: Real Dashboard Analytics
-- Run this in Supabase SQL Editor to enable real data
-- =====================================================

-- 1. Real Decision Summary Logic
CREATE OR REPLACE FUNCTION get_decision_summary(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'safe_to_test', COUNT(*) FILTER (WHERE verdict = 'test'),
    'high_risk', COUNT(*) FILTER (WHERE verdict = 'careful'),
    'skipped', COUNT(*) FILTER (WHERE verdict = 'skip'),
    'money_saved', COALESCE(SUM(money_saved), 0)
  ) INTO result
  FROM products
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Real Market Snapshot Logic
CREATE OR REPLACE FUNCTION get_market_snapshot()
RETURNS JSON AS $$
DECLARE
  result JSON;
  demand_txt TEXT;
  saturation_txt TEXT;
  beginner_count INTEGER;
BEGIN
  -- Get average demand level
  SELECT 
    CASE 
      WHEN AVG(saturation_score) < 30 THEN 'High'
      WHEN AVG(saturation_score) < 60 THEN 'Stable'
      ELSE 'Saturated'
    END INTO demand_txt
  FROM products
  WHERE analyzed_at > NOW() - INTERVAL '7 days';

  -- Get market saturation status (simplified)
  SELECT 
    CASE 
      WHEN COUNT(*) FILTER (WHERE verdict = 'test') > COUNT(*) FILTER (WHERE verdict = 'skip') THEN 'Healthy'
      ELSE 'Compressed'
    END INTO saturation_txt
  FROM products
  WHERE analyzed_at > NOW() - INTERVAL '7 days';

  -- Get beginner friendly count
  SELECT COUNT(*) INTO beginner_count
  FROM products
  WHERE verdict = 'test' 
  AND risk_level = 'low'
  AND analyzed_at > NOW() - INTERVAL '7 days';

  RETURN json_build_object(
    'trending_demand', COALESCE(demand_txt, 'Stable'),
    'saturation_level', COALESCE(saturation_txt, 'Stable'),
    'beginner_friendly', COALESCE(beginner_count, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE! Your dashboard will now show real data.
-- =====================================================
