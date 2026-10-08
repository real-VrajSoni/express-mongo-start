import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../src/module/auth/model.js';

// Use a temporary database, so these tests never change your own MongoDB data.
const previousNodeEnv = process.env.NODE_ENV;
const originalLog = console.log;
const resetLogs = [];
const secretFields = [
  'passwordHash',
  'sessionTokenHash',
  'sessionExpiresAt',
  'resetTokenHash',
  'resetTokenExpiresAt',
];
let mongo;
let server;
let baseUrl;

process.env.NODE_ENV = 'test';

before(async () => {
  // Capture reset tokens without printing them in the test output.
  console.log = (...args) => {
    const message = args.map(String).join(' ');
    if (message.startsWith('Reset token for ')) {
      resetLogs.push(message);
      return;
    }
    originalLog(...args);
  };

  const { default: app } = await import('../src/app.js');
  mongo = await MongoMemoryServer.create({ binary: { version: '8.2.6' } });
  await mongoose.connect(mongo.getUri());
  await User.init();

  server = await new Promise((resolve, reject) => {
    const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
    listeningServer.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}, { timeout: 180_000 });

after(async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
      });
    }
  } finally {
    try {
      await mongoose.disconnect();
    } finally {
      try {
        if (mongo) await mongo.stop();
      } finally {
        console.log = originalLog;
        if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = previousNodeEnv;
      }
    }
  }
});

async function request(path, options = {}) {
  const headers = { Accept: 'application/json' };
  let body;

  if ('body' in options) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  if ('rawBody' in options) {
    headers['Content-Type'] = 'application/json';
    body = options.rawBody;
  }
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if ('authorization' in options) headers.Authorization = options.authorization;

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers,
    body,
  });
  assert.match(response.headers.get('content-type') || '', /application\/json/);
  const payload = await response.json();
  assert.deepEqual(Object.keys(payload).sort(), ['data', 'message', 'success']);
  assert.equal(payload.success, response.ok);
  assert.equal(typeof payload.message, 'string');
  return { status: response.status, payload };
}

function post(action, body, options = {}) {
  return request(`/api/auth/${action}`, { method: 'POST', body, ...options });
}

