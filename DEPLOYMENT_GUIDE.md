# Complete Deployment Guide: VS Code → GitHub → Vercel

## Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub account
- Vercel account (free tier works)
- ActiveCampaign API credentials

---

## Part 1: Setup in VS Code

### Step 1: Create Project Structure

Open VS Code and create a new folder called `gcs-sdr-metrics`:

```bash
mkdir gcs-sdr-metrics
cd gcs-sdr-metrics
code .
```

### Step 2: Initialize Project

In the VS Code terminal:

```bash
npm init -y
```

### Step 3: Create All Files

Create the following folder structure:

```
gcs-sdr-metrics/
├── api/
│   ├── proxy.ts
│   └── package.json
├── src/
│   ├── components/
│   │   ├── Login.tsx
│   │   ├── LoadingProgress.tsx
│   │   ├── Tab1Distribution.tsx
│   │   └── Tab2Automation.tsx
│   ├── services/
│   │   └── api.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   └── metricsUtils.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vercel.json
└── README.md
```

Copy each file content from the artifacts I provided above into the corresponding files.

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Configure Environment Variables

Create `.env` file:

```env
AC_API_URL=https://youraccountname.api-us1.com
AC_API_TOKEN=your_actual_api_token_here
APP_PASSWORD=gcs2024
```

**IMPORTANT:** Replace with your actual ActiveCampaign credentials!

### Step 6: Test Locally

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- Login page appears
- Can login with password
- Dashboard loads (may show errors if API not configured)

---

## Part 2: Push to GitHub

### Step 1: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: GCS SDR Metrics Dashboard"
```

### Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New repository"**
3. Name it: `gcs-sdr-metrics`
4. Set to **Private** (recommended)
5. Don't initialize with README (we have one)
6. Click **"Create repository"**

### Step 3: Push to GitHub

Copy the commands from GitHub (should look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/gcs-sdr-metrics.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 4: Verify

Refresh your GitHub repository page and verify all files are there.

---

## Part 3: Deploy to Vercel

### Step 1: Sign Up/Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or login (use GitHub account for easier integration)

### Step 2: Import Project

1. Click **"Add New Project"**
2. Click **"Import Git Repository"**
3. Select your `gcs-sdr-metrics` repository
4. Click **"Import"**

### Step 3: Configure Project

**Framework Preset:** Vite
**Root Directory:** `./`
**Build Command:** `npm run build`
**Output Directory:** `dist`

Click **"Deploy"** (it will fail first - that's okay!)

### Step 4: Add Environment Variables

1. Go to your project dashboard
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add these three variables (for Production, Preview, and Development):

| Key | Value |
|-----|-------|
| `AC_API_URL` | `https://youraccountname.api-us1.com` |
| `AC_API_TOKEN` | `your_actual_api_token` |
| `APP_PASSWORD` | `gcs2024` |

Click **"Save"** for each.

### Step 5: Redeploy

1. Go to **"Deployments"** tab
2. Click the three dots (⋯) on the failed deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes

### Step 6: Access Your App

1. Once deployed, click **"Visit"**
2. Your app should be live at: `https://gcs-sdr-metrics.vercel.app` (or similar)
3. Test the login and dashboard

---

## Part 4: Verify Everything Works

### Checklist:

- [ ] Login page loads
- [ ] Can login with password
- [ ] Today's data loads with progress indicator
- [ ] Distribution tab shows tables for both SDR agents
- [ ] Can expand/collapse countries
- [ ] Bookings before distribution section shows
- [ ] Partner section shows
- [ ] Automation tab loads with all metrics
- [ ] Can switch between Today/Yesterday
- [ ] Yesterday data loads in background
- [ ] Refresh button works
- [ ] All percentages calculate correctly

---

## Part 5: Common Issues & Solutions

### Issue 1: API Connection Fails

**Error:** "Failed to fetch from ActiveCampaign"

**Solution:**
1. Verify `AC_API_URL` format: `https://accountname.api-us1.com` (no trailing slash)
2. Check API token is correct
3. Verify API token has permissions to read deals and custom fields
4. Check Vercel environment variables are set for all environments

### Issue 2: CORS Errors

**Error:** "CORS policy blocked"

**Solution:**
- The proxy should handle this automatically
- Make sure `api/proxy.ts` is deployed (check Vercel Functions tab)
- Verify the proxy endpoint works: `https://your-app.vercel.app/api/proxy?endpoint=/api/3/deals`

### Issue 3: Rate Limiting

**Error:** Too many requests

**Solution:**
- Adjust `RATE_LIMIT` in `src/services/api.ts`
- Reduce `WORKER_COUNT` if needed
- Check your ActiveCampaign plan's rate limits

### Issue 4: No Data Shows

**Error:** Tables are empty

**Solution:**
1. Check if deals have the required custom fields populated
2. Verify SDR Agent names match exactly: "Ana Pascoal" and "Ruffa Espejon"
3. Check date filters - make sure there's data for today/yesterday
4. Open browser console (F12) to see error messages

### Issue 5: Password Not Working

**Solution:**
- Default password is `gcs2024`
- Change in `src/App.tsx` line 11
- Redeploy to Vercel after changing

---

## Part 6: Making Updates

### Update Code:

```bash
# Make changes in VS Code
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically redeploy!

### Update Environment Variables:

1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Edit the variable
4. Redeploy from Deployments tab

---

## Part 7: Custom Domain (Optional)

### Add Your Own Domain:

1. In Vercel dashboard, go to **"Settings"** → **"Domains"**
2. Add your domain (e.g., `metrics.globalcitizensolutions.com`)
3. Follow Vercel's DNS instructions
4. Update DNS at your domain registrar
5. Wait for SSL certificate (automatic)

---

## Support Contacts

**ActiveCampaign API Docs:** https://developers.activecampaign.com/
**Vercel Docs:** https://vercel.com/docs
**React + Vite Docs:** https://vitejs.dev/

---

## Security Notes

1. **Never commit `.env` file** - it's in `.gitignore`
2. Keep your API token secret
3. Change the default password
4. Consider adding IP restrictions in Vercel
5. Enable Vercel Authentication for extra security (Team plan)

---

## Performance Tips

1. **Caching:** Consider implementing caching for deal data (reduce API calls)
2. **Pagination:** Currently loads all deals - consider pagination for very large datasets
3. **Incremental Loading:** Load most recent deals first
4. **Service Worker:** Add for offline capability

---

## Next Steps

1. ✅ Deploy to production
2. ✅ Test all features
3. 🔄 Monitor performance
4. 📊 Gather user feedback
5. 🚀 Iterate and improve

---

**Congratulations! Your dashboard is now live!** 🎉