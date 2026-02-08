# OpenClaw Pay - Admin Dashboard

**INTERNAL USE ONLY** - Platform administration interface for managing the entire OpenClaw Pay ecosystem.

## Features

### Platform-Wide Analytics
- Total users/agent owners registered
- Total agents across all users
- Total transaction volume (all time, 30d, 7d, 24h)
- Total value locked (TVL)
- Revenue metrics
- Active users (DAU/MAU)
- Interactive charts and visualizations

### User Management
- List all users with search and filtering
- View detailed user information
- Agent count and balance per user
- Suspend/activate user accounts
- View KYC verification status
- Track user activity

### Agent Management
- List all agents across all users
- Search and filter agents
- View agent details and wallet information
- Transaction history per agent
- Verification status tracking

### Transaction Monitoring
- View all platform transactions
- Filter by status, user, agent, amount
- Flag suspicious transactions
- Export transactions to CSV
- Real-time transaction monitoring

### System Health
- API uptime monitoring
- HIFI API status
- Error rate tracking
- Response time metrics
- Active connection count
- Service status dashboard
- Performance metrics

### Configuration
- Manage API keys (HIFI integration)
- Configure rate limits
- Feature flags (signup, KYC, maintenance mode)
- System settings (transaction limits, fees)
- Auto-flagging thresholds

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (custom admin dark theme)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router DOM

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   ```
   VITE_API_URL=http://localhost:3000
   VITE_ADMIN_PASSWORD=your-secure-admin-password
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Admin dashboard will be available at `http://localhost:5174`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Security

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Password Protection:** Currently uses simple password authentication via environment variable. This is suitable for internal use only.

2. **Production Deployment:**
   - Always use HTTPS
   - Set a strong admin password
   - Restrict access by IP if possible
   - Consider adding 2FA for production use
   - Add session timeout for inactive sessions

3. **Warning Banner:** "INTERNAL USE ONLY" banner displayed on all pages to prevent accidental public exposure.

4. **Future Improvements:**
   - Implement proper role-based access control (RBAC)
   - Add audit logging for all admin actions
   - Multi-factor authentication
   - OAuth integration for admin users
   - API key rotation

## Backend Integration

The admin dashboard requires corresponding admin endpoints in the backend API:

```typescript
// Required endpoints (to be implemented):
GET  /api/admin/stats              // Platform-wide analytics
GET  /api/admin/users              // List all users
GET  /api/admin/users/:id          // User details
POST /api/admin/users/:id/suspend  // Suspend user
POST /api/admin/users/:id/activate // Activate user
GET  /api/admin/agents             // List all agents
GET  /api/admin/transactions       // List all transactions
POST /api/admin/transactions/:id/flag  // Flag transaction
GET  /api/admin/transactions/export    // Export CSV
GET  /api/admin/activity           // Activity logs
GET  /api/admin/health             // System health
GET  /api/admin/config             // Get configuration
PUT  /api/admin/config             // Update configuration
```

## Design Philosophy

### Admin-Focused Dark Theme
- **Color Palette:**
  - Background: `#0a0e1a` (darker than user dashboard)
  - Surface: `#0f1419`
  - Cards: `#16191f`
  - Borders: `#1f2937`
  - Text: `#e2e8f0`
  - Muted: `#64748b`

- **Data-Dense Layout:** Maximized information display with efficient use of space
- **Technical Aesthetic:** Monospace fonts for IDs, hex colors, addresses
- **Status Indicators:** Clear color coding (green/yellow/red) for statuses
- **Warning Banners:** Red banner at top indicating internal use only

### Differences from User Dashboard
- Darker, more technical color scheme
- More data per page
- No "friendly" marketing language
- Focus on monitoring and control
- System-level metrics and controls

## File Structure

```
admin/
├── src/
│   ├── api/
│   │   └── client.ts          # API client for admin endpoints
│   ├── components/
│   │   ├── Layout.tsx         # Admin layout with sidebar
│   │   └── StatCard.tsx       # Reusable stat card component
│   ├── pages/
│   │   ├── Login.tsx          # Admin login page
│   │   ├── Dashboard.tsx      # Platform overview
│   │   ├── Users.tsx          # User management
│   │   ├── Agents.tsx         # Agent management
│   │   ├── Transactions.tsx   # Transaction monitoring
│   │   ├── SystemHealth.tsx   # Health monitoring
│   │   └── Configuration.tsx  # Platform configuration
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Usage

### Login
- Navigate to the admin dashboard URL
- Enter the admin password (from `VITE_ADMIN_PASSWORD`)
- Session is stored in `sessionStorage`

### Navigation
- Use the sidebar to navigate between sections
- Dashboard shows overview and recent activity
- Each section has dedicated filtering and search

### Managing Users
- Search users by email, name, or ID
- Filter by status (active/suspended)
- View detailed user information
- Suspend or activate accounts

### Monitoring Transactions
- View all platform transactions
- Filter by status, search by ID/memo
- Flag suspicious transactions
- Export filtered results to CSV

### System Health
- Real-time monitoring of service status
- Performance metrics and charts
- Service status indicators

### Configuration
- Update API keys securely
- Adjust rate limits
- Toggle feature flags
- Set transaction limits and fees

## Development

### Mock Data
Currently uses mock/demo data for:
- Chart data in Dashboard
- Some system metrics in System Health

### Adding Admin Endpoints
When implementing backend endpoints:

1. Update `/backend/src/api/routes.ts` with admin routes
2. Add authentication middleware for admin endpoints
3. Implement proper authorization checks
4. Add audit logging for sensitive operations

### Customization
- Colors: Edit `tailwind.config.js`
- Add new pages: Create in `src/pages/` and add route in `App.tsx`
- Add features: Create components in `src/components/`

## Roadmap

- [ ] Implement backend admin endpoints
- [ ] Add proper authentication (OAuth/JWT)
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Automated alerting
- [ ] Bulk operations
- [ ] Data export tools
- [ ] A/B testing controls

## License

Private - Internal Use Only
