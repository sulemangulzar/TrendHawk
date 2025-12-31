-- =====================================================
-- RLS Policies for TrendHawk
-- Run this AFTER running supabase-complete-schema.sql
-- =====================================================

-- Products table policies
create policy "Users can view own products"
  on products for select
  using (auth.uid() = user_id);

create policy "Users can insert own products"
  on products for insert
  with check (auth.uid() = user_id);

create policy "Users can update own products"
  on products for update
  using (auth.uid() = user_id);

create policy "Users can delete own products"
  on products for delete
  using (auth.uid() = user_id);

-- User profiles policies
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = user_id);

-- User decisions policies
create policy "Users can view own decisions"
  on user_decisions for select
  using (auth.uid() = user_id);

create policy "Users can insert own decisions"
  on user_decisions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own decisions"
  on user_decisions for update
  using (auth.uid() = user_id);

create policy "Users can delete own decisions"
  on user_decisions for delete
  using (auth.uid() = user_id);
