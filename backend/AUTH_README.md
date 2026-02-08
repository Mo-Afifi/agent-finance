# API Key Authentication System

This document describes the API key authentication system for OpenClaw Pay.

## Overview

The authentication system uses API keys with the prefix `opay_` to authenticate users and secure agent operations. Each user gets a unique API key after registering via Google OAuth.

## Architecture

### Storage Layer (`src/auth/storage.ts`)

**Current Implementation:** JSON file-based storage (`data/users.json`)
- ✅ Simple MVP implementation
- ✅ In-memory caching with persistence
- ✅ Suitable for development and testing

**Future Migration:** Production database (PostgreSQL/MySQL)
- TODO: Replace `UserStorage` class with database queries
- TODO: Add proper indexing on email and apiKey fields
- TODO: Implement proper transactions for atomicity

### Data Models

```typescript
interface User {
  userId: string;           // user_xxx...
  email: string;            // From Google OAuth
  apiKey: string;           // opay_xxx...
  createdAt: string;
  updatedAt: string;
}

interface UserAgent {
  agentId: string;          // Agent identifier
  userId: string;           // Owner's user ID
  ownerEmail: string;       // Owner's email
  name: string;             // Agent name
  createdAt: string;
}
```

### Authentication Middleware (`src/auth/middleware.ts`)

Two middleware functions:

1. **`requireAuth`** - Requires valid API key
   - Checks `Authorization: Bearer opay_xxx...` header
   - Returns 401 if missing or invalid
   - Attaches `request.user` object

2. **`optionalAuth`** - Optional authentication
   - Attaches user if API key is valid
   - Doesn't fail if no API key provided

## API Endpoints

### User Management

#### 1. Register User (POST /api/users/register)

Called by frontend after Google OAuth login.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123...",
    "email": "user@example.com",
    "apiKey": "opay_xyz789...",
    "createdAt": "2026-02-08T17:00:00Z"
  }
}
```

**Notes:**
- Idempotent: Returns existing user if email already registered
- Auto-generates API key on first registration

#### 2. Get Current User (GET /api/users/me)

**Headers:**
```
Authorization: Bearer opay_xyz789...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123...",
    "email": "user@example.com",
    "createdAt": "2026-02-08T17:00:00Z",
    "updatedAt": "2026-02-08T17:00:00Z"
  }
}
```

#### 3. Get API Key (GET /api/users/me/api-key)

**Headers:**
```
Authorization: Bearer opay_xyz789...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "opay_xyz789...",
    "createdAt": "2026-02-08T17:00:00Z",
    "updatedAt": "2026-02-08T17:00:00Z"
  }
}
```

#### 4. Regenerate API Key (POST /api/users/me/api-key/regenerate)

**Headers:**
```
Authorization: Bearer opay_xyz789...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": "opay_new_key...",
    "updatedAt": "2026-02-08T18:00:00Z"
  },
  "message": "API key regenerated successfully. Please update your applications."
}
```

**Notes:**
- Old API key is immediately invalidated
- Update all applications with new key

### Protected Agent Endpoints

All agent operations now require API key authentication and ownership verification:

- `GET /agents` - List user's agents
- `POST /api/agents/register` - Register new agent (auto-assigns to user)
- `GET /api/agents/:agentId` - Get agent details (ownership required)
- `POST /api/agents/:agentId/verify` - Initiate KYC (ownership required)
- `GET /api/agents/:agentId/verification-status` - Check KYC status
- `GET /api/agents/:agentId/wallets` - Get wallets
- `POST /api/payments/send` - Send payment (must own sender agent)
- `GET /api/agents/:agentId/payments` - List payments

## Frontend Integration

### 1. After Google OAuth Login

```typescript
// User just logged in with Google
const googleEmail = user.email;

// Register/get user and API key
const response = await fetch('/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: googleEmail })
});

const { data } = await response.json();
// data = { userId, email, apiKey, createdAt }

// Store API key in localStorage
localStorage.setItem('openclaw_api_key', data.apiKey);
```

### 2. Making Authenticated API Calls

```typescript
const apiKey = localStorage.getItem('openclaw_api_key');

const response = await fetch('/api/agents', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
});

const agents = await response.json();
```

### 3. Display API Key in Settings

```tsx
function SettingsPage() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('openclaw_api_key');
    setApiKey(key);
  }, []);

  return (
    <div>
      <h2>Your API Key</h2>
      <code>{apiKey}</code>
      <button onClick={regenerateKey}>Regenerate</button>
    </div>
  );
}
```

### 4. Handle 401 Errors

```typescript
// Redirect to login if API key is invalid
if (response.status === 401) {
  localStorage.removeItem('openclaw_api_key');
  router.push('/login');
}
```

## Security Best Practices

### Current Implementation (MVP)

✅ API keys use cryptographically random bytes
✅ Bearer token authentication
✅ Ownership validation on all agent operations
✅ User isolation (can't access other users' agents)

### Production Recommendations

TODO:
- [ ] Use HTTPS only in production
- [ ] Implement rate limiting per API key
- [ ] Add API key scopes/permissions
- [ ] Log API key usage for audit trails
- [ ] Implement API key expiration
- [ ] Add IP whitelisting option
- [ ] Rotate API keys periodically
- [ ] Hash API keys in database (store only hash)
- [ ] Add multi-factor authentication option

## Migration to Production Database

### Steps to migrate from JSON to PostgreSQL:

1. **Create database schema:**

```sql
CREATE TABLE users (
  user_id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  api_key_hash VARCHAR(128) UNIQUE NOT NULL,  -- Hash the key!
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_agents (
  agent_id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(user_id),
  owner_email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_api_key_hash ON users(api_key_hash);
```

2. **Update `storage.ts`:**

Replace file operations with SQL queries:

```typescript
// Example: getUserByApiKey
async getUserByApiKey(apiKey: string): Promise<User | null> {
  const hash = hashApiKey(apiKey);  // Use bcrypt or similar
  const result = await db.query(
    'SELECT * FROM users WHERE api_key_hash = $1',
    [hash]
  );
  return result.rows[0] || null;
}
```

3. **Add connection pooling:**

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});
```

4. **Test thoroughly** before deploying to production!

## Testing

### Manual Testing with curl

```bash
# 1. Register user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Response: { "success": true, "data": { "apiKey": "opay_..." } }

# 2. Get current user
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer opay_..."

# 3. List agents
curl http://localhost:3000/agents \
  -H "Authorization: Bearer opay_..."

# 4. Register agent
curl -X POST http://localhost:3000/api/agents/register \
  -H "Authorization: Bearer opay_..." \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-test-1",
    "name": "Test Agent",
    "email": "agent@example.com"
  }'
```

## Error Codes

- **400** - Bad request (validation error)
- **401** - Unauthorized (missing or invalid API key)
- **403** - Forbidden (user doesn't own the resource)
- **404** - Not found
- **500** - Internal server error

## File Structure

```
backend/
├── src/
│   ├── auth/
│   │   ├── storage.ts          # User & agent storage
│   │   └── middleware.ts       # Authentication middleware
│   ├── api/
│   │   ├── user-routes.ts      # User endpoints
│   │   ├── routes.ts           # Protected agent endpoints
│   │   └── admin-routes.ts     # Admin endpoints
│   └── server.ts               # Main server setup
├── data/
│   └── users.json              # User data (auto-created)
└── AUTH_README.md              # This file
```

## Support

For issues or questions, check the main project README or contact the OpenClaw Pay team.
