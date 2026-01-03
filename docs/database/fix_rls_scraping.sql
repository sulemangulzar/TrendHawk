-- Fix RLS policies for scraping tables
-- This allows authenticated users to read and insert data for testing

-- 1. product_snapshots
ALTER TABLE product_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for snapshots" ON product_snapshots;
CREATE POLICY "Public read access for snapshots" ON product_snapshots
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated inserts for snapshots" ON product_snapshots;
CREATE POLICY "Allow authenticated inserts for snapshots" ON product_snapshots
  FOR INSERT WITH CHECK (true);

-- 2. trending_products
ALTER TABLE trending_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for trending" ON trending_products;
CREATE POLICY "Public read access for trending" ON trending_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated inserts for trending" ON trending_products;
CREATE POLICY "Allow authenticated inserts for trending" ON trending_products
  FOR INSERT WITH CHECK (true);

-- 3. ensure table handles product_url as unique for upsert if possible
-- Actually, the user should run this in Supabase
