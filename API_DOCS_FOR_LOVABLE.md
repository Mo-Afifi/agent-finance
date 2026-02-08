# Agent Finance API Documentation

Build financial autonomy into your AI agents. Agent Finance provides a simple API for agent-to-agent payments, wallet management, and fiat/crypto conversion.

---

## Quick Start

### Base URL
```
https://api.agentfinance.io
```

### Authentication
All API requests require an API key in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

---

## Core Endpoints

### 🤖 Agent Management

#### Register New Agent
Create a financial identity for your AI agent.

**POST** `/api/agents/register`

```json
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
  "agent": {
    "agentId": "my-agent-123",
    "hifiUserId": "abc-123-def",
    "wallets": {
      "POLYGON": "0x1234...",
      "ETHEREUM": "0x5678..."
    },
    "verified": false
  }
}
```

---

#### Get Agent Info
**GET** `/api/agents/:agentId`

**Response:**
```json
{
  "success": true,
  "agent": {
    "agentId": "my-agent-123",
    "name": "My AI Agent",
    "verified": true,
    "wallets": [...],
    "accounts": [...]
  }
}
```

---

### 💰 Payments

#### Send Payment to Another Agent
**POST** `/api/payments/send`

```json
{
  "from": "agent-alice",
  "to": "agent-bob",
  "amount": 5.00,
  "currency": "USDC",
  "chain": "POLYGON",
  "memo": "Payment for API service"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_abc123",
    "status": "pending",
    "from": "agent-alice",
    "to": "agent-bob",
    "amount": 5.00,
    "currency": "USDC",
    "txHash": null
  }
}
```

---

#### Get Payment Status
**GET** `/api/payments/:paymentId`

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_abc123",
    "status": "completed",
    "from": "agent-alice",
    "to": "agent-bob",
    "amount": 5.00,
    "currency": "USDC",
    "txHash": "0xabc123...",
    "completedAt": "2026-02-08T14:20:00Z"
  }
}
```

---

#### List Payments
**GET** `/api/payments?agentId=my-agent-123&limit=20`

**Query Parameters:**
- `agentId` - Filter by agent (required)
- `limit` - Max results (default: 20)
- `status` - Filter by status: `pending`, `completed`, `failed`

---

### 👛 Wallets & Accounts

#### Get Agent Wallets
**GET** `/api/wallets/:agentId`

**Response:**
```json
{
  "success": true,
  "wallets": [
    {
      "chain": "POLYGON",
      "address": "0x1234...",
      "balances": [
        {
          "token": "USDC",
          "amount": "100.50"
        }
      ]
    }
  ]
}
```

---

#### Create Deposit Account
Create a virtual bank account for fiat deposits (onramp).

**POST** `/api/wallets/:agentId/accounts`

```json
{
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "acc_123",
    "currency": "USD",
    "accountNumber": "1234567890",
    "routingNumber": "021000021",
    "balance": "0.00"
  }
}
```

---

### 🔄 Fiat/Crypto Conversion

#### Deposit Fiat (Onramp)
Convert USD to USDC.

**POST** `/api/conversion/deposit`

```json
{
  "agentId": "my-agent-123",
  "amount": 100.00,
  "currency": "USD",
  "toToken": "USDC",
  "chain": "POLYGON"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "tx_abc123",
    "status": "pending",
    "amount": 100.00,
    "fromCurrency": "USD",
    "toToken": "USDC",
    "estimatedTokens": "100.00"
  }
}
```

---

#### Withdraw to Fiat (Offramp)
Convert USDC to USD and send to bank account.

**POST** `/api/conversion/withdraw`

```json
{
  "agentId": "my-agent-123",
  "amount": 50.00,
  "token": "USDC",
  "chain": "POLYGON",
  "bankAccountId": "bank_123"
}
```

---

### 🏦 Bank Account Management

#### Register Bank Account
**POST** `/api/wallets/:agentId/bank-accounts`

```json
{
  "accountNumber": "1234567890",
  "routingNumber": "021000021",
  "accountType": "checking",
  "accountHolderName": "Agent Owner Name"
}
```

---

### 📊 Transaction History

#### Get All Transactions
**GET** `/api/transactions/:agentId?limit=50&offset=0`

**Query Parameters:**
- `limit` - Results per page (max 100)
- `offset` - Pagination offset
- `type` - Filter: `payment`, `deposit`, `withdrawal`
- `status` - Filter: `pending`, `completed`, `failed`

---

### 🔍 Health & Status

#### Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T14:20:00Z",
  "service": "agent-finance-api"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

---

## Common Error Codes

| Code | Description |
|------|-------------|
| `AGENT_NOT_FOUND` | Agent ID does not exist |
| `INSUFFICIENT_BALANCE` | Not enough funds for transaction |
| `INVALID_CHAIN` | Unsupported blockchain |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `UNAUTHORIZED` | Invalid or missing API key |
| `VALIDATION_ERROR` | Invalid request parameters |

---

## Rate Limits

- **100 requests per minute** per API key
- **1,000 requests per hour** per API key

Exceeded limits return HTTP 429 with `Retry-After` header.

---

## Supported Chains

- **Ethereum** (ETH mainnet)
- **Polygon** (MATIC)
- **Base** (Coinbase L2)

---

## Supported Currencies

**Fiat:**
- USD (United States Dollar)

**Crypto:**
- USDC (USD Coin stablecoin)
- ETH (Ethereum)
- MATIC (Polygon)

More currencies coming soon!

---

## Webhooks

Subscribe to real-time events (coming soon):

- `payment.completed`
- `payment.failed`
- `deposit.completed`
- `withdrawal.completed`
- `kyc.approved`
- `kyc.rejected`

Configure webhook endpoints in your dashboard.

---

## Code Examples

### Python
```python
import requests

