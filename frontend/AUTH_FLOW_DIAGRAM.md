# Authentication Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens Dashboard                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │   AuthProvider      │
           │   - Load from       │
           │     localStorage    │
           └─────────┬───────────┘
                     │
         ┌───────────┴──────────┐
         │                      │
         ▼                      ▼
  ┌─────────────┐      ┌──────────────┐
  │ User Found  │      │ No User      │
  │ in Storage  │      │ in Storage   │
  └──────┬──────┘      └──────┬───────┘
         │                    │
         │                    ▼
         │           ┌─────────────────┐
         │           │ ProtectedRoute  │
         │           │ Redirects to    │
         │           │ /login          │
         │           └────────┬────────┘
         │                    │
         │                    ▼
         │           ┌─────────────────────────┐
         │           │   Login Page            │
         │           │ - Google Sign In Button │
         │           └────────┬────────────────┘
         │                    │
         │                    ▼
         │           ┌──────────────────────┐
         │           │ User Clicks "Sign in │
         │           │ with Google"         │
         │           └─────────┬────────────┘
         │                     │
         │                     ▼
         │           ┌─────────────────────────┐
         │           │ Google OAuth Popup      │
         │           │ - User authenticates    │
         │           │ - Returns JWT token     │
         │           └─────────┬───────────────┘
         │                     │
         │                     ▼
         │           ┌─────────────────────────┐
         │           │ AuthContext.login()     │
         │           │ - Decode JWT token      │
         │           │ - Extract user info     │
         │           │ - Save to localStorage  │
         │           └─────────┬───────────────┘
         │                     │
         └─────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ ProtectedRoute       │
                    │ Allows Access        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────────────┐
                    │   Dashboard                  │
                    │ - Show user profile in header│
                    │ - Display user avatar        │
                    │ - Show user name & email     │
                    │ - Logout button available    │
                    └──────────┬───────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ User Creates Agent   │
                    │ - Include user       │
                    │   metadata (userId,  │
                    │   userEmail, etc.)   │
                    └──────────────────────┘
```

## Logout Flow

```
┌─────────────────────┐
│ User Clicks Logout  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────┐
│ AuthContext.logout() │
│ - Clear localStorage │
│ - Set user to null   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ ProtectedRoute       │
│ Detects no user      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Redirect to /login   │
└──────────────────────┘
```

## Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Route: /login
│       │   └── Login
│       │       └── GoogleLogin (from @react-oauth/google)
│       │
│       ├── Route: /dashboard
│       │   └── ProtectedRoute
│       │       └── Dashboard
│       │           ├── Header
│       │           │   ├── User Profile
│       │           │   └── Logout Button
│       │           ├── Stats
│       │           ├── AgentsList
│       │           └── TransactionHistory
│       │
│       └── Route: /
│           └── Navigate to /dashboard
```

## Data Flow

### User Session Storage (localStorage)

```javascript
// Key: 'openclaw_pay_user'
// Value: JSON
{
  email: "[email protected]",
  name: "John Doe",
  picture: "https://lh3.googleusercontent.com/...",
  sub: "105432167890123456789"  // Google user ID
}
```

### Agent Creation with User Metadata

```javascript
// When creating an agent
{
  agentId: "my-agent-123",
  name: "MyAgent",
  type: "openclaw",
  email: "[email protected]",
  metadata: {
    userId: "105432167890123456789",    // From user.sub
    userEmail: "[email protected]",     // From user.email
    userName: "John Doe"                  // From user.name
  }
}
```

## Security Layers

1. **Route Protection**
   - `ProtectedRoute` wrapper on all dashboard routes
   - Checks `isAuthenticated` state
   - Redirects to login if not authenticated

2. **Session Persistence**
   - User data stored in localStorage
   - Loaded on app initialization
   - Cleared on logout

3. **User Ownership**
   - User metadata attached to all created agents
   - Backend can filter agents by userId
   - Prevents unauthorized access to other users' agents

## State Management

```
AuthContext provides:
├── user: User | null
│   ├── email: string
│   ├── name: string
│   ├── picture?: string
│   └── sub: string (Google ID)
│
├── isAuthenticated: boolean
├── isLoading: boolean
├── login(credential: string): void
└── logout(): void
```

## API Integration Points

### Current Implementation
- Frontend stores user session locally
- User metadata included in agent creation
- No backend validation yet

### Future Backend Integration Needed
1. **GET /agents**
   - Add `userId` query parameter
   - Filter agents by authenticated user
   - Return only user's agents

2. **POST /agents**
   - Validate user owns the agent being created
   - Store userId in database

3. **Session Management**
   - Validate Google JWT tokens on backend
   - Implement session expiration
   - Add token refresh mechanism

## Environment Variables

```env
# Required for authentication to work
VITE_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com

# Backend API
VITE_API_URL=https://api.openclawpay.ai
```

## Key Files

1. **Authentication Core**
   - `src/contexts/AuthContext.tsx` - Auth state management
   - `src/components/ProtectedRoute.tsx` - Route guard

2. **UI Components**
   - `src/pages/Login.tsx` - Login page
   - `src/pages/Dashboard.tsx` - Protected dashboard (with user profile)

3. **Configuration**
   - `.env` - Environment variables
   - `.env.example` - Template for required vars

---

This diagram shows the complete authentication flow from initial page load through login, session persistence, and agent creation with user ownership tracking.
