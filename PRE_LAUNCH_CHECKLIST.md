# Pre-Launch Checklist

## 🚨 BEFORE LAUNCH - MUST DO

### 🔐 **CRITICAL: Add Dashboard Authentication**
**Status:** Sub-agent building Google OAuth now  
**Priority:** HIGH - Dashboard is currently public!

**Implementation:**
- [ ] Sub-agent completes Google OAuth integration
- [ ] Get Google OAuth Client ID from console.cloud.google.com
- [ ] Add VITE_GOOGLE_CLIENT_ID to Vercel environment
- [ ] Redeploy dashboard with auth
- [ ] Test login flow
- [ ] Verify only authenticated users can access

**Without this:** Anyone can access dashboard and see all agent data!

---

## ✅ **Other Pre-Launch Items**

### API
- [ ] Backend deployed and live at api.openclawpay.ai
- [ ] Health check responding
- [ ] Test agent registration with HIFI
- [ ] Custom domain DNS configured

### Dashboard  
- [ ] Custom domain dashboard.openclawpay.ai configured
- [ ] Authentication implemented (BLOCKER)
- [ ] Connects to live API

### Landing Page
- [ ] API docs page added
- [ ] Waitlist form working
- [ ] Links to dashboard updated

### Testing
- [ ] End-to-end flow test
- [ ] Register test agent
- [ ] Verify in HIFI dashboard
- [ ] Check dashboard displays correctly

### Marketing
- [ ] Moltbook post ready
- [ ] Tweet draft
- [ ] Discord announcement

---

**REMINDER: DO NOT LAUNCH without dashboard auth!**

Created: 2026-02-08 16:09 UTC
