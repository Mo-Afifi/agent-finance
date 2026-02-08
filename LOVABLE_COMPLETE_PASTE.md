# OpenClaw Pay API Documentation

Build financial autonomy into your AI agents. OpenClaw Pay provides a simple API for agent-to-agent payments, wallet management, and fiat/crypto conversion.

---

## 🚀 Quick Reference

### Base URL
```
Production: https://api.openclawpay.ai
Sandbox: https://sandbox.api.openclawpay.ai
```

### Authentication
```bash
Authorization: Bearer YOUR_API_KEY
```

### Most Common Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Register Agent | POST | `/api/agents/register` |
| Send Payment | POST | `/api/payments/send` |
| Get Balance | GET | `/api/wallets/:agentId` |
| Get Transactions | GET | `/api/transactions/:agentId` |
| Deposit Fiat | POST | `/api/conversion/deposit` |

---

## 📖 Complete API Reference

### 🤖 Agent Management

#### Register New Agent
Create a financial identity for your AI agent.

**POST** `/api/agents/register`

**Request:**
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
      "POLYGON": "0x1234567890abcdef...",
      "ETHEREUM": "0x5678901234abcdef..."
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
    "email": "[email protected]",
    "verified": true,
    "createdAt": "2026-02-08T12:00:00Z",
    "wallets": [
      {
        "chain": "POLYGON",
        "address": "0x1234..."
      }
    ],
    "accounts": [
      {
        "currency": "USD",
        "balance": "100.00"
      }
    ]
  }
}
```

---

### 💰 Payments

#### Send Payment to Another Agent
**POST** `/api/payments/send`

**Request:**
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
    "chain": "POLYGON",
    "memo": "Payment for API service",
    "createdAt": "2026-02-08T14:00:00Z",
    "txHash": null
  }
}
```

**Status Values:**
- `pending` - Transaction submitted to blockchain
- `completed` - Successfully confirmed on-chain
- `failed` - Transaction failed (insufficient gas, etc.)

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
    "chain": "POLYGON",
    "txHash": "0xabc123def456...",
    "completedAt": "2026-02-08T14:01:30Z",
    "confirmations": 12
  }
}
```

---

#### List Payments
**GET** `/api/payments?agentId=my-agent-123&limit=20&offset=0`

**Query Parameters:**
- `agentId` (required) - Filter by agent
- `limit` (optional) - Results per page, default 20, max 100
- `offset` (optional) - Pagination offset, default 0
- `status` (optional) - Filter: `pending`, `completed`, `failed`
- `startDate` (optional) - ISO date: `2026-01-01`
- `endDate` (optional) - ISO date: `2026-02-01`

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "pay_abc123",
      "status": "completed",
      "from": "agent-alice",
      "to": "agent-bob",
      "amount": 5.00,
      "currency": "USDC",
      "createdAt": "2026-02-08T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

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
      "address": "0x1234567890abcdef...",
      "balances": [
        {
          "token": "USDC",
          "amount": "100.50",
          "decimals": 6
        },
        {
          "token": "MATIC",
          "amount": "10.25",
          "decimals": 18
        }
      ]
    },
    {
      "chain": "ETHEREUM",
      "address": "0x5678901234abcdef...",
      "balances": [
        {
          "token": "USDC",
          "amount": "50.00",
          "decimals": 6
        }
      ]
    }
  ],
  "totalUsdValue": "150.75"
}
```

---

#### Create Deposit Account
Create a virtual bank account for fiat deposits (onramp).

**POST** `/api/wallets/:agentId/accounts`

**Request:**
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
    "accountName": "OpenClaw Pay - my-agent-123",
    "balance": "0.00",
    "status": "active"
  },
  "instructions": "Wire or ACH transfer to this account to add USD. Funds are automatically converted to USDC."
}
```

---

### 🔄 Fiat/Crypto Conversion

#### Deposit Fiat (Onramp)
Convert USD to USDC.

**POST** `/api/conversion/deposit`

**Request:**
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
    "id": "tx_onramp_abc123",
    "type": "deposit",
    "status": "pending",
    "amount": 100.00,
    "fromCurrency": "USD",
    "toToken": "USDC",
    "chain": "POLYGON",
    "estimatedTokens": "99.50",
    "fee": "0.50",
    "estimatedCompletion": "2026-02-08T14:30:00Z"
  }
}
```

**Status Flow:**
1. `pending` - Waiting for bank transfer
2. `processing` - Converting to crypto
3. `completed` - USDC in wallet
4. `failed` - Issue with conversion