function account(label) {
  return { name: 'Test Learner', email: `${label}@example.com`, password: 'Learn1234!' };
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function resetTokenFor(email) {
  const prefix = `Reset token for ${email}: `;
  const message = resetLogs.findLast(entry => entry.startsWith(prefix));
  assert.ok(message, 'A reset token should be available in the development/test terminal');
  const token = message.slice(prefix.length);
  assert.match(token, /^[a-f0-9]{64}$/);
  return token;
}

function assertSafeUser(user, expected) {
  assert.deepEqual(Object.keys(user).sort(), ['email', 'id', 'name']);
  assert.equal(typeof user.id, 'string');
  assert.equal(user.name, expected.name);
  assert.equal(user.email, expected.email);
}

function assertSession(data, expected) {
  assertSafeUser(data.user, expected);
  assert.match(data.token, /^[a-f0-9]{64}$/);
  assert.ok(Date.parse(data.expiresAt) > Date.now());
}

test('register, login, session replacement, and logout work through HTTP', async () => {
  const user = account('happy-flow');
  const registration = await post('register', user);
  assert.equal(registration.status, 201);
  assertSession(registration.payload.data, user);
  const firstToken = registration.payload.data.token;

  const firstProfile = await request('/api/auth/me', { token: firstToken });
  assert.equal(firstProfile.status, 200);
  assertSafeUser(firstProfile.payload.data.user, user);

  const login = await post('login', { email: user.email, password: user.password });
  assert.equal(login.status, 200);
  assertSession(login.payload.data, user);
  const currentToken = login.payload.data.token;
  assert.notEqual(currentToken, firstToken);

  assert.equal((await request('/api/auth/me', { token: firstToken })).status, 401);
  assert.equal((await post('logout', {}, { token: firstToken })).status, 401);
  assert.equal((await request('/api/auth/me', { token: currentToken })).status, 200);

  const logout = await post('logout', {}, { token: currentToken });
  assert.equal(logout.status, 200);
  assert.equal(logout.payload.data, null);
  assert.equal((await request('/api/auth/me', { token: currentToken })).status, 401);
  assert.equal((await post('logout', {}, { token: currentToken })).status, 401);
});

test('emails are normalized, duplicates fail, and secrets stay out of responses', async () => {
  const user = account('normalized-email');
  const registration = await post('register', {
    ...user,
    name: `  ${user.name}  `,
    email: `  ${user.email.toUpperCase()}  `,
    role: 'admin',
  });
  assert.equal(registration.status, 201);
  assertSession(registration.payload.data, user);

  const duplicate = await post('register', user);
  assert.equal(duplicate.status, 409);
  assert.equal(await User.countDocuments({ email: user.email }), 1);

  const ordinaryQuery = await User.findOne({ email: user.email }).lean();
  for (const field of secretFields) assert.equal(field in ordinaryQuery, false);
  assert.equal('role' in ordinaryQuery, false);

  const stored = await User.findOne({ email: user.email }).select(secretFields.map(field => `+${field}`).join(' '));
  assert.ok(await bcrypt.compare(user.password, stored.passwordHash));
  assert.notEqual(stored.passwordHash, user.password);
  assert.equal(stored.sessionTokenHash, hashToken(registration.payload.data.token));
  assert.equal('password' in stored.toObject(), false);
  assert.equal(JSON.stringify(stored).includes(registration.payload.data.token), false);

  const wrongPassword = await post('login', { email: user.email, password: 'Wrong1234!' });
  const unknownAccount = await post('login', { email: 'unknown@example.com', password: 'Wrong1234!' });
  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownAccount.status, 401);
  assert.deepEqual(wrongPassword.payload, unknownAccount.payload);
});

test('password reset hides account existence, changes the password, and rejects replay', async () => {
  const user = account('password-reset');
  const registration = await post('register', user);
  assert.equal(registration.status, 201);

  const known = await post('forgot-password', { email: user.email });
  const token = resetTokenFor(user.email);
  const unknown = await post('forgot-password', { email: 'missing-reset@example.com' });
  assert.equal(known.status, 200);
  assert.equal(unknown.status, 200);
  assert.deepEqual(known.payload, unknown.payload);
  assert.deepEqual(known.payload, {
    success: true,
    message: 'If an account exists, a reset token has been sent.',
    data: null,
  });

  const stored = await User.findOne({ email: user.email }).select('+resetTokenHash +resetTokenExpiresAt');
  assert.equal(stored.resetTokenHash, hashToken(token));
  assert.ok(stored.resetTokenExpiresAt.getTime() > Date.now());
  assert.equal(JSON.stringify(stored).includes(token), false);

  const newPassword = 'NewPassword123!';
  const reset = await post('reset-password', { token, password: newPassword });
  assert.equal(reset.status, 200);
  assert.equal(reset.payload.data, null);
  assert.equal((await request('/api/auth/me', { token: registration.payload.data.token })).status, 401);
  assert.equal((await post('login', { email: user.email, password: user.password })).status, 401);
  assert.equal((await post('login', { email: user.email, password: newPassword })).status, 200);
  assert.equal((await post('reset-password', { token, password: 'AnotherPassword123!' })).status, 400);

  const updated = await User.findOne({ email: user.email }).select('+passwordHash +resetTokenHash +resetTokenExpiresAt');
  assert.ok(await bcrypt.compare(newPassword, updated.passwordHash));
  assert.ok(!updated.resetTokenHash);
  assert.ok(!updated.resetTokenExpiresAt);
});

