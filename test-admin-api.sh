#!/bin/bash

API_URL="https://api.openclawpay.ai"
ADMIN_URL="https://admin.openclawpay.ai"

echo "=== Testing Admin API Endpoints ==="
echo ""

echo "1. Testing /api/admin/stats..."
STATS=$(curl -s "$API_URL/api/admin/stats")
TOTAL_USERS=$(echo "$STATS" | jq -r '.data.totalUsers')
TOTAL_AGENTS=$(echo "$STATS" | jq -r '.data.totalAgents')

echo "   Total Users: $TOTAL_USERS"
echo "   Total Agents: $TOTAL_AGENTS"

if [ "$TOTAL_USERS" -gt 0 ]; then
  echo "   ✅ PASS: Users count is $TOTAL_USERS (expected > 0)"
else
  echo "   ❌ FAIL: Users count is 0 (expected > 0)"
fi

if [ "$TOTAL_AGENTS" -gt 0 ]; then
  echo "   ✅ PASS: Agents count is $TOTAL_AGENTS (expected > 0)"
else
  echo "   ❌ FAIL: Agents count is 0 (expected > 0)"
fi

echo ""
echo "2. Testing /api/admin/users..."
USERS=$(curl -s "$API_URL/api/admin/users")
USER_COUNT=$(echo "$USERS" | jq -r '.data | length')
FIRST_USER_EMAIL=$(echo "$USERS" | jq -r '.data[0].email')

echo "   User count: $USER_COUNT"
echo "   First user: $FIRST_USER_EMAIL"

if [ "$USER_COUNT" -gt 0 ]; then
  echo "   ✅ PASS: Found $USER_COUNT users"
else
  echo "   ❌ FAIL: No users found"
fi

echo ""
echo "3. Testing /api/admin/agents..."
AGENTS=$(curl -s "$API_URL/api/admin/agents")
AGENT_COUNT=$(echo "$AGENTS" | jq -r '.data | length')
FIRST_AGENT=$(echo "$AGENTS" | jq -r '.data[0].name // "null"')

echo "   Agent count: $AGENT_COUNT"
echo "   First agent: $FIRST_AGENT"

if [ "$AGENT_COUNT" -gt 0 ]; then
  echo "   ✅ PASS: Found $AGENT_COUNT agents"
else
  echo "   ❌ FAIL: No agents found"
fi

# Check if first agent is real (not mock data)
if [[ "$FIRST_AGENT" != "Trading Bot Alpha" ]]; then
  echo "   ✅ PASS: Agent data appears to be real (not mock)"
else
  echo "   ⚠️  WARNING: Agent data might still be mock data"
fi

echo ""
echo "4. Testing /api/admin/activity..."
ACTIVITY=$(curl -s "$API_URL/api/admin/activity")
ACTIVITY_COUNT=$(echo "$ACTIVITY" | jq -r '.data | length')

echo "   Activity log count: $ACTIVITY_COUNT"
echo "   ✅ PASS: Activity endpoint responding"

echo ""
echo "5. Testing /api/admin/health..."
HEALTH=$(curl -s "$API_URL/api/admin/health")
HIFI_STATUS=$(echo "$HEALTH" | jq -r '.data.hifiStatus')

echo "   HIFI Status: $HIFI_STATUS"

if [ "$HIFI_STATUS" == "online" ]; then
  echo "   ✅ PASS: HIFI is online"
else
  echo "   ⚠️  WARNING: HIFI status: $HIFI_STATUS"
fi

echo ""
echo "=== Admin Dashboard Check ==="
echo "Visit: $ADMIN_URL"
echo "Expected to see:"
echo "  - Real user count (not 0)"
echo "  - Real agent count (not 0)" 
echo "  - Actual user emails in the users table"
echo ""
echo "=== Summary ==="
echo "Backend API: $API_URL"
echo "Admin Dashboard: $ADMIN_URL"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render (git push)"
echo "2. Update Vercel env vars for admin dashboard"
echo "3. Re-run this test after deployment"
echo ""
