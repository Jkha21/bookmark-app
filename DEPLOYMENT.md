# Deployment Guide - Smart Bookmark App

This guide will walk you through deploying the Smart Bookmark App to Vercel.

## Prerequisites Checklist
- ✅ Supabase project created and configured
- ✅ Google OAuth credentials set up
- ✅ Database schema with RLS policies created
- ✅ Real-time enabled for bookmarks table
- ✅ `.env.local` file with Supabase credentials
- ✅ GitHub account
- ✅ Vercel account

## Step 1: Prepare Your Repository

### Initialize Git (if not already done):
```bash
cd smart-bookmark-app
git init
```

### Add all files:
```bash
git add .
```

### Create initial commit:
```bash
git commit -m "Initial commit: Smart Bookmark App with Next.js, Supabase, and Tailwind CSS"
```

### Rename branch to main:
```bash
git branch -M main
```

## Step 2: Push to GitHub

### Create a new repository on GitHub:
1. Go to [github.com/new](https://github.com/new)
2. Name it `smart-bookmark-app`
3. **IMPORTANT**: Do NOT initialize with README, .gitignore, or license (they conflict with local repo)
4. Click "Create repository"

### Connect local repo to GitHub:
Replace `YOUR_GITHUB_USERNAME` with your actual username:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/smart-bookmark-app.git
git push -u origin main
```

## Step 3: Deploy to Vercel

### 1. Sign in to Vercel:
- Go to [vercel.com](https://vercel.com)
- Sign in with your GitHub account

### 2. Import Project:
- Click "Add New..." or "New Project"
- Select your GitHub account
- Find and click `smart-bookmark-app` repository
- Click "Import"

### 3. Configure Environment Variables:
Before deploying, add your environment variables:

- Under "Environment Variables", add:
  - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
    **Value**: `https://YOUR_PROJECT_ID.supabase.co`
  - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    **Value**: `Your anon public key from Supabase`

### 4. Deploy:
- Click "Deploy"
- Wait for deployment to complete (usually 1-2 minutes)
- You'll see a URL like: `https://smart-bookmark-app-xxxxx.vercel.app`

## Step 4: Update OAuth Configuration

### In Google Cloud Console:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth client ID
4. Click on it to edit
5. Add your Vercel domain to **Authorized redirect URIs**:
   - `https://YOUR_VERCEL_DOMAIN/auth/callback`

**Example**: If your Vercel URL is `https://smart-bookmark-app-xyz123.vercel.app`, add:
   - `https://smart-bookmark-app-xyz123.vercel.app/auth/callback`

6. Click "Save"

### In Supabase:

Your Google OAuth provider should already be configured with the callback URL pattern. You can verify it's working by:

1. Going to your Supabase project
2. **Authentication** > **Providers** > **Google**
3. Checking the configuration is still correct

If you need to update it, the format should be:
```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback?provider=google
```

## Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://YOUR_VERCEL_DOMAIN/`
2. Click "Sign in with Google"
3. You should be redirected to Google login
4. After logging in, you should see the bookmark manager
5. Try adding a bookmark - it should work!
6. Open the app in an **incognito tab** to test:
   - Log in with a different account
   - Verify you can only see your own bookmarks (not the first user's)
   - Add a bookmark and verify it appears immediately (real-time)

## Step 6: Set Up a Custom Domain (Optional)

If you want a custom domain like `bookmarks.yourdomain.com`:

### In Vercel:
1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions for your domain provider

### Update OAuth:
Add your custom domain to Google Cloud Console's redirect URIs and Supabase if needed.

## Common Deployment Issues

### "Unauthorized" or "RLS violation" errors
- **Cause**: RLS policies not set up correctly
- **Fix**: Verify all four RLS policies are created in Supabase
- **Location**: Supabase > Authentication > Policies

### Sign-in doesn't work
- **Cause**: Redirect URI mismatch
- **Fix**: Ensure Google Cloud Console redirect URI exactly matches your Vercel URL + `/auth/callback`
- **Check**: `https://YOUR_VERCEL_DOMAIN/auth/callback`

### Bookmarks not loading
- **Cause**: Environment variables not set in Vercel
- **Fix**: Double-check environment variables in Vercel project settings
- **Command**: You can also update them in the deployment settings

### Real-time updates not working
- **Cause**: Real-time not enabled for bookmarks table
- **Fix**: Go to Supabase > Database > Replication and ensure bookmarks table is toggled ON
- **Check**: Make sure INSERT, UPDATE, DELETE are all checked

### "NEXT_PUBLIC_SUPABASE_URL is not set"
- **Cause**: Environment variables missing
- **Fix**: Add them to Vercel project settings
- **Remember**: These are PUBLIC variables (NEXT_PUBLIC_ prefix) so they're visible to browser

## Monitoring & Maintenance

### Check Deployment Status:
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Click on your project
- View deployment history and logs

### View Application Logs:
- In Vercel project, go to "Runtime Logs" tab
- Filter by different log levels (Error, Warning, Info)

### Monitor Supabase:
- Go to [app.supabase.com](https://app.supabase.com)
- View database analytics and realtime activity

## Continuous Deployment

Every time you push to the `main` branch on GitHub, Vercel will automatically:
1. Detect the new commit
2. Run the build
3. Deploy the changes

### To update your app:
```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push origin main
# Vercel automatically deploys!
```

## Next Steps

Once deployed, you can:
- Share the link with others to use your bookmark manager
- Add more features (tags, folders, search, sharing, etc.)
- Monitor usage and performance
- Collect feedback and iterate

## Support Resources

- **Next.js Docs**: [nextjs.org](https://nextjs.org)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)

---

**Deployed! 🎉** Your bookmark manager is now live on Vercel with real-time synchronization!
