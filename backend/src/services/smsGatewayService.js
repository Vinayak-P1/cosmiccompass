import axios from "axios";

const BASE_URL = process.env.SMS_GATEWAY_BASE_URL || "https://api.sms-gate.app";
const SMS_USER = process.env.SMS_GATEWAY_USERNAME;
const SMS_PASS = process.env.SMS_GATEWAY_PASSWORD;
const SMS_DEVICE = process.env.SMS_GATEWAY_DEVICE_ID;

// Construct endpoint: POST /3rdparty/v1/messages
const SMS_ENDPOINT = `${BASE_URL.replace(/\/+$/, "")}/3rdparty/v1/messages`;

/**
 * Send an SMS message via SMS Gateway for Android Cloud API.
 *
 * @param {string} phone  – recipient phone in E.164 format (+919876543210)
 * @param {string} message – SMS body text
 * @returns {{ success: boolean, messageId?: string, error?: string }}
 */
export async function sendSms(phone, message) {
  if (!SMS_USER || !SMS_PASS) {
    console.error("[SMS] Missing SMS_GATEWAY_USERNAME or SMS_GATEWAY_PASSWORD in env");
    return { success: false, error: "SMS Gateway credentials not configured" };
  }

  // Follow the official OpenAPI schema for Capcom6 SMS Gateway Message format
  const payload = {
    textMessage: {
      text: message,
    },
    phoneNumbers: [phone],
  };

  // Attach optional device selection and delivery tracking if configured
  if (SMS_DEVICE) {
    payload.deviceId = SMS_DEVICE;
    payload.withDeliveryReport = true;
  }

  // Support dual SIM configurations from environment
  if (process.env.SMS_GATEWAY_SIM_NUMBER) {
    const simNum = parseInt(process.env.SMS_GATEWAY_SIM_NUMBER, 10);
    if (simNum >= 1 && simNum <= 3) {
      payload.simNumber = simNum;
    }
  }

  try {
    const response = await axios.post(SMS_ENDPOINT, payload, {
      auth: {
        username: SMS_USER,
        password: SMS_PASS,
      },
      headers: { "Content-Type": "application/json" },
      timeout: 15000, // 15 second timeout
    });

    console.log(`[SMS] ✅ Sent to ${phone} — status ${response.status}`);
    return {
      success: true,
      messageId: response.data?.id || response.data?.ID || null,
    };
  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data?.message || err.response?.data || err.message;
    console.error(`[SMS] ❌ Failed to send to ${phone} — status ${status}:`, detail);
    return {
      success: false,
      error: `SMS send failed (${status || "network"}): ${detail}`,
    };
  }
}
