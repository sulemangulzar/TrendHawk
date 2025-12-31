-- TrendHawk Decision Dashboard - Database Schema Updates
-- Run this in your Supabase SQL Editor AFTER the main schema

-- 1. ADD VERDICT SYSTEM COLUMNS TO PRODUCTS TABLE
alter table products add column if not exists verdict text check (verdict in ('test', 'careful', 'skip'));
alter table products add column if not exists risk_level text check (risk_level in ('low', 'medium', 'high'));
alter table products add column if not exists demand_level text check (demand_level in ('low', 'medium', 'high'));

-- 2. ADD ANALYSIS SCORES
alter table products add column if not exists saturation_score integer check (saturation_score >= 0 and saturation_score <= 100);
alter table products add column if not exists emotional_trigger_score integer check (emotional_trigger_score >= 0 and emotional_trigger_score <= 100);
alter table products add column if not exists confidence_score integer check (confidence_score >= 0 and confidence_score <= 100);

-- 3. ADD PROFIT SCENARIOS
alter table products add column if not exists profit_worst_case numeric;
alter table products add column if not exists profit_average_case numeric;
alter table products add column if not exists profit_best_case numeric;
alter table products add column if not exists estimated_cost numeric;
alter table products add column if not exists estimated_shipping numeric;

-- 4. ADD FAILURE ANALYSIS
alter table products add column if not exists common_complaints jsonb default '[]'::jsonb;
alter table products add column if not exists failure_reasons jsonb default '[]'::jsonb;
alter table products add column if not exists best_audience text;
alter table products add column if not exists avoid_audience text;

-- 5. ADD MONEY TRACKING
alter table products add column if not exists money_saved numeric default 0;
alter table products add column if not exists analyzed_at timestamp with time zone;

-- 6. CREATE USER_DECISIONS TABLE
create table if not exists user_decisions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references products on delete cascade,
  
  decision text check (decision in ('saved', 'skipped')) not null,
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ENABLE RLS ON USER_DECISIONS
alter table user_decisions enable row level security;

create policy "Users can view their own decisions" on user_decisions
  for select using (auth.uid() = user_id);

create policy "Users can create their own decisions" on user_decisions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own decisions" on user_decisions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own decisions" on user_decisions
  for delete using (auth.uid() = user_id);

-- 8. CREATE INDEXES FOR PERFORMANCE
create index if not exists idx_products_verdict on products(verdict);
create index if not exists idx_products_risk_level on products(risk_level);
create index if not exists idx_products_analyzed_at on products(analyzed_at);
create index if not exists idx_user_decisions_user_id on user_decisions(user_id);
create index if not exists idx_user_decisions_decision on user_decisions(decision);

-- 9. CREATE FUNCTION TO GET DECISION SUMMARY
create or replace function get_decision_summary(user_uuid uuid)
returns json as $$
declare
  safe_to_test integer;
  high_risk integer;
  skipped integer;
  money_saved numeric;
begin
  -- Count products by verdict
  select count(*) into safe_to_test
  from user_decisions ud
  join products p on ud.product_id = p.id
  where ud.user_id = user_uuid
  and ud.decision = 'saved'
  and p.verdict = 'test';
  
  select count(*) into high_risk
  from user_decisions ud
  join products p on ud.product_id = p.id
  where ud.user_id = user_uuid
  and ud.decision = 'saved'
  and p.risk_level = 'high';
  
  select count(*) into skipped
  from user_decisions ud
  where ud.user_id = user_uuid
  and ud.decision = 'skipped';
  
  -- Calculate money saved
  select coalesce(sum(p.money_saved), 0) into money_saved
  from user_decisions ud
  join products p on ud.product_id = p.id
  where ud.user_id = user_uuid
  and ud.decision = 'skipped';
  
  return json_build_object(
    'safe_to_test', safe_to_test,
    'high_risk', high_risk,
    'skipped', skipped,
    'money_saved', money_saved
  );
end;
$$ language plpgsql security definer;

-- 10. CREATE FUNCTION TO GET MARKET SNAPSHOT
create or replace function get_market_snapshot()
returns json as $$
declare
  trending_demand text;
  saturation_level text;
  beginner_friendly integer;
  avg_saturation numeric;
begin
  -- Calculate average saturation from recent products
  select avg(saturation_score) into avg_saturation
  from products
  where analyzed_at > now() - interval '7 days';
  
  -- Determine saturation level
  if avg_saturation > 70 then
    saturation_level := 'Rising';
  elsif avg_saturation > 40 then
    saturation_level := 'Stable';
  else
    saturation_level := 'Low';
  end if;
  
  -- Count beginner-friendly products (low risk, good profit)
  select count(*) into beginner_friendly
  from products
  where risk_level = 'low'
  and verdict = 'test'
  and analyzed_at > now() - interval '7 days';
  
  trending_demand := 'Stable';
  
  return json_build_object(
    'trending_demand', trending_demand,
    'saturation_level', saturation_level,
    'beginner_friendly', beginner_friendly
  );
end;
$$ language plpgsql security definer;

-- 11. ADD COMMENT FOR DOCUMENTATION
comment on table user_decisions is 'Tracks user decisions to save or skip products for test candidates';
comment on function get_decision_summary is 'Returns summary of user decisions for dashboard';
comment on function get_market_snapshot is 'Returns current market conditions snapshot';
