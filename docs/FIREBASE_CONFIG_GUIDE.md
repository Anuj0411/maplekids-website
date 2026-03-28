# Firebase Functions Configuration Guide

## 🎯 Quick Setup (2 Methods)

### **Method 1: Automated Script (Recommended)** ✨

Run the configuration script:

```bash
cd /Users/anujparashar/maplekids-website-master
./setup-firebase-config.sh
```

Follow the prompts to enter:
1. Gemini API key
2. WhatsApp access token
3. WhatsApp phone number ID
4. Verify token

---

### **Method 2: Manual Configuration** 🛠️

#### Step 1: Set Gemini API Key

```bash
# Navigate to project root
cd /Users/anujparashar/maplekids-website-master

# Set Gemini API key
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"

# Example (use your actual key):
# firebase functions:config:set gemini.api_key="AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q"
```

#### Step 2: Set WhatsApp Credentials (Optional for now)

```bash
# WhatsApp access token
firebase functions:config:set whatsapp.token="YOUR_WHATSAPP_TOKEN"

# WhatsApp phone number ID
firebase functions:config:set whatsapp.phone_id="YOUR_PHONE_NUMBER_ID"

# Verify token (create a random secure string)
firebase functions:config:set whatsapp.verify_token="maplekids_secure_token_2026"
```

#### Step 3: Verify Configuration

```bash
firebase functions:config:get
```

Expected output:
```json
{
  "gemini": {
    "api_key": "AIzaSy..."
  },
  "whatsapp": {
    "token": "EAA...",
    "phone_id": "123456789",
    "verify_token": "maplekids_secure_token_2026"
  }
}
```

---

## 🖥️ Local Development Setup

For testing locally with Firebase Emulator:

```bash
# Create .env file in functions directory
cd /Users/anujparashar/maplekids-website-master/functions

# Create .env file
cat > .env << 'EOF'
# Gemini AI
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=YOUR_WHATSAPP_TOKEN
WHATSAPP_PHONE_ID=YOUR_PHONE_ID
WHATSAPP_VERIFY_TOKEN=maplekids_secure_token_2026
EOF

# Add .env to .gitignore (prevent committing secrets)
echo ".env" >> .gitignore
```

---

## 🚀 Deploy After Configuration

```bash
# Build functions
cd /Users/anujparashar/maplekids-website-master/functions
npm run build

# Deploy to Firebase
cd ..
firebase deploy --only functions
```

---

## ✅ Test Configuration

### Test Gemini API Key

Create a quick test:

```bash
cd /Users/anujparashar/maplekids-website-master/functions

# Create test file
cat > test-config.js << 'EOF'
const functions = require('firebase-functions');

// This will work after deploying
const geminiKey = functions.config().gemini?.api_key;
const whatsappToken = functions.config().whatsapp?.token;

console.log('Gemini API Key:', geminiKey ? '✅ Configured' : '❌ Missing');
console.log('WhatsApp Token:', whatsappToken ? '✅ Configured' : '❌ Missing');
EOF

# For local testing with .env
cat > test-local.js << 'EOF'
require('dotenv').config();

console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('WhatsApp Token:', process.env.WHATSAPP_ACCESS_TOKEN ? '✅ Set' : '❌ Missing');
console.log('WhatsApp Phone:', process.env.WHATSAPP_PHONE_ID ? '✅ Set' : '❌ Missing');
console.log('Verify Token:', process.env.WHATSAPP_VERIFY_TOKEN ? '✅ Set' : '❌ Missing');
EOF

# Install dotenv for local testing
npm install dotenv

# Run test
node test-local.js
```

---

## 🔒 Security Checklist

- [ ] Never commit API keys to Git
- [ ] Add `.env` to `.gitignore`
- [ ] Use Firebase config for production (secure)
- [ ] Use `.env` only for local development
- [ ] Rotate keys every 3-6 months
- [ ] Don't share keys in chat/email

---

## 🐛 Troubleshooting

### "Error: Failed to set config"

**Solution**: Make sure you're logged in to Firebase
```bash
firebase login
firebase projects:list  # Should show your project
```

### "Config not working in deployed function"

**Solution**: Firebase config is set per project environment
```bash
# Set for default project
firebase use default

# Or set for specific project
firebase use YOUR_PROJECT_ID

# Then set config again
firebase functions:config:set gemini.api_key="YOUR_KEY"
```

### "Config works locally but not in production"

**Solution**: Firebase config and .env are separate
- **Local**: Uses `.env` file
- **Production**: Uses `firebase functions:config:set`

You need to set both!

---

## 📋 Configuration Variables Reference

| Variable | Purpose | Required | Where to Get |
|----------|---------|----------|--------------|
| `gemini.api_key` | Gemini AI API access | ✅ Yes | https://aistudio.google.com/app/apikey |
| `whatsapp.token` | WhatsApp messaging | ⚠️ For production | Meta Developer Dashboard |
| `whatsapp.phone_id` | WhatsApp phone number | ⚠️ For production | Meta Developer Dashboard |
| `whatsapp.verify_token` | Webhook verification | ⚠️ For production | Create your own secure string |

---

## 🎓 Understanding Firebase Config

### How it works:

1. **Development (Local)**:
   ```typescript
   const key = process.env.GEMINI_API_KEY; // From .env file
   ```

2. **Production (Deployed)**:
   ```typescript
   const key = functions.config().gemini?.api_key; // From Firebase config
   ```

3. **Our Code (Handles Both)**:
   ```typescript
   const key = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY;
   ```

This is already implemented in `geminiService.ts`:
```typescript
const GEMINI_API_KEY = functions.config().gemini?.api_key || process.env.GEMINI_API_KEY || '';
```

---

## 🎯 Quick Commands Reference

```bash
# Set single config value
firebase functions:config:set key="value"

# Set multiple values
firebase functions:config:set gemini.api_key="xxx" whatsapp.token="yyy"

# View all config
firebase functions:config:get

# View specific config
firebase functions:config:get gemini

# Remove config value
firebase functions:config:unset gemini.api_key

# Clone config from one project to another
firebase functions:config:get > config.json
firebase use other-project
firebase functions:config:set $(cat config.json)
```

---

## 📝 Next Steps

After configuration:

1. ✅ Build: `cd functions && npm run build`
2. ✅ Deploy: `firebase deploy --only functions`
3. ✅ Get function URL from deployment output
4. ✅ Configure Meta webhook with the URL
5. ✅ Test by sending a WhatsApp message

---

**Need help?** Run the automated script or follow the manual steps above!
