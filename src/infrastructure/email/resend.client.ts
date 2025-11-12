import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_KEY);

const FROM_EMAIL = process.env.RESEND_SENDER || "noreply@yoletent.com";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendVerificationOtp(
  email: string,
  otp: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: "Verify your email address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .otp-box { 
              display: inline-block; 
              padding: 20px 40px; 
              background-color: #f5f5f5; 
              border: 2px dashed #0070f3;
              border-radius: 8px; 
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
              color: #0070f3;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering with Balance! Please use the following OTP to verify your email address:</p>
            <div style="text-align: center;">
              <div class="otp-box">${otp}</div>
            </div>
            <p><strong>Important:</strong> This OTP will expire in 10 minutes. Do not share this code with anyone.</p>
            <p>If you didn't request this verification, please ignore this email or contact support if you have concerns.</p>
            <div class="footer">
              <p>This is an automated message from Balance - Financial Management System</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #0070f3; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0070f3;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <div class="footer">
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
