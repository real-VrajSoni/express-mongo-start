import ApiError from '../utils/ApiError.js';

export function jsonBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Send a JSON object in the request body');
  }
  return body;
}

export function requiredString(value, field, maxLength = 100) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, `${field} must be a non-empty string`);
  }
  if (value.trim().length > maxLength) {
    throw new ApiError(400, `${field} is too long`);
  }
  return value.trim();
}

export function emailField(value) {
  const email = requiredString(value, 'email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'Enter a valid email address');
  }
  return email;
}

export function passwordField(value) {
  // Do not trim passwords. bcrypt accepts at most 72 UTF-8 bytes.
  if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new ApiError(400, 'password must have at least 8 characters and at most 72 UTF-8 bytes');
  }
  return value;
}

export function tokenField(value) {
  const token = requiredString(value, 'token', 64);
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new ApiError(400, 'Enter a valid reset token');
  }
  return token;
}
