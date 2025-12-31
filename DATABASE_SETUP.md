# 🚀 Database Setup - FIXED VERSION

## ⚠️ Run This SQL File

**File to use:** `supabase-complete-schema.sql`

This is the **COMPLETE** schema that creates everything you need.

---

## 📝 Steps:

### 1. Open Supabase
- Go to https://supabase.com/dashboard
- Select your TrendHawk project
- Click **"SQL Editor"** → **"New Query"**

### 2. Copy & Run
1. Open `supabase-complete-schema.sql`
2. Copy **ALL** the contents (entire file)
3. Paste into SQL Editor
4. Click **"Run"** (or `Ctrl+Enter`)

### 3. Success!
You should see: ✅ **"Success. No rows returned"**

---

## ✅ What This Creates:

**Tables:**
- `products` (with all verdict columns)
- `user_profiles` (plan management)
- `user_decisions` (test candidates)

**Functions:**
- `get_decision_summary()` - Dashboard stats
- `get_market_snapshot()` - Market data
- `handle_new_user()` - Auto-create profiles

**Security:**
- Row Level Security (RLS) policies
- User-specific data access

---

## 🎯 After Running:

1. Refresh your browser
2. Go to `/dashboard/analyze`
3. Enter a product name (e.g., "wireless earbuds")
4. Click "Analyze Product"
5. ✅ Should work without errors!

---

## ❓ If You Get Errors:

**"relation already exists"** → That's OK! It means the table was already created.

**"column already exists"** → That's OK! The SQL uses `if not exists`.

**Any other error** → Copy the error message and let me know!
