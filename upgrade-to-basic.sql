-- Manually upgrade user to Basic plan
-- Run this in Supabase SQL Editor to test the Basic plan features

-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users table

-- Update user metadata to Basic plan
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{subscription_plan}',
  '"basic"'
)
WHERE id = 'YOUR_USER_ID';

-- Verify the update
SELECT id, email, raw_user_meta_data->>'subscription_plan' as plan
FROM auth.users
WHERE id = 'YOUR_USER_ID';
