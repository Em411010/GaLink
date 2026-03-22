import axios from "axios";

const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const FROM_EMAIL = process.env.SMTP_FROM || "emmanueljr11010@gmail.com";

async function brevoSend(payload) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("[Email] BREVO_API_KEY not set — skipping email");
    return;
  }
  const res = await axios.post(BREVO_API, payload, {
    headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" },
    timeout: 15000,
  });
  console.log("[Email] Brevo accepted — messageId:", res.data.messageId);
  return res.data;
}

export async function sendOtpEmail(email, otp) {
  console.log(`[OTP] Sending ${otp} → ${email}`);
  try {
    await brevoSend({
      sender: { name: "GaLink", email: FROM_EMAIL },
      to: [{ email }],
      subject: "GaLink — Your Email Verification Code",
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
          <h2 style="color:#7c3aed;margin-bottom:8px;">Email Verification</h2>
          <p style="color:#555;margin-bottom:24px;">Use the code below to verify your email address on GaLink. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#fff;border-radius:12px;padding:24px;text-align:center;border:2px dashed #7c3aed;">
            <span style="font-size:40px;font-weight:bold;letter-spacing:12px;color:#7c3aed;">${otp}</span>
          </div>
          <p style="color:#999;font-size:12px;margin-top:24px;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[OTP] Brevo send failed:", error.response?.data || error.message);
    throw error;
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    await brevoSend({
      sender: { name: "GaLink", email: FROM_EMAIL },
      to: [{ email }],
      subject: "Welcome to GaLink!",
      htmlContent: `<h1>Welcome, ${name}!</h1><p>Thanks for joining GaLink — your go-to platform for finding skilled Filipino workers.</p>`,
    });
  } catch (error) {
    console.error("[Email] Welcome email failed:", error.response?.data || error.message);
  }
}

