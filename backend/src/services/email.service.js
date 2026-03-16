import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
export async function sendOtpEmail(email, otp) {
  if (!process.env.SMTP_USER) {
    console.warn("SMTP_USER not set — skipping OTP email");
    return;
  }
  console.log(`[OTP] Sending ${otp} → ${email}  via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} (login: ${process.env.SMTP_USER}, from: ${process.env.SMTP_FROM || process.env.SMTP_USER})`);
  try {
    const info = await transporter.sendMail({
      from: `"GaLink" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "GaLink — Your Email Verification Code",
      html: `
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
    console.log(`[OTP] SMTP accepted — messageId: ${info.messageId}, response: ${info.response}`);
  } catch (error) {
    console.error("[OTP] SMTP send failed:", error.message);
    throw error;
  }
}

export async function sendWelcomeEmail(email, name) {
  if (!process.env.SMTP_USER) return;
  try {
    await transporter.sendMail({
      from: `"GaLink" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to GaLink!",
      html: `<h1>Welcome, ${name}!</h1><p>Thanks for joining GaLink — your go-to platform for finding skilled Filipino workers.</p>`,
    });
  } catch (error) {
    console.error("Email error:", error.message);
  }
}
