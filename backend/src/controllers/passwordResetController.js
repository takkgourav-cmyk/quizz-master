const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { sendPasswordResetOtp } = require('../utils/mailer');

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const SEND_WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;
const MAX_OTP_ATTEMPTS = 5;
const GENERIC_MESSAGE = 'If an account matches that email, a verification code will arrive shortly.';
const INVALID_CODE_MESSAGE = 'That code is invalid or expired. Request a new code and try again.';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function secret() {
  const value = process.env.PASSWORD_RESET_SECRET || process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new AppError('Password reset is temporarily unavailable', 503);
  return value;
}

function otpDigest(otp) {
  return crypto.createHmac('sha256', secret()).update(otp).digest('hex');
}

function tokenDigest(token) {
  return crypto.createHmac('sha256', secret()).update(token).digest('hex');
}

function safeEqualHex(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || !/^[a-f\d]{64}$/i.test(left) || !/^[a-f\d]{64}$/i.test(right)) return false;
  return crypto.timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

function resetStateFields() {
  return {
    resetOtpHash: null,
    resetOtpExpiresAt: null,
    resetOtpAttempts: 0,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
  };
}

async function issueOtp(user, role) {
  const now = Date.now();
  const lastSentAt = user.resetOtpLastSentAt?.getTime() || 0;
  if (now - lastSentAt < RESEND_COOLDOWN_MS) return false;

  const windowAt = user.resetOtpWindowStartedAt?.getTime() || 0;
  const inCurrentWindow = windowAt > 0 && now - windowAt < SEND_WINDOW_MS;
  const sends = inCurrentWindow ? (user.resetOtpSendCount || 0) : 0;
  if (sends >= MAX_SENDS_PER_WINDOW) return false;

  const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  const stamp = new Date(now);
  const query = {
    _id: user._id,
    role,
    resetOtpSendCount: user.resetOtpSendCount ? user.resetOtpSendCount : { $in: [0, null] },
    resetOtpLastSentAt: user.resetOtpLastSentAt || null,
    resetOtpWindowStartedAt: user.resetOtpWindowStartedAt || null,
  };
  const updated = await User.findOneAndUpdate(query, {
    $set: {
      resetOtpHash: otpDigest(otp),
      resetOtpExpiresAt: new Date(now + OTP_TTL_MS),
      resetOtpAttempts: 0,
      resetOtpLastSentAt: stamp,
      resetOtpWindowStartedAt: inCurrentWindow ? user.resetOtpWindowStartedAt : stamp,
      resetOtpSendCount: sends + 1,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  }, { new: true });

  if (!updated) return false;
  try {
    await sendPasswordResetOtp({ to: user.email, otp, accountType: role });
  } catch {
    // Keep transport details, recipient addresses, and OTPs out of application logs.
    console.error('Password reset email delivery failed. Check SMTP configuration.');
  }
  return true;
}

function createPasswordResetHandlers(role) {
  const selectResetFields = '+resetOtpHash +resetOtpExpiresAt +resetOtpAttempts +resetOtpLastSentAt +resetOtpWindowStartedAt +resetOtpSendCount +resetTokenHash +resetTokenExpiresAt';

  const requestCode = asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (!validEmail(email)) throw new AppError('Enter a valid email address', 400);
    const user = await User.findOne({ email, role }).select(selectResetFields);
    if (user) {
      try {
        await issueOtp(user, role);
      } catch {
        console.error('Password reset request could not be completed.');
      }
    }
    res.json({ message: GENERIC_MESSAGE });
  });

  const verifyCode = asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '');
    if (!validEmail(email) || !/^\d{6}$/.test(otp)) throw new AppError(INVALID_CODE_MESSAGE, 400);

    const user = await User.findOne({ email, role }).select(selectResetFields);
    const now = new Date();
    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt || user.resetOtpExpiresAt <= now || user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
      throw new AppError(INVALID_CODE_MESSAGE, 400);
    }

    const candidateHash = otpDigest(otp);
    if (!safeEqualHex(candidateHash, user.resetOtpHash)) {
      await User.updateOne({
        _id: user._id,
        role,
        resetOtpHash: user.resetOtpHash,
        resetOtpExpiresAt: { $gt: now },
        resetOtpAttempts: { $lt: MAX_OTP_ATTEMPTS },
      }, { $inc: { resetOtpAttempts: 1 } });
      await User.updateOne({ _id: user._id, role, resetOtpHash: user.resetOtpHash, resetOtpAttempts: { $gte: MAX_OTP_ATTEMPTS } }, {
        $set: { resetOtpHash: null, resetOtpExpiresAt: null },
      });
      throw new AppError(INVALID_CODE_MESSAGE, 400);
    }

    const resetToken = crypto.randomBytes(32).toString('base64url');
    const result = await User.findOneAndUpdate({
      _id: user._id,
      role,
      resetOtpHash: user.resetOtpHash,
      resetOtpExpiresAt: { $gt: now },
      resetOtpAttempts: { $lt: MAX_OTP_ATTEMPTS },
    }, {
      $set: {
        resetOtpHash: null,
        resetOtpExpiresAt: null,
        resetOtpAttempts: 0,
        resetTokenHash: tokenDigest(resetToken),
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    }, { new: true });

    if (!result) throw new AppError(INVALID_CODE_MESSAGE, 400);
    res.json({ resetToken, expiresIn: RESET_TOKEN_TTL_MS / 1000 });
  });

  const resetPassword = asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const resetToken = String(req.body?.resetToken || '');
    const password = String(req.body?.password || '');
    if (!validEmail(email) || !/^[A-Za-z0-9_-]{43}$/.test(resetToken)) {
      throw new AppError('The password reset session is invalid or expired. Start again.', 400);
    }
    if (password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      throw new AppError('Use 8 to 128 characters with at least one letter and one number', 400);
    }

    const now = new Date();
    const user = await User.findOneAndUpdate({
      email,
      role,
      resetTokenHash: tokenDigest(resetToken),
      resetTokenExpiresAt: { $gt: now },
    }, {
      $set: resetStateFields(),
      $inc: { tokenVersion: 1 },
    }, { new: true }).select('+password');

    if (!user) throw new AppError('The password reset session is invalid or expired. Start again.', 400);
    user.password = password;
    await user.save();
    res.json({ message: 'Password updated. You can now sign in with your new password.' });
  });

  return { requestCode, verifyCode, resetPassword };
}

module.exports = { createPasswordResetHandlers };
