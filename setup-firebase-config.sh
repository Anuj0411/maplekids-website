#!/bin/bash

# Firebase Functions Configuration Script for WhatsApp AI Assistant
# This script helps you configure API keys and tokens

echo "🔧 Firebase Functions Configuration Setup"
echo "=========================================="
echo ""

# Function to read user input
read_input() {
    local prompt="$1"
    local var_name="$2"
    local default="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " value
        echo "${value:-$default}"
    else
        read -p "$prompt: " value
        echo "$value"
    fi
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed!"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Login check
echo "Checking Firebase login..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  You're not logged in to Firebase"
    echo "Running: firebase login"
    firebase login
fi

echo ""
echo "📝 Please provide the following credentials:"
echo ""

# Gemini API Key
echo "1️⃣  GEMINI API KEY"
echo "   Get it from: https://aistudio.google.com/app/apikey"
GEMINI_KEY=$(read_input "   Enter Gemini API key (starts with AIza...)" "gemini_key")

# WhatsApp Access Token
echo ""
echo "2️⃣  WHATSAPP ACCESS TOKEN"
echo "   Get it from: Meta Developer Dashboard > WhatsApp > API Setup"
WHATSAPP_TOKEN=$(read_input "   Enter WhatsApp access token" "whatsapp_token" "TEMP_TOKEN_FOR_NOW")

# WhatsApp Phone Number ID
echo ""
echo "3️⃣  WHATSAPP PHONE NUMBER ID"
echo "   Get it from: Meta Developer Dashboard > WhatsApp > API Setup"
WHATSAPP_PHONE=$(read_input "   Enter WhatsApp phone number ID" "whatsapp_phone" "TEMP_PHONE_ID")

# WhatsApp Verify Token
echo ""
echo "4️⃣  WHATSAPP VERIFY TOKEN"
echo "   Create a secure random string for webhook verification"
VERIFY_TOKEN=$(read_input "   Enter verify token" "verify_token" "maplekids_whatsapp_verify_$(date +%s)")

echo ""
echo "🚀 Setting Firebase Functions config..."
echo ""

# Set Gemini API Key
if [ -n "$GEMINI_KEY" ] && [ "$GEMINI_KEY" != "TEMP_TOKEN_FOR_NOW" ]; then
    echo "Setting Gemini API key..."
    firebase functions:config:set gemini.api_key="$GEMINI_KEY"
else
    echo "⚠️  Skipping Gemini API key (empty or placeholder)"
fi

# Set WhatsApp credentials
if [ -n "$WHATSAPP_TOKEN" ]; then
    echo "Setting WhatsApp token..."
    firebase functions:config:set whatsapp.token="$WHATSAPP_TOKEN"
fi

if [ -n "$WHATSAPP_PHONE" ]; then
    echo "Setting WhatsApp phone ID..."
    firebase functions:config:set whatsapp.phone_id="$WHATSAPP_PHONE"
fi

if [ -n "$VERIFY_TOKEN" ]; then
    echo "Setting WhatsApp verify token..."
    firebase functions:config:set whatsapp.verify_token="$VERIFY_TOKEN"
fi

echo ""
echo "✅ Configuration complete!"
echo ""
echo "📋 Current configuration:"
firebase functions:config:get

echo ""
echo "💾 Saving configuration to .env file for local development..."

# Create .env file for local development
cat > functions/.env << EOF
# Firebase Functions Environment Variables
# DO NOT COMMIT THIS FILE TO GIT!
# Generated on $(date)

# Gemini AI API Key
GEMINI_API_KEY=$GEMINI_KEY

# WhatsApp Cloud API Credentials
WHATSAPP_ACCESS_TOKEN=$WHATSAPP_TOKEN
WHATSAPP_PHONE_ID=$WHATSAPP_PHONE
WHATSAPP_VERIFY_TOKEN=$VERIFY_TOKEN
EOF

echo "✅ Created functions/.env file"

# Update .gitignore
if ! grep -q "^\.env$" functions/.gitignore 2>/dev/null; then
    echo ".env" >> functions/.gitignore
    echo "✅ Added .env to functions/.gitignore"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Review configuration: firebase functions:config:get"
echo "2. Build functions: cd functions && npm run build"
echo "3. Deploy functions: firebase deploy --only functions"
echo ""
echo "⚠️  IMPORTANT: Your verify token is: $VERIFY_TOKEN"
echo "    Save this - you'll need it for Meta webhook configuration!"
echo ""
