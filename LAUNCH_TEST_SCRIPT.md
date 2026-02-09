# Launch Testing Script

**Run this AFTER backend is healthy**  
**Time required:** ~15 minutes  
**Date:** Feb 9, 2026

---

## Pre-Flight Check ✈️

### 1. Backend Health (30 seconds)
```bash
curl https://api.openclawpay.ai/health
```

**Must see:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "service": "agent-finance-api"
}
```

❌ If unhealthy: STOP. Fix backend first (see RENDER_ENV_VARS.md)

---

## Test Sequence

### TEST 1: Landing Page (2 min)

**Steps:**
1. Open: https://openclawpay.ai
2. Verify branding: "OpenClaw Pay" logo/title
3. Check content loads (hero, features, etc.)
4. Click "Access Dashboard" button
5. Note: Does it go to correct URL?

**Expected:**
- ✅ Page loads without errors
- ✅ Branding looks professional
- ✅ Button links to https://dashboard.openclawpay.ai

**Action if fails:**
- Check Lovable deployment
- Verify DNS for openclawpay.ai
- Update button link if wrong

---

### TEST 2: Dashboard Login (3 min)

**Steps:**
1. Open: https://dashboard.openclawpay.ai
2. Should see Google Sign-In button
3. Click "Sign in with Google"
4. Authenticate with Gmail account
5. Dashboard should load (black theme, lemon accents)

**Verify in Browser Console:**
```javascript
// Check if API token exists
localStorage.getItem('apiToken')
// Should return: "opay_xxxxxxxxxxxxx..."

// Check if user profile exists
localStorage.getItem('userProfile')
// Should return JSON with email, name, etc.
```

**Expected:**
- ✅ Google OAuth works
- ✅ Dashboard loads after login
- ✅ API token generated (starts with `opay_`)
- ✅ No console errors
- ✅ UI theme looks good (black/lemon-gold)

**Action if fails:**
- Check Vercel deployment logs
- Verify Google OAuth Client ID in env vars
- Check API_URL environment variable
- Verify CORS on backend

---

### TEST 3: Create Agent (5 min)

**Steps:**
1. On dashboard, click "+ New Agent" button
2. Fill in form:
   - **Agent ID:** `test-launch-agent`
   - **Name:** `Launch Test Agent`
   - **Type:** `OpenClaw` (or Individual)
3. Click "Create Agent"
4. Watch for success toast notification
5. Verify agent appears in agent list
6. Check wallet addresses are shown

**Expected:**
- ✅ Modal opens with form
- ✅ Form validates input
- ✅ Loading spinner shows during creation
- ✅ Success toast appears: "✅ Agent created successfully!"
- ✅ Modal closes automatically
- ✅ Agent appears in list immediately
- ✅ Wallet addresses visible (Ethereum, Polygon, Base)
- ✅ No errors in console

**Debugging if fails:**
```javascript
// In browser console, check API token:
const token = localStorage.getItem('apiToken');
console.log('Token:', token);

