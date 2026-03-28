# 📱 Creating Facebook Page for Maplekids WhatsApp Setup

## 🚨 Why You Need This

WhatsApp Business API requires a **Facebook Page** as the foundation. You cannot access Meta Business Suite without it.

---

## ✅ Step-by-Step: Create Facebook Page

### Step 1: Go to Facebook Pages

1. **Open your browser** and go to: https://www.facebook.com/pages/create
2. **Log in** with your Facebook account (अनुज पाराशर)

### Step 2: Create Page

1. Click **"Create New Page"**

2. **Fill in Page Details**:
   ```
   Page Name: Maplekids Play School
   Category: Education
   Bio: Quality education for young learners in Hatta, Madhya Pradesh
   ```

3. **Add Profile Picture**:
   - Upload Maplekids logo (use the one from `/src/assets/maplekids_logo.jpg`)

4. **Add Cover Photo**:
   - Upload a school photo (you can use `/src/assets/school_image.jpg`)

5. Click **"Create Page"**

### Step 3: Complete Page Setup

1. **Add Contact Information**:
   - Phone: `8878286663` (your WhatsApp number)
   - Website: `https://maplekids-website.web.app` (or your actual website)
   - Address: `Hatta, Madhya Pradesh, India`

2. **Add About Section**:
   ```
   Maplekids Play School provides quality early childhood education 
   for children in Play, Nursery, LKG, UKG, and 1st grade. 
   
   🎓 Classes: Play, Nursery, LKG, UKG, 1st
   ⏰ Timing: 9:00 AM - 1:00 PM
   📍 Location: Hatta, Madhya Pradesh
   📱 Contact: Available via WhatsApp
   ```

3. **Publish the Page**

---

## 🎯 Step 4: Access Meta Business Suite

Once your page is created:

1. **Go to Meta Business Suite**: https://business.facebook.com
2. You should now see your **Maplekids Play School** page
3. Click on the page to access it

---

## 📱 Step 5: Set Up WhatsApp Business

Now that you have a Facebook Page, you can set up WhatsApp:

### 5.1: Go to WhatsApp Settings

1. In Meta Business Suite, click **"All Tools"** in left sidebar
2. Find and click **"WhatsApp"**
3. Click **"Get Started"**

### 5.2: Connect Phone Number

1. **Choose**: "Use a number you already have"
2. **Enter**: `8878286663` (your phone number)
3. **Verify** via SMS code

   ⚠️ **IMPORTANT**: This number will be BUSINESS-ONLY. You won't be able to use regular WhatsApp on it anymore!

### 5.3: Create WhatsApp Business Account

1. **Business Name**: `Maplekids Play School`
2. **Category**: `Education`
3. **Description**: Same as Facebook Page description
4. **Profile Photo**: Upload Maplekids logo

### 5.4: Get API Credentials

Once WhatsApp is set up:

1. Go to **Meta App Dashboard**: https://developers.facebook.com/apps
2. Click **"Create App"**
3. Choose **"Business"** type
4. App Name: `Maplekids WhatsApp Bot`
5. Click **"Create App"**

6. In your app dashboard:
   - Go to **"WhatsApp" → "Getting Started"**
   - You'll see:
     - ✅ **Phone Number ID** (copy this)
     - ✅ **Access Token** (click "Generate" and copy)

---

## 🔑 Step 6: Update Your .env File

Once you have the credentials:

```bash
cd /Users/anujparashar/maplekids-website-master/functions

# Edit .env file
nano .env
```

**Replace** the `TEMP_TOKEN_FOR_NOW` with your **real Access Token**:

```env
# Gemini AI Configuration (from Google AI Studio — never commit real keys)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=YOUR_META_WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_VERIFY_TOKEN=your_secret_verify_token
```

**Save**: `Ctrl + X` → `Y` → `Enter`

---

## ⚠️ IMPORTANT WARNINGS

### 1. Phone Number Will Become Business-Only
- Once you connect `8878286663` to WhatsApp Business API
- You **CANNOT** use regular WhatsApp on this number
- All messages will go through the API only
- Consider using a **different number** for the API if you use this for personal chats

### 2. Recommended: Use a Separate Number
If you use `8878286663` for personal WhatsApp:

**Option A**: Get a new number for WhatsApp Business API
- Buy a new SIM card for school use only
- Use it exclusively for school WhatsApp communications

**Option B**: Use a virtual number service
- Services like Twilio, MessageBird provide WhatsApp-enabled numbers
- Costs around ₹500-1000/month

---

## 📋 Quick Checklist

- [ ] Create Facebook Page for Maplekids
- [ ] Add page details, logo, cover photo
- [ ] Access Meta Business Suite
- [ ] Decide: Use existing number OR get new number
- [ ] Set up WhatsApp Business Account
- [ ] Create Meta App
- [ ] Get Phone Number ID
- [ ] Get Access Token
- [ ] Update functions/.env file
- [ ] Deploy to Firebase

---

## 🆘 Troubleshooting

### "This number is already registered on WhatsApp"
- You're using regular WhatsApp on this number
- You need to **delete** regular WhatsApp first
- OR use a different number

### "Cannot verify phone number"
- Make sure you receive SMS on this number
- Try calling verification instead of SMS
- Check number format: include country code (+91 for India)

### "Access Token expires quickly"
- Temporary tokens expire in 24 hours
- You need to generate a **Permanent Token**
- Go to App Settings → WhatsApp → Configuration → System User → Generate Token

---

## 🚀 Next Steps After Setup

Once you have the credentials configured:

1. **Deploy Functions**:
   ```bash
   cd /Users/anujparashar/maplekids-website-master
   firebase deploy --only functions
   ```

2. **Configure Webhook** in Meta App:
   - Callback URL: Your deployed function URL
   - Verify Token: `maplekids_whatsapp_verify_1769855959`

3. **Test**: Send a WhatsApp message and see AI response!

---

## 📞 Need Help?

If you get stuck, you can:
1. Check Meta's official guide: https://developers.facebook.com/docs/whatsapp
2. Watch setup videos on YouTube: "WhatsApp Business API setup"
3. Contact Meta Business Support from Business Suite

---

**Good luck! You're almost there! 🎉**
