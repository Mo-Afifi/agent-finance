# Admin Dashboard Quick Start

## What is This?

The **OpenClaw Pay Admin Dashboard** is an internal platform management tool for Mo and the team to oversee the entire OpenClaw Pay platform.

This is **NOT** the user-facing dashboard - it's a separate admin-only interface with full platform visibility and control.

## What Can You Do?

✅ **Monitor Platform Health**
- View total users, agents, transactions
- Track Total Value Locked (TVL) and revenue
- Monitor active users (DAU/MAU)
- Real-time system health metrics

✅ **Manage Users**
- Search and filter all users
- View user details, agents, balances
- Suspend or activate accounts
- Check KYC verification status

✅ **Oversee Agents**
- See all agents across all users
- Search by name, email, ID
- View agent balances and accounts
- Track verification status

✅ **Monitor Transactions**
- View all platform transactions
- Filter by status, amount, user
- Flag suspicious activity
- Export transaction data to CSV

✅ **System Administration**
- Monitor API uptime and performance
- Check HIFI API status
- View error rates and response times
- Track active connections

✅ **Configure Platform**
- Manage API keys
- Set rate limits
- Toggle feature flags
- Configure transaction limits and fees

## Get Started in 3 Steps

### 1. Install Dependencies

```bash
cd /root/.openclaw/workspace/agent-finance/admin
npm install
```

### 2. Start the Admin Dashboard

```bash
npm run dev
```

The admin dashboard will start on **http://localhost:5174**

### 3. Login

Open http://localhost:5174 in your browser

**Default Password:** `openclaw_admin_2026`

⚠️ **IMPORTANT:** Change this password before deploying to production!

## Quick Tour

### Dashboard (Home)
- Platform overview with key metrics
- Transaction volume chart (7 days)
- Recent activity feed
- Quick stats (volume, revenue)

### Users Page
- Search users by email, name, or ID
- Filter by status (active/suspended)
- View user details
- Suspend or activate accounts

### Agents Page
- List all agents across all users
- Filter by verification status
- Search by name, email, or ID
- View agent accounts and balances

### Transactions Page
- Monitor all platform transactions
- Filter by status (completed/pending/failed)
- Flag suspicious transactions
- Export to CSV for analysis

### System Health Page
- Service status (API, HIFI, Database, Cache)
- Response time charts
- System information
- Performance metrics

### Configuration Page
- Update API keys (HIFI integration)
- Set rate limits (per minute/hour/day)
- Toggle features (signup, KYC, maintenance mode)
- Configure transaction limits and fees

## Security Notes

🔒 **This is an INTERNAL tool:**
- Red warning banner on every page
- Password protected (simple auth for now)
- Should be deployed behind VPN or IP whitelist
- NOT for public access

⚠️ **Before Production:**
1. Change the admin password in `.env`
2. Deploy behind HTTPS
3. Add IP whitelisting
4. Consider VPN access only
5. Enable audit logging

## Backend Integration

The admin dashboard connects to these backend endpoints:

```
GET  /api/admin/stats              - Platform analytics
GET  /api/admin/users              - List users
POST /api/admin/users/:id/suspend  - Suspend user
POST /api/admin/users/:id/activate - Activate user
GET  /api/admin/agents             - List agents
GET  /api/admin/transactions       - List transactions
POST /api/admin/transactions/:id/flag - Flag transaction
GET  /api/admin/transactions/export - Export CSV
GET  /api/admin/activity           - Activity logs
GET  /api/admin/health             - System health
GET  /api/admin/config             - Configuration
PUT  /api/admin/config             - Update config
```

Currently uses **mock data** - when you connect to a real backend with these endpoints, it will show real platform data.

## Troubleshooting

### Can't start the dashboard?
```bash
# Make sure you're in the admin folder
cd /root/.openclaw/workspace/agent-finance/admin

# Install dependencies
npm install

# Try again
npm run dev
```

### Wrong password?
Check the password in `.env`:
```bash
cat .env
# Should show: VITE_ADMIN_PASSWORD=openclaw_admin_2026
```

### No data showing?
The dashboard currently uses mock data. When backend admin endpoints are implemented with real data, the dashboard will show actual platform metrics.

### API errors?
Make sure the backend API is running:
```bash
cd /root/.openclaw/workspace/agent-finance/backend
npm run dev
```

## Next Steps

1. **Run the dashboard** - See it in action with mock data
2. **Implement backend endpoints** - Replace mock data with real platform data
3. **Customize branding** - Update colors, logo, etc.
4. **Add features** - Extend functionality as needed
5. **Deploy securely** - Follow DEPLOYMENT.md guide

## Files Overview

```
admin/
├── src/
│   ├── pages/           # Main pages
│   │   ├── Dashboard.tsx      # Platform overview
│   │   ├── Users.tsx          # User management
│   │   ├── Agents.tsx         # Agent management
│   │   ├── Transactions.tsx   # Transaction monitoring
│   │   ├── SystemHealth.tsx   # Health monitoring
│   │   └── Configuration.tsx  # Settings
│   ├── components/      # Reusable components
│   ├── api/            # API client
│   └── types/          # TypeScript types
├── .env                # Environment config
├── README.md           # Full documentation
├── DEPLOYMENT.md       # Production deployment guide
└── QUICKSTART.md       # This file
```

## Support

Questions? Check the docs:
- **README.md** - Full feature documentation
- **DEPLOYMENT.md** - Production deployment guide
- **Backend code** - `/backend/src/api/admin-routes.ts`

---

**Remember:** This is an **INTERNAL TOOL** for platform management. Keep it secure! 🔒