---

#### Withdraw to Fiat (Offramp)
Convert USDC to USD and send to bank account.

**POST** `/api/conversion/withdraw`

**Request:**
```json
{
  "agentId": "my-agent-123",
  "amount": 50.00,
  "token": "USDC",
  "chain": "POLYGON",
  "bankAccountId": "bank_123"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "tx_offramp_def456",
    "type": "withdrawal",
    "status": "processing",
    "amount": 50.00,
    "fromToken": "USDC",
    "toCurrency": "USD",
    "estimatedUsd": "49.50",
    "fee": "0.50",
    "bankAccountId": "bank_123",
    "estimatedArrival": "2026-02-10T12:00:00Z"
  }
}
```

---

### 🏦 Bank Account Management

#### Register Bank Account
**POST** `/api/wallets/:agentId/bank-accounts`

**Request:**
```json
{
  "accountNumber": "1234567890",
  "routingNumber": "021000021",
  "accountType": "checking",
  "accountHolderName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "bankAccount": {
    "id": "bank_123",
    "last4": "7890",
    "accountType": "checking",
    "status": "pending_verification",
    "verificationMethod": "microdeposit"
  },
  "message": "Two small deposits will be sent in 1-2 business days. Verify amounts to activate."
}
```

---

#### List Bank Accounts
**GET** `/api/wallets/:agentId/bank-accounts`

**Response:**
```json
{
  "success": true,
  "bankAccounts": [
    {
      "id": "bank_123",
      "last4": "7890",
      "accountType": "checking",
      "status": "verified",
      "isPrimary": true
    }
  ]
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
- `startDate` - ISO date
- `endDate` - ISO date

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "tx_abc123",
      "type": "payment",
      "status": "completed",
      "from": "agent-alice",
      "to": "agent-bob",
      "amount": 5.00,
      "currency": "USDC",
      "createdAt": "2026-02-08T14:00:00Z",
      "completedAt": "2026-02-08T14:01:30Z"
    },
    {
      "id": "tx_def456",
      "type": "deposit",
      "status": "completed",
      "amount": 100.00,
      "fromCurrency": "USD",
      "toToken": "USDC",
      "createdAt": "2026-02-07T10:00:00Z",
      "completedAt": "2026-02-07T16:00:00Z"
    }
  ],
  "pagination": {
    "total": 127,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 🔍 Health & Status

#### Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T14:20:00Z",
  "service": "agent-finance-api",
  "version": "0.1.0"
}
```

---

## 📋 Response Format

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
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "agentId",
    "issue": "Agent not found"
  }
}
```

---

## ⚠️ Error Codes

| Code | HTTP | Description | Solution |
|------|------|-------------|----------|
| `AGENT_NOT_FOUND` | 404 | Agent ID doesn't exist | Register agent first |
| `INSUFFICIENT_BALANCE` | 400 | Not enough funds | Deposit more funds |
| `INVALID_CHAIN` | 400 | Unsupported blockchain | Use POLYGON, ETHEREUM, or BASE |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait and retry |
| `UNAUTHORIZED` | 401 | Invalid API key | Check Authorization header |
| `VALIDATION_ERROR` | 400 | Invalid parameters | Check request format |
| `PAYMENT_FAILED` | 500 | Blockchain transaction failed | Retry or contact support |
| `KYC_REQUIRED` | 403 | Verification needed | Complete KYC in dashboard |

---

## 🚦 Rate Limits

- **100 requests per minute** per API key
- **1,000 requests per hour** per API key

Exceeded limits return HTTP 429 with headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1675875600
Retry-After: 60
```

---

## 🌐 Supported Networks

| Chain | Chain ID | Native Token | Supported Tokens |
|-------|----------|--------------|------------------|
| Polygon | 137 | MATIC | USDC, USDT, WETH |
| Ethereum | 1 | ETH | USDC, USDT, DAI |
| Base | 8453 | ETH | USDC |

---

## 💵 Supported Currencies

**Fiat:**
- USD (United States Dollar)

**Stablecoins:**
- USDC (USD Coin) - Primary
- USDT (Tether)

**Native Tokens:**
- ETH (Ethereum)
- MATIC (Polygon)

More currencies coming soon!

---

## 🎯 Use Case Examples

### Example 1: Agent Marketplace
**Scenario:** Agent A hires Agent B to process data

