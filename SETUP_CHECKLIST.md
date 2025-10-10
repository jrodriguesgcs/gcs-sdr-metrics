# GCS SDR Metrics - Setup Checklist

Use this checklist to ensure everything is properly configured.

## ☐ Pre-Setup

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] VS Code installed
- [ ] GitHub account created
- [ ] Vercel account created
- [ ] ActiveCampaign API credentials ready

---

## ☐ ActiveCampaign Configuration

### Get Your Credentials:
- [ ] Login to ActiveCampaign
- [ ] Go to Settings → Developer
- [ ] Copy your API URL (format: `https://ACCOUNT.api-us1.com`)
- [ ] Copy your API Key
- [ ] Test API access works

### Verify Custom Fields:
Navigate to Settings → Manage Fields → Deals and verify these field IDs:

- [ ] **SDR Agent** - ID: 74
- [ ] **DISTRIBUTION Time** - ID: 15
- [ ] **Lost Date Time** - ID: 89
- [ ] **Partner** - ID: 20
- [ ] **MQL Lost Reason** - ID: 55
- [ ] **Primary Country of Interest** - ID: 53
- [ ] **Primary Program of Interest** - ID: 52
- [ ] **CALENDLY Event Created at** - ID: 75
- [ ] **Send to Automation** - ID: 54

**If IDs don't match:** Update them in `src/services/api.ts` (line ~95)

---

## ☐ Local Setup (VS Code)

- [ ] Create project folder: `gcs-sdr-metrics`
- [ ] Open in VS Code
- [ ] Copy all artifact files into correct locations
- [ ] Create `.env` file with credentials
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test login at `http://localhost:3000`
- [ ] Verify dashboard loads (may show API errors - that's OK)

---

## ☐ GitHub Setup

- [ ] Initialize git: `git init`
- [ ] Add files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repository (private recommended)
- [ ] Add remote: `git remote add origin [URL]`
- [ ] Push: `git push -u origin main`
- [ ] Verify files on GitHub

---

## ☐ Vercel Deployment

### Initial Deploy:
- [ ] Login to Vercel
- [ ] Import GitHub repository
- [ ] Configure project (Framework: Vite)
- [ ] First deployment (will fail - expected)

### Environment Variables:
Add these in Vercel Settings → Environment Variables:

- [ ] `AC_API_URL` = `https://ACCOUNT.api-us1.com`
- [ ] `AC_API_TOKEN` = `your_api_token_here`
- [ ] `APP_PASSWORD` = `gcs2024` (or custom)

Apply to: **All environments** (Production, Preview, Development)

### Redeploy:
- [ ] Go to Deployments tab
- [ ] Click ⋯ on failed deployment
- [ ] Click "Redeploy"
- [ ] Wait for success (1-2 minutes)
- [ ] Click "Visit" to access live app

---

## ☐ Testing (Production)

### Authentication:
- [ ] App loads without errors
- [ ] Login page appears
- [ ] Can login with correct password
- [ ] Wrong password shows error

### Tab 1 - Distribution:
- [ ] Both SDR tables show (Ana Pascoal & Ruffa Espejon)
- [ ] Deal owners listed
- [ ] Countries show under each owner
- [ ] Can expand/collapse countries (▶ / ▼)
- [ ] Programs show when expanded
- [ ] Counts are accurate
- [ ] Percentages calculate correctly
- [ ] "Bookings Before Distribution" section shows
- [ ] "Sent to Partner" section shows
- [ ] All three partner types show data

### Tab 2 - Automation:
- [ ] Both SDR tables show
- [ ] All 9 automation metrics show:
  - No Interest Automation
  - Portugal D7 Consultation
  - Portugal Tax Consultation
  - Portugal Legal Consultation
  - Service Not Available
  - Lost - Future Opportunity
  - Unresponsive / Unqualified
  - Tag to Delete
  - Ineligible
- [ ] Counts are accurate
- [ ] Percentages calculate correctly
- [ ] Total row calculates correctly

### Date Filters:
- [ ] "Today" button works
- [ ] "Yesterday" button works (when data loaded)
- [ ] Date display updates correctly
- [ ] Metrics update when switching dates
- [ ] "Yesterday loading in background" message shows
- [ ] Yesterday button enables after background load

### Loading & Performance:
- [ ] Loading overlay shows during data fetch
- [ ] Progress bar animates
- [ ] Phase indicators show (1-4)
- [ ] Percentage updates
- [ ] Data loads in reasonable time (~15s for 300 deals)
- [ ] Refresh button works
- [ ] No console errors

---

## ☐ Data Validation

### Test Data Scenarios:

**Scenario 1: New Deal Distributed Today**
- [ ] Create test deal in ActiveCampaign
- [ ] Set SDR Agent to "Ana Pascoal"
- [ ] Set DISTRIBUTION Time to today
- [ ] Set Primary Country & Program
- [ ] Refresh dashboard
- [ ] Verify deal appears in Ana's table

**Scenario 2: Deal Sent to Partner**
- [ ] Set Partner field to "AT Legal - Greece"
- [ ] Refresh dashboard
- [ ] Verify count increases in Partner section

**Scenario 3: Automation Flow**
- [ ] Set "Send to Automation" to "Interest not Identified"
- [ ] Refresh dashboard
- [ ] Verify count increases in Tab 2

**Scenario 4: Lost Deal**
- [ ] Set "Lost Date Time" to today
- [ ] Set "MQL Lost Reason" to "Service not Available"
- [ ] Refresh dashboard
- [ ] Verify count increases in Tab 2

---

## ☐ Security Check

- [ ] `.env` file NOT in GitHub
- [ ] API credentials secure in Vercel only
- [ ] Changed default password from `gcs2024`
- [ ] Password stored securely (not in code for production)
- [ ] Only authorized users have access

---

## ☐ Documentation

- [ ] README.md reviewed
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] Team trained on using dashboard
- [ ] Custom field IDs documented
- [ ] Update schedule established

---

## ☐ Maintenance Setup

- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error alerts
- [ ] Schedule regular data audits
- [ ] Plan for scaling (if needed)
- [ ] Document any customizations

---

## ☐ Optional Enhancements

- [ ] Add custom domain
- [ ] Enable Vercel Authentication
- [ ] Set up staging environment
- [ ] Add data export feature
- [ ] Implement caching
- [ ] Add more date range options
- [ ] Create mobile-responsive improvements

---

## Troubleshooting Reference

| Issue | Check | Solution |
|-------|-------|----------|
| No data shows | API credentials | Verify in Vercel env vars |
| CORS errors | Proxy function | Check `/api/proxy` deployed |
| Wrong counts | Field IDs | Verify IDs in ActiveCampaign |
| Slow loading | Rate limits | Adjust workers/rate in api.ts |
| Login fails | Password | Check App.tsx or env var |

---

## Success Criteria

✅ **You're done when:**
1. Dashboard loads without errors
2. Both tabs show accurate data
3. Date filtering works correctly
4. All metrics calculate properly
5. Team can access and use it
6. Data refreshes when expected

---

## Next Actions

After completing this checklist:
1. Share Vercel URL with team
2. Conduct training session
3. Gather feedback
4. Plan improvements
5. Set regular review schedule

---

**Need Help?**
- Check DEPLOYMENT_GUIDE.md for detailed instructions
- Review browser console for error messages
- Check Vercel logs for server-side issues
- Verify ActiveCampaign API status

---

**Last Updated:** October 2025
**Version:** 1.0