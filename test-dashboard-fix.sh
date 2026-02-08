#!/bin/bash

API_KEY="opay_ddd7647645d2d64d7cf6382782f8fd0c36fd8d21c22bc0a2413a4a68c98440d2"
API_URL="https://api.openclawpay.ai"

echo "=========================================="
echo "OpenClaw Pay Dashboard Fix - Test Suite"
echo "=========================================="
echo ""

# Test 1: Agent creation without email
echo "Test 1: Creating agent without email field..."
RESPONSE1=$(curl -s -X POST $API_URL/agents \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-no-email-'$(date +%s)'",
    "name": "Test No Email",
    "type": "openclaw"
  }')

if echo "$RESPONSE1" | grep -q '"id"'; then
  echo "✅ PASS: Agent created without email"
else
  echo "❌ FAIL: Agent creation without email failed"
  echo "Response: $RESPONSE1"
fi
echo ""

# Test 2: Agent creation with email
echo "Test 2: Creating agent with email field..."
RESPONSE2=$(curl -s -X POST $API_URL/agents \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-with-email-'$(date +%s)'",
    "name": "Test With Email",
    "type": "openclaw",
    "email": "[email protected]"
  }')

if echo "$RESPONSE2" | grep -q '"id"'; then
  echo "✅ PASS: Agent created with email"
else
  echo "❌ FAIL: Agent creation with email failed"
  echo "Response: $RESPONSE2"
fi
echo ""

# Test 3: Agent creation with custom type
echo "Test 3: Creating agent with custom type..."
RESPONSE3=$(curl -s -X POST $API_URL/agents \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-custom-'$(date +%s)'",
    "name": "Test Custom Type",
    "type": "custom"
  }')

if echo "$RESPONSE3" | grep -q '"id"'; then
  echo "✅ PASS: Agent created with custom type"
else
  echo "❌ FAIL: Agent creation with custom type failed"
  echo "Response: $RESPONSE3"
fi
echo ""

# Test 4: List agents
echo "Test 4: Listing all agents..."
RESPONSE4=$(curl -s -X GET $API_URL/agents \
  -H "Authorization: Bearer $API_KEY")

if echo "$RESPONSE4" | grep -q '\['; then
  COUNT=$(echo "$RESPONSE4" | jq '. | length' 2>/dev/null || echo "?")
  echo "✅ PASS: Retrieved agents list (count: $COUNT)"
else
  echo "❌ FAIL: Failed to list agents"
  echo "Response: $RESPONSE4"
fi
echo ""

# Test 5: CORS check
echo "Test 5: Testing CORS headers..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS $API_URL/agents \
  -H "Origin: https://dashboard.openclawpay.ai" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type")

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow"; then
  echo "✅ PASS: CORS headers present"
else
  echo "❌ FAIL: CORS headers missing"
fi
echo ""

echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
