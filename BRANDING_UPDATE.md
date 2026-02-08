# Rebranding: Agent Finance → OpenClaw Pay

## Domain Structure

- **Main Site:** https://openclawpay.ai (Lovable landing page)
- **Dashboard:** https://dashboard.openclawpay.ai (Vercel)
- **API:** https://api.openclawpay.ai (Railway/Fly.io)

## Changes Made

### ✅ Dashboard
- Title: "Agent Finance Dashboard" → "OpenClaw Pay Dashboard"
- Header logo text updated
- Meta description updated
- Package.json name updated

### ✅ Documentation
- README.md updated with new domain
- ARCHITECTURE.md title updated
- All API docs updated (agentfinance.io → openclawpay.ai)
- NEXT_STEPS.md updated

### ✅ Environment
- API URL: http://localhost:3000 → https://api.openclawpay.ai

### ✅ Deployment
- Dashboard redeployed to Vercel with new branding
- Temporary URL: https://frontend-blush-nine-83.vercel.app

## Next Steps

### 1. Custom Domains (Vercel)
Add custom domain `dashboard.openclawpay.ai` to Vercel project:
- Go to: https://vercel.com/mos-projects-c7a0da8e/frontend/settings/domains
- Add domain: `dashboard.openclawpay.ai`
- Add DNS record:
  ```
  Type: CNAME
  Name: dashboard
  Value: cname.vercel-dns.com
  ```

### 2. Lovable Landing Page
- Configure `openclawpay.ai` as custom domain in Lovable
- Update landing page content with new branding
- Ensure "Access Dashboard" button points to `dashboard.openclawpay.ai`

### 3. Backend Deployment
- Deploy API to Railway/Fly.io
- Configure custom domain: `api.openclawpay.ai`
- Set environment variables (HIFI_API_KEY, etc.)

### 4. Update API Documentation
- Replace updated docs in Lovable landing page
- All URLs already changed to openclawpay.ai

---

**Status:** Dashboard rebranded and deploying. Waiting for custom domain configuration.
