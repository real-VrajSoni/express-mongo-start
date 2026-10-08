import User from './model.js';
import ApiError from '../../common/utils/ApiError.js';
import userDto from '../../common/dto/user.dto.js';
import { hashPassword, checkPassword } from '../../common/utils/password.js';
import { createToken, hashToken } from '../../common/utils/token.js';
import sendResetToken from '../../common/utils/sendResetToken.js';
import { env } from '../../common/config/env.js';

export async function register(data) {
  const passwordHash = await hashPassword(data.password);
  const user = await User.create({ name: data.name, email: data.email, passwordHash });
  return createSession(user);
}

export async function login(data) {
  const user = await User.findOne({ email: data.email }).select('+passwordHash');
  if (!user || !(await checkPassword(data.password, user.passwordHash))) {
    throw new ApiError(401, 'Email or password is incorrect');
  }
  return createSession(user);
}

// One active session per user, lasting 24 hours.
async function createSession(user) {
  const token = createToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const savedUser = await User.findOneAndUpdate(
    { _id: user._id, passwordHash: user.passwordHash },
    { $set: { sessionTokenHash: hashToken(token), sessionExpiresAt: expiresAt } },
    { returnDocument: 'after' },
  );
  // A password reset may have happened while login was being checked.
  if (!savedUser) throw new ApiError(401, 'Please log in with your current password');
  return { user: userDto(savedUser), token, expiresAt };
}

export async function logout(data) {
  await User.updateOne(
    { _id: data.userId, sessionTokenHash: hashToken(data.token) },
    { $unset: { sessionTokenHash: 1, sessionExpiresAt: 1 } },
  );
}

export async function forgotPassword(data) {
  // This starter delivers reset tokens through the localhost terminal.
  if (env.nodeEnv === 'production') {
    throw new ApiError(503, 'Local password reset delivery is disabled in production');
  }
  const user = await User.findOne({ email: data.email });
  if (!user) return; // The controller returns the same message for every email.

  const token = createToken();
  await User.updateOne({ _id: user._id }, { $set: {
    resetTokenHash: hashToken(token),
    resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
  } });
  sendResetToken(user.email, token);
}

export async function resetPassword(data) {
  const passwordHash = await hashPassword(data.password);
  // Consume the reset token and revoke the session in one database operation.
  const user = await User.findOneAndUpdate({
    resetTokenHash: hashToken(data.token),
    resetTokenExpiresAt: { $gt: new Date() },
  }, {
    $set: { passwordHash },
    $unset: { resetTokenHash: 1, resetTokenExpiresAt: 1, sessionTokenHash: 1, sessionExpiresAt: 1 },
  }, { returnDocument: 'after' });

  if (!user) throw new ApiError(400, 'Reset token is invalid or expired');
}
