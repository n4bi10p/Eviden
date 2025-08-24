#!/bin/bash

# QR Code and Push Notification API Test Script
# Make sure the server is running on localhost:5000

echo "🧪 Testing QR Code and Push Notification APIs"
echo "============================================="

BASE_URL="http://localhost:5000/api"sh

# QR Code and Push Notification API Test Script
# Make sure the server is running on localhost:3001

echo "🧪 Testing QR Code & Push Notification APIs"
echo "=========================================="

BASE_URL="http://localhost:3001/api"

echo ""
echo "1️⃣ Testing VAPID Public Key..."
curl -s -X GET "$BASE_URL/push-notifications/vapid-public-key" | jq .

echo ""
echo "2️⃣ Testing QR Code Generation (without auth - should fail)..."
curl -s -X POST "$BASE_URL/qr-codes/generate/test-event-123" \
  -H "Content-Type: application/json" \
  -d '{"expirationHours": 2, "location": "Test Location"}' | jq .

echo ""
echo "3️⃣ Testing QR Code Validation..."
curl -s -X POST "$BASE_URL/qr-codes/validate" \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid-token", "eventId": "test-event"}' | jq .

echo ""
echo "4️⃣ Testing Push Notification Subscribe..."
curl -s -X POST "$BASE_URL/push-notifications/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://test-endpoint.com",
      "keys": {
        "p256dh": "test-p256dh-key",
        "auth": "test-auth-secret"
      }
    }
  }' | jq .

echo ""
echo "5️⃣ Testing Health Check..."
curl -s -X GET "$BASE_URL/../health" | jq .

echo ""
echo "✅ API Tests Complete!"
echo ""
echo "📝 Notes:"
echo "- QR generation requires authentication (expected failure)"
echo "- Push subscription should work without auth"
echo "- VAPID public key should be returned"
echo "- Health check should show system status"
echo ""
echo "🔗 Full API documentation: backend/QR_PUSH_API_DOCS.md"
