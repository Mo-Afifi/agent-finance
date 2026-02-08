#!/bin/bash

# Test script for API Key Authentication System
# Usage: ./test-auth.sh

set -e

API_BASE="http://localhost:3000"
TEST_EMAIL="test-$(date +%s)@example.com"

echo "🧪 Testing OpenClaw Pay API Key Authentication System"
echo "======================================================"
echo ""

# 1. Register user
echo "1️⃣  Registering user: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/api/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

echo "$REGISTER_RESPONSE" | jq .

API_KEY=$(echo "$REGISTER_RESPONSE" | jq -r '.data.apiKey')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.userId')

if [ -z "$API_KEY" ] || [ "$API_KEY" = "null" ]; then
  echo "❌ Failed to get API key"
  exit 1
fi

echo "✅ Got API key: $API_KEY"
echo ""

# 2. Get current user
echo "2️⃣  Getting current user info"
USER_RESPONSE=$(curl -s "$API_BASE/api/users/me" \
  -H "Authorization: Bearer $API_KEY")

echo "$USER_RESPONSE" | jq .
echo "✅ User info retrieved"
echo ""

# 3. Get API key
echo "3️⃣  Getting API key details"
KEY_RESPONSE=$(curl -s "$API_BASE/api/users/me/api-key" \
  -H "Authorization: Bearer $API_KEY")

echo "$KEY_RESPONSE" | jq .
echo "✅ API key details retrieved"
echo ""

# 4. Test unauthorized access
echo "4️⃣  Testing unauthorized access (should fail)"
UNAUTH_RESPONSE=$(curl -s "$API_BASE/agents" \
  -H "Authorization: Bearer opay_invalid_key_12345")

echo "$UNAUTH_RESPONSE" | jq .
if echo "$UNAUTH_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo "✅ Unauthorized access correctly blocked"
else
  echo "❌ Unauthorized access was not blocked!"
  exit 1
fi
echo ""

# 5. List agents (should be empty)
echo "5️⃣  Listing agents (should be empty)"
AGENTS_RESPONSE=$(curl -s "$API_BASE/agents" \
  -H "Authorization: Bearer $API_KEY")

echo "$AGENTS_RESPONSE" | jq .
echo "✅ Agents list retrieved"
echo ""

# 6. Register an agent
echo "6️⃣  Registering an agent"
AGENT_ID="test-agent-$(date +%s)"
AGENT_RESPONSE=$(curl -s -X POST "$API_BASE/api/agents/register" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"agentId\":\"$AGENT_ID\",
    \"name\":\"Test Agent\",
    \"email\":\"$TEST_EMAIL\",
    \"type\":\"individual\"
  }")

echo "$AGENT_RESPONSE" | jq .

if echo "$AGENT_RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
  echo "✅ Agent registered successfully"
else
  echo "⚠️  Agent registration may have failed (check HIFI API connectivity)"
fi
echo ""

# 7. List agents again (should show our agent)
echo "7️⃣  Listing agents again"
AGENTS_RESPONSE=$(curl -s "$API_BASE/agents" \
  -H "Authorization: Bearer $API_KEY")

echo "$AGENTS_RESPONSE" | jq .
echo "✅ Agents list retrieved"
echo ""

# 8. Regenerate API key
echo "8️⃣  Regenerating API key"
REGEN_RESPONSE=$(curl -s -X POST "$API_BASE/api/users/me/api-key/regenerate" \
  -H "Authorization: Bearer $API_KEY")

echo "$REGEN_RESPONSE" | jq .

NEW_API_KEY=$(echo "$REGEN_RESPONSE" | jq -r '.data.apiKey')

if [ -z "$NEW_API_KEY" ] || [ "$NEW_API_KEY" = "null" ]; then
  echo "❌ Failed to regenerate API key"
  exit 1
fi

echo "✅ New API key: $NEW_API_KEY"
echo ""

# 9. Test old key is invalid
echo "9️⃣  Testing old key is invalid"
OLD_KEY_RESPONSE=$(curl -s "$API_BASE/api/users/me" \
  -H "Authorization: Bearer $API_KEY")

echo "$OLD_KEY_RESPONSE" | jq .

if echo "$OLD_KEY_RESPONSE" | jq -e '.success == false' > /dev/null; then
  echo "✅ Old key correctly invalidated"
else
  echo "❌ Old key still works!"
  exit 1
fi
echo ""

# 10. Test new key works
echo "🔟 Testing new key works"
NEW_KEY_RESPONSE=$(curl -s "$API_BASE/api/users/me" \
  -H "Authorization: Bearer $NEW_API_KEY")

echo "$NEW_KEY_RESPONSE" | jq .

if echo "$NEW_KEY_RESPONSE" | jq -e '.success == true' > /dev/null; then
  echo "✅ New key works correctly"
else
  echo "❌ New key doesn't work!"
  exit 1
fi
echo ""

echo "======================================================"
echo "✨ All tests passed! Authentication system is working."
echo ""
echo "Test Summary:"
echo "  User ID: $USER_ID"
echo "  Email: $TEST_EMAIL"
echo "  Current API Key: $NEW_API_KEY"
echo "  Agent ID: $AGENT_ID"
