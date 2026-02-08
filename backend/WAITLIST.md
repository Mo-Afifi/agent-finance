# Waitlist System - OpenClaw Pay

A complete waitlist management system for OpenClaw Pay, with public signup endpoint and admin dashboard.

## Features

✅ **Public Signup Endpoint** (no auth required)
- Email validation
- Duplicate detection
- Optional name field
- Success/error responses

✅ **Admin Management Endpoints** (auth required)
- List all signups
- Approve/reject/pending status updates
- Delete entries
- Statistics dashboard

✅ **Email Notification Stubs**
- Console logging for signups
- Console logging for status changes
- Ready for email service integration

✅ **Admin Dashboard Page**
- Full React/TypeScript UI
- Search and filter functionality
- Status badges and actions
- Real-time stats

## API Endpoints

### Public Endpoint (No Auth)

#### POST `/api/waitlist/signup`

Sign up for the waitlist.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"  // optional
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "You're on the waitlist! We'll be in touch soon.",
  "data": {
    "email": "user@example.com",
    "signupDate": "2026-02-08T18:13:56.375Z"
  }
}
```

**Error (409 Conflict - Duplicate):**
```json
{
  "success": false,
  "error": "Email already registered",
  "message": "This email is already on the waitlist."
}
```

### Admin Endpoints (Require Auth)

All admin endpoints require an API key in the `Authorization` header:
```
Authorization: Bearer opay_xxx...
```

#### GET `/api/admin/waitlist`

List all waitlist signups (sorted by signup date, newest first).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "email": "user@example.com",
      "name": "John Doe",
      "signupDate": "2026-02-08T18:13:56.375Z",
      "status": "pending",
      "notes": "..."
    }
  ],
  "count": 3
}
```

#### PATCH `/api/admin/waitlist/:email`

Update waitlist entry status or notes.

**Request:**
```json
{
  "status": "approved",  // pending | approved | rejected
  "notes": "Approved for early access"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Waitlist entry updated",
  "data": {
    "email": "user@example.com",
    "name": "John Doe",
    "signupDate": "2026-02-08T18:13:56.375Z",
    "status": "approved",
    "notes": "Approved for early access"
  }
}
```

#### DELETE `/api/admin/waitlist/:email`

Remove an entry from the waitlist.

**Response:**
```json
{
  "success": true,
  "message": "Waitlist entry deleted"
}
```

#### GET `/api/admin/waitlist/stats`

Get waitlist statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "pending": 7,
    "approved": 2,
    "rejected": 1
  }
}
```

## Data Storage

Waitlist entries are stored in:
```
backend/data/waitlist.json
```

**Entry Structure:**
```typescript
interface WaitlistEntry {
  email: string;
  name?: string;
  signupDate: string;  // ISO 8601
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}
```

## Admin Dashboard

The waitlist admin page is located at:
```
/waitlist
```

Features:
- **Stats Cards:** Total, Pending, Approved, Rejected counts
- **Search:** Filter by email or name
- **Status Filter:** All, Pending, Approved, Rejected
- **Actions:** Approve, Reject, Set Pending, Delete
- **Real-time Updates:** Stats refresh after every action

## Email Notifications

Email notifications are currently **stubbed** with console logging. When a signup occurs or status changes, you'll see logs like:

```
📧 [EMAIL STUB] New waitlist signup:
   Email: user@example.com
   Name: John Doe
   TODO: Send welcome email to user
   TODO: Send notification to admin
```

```
📧 [EMAIL STUB] Waitlist status changed:
   Email: user@example.com
   Status: approved
   TODO: Send approved email to user
```

### Integration Points

To integrate a real email service (SendGrid, Resend, etc.), update these functions in `src/api/waitlist-routes.ts`:

1. `logSignupNotification(email, name)` - Send welcome email + notify admin
2. `logStatusChangeNotification(email, status)` - Send status update email

Example with SendGrid:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendWelcomeEmail(email: string, name?: string) {
  await sgMail.send({
    to: email,
    from: 'waitlist@openclawpay.ai',
    subject: "You're on the OpenClaw Pay Waitlist!",
    text: `Hi ${name || 'there'},\n\nYou're on the waitlist! We'll be in touch soon.`,
    html: `<p>Hi ${name || 'there'},</p><p>You're on the waitlist! We'll be in touch soon.</p>`,
  });
}

async function sendApprovalEmail(email: string) {
  await sgMail.send({
    to: email,
    from: 'waitlist@openclawpay.ai',
    subject: 'Welcome to OpenClaw Pay!',
    text: 'You've been approved! Click here to get started: ...',
    html: '<p>You've been approved! <a href="...">Get started</a></p>',
  });
}
```

## Testing

### Test Public Signup

```bash
curl -X POST http://localhost:3000/api/waitlist/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### Test Admin Endpoints

First, register a user to get an API key:
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@openclawpay.ai"}'
```

Then use the returned API key:
```bash
API_KEY="opay_xxx..."

# List all
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:3000/api/admin/waitlist

# Approve
curl -X PATCH \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}' \
  http://localhost:3000/api/admin/waitlist/test@example.com

# Stats
curl -H "Authorization: Bearer $API_KEY" \
  http://localhost:3000/api/admin/waitlist/stats
```

## Files Added

**Backend:**
- `src/api/waitlist-storage.ts` - Storage layer for waitlist data
- `src/api/waitlist-routes.ts` - API route handlers
- `data/waitlist.json` - JSON storage file

**Admin Dashboard:**
- `src/pages/Waitlist.tsx` - Admin UI page
- Updated `src/App.tsx` - Added route
- Updated `src/components/Layout.tsx` - Added nav link

**Documentation:**
- `LOVABLE_INTEGRATION.md` - Guide for frontend integration
- `WAITLIST.md` - This file

## Next Steps

1. ✅ Backend API working
2. ✅ Admin dashboard functional
3. ✅ Documentation complete
4. 🔲 Deploy to production
5. 🔲 Integrate email service
6. 🔲 Update Lovable frontend
7. 🔲 Test end-to-end flow

## Production Deployment

When deploying to production:

1. Ensure `data/` directory is writable
2. Consider migrating to a database for scale (MongoDB, PostgreSQL)
3. Add backup/recovery for `waitlist.json`
4. Set up email service (SendGrid, Resend, etc.)
5. Configure proper CORS for production domains
6. Monitor signup rate and adjust rate limiting if needed
