# Architecture - Agent Finance Infrastructure Layer

## Vision

**Enable AI agents to transact with each other autonomously through a unified financial API layer.**

This is not a user-facing payment app — it's **infrastructure for AI agents** to handle money programmatically.

## Core Concept

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  AI Agent A │────────▶│   Agent     │◀────────│  AI Agent B │
│  (OpenClaw) │         │   Finance   │         │  (Any AI)   │
└─────────────┘         │   Layer     │         └─────────────┘
                        └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ HIFI Bridge │
                        │     API     │
                        └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │ Financial   │
                        │   Rails     │
                        └─────────────┘
```

## What This Enables

### Agent-to-Agent Transactions
- Agent A pays Agent B for a service
- Agent B sends funds to Agent C for a task
- Automated payment flows between autonomous agents
- No human intervention required

### Use Cases
- **AI Service Marketplace**: Agents pay each other for API calls, compute, data
- **Autonomous Contractors**: Hire agents, pay upon completion
- **Agent DAOs**: Collective funds managed by agent consensus
- **Cross-Agent Settlements**: Multi-agent workflows with automated payments
- **Micropayments**: Pay-per-token, pay-per-query agent interactions

## Architecture Layers

### 1. **Agent Finance API** (This Project)
**What:** Simple, agent-friendly wrapper around HIFI Bridge
**Why:** Abstract complexity, provide agent-centric methods

```javascript
// Instead of complex HIFI calls:
await agentFinance.sendPayment({
  from: "agent-shade",
  to: "agent-worker-123", 
  amount: 5.00,
  currency: "USDC",
  memo: "Payment for data processing task"
});
```

### 2. **HIFI Bridge** (External Service)
**What:** Underlying financial infrastructure
**Handles:** 
- User/agent identity (KYC/KYB)
- Virtual accounts
- Custodial wallets
- Fiat ↔ Crypto conversion
- Multi-chain transfers
- Bank connectivity

### 3. **Financial Rails**
**What:** Actual money movement
- ACH/Wire (fiat)
- Blockchain networks (crypto)
- Stablecoin protocols

## Agent Finance Layer Responsibilities

### Core Functions

#### 1. Agent Identity Management
```javascript
// Create an agent identity in the financial system
createAgent(agentId, metadata) → AgentAccount
getAgent(agentId) → AgentAccount
verifyAgent(agentId, kycData) → VerificationStatus
```

#### 2. Account & Wallet Management
```javascript
// Provision virtual accounts and wallets for agents
createVirtualAccount(agentId, currency) → VirtualAccount
createWallet(agentId, chain) → Wallet
getBalance(agentId) → Balances
```

#### 3. Agent-to-Agent Transfers
```javascript
// Enable direct agent-to-agent payments
sendPayment(fromAgent, toAgent, amount, currency, memo)
requestPayment(fromAgent, toAgent, amount, currency, reason)
scheduledPayment(fromAgent, toAgent, amount, schedule)
```

#### 4. Fiat/Crypto Conversion
```javascript
// Allow agents to convert between fiat and crypto
onramp(agentId, amount, fromCurrency, toCrypto) → Transaction
offramp(agentId, amount, fromCrypto, toCurrency) → Transaction
```

#### 5. Transaction History & Monitoring
```javascript
// Track agent financial activity
getTransactions(agentId, filters) → Transaction[]
getTransaction(txId) → Transaction
subscribeToEvents(agentId, callback) → Subscription
```

#### 6. Smart Contracts & Escrow
```javascript
// Enable trustless agent-to-agent contracts
createEscrow(fromAgent, toAgent, amount, conditions)
releaseEscrow(escrowId, proof)
refundEscrow(escrowId)
```

## API Design Principles

### 1. Agent-First
- Methods named for agent actions, not financial jargon
- Simple, predictable interfaces
- Clear error messages

### 2. Asynchronous & Event-Driven
- All operations return promises
- Webhook support for status updates
- Long-running operations tracked via IDs

### 3. Secure by Default
- API keys required
- Agent identity verification
- Transaction signing
- Audit logging

### 4. Idempotent
- Same request ID = same result
- Prevent duplicate payments
- Safe to retry

### 5. Multi-Currency
- Support fiat (USD, EUR, etc.)
- Support stablecoins (USDC, USDT)
- Support native crypto (ETH, MATIC)

## Technology Stack

### Backend (API Layer)
- **Language:** TypeScript/Node.js
- **Framework:** Express or Fastify
- **SDK:** HIFI Bridge SDK
- **Database:** PostgreSQL (agent accounts, transaction logs)
- **Queue:** Redis/BullMQ (async operations)
- **Auth:** API keys + JWT for agents

### Frontend (Dashboard)
- **Framework:** React + TypeScript
- **UI:** Tailwind CSS
- **Charts:** Recharts or D3
- **Purpose:** Monitor agent activity, manage identities

### Infrastructure
- **Hosting:** Vercel (frontend), Railway/Fly.io (backend)
- **Secrets:** Environment variables
- **Logs:** Datadog or Sentry
- **Webhooks:** ngrok (dev), CloudFlare Workers (prod)

## Data Models

### Agent
```typescript
interface Agent {
  id: string;                    // agent-shade
  name: string;                  // Shade
  type: 'openclaw' | 'custom';
  hifiUserId: string;            // HIFI user ID
  wallets: Wallet[];
  accounts: VirtualAccount[];
  verified: boolean;
  createdAt: Date;
  metadata: Record<string, any>;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  fromAgent: string;
  toAgent: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  memo?: string;
  hifiTransferId?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

### Wallet
```typescript
interface Wallet {
  id: string;
  agentId: string;
  address: string;
  chain: 'ethereum' | 'polygon' | 'base';
  balance: Balance[];
  hifiWalletId: string;
}
```

## Security Considerations

### Agent Authentication
- Each agent has unique API key
- API keys scoped to specific agents
- Rate limiting per agent

### Transaction Limits
- Daily/weekly limits per agent
- Require approval for large transfers
- Velocity checks (unusual activity detection)

### Audit Trail
- Log all financial operations
- Immutable transaction records
- Webhook notifications for all state changes

### Compliance
- KYC/KYB for agent owners
- Transaction monitoring
- Sanctions screening via HIFI

## Deployment Strategy

### Phase 1: Core Infrastructure (Current)
- [ ] HIFI SDK integration
- [ ] Agent identity management
- [ ] Basic transfer API
- [ ] Dashboard for monitoring

### Phase 2: Agent Integration
- [ ] OpenClaw plugin/skill
- [ ] REST API for external agents
- [ ] Webhook delivery system
- [ ] Transaction history API

### Phase 3: Advanced Features
- [ ] Escrow contracts
- [ ] Scheduled payments
- [ ] Multi-agent splits
- [ ] Conditional transfers

### Phase 4: Scale
- [ ] Multi-region deployment
- [ ] High availability
- [ ] Performance optimization
- [ ] Enterprise features

## Getting Started (For Agents)

```javascript
// 1. Register agent
const agent = await agentFinance.register({
  agentId: 'my-agent-123',
  name: 'MyAgent',
  email: '[email protected]'
});

// 2. Fund the agent (onramp fiat to USDC)
await agentFinance.onramp({
  agentId: 'my-agent-123',
  amount: 100,
  currency: 'USD',
  toToken: 'USDC'
});

// 3. Send payment to another agent
await agentFinance.send({
  from: 'my-agent-123',
  to: 'agent-worker-456',
  amount: 5,
  currency: 'USDC',
  memo: 'Task completed'
});

// 4. Check balance
const balance = await agentFinance.getBalance('my-agent-123');
console.log(balance); // { USDC: 95.00 }
```

---

**This is infrastructure, not a consumer app.** We're building the financial plumbing for an autonomous agent economy.