```javascript
// 1. Agent B completes the task
// 2. Agent A pays Agent B

const payment = await fetch('https://api.openclawpay.ai/api/payments/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer agent_a_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'agent-a',
    to: 'agent-b',
    amount: 10.00,
    currency: 'USDC',
    chain: 'POLYGON',
    memo: 'Payment for 1000 records processed'
  })
});

const result = await payment.json();
console.log(`Payment sent: ${result.payment.id}`);
```

---

### Example 2: Autonomous Revenue Sharing
**Scenario:** Multiple agents split revenue from a service

```javascript
// Split $100 revenue: 50% to agent-a, 30% to agent-b, 20% to agent-c

const totalRevenue = 100.00;
const splits = [
  { agent: 'agent-a', percentage: 0.50 },
  { agent: 'agent-b', percentage: 0.30 },
  { agent: 'agent-c', percentage: 0.20 }
];

for (const split of splits) {
  const amount = totalRevenue * split.percentage;
  
  await fetch('https://api.openclawpay.ai/api/payments/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer revenue_agent_api_key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'revenue-agent',
      to: split.agent,
      amount: amount,
      currency: 'USDC',
      chain: 'POLYGON',
      memo: `Revenue share: ${split.percentage * 100}%`
    })
  });
}
```

---

### Example 3: Escrow for Service Delivery
**Scenario:** Pay agent only after service is delivered

```javascript
// Step 1: Client deposits to escrow
const escrow = await fetch('https://api.openclawpay.ai/api/payments/escrow/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer client_agent_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'client-agent',
    to: 'service-agent',
    amount: 50.00,
    currency: 'USDC',
    chain: 'POLYGON',
    conditions: {
      type: 'service_delivery',
      deliveryDeadline: '2026-02-10T00:00:00Z'
    }
  })
});

// Step 2: Service agent delivers work

// Step 3: Client releases escrow
await fetch(`https://api.openclawpay.ai/api/payments/escrow/${escrow.id}/release`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer client_agent_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    proof: 'Service delivered successfully'
  })
});
```

---

### Example 4: Micropayments for API Calls
**Scenario:** Pay per API request usage

```javascript
// Agent tracks API usage and bills monthly

let usageCount = 0;
const pricePerCall = 0.01; // $0.01 per API call

// Track usage
function trackApiCall() {
  usageCount++;
}

// Bill at end of month
async function billMonthlyUsage(clientAgent) {
  const totalAmount = usageCount * pricePerCall;
  
  const payment = await fetch('https://api.openclawpay.ai/api/payments/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer api_provider_key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: clientAgent,
      to: 'api-provider-agent',
      amount: totalAmount,
      currency: 'USDC',
      chain: 'POLYGON',
      memo: `${usageCount} API calls @ $${pricePerCall} each`
    })
  });
  
  usageCount = 0; // Reset counter
  return payment.json();
}
```

---

### Example 5: Agent DAO Treasury
**Scenario:** Multiple agents contribute to shared treasury

```javascript
// Agents vote on treasury spending

const daoTreasuryAgent = 'dao-treasury';
const proposedSpend = {
  to: 'infrastructure-agent',
  amount: 500.00,
  purpose: 'Upgrade shared infrastructure'
};

// Assume voting passed...

// DAO agent executes payment
const payment = await fetch('https://api.openclawpay.ai/api/payments/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer dao_treasury_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: daoTreasuryAgent,
    to: proposedSpend.to,
    amount: proposedSpend.amount,
    currency: 'USDC',
    chain: 'POLYGON',
    memo: `DAO Proposal #42: ${proposedSpend.purpose}`
  })
});
```

---

## 💻 Code Examples

### Python
```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://api.openclawpay.ai"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Register agent
def register_agent(agent_id, name, email):
    response = requests.post(
        f"{BASE_URL}/api/agents/register",
        headers=headers,
        json={
            "agentId": agent_id,
            "name": name,
            "email": email
        }
    )
    return response.json()

# Send payment
def send_payment(from_agent, to_agent, amount):
    response = requests.post(
        f"{BASE_URL}/api/payments/send",
        headers=headers,
        json={
            "from": from_agent,
            "to": to_agent,
            "amount": amount,
            "currency": "USDC",
            "chain": "POLYGON"
        }
    )
    return response.json()

# Get balance
def get_balance(agent_id):
    response = requests.get(
        f"{BASE_URL}/api/wallets/{agent_id}",
        headers=headers
    )
    return response.json()

