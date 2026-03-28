# WhatsApp AI Assistant - Setup Guide

## 🎯 Overview

This guide will help you set up the WhatsApp AI Assistant for Maplekids Play School. The assistant uses:
- **Meta Cloud API** for WhatsApp messaging
- **Google Gemini AI** for intelligent responses  
- **Firebase Cloud Functions** for serverless backend
- **Firestore** for data storage

---

## 📋 Prerequisites

1. **Meta Business Account** (free)
2. **WhatsApp Business Phone Number** (can use test number initially)
3. **Google Cloud Account** (free tier available)
4. **Gemini API Key** (free: 60 requests/minute)
5. **Firebase Project** (already set up for Maplekids)

---

## 🚀 Step-by-Step Setup

### Phase 1: Get Gemini API Key (5 minutes)

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select your Google Cloud project (or create new)
   - Copy the API key (starts with `AIza...`)
   - **IMPORTANT**: Save this key securely!

3. **Configure Firebase**
   ```bash
   # From your project root
   firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY_HERE"
   ```

4. **Verify Configuration**
   ```bash
   firebase functions:config:get
   ```

---

### Phase 2: Set Up Meta WhatsApp Cloud API (15 minutes)

1. **Create Meta Business Account**
   - Go to: https://business.facebook.com
   - Click "Create Account"
   - Fill in business details

2. **Access Meta App Dashboard**
   - Go to: https://developers.facebook.com
   - Click "My Apps" → "Create App"
   - Select "Business" type
   - Name it "Maplekids WhatsApp Bot"

3. **Add WhatsApp Product**
   - In app dashboard, click "Add Product"
   - Find "WhatsApp" and click "Set Up"
   - You'll get a **Test Phone Number** (free)

4. **Get Your Credentials**
   You'll need 3 things:
   
   **a) Access Token** (Temporary - 24 hours)
   - In WhatsApp > Getting Started
   - Copy the "Temporary Access Token"
   
   **b) Phone Number ID**
   - In WhatsApp > Getting Started
   - Copy the "Phone number ID"
   
   **c) Business Account ID**
   - Top of the dashboard
   - Copy the "WhatsApp Business Account ID"

5. **Configure Firebase**
   ```bash
   firebase functions:config:set whatsapp.token="YOUR_ACCESS_TOKEN"
   firebase functions:config:set whatsapp.phone_id="YOUR_PHONE_NUMBER_ID"
   firebase functions:config:set whatsapp.verify_token="maplekids_2026_secure_token"
   ```

---

### Phase 3: Deploy Cloud Functions (10 minutes)

1. **Build Functions**
   ```bash
   cd functions
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   cd ..
   firebase deploy --only functions
   ```

3. **Copy the Webhook URL**
   After deployment, you'll see:
   ```
   ✔  functions[whatsappWebhook(us-central1)]: Successful create operation.
   Function URL (whatsappWebhook): https://YOUR-PROJECT.cloudfunctions.net/whatsappWebhook
   ```
   
   **SAVE THIS URL!** You'll need it for Meta.

---

### Phase 4: Configure Meta Webhook (10 minutes)

1. **Go to WhatsApp Configuration**
   - In Meta App Dashboard
   - WhatsApp > Configuration

2. **Set Webhook URL**
   - Click "Edit" under Webhook
   - Paste your Cloud Function URL
   - Verify Token: `maplekids_2026_secure_token`
   - Click "Verify and Save"

3. **Subscribe to Webhook Fields**
   - Click "Manage" under Webhook Fields
   - Check these boxes:
     - ☑ messages
     - ☑ message_status (optional, for delivery tracking)
   - Click "Save"

4. **Test Webhook**
   - Meta will send a verification request
   - Check Cloud Function logs:
     ```bash
     firebase functions:log --only whatsappWebhook
     ```
   - You should see: "Webhook verified successfully! ✅"

---

### Phase 5: Test Your AI Assistant (5 minutes)

1. **Send Test Message**
   - In Meta Dashboard, you'll see "Send and receive messages"
   - Add your personal WhatsApp number
   - Meta will send you a code via WhatsApp
   - Enter the code to verify

2. **Chat with Your Bot**
   - Send: "Hello"
   - Bot should respond with greeting
   - Send: "Tell me about fees"
   - Bot should give intelligent response

3. **Check Logs**
   ```bash
   firebase functions:log
   ```
   
   You should see:
   ```
   📩 Message from +91XXXXXXXXXX: Hello
   🤖 Generating AI response for user: +91XXXXXXXXXX
   ✅ AI response generated (xxx chars)
   ✅ Message sent successfully
   ```

---

## 🔧 Local Development & Testing

### Test Locally with Emulator

1. **Install Firebase Emulator**
   ```bash
   firebase init emulators
   # Select: Functions, Firestore
   ```

2. **Set Environment Variables**
   Create `.env` file in `functions/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
   WHATSAPP_PHONE_ID=your_phone_number_id
   WHATSAPP_VERIFY_TOKEN=maplekids_2026_secure_token
   ```

3. **Start Emulator**
   ```bash
   npm run serve
   ```
   
   You'll see:
   ```
   ✔  functions: Emulator started at http://localhost:5001
   ```

