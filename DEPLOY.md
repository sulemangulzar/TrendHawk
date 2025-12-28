# Deploy TrendHawk to Vercel

## Prerequisites
✅ Supabase project set up with tables created
✅ Environment variables ready
✅ Code pushed to GitHub

## Step 1: Push to GitHub

```bash
cd c:/Users/Suleman/Documents/TrendHawk/TrendHawk_App/frontend

# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/trendhawk.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add these:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```
6. Click **"Deploy"**
7. Wait 2-3 minutes ⏳
8. Done! 🎉

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

## Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed

## Environment Variables Needed

Make sure these are set in Vercel:

| Variable | Where to Get It |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |

## Post-Deployment Checklist

- [ ] Visit your deployed URL
- [ ] Test signup/login
- [ ] Check that Supabase connection works
- [ ] Test all dashboard pages
- [ ] Verify no console errors

## Troubleshooting

**Build fails?**
- Check that all dependencies are in `package.json`
- Make sure there are no import errors

**Supabase not connecting?**
- Verify environment variables are set correctly in Vercel
- Check that Supabase URL doesn't have trailing slash

**Pages not loading?**
- Check browser console for errors
- Verify Supabase RLS policies are set up

## Update Deployment

Every time you push to GitHub main branch, Vercel will auto-deploy! 🚀

```bash
git add .
git commit -m "Update feature"
git push
```

## Vercel Dashboard

Your project dashboard: `https://vercel.com/dashboard`

Monitor:
- Deployments
- Analytics
- Logs
- Performance

---

**🎉 Your app is now live!**

Share your link: `https://your-project.vercel.app`
