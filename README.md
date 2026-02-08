# Agent Finance - Agentic Infrastructure Layer

**Smart Agent Cash Management System**

Integration of AI agents with HIFI Bridge for programmable finance operations.

## Project Components

### 1. Smart Agent Cash App (Frontend)
- **Platform:** Lovable
- **URL:** https://smart-agent-cash.lovable.app
- **Purpose:** User-facing application for agent-driven financial operations

### 2. Agent Finance Dashboard (Admin)
- **Platform:** Vercel
- **URL:** https://vercel.com/mos-projects-c7a0da8e/agent-finance-dashboard
- **Purpose:** Administrative dashboard for monitoring and management

### 3. HIFI Bridge Backend Integration
- **API:** HIFI Bridge
- **Environment:** Sandbox (development/testing)
- **Docs:** https://docs.hifibridge.com

## Technology Stack

- **Frontend:** React/TypeScript (Lovable/Vercel)
- **Backend:** HIFI Bridge API
- **Agent Framework:** OpenClaw
- **Payment Rails:** HIFI (Fiat ↔ Crypto, Wallets, Transfers)

## Features

Based on HIFI Bridge capabilities:
- User management and KYC verification
- Virtual account provisioning
- Custodial wallet generation
- Fiat-to-crypto conversions (Onramp)
- Crypto-to-fiat conversions (Offramp)
- Wallet-to-wallet transfers
- Multi-chain support
- Automated fund flows
- Real-time webhooks

## Setup

### Prerequisites
- Node.js 18+
- HIFI Bridge API key (Sandbox or Production)
- GitHub access

### Environment Variables

Create `.env` file:
```bash
HIFI_API_KEY=your_api_key_here
HIFI_ENVIRONMENT=sandbox
HIFI_BASE_URL=https://sandbox.hifibridge.com
```

### Installation

```bash
# Clone repository
git clone git@github.com:Mo-Afifi/agent-finance.git
cd agent-finance

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Status

🔄 **Currently rebuilding from scratch**
- Previous implementation lost due to session reset
- Rebuilding with proper version control
- Focus on modular, documented architecture

## Documentation

- [HIFI API Reference](./docs/HIFI_API_REFERENCE.md) - Complete HIFI Bridge API documentation
- [Rebuild Plan](./REBUILD_PLAN.md) - Step-by-step rebuild strategy

## Team

- **Developer:** Mo Afifi (@Mo-Afifi)
- **Agent:** Shade (OpenClaw)

## License

TBD
