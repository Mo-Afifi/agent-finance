# Testing Guide - OAuth Auto-Registration Fix

## Quick Test (2 minutes)

### 1. Start the Application
```bash
cd /root/.openclaw/workspace/agent-finance/frontend
npm run dev
```

### 2. Open Browser
- Navigate to `http://localhost:5173` (or whatever port Vite shows)
- Open DevTools Console (F12 → Console tab)

### 3. Clear State
Run in console:
```javascript
localStorage.clear();
location.reload();
```

### 4. Login with Google
- Click "Sign in with Google" button
- Select a Google account
- **Watch the Console** for emoji-prefixed logs

### 5. Verify Success

**Expected Console Output:**
```
🔐 Starting Google OAuth login process...
✅ Decoded Google credential payload: { email: "user@example.com", name: "User Name", ... }
👤 User data extracted: { email: "user@example.com", name: "User Name", hasGoogleId: true }
📡 Registering user with backend (attempt 1/3): https://api.openclawpay.ai
📤 Request body: { email: "user@example.com", name: "User Name", googleId: "..." }
📥 Backend response status: 200 OK
✅ Backend response: { success: true, hasApiKey: true, userId: "..." }
🔑 API key stored successfully: sk-abc123...
✅ Login complete! User authenticated and API key stored.
```

**Check localStorage:**
```javascript
// Should return your API key
localStorage.getItem('apiToken')

// Should return user data
localStorage.getItem('openclaw_pay_user')
```

**UI Check:**
- Should redirect to `/dashboard` automatically
- No error messages should appear

---

## Test Scenarios

### ✅ Scenario 1: Successful Login
**Steps:**
1. Clear localStorage
2. Click "Sign in with Google"
3. Select account

**Expected:**
- Console shows all ✅ checkmarks
- API key stored in localStorage
- Redirects to dashboard
- No error messages

---

### ⚠️ Scenario 2: Network Failure (Simulate)

**Steps:**
1. Open DevTools → Network tab
2. Enable "Offline" mode
3. Try to login

**Expected:**
- Console shows ❌ errors
- Attempts to retry 3 times
- Shows error message in UI: "Failed to register after 3 attempts"
- Does NOT set user state
- localStorage remains empty

**Verify:**
```javascript
localStorage.getItem('apiToken')      // Should be null
localStorage.getItem('openclaw_pay_user') // Should be null
```

---

### ⚠️ Scenario 3: Invalid Email (Backend Mock Required)

This scenario requires mocking the backend to return an error.

**Expected Behavior:**
- Console shows ❌ error from backend
- Error message displayed in UI
- User not logged in

---

## Debugging Checklist

If login fails, check these in order:

### 1. Console Logs
- [ ] Are emoji logs appearing?
- [ ] Is email extracted correctly?
- [ ] Is email format valid?
- [ ] Does backend request get sent?
- [ ] What's the backend response status?

### 2. Network Tab
- [ ] Is `/api/users/register` request made?
- [ ] What's the request payload?
- [ ] What's the response status code?
- [ ] What's the response body?

### 3. localStorage
```javascript
// Check both keys
console.log('API Token:', localStorage.getItem('apiToken'));
console.log('User Data:', localStorage.getItem('openclaw_pay_user'));
```

### 4. Environment Variables
```javascript
// Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

### 5. Backend Health
```bash
# Check if backend is running
curl https://api.openclawpay.ai/health

# Test registration endpoint directly
curl -X POST https://api.openclawpay.ai/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

---

## Manual Backend Test

Test the backend registration endpoint directly:

```bash
# Register a user
curl -X POST https://api.openclawpay.ai/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "googleId": "google-test-123"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "usr_abc123",
    "email": "testuser@example.com",
    "apiKey": "sk-xxx...",
    "createdAt": "2026-02-08T21:00:00.000Z"
  }
}
```

---

## Common Issues & Solutions

