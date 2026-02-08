# Dashboard Integration Fix - Deployment Guide

## ✅ What Was Fixed

### Issues Identified:
1. **Email field mismatch**: Backend required `email` field, frontend made it optional
2. **Type enum mismatch**: Frontend sends `'openclaw' | 'custom'`, backend expected `'individual' | 'business'`

### Changes Made:

#### Backend (`backend/src/api/routes.ts`):
```typescript
// BEFORE:
const RegisterAgentSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),  // REQUIRED
  type: z.enum(['individual', 'business']).default('individual'),
});

// AFTER:
const RegisterAgentSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),  // NOW OPTIONAL
  type: z.enum(['openclaw', 'custom', 'individual', 'business']).default('openclaw'),
  metadata: z.record(z.any()).optional(),
});
```

#### SDK (`backend/src/sdk/agent-finance.ts`):
- Updated `AgentIdentity` interface to make `email` optional
- Added type mapping: `openclaw/custom → individual`, `business → business`
- Set default email: `agent-{agentId}@openclawpay.ai` if not provided

## 🚀 Deployment Status

**Git commits pushed:**
- ✅ `f0321ac` - Fix dashboard integration: make email optional and align type enums
- ✅ `38ea1d3` - Trigger Railway deployment

**Railway Status:** Deployment may be queued or delayed.

## 🧪 How to Test

### Test via API (should work after deployment):
```bash
curl -X POST https://api.openclawpay.ai/agents \
  -H "Authorization: Bearer opay_ddd7647645d2d64d7cf6382782f8fd0c36fd8d21c22bc0a2413a4a68c98440d2" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-test-agent",
    "name": "My Test Agent",
    "type": "openclaw"
  }'
```

**Expected response:**
```json
{
  "id": "my-test-agent",
  "name": "My Test Agent",
  "type": "openclaw",
  "hifiUserId": "...",
  "wallets": [],
  "accounts": [],
  "verified": false,
  "createdAt": "2026-02-08T..."
}
```

### Test via Dashboard:
1. Go to https://dashboard.openclawpay.ai
2. Click "New Agent"
3. Fill in:
   - **Agent ID**: `test-dashboard-ui`
   - **Name**: `Dashboard UI Test`
   - **Type**: OpenClaw
   - **Email**: (leave blank or fill in)
4. Click "Create Agent"
5. Should succeed without 404 error

## 🔄 Manual Railway Deployment (if needed)

If the automatic deployment hasn't triggered after 5-10 minutes:

### Option 1: Railway Dashboard
1. Go to https://railway.app/dashboard
2. Find the `agent-finance` project
3. Click on the backend service
4. Click "Deploy" → "Redeploy"

### Option 2: Force rebuild via Git
```bash
cd /root/.openclaw/workspace/agent-finance
git commit --allow-empty -m "Force Railway rebuild"
git push origin main
```

### Option 3: Railway CLI (if installed)
```bash
railway up
```

## 📊 Verification Checklist

After deployment completes, verify:

- [ ] API endpoint `/agents` accepts requests without `email` field
- [ ] API endpoint `/agents` accepts `type: 'openclaw'`
- [ ] Dashboard "New Agent" button works
- [ ] Created agents appear in agents list
- [ ] No 404 errors in browser console
- [ ] No CORS errors in browser console

## 🐛 If Issues Persist

1. **Check Railway logs:**
   ```bash
   # In Railway dashboard, view deployment logs
   # Look for build errors or runtime errors
   ```

2. **Verify build succeeded:**
   ```bash
   # Check that TypeScript compilation passed
   # Look for "tsc" success message in logs
   ```

3. **Test the fix locally:**
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   # Test against localhost:3000
   ```

4. **Check environment variables:**
   - Ensure `CORS_ORIGIN` is set correctly (or `*`)
   - Verify `HIFI_API_KEY` is configured
   - Check `PORT` and `HOST` settings

## 📝 Files Changed

- `backend/src/api/routes.ts` - Updated RegisterAgentSchema
- `backend/src/sdk/agent-finance.ts` - Updated interfaces and type mapping

## 🎯 Next Steps

1. Wait for Railway deployment to complete (usually 2-5 minutes)
2. Test the API endpoint with curl
3. Test the dashboard UI
4. Verify agents are being created successfully
5. Check that agents list loads correctly

## ⚡ Quick Test Script

Save this as `test-dashboard-fix.sh`:

```bash
#!/bin/bash

API_KEY="opay_ddd7647645d2d64d7cf6382782f8fd0c36fd8d21c22bc0a2413a4a68c98440d2"
API_URL="https://api.openclawpay.ai"

echo "Testing agent creation with optional email..."
RESPONSE=$(curl -s -X POST $API_URL/agents \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-'$(date +%s)'",
    "name": "Test Agent",
    "type": "openclaw"
  }')

if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✅ SUCCESS! Agent created"
  echo "$RESPONSE" | jq .
else
  echo "❌ FAILED"
  echo "$RESPONSE"
fi
```

Run with:
```bash
chmod +x test-dashboard-fix.sh
./test-dashboard-fix.sh
```
