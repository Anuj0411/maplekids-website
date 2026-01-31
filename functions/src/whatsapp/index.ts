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

import * as functions from 'firebase-functions';
import { handleWebhook } from './webhook';

/**
 * Main WhatsApp webhook endpoint
 * URL will be: https://YOUR_PROJECT.cloudfunctions.net/whatsappWebhook
 * 
 * Meta will call this endpoint for:
 * 1. Webhook verification (GET request)
 * 2. Incoming messages (POST request)
 */
export const whatsappWebhook = functions.https.onRequest(async (req, res) => {
  try {
    await handleWebhook(req, res);
  } catch (error) {
    console.error('Error in whatsappWebhook:', error);
    res.status(500).send('Internal Server Error');
  }
});
