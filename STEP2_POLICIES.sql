-- =====================================================
-- Step 2: CREATE POLICIES ONLY
-- Run this AFTER step 1 succeeds
-- =====================================================

CREATE POLICY "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own decisions" ON user_decisions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own decisions" ON user_decisions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decisions" ON user_decisions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decisions" ON user_decisions FOR DELETE USING (auth.uid() = user_id);