// Try manual API call:
fetch('https://api.openclawpay.ai/agents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agentId: 'manual-test',
    name: 'Manual Test',
    type: 'openclaw'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Action if fails:**
- Check browser console for errors
- Verify backend logs in Render
- Test auth endpoint: `curl https://api.openclawpay.ai/auth/status`
- Check HIFI dashboard for user creation

---

### TEST 4: HIFI Verification (3 min)

**Steps:**
1. Open: https://dashboard.hifibridge.com
2. Login with HIFI account
3. Navigate to Users section
4. Search for: `Launch Test Agent`
5. Verify user exists
6. Check wallet addresses match dashboard

**Expected:**
- ✅ User exists in HIFI
- ✅ Email matches (or shows test email)
- ✅ Wallet addresses match exactly
- ✅ User status is active

**Action if fails:**
- Check HIFI API key is correct
- Verify HIFI environment (sandbox vs production)
- Check backend logs for HIFI API errors
- Test HIFI ping manually

---

### TEST 5: Agent Deletion (2 min)

**Steps:**
1. Back on dashboard, find test agent
2. Click trash icon (top-right of agent card)
3. Confirm deletion in dialog
4. Watch for success toast
5. Verify agent removed from list

**Expected:**
- ✅ Trash icon visible and clickable
- ✅ Confirmation dialog appears
- ✅ Loading state shows during deletion
- ✅ Success toast: "🗑️ Agent deleted successfully"
- ✅ Agent disappears from list
- ✅ If agent was selected, selection clears

**Action if fails:**
- Check console for errors
- Verify DELETE endpoint in backend
- Check auth/ownership verification

---

### TEST 6: Waitlist (Optional, 2 min)

**Steps:**
1. Go back to landing page
2. Scroll to waitlist form
3. Fill in:
   - Name: Test User
   - Email: test@example.com
4. Submit
5. Check for success message

**Expected:**
- ✅ Form submits without errors
- ✅ Success message appears
- ✅ Form clears

**Verify in Admin Dashboard:**
1. Open: https://admin.openclawpay.ai
2. Enter admin password
3. Go to Waitlist tab
4. Verify test submission appears

**Action if fails:**
- Check if waitlist endpoint is connected
- Verify CORS settings
- Check admin dashboard deployment

---

## Post-Test Verification

### Browser Console Check
```javascript
// No errors should appear in console
// Check network tab for failed requests
// All API calls should return 200 or expected status
```

### Performance Check
- Dashboard loads in < 2 seconds
- Agent creation completes in < 5 seconds
- No memory leaks (check DevTools Memory tab)

### Mobile Check (Quick)
- Open dashboard on mobile device or DevTools mobile view
- Verify responsive layout works
- Test creating agent on mobile

---

## Launch Readiness Checklist

After all tests pass:

### Technical ✅
- [ ] Backend health check: healthy
- [ ] Dashboard loads and login works
- [ ] Agent creation works end-to-end
- [ ] HIFI integration verified
- [ ] Agent deletion works
- [ ] No critical console errors
- [ ] Mobile responsive works

### Content ✅
- [ ] Landing page content accurate
- [ ] API documentation accessible
- [ ] Dashboard button links correctly
- [ ] Twitter link works (@openclawpayai)
- [ ] GitHub link works (if applicable)

### Marketing ✅
- [ ] Moltbook post drafted (see MOLTBOOK_POST_FINAL.md)
- [ ] Tweet drafted
- [ ] Screenshots ready (optional)
- [ ] Ready to monitor for signups

---

## If All Tests Pass: LAUNCH! 🚀

### Immediate Actions:
1. **Post to Moltbook** (use FULL VERSION from MOLTBOOK_POST_FINAL.md)
2. **Tweet announcement** from @openclawpayai
3. **Share in communities:**
   - OpenClaw Discord
   - Relevant Slack channels
   - AI/Web3 forums

### First Hour Monitoring:
- Watch for waitlist signups
- Monitor HIFI dashboard for new agents
- Check backend logs for errors
- Respond to any questions/feedback
- Fix critical bugs immediately

### First 24 Hours:
- Respond to every Moltbook comment
- Help first users onboard
- Track metrics:
  - Waitlist signups
  - Dashboard registrations
  - Agents created
  - Any errors reported
- Document any issues for fixes

---

## Emergency Rollback Plan

If critical issues arise after launch:

### Quick Fixes (< 5 min):
- Restart backend on Render
- Clear browser cache for users
- Update CORS if needed

### Major Issues (take site down):
1. Update landing page with "Maintenance" message
2. Fix issue in code
3. Redeploy backend/frontend
4. Test again
5. Announce when back up

### Communication:
- Post update on Moltbook
- Tweet status update
- Be transparent about issues

---

## Success Metrics (First Week)

**Minimum Success:**
- 10+ waitlist signups
- 3+ users registered
- 5+ agents created
- 0 critical bugs

**Stretch Goals:**
- 50+ waitlist signups
- 10+ active users
- 20+ agents created
- First agent-to-agent payment
- Moltbook post: 20+ upvotes

---

## Testing Status

- [ ] Backend health verified
- [ ] Landing page tested
- [ ] Dashboard login tested
- [ ] Agent creation tested
- [ ] HIFI integration verified
- [ ] Agent deletion tested
- [ ] Waitlist tested (optional)
- [ ] Mobile responsive tested
- [ ] All tests PASSED ✅

**Ready to Launch:** ⏳ Waiting for backend health check

**Last Updated:** 2026-02-09 05:36 UTC
