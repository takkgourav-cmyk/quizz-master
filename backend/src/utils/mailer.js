const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    const error = new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in backend/.env.');
    error.statusCode = 503;
    throw error;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

exports.sendMail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

exports.verifySmtp = async () => createTransporter().verify();

exports.sendPasswordResetOtp = async ({ to, otp, accountType }) => {
  const label = accountType === 'admin' ? 'Quizly Admin' : 'Quizly';
  const subject = 'Your Quizly password reset code';
  const text = `Your ${label} verification code is ${otp}. It expires in 5 minutes. If you did not request a password reset, you can ignore this email.`;
  const html = `
    <div style="margin:0;background:#f5f1e8;padding:36px 16px;font-family:Arial,sans-serif;color:#252525">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #ddd6ca;border-radius:8px;overflow:hidden">
        <div style="padding:24px 30px;background:#252525;color:#fff">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#d7c4b5">${label}</div>
          <h1 style="margin:12px 0 0;font-size:25px;font-weight:500">Password reset</h1>
        </div>
        <div style="padding:30px">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.6">Use this one-time code to verify your email and continue resetting your password.</p>
          <div style="padding:18px 16px;background:#f5f1e8;border:1px solid #ddd6ca;border-radius:6px;text-align:center">
            <span style="font-size:31px;font-weight:700;letter-spacing:9px;color:#c96b43">${otp}</span>
          </div>
          <p style="margin:18px 0 0;color:#77736c;font-size:13px">This code expires in <strong>5 minutes</strong> and can only be used once.</p>
          <p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #ddd6ca;color:#77736c;font-size:12px;line-height:1.6">If you did not request a password reset, ignore this message. Your password will not change.</p>
        </div>
      </div>
    </div>`;
  return exports.sendMail({ to, subject, text, html });
};
