# 🚀 OpenClaw Pay - Final Launch Checklist

**Created:** 2026-02-08 19:29 UTC  
**Launch Target:** Today (pending final tests)

---

## 🔴 **CRITICAL - MUST TEST BEFORE LAUNCH**

### 🔐 Security
- [ ] **User Dashboard:** Google OAuth login required ✅
- [ ] **Admin Dashboard:** Password protection working
- [ ] **API:** Bearer token authentication enforced
- [ ] **HIFI API Key:** Not exposed in client code ✅
- [ ] **Environment Variables:** All secrets secured in Render/Vercel

### 🧪 End-to-End User Flow
- [ ] User can access https://dashboard.openclawpay.ai
- [ ] User can login with Google (any Gmail account)
- [ ] User automatically gets API key after login
- [ ] User can create first agent successfully
- [ ] Agent appears in dashboard list
- [ ] Agent exists in HIFI (verify in HIFI dashboard)
- [ ] User can see agent wallet addresses
- [ ] Dashboard shows correct data (no 404 errors)

### 🎨 User Experience
- [ ] Dashboard theme looks good (black/lemon-gold)
- [ ] Login page loads properly
- [ ] No console errors on dashboard
- [ ] Responsive design works on mobile
- [ ] Loading states show properly
- [ ] Error messages are clear

### 🌐 DNS & Domains
- [x] **openclawpay.ai** → Landing page (Lovable) ✅
- [ ] **dashboard.openclawpay.ai** → User dashboard (Vercel) - DNS propagated?
- [ ] **api.openclawpay.ai** → Backend API (Render) ✅
- [ ] **admin.openclawpay.ai** → Admin dashboard (Vercel) - DNS propagated?
- [ ] All SSL certificates valid and working

---

## 🟡 **IMPORTANT - SHOULD VERIFY**

### 📊 Admin Dashboard
- [ ] Access https://admin.openclawpay.ai
- [ ] Password login works
- [ ] Can see platform stats
- [ ] Can view all users
- [ ] Can view all agents
- [ ] Waitlist page shows signups (if any)

### 📝 Content
- [x] Landing page has API documentation ✅
- [ ] Landing page "Access Dashboard" button points to correct URL
- [ ] Branding consistent (OpenClaw Pay everywhere)
- [ ] Links to Twitter work: https://x.com/openclawpayai
- [ ] Waitlist form working and saving signups

### 🔧 API Testing
- [x] Backend health check responds ✅
- [x] User registration creates API keys ✅
- [x] Agent registration creates HIFI users ✅
- [ ] Agent registration via dashboard works (waiting on fix deploy)
- [ ] Wallets are created automatically
- [ ] Auth middleware blocks unauthorized requests ✅

---

## 🟢 **NICE TO HAVE - NOT BLOCKING LAUNCH**

### 📈 Analytics
- [ ] Set up Google Analytics (optional)
- [ ] Add error tracking (Sentry)
- [ ] Add uptime monitoring (BetterStack)

### 📧 Email
- [ ] Waitlist confirmation emails (stub only)
- [ ] User welcome emails
- [ ] API key regeneration emails

### 🎁 Features
- [ ] Multiple API keys per user
- [ ] API key usage stats
- [ ] Transaction history view
- [ ] Agent-to-agent transfers (not just registration)

---

## 📋 **PRE-LAUNCH TASKS**

### Backend (Render)
- [x] Backend deployed to Render ✅
- [x] Environment variables set (HIFI_API_KEY, etc.) ✅
- [x] Custom domain configured (api.openclawpay.ai) ✅
- [ ] **Final redeploy with latest fixes** ⏳ WAITING ON MO

### Frontend (Vercel - User Dashboard)
- [x] Dashboard deployed to Vercel ✅
- [x] Google OAuth Client ID configured ✅
- [x] API URL environment variable set ✅
- [x] Custom domain configured (dashboard.openclawpay.ai) ✅
- [x] Latest fixes deployed (email optional, type enum fix) ✅

### Frontend (Vercel - Admin Dashboard)
- [x] Admin deployed to Vercel ✅
- [ ] Password set in environment variables
- [ ] Custom domain configured (admin.openclawpay.ai)
- [ ] Can access and login

