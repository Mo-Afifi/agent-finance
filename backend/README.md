# OpenClaw Pay Backend

**Financial infrastructure for AI agent-to-agent payments**

This backend provides a TypeScript SDK and REST API that wraps HIFI Bridge APIs with agent-friendly methods, enabling autonomous AI agents to transact with each other.

---

## 🏗️ Architecture

```
┌─────────────────┐
│  AI Agents      │
│  (OpenClaw etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OpenClaw Pay   │ ◄── TypeScript SDK
│ REST API        │ ◄── HTTP Endpoints
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HIFI Bridge API │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Financial Rails │
│ (Blockchain,    │
│  Bank Networks) │
└─────────────────┘
```

## 🚀 Features

### TypeScript SDK
- **Agent Identity Management**: Register, verify, and manage agent accounts
- **Wallet Operations**: Multi-chain wallet provisioning (Ethereum, Polygon, Base)
- **Agent-to-Agent Transfers**: Direct crypto payments between agents
- **Fiat/Crypto Conversion**: Onramp (USD → USDC) and Offramp (USDC → USD)
- **Bank Account Management**: Link bank accounts for withdrawals
- **Transaction History**: Query and track all financial operations
- **Webhook Support**: Real-time event notifications

### REST API Server
- **Fastify-based**: High-performance HTTP server
- **Rate Limiting**: Prevent abuse
- **CORS & Security**: Production-ready security headers
- **Comprehensive Error Handling**: Detailed error responses
- **Health Checks**: Monitor service availability
- **OpenAPI Documentation**: Auto-generated API docs

---

## 📦 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

Create or update `/root/.openclaw/workspace/.env`:

```env
# HIFI Bridge Configuration
HIFI_API_KEY=zpka_your_api_key_here
HIFI_ENVIRONMENT=sandbox
HIFI_BASE_URL=https://sandbox.hifibridge.com

# API Server Configuration
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info
CORS_ORIGIN=*

# Webhook Configuration (optional)
WEBHOOK_PUBLIC_KEY=your_webhook_public_key
```

## 🏃 Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

---

## 📚 SDK Usage

### Initialize SDK

```typescript
import { AgentFinanceSDK } from '@agent-finance/backend';

const sdk = new AgentFinanceSDK({
  apiKey: process.env.HIFI_API_KEY!,
  baseUrl: process.env.HIFI_BASE_URL!,
  environment: 'sandbox',
});
```

### Register an Agent

```typescript
const agent = await sdk.registerAgent({
  agentId: 'my-agent-123',
  name: 'My AI Agent',
  email: '[email protected]',
  type: 'individual',
});

console.log('Agent registered:', agent);
// {
//   agentId: 'my-agent-123',
//   hifiUserId: 'abc-def-ghi',
//   wallets: {
//     POLYGON: '0x1234567890abcdef...',
//     ETHEREUM: '0x1234567890abcdef...'
//   },
//   verified: false
// }
```

### Send Payment Between Agents

```typescript
const payment = await sdk.sendPayment({
  from: 'agent-alice',
  to: 'agent-bob',
  amount: 5.00,
  currency: 'USDC',
  chain: 'POLYGON',
  memo: 'Payment for API service',
});

console.log('Payment sent:', payment.transferDetails.id);
```

### Create Deposit Account (Onramp)

```typescript
const depositAccount = await sdk.createDepositAccount('my-agent-123', {
  fiatCurrency: 'usd',
  cryptoCurrency: 'usdc',
  chain: 'POLYGON',
});

console.log('Deposit instructions:', depositAccount.depositInstructions);
// Use these bank details to deposit USD, which auto-converts to USDC
```

### Withdraw to Bank (Offramp)

```typescript
// First, register bank account
const bankAccount = await sdk.registerBankAccount('my-agent-123', {
  accountType: 'checking',
  accountNumber: '123456789',
  routingNumber: '021000021',
  bankName: 'Chase Bank',
  accountHolderName: 'My AI Agent',
});

// Then withdraw
const withdrawal = await sdk.withdrawToFiat('my-agent-123', 100, bankAccount.id, {
  cryptoCurrency: 'usdc',
  fiatCurrency: 'usd',
  chain: 'POLYGON',
});
```

### Get Agent Wallets

```typescript
const wallets = await sdk.getWallets('my-agent-123');
console.log('Wallet addresses:', wallets);
// {
//   POLYGON: '0x...',
//   ETHEREUM: '0x...'
// }
```

### List Transaction History

```typescript
const payments = await sdk.listPayments('my-agent-123', 50);
console.log('Recent payments:', payments);
```

---

## 🌐 REST API Endpoints

Base URL: `http://localhost:3000`

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T14:00:00.000Z",
  "service": "agent-finance-api"
}
```

---

### Agent Registration

#### Register New Agent
```http
POST /api/agents/register
Content-Type: application/json

{
  "agentId": "my-agent-123",
  "name": "My AI Agent",
  "email": "[email protected]",
  "type": "individual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "my-agent-123",
    "hifiUserId": "abc-123",
    "name": "My AI Agent",
    "email": "[email protected]",
    "wallets": {
      "POLYGON": "0x...",
      "ETHEREUM": "0x..."
    },
    "verified": false,
    "createdAt": "2026-02-08T14:00:00.000Z"
  }
}
```

#### Get Agent
```http
GET /api/agents/:agentId
```

#### Initiate KYC Verification
```http
POST /api/agents/:agentId/verify
Content-Type: application/json

{
  "redirectUrl": "https://myapp.com/kyc-complete"
}
```

#### Check Verification Status
```http
GET /api/agents/:agentId/verification-status
```

---

### Wallets & Accounts

#### Get Wallets
```http
GET /api/agents/:agentId/wallets
```

#### Create Deposit Account
```http
POST /api/accounts/deposit
Content-Type: application/json

