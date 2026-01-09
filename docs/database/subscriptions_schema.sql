-- TrendHawk Subscription & Payment Tracking Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lemon_squeezy_id TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL CHECK (plan_name IN ('basic', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'paused')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYMENT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  lemon_squeezy_payment_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'refunded', 'pending')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemon_id ON subscriptions(lemon_squeezy_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON payment_history(subscription_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Service role can manage payment history" ON payment_history;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own payment history
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Service role can manage all payment history (for webhooks)
CREATE POLICY "Service role can manage payment history" ON payment_history
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- HELPER FUNCTION: Update user metadata when subscription changes
-- ============================================
CREATE OR REPLACE FUNCTION update_user_subscription_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's metadata with their current plan
  -- This will be called by webhooks via service role
  PERFORM auth.update_user_metadata(
    NEW.user_id,
    jsonb_build_object('subscription_plan', NEW.plan_name)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-update user metadata
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_user_metadata ON subscriptions;

CREATE TRIGGER trigger_update_user_metadata
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION update_user_subscription_metadata();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Subscription schema created successfully!';
  RAISE NOTICE 'Tables: subscriptions, payment_history';
  RAISE NOTICE 'Indexes and RLS policies applied';
  RAISE NOTICE 'Ready for Lemon Squeezy integration';
END $$;
