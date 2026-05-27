#!/bin/bash

# ML Q&A Module - Test Script
# Este script facilita testing de los endpoints del API

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="${BASE_URL:-http://localhost:3000}"
TOKEN=""
STATE=""

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ML Q&A Module - Test Script         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}\n"

# Función para imprimir encabezado
print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Función para imprimir respuesta
print_response() {
  echo -e "${GREEN}✓ Response:${NC}"
  echo "$1" | jq . 2>/dev/null || echo "$1"
}

# Función para imprimir error
print_error() {
  echo -e "${RED}✗ Error: $1${NC}"
}

# Test 1: Health Check
test_health() {
  print_header "1. Health Check"
  
  response=$(curl -s -X GET "$BASE_URL/api/health")
  print_response "$response"
}

# Test 2: Initiate OAuth
test_oauth_authorize() {
  print_header "2. Initiate OAuth Authorization"
  
  response=$(curl -s -X POST "$BASE_URL/api/oauth/authorize" \
    -H "Content-Type: application/json")
  
  print_response "$response"
  
  # Extraer estado y URL
  STATE=$(echo "$response" | jq -r '.state' 2>/dev/null)
  AUTH_URL=$(echo "$response" | jq -r '.authUrl' 2>/dev/null)
  
  if [ "$STATE" != "null" ] && [ -n "$STATE" ]; then
    echo -e "${GREEN}✓ State captured: ${YELLOW}$STATE${NC}"
    echo -e "${BLUE}📝 Copy this URL to your browser to authenticate:${NC}"
    echo -e "${YELLOW}$AUTH_URL${NC}\n"
  fi
}

# Test 3: OAuth Callback (Manual)
test_oauth_callback() {
  print_header "3. OAuth Callback"
  
  read -p "Enter the authorization code from the callback: " AUTH_CODE
  
  if [ -z "$AUTH_CODE" ]; then
    print_error "No authorization code provided"
    return 1
  fi
  
  response=$(curl -s -X GET "$BASE_URL/api/oauth/callback?code=$AUTH_CODE&state=$STATE")
  print_response "$response"
  
  # Extraer token
  TOKEN=$(echo "$response" | jq -r '.data.localToken' 2>/dev/null)
  USER_ID=$(echo "$response" | jq -r '.data.mlUserId' 2>/dev/null)
  
  if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Token captured${NC}"
    echo -e "${BLUE}User ID: ${YELLOW}$USER_ID${NC}\n"
  fi
}

# Test 4: Get Auth Status
test_oauth_status() {
  print_header "4. Get Authentication Status"
  
  if [ -z "$TOKEN" ]; then
    print_error "No token available. Run OAuth tests first."
    return 1
  fi
  
  response=$(curl -s -X GET "$BASE_URL/api/oauth/status" \
    -H "Authorization: Bearer $TOKEN")
  
  print_response "$response"
}

