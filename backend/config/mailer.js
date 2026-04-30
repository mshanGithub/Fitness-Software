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

const sendSessionBookingConfirmation = async ({ email, userName, sessionName, date, slotLabel, timezone, meetLink, description }) => {
  const transporter = createTransport();
  const sender = process.env.EMAIL_FROM || getAuthUser();

  const meetSection = meetLink ? `<p style="margin-bottom: 16px;"><strong>Meeting Link:</strong> <a href="${meetLink}" style="color: #3b82f6;">${meetLink}</a></p>` : '';

  await transporter.sendMail({
    from: sender,
    to: email,
    subject: `Booking Confirmation: ${sessionName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 8px;">Train With Cain</h2>
        <p style="margin-bottom: 16px;">Hi ${userName},</p>
        <p style="margin-bottom: 16px;">Your ${sessionName} session has been booked successfully!</p>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Session:</strong> ${sessionName}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${slotLabel}</p>
          <p style="margin: 4px 0;"><strong>Timezone:</strong> ${timezone}</p>
        </div>

        ${description ? `<p style="margin-bottom: 16px; color: #6b7280;"><em>${description}</em></p>` : ''}
        ${meetSection}
        
        <p style="margin-bottom: 8px;">A calendar event has been added to your Google Calendar.</p>
        <p style="color: #6b7280; font-size: 12px;">If you need to reschedule, please log in to the portal.</p>
      </div>
    `,
  });
};

const sendSessionBookingUpdate = async ({ email, userName, sessionName, oldDate, oldSlot, newDate, newSlot, timezone, meetLink, description }) => {
  const transporter = createTransporter();
  const sender = process.env.EMAIL_FROM || getAuthUser();

  const meetSection = meetLink ? `<p style="margin-bottom: 16px;"><strong>Meeting Link:</strong> <a href="${meetLink}" style="color: #3b82f6;">${meetLink}</a></p>` : '';

  await transporter.sendMail({
    from: sender,
    to: email,
    subject: `Booking Updated: ${sessionName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 8px;">Train With Cain</h2>
        <p style="margin-bottom: 16px;">Hi ${userName},</p>
        <p style="margin-bottom: 16px;">Your ${sessionName} session has been rescheduled.</p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Old Time:</strong> ${oldDate} @ ${oldSlot}</p>
          <p style="margin: 4px 0; margin-top: 8px;"><strong>New Time:</strong> ${newDate} @ ${newSlot}</p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">Timezone: ${timezone}</p>
        </div>

        ${description ? `<p style="margin-bottom: 16px; color: #6b7280;"><em>${description}</em></p>` : ''}
        ${meetSection}
        
        <p style="margin-bottom: 8px;">Your Google Calendar has been updated with the new time.</p>
      </div>
    `,
  });
};

const sendSessionBookingCancellation = async ({ email, userName, sessionName, date, slotLabel, timezone }) => {
  const transporter = createTransporter();
  const sender = process.env.EMAIL_FROM || getAuthUser();

  await transporter.sendMail({
    from: sender,
    to: email,
    subject: `Booking Cancelled: ${sessionName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 8px;">Train With Cain</h2>
        <p style="margin-bottom: 16px;">Hi ${userName},</p>
        <p style="margin-bottom: 16px;">Your ${sessionName} session booking has been cancelled.</p>
        
        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
          <p style="margin: 4px 0;"><strong>Session:</strong> ${sessionName}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 4px 0;"><strong>Time:</strong> ${slotLabel}</p>
        </div>

        <p style="margin-bottom: 8px;">The event has been removed from your Google Calendar.</p>
        <p style="color: #6b7280; font-size: 12px;">You can book another session anytime from the portal.</p>
      </div>
    `,
  });
};

module.exports = {
  extractEmailAddress,
  isMailConfigured,
  sendPasswordResetOtp,
  sendSessionBookingConfirmation,
  sendSessionBookingUpdate,
  sendSessionBookingCancellation,
};