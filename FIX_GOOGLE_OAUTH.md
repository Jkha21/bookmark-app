# Fix: Enable Google OAuth in Supabase

## Quick Diagnosis
Error: `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

This means Google OAuth is not configured in your Supabase project.

## Solution

### Step 1: Get Your Supabase Project Details
Your project URL from `.env.local`:
```
https://fttynibcvlitqdxmpjxb.supabase.co
```

1. Go to https://app.supabase.com
2. Sign in with your account
3. Select the project: **fttynibcvlitqdxmpjxb**

### Step 2: Set Up Google OAuth Credentials

#### In Google Cloud Console:
1. Go to https://console.cloud.google.com
2. Create a new project or use existing one
3. Navigate to **APIs & Services** → **OAuth consent screen**
   - Select **External** user type
   - Fill in the required fields:
     - App name: "Smart Bookmarks"
     - User support email: (your email)
     - Developer contact: (your email)
   - Click **Save and Continue** through all screens

4. Go to **APIs & Services** → **Credentials**
5. Click **+ Create Credentials** → **OAuth client ID**
6. Choose **Web application**
7. Add these Authorized redirect URIs:
   ```
   https://fttynibcvlitqdxmpjxb.supabase.co/auth/v1/callback?provider=google
   https://localhost:3000/auth/callback
   ```
8. Click **Create**
9. Copy the **Client ID** and **Client Secret** (you'll need these next)

#### In Supabase:
1. Go to your project dashboard
2. Click **Authentication** (or **Auth** on the left sidebar)
3. Click **Providers**
4. Find **Google** and click it
5. Toggle **Enable Sign in with Google** to ON
6. Paste your Google OAuth credentials:
   - **Client ID**: (paste from Google Console)
   - **Client Secret**: (paste from Google Console)
7. Click **Save**

### Step 3: Set Up Realtime for Bookmarks

1. In Supabase, go to **Database** → **Replication**
2. Under **Publication** section, find the `bookmarks` table
3. Toggle it ON if it's not already
4. Make sure all events are enabled: ✓ INSERT, ✓ UPDATE, ✓ DELETE

### Step 4: Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and try signing in with Google.

## Still Getting an Error?

### If redirect URI mismatch:
- In Google Cloud Console, add more redirect URIs:
  ```
  https://fttynibcvlitqdxmpjxb.supabase.co/auth/v1/callback?provider=google
  https://localhost:3000/auth/callback
  https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback
  ```

### If "Invalid Client":
- Double-check Client ID and Secret are correct
- Make sure you're using the **Web application** credentials, not Android/iOS

### If still fails after 5 minutes:
- Wait a bit longer (OAuth credentials can take a moment to propagate)
- Clear browser cache
- Try incognito/private mode

## For Production (Vercel):

After deploying to Vercel:

1. Add your Vercel domain to Google OAuth redirect URIs:
   ```
   https://YOUR-DOMAIN.vercel.app/auth/callback
   ```

2. In Supabase > Authentication > URL Configuration:
   - Site URL: `https://YOUR-DOMAIN.vercel.app`
   - Add Redirect URLs: `https://YOUR-DOMAIN.vercel.app/auth/callback`

3. Add environment variables in Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://fttynibcvlitqdxmpjxb.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_v3T7_uNXzC56sLAPnDikjw_c67ZYixF
   ```

## Troubleshooting Checklist

- [ ] Google OAuth credentials are created in Google Cloud Console
- [ ] Client ID and Secret are pasted into Supabase
- [ ] Google provider is toggled ON in Supabase
- [ ] Redirect URIs include both localhost and production domains
- [ ] Supabase project URL and Anon Key are correct in `.env.local`
- [ ] Browser cache is cleared
- [ ] Not using incognito/private mode (if it works there but not normal mode)