### Issue: "vite: command not found"
**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: CORS Error
**Solution:**
- Backend must allow the frontend origin
- Check backend CORS configuration
- Verify `VITE_API_URL` is correct

### Issue: Google OAuth Fails
**Solution:**
- Verify `VITE_GOOGLE_CLIENT_ID` is correct
- Check Google Cloud Console OAuth settings
- Ensure authorized redirect URIs include your domain

### Issue: API Key Not Stored
**Solution:**
- Check console for backend response
- Verify `result.data.apiKey` exists in response
- Ensure no localStorage errors in console

### Issue: "Invalid Email" Error
**Solution:**
- Check console for the email being sent
- Verify email format with regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Check if Google account has a valid email

---

## Browser Console Test Script

Copy-paste this into the browser console to test individual components:

```javascript
// Test 1: Email Validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const testEmails = [
  'valid@example.com',
  'invalid',
  'user@domain.co.uk',
  '@invalid.com'
];

console.log('=== Email Validation Test ===');
testEmails.forEach(email => {
  const isValid = emailRegex.test(email);
  console.log(`${email}: ${isValid ? '✅' : '❌'}`);
});

// Test 2: localStorage Operations
console.log('\n=== localStorage Test ===');
localStorage.setItem('test-key', 'test-value');
console.log('Stored:', localStorage.getItem('test-key'));
localStorage.removeItem('test-key');
console.log('After removal:', localStorage.getItem('test-key'));

// Test 3: Check Current Auth State
console.log('\n=== Current Auth State ===');
console.log('API Token:', localStorage.getItem('apiToken'));
console.log('User Data:', localStorage.getItem('openclaw_pay_user'));

// Test 4: Decode a JWT (if you have one)
// Replace 'YOUR_JWT_TOKEN' with actual token
/*
const token = 'YOUR_JWT_TOKEN';
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('\n=== JWT Payload ===');
console.log(payload);
*/
```

---

## Performance Testing

### Test Login Speed
```javascript
console.time('Login Flow');
// Perform login
// After success:
console.timeEnd('Login Flow');
// Should complete in < 3 seconds under normal conditions
```

### Test Retry Timing
```javascript
// Enable offline mode first
// Watch console for retry timing:
// Attempt 1: immediate
// Attempt 2: +1s delay
// Attempt 3: +2s delay (total 3s between 2nd and 3rd)
```

---

## Automated Test (Future)

For CI/CD, create an automated test:

```typescript
// frontend/cypress/e2e/login.cy.ts
describe('Google OAuth Login', () => {
  it('should login and store API key', () => {
    cy.visit('/login');
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    
    // Mock Google OAuth response
    cy.intercept('POST', '**/api/users/register', {
      success: true,
      data: {
        userId: 'test-user-123',
        email: 'test@example.com',
        apiKey: 'test-api-key',
        createdAt: new Date().toISOString()
      }
    });
    
    // Trigger login (requires Google OAuth mock)
    // ... 
    
    cy.window().then((win) => {
      expect(win.localStorage.getItem('apiToken')).to.exist;
    });
    
    cy.url().should('include', '/dashboard');
  });
});
```

---

## Success Criteria

Before marking as complete, verify ALL of these:

- [ ] ✅ Login with Google OAuth succeeds
- [ ] ✅ Email is validated (check console logs)
- [ ] ✅ Backend registration succeeds (200 status)
- [ ] ✅ API key is returned from backend
- [ ] ✅ API key is stored in localStorage('apiToken')
- [ ] ✅ User data is stored in localStorage('openclaw_pay_user')
- [ ] ✅ User is redirected to /dashboard
- [ ] ✅ Console shows all emoji logs
- [ ] ✅ No error messages appear on success
- [ ] ✅ Errors are displayed when login fails
- [ ] ✅ localStorage is cleared on failure
- [ ] ✅ Retry logic works (test with network throttling)

---

**Happy Testing! 🎉**

If you encounter issues not covered in this guide, check `OAUTH_FIX.md` for more detailed debugging information.
