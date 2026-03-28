"use strict";
/**
 * WhatsApp Cloud API Client
 *
 * Handles sending messages via Meta Cloud API
 *
 * LEARNING NOTES:
 * - WhatsApp Cloud API is REST-based (simple HTTP requests)
 * - You need: Access Token, Phone Number ID, Business Account ID
 * - Free tier: 1,000 business-initiated conversations/month
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = sendWhatsAppMessage;
exports.sendTemplateMessage = sendTemplateMessage;
const node_fetch_1 = require("node-fetch");
const API_VERSION = 'v18.0';
function getWhatsAppCredentials() {
    var _a, _b;
    const token = (_a = process.env.WHATSAPP_ACCESS_TOKEN) === null || _a === void 0 ? void 0 : _a.trim();
    const phoneNumberId = (_b = process.env.WHATSAPP_PHONE_ID) === null || _b === void 0 ? void 0 : _b.trim();
    if (!token || !phoneNumberId) {
        throw new Error('Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_ID. Set them in the Functions environment.');
    }
    return { token, phoneNumberId };
}
/**
 * Send a text message via WhatsApp Cloud API
 *
 * @param to - Recipient's phone number (with country code, no +)
 * @param text - Message text (max 4096 characters)
 */
async function sendWhatsAppMessage(to, text) {
    const { token, phoneNumberId } = getWhatsAppCredentials();
    const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
    const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
            preview_url: false,
            body: text,
        },
    };
    try {
        const response = await (0, node_fetch_1.default)(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('WhatsApp API error:', error);
            throw new Error(`WhatsApp API error: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ Message sent successfully:', data);
    }
    catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
}
/**
 * Send a template message (for business-initiated conversations)
 *
 * LEARNING NOTES:
 * - Template messages are pre-approved by Meta
 * - Used for notifications (fee reminders, attendance alerts)
 * - Required for starting conversations with users
 *
 * @param to - Recipient's phone number
 * @param templateName - Name of approved template
 * @param parameters - Template parameters (e.g., student name, amount)
 */
async function sendTemplateMessage(to, templateName, parameters) {
    const { token, phoneNumberId } = getWhatsAppCredentials();
    const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
    const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
            name: templateName,
            language: {
                code: 'en', // or 'hi' for Hindi, 'mr' for Marathi
            },
            components: [
                {
                    type: 'body',
                    parameters: parameters.map((value) => ({
                        type: 'text',
                        text: value,
                    })),
                },
            ],
        },
    };
    try {
        const response = await (0, node_fetch_1.default)(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('WhatsApp API error:', error);
            throw new Error(`WhatsApp API error: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ Template message sent:', data);
    }
    catch (error) {
        console.error('Error sending template message:', error);
        throw error;
    }
}
//# sourceMappingURL=whatsappClient.js.map