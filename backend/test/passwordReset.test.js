const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const User = require('../src/models/User');
const mailer = require('../src/utils/mailer');

process.env.JWT_SECRET = 'test-only-secret-with-more-than-thirty-two-characters';

const records = new Map();
const sent = [];
const original = {
  findOne: User.findOne,
  findOneAndUpdate: User.findOneAndUpdate,
  updateOne: User.updateOne,
  sendPasswordResetOtp: mailer.sendPasswordResetOtp,
};

function getPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function matchesValue(actual, expected) {
  if (expected && typeof expected === 'object' && !(expected instanceof Date)) {
    if ('$in' in expected) return expected.$in.some((entry) => entry === null ? actual == null : actual === entry);
    if ('$gt' in expected && !(actual > expected.$gt)) return false;
    if ('$lt' in expected && !(actual < expected.$lt)) return false;
    if ('$gte' in expected && !(actual >= expected.$gte)) return false;
    return true;
  }
  if (expected === null) return actual == null;
  return actual instanceof Date && expected instanceof Date ? actual.getTime() === expected.getTime() : actual === expected;
}

function matches(record, filter) {
  return Object.entries(filter).every(([key, expected]) => matchesValue(getPath(record, key), expected));
}

function applyUpdate(record, update) {
  for (const [key, value] of Object.entries(update.$set || {})) record[key] = value;
  for (const [key, value] of Object.entries(update.$inc || {})) record[key] = (record[key] || 0) + value;
}

function query(value) {
  const promise = Promise.resolve(value);
  promise.select = () => Promise.resolve(value);
  return promise;
}

User.findOne = (filter) => query([...records.values()].find((record) => matches(record, filter)) || null);
User.findOneAndUpdate = (filter, update) => {
  const record = [...records.values()].find((item) => matches(item, filter)) || null;
  if (record) applyUpdate(record, update);
  return query(record);
};
User.updateOne = async (filter, update) => {
  const record = [...records.values()].find((item) => matches(item, filter)) || null;
  if (record) applyUpdate(record, update);
  return { matchedCount: record ? 1 : 0 };
};
mailer.sendPasswordResetOtp = async (message) => { sent.push(message); };

const { createPasswordResetHandlers } = require('../src/controllers/passwordResetController');
const routes = require('../src/routes');

function makeUser(id, email, role) {
  const record = { _id: id, email, role, tokenVersion: undefined, save: async function save() { this.savedPassword = this.password; } };
  records.set(id, record);
  return record;
}

async function call(handler, body) {
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
  let error;
  await handler({ body }, response, (cause) => { error = cause; });
  return { response, error };
}

test.beforeEach(() => {
  records.clear();
  sent.length = 0;
});

test.after(() => {
  User.findOne = original.findOne;
  User.findOneAndUpdate = original.findOneAndUpdate;
  User.updateOne = original.updateOne;
  mailer.sendPasswordResetOtp = original.sendPasswordResetOtp;
});

test('forgot-password response is generic and OTP is sent only to a matching role account', async () => {
  const account = makeUser('user-1', 'learner@example.test', 'user');
  makeUser('admin-1', 'admin@example.test', 'admin');
  const handlers = createPasswordResetHandlers('user');

  const known = await call(handlers.requestCode, { email: account.email });
  const unknown = await call(handlers.requestCode, { email: 'missing@example.test' });

  assert.equal(known.response.body.message, unknown.response.body.message);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, account.email);
  assert.match(sent[0].otp, /^\d{6}$/);
  assert.notEqual(account.resetOtpHash, sent[0].otp);
  assert.equal(account.resetOtpExpiresAt.getTime() - Date.now() <= 5 * 60 * 1000, true);
});

