import { randomBytes, createHash } from 'node:crypto';

export function createToken() {
  return randomBytes(32).toString('hex');
}

// Save this hash in MongoDB, rather than the raw token.
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
