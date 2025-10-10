# GCS SDR Metrics Dashboard

A performance tracking dashboard for SDR agents using ActiveCampaign API data.

## Features

- 🔒 Password-protected access
- 📊 Real-time metrics for SDR agents (Ana Pascoal & Ruffa Espejon)
- 🚀 20 parallel workers with rate limiting (5 req/sec)
- 📈 Two comprehensive reporting tabs:
  - Distribution & Partners metrics
  - Automation & Lost Reasons metrics
- 📅 Date filtering (Today/Yesterday)
- 🎨 GCS Brand styling
- ⚡ Background data loading for improved UX

## Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd gcs-sdr-metrics
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
AC_API_URL=https://youraccountname.api-us1.com
AC_API_TOKEN=your_api_token_here
APP_PASSWORD=your_secure_password_here
```

Replace:
- `youraccountname` with your ActiveCampaign account name
- `your_api_token_here` with your ActiveCampaign API token
- `your_secure_password_here` with your desired app password

### 4. Update App Password (Optional)

Edit `src/App.tsx` line 11 to change the default password:

```typescript
const APP_PASSWORD = 'your_custom_password';
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment to Vercel

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

Follow the prompts to deploy your project.

### 4. Add Environment Variables in Vercel

Go to your Vercel project dashboard:
1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:
   - `AC_API_URL`
   - `AC_API_TOKEN`
   - `APP_PASSWORD`

### 5. Redeploy

```bash
vercel --prod
```

## Project Structure

```
gcs-sdr-metrics/
├── api/
│   └── proxy.ts              # Vercel serverless function for CORS proxy
├── src/
│   ├── components/
│   │   ├── Login.tsx         # Password authentication
│   │   ├── LoadingProgress.tsx  # Loading indicator
│   │   ├── Tab1Distribution.tsx # Distribution metrics tab
│   │   └── Tab2Automation.tsx   # Automation metrics tab
│   ├── services/
│   │   └── api.ts            # ActiveCampaign API integration
│   ├── utils/
│   │   ├── dateUtils.ts      # Date filtering utilities
│   │   └── metricsUtils.ts   # Metrics calculation
│   ├── types.ts              # TypeScript type definitions
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles (GCS theme)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── vercel.json
```

## Key Features Explained

### Rate Limiting
- 5 requests per second maximum
- 20 parallel workers for efficient data fetching
- Automatic queue management

### Data Flow
1. **Phase 1**: Fetch custom field metadata (0.5s)
2. **Phase 2**: Fetch all deals paginated (2s)
3. **Phase 3**: Fetch custom field values for each deal (12s for 300 deals)
4. **Phase 4**: Merge data and calculate metrics (0.1s)

### Metrics Tracked

**Tab 1 - Distribution & Partners:**
- Deals distributed by Deal Owner, Country, and Program
- Bookings before distribution
- Partner assignments (AT Legal, MPC Legal, Rafaela Barbosa)

**Tab 2 - Automation & Lost Reasons:**
- Automation workflows (No Interest, Portugal consultations)
- Lost reasons (Service not available, Future opportunity, etc.)
- All metrics shown with percentages

## Customization

### Change Password
Edit `src/App.tsx` line 11

### Modify Field IDs
Edit `src/services/api.ts` in the `fetchAllDealsWithCustomFields` function

### Update Styling
Edit `src/index.css` and `tailwind.config.js`

## Troubleshooting

### API Connection Issues
- Verify `AC_API_URL` and `AC_API_TOKEN` are correct
- Check Vercel environment variables are set
- Ensure API token has proper permissions

### CORS Errors
- The proxy in `api/proxy.ts` handles CORS
- Make sure Vercel serverless functions are deployed

### Rate Limiting
- Default: 5 req/sec with 20 workers
- Adjust in `src/services/api.ts` if needed

## Support

For issues or questions, contact your development team.

## License

Private - Global Citizen Solutions