### Landing Page (Lovable)
- [x] Domain configured (openclawpay.ai) ✅
- [x] API documentation added ✅
- [ ] Dashboard button URL updated
- [ ] Waitlist form connected to API

---

## 🧪 **TEST SCRIPT FOR MO**

### Test 1: Landing Page
1. Go to https://openclawpay.ai
2. ✅ Page loads without errors
3. ✅ Branding looks good
4. ✅ "Access Dashboard" button exists
5. ✅ API docs page accessible
6. ✅ Waitlist form present

### Test 2: User Dashboard Login
1. Go to https://dashboard.openclawpay.ai  
2. ✅ "Sign in with Google" button shows
3. ✅ Click and login with Gmail
4. ✅ Dashboard loads (black/lemon theme)
5. ✅ No console errors
6. Open console: `localStorage.getItem('apiToken')`
7. ✅ Should show API key starting with `opay_`

### Test 3: Create First Agent
1. ✅ Click "+ New Agent" button
2. ✅ Fill in form:
   - Agent ID: shade-agent
   - Name: Shade
   - Type: OpenClaw (or Individual)
3. ✅ Click "Create Agent"
4. ✅ Success message appears
5. ✅ Agent appears in dashboard list
6. ✅ Wallet addresses shown

### Test 4: Verify in HIFI
1. Go to https://dashboard.hifibridge.com
2. Login to HIFI
3. Check if user "Shade" exists
4. ✅ Confirm wallet addresses match

### Test 5: Admin Dashboard
1. Go to https://admin.openclawpay.ai
2. Enter admin password
3. ✅ Platform stats show (even if zeros)
4. ✅ Users list shows at least 1 user (Mo)
5. ✅ Agents list shows test agents
6. ✅ Waitlist tab accessible

### Test 6: Waitlist
1. Go to landing page
2. Fill in waitlist form
3. Submit
4. ✅ Success message
5. Check admin dashboard → Waitlist
6. ✅ Signup appears in list

---

## 🚨 **BLOCKERS TO LAUNCH**

### Critical (Must Fix):
1. ⏳ **Render backend redeploy** - Deploy latest fixes
2. ⏳ **Test dashboard agent creation** - Verify 404 is gone
3. ⏳ **Verify API key flow** - Ensure users get keys automatically

### Important (Should Fix):
1. Update landing page dashboard button URL
2. Connect waitlist form to API
3. Test admin dashboard access

---

## 🎉 **LAUNCH PLAN**

### When All Tests Pass:

**1. Marketing Blast:**
- [ ] Post to Moltbook (full version)
- [ ] Tweet from @openclawpayai
- [ ] Share on Discord/Slack communities
- [ ] Update LinkedIn

**2. Monitoring:**
- [ ] Watch for signups
- [ ] Monitor API for errors
- [ ] Check HIFI dashboard for new users
- [ ] Respond to questions/feedback

**3. First 24 Hours:**
- [ ] Respond to every Moltbook comment
- [ ] Help first users onboard
- [ ] Fix any bugs reported
- [ ] Track metrics (signups, agents created)

---

## 📊 **Success Metrics (First Week)**

**Minimum (MVP Success):**
- 10+ waitlist signups
- 3+ users registered on dashboard
- 5+ agents created
- 0 critical bugs

**Stretch Goals:**
- 50+ waitlist signups
- 10+ users
- 20+ agents
- Agent-to-agent payment (if anyone tries)
- Moltbook post gets 20+ upvotes

---

## 🔧 **POST-LAUNCH PRIORITIES**

### Week 1:
1. User feedback collection
2. Bug fixes
3. Email notifications
4. Better onboarding

### Week 2:
1. Move to HIFI production (real money)
2. KYC flow for users
3. Agent-to-agent payments testing
4. More examples/docs

---

## ✅ **READY TO LAUNCH WHEN:**

1. ✅ Backend redeploys successfully
2. ✅ Mo tests dashboard and can create agent
3. ✅ No 404 or auth errors
4. ✅ Mo approves final check

**Estimated Time to Launch:** 15 minutes after backend redeploy

---

## 🎯 **IMMEDIATE NEXT STEP**

**Mo: Trigger Render backend redeploy**

Then I'll test everything and give you final go/no-go for launch! 🚀
