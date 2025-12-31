-- =====================================================
-- FIX: Repair Products Table Schema
-- Run this in Supabase SQL Editor to add missing columns
-- =====================================================

-- 1. Add user_id column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='user_id') THEN
        ALTER TABLE products ADD COLUMN user_id UUID REFERENCES auth.users;
    END IF;
END $$;

-- 2. Add Verdict & Analysis columns if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='verdict') THEN
        ALTER TABLE products ADD COLUMN verdict TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='risk_level') THEN
        ALTER TABLE products ADD COLUMN risk_level TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='demand_level') THEN
        ALTER TABLE products ADD COLUMN demand_level TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='saturation_score') THEN
        ALTER TABLE products ADD COLUMN saturation_score INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='emotional_trigger_score') THEN
        ALTER TABLE products ADD COLUMN emotional_trigger_score INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='confidence_score') THEN
        ALTER TABLE products ADD COLUMN confidence_score INTEGER;
    END IF;
END $$;

-- 3. Add Profit & Shipping columns if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='profit_worst_case') THEN
        ALTER TABLE products ADD COLUMN profit_worst_case NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='profit_average_case') THEN
        ALTER TABLE products ADD COLUMN profit_average_case NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='profit_best_case') THEN
        ALTER TABLE products ADD COLUMN profit_best_case NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='estimated_cost') THEN
        ALTER TABLE products ADD COLUMN estimated_cost NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='estimated_shipping') THEN
        ALTER TABLE products ADD COLUMN estimated_shipping NUMERIC;
    END IF;
END $$;

-- 4. Add Audience & JSON columns if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='common_complaints') THEN
        ALTER TABLE products ADD COLUMN common_complaints JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='failure_reasons') THEN
        ALTER TABLE products ADD COLUMN failure_reasons JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='best_audience') THEN
        ALTER TABLE products ADD COLUMN best_audience TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='avoid_audience') THEN
        ALTER TABLE products ADD COLUMN avoid_audience TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='money_saved') THEN
        ALTER TABLE products ADD COLUMN money_saved NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='analyzed_at') THEN
        ALTER TABLE products ADD COLUMN analyzed_at TIMESTAMPTZ;
    END IF;
END $$;

-- 5. Enable RLS and setup policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own products" ON products;
CREATE POLICY "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own products" ON products;
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own products" ON products;
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);

-- 6. Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- =====================================================
-- DONE! Your products table is now fixed.
-- =====================================================
