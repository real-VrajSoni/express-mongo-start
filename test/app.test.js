import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from '../src/app.js';
import { User } from '../src/modules/users/user.model.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health succeeds and readiness reports a disconnected database', async () => {
  assert.equal((await fetch(`${baseUrl}/health`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/ready`)).status, 503);
});

test('unknown routes and malformed IDs return structured errors', async () => {
  assert.equal((await fetch(`${baseUrl}/unknown`)).status, 404);
  const response = await fetch(`${baseUrl}/api/v1/users/invalid`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { success: false, message: 'Invalid user ID' });
});

test('malformed JSON is rejected', async () => {
  const response = await fetch(`${baseUrl}/api/v1/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Invalid JSON body');
});

test('missing fields, unexpected fields, and non-string values are rejected', async () => {
  for (const body of [{}, { name: 'Alex' }, { name: 'Alex', email: 'alex@example.com', role: 'admin' }, { name: {}, email: 'alex@example.com' }]) {
    const response = await fetch(`${baseUrl}/api/v1/users`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    assert.equal(response.status, 400);
  }
});

test('PATCH rejects operator injection and empty updates', async () => {
  for (const body of [{ $set: { name: 'Alex' } }, {}]) {
    const response = await fetch(`${baseUrl}/api/v1/users/507f1f77bcf86cd799439011`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    assert.equal(response.status, 400);
  }
});

test('pagination rejects invalid values and excessive limits', async () => {
  for (const query of ['page=0', 'page=1.5', 'limit=101', 'page=1&page=2', 'limit=-1']) {
    assert.equal((await fetch(`${baseUrl}/api/v1/users?${query}`)).status, 400);
  }
});

test('schema normalizes valid data and validates name and email', async () => {
  const user = new User({ name: '  Alex Doe  ', email: '  ALEX@EXAMPLE.COM  ' });
  await user.validate();
  assert.equal(user.name, 'Alex Doe');
  assert.equal(user.email, 'alex@example.com');
  await assert.rejects(new User({ name: 'A', email: 'bad-email' }).validate(), { name: 'ValidationError' });
});
