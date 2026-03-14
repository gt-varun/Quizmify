import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(to, otp) {
  const mailOptions = {
    from: `"Quizmify" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Quizmify - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">Quizmify Password Reset</h2>
        <p>You requested a password reset. Use the OTP below to verify your identity:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
