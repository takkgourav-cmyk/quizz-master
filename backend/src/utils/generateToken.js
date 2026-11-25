const jwt = require('jsonwebtoken');

module.exports = (user) => {
  const payload = { id: user._id || user.id };
  if (user.tokenVersion !== undefined && user.tokenVersion !== null) payload.ver = user.tokenVersion;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};
