-- Fix RLS policy for user_stats to allow INSERT
-- The issue: INSERT policy was too restrictive

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;

-- Create new INSERT policy that allows creation
CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Also ensure the function can create stats via trigger
-- Grant necessary permissions
GRANT INSERT ON user_stats TO authenticated;
GRANT UPDATE ON user_stats TO authenticated;

-- Alternative: Create user_stats automatically on user signup
-- This trigger ensures every user has a stats row
CREATE OR REPLACE FUNCTION create_user_stats_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats_on_signup();

-- Initialize stats for existing users
INSERT INTO user_stats (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