# Usage
agent = register_agent("my-agent", "My Agent", "[email protected]")
print(f"Agent registered: {agent}")

payment = send_payment("agent-a", "agent-b", 10.0)
print(f"Payment sent: {payment}")

balance = get_balance("my-agent")
print(f"Balance: {balance}")
```

---

### JavaScript/TypeScript
```javascript
const API_KEY = "your_api_key_here";
const BASE_URL = "https://api.openclawpay.ai";

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

// Register agent
async function registerAgent(agentId, name, email) {
  const response = await fetch(`${BASE_URL}/api/agents/register`, {
    method: "POST",
    headers,
    body: JSON.stringify({ agentId, name, email })
  });
  return await response.json();
}

// Send payment
async function sendPayment(from, to, amount) {
  const response = await fetch(`${BASE_URL}/api/payments/send`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      from,
      to,
      amount,
      currency: "USDC",
      chain: "POLYGON"
    })
  });
  return await response.json();
}

// Get balance
async function getBalance(agentId) {
  const response = await fetch(`${BASE_URL}/api/wallets/${agentId}`, {
    headers
  });
  return await response.json();
}

// Usage
(async () => {
  const agent = await registerAgent("my-agent", "My Agent", "[email protected]");
  console.log("Agent registered:", agent);

  const payment = await sendPayment("agent-a", "agent-b", 10.0);
  console.log("Payment sent:", payment);

  const balance = await getBalance("my-agent");
  console.log("Balance:", balance);
})();
```

---

### Ruby
```ruby
require 'net/http'
require 'json'
require 'uri'

API_KEY = 'your_api_key_here'
BASE_URL = 'https://api.openclawpay.ai'

def make_request(method, path, body = nil)
  uri = URI("#{BASE_URL}#{path}")
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  
  request = case method
  when 'POST'
    Net::HTTP::Post.new(uri)
  when 'GET'
    Net::HTTP::Get.new(uri)
  end
  
  request['Authorization'] = "Bearer #{API_KEY}"
  request['Content-Type'] = 'application/json'
  request.body = body.to_json if body
  
  response = http.request(request)
  JSON.parse(response.body)
end

# Register agent
def register_agent(agent_id, name, email)
  make_request('POST', '/api/agents/register', {
    agentId: agent_id,
    name: name,
    email: email
  })
end

# Send payment
def send_payment(from, to, amount)
  make_request('POST', '/api/payments/send', {
    from: from,
    to: to,
    amount: amount,
    currency: 'USDC',
    chain: 'POLYGON'
  })
end

# Usage
agent = register_agent('my-agent', 'My Agent', '[email protected]')
puts "Agent registered: #{agent}"

payment = send_payment('agent-a', 'agent-b', 10.0)
puts "Payment sent: #{payment}"
```

---

### cURL
```bash
# Register agent
curl -X POST https://api.openclawpay.ai/api/agents/register \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-agent",
    "name": "My Agent",
    "email": "[email protected]"
  }'

# Send payment
curl -X POST https://api.openclawpay.ai/api/payments/send \
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

# Get balance
curl -X GET https://api.openclawpay.ai/api/wallets/my-agent \
  -H "Authorization: Bearer YOUR_API_KEY"

# Get transactions
curl -X GET "https://api.openclawpay.ai/api/transactions/my-agent?limit=20" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Deposit fiat
curl -X POST https://api.openclawpay.ai/api/conversion/deposit \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-agent",
    "amount": 100.0,
    "currency": "USD",
    "toToken": "USDC",
    "chain": "POLYGON"
  }'
```

---

## 🔧 Interactive API Explorer

### Try it Live

**Base URL:** `https://api.openclawpay.ai`

**Your API Key:** `[Enter your API key]`

---

#### Test: Register Agent

```
POST /api/agents/register
```

**Request Body:**
```json
{
  "agentId": "test-agent-[random-id]",
  "name": "Test Agent",
  "email": "[email protected]"
}
```

**Try it:**
```bash
curl -X POST https://api.openclawpay.ai/api/agents/register \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-agent-123","name":"Test Agent","email":"[email protected]"}'
```

[Copy to clipboard] [Run in terminal]

---

#### Test: Send Payment

```
POST /api/payments/send
```

**Request Body:**
```json
{
  "from": "agent-alice",
  "to": "agent-bob",
  "amount": 1.00,
  "currency": "USDC",
  "chain": "POLYGON",
  "memo": "Test payment"
}
```

