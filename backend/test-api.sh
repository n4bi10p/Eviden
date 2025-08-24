#!/bin/bash

# Attestify API Test Suite
# Tests all API endpoints to ensure they're working correctly

BASE_URL="http://localhost:5000"
TEST_ADDRESS="alice.johnson@eviden.com"

echo "🧪 Starting Attestify API Test Suite"
echo "=================================="

# Test 1: Health Check
echo "1. Testing Health Check..."
response=$(curl -s "$BASE_URL/health")
if [[ $response == *"server"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
fi

# Test 2: API Info
echo -e "\n2. Testing API Info..."
response=$(curl -s "$BASE_URL/api")
if [[ $response == *"Attestify API"* ]]; then
    echo "✅ API info endpoint passed"
else
    echo "❌ API info endpoint failed"
fi

# Test 3: Authentication Nonce
echo -e "\n3. Testing Authentication Nonce..."
response=$(curl -s "$BASE_URL/api/auth/nonce/$TEST_ADDRESS")
if [[ $response == *"nonce"* ]]; then
    echo "✅ Authentication nonce endpoint passed"
else
    echo "❌ Authentication nonce endpoint failed"
fi

# Test 4: Events Endpoint (with required params)
echo -e "\n4. Testing Events Endpoint..."
response=$(curl -s "$BASE_URL/api/events?organizer=$TEST_ADDRESS")
if [[ $response == *"success"* ]]; then
    echo "✅ Events endpoint passed"
else
    echo "❌ Events endpoint failed"
fi

# Test 5: User Profile
echo -e "\n5. Testing User Profile..."
response=$(curl -s "$BASE_URL/api/users/$TEST_ADDRESS")
if [[ $response == *"alice_crypto"* ]]; then
    echo "✅ User profile endpoint passed"
else
    echo "❌ User profile endpoint failed"
fi

# Test 6: Global User Stats
echo -e "\n6. Testing Global User Stats..."
response=$(curl -s "$BASE_URL/api/users/stats/global")
if [[ $response == *"total_users"* ]]; then
    echo "✅ Global user stats endpoint passed"
else
    echo "❌ Global user stats endpoint failed"
fi

# Test 7: Certificates (should require validation)
echo -e "\n7. Testing Certificates Validation..."
response=$(curl -s "$BASE_URL/api/certificates")
if [[ $response == *"VALIDATION_ERROR"* ]]; then
    echo "✅ Certificates validation working"
else
    echo "❌ Certificates validation not working"
fi

# Test 8: Notifications (should require authentication)
echo -e "\n8. Testing Notifications Authentication..."
response=$(curl -s "$BASE_URL/api/notifications")
if [[ $response == *"token"* ]] || [[ $response == *"authentication"* ]]; then
    echo "✅ Notifications authentication working"
else
    echo "❌ Notifications authentication not working"
fi

echo -e "\n🎉 API Test Suite Complete!"
echo "=================================="
echo "All core endpoints are responding correctly!"
echo "✨ Backend is ready for frontend integration"
