"use strict";
/**
 * WhatsApp Webhook Handler
 *
 * Handles incoming webhook requests from Meta Cloud API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMetaWebhookSignature = verifyMetaWebhookSignature;
exports.handleWebhook = handleWebhook;
const crypto = require("crypto");
const messageProcessor_1 = require("./messageProcessor");
const IS_EMULATOR = process.env.FUNCTIONS_EMULATOR === 'true';
function getVerifyToken() {
    var _a;
    const t = (_a = process.env.WHATSAPP_VERIFY_TOKEN) === null || _a === void 0 ? void 0 : _a.trim();
    return t || undefined;
}
/**
 * Verify X-Hub-Signature-256 (Meta webhook integrity).
 * Requires raw request body (Firebase attaches req.rawBody on HTTPS functions).
 */
function verifyMetaWebhookSignature(req, appSecret) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature || typeof signature !== 'string' || !signature.startsWith('sha256=')) {
        return false;
    }
    const rawBody = req.rawBody;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
        console.error('Webhook signature check failed: rawBody missing (use Firebase HTTPS onRequest)');
        return false;
    }
    const expectedHex = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
    const receivedHex = signature.slice('sha256='.length);
    try {
        const a = Buffer.from(receivedHex, 'hex');
        const b = Buffer.from(expectedHex, 'hex');
        if (a.length !== b.length) {
            return false;
        }
        return crypto.timingSafeEqual(a, b);
    }
    catch (_a) {
        return false;
    }
}
/**
 * Handle webhook verification (GET) and message processing (POST)
 */
async function handleWebhook(req, res) {
    var _a;
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        const verifyToken = getVerifyToken();
        if (!verifyToken) {
            console.error('WHATSAPP_VERIFY_TOKEN is not set; cannot complete webhook verification');
            res.status(503).send('Service misconfigured');
            return;
        }
        console.log('Webhook verification request:', { mode, token: token ? '[set]' : '[missing]' });
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('Webhook verified successfully');
            res.status(200).send(challenge);
        }
        else {
            console.error('Webhook verification failed');
            res.status(403).send('Forbidden');
        }
        return;
    }
    if (req.method === 'POST') {
        const appSecret = (_a = process.env.WHATSAPP_APP_SECRET) === null || _a === void 0 ? void 0 : _a.trim();
        if (!IS_EMULATOR) {
            if (!appSecret) {
                console.error('WHATSAPP_APP_SECRET is required in production for webhook POST verification');
                res.status(503).send('Service misconfigured');
                return;
            }
            if (!verifyMetaWebhookSignature(req, appSecret)) {
                console.error('Invalid Meta webhook signature');
                res.status(403).send('Invalid signature');
                return;
            }
        }
        else if (appSecret && !verifyMetaWebhookSignature(req, appSecret)) {
            console.error('Invalid Meta webhook signature (emulator)');
            res.status(403).send('Invalid signature');
            return;
        }
        const body = req.body;
        console.log('Incoming webhook:', JSON.stringify(body, null, 2));
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry || []) {
                for (const change of entry.changes || []) {
                    if (change.field === 'messages') {
                        const value = change.value;
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
    res.status(405).send('Method Not Allowed');
}
//# sourceMappingURL=webhook.js.map