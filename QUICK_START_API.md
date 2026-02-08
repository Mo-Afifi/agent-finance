# Quick Start: Using the Agent Finance API

## Start the Server

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3000
```

## 1. Register a User

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": "user_abc123...",
    "email": "you@example.com",
    "apiKey": "opay_xyz789...",
    "createdAt": "2026-02-08T..."
  }
}
```

**Save your API key!** You'll need it for authenticated requests.

## 2. List Your Agents

```bash
export API_KEY="opay_xyz789..."  # Use your actual key

curl http://localhost:3000/agents \
  -H "Authorization: Bearer $API_KEY"
```

Response (empty at first):
```json
[]
```

## 3. Create an Agent

```bash
curl -X POST http://localhost:3000/agents \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-agent-001",
    "name": "My First Agent",
    "email": "agent@example.com",
    "type": "individual"
  }'
```

Response:
```json
{
  "id": "my-agent-001",
  "name": "My First Agent",
  "type": "openclaw",
  "hifiUserId": "95a4facd-4ef7-5ac9-8e0c-1d107c2c2697",
  "wallets": [],
  "accounts": [],
  "verified": false,
  "createdAt": "2026-02-08T...",
  "metadata": {}
}
```

## 4. Create a Wallet (Mock)

```bash
curl -X POST http://localhost:3000/agents/my-agent-001/wallets \
  -H "Content-Type: application/json" \
  -d '{"chain": "ethereum"}'
```

Response:
```json
{
  "id": "wallet_1770573001895",
  "agentId": "my-agent-001",
  "address": "0x8a9f5e9038463",
  "chain": "ethereum",
  "balance": [],
  "hifiWalletId": ""
}
```

## 5. Create a Virtual Account (Mock)

```bash
curl -X POST http://localhost:3000/agents/my-agent-001/accounts \
  -H "Content-Type: application/json" \
  -d '{"currency": "USD"}'
```

Response:
```json
{
  "id": "vacct_1770573001904",
  "agentId": "my-agent-001",
  "currency": "USD",
  "balance": 0,
  "accountNumber": "1234567890",
  "routingNumber": "021000021"
}
```

## 6. Create a Transaction (Mock)

```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "fromAgent": "my-agent-001",
    "toAgent": "another-agent",
    "amount": 100,
    "currency": "USD",
    "memo": "Payment for services"
  }'
```

Response:
```json
{
  "id": "tx_1770573001874",
  "fromAgent": "my-agent-001",
  "toAgent": "another-agent",
  "amount": 100,
  "currency": "USD",
  "status": "pending",
  "memo": "Payment for services",
  "createdAt": "2026-02-08T..."
}
```

## 7. View Activity (Stub)

```bash
curl http://localhost:3000/activity
```

Response:
```json
[]
```

## 8. View Transactions (Stub)

```bash
curl http://localhost:3000/transactions
```

Response:
```json
[]
```

## 9. View Balances (Stub)

```bash
curl http://localhost:3000/agents/my-agent-001/balances
```

Response:
```json
[]
```

## All Available Endpoints

### User Management
- `POST /api/users/register` - Register/get user + API key
- `GET /api/users/me` - Get current user info (auth required)
- `GET /api/users/me/api-key` - Get your API key (auth required)
- `POST /api/users/me/api-key/regenerate` - Regenerate API key (auth required)

### Dashboard Endpoints
- `GET /agents` - List your agents (auth required)
- `POST /agents` - Create an agent (auth required)
- `GET /activity` - Activity feed (stub: returns [])
- `GET /transactions` - List transactions (stub: returns [])
- `POST /transactions` - Create transaction (mock)
- `GET /agents/:id/balances` - Get balances (stub: returns [])
- `POST /agents/:id/wallets` - Create wallet (mock)
- `POST /agents/:id/accounts` - Create virtual account (mock)

### Original API Endpoints (still available)
- `POST /api/agents/register` - Direct agent registration
- `GET /api/agents/:agentId` - Get agent details
- `POST /api/agents/:agentId/verify` - Start KYC verification
- `GET /api/agents/:agentId/verification-status` - Check KYC status
- `GET /api/agents/:agentId/wallets` - Get agent wallets
- `POST /api/accounts/deposit` - Create deposit account
- `POST /api/accounts/bank` - Register bank account
- `POST /api/payments/send` - Send payment
- `GET /api/payments/:paymentId` - Get payment status
- `GET /api/agents/:agentId/payments` - List agent payments
- `POST /api/deposit/fiat` - Deposit fiat (onramp)
- `POST /api/withdraw/fiat` - Withdraw to fiat (offramp)

## Authentication

### API Key Format
```
opay_<64-character-hex-string>
```

### How to Authenticate
```bash
# Option 1: Bearer token header (recommended)
curl http://localhost:3000/agents \
  -H "Authorization: Bearer opay_xyz789..."

# Option 2: X-API-Key header
curl http://localhost:3000/agents \
  -H "X-API-Key: opay_xyz789..."
```

## Test Script

Run the comprehensive test:
```bash
./test-dashboard-api.sh
```

This tests all endpoints and shows expected behavior.

## Status Legend

- ✅ **Working** - Fully implemented and functional
- 🔄 **Stub** - Returns empty array, ready for implementation
- 🎭 **Mock** - Returns realistic mock data for UI testing

## Notes

- **Stub endpoints** return `[]` to allow dashboard to show "empty state" UI
- **Mock endpoints** return realistic data structures for testing
- **Authenticated endpoints** require API key in Authorization header
- All responses match frontend TypeScript interfaces exactly
- No environment variables required for basic testing (uses sandbox mode)

## Next Steps

Once you have the dashboard loading correctly:
1. Implement real activity tracking (replace stub)
2. Implement real transaction history (replace stub)
3. Implement real balance fetching (replace stub)
4. Connect wallet/account creation to real HIFI SDK (replace mocks)

---

Happy testing! 🚀
