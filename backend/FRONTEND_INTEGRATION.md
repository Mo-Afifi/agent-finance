# Frontend Integration Guide

## Quick Start

After user logs in with Google OAuth, your frontend should:

1. Call `/api/users/register` with Google email
2. Store the returned API key in localStorage
3. Use API key for all subsequent API calls
4. Display API key in user settings/dashboard

## Step-by-Step Integration

### 1. User Registration (After Google OAuth)

```typescript
// In your Google OAuth callback or login handler
async function handleGoogleLogin(googleUser: any) {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: googleUser.email
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Store API key
      localStorage.setItem('openclaw_api_key', result.data.apiKey);
      localStorage.setItem('openclaw_user_id', result.data.userId);
      localStorage.setItem('openclaw_user_email', result.data.email);
      
      console.log('✅ User registered:', result.data);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      console.error('❌ Registration failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
  }
}
```

### 2. Create API Client Utility

```typescript
// utils/api-client.ts

export class OpenClawPayAPI {
  private baseUrl: string;
  private apiKey: string | null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = this.getApiKey();
  }

  private getApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('openclaw_api_key');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // API key invalid - clear and redirect to login
      localStorage.removeItem('openclaw_api_key');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/api/users/me');
  }

  async getApiKey() {
    return this.request('/api/users/me/api-key');
  }

  async regenerateApiKey() {
    return this.request('/api/users/me/api-key/regenerate', {
      method: 'POST',
    });
  }

  // Agent endpoints
  async listAgents() {
    return this.request('/agents');
  }

  async registerAgent(data: {
    agentId: string;
    name: string;
    email: string;
    type?: 'individual' | 'business';
  }) {
    return this.request('/api/agents/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgent(agentId: string) {
    return this.request(`/api/agents/${agentId}`);
  }

  async getAgentWallets(agentId: string) {
    return this.request(`/api/agents/${agentId}/wallets`);
  }

  async verifyAgent(agentId: string, redirectUrl?: string) {
    return this.request(`/api/agents/${agentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ redirectUrl }),
    });
  }

  async getVerificationStatus(agentId: string) {
    return this.request(`/api/agents/${agentId}/verification-status`);
  }

  // Payment endpoints
  async sendPayment(data: {
    from: string;
    to: string;
    amount: number;
    currency: string;
    chain?: 'ETHEREUM' | 'POLYGON' | 'BASE';
    memo?: string;
  }) {
    return this.request('/api/payments/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStatus(paymentId: string) {
    return this.request(`/api/payments/${paymentId}`);
  }

  async listPayments(agentId: string, limit: number = 20) {
    return this.request(`/api/agents/${agentId}/payments?limit=${limit}`);
  }
}

// Export singleton instance
export const api = new OpenClawPayAPI();
```

### 3. React Hook for Authentication

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { api } from '@/utils/api-client';

interface User {
  userId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const storedKey = localStorage.getItem('openclaw_api_key');
      if (!storedKey) {
        setLoading(false);
        return;
      }

      setApiKey(storedKey);
      const response = await api.getCurrentUser();
      
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid key
      localStorage.removeItem('openclaw_api_key');
      setApiKey(null);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    localStorage.removeItem('openclaw_api_key');
    localStorage.removeItem('openclaw_user_id');
    localStorage.removeItem('openclaw_user_email');
    setUser(null);
    setApiKey(null);
    window.location.href = '/login';
  }

  return {
    user,
    apiKey,
    loading,
    isAuthenticated: !!user,
    logout,
    reload: loadUser,
  };
}
```

### 4. Settings Page Component

