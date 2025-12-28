-- TrendHawk Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- 1. ENABLE ROW LEVEL SECURITY (RLS)
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 2. CREATE THE 'PRODUCTS' TABLE (Saved Products + Trending)
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  price text,
  image_url text,
  product_url text,
  platform text,
  
  -- Analysis Data
  demand_score integer default 0,
  competition_level text default 'Medium',
  profit_margin text default '0%',
  
  -- Profit Calculator Fields
  cost_price numeric,
  selling_price numeric,
  break_even_roas numeric,
  net_profit numeric,
  
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CREATE THE 'USER_PROFILES' TABLE (Plan Management)
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

-- 4. CREATE THE 'INFLUENCERS' TABLE (CRM)
create table if not exists influencers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  platform text check (platform in ('TikTok', 'Instagram', 'YouTube')),
  profile_link text,
  status text check (status in ('To Contact', 'Contacted', 'Negotiating', 'Posted')) default 'To Contact',
  follower_count integer,
  avg_likes integer,
  engagement_rate numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ENABLE SECURITY POLICIES
alter table products enable row level security;
alter table user_profiles enable row level security;
alter table influencers enable row level security;

-- Products policies
create policy "Users can see their own products or public ones" on products
  for select using (auth.uid() = user_id or is_public = true);

create policy "Users can insert their own products" on products
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own products" on products
  for update using (auth.uid() = user_id);

create policy "Users can delete their own products" on products
  for delete using (auth.uid() = user_id);

-- User profiles policies
create policy "Users can view their own profile" on user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on user_profiles
  for update using (auth.uid() = user_id);

create policy "Users can insert their own profile" on user_profiles
  for insert with check (auth.uid() = user_id);

-- Influencers policies
create policy "Users can manage their own influencers" on influencers
  for all using (auth.uid() = user_id);

-- 6. CREATE FUNCTION TO AUTO-CREATE USER PROFILE
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, plan)
  values (new.id, 'free');
  return new;
end;
$$ language plpgsql security definer;

-- 7. CREATE TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
