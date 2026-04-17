const nodemailer = require('nodemailer');

const extractEmailAddress = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim();
};

const getAuthUser = () => extractEmailAddress(process.env.GMAIL_USER);

const isMailConfigured = () => Boolean(getAuthUser() && process.env.GMAIL_APP_PASSWORD);

const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: getAuthUser(),
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendPasswordResetOtp = async ({ email, firstName, otp, expiresInMinutes }) => {
  const transporter = createTransporter();
  const sender = process.env.EMAIL_FROM || getAuthUser();

  await transporter.sendMail({
    from: sender,
    to: email,
    subject: 'Train With Cain password reset code',
    text: `Hi ${firstName}, your Train With Cain password reset code is ${otp}. It expires in ${expiresInMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 8px;">Train With Cain</h2>
        <p style="margin-bottom: 16px;">Hi ${firstName},</p>
        <p style="margin-bottom: 16px;">Use the OTP below to reset your password.</p>
        <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; padding: 16px 20px; background: #f3f4f6; border-radius: 12px; text-align: center; margin-bottom: 16px;">
          ${otp}
        </div>
        <p style="margin-bottom: 8px;">This code expires in ${expiresInMinutes} minutes.</p>
        <p style="color: #6b7280;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  extractEmailAddress,
  isMailConfigured,
  sendPasswordResetOtp,
};