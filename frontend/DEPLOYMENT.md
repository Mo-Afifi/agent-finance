# Deployment Guide

Deploy the Agent Finance Dashboard and integrate with the Lovable landing page.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts:
# - Project name: agent-finance-dashboard
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

**Result**: You'll get a URL like `https://agent-finance-dashboard.vercel.app`

### Option 2: Netlify (Free)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build first
cd frontend
npm run build

# Deploy
netlify deploy --dir=dist --prod

# Follow prompts to create a new site
```

**Result**: You'll get a URL like `https://agent-finance-dashboard.netlify.app`

### Option 3: Manual (Any Static Host)

1. Build the app:
```bash
cd frontend
npm run build
```

2. Upload the `dist/` folder to:
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - DigitalOcean Spaces
   - GitHub Pages
   - Any web server (nginx, Apache)

3. Configure server to serve `index.html` for all routes (for React Router)

**Nginx example:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Environment Variables

Before deploying, configure your backend API URL:

### Vercel
```bash
vercel env add VITE_API_URL
# Enter: https://your-backend-api.com
```

Or in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend-api.com`

### Netlify
```bash
netlify env:set VITE_API_URL https://your-backend-api.com
```

Or in Netlify dashboard:
- Go to Site Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend-api.com`

### Manual Deployment
Create a `.env.production` file:
```env
VITE_API_URL=https://your-backend-api.com
```

Then build:
```bash
npm run build
```

---

## Integrate with Lovable Landing Page

The landing page is at: https://smart-agent-cash.lovable.app

### Step 1: Deploy Dashboard
Deploy using one of the options above. You'll get a URL like:
- `https://agent-finance-dashboard.vercel.app`
- `https://your-custom-domain.com`

### Step 2: Update Landing Page CTAs

In the Lovable project, update the "Access Dashboard" / "Launch Dashboard" buttons to link to your deployed dashboard URL.

**Example button URLs to update:**
- "Access Dashboard" → `https://agent-finance-dashboard.vercel.app`
- "Launch Dashboard" → `https://agent-finance-dashboard.vercel.app`
- "Get Started" → `https://agent-finance-dashboard.vercel.app`

### Step 3: Test Integration
1. Visit https://smart-agent-cash.lovable.app
2. Click "Access Dashboard" or similar CTA
3. Should open your deployed dashboard
4. Click "About" in dashboard header
5. Should return to Lovable landing page

---

## Custom Domain (Optional)

### Vercel
```bash
vercel domains add dashboard.yourdomain.com
```

Then add DNS records:
- Type: CNAME
- Name: dashboard
- Value: cname.vercel-dns.com

### Netlify
In Netlify dashboard:
1. Go to Domain Settings
2. Add custom domain: `dashboard.yourdomain.com`
3. Follow DNS configuration instructions

### Result
Your dashboard will be at: `https://dashboard.yourdomain.com`

Update Lovable landing page to link to this custom domain.

---

## CORS Configuration

Your **backend API** must allow requests from your deployed frontend.

### Backend CORS Setup (Express example)
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',                          // Local dev
    'https://smart-agent-cash.lovable.app',           // Landing page
    'https://agent-finance-dashboard.vercel.app',     // Dashboard
    'https://dashboard.yourdomain.com'                // Custom domain (if used)
  ],
  credentials: true
}));
```

### Backend CORS Setup (FastAPI example)
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://smart-agent-cash.lovable.app",
        "https://agent-finance-dashboard.vercel.app",
        "https://dashboard.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## CI/CD (Auto-Deploy on Git Push)

### Vercel (Automatic)
1. Link your GitHub repo to Vercel
2. Every push to `main` auto-deploys
3. Preview deployments for PRs

### Netlify (Automatic)
1. Link your GitHub repo in Netlify
2. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. Every push to `main` auto-deploys

### GitHub Actions (Manual)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Dashboard

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install and build
        working-directory: frontend
        run: |
          npm install
          npm run build
      
      - name: Deploy to Vercel
        working-directory: frontend
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Monitoring & Analytics

### Add Google Analytics
In `frontend/index.html`, add before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Add Error Tracking (Sentry)
```bash
npm install @sentry/react
```

In `frontend/src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

---

## Health Checks

Add a health check endpoint to verify deployment:

Create `frontend/public/health.json`:
```json
{
  "status": "ok",
  "app": "agent-finance-dashboard",
  "version": "1.0.0"
}
```

Check after deployment:
```bash
curl https://your-dashboard-url.com/health.json
```

---

## Performance Optimization

### Enable Compression (Already Done)
Vite automatically generates gzipped assets.

### Add CDN (Optional)
Use Vercel Edge Network or CloudFlare CDN for faster global delivery.

### Preload Critical Assets
In `frontend/index.html`:
```html
<link rel="preconnect" href="https://your-backend-api.com">
<link rel="dns-prefetch" href="https://your-backend-api.com">
```

---

## Security Headers

### Vercel
Create `frontend/vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### Netlify
Create `frontend/netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## Rollback Plan

### Vercel
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback <deployment-url>
```

### Netlify
In Netlify dashboard:
1. Go to Deploys
2. Click on previous successful deploy
3. Click "Publish deploy"

### Git-Based Rollback
```bash
# Revert to previous commit
git revert HEAD
git push

# Auto-deploys previous version
```

---

## Troubleshooting Deployment

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Dashboard Loads But API Fails
- Check `VITE_API_URL` environment variable
- Verify backend CORS allows your domain
- Check browser console for errors

### Routing 404s (e.g., /dashboard)
- Ensure your host serves `index.html` for all routes
- For Vercel/Netlify, this is automatic
- For custom servers, configure rewrite rules

### Slow Load Times
- Check bundle size: `npm run build` and look at dist/assets
- Enable CDN
- Optimize images (use WebP, compress)
- Consider lazy loading routes

---

## Complete Deployment Checklist

- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured
- [ ] Backend CORS allows frontend domain
- [ ] Deploy to hosting (Vercel/Netlify/other)
- [ ] Test dashboard loads at deployed URL
- [ ] Test API calls work (check browser console)
- [ ] Test "About" link goes to Lovable landing page
- [ ] Update Lovable landing page CTAs to link to dashboard
- [ ] Test full user flow: Landing → Dashboard → Back to landing
- [ ] (Optional) Configure custom domain
- [ ] (Optional) Add analytics
- [ ] (Optional) Add error tracking
- [ ] (Optional) Set up CI/CD for auto-deploy

---

## Post-Deployment

### Share Links
- **Landing Page**: https://smart-agent-cash.lovable.app
- **Dashboard**: https://your-dashboard-url.com
- **Backend API**: https://your-backend-api.com

### Monitor
- Check Vercel/Netlify analytics for traffic
- Monitor backend API for errors
- Track user journeys (landing → dashboard → actions)

### Iterate
- Gather user feedback
- Add features based on usage
- Optimize performance based on metrics

---

🚀 **Ready to deploy!**
