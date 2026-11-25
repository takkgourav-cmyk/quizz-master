const express = require('express');
const rateLimit = require('express-rate-limit');
const { createPasswordResetHandlers } = require('../controllers/passwordResetController');

module.exports = (role) => {
  const router = express.Router();
  const requestLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { message: 'If an account matches that email, a verification code will arrive shortly.' } });
  const verifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many verification attempts. Wait a while and try again.' } });
  const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many password reset attempts. Wait a while and try again.' } });
  const handlers = createPasswordResetHandlers(role);
  router.post('/forgot-password', requestLimiter, handlers.requestCode);
  router.post('/resend-reset-otp', requestLimiter, handlers.requestCode);
  router.post('/verify-reset-otp', verifyLimiter, handlers.verifyCode);
  router.post('/reset-password', resetLimiter, handlers.resetPassword);
  return router;
};
