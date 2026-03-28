# ✅ UPDATED: Environment Variables Configuration Guide

## 🎯 Overview

Firebase has **deprecated** `functions.config()`. We now use **environment variables** which is the modern, recommended approach.

---

## 📝 Your Configuration is Already Set!

The setup script already created a `.env` file in the `functions/` folder with your API keys.

**Location**: `/Users/anujparashar/maplekids-website-master/functions/.env`

---

## 🔧 How to Configure (Manual Method)

If you need to update or verify your configuration:

### Step 1: Edit the .env File

```bash
cd /Users/anujparashar/maplekids-website-master/functions

# Edit .env file
nano .env
```

### Step 2: Add Your API Keys

Your `.env` file should look like this:

```env
# Gemini AI Configuration (paste key from Google AI Studio; do not commit)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# WhatsApp Configuration  
WHATSAPP_ACCESS_TOKEN=YOUR_WHATSAPP_TOKEN
WHATSAPP_PHONE_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN=your_secret_verify_token
# Meta App Secret (Settings → Basic) — required in production for webhook POST signature verification
WHATSAPP_APP_SECRET=YOUR_META_APP_SECRET
```

### Step 3: Save and Close

- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

---

## 🚀 Deploying to Firebase (Production)

When deploying to Firebase, you need to set environment variables via the Firebase Console:

### Method 1: Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: "maplekids-website" (or your project name)

2. **Navigate to Functions**
   - Click "Functions" in left sidebar
   - Click "⚙️" (gear icon) → "Configuration"

3. **Add Environment Variables**
   - Click "+ Add variable"
   - Add each variable:
     - `GEMINI_API_KEY` = Your Gemini API key
     - `WHATSAPP_ACCESS_TOKEN` = Your WhatsApp token
     - `WHATSAPP_PHONE_ID` = Your phone number ID
     - `WHATSAPP_VERIFY_TOKEN` = same value you enter in Meta webhook setup
     - `WHATSAPP_APP_SECRET` = Meta app secret (required in production for POST body verification)

4. **Save and Redeploy**
   ```bash
   firebase deploy --only functions
   ```

### Method 2: Using .env File for Deployment

You can also create a `.env.production` file and Firebase CLI will use it:

```bash
cd /Users/anujparashar/maplekids-website-master

# Create .env file at root for deployment
cat > .env << 'EOF'
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
WHATSAPP_ACCESS_TOKEN=YOUR_TOKEN
WHATSAPP_PHONE_ID=YOUR_PHONE_ID
WHATSAPP_VERIFY_TOKEN=your_secret_verify_token
WHATSAPP_APP_SECRET=YOUR_META_APP_SECRET
EOF

# Deploy (Firebase will read from .env)
firebase deploy --only functions
```

---

## ✅ Verify Configuration

### For Local Development:

```bash
cd /Users/anujparashar/maplekids-website-master/functions

# Check if .env file exists
ls -la .env

# View contents (be careful not to share this!)
cat .env
```

### For Production (After Deploy):

```bash
# Check deployed environment
firebase functions:config:get

# View function logs
firebase functions:log --only whatsappWebhook
```

---

## 🔐 Security Checklist

- [x] ✅ `.env` file is in `.gitignore`
- [x] ✅ Never commit API keys to Git
- [x] ✅ Use different keys for development vs production
- [ ] 🔄 Set production keys in Firebase Console
- [ ] 🔄 Rotate keys every 3-6 months

---

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY is not defined"

**Solution**:
```bash
# Check if .env file exists
cd functions
cat .env

# If empty, add your key:
echo 'GEMINI_API_KEY=YOUR_GEMINI_API_KEY' >> .env
```

### Error: "Webhook verification failed"

**Solution**:
```bash
# Check verify token
grep WHATSAPP_VERIFY_TOKEN functions/.env

# Make sure it matches what you set in Meta Business Suite
```

### Error: "Cannot find module 'dotenv'"

**Solution**:
```bash
cd functions
npm install dotenv --save
```

---

## 📚 Environment Variable Priority

The code reads environment variables from the **Functions runtime** (`.env` with the emulator, or Firebase Console / `firebase functions:secrets` in production). There are **no** safe defaults for `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN`, or `WHATSAPP_APP_SECRET` (production POSTs).

---

## 🎯 Quick Reference

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `GEMINI_API_KEY` | Google AI Studio | (paste full key; never commit) |
| `WHATSAPP_ACCESS_TOKEN` | Meta Business Suite | `EAABsz...` |
| `WHATSAPP_PHONE_ID` | Meta WhatsApp Config | `1234567890` |
| `WHATSAPP_VERIFY_TOKEN` | You create this (Meta webhook) | `my_verify_secret` |
| `WHATSAPP_APP_SECRET` | Meta App → Settings → Basic | App secret string |

---

## ✨ What Changed?

### Old Way (Deprecated):
```typescript
const API_KEY = functions.config().gemini?.api_key
```

### New Way (Current):
```typescript
const API_KEY = process.env.GEMINI_API_KEY
```

**Benefits**:
- ✅ Simpler and more standard
- ✅ Works with all cloud platforms (not just Firebase)
- ✅ Better for local development
- ✅ No deprecation warnings
- ✅ Future-proof

---

## 🚀 Next Steps

1. **Verify your `.env` file** is correctly set
2. **Test locally** using Firebase emulator
3. **Deploy to production** and set environment variables in Firebase Console
4. **Set up Meta WhatsApp webhook** (see WHATSAPP_AI_SETUP.md)

---

**Your configuration is complete! The code has been updated to use environment variables.** ✅