{
  "agentId": "my-agent-123",
  "fiatCurrency": "usd",
  "cryptoCurrency": "usdc",
  "chain": "POLYGON"
}
```

#### Register Bank Account
```http
POST /api/accounts/bank
Content-Type: application/json

{
  "agentId": "my-agent-123",
  "accountType": "checking",
  "accountNumber": "123456789",
  "routingNumber": "021000021",
  "bankName": "Chase Bank",
  "accountHolderName": "My AI Agent"
}
```

---

### Payments

#### Send Payment
```http
POST /api/payments/send
Content-Type: application/json

{
  "from": "agent-alice",
  "to": "agent-bob",
  "amount": 5.00,
  "currency": "USDC",
  "chain": "POLYGON",
  "memo": "Payment for service"
}
```

#### Get Payment Status
```http
GET /api/payments/:paymentId
```

#### List Agent Payments
```http
GET /api/agents/:agentId/payments?limit=20
```

---

### Fiat/Crypto Conversion

#### Deposit Fiat (Onramp)
```http
POST /api/deposit/fiat
Content-Type: application/json

{
  "agentId": "my-agent-123",
  "amount": 100,
  "fiatCurrency": "usd",
  "cryptoCurrency": "usdc",
  "chain": "POLYGON"
}
```

#### Withdraw to Fiat (Offramp)
```http
POST /api/withdraw/fiat
Content-Type: application/json

{
  "agentId": "my-agent-123",
  "amount": 100,
  "bankAccountId": "bank-abc-123",
  "cryptoCurrency": "usdc",
  "fiatCurrency": "usd",
  "chain": "POLYGON"
}
```

---

## 🪝 Webhooks

The backend supports HIFI Bridge webhook events for real-time notifications.

### Setup Webhook Handler

```typescript
import { WebhookManager } from '@agent-finance/backend';

const webhookManager = new WebhookManager(process.env.WEBHOOK_PUBLIC_KEY);

// Register handlers
webhookManager.on('WALLET.TRANSFER.UPDATE', async (event) => {
  console.log('Payment status changed:', event.data);
  // Update your database, notify agent, etc.
});

webhookManager.on('ONRAMP.UPDATE', async (event) => {
  console.log('Deposit processed:', event.data);
});

webhookManager.on('KYC.STATUS_UPDATE', async (event) => {
  console.log('Verification status changed:', event.data);
});

// Register webhook endpoint
webhookManager.registerEndpoint(app, '/webhooks/hifi');
```

### Supported Events

- `USER.CREATE` - New user/agent created
- `USER.UPDATE` - User information updated
- `KYC.CREATE` - KYC application submitted
- `KYC.STATUS_UPDATE` - KYC status changed
- `WALLET.TRANSFER.CREATE` - Payment initiated
- `WALLET.TRANSFER.UPDATE` - Payment status updated
- `WALLET.BALANCE.UPDATE` - Wallet balance changed
- `ACCOUNT.CREATE` - Account created
- `ACCOUNT.UPDATE` - Account status updated
- `ONRAMP.CREATE` - Deposit initiated
- `ONRAMP.UPDATE` - Deposit status updated
- `OFFRAMP.CREATE` - Withdrawal initiated
- `OFFRAMP.UPDATE` - Withdrawal status updated

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Example Test
```typescript
import { AgentFinanceSDK } from '../src/sdk/agent-finance';

describe('AgentFinanceSDK', () => {
  it('should register a new agent', async () => {
    const sdk = new AgentFinanceSDK(config);
    
    const agent = await sdk.registerAgent({
      agentId: 'test-agent',
      name: 'Test Agent',
      email: '[email protected]',
      type: 'individual',
    });
    
    expect(agent.agentId).toBe('test-agent');
  });
});
```

---

## 📖 API Reference

See [OpenAPI Specification](./openapi.yaml) for complete API documentation.

---

## 🔒 Security

- **API Key Authentication**: All HIFI API calls require valid API key
- **Rate Limiting**: 100 requests per minute per IP
- **CORS**: Configurable origin restrictions
- **Helmet**: Security headers enabled
- **Webhook Signature Verification**: JWT-based webhook authentication
- **Input Validation**: Zod schema validation on all inputs

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── sdk/
│   │   ├── types.ts              # TypeScript type definitions
│   │   ├── hifi-client.ts        # Low-level HIFI Bridge client
│   │   └── agent-finance.ts      # High-level agent SDK
│   ├── api/
│   │   └── routes.ts             # REST API route handlers
│   ├── webhooks/
│   │   └── handler.ts            # Webhook management
│   ├── server.ts                 # Fastify server setup
│   └── index.ts                  # Main export
├── tests/
│   └── sdk.test.ts               # SDK tests
├── package.json
├── tsconfig.json
├── jest.config.js
├── README.md
└── openapi.yaml                  # OpenAPI spec
```

---

## 🚢 Deployment

### Docker (Recommended)

```bash
docker build -t agent-finance-backend .
docker run -p 3000:3000 --env-file .env agent-finance-backend
```

### Railway / Fly.io

```bash
# Railway
railway up

# Fly.io
fly deploy
```

---

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update OpenAPI spec when adding endpoints
4. Run `npm run lint` before committing

---

## 📄 License

MIT

---

## 🔗 Related Resources

- [HIFI Bridge API Documentation](../docs/HIFI_API_REFERENCE.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [OpenAPI Specification](./openapi.yaml)

---

**Built for the autonomous agent economy** 🤖💰
# Trigger deployment
