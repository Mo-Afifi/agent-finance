# Render Environment Variables Checklist

**Service:** agent-finance-backend  
**URL:** https://api.openclawpay.ai

## Required Environment Variables

Set these in Render Dashboard → Environment → Environment Variables:

### 🔴 Critical (Required for Health Check)
```
HIFI_API_KEY=zpka_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- **Source:** https://dashboard.hifibridge.com/developer/apiKeys
- **Format:** Must start with `zpka_`
- **Environment:** Use sandbox key for testing
- **Note:** This is the blocker - backend reports unhealthy if HIFI connection fails

### 🔧 API Server Configuration
```
PORT=10000
HOST=0.0.0.0
LOG_LEVEL=info
```
- **PORT:** Render assigns this automatically (usually 10000)
- **HOST:** Must be 0.0.0.0 for Render
- **LOG_LEVEL:** `info` for production, `debug` for troubleshooting

### 🌐 HIFI Configuration
```
HIFI_ENVIRONMENT=sandbox
HIFI_BASE_URL=https://sandbox.hifibridge.com
```
- **Environment:** `sandbox` for testing, `production` for live
- **Base URL:** Must match environment (sandbox or production URL)

### 🔐 CORS Configuration
```
CORS_ORIGIN=https://dashboard.openclawpay.ai,https://openclawpay.ai
```
- **Dashboard:** https://dashboard.openclawpay.ai
- **Landing:** https://openclawpay.ai
- **Format:** Comma-separated, no spaces
- **Alternative:** Use `*` for testing (not recommended for production)

### 🪝 Webhook Configuration (Optional)
```
WEBHOOK_PUBLIC_KEY=your_webhook_public_key
```
- **Optional:** Only needed if using HIFI webhooks
- **Source:** From HIFI dashboard webhook settings
- **Note:** Can skip for initial launch

---

## Verification Commands

After setting env vars and redeploying:

### 1. Check Health Endpoint
```bash
curl https://api.openclawpay.ai/health
```

**Expected (healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T05:34:37.426Z",
  "service": "agent-finance-api"
}
```

**Current (unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2026-02-09T05:34:37.426Z",
  "service": "agent-finance-api"
}
```

### 2. Check HIFI Connection
```bash
curl -X GET "https://sandbox.hifibridge.com/v2/ping" \
  -H "Authorization: Bearer YOUR_HIFI_API_KEY"
```

**Expected:**
```json
{
  "message": "pong"
}
```

### 3. Test Auth Endpoint
```bash
curl https://api.openclawpay.ai/auth/status
```

**Expected:**
```json
{
  "service": "agent-finance-auth",
  "authenticated": false
}
```

---

## Render Deployment Checklist

### In Render Dashboard:

1. **Go to Service:** agent-finance-backend
2. **Click "Environment"** in left sidebar
3. **Add/Update Environment Variables** (see list above)
4. **Critical:** Verify HIFI_API_KEY is set and valid
5. **Click "Save Changes"**
6. **Trigger Manual Deploy** or wait for auto-deploy
7. **Watch Logs** for any errors during startup
8. **Test Health Endpoint** after deploy completes

### Common Issues:

**❌ "unhealthy" status:**
- Missing or invalid HIFI_API_KEY
- Wrong HIFI_BASE_URL
- HIFI API key expired or revoked

**❌ CORS errors in frontend:**
- CORS_ORIGIN not set or wrong
- Missing protocol (http:// vs https://)
- Trailing slashes in URLs

**❌ 500 errors:**
- Check Render logs for stack traces
- Verify all required env vars are set
- Check HIFI API rate limits

---

## Quick Fix Script

If you want to verify env vars locally first:

```bash
# Test HIFI connection with your API key
export HIFI_API_KEY="zpka_your_key_here"
curl -X GET "https://sandbox.hifibridge.com/v2/ping" \
  -H "Authorization: Bearer $HIFI_API_KEY"
```

---

## Next Steps After Backend is Healthy

1. ✅ Verify health endpoint returns "healthy"
2. ✅ Test user registration endpoint
3. ✅ Test agent creation endpoint
4. ✅ Run full system test (dashboard → API → HIFI)
5. ✅ Launch! 🚀

---

**Status:** Waiting for Render redeploy with HIFI_API_KEY set
**Blocker:** Backend can't connect to HIFI without valid API key
**ETA to Fix:** ~5 minutes after env var is set and redeploy completes
