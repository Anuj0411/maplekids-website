"use strict";
/**
 * WhatsApp AI Assistant Entry Point
 *
 * This file handles all WhatsApp webhook requests from Meta Cloud API.
 *
 * LEARNING NOTES:
 * - Firebase Cloud Functions are serverless (auto-scaling, pay-per-use)
 * - onRequest creates an HTTPS endpoint that WhatsApp will call
 * - We use TypeScript for type safety (prevents bugs at compile time)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = void 0;
const functions = require("firebase-functions");
const webhook_1 = require("./webhook");
/**
 * Main WhatsApp webhook endpoint
 * URL will be: https://YOUR_PROJECT.cloudfunctions.net/whatsappWebhook
 *
 * Meta will call this endpoint for:
 * 1. Webhook verification (GET request)
 * 2. Incoming messages (POST request)
 */
exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
    try {
        await (0, webhook_1.handleWebhook)(req, res);
    }
    catch (error) {
        console.error('Error in whatsappWebhook:', error);
        res.status(500).send('Internal Server Error');
    }
});
//# sourceMappingURL=index.js.map