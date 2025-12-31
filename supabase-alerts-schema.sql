-- Product Alerts System - Database Schema
-- Add this to your Supabase SQL Editor

-- 1. CREATE PRODUCT_ALERTS TABLE
create table if not exists product_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  
  -- Alert Configuration
  keyword text not null,
  platform text check (platform in ('amazon', 'ebay', 'any')) default 'any',
  
  -- Alert Criteria
  max_price numeric,
  min_reviews integer,
  max_reviews integer,
  min_rating numeric,
  
  -- Alert Settings
  is_active boolean default true,
  notification_email boolean default true,
  notification_app boolean default true,
  
  -- Metadata
  last_checked_at timestamp with time zone,
  last_triggered_at timestamp with time zone,
  trigger_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CREATE ALERT_NOTIFICATIONS TABLE (for in-app notifications)
create table if not exists alert_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  alert_id uuid references product_alerts on delete cascade,
  product_id uuid references products,
  
  -- Notification Details
  title text not null,
  message text not null,
  is_read boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ENABLE ROW LEVEL SECURITY
alter table product_alerts enable row level security;
alter table alert_notifications enable row level security;

-- 4. CREATE RLS POLICIES FOR ALERTS
create policy "Users can view their own alerts" on product_alerts
  for select using (auth.uid() = user_id);

create policy "Users can create their own alerts" on product_alerts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own alerts" on product_alerts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own alerts" on product_alerts
  for delete using (auth.uid() = user_id);

-- 5. CREATE RLS POLICIES FOR NOTIFICATIONS
create policy "Users can view their own notifications" on alert_notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on alert_notifications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own notifications" on alert_notifications
  for delete using (auth.uid() = user_id);

-- 6. CREATE FUNCTION TO CHECK ALERTS
create or replace function check_product_alerts()
returns void as $$
declare
  alert_record record;
  product_record record;
  notification_title text;
  notification_message text;
begin
  -- Loop through all active alerts
  for alert_record in 
    select * from product_alerts 
    where is_active = true
  loop
    -- Find matching products created in last 24 hours
    for product_record in
      select * from products
      where keyword = alert_record.keyword
      and created_at > now() - interval '24 hours'
      and (alert_record.platform = 'any' or source = alert_record.platform)
      and (alert_record.max_price is null or price <= alert_record.max_price)
      and (alert_record.min_reviews is null or review_count >= alert_record.min_reviews)
      and (alert_record.max_reviews is null or review_count <= alert_record.max_reviews)
      and (alert_record.min_rating is null or rating >= alert_record.min_rating)
    loop
      -- Create notification
      notification_title := 'New Product Alert: ' || alert_record.keyword;
      notification_message := 'Found: ' || product_record.title || ' - $' || product_record.price;
      
      insert into alert_notifications (user_id, alert_id, product_id, title, message)
      values (alert_record.user_id, alert_record.id, product_record.id, notification_title, notification_message);
      
      -- Update alert stats
      update product_alerts
      set last_triggered_at = now(),
          trigger_count = trigger_count + 1
      where id = alert_record.id;
    end loop;
    
    -- Update last checked time
    update product_alerts
    set last_checked_at = now()
    where id = alert_record.id;
  end loop;
end;
$$ language plpgsql security definer;

-- 7. CREATE INDEX FOR PERFORMANCE
create index if not exists idx_product_alerts_user_id on product_alerts(user_id);
create index if not exists idx_product_alerts_keyword on product_alerts(keyword);
create index if not exists idx_alert_notifications_user_id on alert_notifications(user_id);
create index if not exists idx_alert_notifications_is_read on alert_notifications(is_read);
