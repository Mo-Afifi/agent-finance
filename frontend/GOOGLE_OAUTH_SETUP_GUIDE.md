# Google OAuth Setup Guide

Complete step-by-step guide to configure Google OAuth for the OpenClaw Pay dashboard.

## Prerequisites

- Google account
- Access to Google Cloud Console

## Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

## Step 2: Create or Select a Project

### Option A: Create New Project
1. Click the project dropdown at the top of the page
2. Click "New Project"
3. Enter project name: `OpenClaw Pay` (or your preferred name)
4. Click "Create"
5. Wait for project creation (usually takes a few seconds)
6. Select your new project from the dropdown

### Option B: Use Existing Project
1. Click the project dropdown at the top
2. Select an existing project

## Step 3: Enable Required APIs

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it
4. Click **"Enable"**
5. Wait for activation

## Step 4: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**

### Fill in the form:

**App Information:**
- **App name:** `OpenClaw Pay Dashboard`
- **User support email:** Your email address
- **App logo:** (Optional) Upload your logo

**App Domain (Optional but recommended):**
- **Application home page:** `https://pay.openclawpay.ai` (or your domain)
- **Application privacy policy:** Your privacy policy URL
- **Application terms of service:** Your terms URL

**Authorized domains:**
- Add your production domain (e.g., `openclawpay.ai`)
- For development, you don't need to add `localhost`

**Developer contact information:**
- **Email addresses:** Your email address

4. Click **"Save and Continue"**

### Scopes (Step 2):
1. Click **"Add or Remove Scopes"**
2. Select the following scopes:
   - `openid`
   - `profile`
   - `email`
3. Click **"Update"**
4. Click **"Save and Continue"**

### Test users (Step 3):
1. Click **"Add Users"**
2. Add email addresses of people who can test the app
3. Click **"Save and Continue"**

4. Review and click **"Back to Dashboard"**

## Step 5: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**

### Configure the OAuth client:

**Name:**
```
OpenClaw Pay Web Client
```

**Authorized JavaScript origins:**

For development:
```
http://localhost:5173
```

For production:
```
https://pay.openclawpay.ai
```

*Note: Add both if you need development and production*

**Authorized redirect URIs:**

For development:
```
http://localhost:5173
```

For production:
```
https://pay.openclawpay.ai
```

*Note: These are the same as JavaScript origins for client-side OAuth*

4. Click **"Create"**

## Step 6: Copy Your Client ID

1. A popup will appear showing your credentials
2. **Copy the Client ID** (it looks like: `123456789-abc123xyz.apps.googleusercontent.com`)
3. Click **"OK"**

### Important:
- ✅ **Client ID** - This is public and goes in your `.env` file
- ❌ **Client Secret** - You don't need this for client-side OAuth (but keep it secret if shown)

## Step 7: Configure Your Application

### For Development:

1. Open your terminal
2. Navigate to the frontend directory:
   ```bash
   cd /path/to/agent-finance/frontend
   ```

3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

5. Replace `YOUR_CLIENT_ID_HERE` with the Client ID you copied

6. Save the file

### For Production (Vercel, Netlify, etc.):

1. Go to your deployment platform's environment variables settings
2. Add a new environment variable:
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** Your Client ID from step 6

3. Redeploy your application

## Step 8: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:5173` in your browser

3. You should see the login page

4. Click **"Sign in with Google"**

5. A Google OAuth popup should appear

6. Select your Google account

7. You should be redirected to the dashboard

### Troubleshooting:

**Error: "redirect_uri_mismatch"**
- Check that `http://localhost:5173` is in your Authorized JavaScript origins
- Make sure you're accessing the app on the exact URL you configured

**Error: "access_blocked"**
- Your OAuth consent screen is in testing mode
- Add your Google account as a test user (Step 4)

**Error: "idpiframe_initialization_failed"**
- Check that your Client ID is correct in `.env`
- Make sure you restarted the dev server after changing `.env`
- Clear browser cache and cookies

**Login button doesn't appear:**
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set
- Check that `@react-oauth/google` is installed

## Step 9: Publishing Your App (Optional)

If you want anyone to sign in (not just test users):

1. Go to **"OAuth consent screen"**
2. Click **"Publish App"**
3. Review the information
4. Click **"Confirm"**

**Note:** Google may require verification if you request sensitive scopes. For basic profile info (which we use), verification is usually not required.

## Security Best Practices

### ✅ Do:
- Store Client ID in environment variables
- Use HTTPS in production
- Keep your Google Cloud Console access secure
- Regularly review authorized domains
- Add only necessary scopes

### ❌ Don't:
- Commit `.env` file to git (it's already in `.gitignore`)
- Share your Client Secret (we don't use it, but keep it private)
- Add untrusted domains to authorized origins
- Use the same credentials for multiple projects

## Managing Credentials

### View Existing Credentials:
1. Go to **"APIs & Services"** → **"Credentials"**
2. All OAuth clients are listed

### Edit Credentials:
1. Click on the credential name
2. Modify authorized origins or redirect URIs
3. Click **"Save"**

### Delete Credentials:
1. Click the trash icon next to the credential
2. Confirm deletion

### Create Additional Credentials:
- You can create separate credentials for development and production
- Useful for tracking usage separately

## Common Issues

### Issue: "This app isn't verified"
**Solution:** This is normal for apps in testing mode. Click "Advanced" → "Go to [Your App] (unsafe)" to continue.

### Issue: Can't add localhost to authorized domains
**Solution:** That's expected. Localhost doesn't need to be in authorized domains, only in authorized JavaScript origins.

### Issue: OAuth screen shows wrong app name
**Solution:** Update the OAuth consent screen configuration (Step 4).

### Issue: Want to change scopes
**Solution:** Update in OAuth consent screen → Scopes, and optionally delete/recreate the OAuth client.

## Environment Variables Summary

```env
# Required
VITE_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com

# Your backend API (adjust as needed)
VITE_API_URL=https://api.openclawpay.ai
```

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all steps in this guide
3. Check that environment variables are set correctly
4. Ensure the dev server was restarted after changing `.env`
5. Clear browser cache and cookies

---

**Setup Complete! 🎉**

Your OpenClaw Pay dashboard now has secure Google OAuth authentication. Users can sign in with their Google accounts and their session will persist across browser sessions.
