# Vercel Environment Variables Update Guide

## Admin Dashboard (admin.openclawpay.ai)

**Project ID:** prj_fw1yqGqbOQJbt2rYtZq5Butu0pGd  
**Org ID:** team_oRmCgCP9MhzkBGOBelm6evDu  
**Project Name:** admin

### Required Environment Variables

```bash
VITE_API_URL=https://api.openclawpay.ai
VITE_ADMIN_PASSWORD=openclaw_admin_2026
```

### How to Update in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - URL: https://vercel.com/team_oRmCgCP9MhzkBGOBelm6evDu/admin/settings/environment-variables
   - Or: Vercel Dashboard > Projects > admin > Settings > Environment Variables

2. **Check Current Values:**
   - Look for `VITE_API_URL` - should be `https://api.openclawpay.ai`
   - Look for `VITE_ADMIN_PASSWORD` - should match what Mo set

3. **Update if Needed:**
   - If `VITE_API_URL` is missing or set to `http://localhost:3000`, update it
   - Click "Add New" or "Edit" next to the variable
   - Set the value to `https://api.openclawpay.ai`
   - Choose environments: Production, Preview, Development

4. **Redeploy:**
   - Go to: Vercel Dashboard > Projects > admin > Deployments
   - Find the latest deployment
   - Click the three dots (...) menu
   - Select "Redeploy"
   - Wait for deployment to complete (~1 minute)

5. **Verify:**
   - Visit https://admin.openclawpay.ai
   - You should see real user/agent counts (not zeros)

### Alternative: Update via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to project
cd /root/.openclaw/workspace/agent-finance/admin
vercel link

# Set environment variables
vercel env add VITE_API_URL production
# When prompted, enter: https://api.openclawpay.ai

vercel env add VITE_ADMIN_PASSWORD production
# When prompted, enter: openclaw_admin_2026

# Redeploy
vercel --prod
```

### Verify Environment Variables

After updating, you can verify by checking the build logs in Vercel:

1. Go to Deployments
2. Click on the latest deployment
3. Click "View Function Logs" or "View Build Logs"
4. Look for environment variable references

Or check the deployed app's Network tab:

1. Open https://admin.openclawpay.ai
2. Open browser DevTools (F12)
3. Go to Network tab
4. Look at API calls - they should go to `https://api.openclawpay.ai`, not `localhost:3000`

---

**Last Updated:** 2026-02-09 22:30 UTC
