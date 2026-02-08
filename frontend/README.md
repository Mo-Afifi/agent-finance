# Agent Finance Dashboard

Management interface for the Agent Finance infrastructure layer.

> **Note**: The landing page is hosted separately on [Lovable](https://smart-agent-cash.lovable.app). This app is the **Dashboard only**.

## Features

### Dashboard
- **Agent Management**: View and register AI agents
- **Balance Monitoring**: Track virtual accounts and wallet balances
- **Transaction History**: Complete audit trail of agent-to-agent transfers
- **Real-time Activity**: Live feed of all financial events
- **Statistics**: Key metrics and trends

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - API client
- **Recharts** - Data visualization
- **Lucide React** - Icon library

## Setup

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see parent README)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your backend API URL (default: http://localhost:3000)
```

### Development

```bash
# Start dev server with hot reload
npm run dev
```

The dashboard will be available at `http://localhost:5173`

The landing page at [https://smart-agent-cash.lovable.app](https://smart-agent-cash.lovable.app) will link to this dashboard when deployed.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file with:

```env
VITE_API_URL=http://localhost:3000
```

- **VITE_API_URL**: Backend API endpoint (default: http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts          # API client and type definitions
│   ├── components/
│   │   ├── AgentsList.tsx     # Agent management component
│   │   ├── TransactionHistory.tsx
│   │   ├── ActivityFeed.tsx   # Real-time activity stream
│   │   ├── CreateAgentModal.tsx
│   │   └── StatsCard.tsx      # Reusable stats display
│   ├── pages/
│   │   └── Dashboard.tsx      # Main dashboard (default route)
│   ├── App.tsx                # Router configuration
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles + Tailwind
├── public/
├── .env                       # Environment variables (gitignored)
├── .env.example               # Environment template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## API Integration

The frontend expects the following API endpoints:

### Agents
- `GET /agents` - List all agents
- `GET /agents/:id` - Get agent details
- `POST /agents` - Register new agent
- `GET /agents/:id/balances` - Get agent balances

### Transactions
- `GET /transactions` - List transactions (with filters)
- `POST /transactions` - Create transaction

### Activity
- `GET /activity` - Get activity feed

### Wallets & Accounts
- `POST /agents/:id/wallets` - Create wallet
- `POST /agents/:id/accounts` - Create virtual account

See `src/api/client.ts` for full type definitions.

## Features in Detail

### Dashboard Components

#### Stats Overview
- Total balance across all agents
- Active agent count
- Transaction volume
- Real-time trends

#### Agents List
- View all registered agents
- Expandable details showing wallets and accounts
- Balance breakdown by currency
- Verification status indicators

#### Transaction History
- Chronological list of all transfers
- Status indicators (pending, completed, failed)
- Search and filter capabilities
- Agent-to-agent flow visualization

#### Activity Feed
- Real-time updates
- Event categorization
- Timestamp formatting
- Sticky sidebar for easy monitoring

### Creating Agents
- Modal form for registration
- Validation and error handling
- Support for OpenClaw and custom agents
- Email integration for notifications

## Styling

Uses Tailwind CSS with custom theme:

- **Primary Color**: Blue (financial trust)
- **Dark Mode**: Slate backgrounds
- **Accent Colors**: Green (positive), Red (negative), Yellow (pending)
- **Typography**: System fonts for performance

## Development Tips

### Hot Reload
Vite provides instant hot module replacement. Changes appear immediately.

### TypeScript
All components are fully typed. The API client exports interfaces for:
- `Agent`
- `Transaction`
- `Activity`
- `Wallet`
- `VirtualAccount`
- `Balance`

### Mock Data
To develop without a backend, modify `src/api/client.ts` to return mock data:

```typescript
export const agentFinanceAPI = {
  getAgents: async (): Promise<Agent[]> => {
    return [
      {
        id: 'agent-shade',
        name: 'Shade',
        type: 'openclaw',
        hifiUserId: 'user123',
        wallets: [],
        accounts: [{ id: '1', agentId: 'agent-shade', currency: 'USD', balance: 100 }],
        verified: true,
        createdAt: new Date().toISOString(),
        metadata: {},
      },
    ];
  },
  // ... other methods
};
```

### Icons
Lucide React provides high-quality icons. Import as needed:

```typescript
import { Icon1, Icon2 } from 'lucide-react';
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

Build the static files and serve:

```bash
npm run build
# Deploy the 'dist' folder
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 14+
- Mobile browsers

## Contributing

1. Follow the existing code style
2. Use TypeScript types
3. Keep components focused and reusable
4. Test on multiple screen sizes
5. Commit with clear messages

## License

See parent project LICENSE.

---

**Built for the autonomous agent economy 🤖💰**
