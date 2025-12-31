-- =====================================================
-- FIX: Repair User Decisions Table
-- Run this in Supabase SQL Editor to enable winner/failure tracking
-- =====================================================

-- 1. Add decision_status column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_decisions' AND column_name='decision_status') THEN
        ALTER TABLE user_decisions ADD COLUMN decision_status TEXT;
    END IF;
END $$;

-- 2. Update existing entries to have a default status if needed
UPDATE user_decisions SET decision_status = 'pending' WHERE decision_status IS NULL;

-- =====================================================
-- DONE!
-- =====================================================
