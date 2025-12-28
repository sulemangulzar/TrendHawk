# TrendHawk - Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings** → **API**
4. Copy these two values:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `anon public` key (the long string under "Project API keys")

### 2. Update Environment Variables

Open `.env.local` and add:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 3. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** (or press Ctrl+Enter)

This creates:
- ✅ `products` table (saved products)
- ✅ `user_profiles` table (plan management)
- ✅ `influencers` table (CRM)
- ✅ Row Level Security (RLS) policies
- ✅ Auto-profile creation trigger

### 4. Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Disable email confirmation for development:
   - Go to **Authentication** → **Settings**
   - Turn off "Enable email confirmations"

### 5. Run the App

```bash
npm run dev
```

Visit http://localhost:3000 and create an account!

## Architecture

**Before (Complex):**
```
Frontend → Next.js API Routes → Prisma → Supabase
```

**Now (Simple & Fast):**
```
Frontend → Supabase Client → Supabase Database
```

## Features

- ✅ Email/password authentication (Supabase Auth)
- ✅ User profiles with plan management
- ✅ Saved products with RLS
- ✅ Row-level security (users only see their own data)
- ✅ Auto-profile creation on signup
- ✅ Real-time subscriptions ready

## File Structure

```
frontend/
├── lib/
│   └── supabase.js          # Supabase client
├── context/
│   └── AuthContext.js       # Auth with Supabase
├── app/
│   ├── (auth)/
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   └── dashboard/           # Protected routes
└── supabase-schema.sql      # Database schema
```

## Next Steps

1. **Test Authentication**: Create an account and login
2. **Add Features**: Use the `supabase` client to query data
3. **Deploy**: Deploy to Vercel (auto-detects Supabase env vars)

## Example: Fetching Products

```javascript
import { supabase } from '@/lib/supabase'

// Get user's saved products
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .order('created_at', { ascending: false })

// Save a product
const { data, error } = await supabase
  .from('products')
  .insert({
    title: 'Product Name',
    price: '$29.99',
    image_url: 'https://...',
    // ... other fields
  })
```

## Troubleshooting

**Can't login?**
- Check that you ran the SQL schema
- Verify your Supabase URL and anon key are correct
- Check Supabase dashboard → Authentication → Users to see if account was created

**RLS errors?**
- Make sure you ran the entire `supabase-schema.sql` file
- Check that RLS policies are enabled in Supabase dashboard

**Need help?**
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