API_KEY = "your_api_key"
BASE_URL = "https://api.agentfinance.io"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Register agent
response = requests.post(
    f"{BASE_URL}/api/agents/register",
    headers=headers,
    json={
        "agentId": "my-agent",
        "name": "My Agent",
        "email": "[email protected]"
    }
)
print(response.json())

# Send payment
response = requests.post(
    f"{BASE_URL}/api/payments/send",
    headers=headers,
    json={
        "from": "agent-alice",
        "to": "agent-bob",
        "amount": 5.0,
        "currency": "USDC",
        "chain": "POLYGON"
    }
)
print(response.json())
```

### JavaScript/TypeScript
```javascript
const API_KEY = "your_api_key";
const BASE_URL = "https://api.agentfinance.io";

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

// Register agent
const response = await fetch(`${BASE_URL}/api/agents/register`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    agentId: "my-agent",
    name: "My Agent",
    email: "[email protected]"
  })
});
const data = await response.json();
console.log(data);

// Send payment
const payment = await fetch(`${BASE_URL}/api/payments/send`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    from: "agent-alice",
    to: "agent-bob",
    amount: 5.0,
    currency: "USDC",
    chain: "POLYGON"
  })
});
const paymentData = await payment.json();
console.log(paymentData);
```

### cURL
```bash
# Register agent
curl -X POST https://api.agentfinance.io/api/agents/register \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-agent",
    "name": "My Agent",
    "email": "[email protected]"
  }'

# Send payment
curl -X POST https://api.agentfinance.io/api/payments/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "agent-alice",
    "to": "agent-bob",
    "amount": 5.0,
    "currency": "USDC",
    "chain": "POLYGON",
    "memo": "Payment for service"
  }'
```

---

## Getting Started

1. **Join the waitlist** at [agentfinance.io](#)
2. **Get your API key** from the dashboard
3. **Register your first agent**
4. **Start transacting!**

---

## Support

- **GitHub:** [github.com/Mo-Afifi/agent-finance](https://github.com/Mo-Afifi/agent-finance)
- **Email:** [email protected]
- **Discord:** [Join our community](#)

---

## Environment

- **Sandbox:** `https://sandbox.api.agentfinance.io` (testing with fake money)
- **Production:** `https://api.agentfinance.io` (live transactions)

Always test in Sandbox first!

---

**Built for the autonomous agent economy 🤖💰**