test('wrong and expired OTPs fail; valid OTP is consumed once and reset token is single-use', async () => {
  const account = makeUser('user-2', 'learner@example.test', 'user');
  const handlers = createPasswordResetHandlers('user');
  await call(handlers.requestCode, { email: account.email });
  const otp = sent[0].otp;

  const wrong = await call(handlers.verifyCode, { email: account.email, otp: '000000' === otp ? '000001' : '000000' });
  assert.match(wrong.error.message, /invalid or expired/i);
  assert.equal(account.resetOtpAttempts, 1);

  const verified = await call(handlers.verifyCode, { email: account.email, otp });
  assert.equal(verified.error, undefined);
  assert.equal(account.resetOtpHash, null);
  assert.equal(typeof verified.response.body.resetToken, 'string');

  const reset = await call(handlers.resetPassword, { email: account.email, resetToken: verified.response.body.resetToken, password: 'FreshPass123' });
  assert.equal(reset.error, undefined);
  assert.equal(account.savedPassword, 'FreshPass123');
  assert.equal(account.tokenVersion, 1);

  const reuse = await call(handlers.resetPassword, { email: account.email, resetToken: verified.response.body.resetToken, password: 'AnotherPass456' });
  assert.match(reuse.error.message, /invalid or expired/i);
  assert.equal(account.savedPassword, 'FreshPass123');
});

test('admin and user reset handlers cannot verify each other’s OTPs', async () => {
  const learner = makeUser('user-3', 'learner@example.test', 'user');
  const admin = makeUser('admin-2', 'admin@example.test', 'admin');
  const userHandlers = createPasswordResetHandlers('user');
  const adminHandlers = createPasswordResetHandlers('admin');

  await call(userHandlers.requestCode, { email: admin.email });
  assert.equal(sent.length, 0);
  await call(adminHandlers.requestCode, { email: admin.email });
  const adminOtp = sent[0].otp;
  const crossVerify = await call(userHandlers.verifyCode, { email: admin.email, otp: adminOtp });
  assert.match(crossVerify.error.message, /invalid or expired/i);
  const correctRole = await call(adminHandlers.verifyCode, { email: admin.email, otp: adminOtp });
  assert.equal(correctRole.error, undefined);

  await call(adminHandlers.requestCode, { email: learner.email });
  assert.equal(sent.length, 1);
});

test('OTP resend is throttled per account', async () => {
  const account = makeUser('user-4', 'learner@example.test', 'user');
  const handlers = createPasswordResetHandlers('user');
  await call(handlers.requestCode, { email: account.email });
  await call(handlers.requestCode, { email: account.email });
  assert.equal(sent.length, 1);
  assert.equal(account.resetOtpSendCount, 1);
});

test('expired OTP cannot be verified', async () => {
  const account = makeUser('user-5', 'learner@example.test', 'user');
  const handlers = createPasswordResetHandlers('user');
  await call(handlers.requestCode, { email: account.email });
  account.resetOtpExpiresAt = new Date(Date.now() - 1);
  const expired = await call(handlers.verifyCode, { email: account.email, otp: sent[0].otp });
  assert.match(expired.error.message, /invalid or expired/i);
});

test('user and admin API endpoints are mounted separately and rate-limited independently', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  app.use((error, req, res, next) => res.status(error.status || 500).json({ message: error.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body) => fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  for (let index = 0; index < 5; index += 1) {
    const response = await post('/api/auth/forgot-password', { email: 'invalid-email' });
    assert.equal(response.status, 400);
  }
  const limitedUser = await post('/api/auth/forgot-password', { email: 'invalid-email' });
  assert.equal(limitedUser.status, 429);

  const admin = await post('/api/admin/auth/forgot-password', { email: 'invalid-email' });
  assert.equal(admin.status, 400);
  const userVerify = await post('/api/auth/verify-reset-otp', { email: 'invalid-email', otp: '123456' });
  const adminReset = await post('/api/admin/auth/reset-password', { email: 'invalid-email', resetToken: 'bad', password: 'FreshPass123' });
  assert.equal(userVerify.status, 400);
  assert.equal(adminReset.status, 400);
});
