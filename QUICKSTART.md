# TrendHawk Setup - Quick Start

## ✅ Database Setup Complete!

Your Supabase tables are ready:
- `search_jobs` - Tracks search requests
- `products` - Stores scraped products
- RLS policies enabled
- Caching function created

---

## Next: Add Service Role Key

1. **Get your Service Role Key**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (NOT the anon key!)

2. **Add to `.env.local`**:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Restart your dev server**:
   ```bash
   npm run dev
   ```

---

## Test the Scraper

Once you've added the service key, test the search:

1. Go to http://localhost:3000/dashboard
2. Search for "laptop" or "wireless earbuds"
3. Wait ~20 seconds for results
4. Second search for same keyword = instant! (cached)

---

## Troubleshooting

**"Missing SUPABASE_SERVICE_ROLE_KEY" error**:
- Make sure you added it to `.env.local`
- Restart the dev server

**Scraper not working**:
- Check browser console for errors
- Make sure Playwright is installed: `npx playwright install chromium`

**No products found**:
- Amazon might be blocking
- Try a different keyword
- Check server logs in terminal

---

## What's Next?

The system is ready! You can now:
- ✅ Search for products
- ✅ View results with competition badges
- ✅ Calculate profits
- ✅ Find suppliers on AliExpress
- ✅ Benefit from 48-hour caching

Enjoy your product research tool! 🚀
