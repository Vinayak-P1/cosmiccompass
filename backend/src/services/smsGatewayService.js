import axios from "axios";

const SMS_URL = process.env.SMS_GATEWAY_URL || "https://api.sms-gate.app/3rdparty/v1";
const SMS_USER = process.env.SMS_GATEWAY_USERNAME;
const SMS_PASS = process.env.SMS_GATEWAY_PASSWORD;
const SMS_DEVICE = process.env.SMS_GATEWAY_DEVICE_ID;

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

  const payload = {
    message,
    phoneNumbers: [phone],
  };

  // Optionally attach device ID when provided
  if (SMS_DEVICE) {
    payload.withDeliveryReport = true;
  }

  try {
    const response = await axios.post(`${SMS_URL}/messages`, payload, {
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
