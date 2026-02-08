# Lovable Integration Guide - OpenClaw Pay Waitlist

This guide shows how to integrate the OpenClaw Pay waitlist API into your Lovable (lovable.dev) frontend.

## API Endpoint

**Public Waitlist Signup (No Auth Required):**
```
POST https://api.openclawpay.ai/api/waitlist/signup
```

## Integration Options

### Option 1: Direct Form Submission with Fetch

Update your Lovable form component to POST directly to the API:

```tsx
import { useState } from 'react';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('https://api.openclawpay.ai/api/waitlist/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setSuccess(true);
      setEmail('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Join the Waitlist</h2>
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
          🎉 You're on the waitlist! We'll be in touch soon.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Joining...' : 'Join Waitlist'}
        </button>
      </form>
    </div>
  );
}
```

### Option 2: Simple JavaScript/AJAX

For vanilla JavaScript or simpler setups:

```javascript
async function joinWaitlist(email, name = '') {
  try {
    const response = await fetch('https://api.openclawpay.ai/api/waitlist/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        name: name || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    // Success!
    console.log('Joined waitlist:', data);
    alert(data.message || "You're on the waitlist!");
    
    return data;
  } catch (error) {
    console.error('Waitlist signup error:', error);
    alert(error.message || 'Something went wrong. Please try again.');
    throw error;
  }
}

// Usage:
// joinWaitlist('user@example.com', 'John Doe');
```

### Option 3: HTML Form with JavaScript

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join OpenClaw Pay Waitlist</title>
  <style>
    .waitlist-form {
      max-width: 400px;
      margin: 50px auto;
      padding: 30px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover {
      background: #1d4ed8;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .message {
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    .success { background: #d1fae5; color: #065f46; }
    .error { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="waitlist-form">
    <h2>Join the Waitlist</h2>
    
    <div id="message"></div>
    
    <form id="waitlistForm">
      <div class="form-group">
        <label for="email">Email *</label>
        <input type="email" id="email" name="email" required placeholder="you@example.com">
      </div>
      
      <div class="form-group">
        <label for="name">Name (optional)</label>
        <input type="text" id="name" name="name" placeholder="Your name">
      </div>
      
      <button type="submit" id="submitBtn">Join Waitlist</button>
    </form>
  </div>

  <script>
    const form = document.getElementById('waitlistForm');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const name = document.getElementById('name').value;
      
      messageDiv.innerHTML = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Joining...';

      try {
        const response = await fetch('https://api.openclawpay.ai/api/waitlist/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            name: name || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Signup failed');
        }

        // Success
        messageDiv.className = 'message success';
        messageDiv.textContent = data.message || "You're on the waitlist!";
        form.reset();
      } catch (error) {
        // Error
        messageDiv.className = 'message error';
        messageDiv.textContent = error.message || 'Something went wrong. Please try again.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Join Waitlist';
      }
    });
  </script>
</body>
</html>
```

## API Request Format

### Request Body

```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Fields:**
- `email` (required): Valid email address
- `name` (optional): User's name

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "You're on the waitlist! We'll be in touch soon.",
  "data": {
    "email": "user@example.com",
    "signupDate": "2026-02-08T18:30:00.000Z"
  }
}
```

### Error Responses

**Duplicate Email (409 Conflict):**
```json
{
  "success": false,
  "error": "Email already registered",
  "message": "This email is already on the waitlist."
}
```

**Invalid Email (400 Bad Request):**
```json
{
  "success": false,
  "error": "Signup failed",
  "message": "Invalid email address"
}
```

## CORS Configuration

The API allows requests from any origin (`*`). No special CORS configuration needed in your Lovable app.

## Rate Limiting

The API has rate limiting enabled:
- **100 requests per minute** per IP address
- If exceeded, you'll get a `429 Too Many Requests` response

## Testing

You can test the API with curl:

```bash
curl -X POST https://api.openclawpay.ai/api/waitlist/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

Or with your browser's developer console:

```javascript
fetch('https://api.openclawpay.ai/api/waitlist/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', name: 'Test User' })
})
  .then(r => r.json())
  .then(console.log);
```

## Admin Dashboard

Once users sign up, they'll appear in the admin dashboard at:
- **Dashboard:** https://admin.openclawpay.ai/waitlist

Admins can:
- View all signups
- Approve/reject entries
- Search and filter
- Delete entries
- View statistics

## Next Steps

1. Copy the form component code into your Lovable project
2. Customize the styling to match your design
3. Test the signup flow
4. Monitor signups in the admin dashboard

## Support

If you run into issues or have questions, check:
- API logs in the backend server
- Browser console for errors
- Network tab in DevTools to inspect requests/responses
