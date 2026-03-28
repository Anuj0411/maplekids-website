# WhatsApp AI Assistant - Implementation Roadmap

## 📋 Current Status

### ✅ Completed (Foundation + core AI)
- [x] Firebase Cloud Functions setup
- [x] WhatsApp webhook handler (GET/POST) with **Meta `X-Hub-Signature-256` verification** in production (`WHATSAPP_APP_SECRET`)
- [x] Message processor with intent routing and **Firestore-backed school context**
- [x] WhatsApp Cloud API client (send messages; credentials required at runtime — no placeholder tokens)
- [x] Firestore: messages, users, conversations + **composite index** for `whatsapp_conversations` (`userId` + `timestamp`)
- [x] **Google Gemini** integration (`systemInstruction`, chat history, intent-specific prompts)
- [x] **Student / attendance integration**: match parent phone to `students.parentPhone`, auto-link `whatsapp_users`, roll up `attendance` by class + roll number
- [x] Dependencies: `@google/generative-ai` (current SDK)

### 🚧 In Progress / Not started (see sections below)
- Voice transcription, rich media, calendar, scheduled notifications, admin dashboard, fee collection in DB, payment links

### 📅 Next Steps (Weeks 5-8)

---

## Week 3-4: Google Gemini AI Integration — **done (MVP)**

### Delivered
1. **Gemini service** (`functions/src/whatsapp/geminiService.ts`) — model + system instruction, history, intent-specific generation
2. **Message processor** — Gemini + fallback path; structured replies for fees / attendance / reports / homework / events when a linked student exists
3. **Prompts** — school assistant persona + intent prompts grounded in Firestore where data exists
4. **Testing** — run against emulator / deployed function with real Meta webhook + `GEMINI_API_KEY`

---

## Week 5: Advanced Features

### Goal
Add voice messages, multi-language support, and rich responses

### Tasks
1. **Voice Message Transcription**
   - Use Gemini for audio-to-text
   - Process voice queries
   - Send text responses

2. **Multi-language Support**
   - Detect user language (English/Hindi/Marathi)
   - Generate responses in user's language
   - Store language preference

3. **Rich Media Responses**
   - Send images (report cards, fee receipts)
   - Send documents (PDFs)
   - Send interactive buttons

4. **Calendar Integration**
   - School events
   - Holiday lists
   - Exam schedules

---

## Week 6: Database Integration

### Goal
Connect AI to real Maplekids data (students, fees, attendance)

### Status (partial)
- **Done:** Resolve students via `students.parentPhone` (multiple phone formats), auto-link `whatsapp_users.studentId`, aggregate attendance from `attendance` (class + roll) for AI replies.
- **Not done:** Fee balances in Firestore, payment links, report-card documents, teacher remarks in structured form.

### Remaining tasks
1. **Student Data Integration** — reports / remarks from DB
2. **Fee Management** — store fee status, Razorpay or payment links, reminders
3. **Attendance** — tighter date-range queries, monthly summaries (optional indexes)
4. **Report Card Access** — fetch published reports if/when stored in Firestore or Storage

---

## Week 7: Proactive Notifications

### Goal
Send automated notifications to parents

### Tasks
1. **Scheduled Functions**
   - Daily attendance summaries
   - Weekly progress reports
   - Monthly fee reminders
   - Birthday wishes

2. **Event-Triggered Notifications**
   - Absence alerts
   - Fee due reminders
   - Report card published
   - Emergency announcements

3. **Template Messages**
   - Create Meta-approved templates
   - Implement template sending
   - Track delivery status

---

## Week 8: Admin Dashboard

### Goal
Give school admin control over AI assistant

### Tasks
1. **Conversation Monitoring**
   - View all conversations
   - Message history
   - User analytics

2. **AI Settings**
   - Configure AI personality
   - Update knowledge base
   - Manage templates

3. **Broadcasting**
   - Send bulk messages
   - Class-wise announcements
   - Emergency broadcasts

4. **Analytics Dashboard**
   - Message volume
   - Response time
   - User satisfaction
   - Common queries

---

## Technical Architecture

### Data Flow
```
User (WhatsApp) 
  ↓
Meta Cloud API Webhook
  ↓
Firebase Cloud Function (whatsappWebhook)
  ↓
Message Processor
  ↓
Gemini AI Service → Context Builder → Firestore (history, user data)
  ↓
Response Generator
  ↓
WhatsApp Client (send message)
  ↓
Meta Cloud API
  ↓
User receives response
```

### Firestore Collections
```
- whatsapp_messages/
  - {messageId}: { from, to, text, timestamp, direction }

- whatsapp_users/
  - {phoneNumber}: { name, role, studentId, language, preferences }

- whatsapp_conversations/
  - {conversationId}: { userId, messages[], context, lastUpdatedAt }

- students/ (existing)
  - {studentId}: { name, class, rollNumber, parentPhone, ... }

- attendance/ (existing)
  - {recordId}: { studentId, date, status, ... }

- fees/ (existing)
  - {feeId}: { studentId, amount, status, dueDate, ... }
```

---

## Integration Points with Existing System

1. **Authentication**
   - Link WhatsApp phone → Firebase Auth User
   - Verify parent/teacher/admin role

2. **Student Service**
   - Use existing `studentService.ts`
   - Query student data
   - Update records (if permitted)

3. **Attendance Service**
   - Use existing `attendanceService.ts`
   - Fetch attendance records
   - Mark attendance (teacher role)

4. **Fee Service**
   - Use existing fee management
   - Check payment status
   - Generate Razorpay links

5. **Report Service**
   - Use existing academic report service
   - Fetch report cards
   - Share via WhatsApp

---

## Security Considerations

1. **Authentication**
   - Verify webhook token (`WHATSAPP_VERIFY_TOKEN` on GET)
   - Validate Meta `X-Hub-Signature-256` on POST when `WHATSAPP_APP_SECRET` is set (required outside the emulator)
   - Rate limiting (not implemented yet)

2. **Authorization**
   - User can only access their student's data
   - Teachers can access their class data
   - Admins can access all data

3. **Data Privacy**
   - Don't log sensitive info (phone numbers in plain text)
   - Encrypt stored messages
   - GDPR compliance (data deletion)

4. **API Security**
   - Store tokens in Firebase Config
   - Use environment variables locally
   - Rotate tokens regularly

---

## Cost Estimation

### WhatsApp Cloud API (Free Tier)
- 1,000 business-initiated conversations/month: FREE
- User-initiated: Unlimited within 24hr window: FREE
- After free tier: ~$0.005 - $0.03 per conversation

### Google Gemini API
- Free tier: 60 requests/minute
- Paid tier: $0.00025 per 1K characters

### Firebase
- Cloud Functions: 2M invocations/month FREE
- Firestore: 50K reads, 20K writes/day FREE

**Estimated Monthly Cost for 500 active parents**:
- WhatsApp: FREE (most conversations are user-initiated)
- Gemini: ~$5-10 (depending on message length)
- Firebase: FREE (within limits)
**Total: ~$5-10/month**

---

## Next immediate steps

1. Deploy `firestore.indexes.json` (`firebase deploy --only firestore:indexes`) so `whatsapp_conversations` history queries succeed.
2. Set `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, WhatsApp tokens, and `GEMINI_API_KEY` in the Functions environment.
3. Continue with **Week 5+** items (voice, templates, scheduled sends, admin UI) as needed.
4. Test end-to-end with the Meta test number and `firebase functions:log`.
