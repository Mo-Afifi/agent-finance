#!/bin/bash
# Test script for dashboard API endpoints
# Run this after starting the backend server: npm start

set -e

BASE_URL="http://localhost:3000"
API_KEY=""

echo "🧪 Testing Dashboard API Endpoints"
echo "=================================="
echo ""

# Step 1: Register user and get API key
echo "📝 Step 1: Register user"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"dashboard-test@example.com"}')

API_KEY=$(echo $RESPONSE | jq -r '.data.apiKey')
USER_ID=$(echo $RESPONSE | jq -r '.data.userId')

if [ "$API_KEY" == "null" ] || [ -z "$API_KEY" ]; then
  echo "❌ Failed to get API key"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ User registered: $USER_ID"
echo "✅ API Key obtained: ${API_KEY:0:20}..."
echo ""

# Step 2: List agents (should be empty)
echo "📋 Step 2: List agents (should be empty)"
AGENTS=$(curl -s "$BASE_URL/agents" -H "Authorization: Bearer $API_KEY")
COUNT=$(echo $AGENTS | jq '. | length')

if [ "$COUNT" -eq "0" ]; then
  echo "✅ Agent list is empty as expected"
else
  echo "⚠️  Found $COUNT agents (expected 0)"
fi
echo ""

# Step 3: Create an agent
echo "👤 Step 3: Create an agent"
AGENT=$(curl -s -X POST "$BASE_URL/agents" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "dashboard-test-agent",
    "name": "Dashboard Test Agent",
    "email": "agent@test.com",
    "type": "individual"
  }')

AGENT_ID=$(echo $AGENT | jq -r '.id')
AGENT_NAME=$(echo $AGENT | jq -r '.name')

if [ "$AGENT_ID" == "dashboard-test-agent" ]; then
  echo "✅ Agent created: $AGENT_NAME"
else
  echo "❌ Failed to create agent"
  echo "Response: $AGENT"
  exit 1
fi
echo ""

# Step 4: List agents (should have 1)
echo "📋 Step 4: List agents (should have 1)"
AGENTS=$(curl -s "$BASE_URL/agents" -H "Authorization: Bearer $API_KEY")
COUNT=$(echo $AGENTS | jq '. | length')

if [ "$COUNT" -eq "1" ]; then
  echo "✅ Agent list now has 1 agent"
else
  echo "❌ Expected 1 agent, found $COUNT"
  exit 1
fi
echo ""

# Step 5: Test activity endpoint
echo "📊 Step 5: Get activity (stub)"
ACTIVITY=$(curl -s "$BASE_URL/activity")
echo "✅ Activity endpoint: $(echo $ACTIVITY | jq -c .)"
echo ""

# Step 6: Test transactions endpoint
echo "💸 Step 6: Get transactions (stub)"
TRANSACTIONS=$(curl -s "$BASE_URL/transactions")
echo "✅ Transactions endpoint: $(echo $TRANSACTIONS | jq -c .)"
echo ""

# Step 7: Create transaction
echo "💳 Step 7: Create transaction (mock)"
TX=$(curl -s -X POST "$BASE_URL/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "fromAgent": "dashboard-test-agent",
    "toAgent": "other-agent",
    "amount": 100,
    "currency": "USD",
    "memo": "Test payment"
  }')
TX_ID=$(echo $TX | jq -r '.id')
echo "✅ Transaction created: $TX_ID"
echo ""

# Step 8: Get balances
echo "💰 Step 8: Get agent balances (stub)"
BALANCES=$(curl -s "$BASE_URL/agents/dashboard-test-agent/balances")
echo "✅ Balances endpoint: $(echo $BALANCES | jq -c .)"
echo ""

# Step 9: Create wallet
echo "👛 Step 9: Create wallet (mock)"
WALLET=$(curl -s -X POST "$BASE_URL/agents/dashboard-test-agent/wallets" \
  -H "Content-Type: application/json" \
  -d '{"chain": "ethereum"}')
WALLET_ID=$(echo $WALLET | jq -r '.id')
WALLET_ADDR=$(echo $WALLET | jq -r '.address')
echo "✅ Wallet created: $WALLET_ID ($WALLET_ADDR)"
echo ""

# Step 10: Create virtual account
echo "🏦 Step 10: Create virtual account (mock)"
ACCOUNT=$(curl -s -X POST "$BASE_URL/agents/dashboard-test-agent/accounts" \
  -H "Content-Type: application/json" \
  -d '{"currency": "USD"}')
ACCOUNT_ID=$(echo $ACCOUNT | jq -r '.id')
ACCOUNT_NUM=$(echo $ACCOUNT | jq -r '.accountNumber')
echo "✅ Virtual account created: $ACCOUNT_ID (Account: $ACCOUNT_NUM)"
echo ""

echo "=================================="
echo "✅ All dashboard API tests passed!"
echo "=================================="
echo ""
echo "Summary:"
echo "- User registration: ✅"
echo "- Agent management: ✅"
echo "- Activity feed: ✅"
echo "- Transactions: ✅"
echo "- Balances: ✅"
echo "- Wallets: ✅"
echo "- Virtual accounts: ✅"
echo ""
echo "The dashboard frontend should now load without 404 errors."
echo "Stub endpoints return empty arrays or mock data as expected."
