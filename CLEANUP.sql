-- =====================================================
-- CLEANUP: Drop everything and start fresh
-- Run this FIRST to remove all existing tables/policies
-- =====================================================

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own decisions" ON user_decisions;
DROP POLICY IF EXISTS "Users can insert own decisions" ON user_decisions;
DROP POLICY IF EXISTS "Users can update own decisions" ON user_decisions;
DROP POLICY IF EXISTS "Users can delete own decisions" ON user_decisions;
DROP POLICY IF EXISTS "Users can view their own decisions" ON user_decisions;
DROP POLICY IF EXISTS "Users can create their own decisions" ON user_decisions;
DROP POLICY IF EXISTS "Users can update their own decisions" ON user_decisions;
DROP POLICY IF EXISTS "Users can delete their own decisions" ON user_decisions;

-- Drop tables
DROP TABLE IF EXISTS user_decisions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =====================================================
-- Now run STEP1_TABLES.sql
-- =====================================================
