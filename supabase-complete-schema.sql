-- =====================================================
-- TrendHawk Database Schema - WORKING VERSION
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- =====================================================

-- CREATE TABLES
-- =====================================================

create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  price text,
  image_url text,
  product_url text,
  platform text,
  demand_score integer default 0,
  competition_level text default 'Medium',
  profit_margin text default '0%',
  cost_price numeric,
  selling_price numeric,
  break_even_roas numeric,
  net_profit numeric,
  review_count integer default 0,
  rating numeric,
  keyword text,
  source text,
  verdict text check (verdict in ('test', 'careful', 'skip')),
  risk_level text check (risk_level in ('low', 'medium', 'high')),
  demand_level text check (demand_level in ('low', 'medium', 'high')),
  saturation_score integer,
  emotional_trigger_score integer,
  confidence_score integer,
  profit_worst_case numeric,
  profit_average_case numeric,
  profit_best_case numeric,
  estimated_cost numeric,
  estimated_shipping numeric,
  common_complaints jsonb default '[]'::jsonb,
  failure_reasons jsonb default '[]'::jsonb,
  best_audience text,
  avoid_audience text,
  money_saved numeric default 0,
  analyzed_at timestamp with time zone,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  plan text check (plan in ('free', 'basic', 'pro')) default 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  daily_search_count integer default 0,
  last_search_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists user_decisions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references products on delete cascade,
  decision text check (decision in ('saved', 'skipped')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS
-- =====================================================

alter table products enable row level security;
alter table user_profiles enable row level security;
alter table user_decisions enable row level security;

-- CREATE INDEXES
-- =====================================================

create index if not exists idx_products_user_id on products(user_id);
create index if not exists idx_products_verdict on products(verdict);
create index if not exists idx_products_analyzed_at on products(analyzed_at);
create index if not exists idx_user_decisions_user_id on user_decisions(user_id);

-- CREATE FUNCTIONS
-- =====================================================

create or replace function get_decision_summary(user_uuid uuid)
returns json as $$
begin
  return json_build_object(
    'safe_to_test', 0,
    'high_risk', 0,
    'skipped', 0,
    'money_saved', 0
  );
end;
$$ language plpgsql security definer;

create or replace function get_market_snapshot()
returns json as $$
begin
  return json_build_object(
    'trending_demand', 'Stable',
    'saturation_level', 'Stable',
    'beginner_friendly', 0
  );
end;
$$ language plpgsql security definer;

-- =====================================================
-- DONE! Now go to Supabase Dashboard > Authentication > Policies
-- and manually add RLS policies through the UI
-- =====================================================