test('a replacement or expired reset token cannot change the password', async () => {
  const user = account('expired-reset');
  assert.equal((await post('register', user)).status, 201);
  assert.equal((await post('forgot-password', { email: user.email })).status, 200);
  const oldToken = resetTokenFor(user.email);
  assert.equal((await post('forgot-password', { email: user.email })).status, 200);
  const currentToken = resetTokenFor(user.email);
  assert.notEqual(currentToken, oldToken);

  assert.equal((await post('reset-password', { token: oldToken, password: 'Changed1234!' })).status, 400);
  await User.updateOne({ email: user.email }, { $set: { resetTokenExpiresAt: new Date(Date.now() - 1_000) } });
  assert.equal((await post('reset-password', { token: currentToken, password: 'Changed1234!' })).status, 400);
  assert.equal((await post('login', { email: user.email, password: user.password })).status, 200);
});

test('concurrent resets consume a token exactly once', async () => {
  const user = account('concurrent-reset');
  const registration = await post('register', user);
  assert.equal(registration.status, 201);
  assert.equal((await post('forgot-password', { email: user.email })).status, 200);
  const token = resetTokenFor(user.email);
  const passwords = ['WinnerOne123!', 'WinnerTwo123!'];

  const results = await Promise.all(passwords.map(password => post('reset-password', { token, password })));
  assert.deepEqual(results.map(result => result.status).sort(), [200, 400]);
  const winner = results.findIndex(result => result.status === 200);
  const loser = 1 - winner;
  assert.equal((await post('login', { email: user.email, password: passwords[winner] })).status, 200);
  assert.equal((await post('login', { email: user.email, password: passwords[loser] })).status, 401);
  assert.equal((await request('/api/auth/me', { token: registration.payload.data.token })).status, 401);
  assert.equal((await post('reset-password', { token, password: 'ReplayPassword123!' })).status, 400);
});

test('invalid input, malformed JSON, and unknown routes return clear JSON errors', async () => {
  const user = account('invalid-input');
  const invalidBodies = [
    null,
    [],
    {},
    { email: user.email, password: user.password },
    { ...user, name: '   ' },
    { ...user, email: 'not-an-email' },
    { ...user, email: { $ne: null } },
    { ...user, password: 123456789 },
    { ...user, password: 'short' },
    // Nineteen emoji occupy 76 UTF-8 bytes: bcrypt would otherwise truncate them.
    { ...user, password: '😀'.repeat(19) },
  ];

  for (const body of invalidBodies) {
    const response = await post('register', body);
    assert.equal(response.status, 400, `Expected validation to reject ${JSON.stringify(body)}`);
  }
  assert.equal((await request('/api/auth/register', { method: 'POST' })).status, 400);
  assert.equal((await request('/api/auth/register', { method: 'POST', rawBody: '{"email":' })).status, 400);
  assert.equal((await post('forgot-password', { email: { $ne: null } })).status, 400);
  assert.equal((await post('reset-password', { token: 'invalid', password: 'ValidPassword123!' })).status, 400);
  assert.equal((await post('reset-password', { token: 'f'.repeat(64), password: 'ValidPassword123!' })).status, 400);
  assert.equal((await request('/route-that-does-not-exist')).status, 404);
});

test('protected routes reject missing, malformed, random, and expired bearer tokens', async () => {
  const attempts = [
    {},
    { authorization: 'Bearer' },
    { authorization: 'Basic abc123' },
    { authorization: 'Bearer not-a-token' },
    { token: 'a'.repeat(64) },
  ];
  for (const options of attempts) {
    assert.equal((await request('/api/auth/me', options)).status, 401);
  }
  assert.equal((await post('logout', {})).status, 401);

  const user = account('expired-session');
  const registration = await post('register', user);
  assert.equal(registration.status, 201);
  await User.updateOne({ email: user.email }, { $set: { sessionExpiresAt: new Date(Date.now() - 1_000) } });
  assert.equal((await request('/api/auth/me', { token: registration.payload.data.token })).status, 401);
});