# Test 5: Sync Seller Questions
test_sync_questions() {
  print_header "5. Sync Questions for Seller"
  
  if [ -z "$TOKEN" ]; then
    print_error "No token available. Run OAuth tests first."
    return 1
  fi
  
  read -p "Enter Seller ID: " SELLER_ID
  
  if [ -z "$SELLER_ID" ]; then
    print_error "No seller ID provided"
    return 1
  fi
  
  response=$(curl -s -X POST "$BASE_URL/api/qna/sellers/$SELLER_ID/sync" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  print_response "$response"
}

# Test 6: Get Unanswered Questions
test_unanswered() {
  print_header "6. Get Unanswered Questions"
  
  if [ -z "$TOKEN" ]; then
    print_error "No token available. Run OAuth tests first."
    return 1
  fi
  
  read -p "Enter Seller ID: " SELLER_ID
  
  if [ -z "$SELLER_ID" ]; then
    print_error "No seller ID provided"
    return 1
  fi
  
  response=$(curl -s -X GET "$BASE_URL/api/qna/sellers/$SELLER_ID/unanswered?limit=10" \
    -H "Authorization: Bearer $TOKEN")
  
  print_response "$response"
}

# Test 7: Get Answered Questions
test_answered() {
  print_header "7. Get Answered Questions"
  
  if [ -z "$TOKEN" ]; then
    print_error "No token available. Run OAuth tests first."
    return 1
  fi
  
  read -p "Enter Seller ID: " SELLER_ID
  
  if [ -z "$SELLER_ID" ]; then
    print_error "No seller ID provided"
    return 1
  fi
  
  response=$(curl -s -X GET "$BASE_URL/api/qna/sellers/$SELLER_ID/answered?limit=10&skip=0" \
    -H "Authorization: Bearer $TOKEN")
  
  print_response "$response"
}

# Test 8: Get Questions for Item
test_item_questions() {
  print_header "8. Get Questions for Specific Item"
  
  if [ -z "$TOKEN" ]; then
    print_error "No token available. Run OAuth tests first."
    return 1
  fi
  
  read -p "Enter Item ID (e.g., MLB123456789): " ITEM_ID
  
  if [ -z "$ITEM_ID" ]; then
    print_error "No item ID provided"
    return 1
  fi
  
  response=$(curl -s -X GET "$BASE_URL/api/qna/items/$ITEM_ID/questions" \
    -H "Authorization: Bearer $TOKEN")
  
  print_response "$response"
}

# Test 9: Answer a Question
test_answer_question() {
  print_header "9. Answer a Question"
  
  if [ -z "$TOKEN" ]; then
    print_error "No token available. Run OAuth tests first."
    return 1
  fi
  
  read -p "Enter Question ID: " QUESTION_ID
  read -p "Enter your answer: " ANSWER_TEXT
  
  if [ -z "$QUESTION_ID" ] || [ -z "$ANSWER_TEXT" ]; then
    print_error "Missing question ID or answer text"
    return 1
  fi
  
  response=$(curl -s -X POST "$BASE_URL/api/qna/questions/$QUESTION_ID/answer" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$ANSWER_TEXT\"}")
  
  print_response "$response"
}

# Test 10: Refresh Token
test_refresh_token() {
  print_header "10. Refresh JWT Token"
  
  if [ -z "$TOKEN" ]; then
    print_error "No token available. Run OAuth tests first."
    return 1
  fi
  
  response=$(curl -s -X POST "$BASE_URL/api/oauth/refresh" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  print_response "$response"
  
  # Actualizar token
  NEW_TOKEN=$(echo "$response" | jq -r '.data.token' 2>/dev/null)
  if [ "$NEW_TOKEN" != "null" ] && [ -n "$NEW_TOKEN" ]; then
    TOKEN=$NEW_TOKEN
    echo -e "${GREEN}✓ Token refreshed${NC}"
  fi
}

# Test 11: Logout
test_logout() {
  print_header "11. Logout"
  
  if [ -z "$TOKEN" ]; then
    print_error "No token available. Run OAuth tests first."
    return 1
  fi
  
  response=$(curl -s -X POST "$BASE_URL/api/oauth/logout" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  print_response "$response"
  
  if echo "$response" | jq . 2>/dev/null | grep -q "success"; then
    TOKEN=""
    echo -e "${GREEN}✓ Logged out successfully${NC}"
  fi
}

# Menu interactivo
show_menu() {
  echo -e "\n${BLUE}Available Tests:${NC}\n"
  echo "  1. Health Check"
  echo "  2. OAuth Authorize"
  echo "  3. OAuth Callback"
  echo "  4. Get Auth Status"
  echo "  5. Sync Seller Questions"
  echo "  6. Get Unanswered Questions"
  echo "  7. Get Answered Questions"
  echo "  8. Get Item Questions"
  echo "  9. Answer Question"
  echo "  10. Refresh Token"
  echo "  11. Logout"
  echo "  0. Exit"
  echo ""
}

# Main loop
while true; do
  show_menu
  read -p "Select test (0-11): " choice
  
  case $choice in
    1) test_health ;;
    2) test_oauth_authorize ;;
    3) test_oauth_callback ;;
    4) test_oauth_status ;;
    5) test_sync_questions ;;
    6) test_unanswered ;;
    7) test_answered ;;
    8) test_item_questions ;;
    9) test_answer_question ;;
    10) test_refresh_token ;;
    11) test_logout ;;
    0) echo -e "\n${GREEN}Goodbye!${NC}\n"; exit 0 ;;
    *) print_error "Invalid option" ;;
  esac
done