```typescript
// components/SettingsPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api-client';
import { useAuth } from '@/hooks/useAuth';

export function SettingsPage() {
  const { user, apiKey: currentKey, reload } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentKey) {
      setApiKey(currentKey);
    }
  }, [currentKey]);

  async function handleRegenerateKey() {
    if (!confirm('Are you sure? This will invalidate your current API key.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.regenerateApiKey();
      
      if (response.success) {
        const newKey = response.data.apiKey;
        
        // Update localStorage
        localStorage.setItem('openclaw_api_key', newKey);
        setApiKey(newKey);
        
        alert('✅ API key regenerated successfully! Please update your applications.');
        reload();
      }
    } catch (error: any) {
      alert(`❌ Failed to regenerate key: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(apiKey);
    alert('✅ API key copied to clipboard!');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Email:</span> {user?.email}
          </div>
          <div>
            <span className="font-medium">User ID:</span> {user?.userId}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">API Key</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Your API Key
          </label>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              readOnly
              className="flex-1 px-3 py-2 border rounded font-mono text-sm"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              {showKey ? '🙈 Hide' : '👁️ Show'}
            </button>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              📋 Copy
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Keep your API key secret! Anyone with this key can access your agents and make payments.
          </p>
        </div>

        <button
          onClick={handleRegenerateKey}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '⏳ Regenerating...' : '🔄 Regenerate API Key'}
        </button>

        <p className="text-sm text-gray-600 mt-2">
          Regenerating your API key will immediately invalidate the current key.
        </p>
      </div>
    </div>
  );
}
```

### 5. Agent Management Component

```typescript
// components/AgentList.tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api-client';

export function AgentList() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const agents = await api.listAgents();
      setAgents(agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading agents...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Agents</h2>
      {agents.length === 0 ? (
        <p>No agents yet. Create your first agent to get started!</p>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent: any) => (
            <div key={agent.agentId} className="border rounded p-4">
              <h3 className="font-semibold">{agent.name}</h3>
              <p className="text-sm text-gray-600">ID: {agent.agentId}</p>
              <p className="text-sm text-gray-600">
                Created: {new Date(agent.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 6. Protected Route Component

```typescript
// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// Usage:
// <ProtectedRoute>
//   <Dashboard />
// </ProtectedRoute>
```

## Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Complete Login Flow

```typescript
// pages/login.tsx or app/login/page.tsx
'use client';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const router = useRouter();

  async function handleGoogleSuccess(credentialResponse: any) {
    try {
      // Decode Google JWT to get email
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      // Register/login user
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.success) {
        // Store API key
        localStorage.setItem('openclaw_api_key', result.data.apiKey);
        localStorage.setItem('openclaw_user_id', result.data.userId);
        localStorage.setItem('openclaw_user_email', result.data.email);

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        alert('Login failed: ' + result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            OpenClaw Pay Login
          </h1>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              alert('Login failed');
            }}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
```

## Testing in Browser Console

```javascript
// After logging in, test API calls in browser console:

// Get current user
fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('openclaw_api_key')}`
  }
}).then(r => r.json()).then(console.log);

// List agents
fetch('/agents', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('openclaw_api_key')}`
  }
}).then(r => r.json()).then(console.log);
```

## Security Notes

1. **Never expose API keys in client code** - Only store in localStorage
2. **Always use HTTPS in production**
3. **Implement logout** to clear localStorage
4. **Handle 401 errors** to redirect to login
5. **Don't commit API keys** to version control

## Common Issues

### Issue: 401 Unauthorized

**Solution:** Check that API key is being sent correctly:
```javascript
console.log('API Key:', localStorage.getItem('openclaw_api_key'));
```

### Issue: 403 Forbidden

**Solution:** User doesn't own the resource. Check agentId belongs to user.

### Issue: CORS errors

**Solution:** Ensure backend CORS is configured for your frontend origin.

## Next Steps

1. ✅ Implement Google OAuth login
2. ✅ Call `/api/users/register` after login
3. ✅ Store API key in localStorage
4. ✅ Create API client utility
5. ✅ Add API key to all requests
6. ✅ Display API key in settings
7. ✅ Handle 401 errors
8. ✅ Implement logout

Good luck! 🚀
