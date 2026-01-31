"use strict";
/**
 * WhatsApp Webhook Handler
 *
 * Handles incoming webhook requests from Meta Cloud API
 *
 * LEARNING NOTES:
 * - GET requests are for webhook verification (Meta validates your server)
 * - POST requests contain actual messages from users
 * - We need to verify the token to ensure requests are from Meta
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = handleWebhook;
const messageProcessor_1 = require("./messageProcessor");
// Store this in Firebase Config or Environment Variables (for now hardcoded)
// YOU'LL GET THIS TOKEN WHEN SETTING UP META CLOUD API
const VERIFY_TOKEN = 'maplekids_whatsapp_verify_token_2026';
/**
 * Handle webhook verification (GET) and message processing (POST)
 */
async function handleWebhook(req, res) {
    // WEBHOOK VERIFICATION (happens once when you set up WhatsApp)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        console.log('Webhook verification request:', { mode, token });
        // Check if mode and token match
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verified successfully! ✅');
            res.status(200).send(challenge); // Meta expects the challenge back
        }
        else {
            console.error('Webhook verification failed! ❌');
            res.status(403).send('Forbidden');
        }
        return;
    }
    // MESSAGE PROCESSING (happens every time a user sends a message)
    if (req.method === 'POST') {
        const body = req.body;
        console.log('Incoming webhook:', JSON.stringify(body, null, 2));
        // Meta sends webhook for multiple events (messages, status updates, etc.)
        // We only care about actual messages
        if (body.object === 'whatsapp_business_account') {
            // Process each entry (can have multiple messages in one webhook)
            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {
                    if (change.field === 'messages') {
                        const value = change.value;
                        // Extract message data
                        if (value.messages && value.messages.length > 0) {
                            for (const message of value.messages) {
                                await (0, messageProcessor_1.processMessage)(message, value);
                            }
                        }
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        }
        else {
            res.status(404).send('Not Found');
        }
        return;
    }
    // Invalid request method
    res.status(405).send('Method Not Allowed');
}
//# sourceMappingURL=webhook.js.map