**Try it:**
```bash
curl -X POST https://api.openclawpay.ai/api/payments/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"agent-alice","to":"agent-bob","amount":1.0,"currency":"USDC","chain":"POLYGON"}'
```

[Copy to clipboard] [Run in terminal]

---

#### Test: Get Balance

```
GET /api/wallets/:agentId
```

**Try it:**
```bash
curl -X GET https://api.openclawpay.ai/api/wallets/test-agent-123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

[Copy to clipboard] [Run in terminal]

---

## 🎓 Getting Started Guide

### Step 1: Join the Waitlist
Sign up at [openclawpay.ai](https://openclawpay.ai) to get early access.

### Step 2: Get Your API Key
Once approved, log into the dashboard and create an API key.

### Step 3: Install SDK (Optional)
```bash
npm install @agent-finance/sdk
# or
pip install agent-finance
```

### Step 4: Register Your First Agent
```javascript
const response = await fetch('https://api.openclawpay.ai/api/agents/register', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agentId: 'my-first-agent',
    name: 'My First Agent',
    email: '[email protected]'
  })
});

const agent = await response.json();
console.log('Agent created!', agent);
```

### Step 5: Fund Your Agent
Deposit USD to your agent's virtual account and it will automatically convert to USDC.

### Step 6: Start Transacting!
Send your first payment to another agent:

```javascript
const payment = await fetch('https://api.openclawpay.ai/api/payments/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'my-first-agent',
    to: 'another-agent',
    amount: 5.00,
    currency: 'USDC',
    chain: 'POLYGON'
  })
});
```

---

## 🛡️ Security Best Practices

### API Key Management
- ✅ Store API keys in environment variables
- ✅ Never commit keys to version control
- ✅ Use separate keys for development and production
- ✅ Rotate keys periodically
- ❌ Never expose keys in client-side code

### Transaction Security
- ✅ Verify recipient agent ID before sending payments
- ✅ Use memo fields for audit trails
- ✅ Monitor transaction status
- ✅ Set up webhook notifications for important events
- ✅ Implement spending limits in your application

### Network Security
- ✅ Always use HTTPS
- ✅ Validate SSL certificates
- ✅ Use latest TLS version
- ✅ Implement request timeouts
- ✅ Log all API interactions

---

## 📞 Support

### Resources
- **Documentation:** [docs.openclawpay.ai](https://docs.openclawpay.ai)
- **GitHub:** [github.com/Mo-Afifi/agent-finance](https://github.com/Mo-Afifi/agent-finance)
- **API Status:** [status.openclawpay.ai](https://status.openclawpay.ai)

### Contact
- **Email:** [email protected]
- **Discord:** [Join our community](https://discord.openclawpay.ai)
- **Twitter:** [@AgentFinance](https://twitter.com/AgentFinance)

### Response Times
- **Critical Issues:** < 1 hour
- **General Support:** < 24 hours
- **Feature Requests:** 2-3 business days

---

## 🚀 What's Next?

### Coming Soon
- ✨ Multi-signature wallets for agent DAOs
- ✨ Recurring payments and subscriptions
- ✨ Support for more chains (Arbitrum, Optimism, Solana)
- ✨ Fiat currency support (EUR, GBP)
- ✨ Advanced analytics and reporting
- ✨ Webhooks for all events
- ✨ GraphQL API
- ✨ Mobile SDKs (iOS, Android)

### Roadmap
**Q1 2026:**
- Production launch
- 100+ registered agents
- Complete KYC/KYB flows

**Q2 2026:**
- Multi-chain support
- Agent marketplace
- Advanced escrow contracts

**Q3 2026:**
- International expansion
- Enterprise features
- White-label solutions

---

## 📊 Sandbox vs Production

### Sandbox Environment
- **URL:** `https://sandbox.api.openclawpay.ai`
- **Purpose:** Testing with simulated funds
- **No real money** - all transactions are fake
- **No KYC required**
- **Fast approval** - instant registration
- **Rate limits:** Same as production

### Production Environment
- **URL:** `https://api.openclawpay.ai`
- **Purpose:** Live transactions with real money
- **KYC/KYB required** for agent owners
- **Bank account verification** needed for offramp
- **Compliance checks** on all transactions
- **Rate limits:** Same as sandbox

**Always test in Sandbox first!**

---

**Built for the autonomous agent economy 🤖💰**

*OpenClaw Pay enables AI agents to transact with each other autonomously. No humans required.*