4. **Test with cURL**
   ```bash
   # Test webhook verification
   curl "http://localhost:5001/YOUR-PROJECT/us-central1/whatsappWebhook?hub.mode=subscribe&hub.verify_token=maplekids_2026_secure_token&hub.challenge=test123"
   
   # Should return: test123
   ```

---

## 📊 Monitor & Debug

### View Cloud Function Logs

```bash
# Real-time logs
firebase functions:log --only whatsappWebhook

# Filter by error
firebase functions:log --only whatsappWebhook --lines 50 | grep ERROR

# Specific timeframe
firebase functions:log --only whatsappWebhook --since 2h
```

### Check Firestore Data

1. **Go to Firebase Console**
   - https://console.firebase.google.com
   - Select your project
   - Firestore Database

2. **Check Collections**
   - `whatsapp_messages` - All incoming/outgoing messages
   - `whatsapp_users` - User profiles
   - `whatsapp_conversations` - AI conversation history

---

## 🔐 Security Best Practices

### 1. Secure Your Tokens

```bash
# NEVER commit these to Git!
# Use Firebase Config (production)
firebase functions:config:set key="value"

# Use .env file (local development)
# Add .env to .gitignore
```

### 2. Verify Meta Signatures (Advanced)

Add to `webhook.ts`:
```typescript
import crypto from 'crypto';

function verifyMetaSignature(req: Request): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  const APP_SECRET = functions.config().whatsapp.app_secret;
  
  const hmac = crypto
    .createHmac('sha256', APP_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  return signature === `sha256=${hmac}`;
}
```

### 3. Rate Limiting

```typescript
// Prevent spam
const messageTimestamps = new Map<string, number>();

function isRateLimited(userId: string): boolean {
  const lastMessage = messageTimestamps.get(userId) || 0;
  const now = Date.now();
  
  if (now - lastMessage < 2000) { // 2 seconds
    return true;
  }
  
  messageTimestamps.set(userId, now);
  return false;
}
```

---

## 🐛 Troubleshooting

### Issue: "Webhook verification failed"

**Solution**:
- Check verify token matches exactly
- Ensure Cloud Function is deployed
- Check function logs for errors

### Issue: "Gemini API error"

**Solution**:
- Verify API key is correct
- Check quota limits (60/minute for free tier)
- Check logs for specific error message

### Issue: "Message not sending"

**Solution**:
- Verify access token is valid (24hr expiry)
- Check phone number is in test numbers list
- Ensure Meta app is not in development mode restrictions

### Issue: "No response from bot"

**Solution**:
- Check Cloud Function logs
- Verify webhook is receiving messages
- Test Gemini API separately

---

## 📈 Next Steps

1. **Get Permanent Access Token** (current expires in 24hrs)
   - WhatsApp > Configuration > Access Tokens
   - Generate "System User Token"
   - Set it to "Never Expire"

2. **Add Your Business Phone Number**
   - Currently using test number
   - Add real business line in Meta Business Suite
   - Requires Business Verification (may take 1-2 weeks)

3. **Create Message Templates**
   - For proactive messages (fee reminders, etc.)
   - Templates need Meta approval (24-48 hours)

4. **Integrate Real Data**
   - Connect to student database
   - Link users to students
   - Fetch real fees, attendance, reports

5. **Add Advanced Features**
   - Voice message support
   - Image processing
   - Payment integration
   - Scheduled notifications

---

## 💰 Cost Management

### Free Tier Limits

- **WhatsApp**: 1,000 conversations/month
- **Gemini**: 60 requests/minute, unlimited daily
- **Firebase Functions**: 2M invocations/month
- **Firestore**: 50K reads/day, 20K writes/day

### Monitor Usage

```bash
# Check function invocations
firebase functions:log --only whatsappWebhook | grep "Processed message" | wc -l

# Check Firestore usage
# Firebase Console > Usage tab
```

### Cost Optimization

1. **Cache responses** for common queries
2. **Batch Firestore writes**
3. **Use shorter conversation history** (limit to last 5 messages)
4. **Compress stored data**

---

## 📞 Support

**If you get stuck:**

1. Check Cloud Function logs
2. Review Meta App Dashboard > WhatsApp > Insights
3. Test each component separately:
   - Webhook verification
   - Gemini API
   - WhatsApp sending
4. Check GitHub Issues (if you push this to GitHub)
5. Contact Meta/Google support

---

## ✅ Configuration Checklist

- [ ] Gemini API key obtained
- [ ] Firebase config set for Gemini
- [ ] Meta Business Account created
- [ ] WhatsApp app created in Meta
- [ ] Access token, Phone ID, Verify token copied
- [ ] Firebase config set for WhatsApp
- [ ] Cloud Functions deployed
- [ ] Webhook URL configured in Meta
- [ ] Webhook verified successfully
- [ ] Test message sent and received
- [ ] Logs showing successful processing

**When all checked, your AI Assistant is live! 🎉**

---

**Estimated Total Setup Time**: 45 minutes  
**Cost**: FREE (within free tier limits)  
**Difficulty**: Intermediate (requires following steps carefully)

Good luck! 🚀
