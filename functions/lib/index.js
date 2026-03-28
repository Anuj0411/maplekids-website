"use strict";
/**
 * Firebase Cloud Functions Entry Point
 *
 * This file exports all cloud functions for Maplekids Play School
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = void 0;
// Export WhatsApp AI Assistant functions
var whatsapp_1 = require("./whatsapp");
Object.defineProperty(exports, "whatsappWebhook", { enumerable: true, get: function () { return whatsapp_1.whatsappWebhook; } });
// You can add more function exports here as you build them
// export { scheduledFeeReminders } from './whatsapp/scheduledTasks';
// export { dailyAttendanceReport } from './whatsapp/scheduledTasks';
//# sourceMappingURL=index.js.map